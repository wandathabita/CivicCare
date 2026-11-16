import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      // Bersihkan sesi lama supaya tidak bentrok antar akun
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      // Simpan token (mendukung dua nama field)
      const token = data?.token || data?.access_token;
      if (token) {
        localStorage.setItem("token", token);
      }

      // Ambil user dari respons (mendukung beberapa bentuk respons)
      const user = data?.user || data?.data?.user || data?.data || null;
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      setSuccess("Login berhasil! Anda berhasil masuk ke CivicCare.");
      setPassword("");

      // Arahkan sesuai role
     const role = user?.role;
    navigate(role === "admin" ? "/dashboard" : "/masyarakat", { replace: true });
    } catch (err) {
      setError(err.message || "Login gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand"></div>