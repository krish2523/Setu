// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

// Import all your pages and components
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import SignUp from "./components/SignUp";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center p-8">Loading Application...</div>;
  }

  return (
    // The main div is now clean, without a global navbar or background
    <div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
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
