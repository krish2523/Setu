// src/components/Hero.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/HomePage.css";

// Import your 6 collage images
import img1 from "../assets/hero-images/image1.jpg";
import img2 from "../assets/hero-images/image2.png";
import img3 from "../assets/hero-images/image3.jpg";
import img4 from "../assets/hero-images/image4.jpg";
import img5 from "../assets/hero-images/image5.jpg";
import img6 from "../assets/hero-images/image6.jpg";

const Hero = () => {
  const images = [img1, img2, img3, img4, img5, img6];

  return (
    <div className="hero-container">
      <div className="hero-background">
        <div className="hero-collage">
          {/* Column 1: The large image */}
          <div className="collage-col collage-col-large">
            <img
              src={img1}
              alt="Volunteer action 1"
              className="collage-image"
            />
          </div>
          {/* Column 2: Two smaller images */}
          <div className="collage-col collage-col-small">
            <img
              src={img2}
              alt="Volunteer action 2"
              className="collage-image"
            />
            <img
              src={img3}
              alt="Volunteer action 3"
              className="collage-image"
            />
          </div>
          {/* Column 3: Three smaller images */}
          <div className="collage-col collage-col-small">
            <img
              src={img4}
              alt="Volunteer action 4"
              className="collage-image"
            />
            <img
              src={img5}
              alt="Volunteer action 5"
              className="collage-image"
            />
            <img
              src={img6}
              alt="Volunteer action 6"
              className="collage-image"
            />
          </div>
        </div>
      </div>

      <div className="hero-overlay"></div>

      <div className="hero-content">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
          Setu:Action for a Greener India
        </h1>

        {/* --- The new quote is added here --- */}
        <p className="text-lg text-gray-200 mt-2 mb-8 max-w-2xl mx-auto">
          See a problem? Be the start of the solution.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            to="/login"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full text-lg transition-all duration-300"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-full text-lg transition-all duration-300"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
