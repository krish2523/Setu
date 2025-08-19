// src/pages/MyActivity.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const MyActivity = () => {
  const { user, loading: userLoading } = useAuth();
  const [myReports, setMyReports] = useState([]);
  const [volunteeredFor, setVolunteeredFor] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const reportsQuery = query(
      collection(db, "reports"),
      where("authorId", "==", user.uid)
    );
    const unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
      setMyReports(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const fetchVolunteered = async () => {
      if (user.volunteeredFor && user.volunteeredFor.length > 0) {
        const promises = user.volunteeredFor.map((reportId) =>
          getDoc(doc(db, "reports", reportId))
        );
        const reportDocs = await Promise.all(promises);
        setVolunteeredFor(
          reportDocs
            .filter((doc) => doc.exists())
            .map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      }
    };
    fetchVolunteered();

    return () => unsubscribeReports();
  }, [user]);

  if (userLoading || loading) {
    return (
      <div>
        <Navbar />
        <p className="p-8">Loading your activity...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Activity</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                <span className="text-4xl">🏆</span>
                <span className="text-4xl">🌿</span>
                <span className="text-4xl">♻️</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Your Report History
              </h2>
              <div className="space-y-4">
                {myReports.map((report) => (
                  <Link
                    to={`/incident/${report.id}`}
                    key={report.id}
                    className="border-b pb-4 flex gap-4 items-center hover:bg-gray-50"
                  >
                    <img
                      src={report.photoURLs[0]}
                      alt={report.title}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    <div>
                      <h4 className="font-bold">{report.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(
                          report.createdAt?.toDate()
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Volunteered Initiatives
              </h2>
              <div className="space-y-4">
                {volunteeredFor.map((report) => (
                  <Link
                    to={`/incident/${report.id}`}
                    key={report.id}
                    className="border-b pb-4 flex items-center hover:bg-gray-50"
                  >
                    <div className="flex-grow">
                      <h4 className="font-bold">{report.title}</h4>
                      <p className="text-sm text-gray-500">
                        Status: {report.status.replace("_", " ")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default MyActivity;
