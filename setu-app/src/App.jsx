// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { useAuth } from "./hooks/useAuth";
import { Navigate } from "react-router-dom";

function App() {
  const { user } = useAuth();

  return (
    <div className="login-background">
      {" "}
      {/* Assuming you want this background globally */}
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/" /> : <SignUp />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
