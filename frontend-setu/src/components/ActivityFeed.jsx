// src/components/ActivityFeed.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase/config";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where, // NEW: Import where
} from "firebase/firestore";

// Define styles for different statuses
const statusStyles = {
  pending_verification: {
    text: "Pending",
    bg: "bg-yellow-100",
    text_color: "text-yellow-800",
    border: "border-yellow-500",
  },
  verified: {
    // NEW: Added verified status for clarity
    text: "Verified",
    bg: "bg-cyan-100",
    text_color: "text-cyan-800",
    border: "border-cyan-500",
  },
  in_progress: {
    text: "In Progress",
    bg: "bg-blue-100",
    text_color: "text-blue-800",
    border: "border-blue-500",
  },
  completed: {
    text: "Completed",
    bg: "bg-green-100",
    text_color: "text-green-800",
    border: "border-green-500",
  },
};

const ActivityFeed = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // UPDATED: Query now filters out any 'rejected' status reports
    const q = query(
      collection(db, "reports"),
      where("status", "in", [
        "pending_verification",
        "verified",
        "in_progress",
        "completed",
      ]),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reportsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(reportsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">Loading feed...</div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex-shrink-0">
        Live Incidents
      </h2>
      <div className="space-y-4 overflow-y-auto flex-grow">
        {reports.map((report) => {
          const status = statusStyles[report.status] || {
            text: "Unknown",
            bg: "bg-gray-100",
            text_color: "text-gray-800",
            border: "border-gray-500",
          };
          return (
            <Link
              to={`/incident/${report.id}`}
              key={report.id}
              className="block"
            >
              <div
                className={`p-4 border-l-4 ${status.border} bg-gray-50 rounded-r-lg flex items-start gap-4 hover:shadow-lg transition-shadow`}
              >
                <img
                  src={report.photoURLs[0]}
                  alt={report.title}
                  className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                />
                <div className="flex-grow">
                  <h4 className="font-bold text-gray-800">{report.title}</h4>
                  <p className="text-sm text-gray-600">
                    Category: {report.category}
                  </p>
                  <div className="mt-2">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${status.bg} ${status.text_color}`}
                    >
                      {status.text}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeed;
