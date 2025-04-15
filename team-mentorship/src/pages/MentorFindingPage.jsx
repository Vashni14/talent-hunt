import { useState, useEffect } from "react";
import {
  FaSearch,
  FaFilter,
  FaUser,
  FaEnvelope,
  FaCheck,
  FaTimes,
  FaClock,
  FaChevronDown,
  FaChevronUp,
  FaGraduationCap,
  FaBook,
  FaBriefcase,
  FaLinkedin,
  FaSpinner,
  FaArrowLeft
} from "react-icons/fa";
import axios from "axios";
import { auth } from "../config/firebase";

const MentorFindingPage = () => {
  // State management
  const [activeTab, setActiveTab] = useState("find");
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myTeams, setMyTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [teamsError, setTeamsError] = useState(null);
    const [userId, setUserId] = useState(null);
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
      }
    }, [user]);
  // Static data for applications
  const [applications] = useState([
    {
      id: "1",
      mentorId: "1",
      mentorName: "Dr. Sarah Johnson",
      teamName: "Code Warriors",
      message: "We're building a React application and need guidance on best practices.",
      status: "pending",
      date: "2023-06-15"
    },
    {
      id: "2",
      mentorId: "2",
      mentorName: "Alex Chen",
      teamName: "Design Innovators",
      message: "Need help with UX research for our capstone project.",
      status: "accepted",
      date: "2023-06-10"
    }
  ]);

  // Sample user ID - replace with your actual user ID from auth context

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    domain: "",
    skill: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [applicationFilter, setApplicationFilter] = useState("all");

  // Modal states
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentMentor, setCurrentMentor] = useState(null);
  const [mentorDetails, setMentorDetails] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
  const [requestData, setRequestData] = useState({
    team: "",
    message: ""
  });

  // Fetch all mentors from backend
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/mentor/mentors');
        setMentors(response.data);
        setFilteredMentors(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  // Fetch user's teams from backend
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

  // Filter mentors based on search and filters
  useEffect(() => {
    let filtered = [...mentors];
    
    if (searchTerm) {
      filtered = filtered.filter(mentor =>
        mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (mentor.domain && mentor.domain.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (mentor.skills && mentor.skills.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }
    
    if (filters.domain) {
      filtered = filtered.filter(mentor => 
        mentor.domain && mentor.domain.toLowerCase() === filters.domain.toLowerCase());
    }
    
    if (filters.skill) {
      filtered = filtered.filter(mentor => 
        mentor.skills && mentor.skills.some(skill => 
          skill.toLowerCase().includes(filters.skill.toLowerCase())));
    }
    
    setFilteredMentors(filtered);
  }, [searchTerm, filters, mentors]);

  // Fetch detailed mentor data when profile modal is opened
  const handleViewProfile = async (mentor) => {
    setCurrentMentor(mentor);
    setProfileLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/mentor/profile/${mentor.userId}`);
      setMentorDetails(response.data);
      setShowProfileModal(true);
    } catch (err) {
      console.error("Error fetching mentor details:", err);
      alert("Failed to load mentor profile");
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle request submission (static implementation)
  const handleSendRequest = () => {
    if (!requestData.team || !requestData.message || !currentMentor) return;
    
    alert(`Request sent to ${currentMentor.name} from team ${requestData.team}`);
    setShowRequestModal(false);
    setRequestData({ team: "", message: "" });
  };

  // Handle withdraw application (static implementation)
  const handleWithdraw = (applicationId) => {
    alert(`Withdrawn application ${applicationId}`);
  };

  // Get unique domains for filter
  const uniqueDomains = [...new Set(mentors.map(mentor => mentor.domain).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-red-500">Error loading mentors: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Find a Mentor
          </h1>
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white">
              <FaEnvelope className="text-xl" />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          className={`px-6 py-3 font-medium ${activeTab === "find" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
          onClick={() => setActiveTab("find")}
        >
          Find Mentors
        </button>
        <button
          className={`px-6 py-3 font-medium ${activeTab === "applications" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
          onClick={() => setActiveTab("applications")}
        >
          My Applications
        </button>
      </div>

      {/* Main Content */}
      <main className="p-4 md:p-6">
        {activeTab === "find" ? (
          <>
            {/* Search and Filter */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search mentors by name, domain or skills..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter />
                  Filters
                  {showFilters ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="bg-gray-800 p-4 rounded-lg mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Domain</label>
                    <select
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                      value={filters.domain}
                      onChange={(e) => setFilters({...filters, domain: e.target.value})}
                    >
                      <option value="">All Domains</option>
                      {uniqueDomains.map(domain => (
                        <option key={domain} value={domain}>{domain}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Skill</label>
                    <input
                      type="text"
                      placeholder="Filter by skill..."
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                      value={filters.skill}
                      onChange={(e) => setFilters({...filters, skill: e.target.value})}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Mentors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map(mentor => (
                <div key={mentor._id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gray-700 overflow-hidden border-2 border-blue-500/30 flex-shrink-0">
                        <img 
                          src={mentor.profilePicture ? `http://localhost:5000${mentor.profilePicture}` : "/default-profile.png"} 
                          alt={mentor.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-profile.png";
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{mentor.name}</h3>
                        <p className="text-blue-400 text-sm">{mentor.currentPosition}</p>
                        <p className="text-gray-400 text-sm">{mentor.domain}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-gray-300 text-sm line-clamp-3">{mentor.bio || "No bio available"}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {mentor.skills?.slice(0, 4).map((skill, index) => (
                        <span key={index} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                      {mentor.skills?.length > 4 && (
                        <span className="bg-gray-700 text-gray-400 px-2 py-1 rounded-full text-xs">
                          +{mentor.skills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-700/50 px-5 py-3 flex justify-between items-center">
                    <div className="flex gap-3">
                      <button 
                        className="text-gray-300 hover:text-white flex items-center gap-1 text-sm"
                        onClick={() => alert(`Chat with ${mentor.name} would open here`)}
                      >
                        <FaEnvelope /> Chat
                      </button>
                      <button
                        className="text-gray-300 hover:text-white flex items-center gap-1 text-sm"
                        onClick={() => handleViewProfile(mentor)}
                      >
                        <FaUser /> Profile
                      </button>
                    </div>
                    <button
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-sm font-medium"
                      onClick={() => {
                        setCurrentMentor(mentor);
                        setShowRequestModal(true);
                      }}
                    >
                      Request
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredMentors.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                No mentors found matching your criteria.
              </div>
            )}
          </>
        ) : (
          <>
            {/* Applications Tab */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-4 py-2 rounded-lg ${applicationFilter === "all" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
                  onClick={() => setApplicationFilter("all")}
                >
                  All
                </button>
                <button
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${applicationFilter === "pending" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
                  onClick={() => setApplicationFilter("pending")}
                >
                  <FaClock /> Pending
                </button>
                <button
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${applicationFilter === "accepted" ? "bg-green-600" : "bg-gray-700 hover:bg-gray-600"}`}
                  onClick={() => setApplicationFilter("accepted")}
                >
                  <FaCheck /> Accepted
                </button>
                <button
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${applicationFilter === "rejected" ? "bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}
                  onClick={() => setApplicationFilter("rejected")}
                >
                  <FaTimes /> Rejected
                </button>
              </div>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
              {applications.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  No applications found.
                </div>
              ) : (
                applications.map(app => (
                  <div key={app.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{app.mentorName}</h3>
                        <p className="text-gray-400 text-sm">Team: {app.teamName}</p>
                        <p className="text-gray-300 mt-2">{app.message}</p>
                        <p className="text-gray-500 text-sm mt-2">Submitted: {app.date}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          app.status === "pending" ? "bg-yellow-600/30 text-yellow-400" :
                          app.status === "accepted" ? "bg-green-600/30 text-green-400" :
                          "bg-red-600/30 text-red-400"
                        }`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button 
                        className="text-gray-300 hover:text-white flex items-center gap-1 text-sm"
                        onClick={() => alert(`Chat with ${app.mentorName} would open here`)}
                      >
                        <FaEnvelope /> Chat
                      </button>
                      
                      {app.status === "pending" && (
                        <>
                          <button
                            className="text-gray-300 hover:text-white flex items-center gap-1 text-sm"
                            onClick={() => alert(`View profile of ${app.mentorName}`)}
                          >
                            <FaUser /> View Profile
                          </button>
                          <button
                            className="text-red-400 hover:text-red-300 flex items-center gap-1 text-sm"
                            onClick={() => handleWithdraw(app.id)}
                          >
                            <FaTimes /> Withdraw
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>

      {/* Request Mentor Modal */}
      {showRequestModal && currentMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md">
            <div className="p-5 border-b border-gray-700">
              <h3 className="font-bold text-lg">Request Mentor: {currentMentor.name}</h3>
              <p className="text-gray-400 text-sm">{currentMentor.domain}</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Team</label>
                {teamsLoading ? (
                  <div className="flex justify-center py-4">
                    <FaSpinner className="animate-spin text-blue-400 text-xl" />
                  </div>
                ) : teamsError ? (
                  <div className="text-red-400 text-sm">{teamsError}</div>
                ) : (
                  <select
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                    value={requestData.team}
                    onChange={(e) => setRequestData({...requestData, team: e.target.value})}
                  >
                    <option value="">Select a team</option>
                    {myTeams.map(team => (
                      <option key={team._id} value={team.name}>{team.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 min-h-[120px]"
                  placeholder="Explain why you're requesting this mentor and what help you need..."
                  value={requestData.message}
                  onChange={(e) => setRequestData({...requestData, message: e.target.value})}
                />
              </div>
            </div>
            <div className="bg-gray-700/50 px-5 py-3 flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
                onClick={() => setShowRequestModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                onClick={handleSendRequest}
                disabled={!requestData.team || !requestData.message}
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mentor Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-700 sticky top-0 bg-gray-800 z-10 flex justify-between items-center">
              <button 
                className="text-gray-400 hover:text-white p-1"
                onClick={() => setShowProfileModal(false)}
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <h2 className="text-xl font-bold flex-1 text-center">
                {mentorDetails?.name || currentMentor?.name}'s Profile
              </h2>
              <div className="w-6"></div> {/* Spacer for alignment */}
            </div>

            {profileLoading ? (
              <div className="flex items-center justify-center p-10">
                <FaSpinner className="animate-spin text-2xl text-blue-400" />
              </div>
            ) : (
              <div className="p-5">
                {/* Profile Header */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden border-4 border-blue-500/30 flex-shrink-0">
                      <img 
                        src={mentorDetails?.profilePicture ? `http://localhost:5000${mentorDetails.profilePicture}` : "/default-profile.png"}
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-profile.png";
                        }}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">{mentorDetails?.name || currentMentor?.name}</h2>
                      <p className="text-blue-400">{mentorDetails?.currentPosition || currentMentor?.currentPosition}</p>
                      <p className="text-gray-300">{mentorDetails?.domain || currentMentor?.domain}</p>
                    </div>
                    
                    {mentorDetails?.linkedin && (
                      <a 
                        href={`https://linkedin.com/in/${mentorDetails.linkedin}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <FaLinkedin className="text-xl" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Main Profile Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* About Section */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <FaUser className="text-blue-400" />
                        About
                      </h2>
                      <p className="text-gray-300 whitespace-pre-line">
                        {mentorDetails?.bio || "No bio information available."}
                      </p>
                    </div>

                    {/* Skills Section */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <FaBook className="text-blue-400" />
                        Skills & Expertise
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {mentorDetails?.skills?.length > 0 ? (
                          mentorDetails.skills.map((skill, index) => (
                            <span key={index} className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500">No skills listed</p>
                        )}
                      </div>
                    </div>

                    {/* Experience Section */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <FaBriefcase className="text-blue-400" />
                        Professional Experience
                      </h2>
                      <div className="prose prose-invert max-w-none">
                        {mentorDetails?.experience ? (
                          <p className="whitespace-pre-line">{mentorDetails.experience}</p>
                        ) : (
                          <p className="text-gray-500">No experience information available.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Education Section */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <FaGraduationCap className="text-blue-400" />
                        Education
                      </h2>
                      <div className="prose prose-invert max-w-none">
                        {mentorDetails?.education ? (
                          <p className="whitespace-pre-line">{mentorDetails.education}</p>
                        ) : (
                          <p className="text-gray-500">No education information available.</p>
                        )}
                      </div>
                    </div>

                    {/* LinkedIn Section */}
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                      <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                        <FaLinkedin className="text-blue-400" />
                        LinkedIn Profile
                      </h2>
                      {mentorDetails?.linkedin ? (
                        <a 
                          href={`https://linkedin.com/in/${mentorDetails.linkedin}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center"
                        >
                          <FaLinkedin className="mr-2" />
                          linkedin.com/in/{mentorDetails.linkedin}
                        </a>
                      ) : (
                        <p className="text-gray-500">No LinkedIn profile added</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorFindingPage;