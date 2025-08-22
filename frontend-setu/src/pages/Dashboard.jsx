// src/pages/Dashboard.jsx
import React from "react";
import { useAuth } from "../hooks/useAuth";
import CitizenDashboard from "./CitizenDashboard";
import NgoDashboard from "./NgoDashboard";
import HomePage from "./HomePage";

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center p-8">Loading Application...</div>;
  }

  if (user) {
    // Check for the role inside the user object
    return user.role === "citizen" ? <CitizenDashboard /> : <NgoDashboard />;
  }

  return <HomePage />;
};

export default Dashboard;
