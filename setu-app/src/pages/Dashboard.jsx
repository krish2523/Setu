// src/pages/Dashboard.jsx

import React from "react";
import { useAuth } from "../hooks/useAuth";
import CitizenDashboard from "./CitizenDashboard";
import NgoDashboard from "./NgoDashboard";
import HomePage from "./HomePage";

const Dashboard = () => {
  // 1. Make sure to get 'loading' from the hook
  const { user, role, loading } = useAuth();

  // 2. Add this loading check at the top
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading Application...</p>
      </div>
    );
  }

  // If a user IS logged in, show their correct dashboard
  if (user) {
    return role === "citizen" ? <CitizenDashboard /> : <NgoDashboard />;
  }

  // If NO user is logged in, show the public HomePage
  return <HomePage />;
};

export default Dashboard;
