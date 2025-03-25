import React from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const TeammateCard = ({ teammate, isMatch = false, currentUserId }) => {
  if (teammate.uid === currentUserId) return null;
  const { user } = useAuth();
  const isCurrentUser = user?.uid === teammate.uid;

  // Enhanced image URL handling with Vite environment variables
  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return '/default-avatar.png';
    if (imagePath.startsWith('http')) return imagePath;
    
    const baseUrl =  'http://localhost:5000';
    return `${baseUrl}${imagePath}`;
  };

  const sendInvitation = async (type) => {
    try {
      if (!user?.uid || !teammate?.uid) {
        throw new Error("User authentication required");
      }

      if (isCurrentUser) {
        throw new Error("Cannot invite yourself");
      }

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.post(
        `${apiUrl}/api/invites`,
        {
          senderId: user.uid, 
          senderName: user.displayName || user.email, 
          receiverId: teammate.uid, 
          receiverName: teammate.name, 
          type,
          message: `Hi ${teammate.name}, I'd like to collaborate on a ${type} project.`
        },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      alert(response.data?.message || 'Invitation sent successfully!');
    } catch (error) {
      console.error('Invitation error:', error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to send invitation';
      alert(errorMessage);
    }
  };

  // Enhanced experience rendering
  const renderExperience = () => {
    if (!teammate.experience) return null;

    const experiences = Array.isArray(teammate.experience) 
      ? teammate.experience 
      : [teammate.experience];

    return experiences.map((exp, index) => (
      <div key={`exp-${index}`} className="mb-1">
        <p className="text-gray-300 text-sm">
          <span className="font-medium">{exp.role || 'Unknown role'}</span>
          {exp.company && ` at ${exp.company}`}
          {exp.duration && ` (${exp.duration})`}
        </p>
      </div>
    ));
  };

  // Enhanced skills rendering
  const renderSkills = () => {
    if (!teammate.skills?.length) return null;

    return (
      <div className="mt-3">
        <h3 className="font-semibold text-gray-300 mb-1">Skills:</h3>
        <div className="flex flex-wrap gap-2">
          {teammate.skills.map((skill, index) => (
            <span 
              key={`skill-${index}`}
              className="bg-gray-700 px-2 py-1 rounded text-sm"
            >
              {typeof skill === 'object' ? skill.name : skill}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-gray-800 p-4 rounded-lg shadow-md ${isMatch ? "border-2 border-teal-500" : ""}`}>
      <div className="flex items-start gap-4">
        {/* Profile image with better error handling */}
        <div className="relative flex-shrink-0">
          <img
            src={getProfileImageUrl(teammate.profilePicture)}
            alt={`${teammate.name}'s profile`}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-600"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-avatar.png';
              e.target.className = 'w-16 h-16 rounded-full object-cover border-2 border-gray-600 bg-gray-700';
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
          <p className="text-gray-300">{teammate.domain || 'No domain specified'}</p>
          {renderExperience()}
          
          {/* Contact information */}
          {(teammate.contact || teammate.email) && (
            <p className="text-gray-400 text-sm mt-1">
              Contact: {teammate.contact || teammate.email}
            </p>
          )}
        </div>
      </div>

      {renderSkills()}

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

      {/* Action buttons - only show if not current user */}
      {!isCurrentUser && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => sendInvitation("project")}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
            disabled={!user} // Disable if not logged in
          >
            Invite to Project
          </button>
          <button
            onClick={() => sendInvitation("competition")}
            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-medium transition-colors"
            disabled={!user}
          >
            Invite to Competition
          </button>
          <button
            onClick={() => sendInvitation("feedback")}
            className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm font-medium transition-colors"
            disabled={!user}
          >
            Request Feedback
          </button>
        </div>
      )}
    </div>
  );
};

export default TeammateCard;