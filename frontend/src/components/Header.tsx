import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="header">
      <div>
        <h1>Operational Audit Platform</h1>
      </div>

      <div className="header-user">
        <span>{user?.role}</span>
      </div>
    </header>
  );
};

export default Header;
