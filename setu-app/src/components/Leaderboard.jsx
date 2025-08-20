// src/components/Leaderboard.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

const Leaderboard = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("points", "desc"), limit(5));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTopUsers(usersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching leaderboard: ", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Loading leaderboard...</p>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-gray-900 text-center mb-4">
        Community Leaderboard
      </h3>
      <ol className="space-y-4">
        {topUsers.map((user, index) => (
          <li key={user.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-500 w-6 text-center">
                {index + 1}
              </span>
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {user.displayName?.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-gray-800 truncate">
                {user.displayName}
              </span>
            </div>
            <span className="font-bold text-green-600">
              {user.points || 0} pts
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Leaderboard;
