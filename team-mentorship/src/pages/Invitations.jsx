import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Invitations = () => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');
  const [error, setError] = useState(null);

  // Create axios instance with base URL
  const api = axios.create({
    baseURL: 'http://localhost:5000/api/invites',
  });

  const fetchInvitations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      const endpoint = activeTab === 'received' 
        ? `/received/${user.uid}`
        : `/sent/${user.uid}`;
      
      const response = await api.get(endpoint);
      
      if (response.data?.success && Array.isArray(response.data.data)) {
        setInvitations(response.data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
      setError(error.response?.data?.message || 
               error.message || 
               'Failed to load invitations');
      setInvitations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvitationResponse = async (inviteId, status) => {
    try {
      const response = await api.patch(`/${inviteId}`, {
        status,
        responseMessage: status === 'accepted' 
          ? 'Invitation accepted!' 
          : 'Invitation declined'
      });

      if (response.data?.success) {
        fetchInvitations(); // Refresh the list
      } else {
        throw new Error('Failed to update invitation');
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      setError(error.response?.data?.message || 'Failed to update invitation');
    }
  };

  const cancelInvitation = async (inviteId) => {
    try {
      const response = await api.delete(`/${inviteId}`);

      if (response.data?.success) {
        fetchInvitations(); // Refresh the list
      } else {
        throw new Error('Failed to cancel invitation');
      }
    } catch (error) {
      console.error('Error canceling invitation:', error);
      setError(error.response?.data?.message || 'Failed to cancel invitation');
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [activeTab, user?.uid]);

  return (
    <div className="p-4">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "received" 
              ? "text-blue-600 border-b-2 border-blue-600" 
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("received")}
        >
          Received
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "sent" 
              ? "text-blue-600 border-b-2 border-blue-600" 
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("sent")}
        >
          Sent
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
                <button 
                  onClick={fetchInvitations}
                  className="ml-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {invitations.length > 0 ? (
            invitations.map((invite) => (
              <div key={invite._id} className="bg-white shadow rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {activeTab === "received" ? invite.senderName : invite.receiverName}
                    </h3>
                    <p className="text-gray-600 capitalize">{invite.type}</p>
                    <p className="text-gray-500 text-sm mt-1">{invite.message}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    invite.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    invite.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    invite.status === 'declined' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {invite.status}
                  </span>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  {activeTab === "received" && invite.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleInvitationResponse(invite._id, "accepted")}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleInvitationResponse(invite._id, "declined")}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {activeTab === "sent" && invite.status === "pending" && (
                    <button
                      onClick={() => cancelInvitation(invite._id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {invite.responseMessage && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <span className="font-medium text-gray-700">Response:</span> {invite.responseMessage}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No invitations</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === "received" 
                  ? "You haven't received any invitations yet." 
                  : "You haven't sent any invitations yet."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Invitations;