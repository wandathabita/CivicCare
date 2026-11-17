import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createReport, getMyReports, logoutUser } from "../services/api";
import "./UserDashboard.css";

const CATEGORIES = [
  { name: "Lampu jalan", icon: "💡", tone: "t-amber", desc: "Lampu padam atau rusak" },
  { name: "Sampah", icon: "🗑️", tone: "t-green", desc: "Sampah menumpuk" },
  { name: "Jalan rusak", icon: "🛣️", tone: "t-slate", desc: "Berlubang atau retak" },
  { name: "Banjir", icon: "🌊", tone: "t-sky", desc: "Genangan, saluran tersumbat" },
  { name: "Bantuan sosial", icon: "🤝", tone: "t-rose", desc: "Ajukan bantuan warga" },
  { name: "Lainnya", icon: "📌", tone: "t-violet", desc: "Masalah lingkungan lain" },
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

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return "Baru saja";
  if (diff < 60) return `${diff} menit lalu`;
  if (diff < 1440) return `${Math.floor(diff / 60)} jam lalu`;
  return `${Math.floor(diff / 1440)} hari lalu`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

function Icon({ name }) {
  const p = {
    width: 20, height: 20, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round",
  };
  if (name === "home") return (<svg {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>);
  if (name === "new") return (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>);
  if (name === "history") return (<svg {...p}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></svg>);
  return (<svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></svg>);
}

const NAV = [
  { key: "home", label: "Beranda", icon: "home" },
  { key: "new", label: "Lapor", icon: "new" },
  { key: "history", label: "Riwayat", icon: "history" },
  { key: "profile", label: "Profil", icon: "user" },
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [view, setView] = useState("home");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [preset, setPreset] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    getMyReports()
      .then(setReports)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(
    () => ({
      total: reports.length,
      proses: reports.filter((r) => r.status === "Diverifikasi" || r.status === "Diproses").length,
      selesai: reports.filter((r) => r.status === "Selesai").length,
    }),
    [reports]
  );

  async function handleLogout() {
    await logoutUser();
    navigate("/login", { replace: true });
  }

  async function addReport(data) {
    try {
      const created = await createReport(data);
      setReports((prev) => [created, ...prev]);
      setToast("Laporan berhasil dikirim!");
      setTimeout(() => setToast(""), 3000);
      setPreset("");
      setView("history");
      return "";
    } catch (err) {
      return err.message || "Gagal mengirim laporan.";
    }
  }

  function go(key) {
    if (key !== "new") setPreset("");
    setView(key);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const name = user?.name || "Warga";
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="ud">
      <header className="ud-top">
        <div className="ud-top-in">
          <button className="ud-brand" onClick={() => go("home")}>
            <span className="ud-logo">CC</span>
            <b>CivicCare</b>
          </button>

          <nav className="ud-nav">
            {NAV.map((n) => (
              <button key={n.key} className={view === n.key ? "on" : ""} onClick={() => go(n.key)}>
                <Icon name={n.icon} /> {n.label}
              </button>
            ))}
          </nav>

          <button className="ud-avatar" onClick={() => go("profile")} title={name}>
            {initials}
          </button>
        </div>
      </header>

      <main className="ud-main">
        {view === "home" && (
          <Home
            name={name}
            stats={stats}
            reports={reports}
            loading={loading}
            go={go}
            onOpen={setSelected}
            onPick={(c) => { setPreset(c); setView("new"); window.scrollTo({ top: 0 }); }}
          />
        )}
        {view === "new" && <NewReport preset={preset} onSubmit={addReport} onCancel={() => go("home")} />}
        {view === "history" && <History reports={reports} loading={loading} onOpen={setSelected} go={go} />}
        {view === "profile" && <Profile user={user} stats={stats} onLogout={handleLogout} />}
      </main>

      <nav className="ud-bottom">
        {NAV.map((n) => (
          <button key={n.key} className={view === n.key ? "on" : ""} onClick={() => go(n.key)}>
            <Icon name={n.icon} />
            <span>{n.label}</span>
          </button>
        ))}
      </nav>

      {selected && <Detail report={selected} onClose={() => setSelected(null)} />}
      {toast && <div className="ud-toast">✓ {toast}</div>}
    </div>
  );
}

/* ================= BERANDA ================= */
function Home({ name, stats, reports, loading, go, onOpen, onPick }) {
  const active = reports.find((r) => r.status !== "Selesai");

  return (
    <>
      <section className="hero">
        <i className="orb o1" />
        <i className="orb o2" />
        <div className="hero-in">
          <span className="hero-pill">{greeting()} 👋</span>
          <h1>Halo, {name}!</h1>
          <p>Ada masalah di lingkunganmu? Laporkan, kami bantu teruskan ke dinas terkait.</p>
          <div className="hero-actions">
            <button className="btn-white" onClick={() => go("new")}>＋ Buat laporan baru</button>
            <button className="btn-line" onClick={() => go("history")}>Lihat riwayat</button>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stat">
          <span className="stat-ico s1"><Icon name="history" /></span>
          <div><b>{stats.total}</b><small>Total laporan</small></div>
        </div>
        <div className="stat">
          <span className="stat-ico s2"><Icon name="new" /></span>
          <div><b>{stats.proses}</b><small>Sedang ditangani</small></div>
        </div>
        <div className="stat">
          <span className="stat-ico s3"><Icon name="home" /></span>
          <div><b>{stats.selesai}</b><small>Selesai</small></div>
        </div>
      </section>

      <div className="sec-head">
        <h2>Mau lapor apa?</h2>
        <p>Pilih kategori, formulir akan terisi otomatis.</p>
      </div>
      <section className="cats">
        {CATEGORIES.map((c) => (
          <button key={c.name} className="cat" onClick={() => onPick(c.name)}>
            <span className={`cat-ico ${c.tone}`}>{c.icon}</span>
            <b>{c.name}</b>
            <small>{c.desc}</small>
          </button>
        ))}
      </section>

      <div className="two">
        <section>
          <div className="sec-row">
            <h2>Laporan terakhir</h2>
            {reports.length > 0 && <button className="link" onClick={() => go("history")}>Lihat semua →</button>}
          </div>

          {loading ? (
            <div className="panel empty">Memuat…</div>
          ) : reports.length === 0 ? (
            <div className="panel empty">
              <div className="empty-ico">📭</div>
              <p>Belum ada laporan. Mulai dengan membuat laporan pertamamu.</p>
              <button className="btn" onClick={() => go("new")}>Buat laporan</button>
            </div>
          ) : (
            <div className="list">
              {reports.slice(0, 4).map((r) => <ReportRow key={r.dbId} r={r} onOpen={onOpen} />)}
            </div>
          )}
        </section>

        <aside className="side">
          {active && (
            <div className="panel track" onClick={() => onOpen(active)}>
              <small>Laporan aktif</small>
              <b>{active.title}</b>
              <div className="mini-steps">
                {STEPS.map((s, i) => (
                  <i key={s} className={i <= STEP_INDEX[active.status] ? "on" : ""} />
                ))}
              </div>
              <span className={`badge ${STATUS_CLASS[active.status]}`}>{active.status}</span>
            </div>
          )}

          <div className="panel tips">
            <h3>Tips laporan cepat ditangani</h3>
            <ul>
              <li>Tulis lokasi sejelas mungkin (jalan, patokan).</li>
              <li>Jelaskan masalah singkat dan jelas.</li>
              <li>Sertakan foto bila ada.</li>
            </ul>
          </div>

          <div className="panel emergency">
            🚨 <span>Keadaan darurat? Hubungi <b>112</b></span>
          </div>
        </aside>
      </div>
    </>
  );
}

function ReportRow({ r, onOpen }) {
  const cat = CATEGORIES.find((c) => c.name === r.category);
  return (
    <button className="row" onClick={() => onOpen(r)}>
      <span className={`cat-ico sm ${cat?.tone || "t-violet"}`}>{cat?.icon || "📌"}</span>
      <div className="row-info">
        <b>{r.title}</b>
        <small>{r.id} • {r.area} • {timeAgo(r.createdAt)}</small>
      </div>
      <span className={`badge ${STATUS_CLASS[r.status]}`}>{r.status}</span>
    </button>
  );
}

/* ================= BUAT LAPORAN ================= */
function NewReport({ preset, onSubmit, onCancel }) {
  const [category, setCategory] = useState(preset || "");
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!category) return setError("Pilih kategori laporan dulu.");
    if (!area) return setError("Pilih wilayah.");
    setError("");
    setSending(true);
    const msg = await onSubmit({ category, title, area, address, description, photo });
    setSending(false);
    if (msg) setError(msg);
  }

  return (
    <form className="panel form" onSubmit={handleSubmit}>
      <h2>Buat laporan baru</h2>
      <p className="muted">Isi dengan jelas supaya laporanmu cepat ditindaklanjuti.</p>

      <label>1. Pilih kategori</label>
      <div className="pick">
        {CATEGORIES.map((c) => (
          <button type="button" key={c.name}
            className={category === c.name ? "pick-item on" : "pick-item"}
            onClick={() => setCategory(c.name)}>
            <span className={`cat-ico sm ${c.tone}`}>{c.icon}</span>
            {c.name}
          </button>
        ))}
      </div>

      <label htmlFor="t">2. Judul laporan</label>
      <input id="t" value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder="Contoh: Lampu jalan padam" maxLength={80} required />

      <div className="grid2">
        <div>
          <label htmlFor="a">3. Wilayah</label>
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

      <label htmlFor="d">4. Deskripsi</label>
      <textarea id="d" rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
        placeholder="Ceritakan masalahnya..." required />

      <label>5. Foto (opsional)</label>
      <label className="upload">
        {photo ? <img src={photo} alt="Pratinjau" /> : <span>📷 Klik untuk memilih foto (maks 800 KB)</span>}
        <input type="file" accept="image/*" onChange={handlePhoto} hidden />
      </label>

      {error && <div className="err">{error}</div>}

      <div className="actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>Batal</button>
        <button type="submit" className="btn" disabled={sending}>
          {sending ? "Mengirim..." : "Kirim laporan"}
        </button>
      </div>
    </form>
  );
}

