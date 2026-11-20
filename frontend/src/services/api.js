const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// ===== Konstanta & helper bersama =====
export const AREAS = ["Sukajadi", "Cicendo", "Coblong", "Andir", "Bandung Wetan"];
export const STATUS_LIST = ["Menunggu", "Diverifikasi", "Diproses", "Selesai"];
export const STATUS_BADGE = {
  Menunggu: "badge badge-gray",
  Diverifikasi: "badge badge-blue",
  Diproses: "badge badge-orange",
  Selesai: "badge badge-green",
};

export function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return "Baru saja";
  if (diff < 60) return `${diff} menit lalu`;
  if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
  return `${Math.floor(diff / 1440)} hari lalu`;
}

// Ambil pesan error yang paling jelas dari respons Laravel
function getErrorMessage(data, fallback) {
  if (data?.errors) {
    const firstField = Object.values(data.errors)[0];
    if (Array.isArray(firstField) && firstField[0]) {
      return firstField[0];
    }
  }
  return data?.message || fallback;
}

// Simpan sesi (token + user)
function saveSession(data) {
  const token = data?.token || data?.access_token;

  if (token) {
    localStorage.setItem("token", token);
  }

  if (data?.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}

// ===== Request umum dengan token =====
async function request(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (response.status === 401) {
    clearSession();
    window.location.href = "/login";
    throw new Error("Sesi berakhir, silakan login lagi.");
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Terjadi kesalahan."));
  }

  return data;
}

// ===== Autentikasi =====
export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "Email atau password tidak sesuai.")
    );
  }

  saveSession(data);

  return data;
}

export async function registerUser(
  name,
  email,
  password,
  passwordConfirmation
) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Registrasi gagal."));
  }

  saveSession(data);

  return data;
}

export async function getUser() {
  return request("/auth/me");
}

export async function logoutUser() {
  const token = localStorage.getItem("token");

  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // Abaikan error jaringan, sesi lokal tetap dihapus
  } finally {
    clearSession();
  }
}

// ===== Profil =====
export async function updateProfile(name) {
  const data = await request("/auth/profile", { method: "PUT", body: { name } });
  localStorage.setItem("user", JSON.stringify(data.user));
  return data.user;
}

export async function changePassword(current, password, confirmation) {
  return request("/auth/password", {
    method: "PUT",
    body: {
      current_password: current,
      password,
      password_confirmation: confirmation,
    },
  });
}

// ===== Laporan =====
export function normalizeReport(r) {
  return {
    id: r.code,
    dbId: r.id,
    title: r.title,
    category: r.category,
    area: r.area,
    address: r.address,
    description: r.description,
    photo: r.photo || "",
    status: r.status,
    note: r.admin_note || "",
    createdAt: r.created_at,
    resolvedAt: r.resolved_at,
    reporter: r.user?.name || "",
    reporterEmail: r.user?.email || "",
  };
}

// Warga
export async function createReport(payload) {
  const data = await request("/reports", { method: "POST", body: payload });
  return normalizeReport(data.report);
}

export async function getMyReports() {
  const data = await request("/reports/mine");
  return data.reports.map(normalizeReport);
}

// Admin
export function getAdminSummary(range = 7) {
  return request(`/admin/summary?range=${range}`);
}

export async function getAdminReports({ status = "Semua", area = "Semua", q = "" } = {}) {
  const p = new URLSearchParams();
  if (status !== "Semua") p.set("status", status);
  if (area !== "Semua") p.set("area", area);
  if (q.trim()) p.set("q", q.trim());
  const data = await request(`/admin/reports?${p.toString()}`);
  return data.reports.map(normalizeReport);
}

export async function getAdminReport(id) {
  const data = await request(`/admin/reports/${id}`);
  return normalizeReport(data.report);
}

export async function updateReportStatus(id, status, note) {
  const data = await request(`/admin/reports/${id}/status`, {
    method: "PATCH",
    body: { status, admin_note: note },
  });
  return normalizeReport(data.report);
}

export async function getAdminAreas() {
  return (await request("/admin/areas")).areas;
}

export async function getAdminUsers() {
  return (await request("/admin/users")).users;
}