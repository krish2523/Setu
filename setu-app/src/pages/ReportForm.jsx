// src/pages/ReportForm.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import MapDisplay from "../components/MapDisplay";
import "../styles/ReportForm.css";

const ReportForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [photos, setPhotos] = useState([]);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  const fetchLocation = () => {
    setLocationLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (err) => {
        setError(
          "Could not get your location. Please enable location services in your browser."
        );
        setLocationLoading(false);
        console.error(err);
      }
    );
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 3) {
      setError("You can upload a maximum of 3 photos.");
      e.target.value = null;
      return;
    }
    setPhotos(selectedFiles);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || photos.length === 0 || !location || !category) {
      setError(
        "All fields, including a category, photo, and location, are required."
      );
      return;
    }
    setLoading(true);
    setError("");

    try {
      const uploadPromises = photos.map((photo) => {
        const storageRef = ref(storage, `reports/${Date.now()}_${photo.name}`);
        return uploadBytes(storageRef, photo).then((snapshot) =>
          getDownloadURL(snapshot.ref)
        );
      });
      const photoURLs = await Promise.all(uploadPromises);

      await addDoc(collection(db, "reports"), {
        title,
        description,
        category,
        photoURLs,
        location,
        authorId: user.uid,
        authorName: user.displayName,
        createdAt: serverTimestamp(),
        status: "pending_verification",
      });

      setLoading(false);
      alert("Report submitted successfully!");
      navigate("/");
    } catch (err) {
      setError("Failed to submit report. Please try again.");
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex justify-center items-center py-12 px-4">
        <div className="w-full max-w-lg p-8 bg-white rounded-xl shadow-lg space-y-6">
          <h1 className="text-3xl font-bold text-black text-center">
            Report an Incident
          </h1>
          <p className="text-center text-gray-800 mb-6">
            Help us keep your community clean and safe.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-black"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g., Overflowing bin on MG Road"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:ring-green-500 focus:border-green-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-black"
              >
                Description
              </label>
              <textarea
                id="description"
                placeholder="Provide details like the exact landmark, severity, etc."
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 h-24 focus:ring-green-500 focus:border-green-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-black"
              >
                Category
              </label>
              <select
                id="category"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-green-500 focus:border-green-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                <option value="Potholes">Potholes</option>
                <option value="Garbage">Garbage</option>
                <option value="Deforestation">Deforestation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black">
                Upload Photos (Max 3)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                required
                className="mt-1 w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
              />
              <div className="mt-2 flex gap-2">
                {photos.map((photo, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(photo)}
                    alt={`preview ${index}`}
                    className="h-20 w-20 object-cover rounded-md border"
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-black">
                  Incident Location
                </label>
                <button
                  type="button"
                  onClick={fetchLocation}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Refresh Location
                </button>
              </div>
              <div className="mt-1 h-56 bg-gray-200 rounded-lg">
                {locationLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <p className="text-gray-600">Getting your location...</p>
                  </div>
                ) : location ? (
                  <MapDisplay
                    latitude={location.lat}
                    longitude={location.lng}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center p-4 text-center">
                    <p className="text-red-500">Could not get location.</p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center font-semibold">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-all duration-300"
            >
              {loading ? "Submitting Report..." : "Submit Report"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportForm;
