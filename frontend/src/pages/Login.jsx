
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser(email, password);
      navigate("/dashboard");
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

        {error && <div className="login-error">{error}</div>}

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
          CivicCare — Bersama membantu sesama.
        </p>
      </div>
    </div>
  );
}
