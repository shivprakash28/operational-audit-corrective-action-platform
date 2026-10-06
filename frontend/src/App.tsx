import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Audits from "./pages/Audits";
import Assignments from "./pages/Assignments";
import Checklists from "./pages/Checklists";
import Observations from "./pages/Observations";
import Findings from "./pages/Findings";
import CorrectiveActions from "./pages/CorrectiveActions";
import Evidence from "./pages/Evidence";
import Verification from "./pages/Verification";
import Settings from "./pages/Settings";

import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/audits" element={<Audits />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/checklists" element={<Checklists />} />
        <Route path="/observations" element={<Observations />} />
        <Route path="/findings" element={<Findings />} />
        <Route path="/corrective-actions" element={<CorrectiveActions />} />
        <Route path="/evidence" element={<Evidence />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;