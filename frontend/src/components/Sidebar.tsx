import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Audit Platform</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard">Dashboard</NavLink>

        {(user?.role === "ADMIN" || user?.role === "AUDITOR") && (
          <>
            <NavLink to="/audits">Audits</NavLink>
            <NavLink to="/checklists">Checklists</NavLink>
            <NavLink to="/observations">Observations</NavLink>
            <NavLink to="/findings">Findings</NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-role">
          Role: <strong>{user?.role}</strong>
        </div>

        <button onClick={logout}>Logout</button>
      </div>
    </aside>
  );
};

export default Sidebar;
