import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout, { Icon, STATUS_CLASS } from "./AdminLayout.jsx";
import { getAdminReports, getAdminSummary, normalizeReport, timeAgo } from "../services/api";

const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

function duration(min) {
  if (min === null || min === undefined) return "-";
  if (min < 60) return `${min} menit`;
  if (min < 1440) return `${(min / 60).toFixed(1).replace(".", ",")} jam`;
  return `${(min / 1440).toFixed(1).replace(".", ",")} hari`;
}

/* ===== Grafik ===== */
const W = 600, H = 230;
const PAD = { left: 36, right: 10, top: 10, bottom: 30 };

function smoothPath(points) {
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function TrendChart({ labels, masuk, selesai }) {
  const maxVal = Math.max(...masuk, ...selesai, 1);
  const MAX_Y = Math.max(4, Math.ceil(maxVal / 4) * 4);
  const innerH = H - PAD.top - PAD.bottom;
  const stepX = (W - PAD.left - PAD.right) / (labels.length - 1);
  const pts = (v) => v.map((x, i) => [PAD.left + i * stepX, PAD.top + (1 - x / MAX_Y) * innerH]);

  const pm = pts(masuk);
  const ps = pts(selesai);
  const line = smoothPath(pm);
  const base = H - PAD.bottom;
  const area = `${line} L ${pm[pm.length - 1][0]} ${base} L ${pm[0][0]} ${base} Z`;
  const step = labels.length > 10 ? 5 : 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="a-chart" role="img" aria-label="Grafik tren laporan">
      <defs>
        <linearGradient id="aFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f766e" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#0f766e" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((i) => {
        const v = (MAX_Y / 4) * i;
        const y = PAD.top + (1 - v / MAX_Y) * innerH;
        return (
          <g key={i}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#e8f0f1" />
            <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#8a99a1">{v}</text>
          </g>
        );
      })}
      <path d={area} fill="url(#aFill)" />
      <path d={line} fill="none" stroke="#0f766e" strokeWidth="2.6" />
      <path d={smoothPath(ps)} fill="none" stroke="#f59e0b" strokeWidth="2.6" strokeDasharray="2 5" strokeLinecap="round" />
      {labels.map((l, i) =>
        i % step === 0 ? (
          <text key={i} x={pm[i][0]} y={H - 8} textAnchor="middle" fontSize="10" fill="#8a99a1">{l}</text>
        ) : null
      )}
    </svg>
  );
}

