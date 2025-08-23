// src/hooks/useAuth.js
import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const useAuth = () => {
  const [user, setUser] = useState(null); // { uid, email, ...firestoreFields } or null
  const [loading, setLoading] = useState(true); // true until Firebase + Firestore finish

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        console.log("ℹ️ No auth user found.");
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        console.log("✅ Auth user found:", authUser.uid);
        const userDocRef = doc(db, "users", authUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log("📄 Firestore document exists:", true);
          setUser({
            uid: authUser.uid,
            email: authUser.email ?? null,
            ...userData, // expect fields like role, displayName, etc.
          });
        } else {
          console.warn("⚠️ No Firestore user document for UID:", authUser.uid);
          await signOut(auth);
          setUser(null);
        }
      } catch (err) {
        console.error("❌ Error fetching Firestore user document:", err);
        await signOut(auth);
        setUser(null);
      } finally {
        setLoading(false); // 👈 Only finish after Firestore resolved
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};
