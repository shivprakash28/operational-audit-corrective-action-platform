import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  UserCheck,
  CheckSquare,
  Eye,
  AlertTriangle,
  Wrench,
  FileText,
  FileCheck,
  Settings,
  LogOut,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { logout } = useAuth();

  const mainNavItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/audits", label: "Audits", icon: ClipboardList },
    { to: "/assignments", label: "Assignments", icon: UserCheck },
    { to: "/checklists", label: "Checklists", icon: CheckSquare },
    { to: "/observations", label: "Observations", icon: Eye },
    { to: "/findings", label: "Findings", icon: AlertTriangle },
    { to: "/corrective-actions", label: "Corrective Actions", icon: Wrench },
    { to: "/evidence", label: "Evidence", icon: FileText },
    { to: "/verification", label: "Verification", icon: FileCheck },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
        {/* Brand / Logo Header */}
        <div className="sidebar-brand">
          <div className="brand-icon-wrapper">
            <ShieldCheck className="brand-icon" size={24} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Operational Audit</span>
            <span className="brand-subtitle">Platform</span>
          </div>
          {onCloseMobile && (
            <button
              className="mobile-close-btn"
              onClick={onCloseMobile}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Main Navigation List */}
        <nav className="sidebar-menu">
          <div className="menu-group-label">Core Platform</div>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <Icon className="nav-icon" size={20} />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            );
          })}

          <div className="sidebar-divider" />

          {/* System & Settings */}
          <div className="menu-group-label">System</div>
          <NavLink
            to="/settings"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <Settings className="nav-icon" size={20} />
            <span className="nav-label">Settings</span>
          </NavLink>

          <button onClick={logout} className="nav-item logout-btn">
            <LogOut className="nav-icon" size={20} />
            <span className="nav-label">Logout</span>
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
