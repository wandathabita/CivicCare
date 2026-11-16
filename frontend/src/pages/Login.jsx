import { useState } from "react";
import { loginUser } from "../services/api";

export default function Login() {
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
      await loginUser(email, password);

      setSuccess("Login berhasil! Anda berhasil masuk ke CivicCare.");
      setPassword("");
    } catch (err) {
      setError(err.message || "Login gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">CC</div>
          <h1>CivicCare</h1>
          <p>Platform Layanan Sosial dan Kemanusiaan</p>
        </div>

        <h2>Selamat Datang!</h2>

        <p className="login-subtitle">
          Silakan masuk ke akun CivicCare Anda.
        </p>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {success && (
          <div className="login-success">
            {success}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            placeholder="Masukkan email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="login-footer">
          CivicCare — Bersama Membantu Sesama.
        </p>
      </div>
    </div>
  );
}
