import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Audits from "./pages/Audits";

import { useAuth } from "./context/AuthContext";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-area">
        <Header />

        <main className="content">
          <h2>Dashboard</h2>

          <p>Welcome to the Operational Audit Platform.</p>

          {user && (
            <p>
              Logged in as: <strong>{user.role}</strong>
            </p>
          )}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/audits"
        element={
          <ProtectedRoute>
            <div className="app-layout">
              <Sidebar />

              <div className="main-area">
                <Header />

                <main className="content">
                  <Audits />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
};

export default App;