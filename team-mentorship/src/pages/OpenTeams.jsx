"use client"
import { useState, useEffect, useCallback } from "react";
import {
  FaSearch, FaFilter, FaUserPlus, FaTimes, FaChevronDown,
  FaUsers, FaEnvelope, FaCheck, FaClock, FaPlus, FaCalendarAlt,
  FaProjectDiagram, FaTrash, FaEdit, FaUser, FaChevronRight, FaComment,
  FaInbox, FaPaperPlane, FaLink, FaUserCircle, FaSpinner, FaInfoCircle,
  FaExclamationTriangle, FaRegCheckCircle, FaRegTimesCircle
} from "react-icons/fa";
import axios from "axios";
import { toast } from 'react-hot-toast';
import { auth } from "../config/firebase";
import MyTeams from "./MyTeams";

// Constants
const ALL_SKILLS = [
  "JavaScript", "React", "Node.js", "Python", "Data Science",
  "UI/UX Design", "Machine Learning", "Mobile Development", "DevOps",
  "GraphQL", "TypeScript", "AWS", "Docker", "Kubernetes", "CI/CD"
];

const APPLICATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
};

// Helper function to handle API errors
const handleApiError = (error, setError) => {
  console.error(error);
  const message = error.response?.data?.error || error.message || "Something went wrong";
  setError(message);
  toast.error(message);
  return null;
};

