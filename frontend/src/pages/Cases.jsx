import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { donateToCase, getCase, getCases, timeAgo } from "../services/api";
import "./Cases.css";

const rp = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n || 0);

const QUICK = [10000, 25000, 50000, 100000];

const BADGE = {
  Diverifikasi: "cs-badge cs-b-blue",
  Diproses: "cs-badge cs-b-orange",
  Selesai: "cs-badge cs-b-green",
};

function homePath() {
  try {
    return JSON.parse(localStorage.getItem("user"))?.role === "admin" ? "/dashboard" : "/masyarakat";
  } catch {
    return "/masyarakat";
  }
}

function pct(c) {
  return Math.min(100, Math.round((c.collected / Math.max(1, c.target)) * 100));
}

/* ===== Jendela donasi + daftar donatur ===== */
function CaseModal({ id, onClose, onChanged }) {
  const [detail, setDetail] = useState(null);
  const [amount, setAmount] = useState(25000);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getCase(id)
      .then(setDetail)
      .catch((e) => setError(e.message || "Gagal memuat kasus."));
  }, [id]);

  async function submit(e) {
    e.preventDefault();
    setSending(true);
    setOk("");
    setError("");
    try {
      const data = await donateToCase(id, Number(amount), message.trim());
      setDetail(data);
      onChanged(data.case);
      setMessage("");
      setOk(`Terima kasih! Donasi ${rp(Number(amount))} (simulasi) tercatat.`);
    } catch (err) {
      setError(err.message || "Gagal mengirim donasi.");
    } finally {
      setSending(false);
    }
  }

  const c = detail?.case;

  return (
    <div className="cs-overlay" onClick={onClose}>
      <div className="cs-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cs-x" onClick={onClose} aria-label="Tutup">✕</button>

        {!c ? (
          <p>{error || "Memuat…"}</p>
        ) : (
          <>
            <div>
              <small className="cs-meta">{c.code} • {c.area}</small>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{c.title}</h2>
              <p className="cs-desc" style={{ WebkitLineClamp: "unset", marginTop: 8 }}>{c.description}</p>
            </div>

            <div>
              <div className="cs-bar"><i style={{ width: `${pct(c)}%` }} /></div>
              <div className="cs-money" style={{ marginTop: 8 }}>
                <span><b>{rp(c.collected)}</b> terkumpul dari {rp(c.target)}</span>
                <span>{pct(c)}%</span>
              </div>
            </div>

            {c.status === "Selesai" ? (
              <div className="cs-ok">✓ Kasus ini sudah selesai ditangani. Terima kasih kepada {c.donors} donatur.</div>
            ) : (
              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <label>Pilih nominal donasi</label>
                <div className="cs-quick">
                  {QUICK.map((n) => (
                    <button type="button" key={n} className={Number(amount) === n ? "on" : ""} onClick={() => setAmount(n)}>
                      {n / 1000}rb
                    </button>
                  ))}
                </div>
                <input
                  type="number" min={1000} max={50000000} step={1000}
                  value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="Nominal lain (min. 1.000)"
                />
                <textarea
                  rows={2} maxLength={200} value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Pesan semangat (opsional)"
                />
                {ok && <div className="cs-ok">✓ {ok}</div>}
                {error && <div className="cs-err">{error}</div>}
                <button className="cs-btn" disabled={sending || Number(amount) < 1000}>
                  {sending ? "Memproses..." : `Donasi ${rp(Number(amount))} (simulasi)`}
                </button>
              </form>
            )}

            <div className="cs-ledger">
              <h3>Daftar donatur ({c.donors})</h3>
              {detail.donations.length === 0 ? (
                <small style={{ color: "#6b7c86" }}>Belum ada donasi. Jadilah yang pertama!</small>
              ) : (
                detail.donations.map((d) => (
                  <div key={d.id} className="cs-don">
                    <div>
                      <b>{d.name}</b>
                      <small>{d.message ? `“${d.message}” • ` : ""}{timeAgo(d.created_at)}</small>
                    </div>
                    <b className="amt">{rp(d.amount)}</b>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ===== Halaman ===== */
export default function Cases() {
  const navigate = useNavigate();
  const [cases, setCases] = useState(null);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    getCases()
      .then(setCases)
      .catch((e) => setError(e.message || "Gagal memuat kasus."));
  }, []);

  function updateCase(updated) {
    setCases((list) => list.map((c) => (c.id === updated.id ? updated : c)));
  }

  const totalCollected = (cases || []).reduce((s, c) => s + c.collected, 0);
  const totalDonors = (cases || []).reduce((s, c) => s + c.donors, 0);

  return (
    <div className="cs">
      <div className="cs-wrap">
        <button className="cs-back" onClick={() => navigate(homePath())}>← Kembali</button>

        <section className="cs-hero">
          <h1>Bantu Sesama</h1>
          <p>
            Kasus bantuan sosial yang sudah diverifikasi petugas. Setiap donasi tercatat terbuka,
            jadi kamu bisa melihat sendiri kemajuannya.
          </p>
          <span className="cs-sim">Mode simulasi: tidak ada uang sungguhan yang dipindahkan</span>
        </section>

        {error ? (
          <div className="cs-empty">{error}</div>
        ) : !cases ? (
          <div className="cs-empty">Memuat…</div>
        ) : (
          <>
            <div className="cs-sum">
              <div><b>{cases.length}</b><span>Kasus terverifikasi</span></div>
              <div><b>{rp(totalCollected)}</b><span>Dana terkumpul</span></div>
              <div><b>{totalDonors}</b><span>Donasi masuk</span></div>
            </div>

            {cases.length === 0 ? (
              <div className="cs-empty">
                <p>Belum ada kasus yang dibuka. Admin perlu memverifikasi laporan “Bantuan sosial” dan menetapkan target dana.</p>
              </div>
            ) : (
              <div className="cs-grid">
                {cases.map((c) => (
                  <button key={c.id} className="cs-card" onClick={() => setOpenId(c.id)}>
                    <div className="cs-meta">
                      <span>{c.area} • {timeAgo(c.created_at)}</span>
                      <span className={BADGE[c.status]}>{c.status}</span>
                    </div>
                    <h3>{c.title}</h3>
                    <p className="cs-desc">{c.description}</p>
                    <div className="cs-bar"><i style={{ width: `${pct(c)}%` }} /></div>
                    <div className="cs-money">
                      <span><b>{rp(c.collected)}</b> dari {rp(c.target)}</span>
                      <span>{c.donors} donatur</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {openId && <CaseModal id={openId} onClose={() => setOpenId(null)} onChanged={updateCase} />}
    </div>
  );
}