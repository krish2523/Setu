// src/pages/MyActivity.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";

const MyActivity = () => {
  const { user } = useAuth();
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return; // Don't query if user is not logged in

    const reportsRef = collection(db, "reports");
    // This query fetches only the reports where 'authorId' matches the current user's ID
    const q = query(
      reportsRef,
      where("authorId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reportsData = [];
      querySnapshot.forEach((doc) => {
        reportsData.push({ id: doc.id, ...doc.data() });
      });
      setMyReports(reportsData);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, [user]); // Rerun this effect if the user changes

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <main className="p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Activity</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Stats & Badges */}
          <div className="md:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-gray-500 font-semibold">Your Total Points</h3>
              <p className="text-5xl font-bold text-green-600 mt-2">
                {user?.points || 0}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-gray-900 font-bold text-center mb-4">
                Collected Badges
              </h3>
              <div className="flex justify-center gap-4">
                {/* Placeholder for badges */}
                <span className="text-4xl">🏆</span>
                <span className="text-4xl">🌿</span>
                <span className="text-4xl">♻️</span>
              </div>
            </div>
          </div>

          {/* Right Column: Report History */}
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your Report History
            </h2>
            <div className="space-y-4">
              {loading && <p>Loading your reports...</p>}
              {!loading && myReports.length === 0 && (
                <p>You haven't submitted any reports yet.</p>
              )}
              {myReports.map((report) => (
                <div key={report.id} className="border-b pb-4 flex gap-4">
                  <img
                    src={report.photoURLs[0]}
                    alt={report.title}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div>
                    <h4 className="font-bold">{report.title}</h4>
                    <p className="text-sm text-gray-600">{report.category}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(
                        report.createdAt?.toDate()
                      ).toLocaleDateString()}
                    </p>
                    <span
                      className={`mt-2 inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        report.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {report.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyActivity;
