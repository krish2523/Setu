import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import Logo from "./Logo";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm p-2 flex justify-between items-center sticky top-0 z-50">
      <Link
        to={user?.role === "ngo" ? "/ngo" : "/"}
        className="flex items-center gap-2 pl-4"
      >
        <Logo />
        <span className="text-lg font-bold text-gray-800">Setu</span>
      </Link>

      <div>
        {user ? (
          <div className="relative pr-4" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2"
            >
              <span className="font-semibold text-gray-700 hidden sm:block">
                {user.displayName}
              </span>
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                {user.displayName?.charAt(0).toUpperCase()}
              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-md shadow-xl z-20">
                {/* Role-aware activity link */}
                {user?.role === "ngo" ? (
                  <Link
                    to="/ngo/activity"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Activity
                  </Link>
                ) : (
                  <Link
                    to="/activity"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Activity
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-4 pr-4">
            <Link
              to="/login"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full text-sm"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full text-sm"
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
