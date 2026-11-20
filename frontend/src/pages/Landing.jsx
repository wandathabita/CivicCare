import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicStats } from "../services/api";
import "./Landing.css";

const CATEGORIES = [
  { icon: "💡", name: "Lampu jalan", desc: "Lampu padam atau rusak" },
  { icon: "🗑️", name: "Sampah", desc: "Sampah menumpuk, belum diangkut" },
  { icon: "🛣️", name: "Jalan rusak", desc: "Jalan berlubang atau retak" },
  { icon: "🌊", name: "Banjir", desc: "Genangan dan saluran tersumbat" },
  { icon: "🤝", name: "Bantuan sosial", desc: "Ajukan bantuan untuk warga" },
  { icon: "📌", name: "Lainnya", desc: "Masalah lingkungan lainnya" },
];

const STEPS = [
  { no: "1", title: "Buat akun", desc: "Daftar gratis dengan email, hanya butuh satu menit." },
  { no: "2", title: "Kirim laporan", desc: "Pilih kategori, tulis lokasi, jelaskan masalah, dan sertakan foto." },
  { no: "3", title: "Pantau status", desc: "Lihat laporanmu berubah dari Diverifikasi, Diproses, hingga Selesai." },
];

const FEATURES = [
  { icon: "⚡", title: "Cepat dan mudah", desc: "Buat laporan dalam hitungan menit langsung dari HP atau komputer." },
  { icon: "🔔", title: "Status transparan", desc: "Setiap tahap penanganan bisa kamu lihat, lengkap dengan catatan petugas." },
  { icon: "📍", title: "Berdasarkan wilayah", desc: "Laporan dikelompokkan per wilayah agar cepat diteruskan ke dinas terkait." },
  { icon: "🔒", title: "Akun aman", desc: "Data akunmu terlindungi dan hanya kamu yang melihat riwayat laporanmu." },
];

export default function Landing() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getPublicStats().then(setStats).catch(() => {});
  }, []);

  const fmt = (n) => Number(n || 0).toLocaleString("id-ID");

  return (
    <div className="lp">
      {/* ===== Navbar ===== */}
      <header className="lp-nav">
        <a href="#beranda" className="lp-brand">
          <span className="lp-logo">CC</span>
          <b>CivicCare</b>
        </a>

        <nav className="lp-links">
          <a href="#beranda">Beranda</a>
          <a href="#kategori">Kategori</a>
          <a href="#cara-kerja">Cara Kerja</a>
          <a href="#fitur">Fitur</a>
        </nav>

        <div className="lp-actions">
          <Link to="/login" className="lp-btn-text">Masuk</Link>
          <Link to="/register" className="lp-btn-yellow">📢 Laporkan Masalah</Link>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section id="beranda" className="lp-hero">
        <div className="lp-hero-text">
          <span className="lp-pill">⭐ Platform Layanan Sosial dan Kemanusiaan</span>
          <h1>
            Peduli Lingkungan,
            <br />
            Lapor Sekali Klik.
          </h1>
          <p>
            CivicCare membantu warga melaporkan jalan rusak, sampah, lampu padam,
            dan masalah lingkungan lainnya langsung ke pihak terkait, agar
            penanganannya lebih cepat dan bisa dipantau.
          </p>

          <div className="lp-cta">
            <Link to="/register" className="lp-btn-yellow big">Mulai Lapor →</Link>
            <a href="#cara-kerja" className="lp-btn-outline big">Cara Kerja</a>
            <Link to="/login" className="lp-btn-green big">Masuk ke Akun</Link>
          </div>

          <div className="lp-stats">
            <div><b>{stats ? fmt(stats.total) : "—"}</b><span>Laporan masuk</span></div>
            <div><b>{stats ? fmt(stats.selesai) : "—"}</b><span>Laporan selesai</span></div>
            <div><b>{stats ? fmt(stats.wilayah) : "—"}</b><span>Wilayah terjangkau</span></div>
          </div>
        </div>

        {/* Mockup HP */}
        <div className="lp-phone-wrap">
          <div className="lp-phone">
            <div className="lp-notch" />
            <div className="lp-screen">
              <div className="lp-s-head">
                <span className="lp-s-brand">CivicCare</span>
                <p>Peduli Lingkungan, Lapor Sekali Klik.</p>
              </div>

              <div className="lp-s-cats">
                <div className="lp-s-cat c1"><i>🛣️</i><span>Lapor Jalan</span></div>
                <div className="lp-s-cat c2"><i>🗑️</i><span>Lapor Sampah</span></div>
                <div className="lp-s-cat c3"><i>💡</i><span>Lapor Lampu</span></div>
              </div>

              <div className="lp-s-title">Laporan Terbaru</div>
              <div className="lp-s-item">
                <i>🛣️</i>
                <div><b>Jalan berlubang</b><small>15 menit lalu</small></div>
                <em className="orange">Diproses</em>
              </div>
              <div className="lp-s-item">
                <i>🗑️</i>
                <div><b>Sampah menumpuk</b><small>1 jam lalu</small></div>
                <em className="green">Selesai</em>
              </div>

              <div className="lp-s-bar">
                <span>🏠<small>Beranda</small></span>
                <span>📋<small>Riwayat</small></span>
                <span className="on">➕<small>Lapor</small></span>
                <span>👤<small>Profil</small></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Kategori ===== */}
      <section id="kategori" className="lp-section">
        <div className="lp-head">
          <span className="lp-tag">Kategori</span>
          <h2>Apa yang bisa kamu laporkan?</h2>
          <p>Pilih kategori yang sesuai, kami bantu teruskan ke pihak yang berwenang.</p>
        </div>

        <div className="lp-cat-grid">
          {CATEGORIES.map((c) => (
            <Link to="/register" key={c.name} className="lp-card lp-cat">
              <span className="lp-ico">{c.icon}</span>
              <b>{c.name}</b>
              <small>{c.desc}</small>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== Cara kerja ===== */}
      <section id="cara-kerja" className="lp-section alt">
        <div className="lp-head">
          <span className="lp-tag">Cara Kerja</span>
          <h2>Tiga langkah mudah</h2>
          <p>Dari melapor sampai masalah selesai, semuanya bisa dipantau.</p>
        </div>

        <div className="lp-steps">
          {STEPS.map((s) => (
            <div key={s.no} className="lp-card lp-step">
              <span className="lp-no">{s.no}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Fitur ===== */}
      <section id="fitur" className="lp-section">
        <div className="lp-head">
          <span className="lp-tag">Fitur</span>
          <h2>Kenapa CivicCare?</h2>
        </div>

        <div className="lp-feat-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="lp-card lp-feat">
              <span className="lp-ico sm">{f.icon}</span>
              <div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA akhir ===== */}
      <section className="lp-final">
        <h2>Siap membuat lingkunganmu lebih baik?</h2>
        <p>Bergabung dan mulai laporkan masalah di sekitarmu hari ini.</p>
        <div className="lp-cta center">
          <Link to="/register" className="lp-btn-yellow big">Daftar Sekarang</Link>
          <Link to="/login" className="lp-btn-outline big">Sudah punya akun? Masuk</Link>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="lp-footer">
        <div className="lp-brand">
          <span className="lp-logo">CC</span>
          <b>CivicCare</b>
        </div>
        <p>Keadaan darurat? Hubungi <b>112</b></p>
        <small>© {new Date().getFullYear()} CivicCare — Bersama Membantu Sesama.</small>
      </footer>
    </div>
  );
}