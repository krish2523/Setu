// src/pages/CommunityPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase/config";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import "../styles/CommunityPage.css";

// --- Helper Components ---

function CommunityEducationCard() {
  return (
    <div className="education-card">
      <h3>Community Awareness Hub</h3>
      <p>
        <strong>Did you know?</strong> Improper waste disposal in Howrah can
        affect the Hooghly River's ecosystem. Your actions matter!
      </p>
      <ul>
        <li>Segregate wet and dry waste at home.</li>
        <li>Report illegal dumping using our app.</li>
        <li>Join local clean-up drives announced in the news feed.</li>
      </ul>
      <a href="#" className="learn-more-link">
        Learn how you can help &rarr;
      </a>
    </div>
  );
}

function NewsCard() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = () => {
      setLoading(true);
      const dummyNews = [
        {
          title: "Howrah Municipal Corporation Announces 'Clean Howrah' Week",
          tag: "Civic Update",
          source: "HMC Official",
        },
        {
          title: "Concerns raised over industrial waste near Belur Math",
          tag: "Pollution",
          source: "Local Times",
        },
        {
          title: "Citizen reports lead to cleanup of Nandi Bagan area",
          tag: "Community Action",
          source: "Citizen App",
        },
        {
          title: "New recycling centers to open in Shibpur and Bally",
          tag: "Infrastructure",
          source: "Govt. WB",
        },
      ];
      setNews(dummyNews);
      setLoading(false);
    };
    fetchNews();
  }, []);

  return (
    <div className="news-card">
      <h3>Howrah Environmental News</h3>
      {loading ? (
        <p>Loading latest news...</p>
      ) : (
        <ul>
          {news.map((item, idx) => (
            <li key={idx}>
              <span
                className={`news-tag ${item.tag
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                {item.tag}
              </span>
              <p className="news-title">{item.title}</p>
              <span className="news-source">{item.source}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CommunityChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const q = query(
      collection(db, "community-chat"),
      orderBy("createdAt", "asc"),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  const handleImageSelect = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !imageFile) || !user) return;

    setIsUploading(true);
    let imageUrl = null;

    try {
      if (imageFile) {
        const storage = getStorage();
        const filePath = `chat-images/${user.uid}/${Date.now()}_${
          imageFile.name
        }`;
        const storageRef = ref(storage, filePath);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, "community-chat"), {
        text: input,
        imageUrl: imageUrl,
        authorName: user.displayName,
        authorId: user.uid,
        authorRole: user.role || "citizen",
        createdAt: serverTimestamp(),
      });

      setInput("");
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error sending message: ", error);
      alert("Could not send message. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="chat-section">
      <div className="chat-header">
        <h2>Community Connect</h2>
        <p>Live chat for citizens, NGOs, and officials</p>
      </div>
      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${
              msg.authorId === user?.uid ? "sent" : "received"
            }`}
          >
            <div
              className={`message-bubble ${
                msg.authorRole === "government" ? "official-bubble" : ""
              }`}
            >
              <div className="message-author">
                {msg.authorName}
                {msg.authorRole === "ngo" && (
                  <span className="ngo-badge">NGO</span>
                )}
                {msg.authorRole === "government" && (
                  <span className="gov-badge">Official</span>
                )}
              </div>
              {msg.imageUrl && (
                <img
                  src={msg.imageUrl}
                  alt="User upload"
                  className="chat-image"
                />
              )}
              {msg.text && <p className="message-text">{msg.text}</p>}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-input-form">
        {imageFile && (
          <div className="image-preview">
            <img src={URL.createObjectURL(imageFile)} alt="Preview" />
            <button
              type="button"
              onClick={() => setImageFile(null)}
              className="remove-image-btn"
            >
              &times;
            </button>
          </div>
        )}
        {/* UPDATED: Wrapped inputs in a div for proper layout */}
        <div className="input-row">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            style={{ display: "none" }}
          />
          <button
            type="button"
            className="attach-btn"
            onClick={() => fileInputRef.current.click()}
            disabled={isUploading}
          >
            📎
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share an update or ask a question…"
            disabled={!user || isUploading}
          />
          <button
            type="submit"
            disabled={!user || isUploading || (!input.trim() && !imageFile)}
          >
            {isUploading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}

// --- Main Page Component ---

export default function CommunityPage() {
  return (
    <>
      <Navbar />
      <div className="community-page-container">
        <div className="main-content">
          <CommunityChat />
        </div>
        <div className="right-sidebar">
          <CommunityEducationCard />
          <NewsCard />
        </div>
      </div>
    </>
  );
}
