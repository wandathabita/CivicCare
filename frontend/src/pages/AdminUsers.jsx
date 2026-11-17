import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout.jsx";
import { getAdminUsers } from "../services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminUsers().then(setUsers).catch((e) => setError(e.message || "Gagal memuat."));
  }, []);

  const shown = (users || []).filter((u) => (u.name + u.email).toLowerCase().includes(q.toLowerCase()));

  return (
    <AdminLayout>
      <div className="a-sec-row first">
        <div>
          <h2>Pengguna</h2>
          <p className="a-muted">Akun yang terdaftar di CivicCare</p>
        </div>
        <span className="a-count">{users ? `${shown.length} akun` : "…"}</span>
      </div>

      <div className="a-toolbar">
        <input placeholder="🔍 Cari nama atau email" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {error ? (
        <div className="a-panel a-empty"><p>{error}</p></div>
      ) : !users ? (
        <div className="a-panel a-empty">Memuat…</div>
      ) : shown.length === 0 ? (
        <div className="a-panel a-empty">
          <div className="a-empty-ico">🔎</div>
          <p>Tidak ada pengguna yang cocok.</p>
        </div>
      ) : (
        <div className="a-list">
          {shown.map((u) => (
            <div key={u.id} className="a-row static">
              <span className="a-row-ico round">{u.name?.[0]?.toUpperCase()}</span>
              <div className="a-row-info">
                <b>{u.name}</b>
                <small>{u.email} • bergabung {new Date(u.created_at).toLocaleDateString("id-ID")}</small>
              </div>
              <span className="a-mini">{u.reports_count} laporan</span>
              <span className={u.role === "admin" ? "a-badge a-orange" : "a-badge a-green"}>
                {u.role === "admin" ? "Admin" : "Masyarakat"}
              </span>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}