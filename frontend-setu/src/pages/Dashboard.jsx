// src/pages/Dashboard.jsx

import React from "react";
import { useAuth } from "../hooks/useAuth";
import CitizenDashboard from "./CitizenDashboard";
import NgoDashboard from "./NgoDashboard";
import GovernmentDashboard from "./GovernmentDashboard";

const Dashboard = () => {
  // 1. Destructure both user and loading
  const { user, loading } = useAuth();

  // 2. First, handle the loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading user data...
      </div>
    );
  }

  // 3. After loading, if there's no user, they shouldn't be here.
  //    Returning null is a clean way to render nothing.
  //    A router would typically redirect them to a login page.
  if (!user) {
    return null;
  }

  // 4. If we get here, loading is false and user exists. Now check the role.
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
