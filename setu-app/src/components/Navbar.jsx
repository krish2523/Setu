// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import Logo from "./Logo"; // Reuse your logo

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/"); // Redirect to home after logout
  };

  return (
    <nav className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg shadow-lg p-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2">
        <Logo />
        <span className="text-xl font-bold text-white">Setu</span>
      </Link>
      <div>
        {user ? (
          // If user is logged in, show Logout button
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        ) : (
          // If no user, show Login/Signup buttons
          <div className="flex gap-4">
            <Link
              to="/login"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
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
