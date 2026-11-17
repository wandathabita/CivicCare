import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout.jsx";
import { getAdminAreas } from "../services/api";

export default function AdminAreas() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminAreas().then(setAreas).catch((e) => setError(e.message || "Gagal memuat."));
  }, []);

  const max = Math.max(1, ...(areas || []).map((a) => a.total));

  return (
    <AdminLayout>
      <div className="a-sec-row first">
        <div>
          <h2>Wilayah</h2>
          <p className="a-muted">Sebaran laporan per wilayah. Klik untuk melihat laporannya.</p>
        </div>
      </div>

      {error ? (
        <div className="a-panel a-empty"><p>{error}</p></div>
      ) : !areas ? (
        <div className="a-panel a-empty">Memuat…</div>
      ) : (
        <div className="a-areas">
          {areas.map((a) => (
            <button key={a.area} className="a-area"
              onClick={() => navigate(`/dashboard/laporan?area=${encodeURIComponent(a.area)}`)}>
              <div className="a-area-head">
                <b>{a.area}</b>
                <span>{a.total}</span>
              </div>
              <em><i style={{ width: `${(a.total / max) * 100}%` }} /></em>
              <div className="a-area-st">
                <span><i className="d g" />Menunggu <b>{a.menunggu}</b></span>
                <span><i className="d b" />Diverifikasi <b>{a.diverifikasi}</b></span>
                <span><i className="d o" />Diproses <b>{a.diproses}</b></span>
                <span><i className="d v" />Selesai <b>{a.selesai}</b></span>
              </div>
            </button>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}