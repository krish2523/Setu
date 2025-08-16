// src/components/DataStats.jsx
import React from "react";
import mapImage from "../assets/hero-images/india-map.png"; // Make sure you have this map image

const DataStats = () => {
  return (
    <div className="bg-white py-16 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <img
            src={mapImage}
            alt="Map of India with Setu projects"
            className="rounded-lg shadow-md"
          />
        </div>
        <div className="space-y-8">
          <div>
            <p className="text-lg text-gray-500 font-semibold">
              Total Reports Filed
            </p>
            <p className="text-6xl font-bold text-gray-900">1,245,789</p>
          </div>
          <div>
            <p className="text-lg text-gray-500 font-semibold">
              Active NGO Projects
            </p>
            <p className="text-6xl font-bold text-gray-900">2,345</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataStats;
