import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout, { STATUS_CLASS } from "./AdminLayout.jsx";
import { STATUS_LIST, getAdminReport, timeAgo, updateReportStatus } from "../services/api.js";

export default function AdminReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [status, setStatus] = useState("Menunggu");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminReport(id)
      .then((r) => {
        setReport(r);
        setStatus(r.status);
        setNote(r.note || "");
      })
      .catch((e) => setError(e.message || "Laporan tidak ditemukan."));
  }, [id]);

  async function save() {
    setSaving(true);
    setOk("");
    setError("");
    try {
      const updated = await updateReportStatus(id, status, note);
      setReport(updated);
      setOk("Status laporan berhasil diperbarui.");
    } catch (e) {
      setError(e.message || "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  if (error && !report) {
    return (
      <AdminLayout>
        <div className="a-panel a-empty">
          <p>{error}</p>
          <button className="a-btn" onClick={() => navigate("/dashboard/laporan")}>Kembali</button>
        </div>
      </AdminLayout>
    );
  }

  if (!report) {
    return (
      <AdminLayout>
        <div className="a-panel a-empty">Memuat…</div>
      </AdminLayout>
    );
  }

  const step = STATUS_LIST.indexOf(report.status);
  const changed = status !== report.status || note !== (report.note || "");

  return (
    <AdminLayout>
      <button className="a-back" onClick={() => navigate("/dashboard/laporan")}>← Kembali ke daftar</button>

      <div className="a-detail">
        <section className="a-panel a-pad">
          <small className="a-muted">{report.id}</small>
          <h2 className="a-title">{report.title}</h2>
          <span className={STATUS_CLASS[report.status]}>{report.status}</span>

          <div className="a-timeline">
            {STATUS_LIST.map((s, i) => (
              <div key={s} className={i <= step ? "tl on" : "tl"}>
                <i>{i <= step ? "✓" : i + 1}</i>
                <span>{s}</span>
              </div>
            ))}
          </div>

          <dl className="a-dl">
            <dt>Pelapor</dt><dd>{report.reporter} ({report.reporterEmail})</dd>
            <dt>Kategori</dt><dd>{report.category}</dd>
            <dt>Wilayah</dt><dd>{report.area}</dd>
            <dt>Alamat</dt><dd>{report.address}</dd>
            <dt>Dikirim</dt><dd>{timeAgo(report.createdAt)}</dd>
            <dt>Deskripsi</dt><dd>{report.description}</dd>
          </dl>

          {report.photo && <img className="a-photo" src={report.photo} alt="Foto laporan" />}
        </section>

        <aside className="a-panel a-pad a-act">
          <h3>Tindak lanjut</h3>

          <div className="a-status">
            {STATUS_LIST.map((s) => (
              <button key={s} className={status === s ? "on" : ""} onClick={() => setStatus(s)}>
                <i /> {s}
              </button>
            ))}
          </div>

          <label htmlFor="note">Catatan untuk warga</label>
          <textarea
            id="note"
            value={note}
            maxLength={1000}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: Sudah diteruskan ke Dinas PU, perbaikan dijadwalkan besok."
          />

          {ok && <div className="a-ok">✓ {ok}</div>}
          {error && <div className="a-err">{error}</div>}

          <button className="a-btn full" onClick={save} disabled={saving || !changed}>
            {saving ? "Menyimpan..." : "Simpan perubahan"}
          </button>
        </aside>
      </div>
    </AdminLayout>
  );
}