import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  // Ambil data user yang disimpan saat login (jika ada)
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#0f766e" }}>Dashboard CivicCare</h1>
      <p>
        Selamat datang{user?.name ? `, ${user.name}` : ""}! Kamu berhasil login.
      </p>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#0f766e",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Keluar
      </button>
    </div>
  );
}

export default Dashboard;