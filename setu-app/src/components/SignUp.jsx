// src/components/SignUp.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Logo from "./Logo";
import "../styles/login.css";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [city, setCity] = useState(""); // 1. New state for the city
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save user data, now including the city
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: name,
        email: email,
        role: role,
        city: city, // 3. Save the city here
        points: 0,
        createdAt: new Date(),
      });
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!city) {
      setError("Please enter your city before signing up with Google.");
      return;
    }
    const provider = new GoogleAuthProvider();
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save user data, now including the city
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        role: role,
        city: city, // 3. Save the city here
        points: 0,
        createdAt: new Date(),
      });
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  const cardStyle = {
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  };

  return (
    <div className="flex justify-center items-center login-background p-4">
      <div
        className="w-full max-w-sm p-8 space-y-4 bg-white bg-opacity-80 rounded-2xl shadow-lg"
        style={cardStyle}
      >
        <div className="flex flex-col items-center">
          <Logo />
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join the Setu community.</p>
        </div>

        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => setRole("citizen")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                role === "citizen"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              I am a Citizen
            </button>
            <button
              type="button"
              onClick={() => setRole("ngo")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                role === "ngo" ? "bg-green-600 text-white" : "bg-gray-700"
              }`}
            >
              I am an NGO
            </button>
          </div>
          <div>
            <input
              className="w-full px-4 py-3 bg-white bg-opacity-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
              type="text"
              placeholder="Display Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {/* 2. New input field for the city */}
          <div>
            <input
              className="w-full px-4 py-3 bg-white bg-opacity-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
              type="text"
              placeholder="Your City (e.g., Kolkata)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              className="w-full px-4 py-3 bg-white bg-opacity-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              className="w-full px-4 py-3 bg-white bg-opacity-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <div className="space-y-4 pt-2">
            <button
              type="submit"
              className="w-full py-3 font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:opacity-90"
            >
              Sign Up with Email
            </button>
            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full py-3 font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,36.591,44,31.016,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              Sign Up with Google
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-green-600 hover:text-green-500"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
