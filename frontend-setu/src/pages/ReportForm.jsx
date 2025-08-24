import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import MapDisplay from "../components/MapDisplay";
import "../styles/ReportForm.css";

// Your Vercel ML API Endpoint
const ML_API_URL = "http://localhost:8000/classify";

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
  const [loadingMessage, setLoadingMessage] = useState("Submitting Report...");
  const [locationLoading, setLocationLoading] = useState(true);

  const fetchLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (err) => {
        setError("Could not get location. Please enable location services.");
        setLocationLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 3);
    setPhotos(selectedFiles);
    setError(
      selectedFiles.length > 3
        ? "You can only upload a maximum of 3 photos."
        : ""
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || photos.length === 0 || !location || !category) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    setError("");

    let docRef;

    try {
      // Step 1: Upload photos to Cloudinary
      setLoadingMessage("Uploading images...");
      const uploadPromises = photos.map((photo) => {
        const formData = new FormData();
        formData.append("file", photo);
        formData.append(
          "upload_preset",
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        );
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        return fetch(uploadUrl, { method: "POST", body: formData }).then(
          (response) => response.json()
        );
      });
      const cloudinaryResponses = await Promise.all(uploadPromises);
      const photoURLs = cloudinaryResponses.map((res) => res.secure_url);

      // Step 2: Save the initial report to Firestore to get a document ID
      setLoadingMessage("Saving initial report...");
      docRef = await addDoc(collection(db, "reports"), {
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

      // Step 3: Call the ML API for analysis using the first image
      setLoadingMessage("Analyzing incident with AI...");
      const firstPhotoURL = photoURLs[0];
      const mlResponse = await fetch(ML_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: firstPhotoURL }),
      });

      // UPDATED: More detailed error handling for the API call
      if (!mlResponse.ok) {
        // Try to get a more specific error message from the API's response body
        const errorData = await mlResponse
          .json()
          .catch(() => ({ detail: mlResponse.statusText }));
        throw new Error(
          `AI analysis failed: ${errorData.detail || "Unknown server error"}`
        );
      }

      const analysisResult = await mlResponse.json();

      // Step 4: Update the report with the analysis and set status to "verified"
      setLoadingMessage("Finalizing report...");
      await updateDoc(docRef, {
        status: "verified",
        ...analysisResult,
      });

      // Step 5: Award points
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { points: increment(5) });

      setLoading(false);
      alert("Report submitted and verified! You've earned 5 points.");
      navigate("/citizen");
    } catch (err) {
      setError(
        `An error occurred: ${err.message}. Your report may be saved in a pending state.`
      );
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
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500"
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
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 h-24"
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
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-black"
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
                className="mt-1 w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
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
              <label className="block text-sm font-medium text-black">
                Incident Location
              </label>
              <div className="mt-1 h-56 bg-gray-200 rounded-lg">
                {locationLoading ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <p>Getting location...</p>
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
              className="w-full py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? loadingMessage : "Submit Report"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportForm;
