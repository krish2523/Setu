// src/components/MapDisplay.jsx

import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ResizeMap from "./ResizeMap"; // Import the helper to fix loading bugs

// This is a known issue fix for React-Leaflet's default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const MapDisplay = ({ latitude, longitude }) => {
  const position = [latitude, longitude];

  return (
    <MapContainer
      center={position}
      zoom={14}
      style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position} />

      {/* This helper component will run automatically and fix any sizing issues */}
      <ResizeMap />
    </MapContainer>
  );
};

export default MapDisplay;
