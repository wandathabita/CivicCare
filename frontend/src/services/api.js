
const API_URL = "http://127.0.0.1:8000/api";

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
    throw new Error(data.message || "Email atau password tidak sesuai.");
  }

  if (data.token) {
    localStorage.setItem("civiccare_token", data.token);
  }

  if (data.user) {
    localStorage.setItem("civiccare_user", JSON.stringify(data.user));
  }

  return data;
}

export async function getUser() {
  const token = localStorage.getItem("civiccare_token");

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Gagal mengambil data pengguna.");
  }

  return data;
}

export async function logoutUser() {
  const token = localStorage.getItem("civiccare_token");

  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  localStorage.removeItem("civiccare_token");
  localStorage.removeItem("civiccare_user");
}
