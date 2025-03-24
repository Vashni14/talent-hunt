// components/OpenInvitationModal.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const OpenInvitationModal = ({ onClose }) => {
  const { user } = useAuth();
  const [projectDetails, setProjectDetails] = useState({
    title: '',
    description: '',
    requiredSkills: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/invitations/open', {
        fromUserId: user.uid,
        fromUserName: user.displayName || user.email,
        projectDetails: {
          ...projectDetails,
          requiredSkills: projectDetails.requiredSkills.split(',').map(s => s.trim())
        }
      });
      alert('Open invitation created successfully!');
      onClose();
    } catch (error) {
      alert('Failed to create open invitation');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-teal-400 mb-4">Create Open Invitation</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Project Title</label>
            <input
              type="text"
              value={projectDetails.title}
              onChange={(e) => setProjectDetails({...projectDetails, title: e.target.value})}
              className="w-full p-2 bg-gray-700 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Description</label>
            <textarea
              value={projectDetails.description}
              onChange={(e) => setProjectDetails({...projectDetails, description: e.target.value})}
              className="w-full p-2 bg-gray-700 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Required Skills (comma separated)</label>
            <input
              type="text"
              value={projectDetails.requiredSkills}
              onChange={(e) => setProjectDetails({...projectDetails, requiredSkills: e.target.value})}
              className="w-full p-2 bg-gray-700 rounded"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-teal-600 px-4 py-2 rounded"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OpenInvitationModal;