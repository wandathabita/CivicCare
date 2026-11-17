import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getAdminReports, logoutUser } from "../services/api";
import "./Admin.css";

export const STATUS_CLASS = {
  Menunggu: "a-badge a-gray",
  Diverifikasi: "a-badge a-blue",
  Diproses: "a-badge a-orange",
  Selesai: "a-badge a-green",
};

export function Icon({ name, size = 20 }) {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round",
  };
  if (name === "home") return (<svg {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>);
  if (name === "list") return (<svg {...p}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></svg>);
  if (name === "pin") return (<svg {...p}><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>);
  if (name === "users") return (<svg {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.4-5 6.5-5s5.7 1.5 6.5 5" /><path d="M16 4.6a3.5 3.5 0 010 6.8M18 15.4c1.8.6 3 2.2 3.5 4.6" /></svg>);
  if (name === "bell") return (<svg {...p}><path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 19a2 2 0 004 0" /></svg>);
  if (name === "clock") return (<svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
  if (name === "check") return (<svg {...p}><path d="M5 12l5 5L20 7" /></svg>);
  if (name === "wrench") return (<svg {...p}><path d="M14.7 6.3a4 4 0 005 5L21 13l-8 8-4-4 8-8z" /><path d="M3 21l4-4" /></svg>);
  return (<svg {...p}><path d="M9 6l6 6-6 6" /></svg>);
}

const NAV = [
  { to: "/dashboard", label: "Ringkasan", icon: "home", end: true },
  { to: "/dashboard/laporan", label: "Laporan", icon: "list" },
  { to: "/dashboard/wilayah", label: "Wilayah", icon: "pin" },
  { to: "/dashboard/pengguna", label: "Pengguna", icon: "users" },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [pending, setPending] = useState(0);
  const [menu, setMenu] = useState(false);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }
  const name = user?.name || "Admin";
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  useEffect(() => {
    getAdminReports({ status: "Menunggu" })
      .then((l) => setPending(l.length))
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await logoutUser();
    navigate("/login", { replace: true });
  }

  const linkClass = ({ isActive }) => (isActive ? "on" : "");

  return (
    <div className="ad" onClick={() => menu && setMenu(false)}>
      <header className="a-top">
        <div className="a-top-in">
          <button className="a-brand" onClick={() => navigate("/dashboard")}>
            <span className="a-logo">CC</span>
            <b>CivicCare</b>
            <em>Admin</em>
          </button>

          <nav className="a-nav">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={linkClass}>
                <Icon name={n.icon} size={18} /> {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="a-right">
            <button className="a-bell" title={`${pending} laporan menunggu`}
              onClick={() => navigate("/dashboard/laporan?status=Menunggu")}>
              <Icon name="bell" />
              {pending > 0 && <span className="a-dot">{pending > 99 ? "99+" : pending}</span>}
            </button>

            <div className="a-user">
              <button className="a-avatar" onClick={(e) => { e.stopPropagation(); setMenu(!menu); }}>
                {initials}
              </button>
              {menu && (
                <div className="a-menu" onClick={(e) => e.stopPropagation()}>
                  <b>{name}</b>
                  <small>{user?.email}</small>
                  <span className="a-badge a-orange">Administrator</span>
                  <button onClick={handleLogout}>Keluar</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="a-main">{children}</main>

      <nav className="a-bottom">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={linkClass}>
            <Icon name={n.icon} />
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
