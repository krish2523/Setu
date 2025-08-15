// src/components/Login.jsx

import React, { useState } from "react";
import { auth } from "../firebase/config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import Logo from "./Logo";
import "../styles/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setError("");
    try {
      await signInWithPopup(auth, provider);
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
        className="w-full max-w-sm p-8 space-y-6 bg-white bg-opacity-10 rounded-2xl shadow-lg"
        style={cardStyle}
      >
        <div className="flex flex-col items-center">
          <Logo />
          <h1 className="text-3xl font-bold text-white">Setu</h1>
          <p className="text-gray-300 mt-2">Welcome. Please sign in.</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <input
              className="w-full px-4 py-3 bg-white bg-opacity-20 border border-transparent rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              className="w-full px-4 py-3 bg-white bg-opacity-20 border border-transparent rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-300">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-emerald-500 bg-gray-800 border-gray-600 rounded"
              />
              <span className="ml-2">Remember Me</span>
            </label>
            <a
              href="#"
              className="font-medium text-emerald-400 hover:text-emerald-300"
            >
              Forgot Password?
            </a>
          </div>
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          <div className="space-y-4 pt-4">
            <button
              type="submit"
              className="w-full py-3 font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
            >
              Login
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              className="w-full py-3 font-semibold text-white bg-transparent border-2 border-gray-400 rounded-lg hover:bg-green-900 hover:border-green-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-300"
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 font-semibold text-gray-800 bg-white rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-300 flex items-center justify-center gap-2"
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
              Sign In with Google
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
