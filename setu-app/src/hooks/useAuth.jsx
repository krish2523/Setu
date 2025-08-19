// src/hooks/useAuth.js
import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // User is logged in, now get their full profile from Firestore
        console.log("Auth user found:", authUser.uid);
        const userDocRef = doc(db, "users", authUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log("Firestore document found:", userData);
          // Combine the auth data with the Firestore data
          setUser({
            uid: authUser.uid,
            email: authUser.email,
            ...userData, // This includes displayName, role, points, etc.
          });
        } else {
          console.error(
            "User document not found in Firestore for UID:",
            authUser.uid
          );
          // Log out the user if their database record is missing
          auth.signOut();
          setUser(null);
        }
      } else {
        // User is signed out
        console.log("No auth user found.");
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // We only need to return the user and loading state.
  // The role is now inside the user object (user.role).
  return { user, loading };
};
