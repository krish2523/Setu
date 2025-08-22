// src/pages/Dashboard.jsx

import React from "react";
import { useAuth } from "../hooks/useAuth";
import CitizenDashboard from "./CitizenDashboard";
import NgoDashboard from "./NgoDashboard";
import GovernmentDashboard from "./GovernmentDashboard";

// This component acts as a router based on the user's role.
const Dashboard = () => {
  const { user } = useAuth();

  // Display a loading or default state while user data is being fetched
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading user data...
      </div>
    );
  }

  // Check the user's role and render the appropriate dashboard
  switch (user.role) {
    case "ngo":
      return <NgoDashboard />;
    case "government":
      return <GovernmentDashboard />;
    case "citizen":
    default:
      return <CitizenDashboard />;
  }
};

export default Dashboard;
