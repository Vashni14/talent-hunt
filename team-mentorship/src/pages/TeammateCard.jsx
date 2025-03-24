import React from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const TeammateCard = ({ teammate, isMatch = false }) => {
  const { user } = useAuth();

  // Function to properly construct image URL
  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return '/default-avatar.png';
    
    // If it's already a full URL (from cloud storage)
    if (imagePath.startsWith('http')) return imagePath;
    
    // For local development with Express server
    if (imagePath.startsWith('/uploads')) {
      return `http://localhost:5000${imagePath}`;
    }
    
    // Default case (relative paths)
    return imagePath;
  };

  const sendInvitation = async (type) => {
    try {
      if (!user?.uid || !teammate?.uid) {
        throw new Error("Missing user information");
      }

      const response = await axios.post('http://localhost:5000/api/invites', {
        senderId: user.uid,
        senderName: user.displayName || user.email,
        receiverId: teammate.uid,
        receiverName: teammate.name,
        type,
        message: `Hi ${teammate.name}, I'd like to invite you for a ${type}.`
      });

      alert(response.data?.message || 'Invitation sent successfully!');
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert(error.response?.data?.message || 'Failed to send invitation');
    }
  };

  // Improved experience rendering
  const renderExperience = () => {
    if (!teammate.experience) return null;

    if (Array.isArray(teammate.experience) && teammate.experience.length > 0) {
      return teammate.experience.map((exp, index) => (
        <div key={exp._id || index} className="mb-1">
          <p className="text-gray-300 text-sm">
            <span className="font-medium">{exp.role}</span> at {exp.company} 
            {exp.duration && ` (${exp.duration})`}
          </p>
        </div>
      ));
    }

    if (typeof teammate.experience === 'object') {
      return (
        <p className="text-gray-300 text-sm">
          <span className="font-medium">{teammate.experience.role}</span> at {teammate.experience.company}
          {teammate.experience.duration && ` (${teammate.experience.duration})`}
        </p>
      );
    }

    return <p className="text-gray-300 text-sm">{teammate.experience} years experience</p>;
  };

  return (
    <div className={`bg-gray-800 p-4 rounded-lg shadow-md ${isMatch ? "border-2 border-teal-500" : ""}`}>
      <div className="flex items-start gap-4">
        {/* Profile image with error handling */}
        <div className="relative">
          <img
            src={getProfileImageUrl(teammate.profilePicture)}
            alt={`${teammate.name}'s profile`}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
            onError={(e) => {
              e.target.src = '/default-avatar.png';
            }}
          />
          {isMatch && (
            <div className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Match
            </div>
          )}
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-bold text-teal-400">{teammate.name}</h2>
          <p className="text-gray-300">{teammate.domain}</p>
          {renderExperience()}
          
          {/* Contact information if available */}
          {teammate.contact && (
            <p className="text-gray-400 text-sm mt-1">
              Contact: {teammate.contact}
            </p>
          )}
        </div>
      </div>

      {/* Skills section */}
      {teammate.skills?.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-gray-300 mb-1">Skills:</h3>
          <div className="flex flex-wrap gap-2">
            {teammate.skills.map((skill, index) => (
              <span 
                key={skill._id || index}
                className="bg-gray-700 px-2 py-1 rounded text-sm"
              >
                {typeof skill === 'object' ? skill.name : skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Match details */}
      {isMatch && teammate.matchScore && (
        <div className="mt-3 bg-teal-900 bg-opacity-30 p-2 rounded">
          <p className="text-teal-300 text-sm">
            <span className="font-bold">Match Score:</span> {teammate.matchScore}%
          </p>
          {teammate.matchedSkills?.length > 0 && (
            <p className="text-teal-200 text-xs mt-1">
              <span className="font-medium">Shared skills:</span> {teammate.matchedSkills.join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => sendInvitation("project")}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
        >
          Invite to Project
        </button>
        <button
          onClick={() => sendInvitation("competition")}
          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-medium transition-colors"
        >
          Invite to Competition
        </button>
        <button
          onClick={() => sendInvitation("feedback")}
          className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm font-medium transition-colors"
        >
          Request Feedback
        </button>
      </div>
    </div>
  );
};

export default TeammateCard;