/* ===== Halaman ===== */
export default function Dashboard() {
  const navigate = useNavigate();
  const [range, setRange] = useState(7);
  const [data, setData] = useState(null);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState("");

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  function load() {
    setError("");
    Promise.all([getAdminSummary(range), getAdminReports({ status: "Menunggu" })])
      .then(([summary, waiting]) => {
        setData(summary);
        setPending(waiting.length);
      })
      .catch((e) => setError(e.message || "Gagal memuat data."));
  }

  useEffect(load, [range]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <AdminLayout>
        <div className="a-panel a-empty">
          <div className="a-empty-ico">⚠️</div>
          <p>{error}</p>
          <button className="a-btn" onClick={load}>Coba lagi</button>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="a-panel a-empty">Memuat data…</div>
      </AdminLayout>
    );
  }

  const s = data.stats;
  const latest = data.latest.map(normalizeReport);
  const maxRegion = Math.max(1, ...data.regions.map((r) => r.count));
  const ch = s.selesai_change;

  const cards = [
    { label: "Total laporan", value: fmt(s.total), note: `+${s.new_week} minggu ini`, icon: "list", tone: "s1", to: "/dashboard/laporan" },
    { label: "Perlu ditinjau", value: fmt(pending), note: "Menunggu verifikasi", icon: "bell", tone: "s2", to: "/dashboard/laporan?status=Menunggu" },
    { label: "Sedang ditangani", value: fmt(s.proses), note: `${String(s.proses_pct).replace(".", ",")}% dari total`, icon: "wrench", tone: "s3", to: "/dashboard/laporan?status=Diproses" },
    { label: "Selesai bulan ini", value: fmt(s.selesai_bulan), note: ch === null ? "bulan ini" : `${ch > 0 ? "+" : ""}${ch}% dari bulan lalu`, icon: "check", tone: "s4", to: "/dashboard/laporan?status=Selesai" },
  ];

  return (
    <AdminLayout>
      <section className="a-hero">
        <i className="a-orb o1" />
        <i className="a-orb o2" />
        <div className="a-hero-in">
          <span className="a-pill">{greeting()} 👋</span>
          <h1>Halo, {user?.name || "Admin"}!</h1>
          <p>
            {pending > 0
              ? `Ada ${pending} laporan baru yang menunggu untuk ditinjau dan diteruskan ke dinas terkait.`
              : "Semua laporan sudah ditinjau. Tidak ada laporan yang menunggu."}
          </p>
          <div className="a-hero-actions">
            <button className="a-btn-white" onClick={() => navigate("/dashboard/laporan?status=Menunggu")}>
              Tinjau laporan
            </button>
            <button className="a-btn-line" onClick={() => navigate("/dashboard/laporan")}>
              Semua laporan
            </button>
          </div>
        </div>
      </section>

      <section className="a-stats">
        {cards.map((c) => (
          <button key={c.label} className="a-stat" onClick={() => navigate(c.to)}>
            <span className={`a-stat-ico ${c.tone}`}><Icon name={c.icon} /></span>
            <b>{c.value}</b>
            <span className="a-stat-label">{c.label}</span>
            <small>{c.note}</small>
          </button>
        ))}
      </section>

      <div className="a-two">
        <section className="a-panel a-pad">
          <div className="a-sec-row tight">
            <div>
              <h2>Tren laporan</h2>
              <p className="a-muted">Jumlah masuk dan selesai, {range} hari terakhir</p>
            </div>
            <div className="a-seg">
              <button className={range === 7 ? "on" : ""} onClick={() => setRange(7)}>7 hari</button>
              <button className={range === 30 ? "on" : ""} onClick={() => setRange(30)}>30 hari</button>
            </div>
          </div>

          <TrendChart labels={data.trend.labels} masuk={data.trend.masuk} selesai={data.trend.selesai} />

          <div className="a-legend">
            <span><i style={{ background: "#0f766e" }} /> Laporan masuk</span>
            <span><i style={{ background: "#f59e0b" }} /> Laporan selesai</span>
          </div>
          <div className="a-avg">
            ⏱️ Rata-rata waktu penyelesaian: <b>{duration(s.avg_minutes)}</b>
            <small> ({s.resolved_count} laporan selesai)</small>
          </div>
        </section>

        <section className="a-panel a-pad">
          <div className="a-sec-row tight">
            <div>
              <h2>Sebaran wilayah</h2>
              <p className="a-muted">Wilayah dengan laporan terbanyak</p>
            </div>
            <button className="a-link" onClick={() => navigate("/dashboard/wilayah")}>Detail →</button>
          </div>

          {data.regions.length === 0 ? (
            <div className="a-empty small">Belum ada laporan.</div>
          ) : (
            <div className="a-bars">
              {data.regions.map((r) => (
                <button key={r.area} className="a-bar"
                  onClick={() => navigate(`/dashboard/laporan?area=${encodeURIComponent(r.area)}`)}>
                  <div><b>{r.area}</b><span>{r.count} laporan</span></div>
                  <em><i style={{ width: `${(r.count / maxRegion) * 100}%` }} /></em>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="a-sec-row">
        <h2>Pengaduan terbaru</h2>
        <button className="a-link" onClick={() => navigate("/dashboard/laporan")}>Lihat semua →</button>
      </div>

      {latest.length === 0 ? (
        <div className="a-panel a-empty">
          <div className="a-empty-ico">📭</div>
          <p>Belum ada pengaduan masuk dari warga.</p>
        </div>
      ) : (
        <div className="a-list">
          {latest.map((r) => (
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