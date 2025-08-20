// src/pages/IncidentDetailsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import MapDisplay from "../components/MapDisplay";

const IncidentDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("No report ID provided.");
      setLoading(false);
      return;
    }

    const docRef = doc(db, "reports", id);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) setReport({ id: docSnap.id, ...docSnap.data() });
        else setError("Report not found.");
        setLoading(false);
      },
      () => setError("Failed to load report data.")
    );

    return () => unsubscribe();
  }, [id]);

  // Citizen: Volunteer
  const handleVolunteer = async () => {
    if (!user || !report) return;
    try {
      const volunteerRef = doc(db, `reports/${report.id}/volunteers`, user.uid);
      await setDoc(volunteerRef, {
        name: user.displayName,
        email: user.email,
        volunteeredAt: serverTimestamp(),
      });

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        volunteeredFor: arrayUnion(report.id),
        points: increment(10), // Citizen gets 10 points
      });

      alert("Thank you for volunteering! You've earned 10 points.");
      navigate("/activity");
    } catch (err) {
      alert("Error volunteering. Please try again.");
      console.error(err);
    }
  };

  // NGO: Accept Incident
  const handleAcceptIncident = async () => {
    if (!user || !report) return;
    try {
      const reportRef = doc(db, "reports", report.id);
      await updateDoc(reportRef, {
        assignedNgoId: user.uid,
        assignedNgoName: user.displayName,
        status: "in_progress",
      });

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { points: increment(5) }); // NGO gets 5 points

      alert("Incident accepted! You've earned 5 points.");
      navigate("/activity");
    } catch (err) {
      alert("Error accepting incident. Please try again.");
      console.error(err);
    }
  };

  if (loading)
    return (
      <div>
        <Navbar />
        <p className="p-8 text-center">Loading...</p>
      </div>
    );
  if (error || !report)
    return (
      <div>
        <Navbar />
        <p className="p-8 text-center text-red-500">
          {error || "Report not found."}
        </p>
      </div>
    );

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto p-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Side */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <p className="text-sm font-semibold text-green-600">
                  {report.category}
                </p>
                <h1 className="text-4xl font-bold text-gray-900">
                  {report.title}
                </h1>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {report.photoURLs?.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Incident ${index + 1}`}
                    className="h-56 w-auto object-cover rounded-lg shadow-sm"
                  />
                ))}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Description
                </h3>
                <p className="text-gray-700">{report.description}</p>
              </div>
            </div>

            {/* Right Side */}
            <div className="md:col-span-1 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Location
                </h3>
                <div className="h-64 w-full rounded-lg">
                  <MapDisplay
                    latitude={report.location.lat}
                    longitude={report.location.lng}
                  />
                </div>
              </div>

              {/* Citizen: Volunteer */}
              {report.status === "in_progress" && user?.role === "citizen" && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800">Ready to Help?</h3>
                  <p className="text-sm text-blue-700 mt-1 mb-3">
                    The assigned NGO is working on this. You can volunteer to
                    help them.
                  </p>
                  <button
                    onClick={handleVolunteer}
                    className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Volunteer for this Initiative
                  </button>
                </div>
              )}

              {/* NGO: Accept Incident */}
              {report.status === "verified" && user?.role === "ngo" && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-green-800">Accept this Case?</h3>
                  <p className="text-sm text-green-700 mt-1 mb-3">
                    This incident has been verified. Accept it to take
                    responsibility.
                  </p>
                  <button
                    onClick={handleAcceptIncident}
                    className="w-full py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Accept Incident
                  </button>
                </div>
              )}

              {/* Status Display */}
              {!(report.status === "in_progress" && user?.role === "citizen") &&
                !(report.status === "verified" && user?.role === "ngo") && (
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h3 className="font-bold text-gray-800">
                      Status: {report.status.replace(/_/g, " ")}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {report.status === "pending_verification"
                        ? "This report is being verified by AI."
                        : "No actions available for your role at this stage."}
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IncidentDetailsPage;
