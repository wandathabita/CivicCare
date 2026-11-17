import { useState } from "react";
import { changePassword, updateProfile } from "../services/api";
import "./ProfilePanel.css";

export default function ProfilePanel({ user, stats = [], onLogout, onUserUpdate }) {
  const [tab, setTab] = useState("info");

  const [name, setName] = useState(user?.name || "");
  const [infoMsg, setInfoMsg] = useState("");
  const [infoErr, setInfoErr] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);

  const [cur, setCur] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const isAdmin = user?.role === "admin";
  const initials = (user?.name || "U")
    .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  async function saveInfo(e) {
    e.preventDefault();
    setInfoMsg("");
    setInfoErr("");
    setSavingInfo(true);
    try {
      const updated = await updateProfile(name.trim());
      onUserUpdate?.(updated);
      setInfoMsg("Profil berhasil diperbarui.");
    } catch (err) {
      setInfoErr(err.message || "Gagal menyimpan.");
    } finally {
      setSavingInfo(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setPwMsg("");
    setPwErr("");
    if (pw !== pw2) return setPwErr("Konfirmasi password tidak sama.");
    setSavingPw(true);
    try {
      await changePassword(cur, pw, pw2);
      setPwMsg("Password berhasil diubah.");
      setCur("");
      setPw("");
      setPw2("");
    } catch (err) {
      setPwErr(err.message || "Gagal mengubah password.");
    } finally {
      setSavingPw(false);
    }
  }

  const strength = (() => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  })();
  const strengthLabel = ["", "Lemah", "Cukup", "Baik", "Kuat"][strength];

  return (
    <div className="pf">
      <div className="pf-card">
        <div className="pf-cover">
          <i className="pf-orb a" />
          <i className="pf-orb b" />
        </div>

        <div className="pf-head">
          <div className="pf-avatar">{initials}</div>
          <div className="pf-who">
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
            <span className={isAdmin ? "pf-badge admin" : "pf-badge"}>
              {isAdmin ? "🛡️ Administrator" : "👤 Masyarakat"}
            </span>
          </div>
        </div>

        {stats.length > 0 && (
          <div className="pf-stats">
            {stats.map((s) => (
              <div key={s.label}>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="pf-tabs">
          <button className={tab === "info" ? "on" : ""} onClick={() => setTab("info")}>
            Data diri
          </button>
          <button className={tab === "sec" ? "on" : ""} onClick={() => setTab("sec")}>
            Keamanan
          </button>
        </div>

        {tab === "info" && (
          <form className="pf-form" onSubmit={saveInfo}>
            <label htmlFor="pf-name">Nama lengkap</label>
            <input id="pf-name" value={name} onChange={(e) => setName(e.target.value)}
              maxLength={255} required />

            <label htmlFor="pf-email">Email</label>
            <input id="pf-email" value={user?.email || ""} disabled />
            <small>Email tidak dapat diubah.</small>

            <label>Peran</label>
            <input value={isAdmin ? "Administrator" : "Masyarakat"} disabled />

            {infoErr && <div className="pf-err">{infoErr}</div>}
            {infoMsg && <div className="pf-ok">✓ {infoMsg}</div>}

            <button className="pf-btn" type="submit"
              disabled={savingInfo || name.trim() === (user?.name || "")}>
              {savingInfo ? "Menyimpan..." : "Simpan perubahan"}
            </button>
          </form>
        )}

        {tab === "sec" && (
          <form className="pf-form" onSubmit={savePassword}>
            <label htmlFor="pf-cur">Password saat ini</label>
            <input id="pf-cur" type={show ? "text" : "password"} value={cur}
              onChange={(e) => setCur(e.target.value)} required />

            <label htmlFor="pf-pw">Password baru</label>
            <input id="pf-pw" type={show ? "text" : "password"} value={pw}
              onChange={(e) => setPw(e.target.value)} minLength={8} required
              placeholder="Minimal 8 karakter" />

            {pw && (
              <div className="pf-meter">
                <div>
                  {[1, 2, 3, 4].map((n) => (
                    <i key={n} className={n <= strength ? `on l${strength}` : ""} />
                  ))}
                </div>
                <span>{strengthLabel}</span>
              </div>
            )}

            <label htmlFor="pf-pw2">Ulangi password baru</label>
            <input id="pf-pw2" type={show ? "text" : "password"} value={pw2}
              onChange={(e) => setPw2(e.target.value)} required />

            <label className="pf-check">
              <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
              Tampilkan password
            </label>

            {pwErr && <div className="pf-err">{pwErr}</div>}
            {pwMsg && <div className="pf-ok">✓ {pwMsg}</div>}

            <button className="pf-btn" type="submit" disabled={savingPw}>
              {savingPw ? "Menyimpan..." : "Ubah password"}
            </button>
          </form>
        )}

        <div className="pf-foot">
          <button className="pf-out" onClick={onLogout}>Keluar dari akun</button>
        </div>
      </div>
    </div>
  );
}