
import { Bell, Menu, Search } from "lucide-react";

export default function Topbar({ onMenuClick }) {
  const user = JSON.parse(localStorage.getItem("sweety_user") || "{}");

  const initial = user.name?.charAt(0)?.toUpperCase() || "S";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-button" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>

        <div className="breadcrumb">
          <span>Workspace</span>
          <span className="breadcrumb-divider">/</span>
          <strong>Overview</strong>
        </div>
      </div>

      <div className="topbar-actions">
        <button className="icon-button search-button" aria-label="Search">
          <Search size={19} />
        </button>

        <button className="icon-button notification-button" aria-label="Notifications">
          <Bell size={19} />
          <span className="notification-dot" />
        </button>

        <div className="user-profile">
          <div className="avatar">{initial}</div>
          <div className="user-info">
            <strong>{user.name || "Welcome"}</strong>
            <span>Personal account</span>
          </div>
        </div>
      </div>
    </header>
  );
}
