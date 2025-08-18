// src/pages/ReportForm.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import MapDisplay from "../components/MapDisplay";
import "../styles/ReportForm.css"; // Import the dedicated CSS file

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

  // Get user's location when the component loads
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        setError(
          "Could not get your location. Please enable location services in your browser."
        );
        console.error(err);
      }
    );
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 3) {
      setError("You can upload a maximum of 3 photos.");
      return;
    }
    setPhotos(selectedFiles);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to submit a report.");
      return;
    }
    if (photos.length === 0) {
      setError("Please upload at least one photo of the incident.");
      return;
    }
    if (!location) {
      setError(
        "Location is required. Please ensure location services are enabled."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Upload all images in parallel
      const uploadPromises = photos.map((photo) => {
        const storageRef = ref(storage, `reports/${Date.now()}_${photo.name}`);
        return uploadBytes(storageRef, photo).then((snapshot) =>
          getDownloadURL(snapshot.ref)
        );
      });

      const photoURLs = await Promise.all(uploadPromises);

      // 2. Create a new document in the 'reports' collection
      await addDoc(collection(db, "reports"), {
        title,
        description,
        category,
        photoURLs, // Save array of URLs
        location,
        authorId: user.uid,
        authorName: user.displayName,
        createdAt: serverTimestamp(),
        status: "pending_verification",
      });

      setLoading(false);
      alert("Report submitted successfully!");
      navigate("/"); // Redirect to the dashboard
    } catch (err) {
      setError("Failed to submit report. Please try again.");
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-50">
      <Navbar />
      <div className="min-h-screen flex justify-center items-center py-12 px-4">
        <div className="w-full max-w-2xl p-8 bg-white rounded-xl shadow-lg space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Report an Incident
          </h1>
          <p className="text-center text-gray-600">
            Help us keep your community clean and safe.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g., Overflowing bin on MG Road"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                placeholder="Provide details like the exact landmark, severity, etc."
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg h-24 focus:ring-green-500 focus:border-green-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="category"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-green-500 focus:border-green-500"
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
              <label className="block text-sm font-medium text-gray-700">
                Upload Photos (Max 3)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                required
                className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
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
              <label className="block text-sm font-medium text-gray-700">
                Incident Location
              </label>
              <div className="mt-1 w-full h-56 bg-gray-200 rounded-lg">
                {location ? (
                  <MapDisplay
                    latitude={location.lat}
                    longitude={location.lng}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <p>Getting your location...</p>
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
