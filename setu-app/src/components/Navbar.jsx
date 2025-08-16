// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import Logo from "./Logo";

const Navbar = () => {
  const { user, role } = useAuth(); // Get the role as well
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); // Redirect to login after logout
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <nav className="bg-white/90 backdrop-filter backdrop-blur-lg shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <Logo />
        <span className="text-xl font-bold text-gray-800">Setu</span>
      </Link>
      <div>
        {user ? (
          // --- LOGGED-IN USER VIEW ---
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="font-semibold text-gray-600 hover:text-green-600"
            >
              Home
            </Link>

            {/* Only show "Report" link if the user is a citizen */}
            {role === "citizen" && (
              <Link
                to="/report"
                className="font-semibold text-gray-600 hover:text-green-600"
              >
                Report an Incident
              </Link>
            )}

            <Link
              to="/activity"
              className="font-semibold text-gray-600 hover:text-green-600"
            >
              My Activity
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full"
            >
              Logout
            </button>
          </div>
        ) : (
          // --- LOGGED-OUT USER VIEW (for the public HomePage) ---
          <div className="flex gap-4">
            <Link
              to="/login"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
