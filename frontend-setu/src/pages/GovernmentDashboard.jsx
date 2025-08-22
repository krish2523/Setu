// src/pages/GovernmentDashboard.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { motion } from "framer-motion";
import Logo from "../components/Logo";
import Navbar from "../components/Navbar"; // UPDATED: Import the main Navbar
import "../styles/GovDashboard.css";

// --- Data Fetching Hooks ---

const useMetrics = () => {
  const [metrics, setMetrics] = useState({
    completed: 0,
    pending: 0,
    total: 0,
  });

  useEffect(() => {
    const q = query(collection(db, "reports"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let completed = 0;
      let pending = 0;
      querySnapshot.forEach((doc) => {
        const status = doc.data().status;
        if (status === "completed") {
          completed++;
        } else if (
          ["pending_verification", "verified", "in_progress"].includes(status)
        ) {
          pending++;
        }
      });
      setMetrics({ completed, pending, total: completed + pending });
    });
    return () => unsubscribe();
  }, []);

  return metrics;
};

const useLiveActivity = () => {
  const [incidents, setIncidents] = useState([]);
  useEffect(() => {
    const q = query(
      collection(db, "reports"),
      where("status", "!=", "completed"),
      orderBy("status"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const incidentData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIncidents(incidentData);
    });
    return () => unsubscribe();
  }, []);
  return incidents;
};

const useNgos = () => {
  const [ngos, setNgos] = useState([]);
  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "ngo"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ngoData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNgos(ngoData);
    });
    return () => unsubscribe();
  }, []);
  return ngos;
};

// --- Main Dashboard Component ---

export default function GovernmentDashboard() {
  const metrics = useMetrics();
  const incidents = useLiveActivity();
  const ngos = useNgos();

  const completionRate =
    metrics.total > 0
      ? Math.round((metrics.completed / metrics.total) * 100)
      : 0;

  const wardRanking = [
    { ward: "Ward 15 (Shibpur)", score: 92 },
    { ward: "Ward 22 (Central)", score: 88 },
    { ward: "Ward 05 (Bally)", score: 85 },
    { ward: "Ward 41 (Bantra)", score: 79 },
    { ward: "Ward 11 (North)", score: 75 },
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case "in_progress":
        return "status-in-progress";
      case "verified":
        return "status-verified";
      case "pending_verification":
        return "status-pending";
      default:
        return "";
    }
  };

  return (
    <div className="gov-dashboard-container">
      <Navbar /> {/* UPDATED: Using the main Navbar component */}
      <main className="gov-main-content">
        <h1 className="gov-title">Government Dashboard</h1>
        <div className="gov-main-grid">
          {/* Ward Performance */}
          <motion.div whileHover={{ scale: 1.02 }} className="dashboard-card">
            <h2 className="card-title">Ward Performance (Howrah)</h2>
            <ul className="list-container">
              {wardRanking.map((item, i) => (
                <li key={i} className="list-item">
                  <span className="ward-name">
                    {i + 1}. {item.ward}
                  </span>
                  <span className="ward-score">{item.score}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Live Activity Feed */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="dashboard-card activity-feed-card"
          >
            <h2 className="card-title">Live Activity Feed</h2>
            <ul className="list-container scrollable">
              {incidents.length > 0 ? (
                incidents.map((incident) => (
                  <li key={incident.id} className="incident-item">
                    <span className="incident-title">{incident.title}</span>
                    <span
                      className={`status-badge ${getStatusClass(
                        incident.status
                      )}`}
                    >
                      {incident.status.replace("_", " ")}
                    </span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 p-2">No active incidents.</p>
              )}
            </ul>
          </motion.div>

          {/* Tasks Overview */}
          <motion.div whileHover={{ scale: 1.02 }} className="dashboard-card">
            <h2 className="card-title">Tasks Overview</h2>
            <div className="task-overview-metrics">
              <div>
                <p className="metric-number completed">{metrics.completed}</p>
                <p className="metric-label">Completed</p>
              </div>
              <div>
                <p className="metric-number pending">{metrics.pending}</p>
                <p className="metric-label">Pending</p>
              </div>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${completionRate}%` }}
              >
                {completionRate}%
              </div>
            </div>
          </motion.div>

          {/* Registered NGOs */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="dashboard-card ngo-list-card"
          >
            <h2 className="card-title">Registered NGOs</h2>
            <div className="ngo-list-container">
              <ul className="ngo-list-grid">
                {ngos.map((ngo) => (
                  <li key={ngo.id} className="ngo-list-item">
                    {ngo.displayName}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