/* ================= RIWAYAT ================= */
function History({ reports, loading, onOpen, go }) {
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
      <div className="sec-row">
        <h2>Riwayat laporan</h2>
        <button className="btn" onClick={() => go("new")}>＋ Laporan baru</button>
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

      {loading ? (
        <div className="panel empty">Memuat…</div>
      ) : shown.length === 0 ? (
        <div className="panel empty"><div className="empty-ico">🔎</div><p>Tidak ada laporan yang cocok.</p></div>
      ) : (
        <div className="list">
          {shown.map((r) => <ReportRow key={r.dbId} r={r} onOpen={onOpen} />)}
        </div>
      )}
    </>
  );
}

/* ================= DETAIL ================= */
function Detail({ report, onClose }) {
  const step = STEP_INDEX[report.status] ?? 0;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="sec-row">
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

        {report.note && (
          <div className="admin-note">
            <small>Catatan petugas</small>
            <p>{report.note}</p>
          </div>
        )}

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

/* ================= PROFIL ================= */
function Profile({ user, stats, onLogout }) {
  const name = user?.name || "Warga";
  return (
    <div className="panel profile">
      <div className="p-cover" />
      <div className="p-avatar">{name[0]?.toUpperCase()}</div>
      <h2>{name}</h2>
      <p className="muted">{user?.email}</p>
      <span className="badge b-green">Masyarakat</span>

      <div className="p-stats">
        <div><b>{stats.total}</b><small>Laporan</small></div>
        <div><b>{stats.proses}</b><small>Ditangani</small></div>
        <div><b>{stats.selesai}</b><small>Selesai</small></div>
      </div>

      <button className="btn-danger" onClick={onLogout}>Keluar</button>
    </div>
  );
}