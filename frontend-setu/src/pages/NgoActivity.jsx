// src/pages/NgoActivity.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  increment,
  orderBy,
} from "firebase/firestore";
import SustainabilityScorecard from "../components/SustainabilityScorecard"; // Import the scorecard

const NgoActivity = () => {
  const { user } = useAuth();
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const isNgo = user?.role === "ngo";

  useEffect(() => {
    if (!user || !isNgo) {
      setLoading(false);
      return;
    }

    // All incidents assigned to this NGO
    const q = query(
      collection(db, "reports"),
      where("assignedNgoId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAssigned(items);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [user, isNgo]);

  const stats = useMemo(() => {
    const completed = assigned.filter((r) => r.status === "completed").length;
    const inProgress = assigned.filter(
      (r) => r.status === "in_progress"
    ).length;
    return { completed, inProgress };
  }, [assigned]);

  // Filter for completed reports to pass to the scorecard
  const completedReports = useMemo(() => {
    return assigned.filter((report) => report.status === "completed");
  }, [assigned]);

  const setStatus = async (report, newStatus) => {
    if (!user || !isNgo) return;

    const canToInProgress =
      report.status === "verified" && newStatus === "in_progress";
    const canToCompleted =
      report.status === "in_progress" && newStatus === "completed";
    const allowed = canToInProgress || canToCompleted;

    if (!allowed) {
      alert("This action is not allowed from the current status.");
      return;
    }

    try {
      await updateDoc(doc(db, "reports", report.id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid,
      });

      if (newStatus === "completed") {
        await updateDoc(doc(db, "users", user.uid), { points: increment(10) });
        alert("Marked as completed. +10 points awarded ✅");
      } else {
        alert("Marked as in progress.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto p-8 text-center">
          Loading Activity...
        </div>
      </div>
    );
  }

  if (!isNgo) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto p-8">
          <p className="text-center text-gray-600">
            This page is available only for NGO accounts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          NGO Activity Dashboard
        </h1>

        {/* Sustainability Scorecard */}
        <SustainabilityScorecard completedReports={completedReports} />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500 text-sm font-semibold">
              Completed Reports
            </p>
            <p className="text-4xl font-extrabold text-green-600 mt-2">
              {stats.completed}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500 text-sm font-semibold">In Progress</p>
            <p className="text-4xl font-extrabold text-yellow-600 mt-2">
              {stats.inProgress}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500 text-sm font-semibold">Your Points</p>
            <p className="text-4xl font-extrabold text-emerald-600 mt-2">
              {user?.points ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              +5 on accept, +10 on completion
            </p>
          </div>
        </div>

        {/* Assigned Incidents */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Your Assigned Incidents
          </h2>

          {assigned.length === 0 ? (
            <p className="text-gray-500">No incidents assigned yet.</p>
          ) : (
            <ul className="divide-y">
              {assigned.map((r) => (
                <li key={r.id} className="py-4 flex items-start gap-4">
                  {r.photoURLs?.[0] && (
                    <img
                      src={r.photoURLs[0]}
                      alt={r.title}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  )}

                  <div className="flex-1">
                    <Link
                      to={`/incident/${r.id}`}
                      className="font-semibold text-gray-900 hover:underline"
                    >
                      {r.title}
                    </Link>
                    <p className="text-sm text-gray-600">{r.description}</p>

                    <div className="mt-1 text-xs text-gray-500">
                      <span className="mr-3">
                        Category: {r.category || "N/A"}
                      </span>
                      <span className="mr-3">
                        Status:{" "}
                        <span className="capitalize">
                          {String(r.status || "pending_verification").replace(
                            /_/g,
                            " "
                          )}
                        </span>
                      </span>
                      <span>
                        Created:{" "}
                        {r.createdAt?.toDate
                          ? r.createdAt.toDate().toLocaleString()
                          : "—"}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => setStatus(r, "in_progress")}
                        disabled={r.status !== "verified"}
                        className={`px-3 py-1 rounded-md text-sm font-semibold border ${
                          r.status !== "verified"
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200"
                        }`}
                      >
                        Mark In Progress
                      </button>

                      <button
                        onClick={() => setStatus(r, "completed")}
                        disabled={r.status !== "in_progress"}
                        className={`px-3 py-1 rounded-md text-sm font-semibold border ${
                          r.status !== "in_progress"
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                        }`}
                      >
                        Mark Completed
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default NgoActivity;
