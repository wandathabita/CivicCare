import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AdminLayout from "./AdminLayout.jsx";
import { getAdminAreas } from "../services/api";

// Koordinat perkiraan pusat tiap wilayah (Kota Bandung)
const COORDS = {
  Sukajadi: [-6.8875, 107.5905],
  Cicendo: [-6.9, 107.5985],
  Coblong: [-6.8855, 107.6135],
  Andir: [-6.9145, 107.5795],
  "Bandung Wetan": [-6.9055, 107.6175],
};

// Warna lingkaran berdasarkan jumlah laporan yang belum selesai
function colorFor(open) {
  if (open >= 5) return "#dc2626";
  if (open >= 2) return "#f59e0b";
  return "#0f766e";
}

function AreaMap({ areas }) {
  const navigate = useNavigate();
  const boxRef = useRef(null);

  useEffect(() => {
    const map = L.map(boxRef.current, { scrollWheelZoom: false }).setView([-6.9, 107.6], 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    areas.forEach((a) => {
      const pos = COORDS[a.area];
      if (!pos) return;

      const open = a.total - a.selesai;
      const circle = L.circleMarker(pos, {
        radius: 12 + Math.min(a.total, 20) * 1.6,
        color: colorFor(open),
        fillColor: colorFor(open),
        fillOpacity: 0.45,
        weight: 2,
      }).addTo(map);

      // Popup dibuat dengan DOM agar aman dari injeksi HTML
      const box = document.createElement("div");
      const title = document.createElement("b");
      title.textContent = a.area;
      const info = document.createElement("div");
      info.textContent = `${a.total} laporan, ${open} belum selesai`;
      const link = document.createElement("a");
      link.textContent = "Lihat laporan →";
      link.href = "#";
      link.onclick = (e) => {
        e.preventDefault();
        navigate(`/dashboard/laporan?area=${encodeURIComponent(a.area)}`);
      };
      box.append(title, info, link);
      circle.bindPopup(box);
      circle.bindTooltip(`${a.area}: ${a.total}`);
    });

    return () => map.remove();
  }, [areas, navigate]);

  return (
    <div
      ref={boxRef}
      style={{ height: 340, borderRadius: 22, overflow: "hidden", border: "1px solid #dfe9eb", marginBottom: 18 }}
    />
  );
}

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
          <p className="a-muted">
            Peta sebaran laporan. Merah = banyak laporan belum selesai, kuning = sedang, hijau = aman.
          </p>
        </div>
      </div>

      {error ? (
        <div className="a-panel a-empty"><p>{error}</p></div>
      ) : !areas ? (
        <div className="a-panel a-empty">Memuat…</div>
      ) : (
        <>
          <AreaMap areas={areas} />

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
        </>
      )}
    </AdminLayout>
  );
}