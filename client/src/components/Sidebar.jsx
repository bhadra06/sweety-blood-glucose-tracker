
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  ChartNoAxesCombined,
  HeartPulse,
  Settings,
  LogOut,
  X
} from "lucide-react";

const links = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/readings", label: "My Readings", icon: Activity },
  { to: "/reports", label: "Analytics", icon: ChartNoAxesCombined }
];

export default function Sidebar({ open, onClose, onLogout }) {
  return (
    <>
      {open && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <HeartPulse size={23} />
          </div>
          <span>sweety<span className="brand-dot">.</span></span>
          <button className="mobile-close" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <div className="nav-section-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="tip-icon">
              <HeartPulse size={18} />
            </div>
            <p>Your health journey, one reading at a time.</p>
          </div>

          <button className="nav-link logout-link" onClick={onLogout}>
            <LogOut size={19} />
            <span>Log out</span>
          </button>

          <div className="sidebar-footer">
            <span className="footer-status" />
            Your health companion
          </div>
        </div>
      </aside>
    </>
  );
}
