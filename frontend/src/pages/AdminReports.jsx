import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminLayout, { STATUS_CLASS } from "./AdminLayout.jsx";
import { AREAS, STATUS_LIST, getAdminReports, timeAgo } from "../services/api";

export default function AdminReports() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const status = params.get("status") || "Semua";
  const area = params.get("area") || "Semua";
  const q = params.get("q") || "";

  const [reports, setReports] = useState(null);
  const [error, setError] = useState("");

  function setParam(key, value, emptyValue) {
    const next = new URLSearchParams(params);
    if (!value || value === emptyValue) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }

  useEffect(() => {
    let alive = true;
    getAdminReports({ status, area, q })
      .then((list) => {
        if (alive) {
          setError("");
          setReports(list);
        }
      })
      .catch((e) => alive && setError(e.message || "Gagal memuat laporan."));
    return () => {
      alive = false;
    };
  }, [status, area, q]);

  return (
    <AdminLayout>
      <div className="a-sec-row first">
        <div>
          <h2>Laporan</h2>
          <p className="a-muted">Tinjau laporan warga dan ubah statusnya</p>
        </div>
        <span className="a-count">{reports ? `${reports.length} laporan` : "…"}</span>
      </div>

      <div className="a-toolbar">
        <input
          placeholder="🔍 Cari judul, kode, atau alamat"
          value={q}
          onChange={(e) => setParam("q", e.target.value, "")}
        />
        <select value={area} onChange={(e) => setParam("area", e.target.value, "Semua")}>
          <option>Semua</option>
          {AREAS.map((a) => <option key={a}>{a}</option>)}
        </select>
      </div>

      <div className="a-chips">
        {["Semua", ...STATUS_LIST].map((s) => (
          <button key={s} className={status === s ? "on" : ""} onClick={() => setParam("status", s, "Semua")}>
            {s}
          </button>
        ))}
      </div>

      {error ? (
        <div className="a-panel a-empty"><p>{error}</p></div>
      ) : !reports ? (
        <div className="a-panel a-empty">Memuat…</div>
      ) : reports.length === 0 ? (
        <div className="a-panel a-empty">
          <div className="a-empty-ico">🔎</div>
          <p>Tidak ada laporan yang cocok.</p>
        </div>
      ) : (
        <div className="a-list">
          {reports.map((r) => (
            <button key={r.dbId} className="a-row" onClick={() => navigate(`/dashboard/laporan/${r.dbId}`)}>
              <span className="a-row-ico">{r.category?.[0]?.toUpperCase()}</span>
              <div className="a-row-info">
                <b>{r.title}</b>
                <small>{r.id} • {r.reporter} • {r.area} • {timeAgo(r.createdAt)}</small>
              </div>
              <span className={STATUS_CLASS[r.status]}>{r.status}</span>
            </button>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}