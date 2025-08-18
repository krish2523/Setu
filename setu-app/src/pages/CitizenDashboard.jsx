// src/pages/CitizenDashboard.jsx

import React from "react";
import Navbar from "../components/Navbar";
import ReportForm from "./ReportForm"; // 1. Import the new form component

const CitizenDashboard = () => {
  return (
    <div>
      {/* The Navbar will still be at the top */}
      <Navbar />

      {/* 2. We are now displaying the ReportForm directly on this page */}
      <ReportForm />
    </div>
  );
};

export default CitizenDashboard;
