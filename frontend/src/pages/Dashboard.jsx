import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

// ====== DATA CONTOH (ganti dengan data dari API nanti) ======
const stats = [
  { label: "Total laporan", value: "1.284", note: "+12%", good: true, icon: "doc" },
  { label: "Dalam proses", value: "186", note: "14,5%", good: false, icon: "clock" },
  { label: "Selesai bulan ini", value: "742", note: "+8,4%", good: true, icon: "check" },
  { label: "Rata-rata respons", value: "2,4 jam", note: "-18 mnt", good: true, icon: "bars" },
];

const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const masuk = [12, 44, 26, 72, 50, 90, 104];
const selesai = [5, 14, 12, 20, 18, 30, 47];

const regions = [
  { count: 38, top: "42%", left: "36%", size: 50 },
  { count: 24, top: "20%", left: "72%", size: 44 },
  { count: 17, top: "66%", left: "57%", size: 40 },
];

const reports = [
  { id: "CC-2841", title: "Lampu jalan padam", cat: "Lampu jalan", area: "Sukajadi", status: "Diproses", time: "12 menit lalu" },
  { id: "CC-2837", title: "Sampah belum diangkut", cat: "Sampah", area: "Cicendo", status: "Diverifikasi", time: "43 menit lalu" },
  { id: "CC-2829", title: "Jalan berlubang", cat: "Jalan rusak", area: "Coblong", status: "Selesai", time: "2 jam lalu" },
];

const statusClass = {
  Diproses: "badge badge-orange",
  Diverifikasi: "badge badge-blue",
  Selesai: "badge badge-green",
};

