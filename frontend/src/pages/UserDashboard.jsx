import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const navigate = useNavigate();

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menus = [
    { title: "Ajukan Bantuan", desc: "Buat permintaan bantuan baru" },
    { title: "Riwayat Pengajuan", desc: "Lihat status pengajuan kamu" },
    { title: "Profil Saya", desc: "Kelola data akun kamu" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f9ff", fontFamily: "sans-serif" }}>
      <header
        style={{
          background: "#0f766e",
          color: "white",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0 }}>CivicCare</h2>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            background: "white",
            color: "#0f766e",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Keluar
        </button>
      </header>

      <main style={{ padding: "32px", maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ color: "#0f766e" }}>
          Halo{user?.name ? `, ${user.name}` : ""}!
        </h1>
        <p style={{ color: "#475569" }}>
          Selamat datang di CivicCare. Pilih layanan yang kamu butuhkan.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            marginTop: "24px",
          }}
        >
          {menus.map((m) => (
            <div
              key={m.title}
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                cursor: "pointer",
              }}
            >
              <h3 style={{ margin: "0 0 8px", color: "#0f766e" }}>{m.title}</h3>
              <p style={{ margin: 0, color: "#64748b" }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;