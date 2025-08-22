// src/pages/CitizenDashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ActivityFeed from "../components/ActivityFeed";
import LiveMap from "../components/LiveMap";

const CitizenDashboard = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <main className="p-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column: Map & CTA */}
        <div className="lg:col-span-3 space-y-8">
          <div className="h-[70vh] bg-white rounded-xl shadow-md">
            <LiveMap />
          </div>
          <Link
            to="/report"
            className="w-full block text-center py-4 text-xl font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all"
          >
            Report an Incident
          </Link>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
      </main>
    </div>
  );
};

export default CitizenDashboard;
