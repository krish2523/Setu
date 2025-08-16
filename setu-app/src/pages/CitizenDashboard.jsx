// src/pages/CitizenDashboard.jsx
import React from "react";
import Navbar from "../components/Navbar"; // 1. Import the Navbar

const CitizenDashboard = () => {
  return (
    <div>
      <Navbar /> {/* 2. Add the Navbar here */}
      <div className="text-center p-8">
        <h1 className="text-3xl font-bold">Citizen Dashboard</h1>
        <p>Welcome! Here you can view and report environmental issues.</p>
        {/* We will build the rest of this dashboard later */}
      </div>
    </div>
  );
};

export default CitizenDashboard;
