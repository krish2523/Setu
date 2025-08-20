import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

// Pages
import CitizenDashboard from "./pages/CitizenDashboard";
import NgoDashboard from "./pages/NgoDashboard";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import ReportForm from "./pages/ReportForm";
import MyActivity from "./pages/MyActivity";
import IncidentDetailsPage from "./pages/IncidentDetailsPage";
import NgoActivity from "./pages/NgoActivity"; // NGO activity

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
        {/* Home: citizen vs NGO */}
        <Route
          path="/"
          element={
            user?.role === "ngo" ? <NgoDashboard /> : <CitizenDashboard />
          }
        />

        {/* NGO dashboard explicit path */}
        <Route
          path="/ngo"
          element={
            user ? (
              user.role === "ngo" ? (
                <NgoDashboard />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* NGO Activity */}
        <Route
          path="/ngo/activity"
          element={
            user ? (
              user.role === "ngo" ? (
                <NgoActivity />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Citizen-only create report */}
        <Route
          path="/report"
          element={
            user ? (
              user.role === "ngo" ? (
                <Navigate to="/ngo" />
              ) : (
                <ReportForm />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Citizen My Activity */}
        <Route
          path="/activity"
          element={user ? <MyActivity /> : <Navigate to="/login" />}
        />

        {/* Shared Incident Details */}
        <Route
          path="/incident/:id"
          element={user ? <IncidentDetailsPage /> : <Navigate to="/login" />}
        />

        {/* Auth pages */}
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" /> : <SignUp />}
        />
      </Routes>
    </div>
  );
}

export default App;
