// src/pages/IncidentDetailsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import {
  doc,
  collection,
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
// import { uploadImage } from "../utils/storage"; // Uncomment and implement for real uploads

const IncidentDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [volunteers, setVolunteers] = useState([]);
  const [afterImage, setAfterImage] = useState(null);

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
        if (docSnap.exists()) {
          setReport({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Report not found.");
        }
        setLoading(false);
      },
      () => setError("Failed to load report data.")
    );

    const volunteersRef = collection(db, `reports/${id}/volunteers`);
    const unsubVolunteers = onSnapshot(volunteersRef, (snapshot) => {
      const volunteerList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVolunteers(volunteerList);
    });

    return () => {
      unsubscribe();
      unsubVolunteers();
    };
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
        points: increment(10),
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
      await updateDoc(userRef, { points: increment(5) });
      alert("Incident accepted! You've earned 5 points.");
      navigate("/activity");
    } catch (err) {
      alert("Error accepting incident. Please try again.");
      console.error(err);
    }
  };

  // NGO: Mark as Completed
  const handleMarkAsCompleted = async () => {
    if (!user || !report) return;
    if (!afterImage) {
      alert("Please upload an 'after' photo to show the completed work.");
      return;
    }

    try {
      // const afterPhotoURL = await uploadImage(afterImage, `completions/${report.id}`);
      const afterPhotoURL = "URL_FROM_STORAGE_PLACEHOLDER"; // Replace with real upload logic

      const reportRef = doc(db, "reports", report.id);
      await updateDoc(reportRef, {
        status: "completed",
        completedAt: serverTimestamp(),
        afterPhotoURL: afterPhotoURL,
      });

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { points: increment(25) });

      alert("Incident resolved! You've earned 25 points.");
      navigate("/dashboard");
    } catch (err) {
      alert("Error resolving incident. Please try again.");
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

  const hasVolunteered = volunteers.some((v) => v.id === user?.uid);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto p-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Side (Report Details) */}
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
              {/* List of Volunteers */}
              {volunteers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">
                    Volunteers
                  </h3>
                  <ul className="list-disc ml-6 text-gray-700">
                    {volunteers.map((v) => (
                      <li key={v.id}>
                        {v.name} ({v.email})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* After Photo if completed */}
              {report.status === "completed" && report.afterPhotoURL && (
                <div>
                  <h3 className="text-lg font-semibold text-purple-700 mb-2">
                    Completion Photo
                  </h3>
                  <img
                    src={report.afterPhotoURL}
                    alt="After completion"
                    className="h-56 w-auto object-cover rounded-lg shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Right Side (Map & Actions) */}
            <div className="md:col-span-1 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Location
                </h3>
                <div className="h-64 w-full rounded-lg overflow-hidden">
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
                    The assigned NGO is working on this. You can volunteer to help them.
                  </p>
                  <button
                    onClick={handleVolunteer}
                    disabled={hasVolunteered}
                    className={`w-full py-3 font-semibold text-white rounded-lg ${
                      hasVolunteered
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {hasVolunteered
                      ? "Thanks for Volunteering!"
                      : "Volunteer for this Initiative"}
                  </button>
                </div>
              )}

              {/* NGO: Accept Incident */}
              {report.status === "verified" && user?.role === "ngo" && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-green-800">Accept this Case?</h3>
                  <p className="text-sm text-green-700 mt-1 mb-3">
                    This incident has been verified. Accept it to take responsibility.
                  </p>
                  <button
                    onClick={handleAcceptIncident}
                    className="w-full py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Accept Incident
                  </button>
                </div>
              )}

              {/* NGO: Mark as Completed */}
              {report.status === "in_progress" &&
                user?.uid === report.assignedNgoId && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-bold text-purple-800">
                      Resolve This Incident
                    </h3>
                    <p className="text-sm text-purple-700 mt-1 mb-3">
                      Upload a photo of the completed work to mark this incident as resolved.
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAfterImage(e.target.files[0])}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                    />
                    <button
                      onClick={handleMarkAsCompleted}
                      disabled={!afterImage}
                      className="w-full mt-3 py-3 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                    >
                      Mark as Completed
                    </button>
                  </div>
                )}

              {/* Status Display */}
              {!(report.status === "in_progress" && user?.role === "citizen") &&
                !(report.status === "verified" && user?.role === "ngo") &&
                !(report.status === "in_progress" && user?.uid === report.assignedNgoId) && (
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