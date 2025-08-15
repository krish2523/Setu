// src/pages/Dashboard.jsx
import React from "react";
import { useAuth } from "../hooks/useAuth";
import CitizenDashboard from "./CitizenDashboard";
import NgoDashboard from "./NgoDashboard";

const Dashboard = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Show a loading state
  }

  // If a user is logged in, show the correct dashboard based on their role
  if (user) {
    return role === "citizen" ? <CitizenDashboard /> : <NgoDashboard />;
  }

  // If no user is logged in, show a public landing page
  return (
    <div className="text-center p-8">
      <h1 className="text-4xl font-bold">Welcome to Setu</h1>
      <p className="mt-4">Please log in or sign up to continue.</p>
    </div>
  );
};

export default Dashboard;
