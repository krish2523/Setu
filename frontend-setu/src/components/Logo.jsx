// src/components/Logo.jsx

import React from "react";
// 1. Import your logo image from the assets folder
import logoImage from "../assets/Logo.png";

const Logo = () => {
  return (
    // 2. Use the imported image as the src
    <img src={logoImage} alt="Setu Logo" className="w-16 h-18 mb-4" />
  );
};

export default Logo;
