// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import ReportForm from "./pages/ReportForm"; // Make sure this is imported

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading Application...</div>;
  }

  return (
    <div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" /> : <SignUp />}
        />
        {/* Add the protected report route back */}
        <Route
          path="/report"
          element={user ? <ReportForm /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
}
export default App;