// ====== IKON SEDERHANA ======
function Icon({ name }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  if (name === "doc")
    return (
      <svg {...common}>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </svg>
    );
  if (name === "clock")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  if (name === "check")
    return (
      <svg {...common}>
        <path d="M5 12l5 5L20 7" />
      </svg>
    );
  if (name === "bars")
    return (
      <svg {...common}>
        <path d="M5 20V10M12 20V4M19 20v-7" />
      </svg>
    );
  if (name === "bell")
    return (
      <svg {...common}>
        <path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6" />
        <path d="M10 19a2 2 0 004 0" />
      </svg>
    );
  if (name === "arrow")
    return (
      <svg {...common} width={16} height={16}>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    );
  return (
    <svg {...common} width={16} height={16}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

// ====== GRAFIK TREN (SVG) ======
const W = 600;
const H = 230;
const PAD = { left: 36, right: 10, top: 10, bottom: 30 };
const MAX_Y = 120;

function toPoints(values) {
  const stepX = (W - PAD.left - PAD.right) / (values.length - 1);
  return values.map((v, i) => [
    PAD.left + i * stepX,
    PAD.top + (1 - v / MAX_Y) * (H - PAD.top - PAD.bottom),
  ]);
}

function smoothPath(points) {
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function TrendChart() {
  const pMasuk = toPoints(masuk);
  const pSelesai = toPoints(selesai);
  const linePath = smoothPath(pMasuk);
  const baseY = H - PAD.bottom;
  const areaPath = `${linePath} L ${pMasuk[pMasuk.length - 1][0]} ${baseY} L ${pMasuk[0][0]} ${baseY} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" role="img" aria-label="Grafik tren laporan">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#355c7d" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#355c7d" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 40, 80, 120].map((v) => {
        const y = PAD.top + (1 - v / MAX_Y) * (H - PAD.top - PAD.bottom);
        return (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#eef1f4" />
            <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#9aa5b1">
              {v}
            </text>
          </g>
        );
      })}

      <path d={areaPath} fill="url(#areaFill)" />
      <path d={linePath} fill="none" stroke="#355c7d" strokeWidth="2.5" />
      <path
        d={smoothPath(pSelesai)}
        fill="none"
        stroke="#6fb59a"
        strokeWidth="2.5"
        strokeDasharray="2 5"
        strokeLinecap="round"
      />

      {days.map((d, i) => (
        <text key={d} x={pMasuk[i][0]} y={H - 8} textAnchor="middle" fontSize="10" fill="#9aa5b1">
          {d}
        </text>
      ))}
    </svg>
  );
}

// ====== HALAMAN UTAMA ======
export default function Dashboard() {
  const navigate = useNavigate();

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const initials = (user?.name || "Admin")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }

  return (
    <div className="adm-layout">
      <aside className="adm-sidebar">
        <div className="adm-brand">
          <div className="adm-logo">CC</div>
          <span>CivicCare</span>
        </div>
        <nav>
          <a className="active">Ringkasan</a>
          <a>Laporan</a>
          <a>Wilayah</a>
          <a>Pengguna</a>
        </nav>
        <button className="adm-logout" onClick={handleLogout}>
          Keluar
        </button>
      </aside>

      <div className="adm-main">
        <header className="adm-header">
          <div>
            <small>Pusat kendali layanan kota</small>
            <h1>Ringkasan</h1>
          </div>
          <div className="adm-header-right">
            <button className="icon-btn" aria-label="Notifikasi">
              <Icon name="bell" />
              <span className="dot" />
            </button>
            <div className="avatar" title={user?.name || "Admin"}>
              {initials}
            </div>
          </div>
        </header>

        <div className="adm-content">
          {/* Kartu statistik */}
          <section className="stat-grid">
            {stats.map((s) => (
              <div className="card stat-card" key={s.label}>
                <div className="stat-icon">
                  <Icon name={s.icon} />
                </div>
                <p className="stat-label">{s.label}</p>
                <div className="stat-row">
                  <strong>{s.value}</strong>
                  <span className={s.good ? "note good" : "note"}>{s.note}</span>
                </div>
              </div>
            ))}
          </section>

          {/* Grafik + peta */}
          <section className="mid-grid">
            <div className="card chart-card">
              <div className="card-head">
                <div>
                  <h3>Tren laporan</h3>
                  <p>Jumlah masuk dan selesai, 7 hari terakhir</p>
                </div>
                <button className="link-btn">
                  Minggu ini <Icon name="chev" />
                </button>
              </div>

              <TrendChart />

              <div className="legend">
                <span>
                  <i style={{ background: "#355c7d" }} /> Laporan masuk
                </span>
                <span>
                  <i style={{ background: "#6fb59a" }} /> Laporan selesai
                </span>
              </div>
            </div>

            <div className="card map-card">
              <div className="card-head pad">
                <div>
                  <h3>Sebaran laporan</h3>
                  <p>Wilayah dengan laporan aktif</p>
                </div>
              </div>

              <div className="map-area">
                <div className="road r1" />
                <div className="road r2" />
                <div className="road r3" />
                {regions.map((r) => (
                  <div
                    key={r.count}
                    className="bubble"
                    style={{ top: r.top, left: r.left, width: r.size, height: r.size }}
                  >
                    {r.count}
                  </div>
                ))}
              </div>

              <div className="map-foot">
                <span>Sukajadi memiliki laporan terbanyak</span>
                <button className="link-btn">Lihat detail</button>
              </div>
            </div>
          </section>

          {/* Tabel pengaduan */}
          <section className="card table-card">
            <div className="card-head">
              <div>
                <h3>Pengaduan terbaru</h3>
                <p>Perlu ditinjau dan diteruskan ke dinas terkait</p>
              </div>
              <button className="link-btn">
                Lihat semua <Icon name="arrow" />
              </button>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID Laporan</th>
                    <th>Pengaduan</th>
                    <th>Wilayah</th>
                    <th>Status</th>
                    <th>Masuk</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id}>
                      <td className="rid">{r.id}</td>
                      <td>
                        <div className="rtitle">{r.title}</div>
                        <div className="rcat">{r.cat}</div>
                      </td>
                      <td>{r.area}</td>
                      <td>
                        <span className={statusClass[r.status]}>{r.status}</span>
                      </td>
                      <td>{r.time}</td>
                      <td>
                        <button className="icon-btn sm" aria-label="Detail">
                          <Icon name="chev" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}