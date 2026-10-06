import React from "react";
import { useLocation } from "react-router-dom";
import { Bell, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Badge from "../ui/Badge";

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

const routeDetails: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "Dashboard",
    description: "Real-time compliance metrics, finding counts, and audit status overview.",
  },
  "/audits": {
    title: "Audit Management",
    description: "Schedule, manage, and track operational audit plans.",
  },
  "/assignments": {
    title: "Auditor Assignments",
    description: "Assign qualified auditors and review department conflict rules.",
  },
  "/checklists": {
    title: "Checklist Management",
    description: "Configure audit checklist templates and evaluate compliance items.",
  },
  "/observations": {
    title: "Observations",
    description: "Review field observation records and checklist findings.",
  },
  "/findings": {
    title: "Findings",
    description: "Manage non-conformances, severity ratings, and issue ownership.",
  },
  "/corrective-actions": {
    title: "Corrective Actions",
    description: "Track corrective action deadlines, status updates, and overdue tasks.",
  },
  "/evidence": {
    title: "Evidence Storage",
    description: "Manage uploaded evidence documentation and file attachments.",
  },
  "/verification": {
    title: "Verification & Closure",
    description: "Review and approve completed corrective actions.",
  },
  "/settings": {
    title: "Settings",
    description: "Platform configurations and system administration.",
  },
};

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  const currentRoute = routeDetails[location.pathname] || {
    title: "Operational Audit Platform",
    description: "Compliance & Corrective Action Management",
  };

  const getRoleVariant = (role?: string) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "danger";
      case "AUDITOR":
        return "primary";
      case "MANAGEMENT":
        return "success";
      case "DEPARTMENT_OWNER":
        return "warning";
      default:
        return "info";
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <header className="app-header">
      <div className="header-left">
        {onToggleMobileSidebar && (
          <button
            className="mobile-toggle-btn"
            onClick={onToggleMobileSidebar}
            aria-label="Toggle Navigation"
          >
            <Menu size={22} />
          </button>
        )}
        <div className="page-header-info">
          <h1 className="page-title">{currentRoute.title}</h1>
          {currentRoute.description && (
            <p className="page-description">{currentRoute.description}</p>
          )}
        </div>
      </div>

      <div className="header-right">
        {/* Notification Icon */}
        <button className="header-icon-btn" aria-label="Notifications">
          <Bell size={20} />
          <span className="notification-badge" />
        </button>

        <div className="header-divider" />

        {/* User Profile Area */}
        <div className="user-profile-area">
          <div className="avatar-circle">
            {getInitials(user?.name, user?.email)}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name || user?.email || "User"}</span>
            <span className="user-role-container">
              <Badge variant={getRoleVariant(user?.role)} size="sm">
                {user?.role || "USER"}
              </Badge>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
