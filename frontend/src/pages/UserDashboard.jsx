import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";

const CATEGORIES = [
  { name: "Lampu jalan", icon: "💡" },
  { name: "Sampah", icon: "🗑️" },
  { name: "Jalan rusak", icon: "🛣️" },
  { name: "Banjir", icon: "🌊" },
  { name: "Bantuan sosial", icon: "🤝" },
  { name: "Lainnya", icon: "📌" },
];

const AREAS = ["Sukajadi", "Cicendo", "Coblong", "Andir", "Bandung Wetan"];
const STEPS = ["Terkirim", "Diverifikasi", "Diproses", "Selesai"];
const STEP_INDEX = { Menunggu: 0, Diverifikasi: 1, Diproses: 2, Selesai: 3 };
const STATUS_CLASS = {
  Menunggu: "b-gray",
  Diverifikasi: "b-blue",
  Diproses: "b-orange",
  Selesai: "b-green",
};

// ===== Penyimpanan sementara (ganti dengan API nanti) =====
function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}
function storageKey(user) {
  return `cc_reports_${user?.id || user?.email || "guest"}`;
}
function loadReports(user) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(user))) || [];
  } catch {
    return [];
  }
}
function saveReports(user, list) {
  try {
    localStorage.setItem(storageKey(user), JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return "Baru saja";
  if (diff < 60) return `${diff} menit lalu`;
  if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
  return `${Math.floor(diff / 1440)} hari lalu`;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [view, setView] = useState("home");
  const [reports, setReports] = useState(() => loadReports(user));
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");

  const stats = useMemo(
    () => ({
      total: reports.length,
      proses: reports.filter((r) => r.status === "Diproses" || r.status === "Diverifikasi").length,
      selesai: reports.filter((r) => r.status === "Selesai").length,
    }),
    [reports]
  );

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }

  function addReport(data) {
    const next = [
      {
        id: `CC-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "Menunggu",
        createdAt: new Date().toISOString(),
        ...data,
      },
      ...reports,
    ];
    if (!saveReports(user, next)) {
      return "Penyimpanan penuh. Coba tanpa foto atau gunakan foto yang lebih kecil.";
    }
    setReports(next);
    setToast("Laporan berhasil dikirim!");
    setTimeout(() => setToast(""), 3000);
    setView("history");
    return "";
  }

  const name = user?.name || "Warga";
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const nav = [
    { key: "home", label: "Beranda", icon: "🏠" },
    { key: "new", label: "Lapor", icon: "✍️" },
    { key: "history", label: "Riwayat", icon: "📋" },
    { key: "profile", label: "Profil", icon: "👤" },
  ];

  return (
    <div className="ud">
      <header className="ud-top">
        <div className="ud-brand">
          <span className="ud-logo">CC</span>
          <b>CivicCare</b>
        </div>
        <nav className="ud-nav">
          {nav.map((n) => (
            <button
              key={n.key}
              className={view === n.key ? "active" : ""}
              onClick={() => setView(n.key)}
            >
              <span>{n.icon}</span> {n.label}
            </button>
          ))}
        </nav>
        <button className="ud-avatar" onClick={() => setView("profile")} title={name}>
          {initials}
        </button>
      </header>

      <main className="ud-main">
        {view === "home" && (
          <Home name={name} stats={stats} reports={reports} setView={setView} onOpen={setSelected} />
        )}
        {view === "new" && <NewReport onSubmit={addReport} onCancel={() => setView("home")} />}
        {view === "history" && <History reports={reports} onOpen={setSelected} setView={setView} />}
        {view === "profile" && <Profile user={user} stats={stats} onLogout={handleLogout} />}
      </main>

      {/* Navigasi bawah untuk HP */}
      <nav className="ud-bottom">
        {nav.map((n) => (
          <button
            key={n.key}
            className={view === n.key ? "active" : ""}
            onClick={() => setView(n.key)}
          >
            <span>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      {selected && <Detail report={selected} onClose={() => setSelected(null)} />}
      {toast && <div className="ud-toast">{toast}</div>}
    </div>
  );
}

// ================= BERANDA =================
function Home({ name, stats, reports, setView, onOpen }) {
  return (
    <>
      <section className="hero">
        <div>
          <p>Selamat datang kembali 👋</p>
          <h1>Halo, {name}!</h1>
          <span>Ada masalah di lingkunganmu? Laporkan, kami bantu teruskan ke dinas terkait.</span>
          <button className="btn-white" onClick={() => setView("new")}>
            ✍️ Buat laporan baru
          </button>
        </div>
      </section>

      <section className="stat3">
        <div className="card stat"><b>{stats.total}</b><span>Total laporan</span></div>
        <div className="card stat"><b>{stats.proses}</b><span>Sedang ditangani</span></div>
        <div className="card stat"><b>{stats.selesai}</b><span>Selesai</span></div>
      </section>

      <h2 className="sec-title">Mau lapor apa?</h2>
      <section className="cat-grid">
        {CATEGORIES.map((c) => (
          <button key={c.name} className="card cat" onClick={() => setView("new")}>
            <span className="cat-ico">{c.icon}</span>
            {c.name}
          </button>
        ))}
      </section>

      <div className="two-col">
        <section>
          <div className="row-between">
            <h2 className="sec-title">Laporan terakhir</h2>
            {reports.length > 0 && (
              <button className="link" onClick={() => setView("history")}>Lihat semua →</button>
            )}
          </div>
          {reports.length === 0 ? (
            <div className="card empty">
              <div>📭</div>
              <p>Belum ada laporan. Mulai dengan membuat laporan pertamamu.</p>
              <button className="btn" onClick={() => setView("new")}>Buat laporan</button>
            </div>
          ) : (
            <div className="list">
              {reports.slice(0, 3).map((r) => (
                <ReportRow key={r.id} r={r} onOpen={onOpen} />
              ))}
            </div>
          )}
        </section>

        <aside className="card tips">
          <h3>Tips laporan yang cepat ditangani</h3>
          <ul>
            <li>Tulis lokasi sejelas mungkin (nama jalan, patokan).</li>
            <li>Jelaskan masalah singkat dan jelas.</li>
            <li>Sertakan foto bila ada.</li>
          </ul>
          <div className="emergency">
            🚨 Keadaan darurat? Hubungi <b>112</b>
          </div>
        </aside>
      </div>
    </>
  );
}

function ReportRow({ r, onOpen }) {
  const cat = CATEGORIES.find((c) => c.name === r.category);
  return (
    <button className="card row" onClick={() => onOpen(r)}>
      <span className="cat-ico sm">{cat?.icon || "📌"}</span>
      <div className="row-info">
        <b>{r.title}</b>
        <small>{r.id} • {r.area} • {timeAgo(r.createdAt)}</small>
      </div>
      <span className={`badge ${STATUS_CLASS[r.status]}`}>{r.status}</span>
    </button>
  );
}

// ================= BUAT LAPORAN =================
function NewReport({ onSubmit, onCancel }) {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState("");
  const [error, setError] = useState("");

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800 * 1024) {
      setError("Ukuran foto maksimal 800 KB.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!category) return setError("Pilih kategori laporan dulu.");
    if (!area) return setError("Pilih wilayah.");
    const msg = onSubmit({ category, title, area, address, description, photo });
    if (msg) setError(msg);
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>Buat laporan baru</h2>
      <p className="muted">Isi data berikut dengan jelas supaya laporanmu cepat ditindaklanjuti.</p>

      <label>Kategori</label>
      <div className="chips">
        {CATEGORIES.map((c) => (
          <button
            type="button"
            key={c.name}
            className={category === c.name ? "chip on" : "chip"}
            onClick={() => setCategory(c.name)}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      <label htmlFor="t">Judul laporan</label>
      <input id="t" value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder="Contoh: Lampu jalan padam" maxLength={80} required />

      <div className="grid2">
        <div>
          <label htmlFor="a">Wilayah</label>
          <select id="a" value={area} onChange={(e) => setArea(e.target.value)} required>
            <option value="">Pilih wilayah</option>
            {AREAS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="ad">Alamat / patokan</label>
          <input id="ad" value={address} onChange={(e) => setAddress(e.target.value)}
            placeholder="Jl. Merdeka, depan toko..." required />
        </div>
      </div>

      <label htmlFor="d">Deskripsi</label>
      <textarea id="d" rows={4} value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Ceritakan masalahnya..." required />

      <label>Foto (opsional)</label>
      <label className="upload">
        {photo ? <img src={photo} alt="Pratinjau" /> : <span>📷 Klik untuk pilih foto</span>}
        <input type="file" accept="image/*" onChange={handlePhoto} hidden />
      </label>

      {error && <div className="err">{error}</div>}

      <div className="actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>Batal</button>
        <button type="submit" className="btn">Kirim laporan</button>
      </div>
    </form>
  );
}

// ================= RIWAYAT =================
function History({ reports, onOpen, setView }) {
  const [filter, setFilter] = useState("Semua");
  const [q, setQ] = useState("");
  const filters = ["Semua", "Menunggu", "Diverifikasi", "Diproses", "Selesai"];

  const shown = reports.filter(
    (r) =>
      (filter === "Semua" || r.status === filter) &&
      (r.title + r.id + r.area).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <div className="row-between">
        <h2 className="sec-title">Riwayat laporan</h2>
        <button className="btn" onClick={() => setView("new")}>+ Laporan baru</button>
      </div>
      <input className="search" placeholder="🔍 Cari judul, ID, atau wilayah"
        value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="chips">
        {filters.map((f) => (
          <button key={f} className={filter === f ? "chip on" : "chip"} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="card empty"><div>🔎</div><p>Tidak ada laporan yang cocok.</p></div>
      ) : (
        <div className="list">
          {shown.map((r) => <ReportRow key={r.id} r={r} onOpen={onOpen} />)}
        </div>
      )}
    </>
  );
}

// ================= DETAIL =================
function Detail({ report, onClose }) {
  const step = STEP_INDEX[report.status] ?? 0;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="row-between">
          <small className="muted">{report.id}</small>
          <button className="x" onClick={onClose} aria-label="Tutup">✕</button>
        </div>
        <h2>{report.title}</h2>
        <span className={`badge ${STATUS_CLASS[report.status]}`}>{report.status}</span>

        <div className="timeline">
          {STEPS.map((s, i) => (
            <div key={s} className={i <= step ? "tl on" : "tl"}>
              <i>{i <= step ? "✓" : i + 1}</i>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <dl>
          <dt>Kategori</dt><dd>{report.category}</dd>
          <dt>Wilayah</dt><dd>{report.area}</dd>
          <dt>Alamat</dt><dd>{report.address}</dd>
          <dt>Dikirim</dt><dd>{timeAgo(report.createdAt)}</dd>
          <dt>Deskripsi</dt><dd>{report.description}</dd>
        </dl>
        {report.photo && <img className="detail-img" src={report.photo} alt="Foto laporan" />}
      </div>
    </div>
  );
}

// ================= PROFIL =================
function Profile({ user, stats, onLogout }) {
  const name = user?.name || "Warga";
  return (
    <div className="card profile">
      <div className="p-avatar">{name[0]?.toUpperCase()}</div>
      <h2>{name}</h2>
      <p className="muted">{user?.email}</p>
      <span className="badge b-blue">Masyarakat</span>
      <div className="stat3 inner">
        <div className="stat"><b>{stats.total}</b><span>Laporan</span></div>
        <div className="stat"><b>{stats.proses}</b><span>Ditangani</span></div>
        <div className="stat"><b>{stats.selesai}</b><span>Selesai</span></div>
      </div>
      <button className="btn-danger" onClick={onLogout}>Keluar</button>
    </div>
  );
}