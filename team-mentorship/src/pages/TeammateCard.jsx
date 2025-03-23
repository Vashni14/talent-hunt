import React from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const TeammateCard = ({ teammate }) => {
  const { user } = useAuth();

  const sendInvitation = async (type) => {
    try {
      console.log("🔹 Debugging Invitation Data:");
      console.log("Sender ID:", user?.uid); // ✅ Should be Firebase UID
      console.log("Receiver ID:", teammate?.uid); // ✅ Should be Firebase UID
  
      if (!user?.uid || !teammate?.uid) {
        console.error("❌ Missing IDs:", { senderId: user?.uid, receiverId: teammate?.uid });
        alert("Error: Missing sender or receiver ID. Please check the console.");
        return;
      }
  
      const response = await axios.post("http://localhost:5000/api/invites", {
        senderId: user?.uid,  // ✅ Firebase UID
        receiverId: teammate?.uid, // ✅ Firebase UID (NOT ObjectId)
        type,
        message: `Hi ${teammate.name}, I'd like to invite you for a ${type}.`,
      });
  
      console.log("✅ Invite Response:", response.data);
      alert("Invitation sent!");
    } catch (error) {
      console.error("❌ Error sending invitation:", error.response?.data || error);
      alert("Failed to send invitation.");
    }
  };
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <img
        src={teammate.profilePicture || "/default-avatar.png"}
        alt="Profile"
        className="w-16 h-16 rounded-full object-cover mb-2"
      />

      <h2 className="text-xl font-bold text-teal-400">{teammate.name}</h2>
      <p className="text-gray-300">{teammate.domain}</p>

      <p className="text-gray-300">
        Skills: {teammate.skills.map(skill => skill.name).join(", ") || "N/A"}
      </p>

      <div className="mt-4 space-x-2">
        <button
          onClick={() => sendInvitation("project")}
          className="bg-blue-500 px-3 py-1 rounded font-bold hover:bg-blue-600"
        >
          Invite for Project
        </button>
        <button
          onClick={() => sendInvitation("competition")}
          className="bg-green-500 px-3 py-1 rounded font-bold hover:bg-green-600"
        >
          Invite for Competition
        </button>
        <button
          onClick={() => sendInvitation("feedback")}
          className="bg-purple-500 px-3 py-1 rounded font-bold hover:bg-purple-600"
        >
          Ask for Feedback
        </button>
      </div>
    </div>
  );
};

export default TeammateCard;
