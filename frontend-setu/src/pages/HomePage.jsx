// src/pages/HomePage.jsx
import React from "react";
import Hero from "../components/Hero";
import DataStats from "../components/DataStats";

const HomePage = () => {
  return (
    // The Navbar component is now removed from this page
    <div>
      <Hero />
      <DataStats />
    </div>
  );
};

export default HomePage;
