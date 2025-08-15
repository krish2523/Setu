// src/components/Logo.jsx
import React from "react";

const Logo = () => {
  return (
    <div className="w-16 h-16 mb-4 flex items-center justify-center bg-green-500 bg-opacity-10 rounded-full">
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
          stroke="#10B981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default Logo;
