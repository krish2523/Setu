// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

// Pages
import CitizenDashboard from "./pages/CitizenDashboard";
import NgoDashboard from "./pages/NgoDashboard";
import GovernmentDashboard from "./pages/GovernmentDashboard";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import ReportForm from "./pages/ReportForm";
import MyActivity from "./pages/MyActivity";
import IncidentDetailsPage from "./pages/IncidentDetailsPage";
import NgoActivity from "./pages/NgoActivity";
import CommunityPage from "./pages/CommunityPage";
import HomePage from "./pages/HomePage";

/** Simple full-screen loader */
function FullscreenLoader({ message = "Loading..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center text-lg">
      {message}
    </div>
  );
}

/** Reusable Protected Route Wrapper */
function ProtectedRoute({ user, loading, children, roles }) {
  if (loading) {
    return <FullscreenLoader message="Checking authentication..." />;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

/** Automatically redirect user to their role dashboard */
function RoleRedirect({ user }) {
  if (!user) return <Navigate to="/" replace />;
  switch (user.role) {
    case "citizen":
      return <Navigate to="/citizen" replace />;
    case "ngo":
      return <Navigate to="/ngo" replace />;
    case "government":
      return <Navigate to="/government" replace />;
    default:
      return <Navigate to="/" replace />;
  }
}

function App() {
  const { user, loading } = useAuth();

  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<HomePage />} />

      {/* Auth routes → go to role dashboard if already logged in */}
      <Route
        path="/login"
        element={
          loading ? (
            <FullscreenLoader />
          ) : user ? (
            <RoleRedirect user={user} />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/signup"
        element={
          loading ? (
            <FullscreenLoader />
          ) : user ? (
            <RoleRedirect user={user} />
          ) : (
            <SignUp />
          )
        }
      />

      {/* --- Shared Protected Routes --- */}
      <Route
        path="/incident/:id"
        element={
          <ProtectedRoute user={user} loading={loading}>
            <IncidentDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/community"
        element={
          <ProtectedRoute user={user} loading={loading}>
            <CommunityPage />
          </ProtectedRoute>
        }
      />

      {/* --- Citizen Routes --- */}
      <Route
        path="/citizen"
        element={
          <ProtectedRoute user={user} loading={loading} roles={["citizen"]}>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/report"
        element={
          <ProtectedRoute user={user} loading={loading} roles={["citizen"]}>
            <ReportForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activity"
        element={
          <ProtectedRoute user={user} loading={loading} roles={["citizen"]}>
            <MyActivity />
          </ProtectedRoute>
        }
      />

      {/* --- NGO Routes --- */}
      <Route
        path="/ngo"
        element={
          <ProtectedRoute user={user} loading={loading} roles={["ngo"]}>
            <NgoDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ngo/activity"
        element={
          <ProtectedRoute user={user} loading={loading} roles={["ngo"]}>
            <NgoActivity />
          </ProtectedRoute>
        }
      />

      {/* --- Government Routes --- */}
      <Route
        path="/government"
        element={
          <ProtectedRoute user={user} loading={loading} roles={["government"]}>
            <GovernmentDashboard />
          </ProtectedRoute>
        }
      />

      {/* --- Fallback Route (404) --- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
