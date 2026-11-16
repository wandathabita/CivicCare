const API_URL = "http://127.0.0.1:8000/api";

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

// Simpan sesi (token + user) dengan key yang sama dipakai di seluruh aplikasi
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
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, "Gagal mengambil data pengguna.")
    );
  }

  return data;
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