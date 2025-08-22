import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

// Pages
import Dashboard from "./pages/Dashboard";
import CitizenDashboard from "./pages/CitizenDashboard";
import NgoDashboard from "./pages/NgoDashboard";
import GovernmentDashboard from "./pages/GovernmentDashboard"; // NEW: Import Gov Dashboard
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import ReportForm from "./pages/ReportForm";
import MyActivity from "./pages/MyActivity";
import IncidentDetailsPage from "./pages/IncidentDetailsPage";
import NgoActivity from "./pages/NgoActivity";
import CommunityPage from "./pages/CommunityPage";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Application...
      </div>
    );
  }

  return (
    <div>
      <Routes>
        {/* --- Core Routes --- */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" /> : <SignUp />}
        />

        {/* --- Protected Shared Routes --- */}
        <Route
          path="/incident/:id"
          element={user ? <IncidentDetailsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/community"
          element={user ? <CommunityPage /> : <Navigate to="/login" />}
        />

        {/* --- Citizen Specific Routes --- */}
        <Route
          path="/citizen"
          element={
            user?.role === "citizen" ? (
              <CitizenDashboard />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/report"
          element={
            user?.role === "citizen" ? <ReportForm /> : <Navigate to="/" />
          }
        />
        <Route
          path="/activity"
          element={
            user?.role === "citizen" ? <MyActivity /> : <Navigate to="/" />
          }
        />

        {/* --- NGO Specific Routes --- */}
        <Route
          path="/ngo"
          element={
            user?.role === "ngo" ? <NgoDashboard /> : <Navigate to="/" />
          }
        />
        <Route
          path="/ngo/activity"
          element={user?.role === "ngo" ? <NgoActivity /> : <Navigate to="/" />}
        />

        {/* NEW: Government Specific Route */}
        <Route
          path="/government"
          element={
            user?.role === "government" ? (
              <GovernmentDashboard />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
