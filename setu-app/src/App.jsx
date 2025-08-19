// src/App.jsx

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

// Import all page-level components
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import ReportForm from "./pages/ReportForm";
import MyActivity from "./pages/MyActivity";
import IncidentDetailsPage from "./pages/IncidentDetailsPage";

function App() {
  const { user, loading } = useAuth();

  // This is crucial: wait until Firebase has confirmed the user's login status
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
        {/* The main route '/' will always show the Dashboard component */}
        <Route path="/" element={<Dashboard />} />

        {/* If a user is already logged in, redirect them away from login/signup */}
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" /> : <SignUp />}
        />

        {/* These are protected routes. You can only access them if you are logged in. */}
        <Route
          path="/report"
          element={user ? <ReportForm /> : <Navigate to="/login" />}
        />
        <Route
          path="/activity"
          element={user ? <MyActivity /> : <Navigate to="/login" />}
        />
        <Route
          path="/incident/:id"
          element={user ? <IncidentDetailsPage /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
}

export default App;