// TeamOpeningCard Component (unchanged)
function TeamOpeningCard({ opening, onView, onApply, isOwner }) {
  const deadline = new Date(opening.deadline);
  const isExpired = new Date() > deadline;
  
  return (
    <div className={`bg-gray-800 rounded-lg border ${isExpired ? 'border-red-500/30' : 'border-gray-700 hover:border-blue-500/30'} transition-all duration-300 w-full h-full flex flex-col`}>
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-white truncate">{opening.team?.name}</h3>
              {isExpired && (
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                  Expired
                </span>
              )}
            </div>
            <p className="text-sm text-blue-400 truncate">{opening.title}</p>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col overflow-hidden">
        <div className="mb-3 flex-1 overflow-y-auto pr-2">
          <p className="text-sm text-gray-300 line-clamp-4">{opening.description}</p>
        </div>

        <div className="mb-3 overflow-x-auto whitespace-nowrap pb-1">
          {opening.skillsNeeded?.map((skill, index) => (
            <span key={index} className="inline-block px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300 mr-2 last:mr-0">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-gray-700 bg-gray-800/50 flex justify-between items-center">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <FaUsers size={12} />
            {opening.seatsAvailable} seat{opening.seatsAvailable !== 1 ? 's' : ''} available
          </span>
          <span className={`flex items-center gap-1 ${isExpired ? 'text-red-400' : ''}`}>
            <FaCalendarAlt size={12} />
            {deadline.toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex gap-2">
          <button 
            className="text-xs text-gray-300 hover:text-blue-400 px-2 py-1"
            onClick={(e) => {
              e.stopPropagation();
              onView(opening);
            }}
          >
            Details
          </button>
          {!isOwner && !isExpired && (
            <button 
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors disabled:opacity-50"
              onClick={(e) => {
                e.stopPropagation();
                onApply(opening);
              }}
              disabled={opening.seatsAvailable <= 0}
            >
              {opening.seatsAvailable > 0 ? 'Apply' : 'Full'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ApplicationCard Component (unchanged)
function ApplicationCard({ application, onAction, isReceived = false }) {
  const statusIcons = {
    [APPLICATION_STATUS.PENDING]: <FaClock className="text-yellow-400" />,
    [APPLICATION_STATUS.ACCEPTED]: <FaRegCheckCircle className="text-green-400" />,
    [APPLICATION_STATUS.REJECTED]: <FaRegTimesCircle className="text-red-400" />,
    [APPLICATION_STATUS.WITHDRAWN]: <FaInfoCircle className="text-gray-400" />
  };

  return (
    <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 hover:border-gray-500 transition-colors">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="truncate">
              <p className="font-medium text-white truncate">
                {isReceived ? application.applicant?.name : application.opening?.team?.name}
              </p>
              <p className="text-xs text-gray-400">
                Applied {new Date(application.appliedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {statusIcons[application.status]}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                application.status === APPLICATION_STATUS.PENDING ? "bg-yellow-500/20 text-yellow-400" :
                application.status === APPLICATION_STATUS.ACCEPTED ? "bg-green-500/20 text-green-400" :
                application.status === APPLICATION_STATUS.REJECTED ? "bg-red-500/20 text-red-400" :
                "bg-gray-500/20 text-gray-400"
              }`}>
                {application.status}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-300 mt-1 line-clamp-2">{application.message}</p>
          
          {application.skills?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {application.skills.slice(0, 3).map((skill, index) => (
                <span key={index} className="text-xs px-2 py-0.5 bg-gray-600 rounded-full text-gray-300">
                  {skill}
                </span>
              ))}
              {application.skills.length > 3 && (
                <span className="text-xs px-2 py-0.5 bg-gray-600 rounded-full text-gray-300">
                  +{application.skills.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        {isReceived && application.status === APPLICATION_STATUS.PENDING && (
          <div className="flex gap-2">
            <button
              onClick={() => onAction(application._id, APPLICATION_STATUS.REJECTED)}
              className="text-xs px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
            >
              Reject
            </button>
            <button
              onClick={() => onAction(application._id, APPLICATION_STATUS.ACCEPTED)}
              className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
            >
              Accept
            </button>
          </div>
        )}
        
        {!isReceived && application.status === APPLICATION_STATUS.PENDING && (
          <button
            onClick={() => onAction(application._id)}
            className="text-xs px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
          >
            Withdraw
          </button>
        )}
        
        <div className="flex gap-2">
          <button
            className="text-xs px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded flex items-center gap-1 transition-colors"
            onClick={() => handleViewProfile(isReceived ? application.applicant?._id : application.opening?.team)}
          >
            <FaUser size={10} /> Profile
          </button>
          <button
            className="text-xs px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded flex items-center gap-1 transition-colors"
            onClick={() => handleStartChat(isReceived ? application.applicant?._id : application.opening?.createdBy)}
          >
            <FaComment size={10} /> Chat
          </button>
        </div>
      </div>
    </div>
  );
}

// TeamCard Component (modified to show openings count)
function TeamCard({ team, onManage }) {
  const memberPercentage = Math.round((team.currentMembers / team.maxMembers) * 100);
  
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500/30 transition-colors p-4 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate">{team.name}</h3>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              team.status === 'recruiting' ? 'bg-blue-500/20 text-blue-400' :
              team.status === 'active' ? 'bg-green-500/20 text-green-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {team.status}
            </span>
            {team.openingsCount > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                {team.openingsCount} opening{team.openingsCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-300 line-clamp-2">{team.description}</p>
      </div>
      
      <div className="mt-auto">
        <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
          <span>
            <FaUsers className="inline mr-1" />
            {team.currentMembers}/{team.maxMembers} members
          </span>
          <span>{memberPercentage}% full</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5 mb-3">
          <div 
            className="bg-blue-600 h-1.5 rounded-full" 
            style={{ width: `${memberPercentage}%` }}
          ></div>
        </div>
        
        <button 
          onClick={() => onManage(team)}
          className="w-full text-center text-sm py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
        >
          Manage Team
        </button>
      </div>
    </div>
  );
}

// New component for TeamOpeningItem
function TeamOpeningItem({ opening, onView, onEdit, onDelete }) {
  const deadline = new Date(opening.deadline);
  const isExpired = new Date() > deadline;
  
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-blue-500/30 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium text-white">{opening.title}</h3>
          <p className="text-xs text-gray-400">
            Posted {new Date(opening.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(opening)}
            className="text-gray-400 hover:text-blue-400 p-1"
          >
            <FaEdit size={14} />
          </button>
          <button 
            onClick={() => onDelete(opening._id)}
            className="text-gray-400 hover:text-red-400 p-1"
          >
            <FaTrash size={14} />
          </button>
        </div>
      </div>
      
      <div className="mb-3">
        <p className="text-sm text-gray-300 line-clamp-2">{opening.description}</p>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {opening.skillsNeeded?.map((skill, index) => (
          <span key={index} className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-300">
            {skill}
          </span>
        ))}
      </div>
      
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-3 text-gray-400">
          <span className="flex items-center gap-1">
            <FaUsers size={10} />
            {opening.seatsAvailable} seat{opening.seatsAvailable !== 1 ? 's' : ''}
          </span>
          <span className={`flex items-center gap-1 ${isExpired ? 'text-red-400' : ''}`}>
            <FaCalendarAlt size={10} />
            {deadline.toLocaleDateString()}
          </span>
        </div>
        <button 
          onClick={() => onView(opening)}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default function OpenTeams() {
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [selectedOpening, setSelectedOpening] = useState(null);
  const [activeTab, setActiveTab] = useState("find");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState({
    teams: false,
    openings: false,
    applications: false,
    myOpenings: false
  });
  
  // Data states
  const [myTeams, setMyTeams] = useState([]);
  const [myOpenings, setMyOpenings] = useState([]); // New state for user's posted openings
  const [openings, setOpenings] = useState([]);
  const [sentApplications, setSentApplications] = useState([]);
  const [receivedApplications, setReceivedApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter states
  const [applicationsTab, setApplicationsTab] = useState("received");
  const [sentFilter, setSentFilter] = useState("all");
  const [receivedTeamFilter, setReceivedTeamFilter] = useState("all");
  const [receivedStatusFilter, setReceivedStatusFilter] = useState("all");
  const [userId, setUserId] = useState(null);

  // Team creation form state
  const [teamForm, setTeamForm] = useState({
    team: "",
    title: "",
    description: "",
    skillsNeeded: [],
    seatsAvailable: 1,
    deadline: "",
    contactEmail: "",
    status: "open"
  });

  const user = auth.currentUser;
  // At the top of your component
const [authInitialized, setAuthInitialized] = useState(false);

// Auth state listener
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("User authenticated:", user.uid);
      setUserId(user.uid); // Make sure this is setting properly
    } else {
      console.log("No user authenticated");
      setUserId(null);
    }
    setAuthInitialized(true);
  });
  
  return () => unsubscribe();
}, []);

  useEffect(() => {
    if (user) {
      setUserId(user.uid);
      fetchMyTeams();
      fetchMyOpenings(); // Fetch user's posted openings
    }
  }, [user]);

  // Fetch user's teams (for dropdown in create opening form)
  const fetchMyTeams = async () => {
    try {
      if (!userId) {
        console.log('No user ID available');
        return;
      }
  
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/teams/user/${userId}`);
  
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch teams');
      }
  
      const responseData = await response.json();
      console.log("data from backend", responseData);
  
      // Handle both direct array response and success/data pattern
      let teamsData = [];
      if (Array.isArray(responseData)) {
        teamsData = responseData;
      } else if (responseData.success && Array.isArray(responseData.data)) {
        teamsData = responseData.data;
      }
  
      // More robust filtering
      const myTeams = teamsData.filter(team => {
        // Handle both string and object createdBy formats
        const createdById = typeof team.createdBy === 'object' 
          ? team.createdBy._id 
          : team.createdBy;
        
        return createdById === userId;
      });
  
      console.log("filtered teams", myTeams);
      setMyTeams(myTeams);
      
    } catch (err) {
      console.error('Error in fetchMyTeams:', err);
      setError(err.message);
      setMyTeams([]);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchMyTeams();
  }, [userId]);
  // Fetch user's posted openings (for My Teams tab)
 // In the fetchMyOpenings function:
 const fetchMyOpenings = async () => {
  console.log("Current userId when fetching:", userId);
  
  if (!userId) {
    console.warn("Skipping fetch - no userId available");
    return; // Exit gracefully
  }

  try {
    setLoading(prev => ({ ...prev, myOpenings: true }));
    setError(null);
    
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      throw new Error("No authentication token available");
    }

    const response = await axios.get(
      `http://localhost:5000/api/invitations/openings/user/${userId}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      }
    );

    console.log("API response:", response.data);
    setMyOpenings(Array.isArray(response.data) ? response.data : []);
    
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    setError(error.response?.data?.error || error.message);
    setMyOpenings([]);
    if (!error.message.includes("User ID")) {
      toast.error("Failed to load openings");
    }
  } finally {
    setLoading(prev => ({ ...prev, myOpenings: false }));
  }
};

const fetchSentApplications = useCallback(async () => {
  try {
    if (!userId) {
      console.warn("No userId - skipping fetch");
      return;
    }

    setLoading(prev => ({ ...prev, applications: true }));
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      throw new Error("No authentication token available");
    }

    const response = await axios.get(
      `http://localhost:5000/api/invitations/applications/sent/${userId}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      }
    );
    
    setSentApplications(response.data || []);
  } catch (error) {
    console.error("Fetch error:", error);
    setError(error.response?.data?.error || error.message);
    setSentApplications([]);
  } finally {
    setLoading(prev => ({ ...prev, applications: false }));
  }
}, [userId]); // Add userId as dependency

const fetchReceivedApplications = useCallback(async () => {
  try {
    if (!userId) {
      console.warn("No userId - skipping fetch");
      return;
    }

    setLoading(prev => ({ ...prev, applications: true }));
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      throw new Error("No authentication token available");
    }

    const response = await axios.get(
      `http://localhost:5000/api/invitations/applications/received/${userId}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      }
    );
    
    setReceivedApplications(response.data || []);
  } catch (error) {
    console.error("Fetch error:", error);
    setError(error.response?.data?.error || error.message);
    setReceivedApplications([]);
  } finally {
    setLoading(prev => ({ ...prev, applications: false }));
  }
}, [userId]); // Add userId as dependency
useEffect(() => {
  if (authInitialized && userId) {
    console.log("Fetching data for user:", userId);
    fetchMyOpenings();
    fetchSentApplications();
    fetchReceivedApplications();
    // Add other fetch calls here if needed
  } else if (authInitialized) {
    console.log("User not authenticated - clearing data");
    setMyOpenings([]);
    setSentApplications([])
    setReceivedApplications([])
  }
}, [authInitialized, userId]); // Only run when these change

  const fetchOpenings = useCallback(async () => {
    setLoading(prev => ({ ...prev, openings: true }));
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedSkills.length) params.skills = selectedSkills.join(',');
      
      const response = await axios.get('http://localhost:5000/api/invitations/openings', { params });
      
      // Filter out openings created by the current user
      const filteredOpenings = Array.isArray(response?.data) 
        ? response.data.filter(opening => {
            // Handle both string and object createdBy formats
            const createdById = typeof opening.createdBy === 'object' 
              ? opening.createdBy._id 
              : opening.createdBy;
            return createdById !== userId;
          })
        : [];
      
      setOpenings(filteredOpenings);
    } catch (error) {
      handleApiError(error, setError);
      setOpenings([]);
    } finally {
      setLoading(prev => ({ ...prev, openings: false }));
    }
  }, [searchQuery, selectedSkills, userId]); // Added userId to dependencies

  // Create new team opening
  const saveTeamOpening = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
  
      const token = await user.getIdToken();
      const endpoint = selectedOpening 
        ? `http://localhost:5000/api/invitations/openings/${selectedOpening._id}`
        : 'http://localhost:5000/api/invitations/teams/openings';
  
      const method = selectedOpening ? 'put' : 'post';
  
      const response = await axios[method](
        endpoint,
        {
          team: teamForm.team,
          title: teamForm.title,
          description: teamForm.description,
          skillsNeeded: teamForm.skillsNeeded,
          seatsAvailable: teamForm.seatsAvailable,
          deadline: teamForm.deadline,
          contactEmail: teamForm.contactEmail,
          status: teamForm.status,
          createdBy: userId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.status >= 200 && response.status < 300) {
        toast.success(`Opening ${selectedOpening ? 'updated' : 'created'} successfully!`);
        setShowCreateTeamModal(false);
        setTeamForm({
          team: "",
          title: "",
          description: "",
          skillsNeeded: [],
          seatsAvailable: 1,
          deadline: "",
          contactEmail: "",
          status: "open"
        });
        setSelectedOpening(null);
        fetchOpenings();
        fetchMyOpenings();
      } else {
        throw new Error(response.data?.error || `Failed to ${selectedOpening ? 'update' : 'create'} opening`);
      }
    } catch (error) {
      console.error('Error saving opening:', error);
      const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         error.message;
      toast.error(`Error: ${errorMessage}`);
    }
  };

  // Delete a team opening
  const deleteTeamOpening = async (openingId) => {
    try {
      console.log(openingId)
      await axios.delete(`http://localhost:5000/api/invitations/openings/${openingId}`);
      toast.success('Opening deleted successfully');
      fetchMyOpenings(); // Refresh the list
    } catch (error) {
      handleApiError(error, setError);
    }
  };

  const applyToOpening = async (openingId, message) => {
    try {
      if (!user) {
        throw new Error("You must be logged in to apply");
      }
  
      const token = await user.getIdToken();
      console.log("Sending application with:", { 
        openingId, 
        message,
        userId,
        token: token ? "exists" : "missing"
      });
  
      const response = await axios.post(
        `http://localhost:5000/api/invitations/openings/${openingId}/apply`, // Fixed endpoint
        { 
          message,
          userId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
  
      console.log("Application successful:", response.data);
      setSentApplications(prev => [...prev, response.data.application]);
      toast.success(`Application submitted!`);
      return response.data;
  
    } catch (error) {
      console.error("Full error details:", {
        error: error.response?.data || error.message,
        config: error.config
      });
      
      const errorMessage = error.response?.data?.error || 
                         error.message || 
                         'Failed to submit application';
      
      toast.error(errorMessage);
      setError(errorMessage);
      return null;
    }
  };
  // Update application status
  const updateApplicationStatus = async (applicationId, status) => {
    try {
      if (!user) throw new Error("User not authenticated");
      const token = await user.getIdToken();
  
      const response = await axios.put(`http://localhost:5000/api/invitations/applications/${applicationId}`, { status },
     {
             headers: {
               'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
             }
           });
      fetchReceivedApplications();
      toast.success(`Application ${status}`);
      return response.data;
    } catch (error) {
      handleApiError(error, setError);
      return null;
    }
  };

  // Withdraw application
  const withdrawApplication = async (applicationId) => {
    try {
      await axios.delete(`http://localhost:5000/api/invitations/api/applications/${applicationId}`);
      setSentApplications(prev => prev.filter(app => app._id !== applicationId));
      toast.success('Application withdrawn');
      return true;
    } catch (error) {
      handleApiError(error, setError);
      return false;
    }
  };

  // Handle application submission
  const handleApply = async (opening) => {
    setSelectedOpening(opening);
    setShowJoinModal(true);
  };

  // Submit application
  const handleSubmitApplication = async () => {
    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    const result = await applyToOpening(selectedOpening._id, message);
    if (result) {
      setShowJoinModal(false);
      setMessage("");
    }
  };

  // Handle application action (accept/reject/withdraw)
  const handleApplicationAction = async (applicationId, action) => {
    if (action) {
      await updateApplicationStatus(applicationId, action);
    } else {
      await withdrawApplication(applicationId);
    }
  };

  // View profile handler
  const handleViewProfile = (userId) => {
    console.log(`Viewing profile of user ${userId}`);
  };

  // Start chat handler
  const handleStartChat = (userId) => {
    console.log(`Starting chat with user ${userId}`);
  };

  // View opening details
  const handleViewOpening = (opening) => {
    setSelectedOpening(opening);
    setShowViewModal(true);
  };

  // Edit opening handler
  const handleEditOpening = (opening) => {
    console.log("Editing opening:", opening); // Debug log
    console.log("Contact email from opening:", opening.contactEmail); // Debug contact email
    
    setSelectedOpening(opening);
    setTeamForm({
      team: opening.team?._id || opening.team || "",
      title: opening.title,
      description: opening.description,
      skillsNeeded: opening.skillsNeeded || [],
      seatsAvailable: opening.seatsAvailable,
      deadline: opening.deadline ? new Date(opening.deadline).toISOString().slice(0, 16) : "",
      contactEmail: opening.contactEmail || "", // Explicit fallback
      status: opening.status || "open"
    });
    setShowCreateTeamModal(true);
  };

  // Toggle skill selection
  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  // Check if user owns a team
  const isTeamOwner = (teamId) => {
    return myTeams.some(team => team._id === teamId);
  };

  // Initialize data
  useEffect(() => {
    fetchOpenings();
  }, [fetchOpenings]);

  // Filter applications
  const filteredSentApplications = sentApplications.filter(app => {
    if (sentFilter === "all") return true;
    return app?.status === sentFilter;
  });

  const filteredReceivedApplications = receivedApplications.filter(app => {
    if (receivedTeamFilter !== "all") {
      const teamMatch = app.opening?.team === receivedTeamFilter;
      if (!teamMatch) return false;
    }
    if (receivedStatusFilter !== "all") {
      return app?.status === receivedStatusFilter;
    }
    return true;
  });

  // Filter openings based on search and selected skills
  const filteredOpenings = openings.filter(opening => {
    const matchesSearch = 
      opening.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opening.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opening.team?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSkills = 
      selectedSkills.length === 0 || 
      selectedSkills.some(skill => opening.skillsNeeded?.includes(skill));

    return matchesSearch && matchesSkills;
  });

  return (
    <div className="p-4 md:p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white">OpenTeams</h1>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('applications')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors border border-gray-700"
            >
              <FaInbox /> Applications
            </button>
            <button
              onClick={() => setShowCreateTeamModal(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaPlus /> Create Opening
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg flex items-center gap-2">
            <FaExclamationTriangle />
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
          <button
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === "find" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
            onClick={() => setActiveTab("find")}
          >
            <FaSearch className="inline mr-2" /> Find Openings
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === "my" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
            onClick={() => setActiveTab("my")}
          >
            <FaUsers className="inline mr-2" /> My Openings
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === "applications" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
            onClick={() => setActiveTab("applications")}
          >
            <FaInbox className="inline mr-2" /> Applications
          </button>
        </div>

        {/* Find Openings Tab */}
        {activeTab === "find" && (
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            {/* Filters Sidebar */}
            <div className="w-full lg:w-1/4 space-y-4">
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search openings..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyUp={(e) => e.key === 'Enter' && fetchOpenings()}
                  />
                  <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center mb-4">
                  <FaFilter className="text-gray-400 mr-2" />
                  <h2 className="text-white font-medium">Filter by Skills</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ALL_SKILLS.map(skill => (
                    <button
                      key={skill}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedSkills.includes(skill)
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
                      }`}
                      onClick={() => {
                        toggleSkill(skill);
                        fetchOpenings();
                      }}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
                {selectedSkills.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedSkills([]);
                      fetchOpenings();
                    }}
                    className="mt-3 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <FaTimes size={10} /> Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Openings List */}
            <div className="w-full lg:w-3/4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">
                  {filteredOpenings.length} Opening{filteredOpenings.length !== 1 ? 's' : ''} Found
                </h2>
                <button
                  onClick={fetchOpenings}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                  disabled={loading.openings}
                >
                  {loading.openings ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaSearch size={10} />
                  )}
                  Refresh
                </button>
              </div>
              
              {loading.openings ? (
                <div className="flex justify-center items-center h-64">
                  <FaSpinner className="animate-spin text-blue-400 text-2xl" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOpenings.length > 0 ? (
                    filteredOpenings.map(opening => (
                      <TeamOpeningCard 
                        key={opening._id}
                        opening={opening}
                        onView={handleViewOpening}
                        onApply={handleApply}
                        isOwner={isTeamOwner(opening.team?._id)}
                      />
                    ))
                  ) : (
                    <div className="col-span-full bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
                      <FaSearch className="mx-auto text-gray-500 text-3xl mb-3" />
                      <p className="text-gray-400">No openings found matching your criteria.</p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedSkills([]);
                          fetchOpenings();
                        }}
                        className="mt-3 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Openings Tab */}
        {activeTab === "my" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                My Posted Openings ({myOpenings.length})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={fetchMyOpenings}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                  disabled={loading.myOpenings}
                >
                  {loading.myOpenings ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaSearch size={10} />
                  )}
                  Refresh
                </button>
                <button
                  onClick={() => setShowCreateTeamModal(true)}
                  className="text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded flex items-center gap-1"
                >
                  <FaPlus size={10} /> New Opening
                </button>
              </div>
            </div>
            
{loading.myOpenings ? (
  <div className="flex justify-center items-center h-64">
    <FaSpinner className="animate-spin text-blue-400 text-2xl" />
  </div>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Safely handle myOpenings even if it's not an array */}
    {Array.isArray(myOpenings) && myOpenings.length > 0 ? (
      myOpenings.map(opening => (
        <TeamOpeningItem 
          key={opening._id}
          opening={opening}
          onView={handleViewOpening}
          onEdit={handleEditOpening}
          onDelete={deleteTeamOpening}
        />
      ))
    ) : (
      <div className="col-span-full bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
        <FaProjectDiagram className="mx-auto text-gray-500 text-3xl mb-3" />
        <p className="text-gray-400">You haven't posted any openings yet.</p>
        <button
          onClick={() => setShowCreateTeamModal(true)}
          className="mt-4 flex items-center gap-1 mx-auto text-blue-400 hover:text-blue-300 text-sm px-4 py-2 bg-gray-700 rounded-lg"
        >
          <FaPlus /> Create Your First Opening
        </button>
      </div>
    )}
  </div>
)}
          </div>
        )}

        {/* Applications Tab (unchanged) */}
        {activeTab === "applications" && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="flex border-b border-gray-700">
              <button
                className={`px-4 py-3 font-medium text-sm flex-1 text-center ${applicationsTab === "received" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
                onClick={() => (setApplicationsTab("received"), fetchReceivedApplications())}
              >
                <FaInbox className="inline mr-2" /> Received ({receivedApplications.length})
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm flex-1 text-center ${applicationsTab === "sent" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
                onClick={() => (setApplicationsTab("sent"), fetchSentApplications())}
              >
                <FaPaperPlane className="inline mr-2" /> Sent ({sentApplications.length})
              </button>
            </div>
            
            <div className="p-4">
              {loading.applications ? (
                <div className="flex justify-center items-center h-64">
                  <FaSpinner className="animate-spin text-blue-400 text-2xl" />
                </div>
              ) : applicationsTab === "received" ? (
                <div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                    <h3 className="text-sm font-medium text-gray-300">
                      Applications to your teams
                    </h3>
                    <div className="flex gap-2 w-full md:w-auto">
                      <div className="relative flex-1 md:flex-none">
                        <select
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-xs appearance-none pr-7"
                          value={receivedTeamFilter}
                          onChange={(e) => setReceivedTeamFilter(e.target.value)}
                        >
                          <option value="all">All Teams</option>
                          {myTeams.map(team => (
                            <option key={team._id} value={team._id}>{team.name}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <FaChevronDown className="text-gray-400 text-xs" />
                        </div>
                      </div>
                      <div className="relative flex-1 md:flex-none">
                        <select
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-xs appearance-none pr-7"
                          value={receivedStatusFilter}
                          onChange={(e) => setReceivedStatusFilter(e.target.value)}
                        >
                          <option value="all">All Status</option>
                          <option value={APPLICATION_STATUS.PENDING}>Pending</option>
                          <option value={APPLICATION_STATUS.ACCEPTED}>Accepted</option>
                          <option value={APPLICATION_STATUS.REJECTED}>Rejected</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <FaChevronDown className="text-gray-400 text-xs" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {filteredReceivedApplications.length > 0 ? (
                    <div className="space-y-3">
                      {filteredReceivedApplications.map(app => (
                        <ApplicationCard 
                          key={app._id}
                          application={app}
                          onAction={handleApplicationAction}
                          isReceived={true}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaInbox className="mx-auto text-gray-500 text-3xl mb-3" />
                      <p className="text-gray-400">
                        {receivedApplications.length === 0 ? 
                          "No applications received yet" : 
                          "No applications match your filters"}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                    <h3 className="text-sm font-medium text-gray-300">
                      Your sent applications
                    </h3>
                    <div className="relative w-full md:w-auto">
                      <select
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-xs appearance-none pr-7"
                        value={sentFilter}
                        onChange={(e) => setSentFilter(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value={APPLICATION_STATUS.PENDING}>Pending</option>
                        <option value={APPLICATION_STATUS.ACCEPTED}>Accepted</option>
                        <option value={APPLICATION_STATUS.REJECTED}>Rejected</option>
                        <option value={APPLICATION_STATUS.WITHDRAWN}>Withdrawn</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <FaChevronDown className="text-gray-400 text-xs" />
                      </div>
                    </div>
                  </div>
                  
                  {filteredSentApplications.length > 0 ? (
                    <div className="space-y-3">
                      {filteredSentApplications.map(app => (
                        <ApplicationCard 
                          key={app._id}
                          application={app}
                          onAction={handleApplicationAction}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaPaperPlane className="mx-auto text-gray-500 text-3xl mb-3" />
                      <p className="text-gray-400">
                        {sentApplications.length === 0 ? 
                          "You haven't sent any applications yet" : 
                          "No applications match your filters"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Opening Modal (unchanged) */}
        {showViewModal && selectedOpening && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{selectedOpening.title}</h2>
                    <p className="text-xs text-gray-400">{selectedOpening.team?.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes size={18} />
                </button>
              </div>
              
              <div className="overflow-y-auto p-6 flex-1">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <FaProjectDiagram /> Details
                    </h3>
                    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                      <p className="text-sm text-gray-300 whitespace-pre-line">
                        {selectedOpening.description || "No description provided"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                      <h4 className="text-xs font-medium text-gray-400 mb-1">Team</h4>
                      <p className="text-sm text-white">{selectedOpening.team?.name}</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                      <h4 className="text-xs font-medium text-gray-400 mb-1">Available Seats</h4>
                      <p className="text-sm text-white">
                        {selectedOpening.seatsAvailable} remaining
                      </p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                      <h4 className="text-xs font-medium text-gray-400 mb-1">Deadline</h4>
                      <p className="text-sm text-white">
                        {new Date(selectedOpening.deadline).toLocaleDateString()} -{' '}
                        {new Date(selectedOpening.deadline) > new Date() ? (
                          <span className="text-green-400">
                            {Math.ceil((new Date(selectedOpening.deadline) - new Date()) / (1000 * 60 * 60 * 24))} days left
                          </span>
                        ) : (
                          <span className="text-red-400">Expired</span>
                        )}
                      </p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                      <h4 className="text-xs font-medium text-gray-400 mb-1">Posted By</h4>
                      <div className="flex items-center gap-2">
                        <img
                          src={selectedOpening.createdBy?.profilePicture || "/default-profile.png"}
                          alt={selectedOpening.createdBy?.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <p className="text-sm text-white">
                          {selectedOpening.createdBy?.name || "Team Owner"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <FaCheck /> Skills Needed
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedOpening.skillsNeeded?.length > 0 ? (
                        selectedOpening.skillsNeeded.map((skill, index) => (
                          <span key={index} className="px-3 py-1.5 bg-gray-700 rounded-full text-xs font-medium text-gray-300">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-gray-400">No specific skills required</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-700 sticky bottom-0 bg-gray-800">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      window.open(`/teams/${selectedOpening.team?._id}`, '_blank');
                    }}
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    View Team Page <FaChevronRight size={12} />
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="px-4 py-2 text-sm text-white bg-gray-700 rounded-lg hover:bg-gray-600"
                    >
                      Close
                    </button>
                    {!isTeamOwner(selectedOpening.team?._id) && (
                      <button
                        onClick={() => {
                          setShowViewModal(false);
                          setShowJoinModal(true);
                        }}
                        className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        disabled={new Date(selectedOpening.deadline) < new Date() || selectedOpening.seatsAvailable <= 0}
                      >
                        {selectedOpening.seatsAvailable > 0 ? 'Apply to Join' : 'No Seats Available'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Join Team Modal (unchanged) */}
        {showJoinModal && selectedOpening && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Apply to {selectedOpening.title}</h2>
                  <p className="text-sm text-gray-400">{selectedOpening.team?.name}</p>
                </div>
                <button 
                  onClick={() => setShowJoinModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Message <span className="text-gray-500">(required)</span>
                </label>
                <textarea
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setError("");
                  }}
                  placeholder="Tell them why you'd be a good fit..."
                />
                {error && (
                  <p className="text-xs text-red-400 mt-1">{error}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Your Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedOpening.skillsNeeded?.map((skill, index) => (
                    <span key={index} className={`px-2 py-1 rounded-full text-xs ${
                      message.toLowerCase().includes(skill.toLowerCase()) ? 
                        'bg-blue-600 text-white' : 
                        'bg-gray-700 text-gray-300'
                    }`}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 text-sm text-white bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitApplication}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={!message.trim()}
                >
                  Submit Application
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Team Opening Modal */}
        {showCreateTeamModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
                <h2 className="text-lg font-semibold text-white">
                  {selectedOpening ? "Edit Team Opening" : "Create New Team Opening"}
                </h2>
                <button 
                  onClick={() => {
                    setShowCreateTeamModal(false);
                    setSelectedOpening(null);
                    setTeamForm({
                      team: "",
                      title: "",
                      description: "",
                      skillsNeeded: [],
                      seatsAvailable: 1,
                      deadline: "",
                      contactEmail: "",
                      status: "open"
                    });
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes size={18} />
                </button>
              </div>
              
              <div className="overflow-y-auto p-4 flex-1">
                <form className="space-y-4">
                  {/* Team Selection Dropdown */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Team <span className="text-red-400">*</span>
                    </label>
                    <select
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={teamForm.team}
                      onChange={(e) => setTeamForm({...teamForm, team: e.target.value})}
                      required
                    >
                      <option value="">Select a team</option>
                      {myTeams.map(team => (
                        <option key={team._id} value={team._id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Opening Title */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Opening Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={teamForm.title}
                      onChange={(e) => setTeamForm({...teamForm, title: e.target.value})}
                      required
                      maxLength={100}
                      placeholder="e.g., Frontend Developer Needed"
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      value={teamForm.description}
                      onChange={(e) => setTeamForm({...teamForm, description: e.target.value})}
                      required
                      maxLength={500}
                      placeholder="Describe the position, responsibilities, and requirements..."
                    />
                    <p className="text-xs text-gray-500 text-right">
                      {teamForm.description.length}/500 characters
                    </p>
                  </div>
                  
                  {/* Skills Needed */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Skills Needed
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto py-1">
                      {ALL_SKILLS.map(skill => (
                        <button
                          type="button"
                          key={skill}
                          className={`px-2.5 py-1 rounded text-xs transition-colors ${
                            teamForm.skillsNeeded.includes(skill)
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }`}
                          onClick={() => setTeamForm({
                            ...teamForm,
                            skillsNeeded: teamForm.skillsNeeded.includes(skill)
                              ? teamForm.skillsNeeded.filter(s => s !== skill)
                              : [...teamForm.skillsNeeded, skill]
                          })}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Seats Available */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Seats Available <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={teamForm.seatsAvailable}
                      onChange={(e) => setTeamForm({
                        ...teamForm, 
                        seatsAvailable: Math.min(20, Math.max(1, parseInt(e.target.value) )|| 1)
                      })}
                      required
                    />
                  </div>
                  
                  {/* Deadline */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Deadline <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={teamForm.deadline}
                      onChange={(e) => setTeamForm({...teamForm, deadline: e.target.value})}
                      required
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                  
                  {/* Contact Email */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Contact Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={teamForm.contactEmail || ""} // Ensure fallback to empty string
    onChange={(e) => setTeamForm({...teamForm, contactEmail: e.target.value})}
                      required
                      placeholder="team@example.com"
                    />
                  </div>
                  
                  {/* Status */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Status <span className="text-red-400">*</span>
                    </label>
                    <select
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={teamForm.status}
                      onChange={(e) => setTeamForm({...teamForm, status: e.target.value})}
                      required
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </form>
              </div>
              
              <div className="p-4 border-t border-gray-700 sticky bottom-0 bg-gray-800">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400">
                    All fields marked with <span className="text-red-400">*</span> are required
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateTeamModal(false);
                        setSelectedOpening(null);
                        setTeamForm({
                          team: "",
                          title: "",
                          description: "",
                          skillsNeeded: [],
                          seatsAvailable: 1,
                          deadline: "",
                          contactEmail: "",
                          status: "open"
                        });
                      }}
                      className="px-4 py-2 text-xs text-gray-300 bg-transparent border border-gray-600 rounded hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
  type="button"
  className="px-4 py-2 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
  onClick={saveTeamOpening}
  disabled={!teamForm.team || !teamForm.title || !teamForm.description || !teamForm.deadline || !teamForm.contactEmail}
>
  {selectedOpening ? "Update Opening" : "Create Opening"}
</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}