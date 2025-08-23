// src/pages/MyActivity.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import Leaderboard from "../components/Leaderboard";

const MyActivity = () => {
  const { user, loading: userLoading } = useAuth();
  const [myReports, setMyReports] = useState([]);
  const [volunteeredFor, setVolunteeredFor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (userLoading || !user) {
      setLoading(false);
      return;
    }

    // ✅ Fetch user's own reports
    const reportsQuery = query(
      collection(db, "reports"),
      where("authorId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribeReports = onSnapshot(
      reportsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMyReports(data);
      },
      (error) => {
        console.error("Error fetching user reports: ", error);
      }
    );

    // ✅ Always fetch latest volunteeredFor + points from Firestore
    const fetchUserData = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          setPoints(userData.points || 0);

          if (userData.volunteeredFor && userData.volunteeredFor.length > 0) {
            const promises = userData.volunteeredFor.map((reportId) =>
              getDoc(doc(db, "reports", reportId))
            );
            const reportDocs = await Promise.all(promises);
            setVolunteeredFor(
              reportDocs
                .filter((doc) => doc.exists())
                .map((doc) => ({ id: doc.id, ...doc.data() }))
            );
          } else {
            setVolunteeredFor([]);
          }
        }
      } catch (error) {
        console.error("Error fetching volunteered reports: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    return () => unsubscribeReports();
  }, [user, userLoading]);

  if (userLoading || loading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Navbar />
        <p className="p-8 text-center">Loading your activity...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Activity</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="md:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-gray-500 font-semibold">Your Total Points</h3>
              <p className="text-5xl font-bold text-green-600 mt-2">{points}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-gray-900 font-bold text-center mb-4">
                Collected Badges
              </h3>
              <div className="flex justify-center gap-4 text-4xl">
                <span>🏆</span>
                <span>🌿</span>
                <span>♻️</span>
              </div>
            </div>
            <Leaderboard />
          </div>

          {/* Right column */}
          <div className="md:col-span-2 space-y-8">
            {/* Report History */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Report History
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {myReports.length > 0 ? (
                  myReports.map((report) => (
                    <Link
                      to={`/incident/${report.id}`}
                      key={report.id}
                      className="border-b pb-4 flex gap-4 items-center hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      {report.photoURLs?.[0] && (
                        <img
                          src={report.photoURLs[0]}
                          alt={report.title}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                      )}
                      <div>
                        <h4 className="font-bold">{report.title}</h4>
                        <p className="text-sm text-gray-500">
                          {report.createdAt?.toDate
                            ? report.createdAt.toDate().toLocaleDateString()
                            : "No date"}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500">
                    You haven’t submitted any reports yet.
                  </p>
                )}
              </div>
            </div>

            {/* Volunteered Initiatives */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Volunteered Initiatives
              </h2>
              <div className="space-y-4">
                {volunteeredFor.length > 0 ? (
                  volunteeredFor.map((report) => (
                    <Link
                      to={`/incident/${report.id}`}
                      key={report.id}
                      className="border-b pb-4 flex items-center hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <div className="flex-grow">
                        <h4 className="font-bold">{report.title}</h4>
                        <p className="text-sm text-gray-500">
                          Status: {report.status?.replace(/_/g, " ") || "N/A"}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500">
                    You haven’t volunteered for any initiatives yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyActivity;
