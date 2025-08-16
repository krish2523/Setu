// src/pages/NgoDashboard.jsx
import React from "react";
import Navbar from "../components/Navbar"; 

const NgoDashboard = () => {
  return (
    <div>
      <Navbar /> {/* 2. Add the Navbar here */}
      <div className="text-center p-8">
        <h1 className="text-3xl font-bold">NGO Dashboard</h1>
        <p>Welcome! Manage your projects and view community hotspots.</p>
        {/* We will build the rest of this dashboard later */}
      </div>
    </div>
  );
};

export default NgoDashboard;
