"use client"

import ProfileModal from "../components/ProfileModal";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { auth } from "../config/firebase";
import { toast } from "react-hot-toast";
import {
  FaSearch, FaFilter, FaUserPlus, FaComment, FaTimes, FaChevronDown,
  FaLinkedin, FaGithub, FaLink, FaMagic, FaBell, FaUser, FaTrophy,
  FaGraduationCap, FaSignOutAlt, FaUsers, FaEnvelope, FaCheck, FaClock
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:5000/api";

function TeammateCard({ teammate, onView, onConnect }) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-blue-500/30 transition-all duration-300">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <img
             src={teammate?.profilePicture  ?  `http://localhost:5000${teammate.profilePicture}`  :  "/default-profile.png"}
            alt={teammate.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/30"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${teammate.name}&background=random`;
            }}
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-white">{teammate.name}</h3>
                <p className="text-sm text-gray-400">{teammate.rolePreference}</p>
                <p className="text-xs text-gray-500 mt-1">{teammate.domain}</p>
              </div>
              {teammate.compatibility && (
                <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs font-medium">
                  {teammate.compatibility}% Match
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap gap-1 mb-3">
            {teammate.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="px-2 py-0.5 bg-gray-700 rounded-full text-xs text-gray-300">
                {skill}
              </span>
            ))}
            {teammate.skills.length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-700 text-gray-300">
                +{teammate.skills.length - 3}
              </span>
            )}
          </div>
          
          <p className="text-xs text-gray-400 line-clamp-2 mb-2">
            {teammate.bio}
          </p>

          {teammate.mutualInterests && teammate.mutualInterests.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-medium text-gray-400 mb-1">Mutual Interests</h4>
              <div className="flex flex-wrap gap-2">
                {teammate.mutualInterests.map((interest, idx) => (
                  <span key={idx} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-gray-700 p-3 flex justify-between items-center">
        <button 
          className="text-xs text-gray-300 hover:text-blue-400"
          onClick={onView}
        >
          View Profile
        </button>
        <div className="flex gap-2">
          <button 
            className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition-colors"
            onClick={() => alert(`Starting chat with ${teammate.name}`)}
          >
            <FaComment />
          </button>
          <button 
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
            onClick={onConnect}
          >
            <FaUserPlus />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FindTeammatesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTeammate, setSelectedTeammate] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [activeTab, setActiveTab] = useState("find");
  const [invitationFilter, setInvitationFilter] = useState("all");

  const [loading, setLoading] = useState({
    user: true,
    teammates: true,
    teams: false,
    invitations: false,
  });

  const [user, setUser] = useState({
    uid: "",
    name: "",
    email: "",
    department: "",
    skills: [],
    competitions: [],
    profilePicture: "",
  });

  const [potentialTeammates, setPotentialTeammates] = useState([]);
  const [teams, setTeams] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [receivedInvitations, setReceivedInvitations] = useState([]);
  const [refreshInvitations, setRefreshInvitations] = useState(false);

  const skillsList = [
    "AI", "Machine Learning", "Web Development", "UI/UX Design", 
    "Data Analysis", "Embedded Systems", "IoT", "Robotics",
    "CAD Design", "3D Printing", "Mobile Development", "Cloud Computing",
    "Blockchain", "Cybersecurity", "Business Strategy", "Market Research",
    "Presentation", "Project Management"
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        fetchStudentProfile(user.uid);
        fetchTeammates(user.uid);
        fetchUserTeams(user.uid);
  
        try {
          const res = await fetch(`${API_URL}/student/profile/${user.uid}`);
          const text = await res.text(); // raw response
  
          const result = JSON.parse(text); // now parse it
          if (result && result._id) {
            const objectId = result._id;
            fetchInvitations(objectId);
          } else {
            console.error("User not found in DB");
          }          
        } catch (err) {
          console.error("Error fetching ObjectId for invitations:", err);
        }
      } else {
        navigate("/student/dashboard");
      }
    });
  
    return () => unsubscribe();
  }, [navigate,refreshInvitations]);

  
  const fetchStudentProfile = async (userId) => {
    try {
      setLoading(prev => ({ ...prev, user: true }));
      const response = await axios.get(`${API_URL}/student/profile/${userId}`);
      setUser({
        uid: response.data._id,
        name: response.data.name,
        email: response.data.email,
        department: response.data.department,
        skills: response.data.skills || [],
        competitions: response.data.competitions || [],
        profilePicture: response.data.profilePicture || "",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(prev => ({ ...prev, user: false }));
    }
  };

  const fetchTeammates = async (userId) => {
    try {
      setLoading(prev => ({ ...prev, teammates: true }));
      const response = await axios.get(`${API_URL}/student/profile`);
      const teammates = response.data
        .filter(profile => profile._id !== userId)
        .map(profile => ({
          _id: profile._id,
          uid: profile._id,
          name: profile.name,
          rolePreference: profile.rolePreference,
          email: profile.email,
          linkedin: profile.linkedin,
          github: profile.github,
          portfolio: profile.portfolio,
          department: profile.department,
          projects: profile.projects || [],
          certifications: profile.certifications || [],
          skills: profile.skills || [],
          competitions: profile.competitions || [],
          availability: "Available",
          bio: profile.bio || `${profile.name} is a ${profile.department} student`,
          profilePicture: profile.profilePicture,
          mutualInterests: calculateMutualInterests(user, profile),
          compatibility: calculateCompatibility(user, profile),
        }));
      
      setPotentialTeammates(teammates);
    } catch (error) {
      console.error("Error fetching teammates:", error);
      toast.error("Failed to load teammates");
    } finally {
      setLoading(prev => ({ ...prev, teammates: false }));
    }
  };

  const fetchUserTeams = async (userId) => {
    try {
      setLoading(prev => ({ ...prev, teams: true }));
      const response = await axios.get(`${API_URL}/teams/user/${userId}`);
      setTeams(response.data);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to load teams");
    } finally {
      setLoading(prev => ({ ...prev, teams: false }));
    }
  };

  const fetchInvitations = async (userId) => {
    try {
      setLoading(prev => ({ ...prev, invitations: true }))
      // Fetch SENT invitations
      try {
        const sentResponse = await axios.get(`${API_URL}/teams/invitations/sent/${userId}`);
        if (sentResponse.data && sentResponse.data.success) {
          setSentInvitations(sentResponse.data.data);
        } else {
          setSentInvitations([]); // Ensure fallback to empty array
        }
      } catch (error) {
        setSentInvitations([]); // Prevent crash
      }

      // Fetch RECEIVED invitations
      const receivedResponse = await axios.get(`${API_URL}/teams/invitations/received/${userId}`);
      setReceivedInvitations(receivedResponse.data?.data || []);
  
    } catch (error) {
      toast.error("Failed to load invitations");
    } finally {
      setLoading(prev => ({ ...prev, invitations: false }));
    }
  };  
  const triggerRefreshInvitations = () => setRefreshInvitations(prev => !prev);

  const calculateMutualInterests = (currentUser, profile) => {
    const userSkills = new Set(currentUser.skills);
    const profileSkills = new Set(profile.skills || []);
    return [...userSkills].filter(skill => profileSkills.has(skill));
  };

  const calculateCompatibility = (currentUser, profile) => {
    const sharedSkills = calculateMutualInterests(currentUser, profile).length;
    const userCompetitions = new Set(currentUser.competitions);
    const profileCompetitions = new Set(profile.competitions || []);
    const sharedCompetitions = [...userCompetitions].filter(comp => profileCompetitions.has(comp)).length;
    
    const maxPossible = Math.max(currentUser.skills.length, 1) + Math.max(currentUser.competitions.length, 1);
    const score = (sharedSkills * 0.7 + sharedCompetitions * 0.3) / maxPossible;
    
    return Math.floor(score * 100);
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill) 
        : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSkills([]);
  };

  const handleConnect = (teammate) => {
    setSelectedTeammate(teammate);
    setShowInviteModal(true);
  };

  const sendConnectionRequest = async () => {
    try {
      if (!selectedTeammate || !selectedTeam) {
        toast.error("Please select a team");
        return;
      }
  
      const response = await axios.post(`${API_URL}/teams/invite`, {
        teamId: selectedTeam,
        teammateId: selectedTeammate._id,
        message: message,
        createdBy: user.uid
      });
  
      const team = teams.find(t => t._id === selectedTeam);
      const newInvitation = {
        _id: response.data._id,
        student: {
          _id: selectedTeammate._id,
          name: selectedTeammate.name,
          rolePreference: selectedTeammate.rolePreference,
          department: selectedTeammate.department,
          profilePicture: selectedTeammate.profilePicture,
          compatibility: selectedTeammate.compatibility
        },
        team: {
          _id: team._id,
          name: team.name
        },
        message: message,
        status: "pending",
        createdAt: new Date().toISOString()
      };
  
     
      toast.success(`Invitation sent to ${selectedTeammate.name}`);
      setShowInviteModal(false);
      setMessage("");
      setSelectedTeam("");
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error(error.response?.data?.message || "Failed to send invitation");
    }
  };
  const handleInvitationResponse = async (invitationId, accepted) => {
    try {
      const response = await axios.put(`${API_URL}/teams/invitations/${invitationId}`, {
        status: accepted ? "accepted" : "rejected"
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        }
      });
      
      setReceivedInvitations(prev => 
        prev.map(inv => 
          inv._id === invitationId 
            ? { ...inv, status: accepted ? "accepted" : "rejected" } 
            : inv
        )
      );
      
      toast.success(
        accepted 
          ? "Invitation accepted! You've joined the team." 
          : "Invitation declined."
      );
      
      if (accepted) {
        fetchUserTeams(user.uid);
      }
    } catch (error) {
      console.error("Error responding to invitation:", error);
      const errorMessage = error.response?.data?.message || 
        error.message || 
        "Failed to update invitation status";
      toast.error(errorMessage);
    }
  };
  const withdrawInvitation = async (invitationId) => {
    try {
      console.log('Withdrawing invitation:', invitationId);
      
      const response = await axios.delete(`${API_URL}/teams/invitations/${invitationId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        }
      });
  
      console.log('Withdrawal response:', response.data);
  
      if (response.data.success) {
        setSentInvitations(prev => 
          prev.map(inv => 
            inv._id === invitationId ? { ...inv, status: 'withdrawn' } : inv
          )
        );
        toast.success("Invitation withdrawn successfully");
      } else {
        toast.error(response.data.message || "Failed to withdraw invitation");
      }
    } catch (error) {
      console.error('Withdrawal error:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || "Failed to withdraw invitation";
      toast.error(errorMessage);
    }
  };

  const filteredTeammates = potentialTeammates.filter(teammate => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      teammate.name.toLowerCase().includes(searchLower) ||
      (teammate.rolePreference && teammate.rolePreference.toLowerCase().includes(searchLower)) ||
      (teammate.bio && teammate.bio.toLowerCase().includes(searchLower));

    const matchesSkills = 
      selectedSkills.length === 0 || 
      selectedSkills.some(skill => 
        teammate.skills.includes(skill)
      );

    return matchesSearch && matchesSkills;
  });

  // Filter invitations based on selected status
  const filteredSentInvitations = sentInvitations.filter(inv => {
    if (invitationFilter === "all") return true;
    return inv.status === invitationFilter;
  });

  const filteredReceivedInvitations = receivedInvitations.filter(inv => {
    if (invitationFilter === "all") return true;
    return inv.status === invitationFilter;
  });

  const handleNavigateToTeams = () => {
    navigate('/my-teams');
  };

  const headerContent = (
    <div className="flex items-center gap-4">
      <button 
        onClick={handleNavigateToTeams}
        className="hidden md:flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
      >
        <FaUsers /> My Teams
      </button>
      <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors relative">
        <FaBell />
      </button>
      {!loading.user && (
        <div className="relative group">
          <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border-2 border-blue-500/50 cursor-pointer hover:border-blue-400 transition-all duration-200">
            <img
               src={user?.profilePicture  ?  `http://localhost:5000${user.profilePicture}`  :  "/default-profile.png"}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=random`;
              }}
            />
          </div>
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200">
            <div className="px-4 py-2 border-b border-gray-700">
              <p className="text-sm text-white font-medium">{user.name}</p>
              <p className="text-xs text-gray-400">{user.contact}</p>
            </div>
            <button 
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
              onClick={() => navigate('/profile')}
            >
              <FaUser className="text-gray-400" />
              My Profile
            </button>
            <button 
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
              onClick={() => {
                auth.signOut();
                navigate('/login');
              }}
            >
              <FaSignOutAlt className="text-gray-400" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-gray-800/95 backdrop-blur-sm py-2 shadow-lg" : "bg-gray-900 py-3"} border-b border-gray-700`}>
        <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <FaGraduationCap className="text-sm" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              ScholarCompete
            </h1>
          </div>
          {headerContent}
        </div>
      </header>

      <div className="pt-24 pb-12 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4 space-y-6">
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Filters</h2>
                  <button onClick={clearFilters} className="text-xs text-blue-400 hover:text-blue-300">
                    Clear All
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search teammates..."
                        className="w-full bg-gray-700 rounded-lg py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 border border-gray-600"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <button
                      className="flex justify-between items-center w-full text-sm font-medium mb-2"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <span>Skills</span>
                      <FaChevronDown className={`text-xs transition-transform ${showFilters ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {(showFilters || window.innerWidth >= 1024) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                            {skillsList.map((skill, index) => (
                              <button
                                key={index}
                                className={`px-2 py-1 text-xs rounded-full ${selectedSkills.includes(skill) ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                                onClick={() => toggleSkill(skill)}
                              >
                                {skill}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <h2 className="text-lg font-bold mb-4">My Status</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Available</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-3/4">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Team Connections</h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {activeTab === "find" && `${filteredTeammates.length} results`}
                    {activeTab === "sent" && `${filteredSentInvitations.length} ${invitationFilter === "all" ? "total" : invitationFilter}`}
                    {activeTab === "received" && `${filteredReceivedInvitations.length} ${invitationFilter === "all" ? "total" : invitationFilter}`}
                  </span>
                  <button 
                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors lg:hidden"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <FaFilter />
                  </button>
                </div>
              </div>

              <div className="flex border-b border-gray-700 mb-6">
                <button
                  className={`px-4 py-2 font-medium text-sm ${activeTab === "find" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
                  onClick={() => setActiveTab("find")}
                >
                  Find Teammates
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm ${activeTab === "sent" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
                  onClick={() => [setActiveTab("sent"), setInvitationFilter("all"), triggerRefreshInvitations()]}
                >
                  Sent Invitations
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm ${activeTab === "received" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
                  onClick={() => [setActiveTab("received"), setInvitationFilter("all"), triggerRefreshInvitations()]}
                >
                  Received Invitations
                </button>
              </div>

              {activeTab !== "find" && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  <button
                    className={`px-3 py-1 text-xs rounded-full ${invitationFilter === "all" ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                    onClick={() => setInvitationFilter("all")}
                  >
                    All
                  </button>
                  <button
                    className={`px-3 py-1 text-xs rounded-full ${invitationFilter === "pending" ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                    onClick={() => setInvitationFilter("pending")}
                  >
                    Pending
                  </button>
                  {activeTab === "sent" && (
                    <>
                      <button
                        className={`px-3 py-1 text-xs rounded-full ${invitationFilter === "accepted" ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                        onClick={() => setInvitationFilter("accepted")}
                      >
                        Accepted
                      </button>
                      <button
                        className={`px-3 py-1 text-xs rounded-full ${invitationFilter === "rejected" ? "bg-red-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                        onClick={() => setInvitationFilter("rejected")}
                      >
                        Rejected
                      </button>
                      <button
                        className={`px-3 py-1 text-xs rounded-full ${invitationFilter === "withdrawn" ? "bg-gray-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                        onClick={() => setInvitationFilter("withdrawn")}
                      >
                        Withdrawn
                      </button>
                    </>
                  )}
                  {activeTab === "received" && (
                    <>
                      <button
                        className={`px-3 py-1 text-xs rounded-full ${invitationFilter === "accepted" ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                        onClick={() => setInvitationFilter("accepted")}
                      >
                        Accepted
                      </button>
                      <button
                        className={`px-3 py-1 text-xs rounded-full ${invitationFilter === "rejected" ? "bg-red-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                        onClick={() => setInvitationFilter("rejected")}
                      >
                        Rejected
                      </button>
                    </>
                  )}
                </div>
              )}

              {loading.teammates ? (
                <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Loading...</p>
                </div>
              ) : (
                <>
                  {activeTab === "find" && (
                    <>
                      <div className="mb-8">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                          <FaMagic className="text-purple-400" /> AI-Recommended Teammates
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredTeammates
                            .filter((teammate) => teammate.compatibility >= 85)
                            .slice(0, 2)
                            .map((teammate) => (
                              <TeammateCard 
                                key={teammate._id}
                                teammate={teammate}
                                onView={() => {
                                  setSelectedProfile(teammate);
                                  setShowProfileModal(true);
                                }}
                                onConnect={() => handleConnect(teammate)}
                              />
                            ))}
                        </div>
                      </div>

                      <div>
                        <h2 className="text-lg font-bold mb-4">All Potential Teammates</h2>
                        {filteredTeammates.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTeammates.map((teammate) => (
                              <TeammateCard 
                                key={teammate._id}
                                teammate={teammate}
                                onView={() => {
                                  setSelectedProfile(teammate);
                                  setShowProfileModal(true);
                                }}
                                onConnect={() => handleConnect(teammate)}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
                            <FaSearch className="mx-auto text-3xl text-gray-600 mb-3" />
                            <h3 className="text-lg font-medium mb-1">No teammates found</h3>
                            <p className="text-gray-400 text-sm">Try adjusting your filters or search query</p>
                            <button
                              onClick={clearFilters}
                              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              Clear Filters
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {activeTab === "received" && (
                    <div className="space-y-4">
                      {filteredReceivedInvitations.length > 0 ? (
                        filteredReceivedInvitations.map((invitation) => (
                          <div key={invitation._id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                <img
                                   src={invitation.createdBy?.profilePicture  ?  `http://localhost:5000${invitation.createdBy.profilePicture}`  :  "/default-profile.png"}
                                  alt={invitation.createdBy?.name}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/30"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${invitation.createdBy?.name}&background=random`;
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium">{invitation.createdBy?.name}</h3>
                                    <p className="text-sm text-gray-400">{invitation.createdBy?.rolePreference}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      invitation.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                                      invitation.status === "accepted" ? "bg-green-500/20 text-green-400" :
                                      "bg-red-500/20 text-red-400"
                                    }`}>
                                      {invitation.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => alert(`Starting chat with ${invitation.createdBy?.name}`)}
                                      className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                      title="Chat"
                                    >
                                      <FaComment />
                                    </button>
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <p className="text-sm text-gray-300 mb-1">
                                    <span className="font-medium">Team:</span> {invitation.team?.name}
                                  </p>
                                  <p className="text-sm text-gray-400 mb-2">
                                    <span className="font-medium">Received:</span> {new Date(invitation.createdAt).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm text-gray-300 mb-3">
                                    <span className="font-medium">Message:</span> {invitation.message}
                                  </p>
                                  <div className="flex flex-wrap justify-center gap-2">
                                    {invitation.status === "pending" && (
                                      <>
                                        <button
                                          onClick={() => handleInvitationResponse(invitation._id, true)}
                                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                                        >
                                          <FaCheck /> Accept
                                        </button>
                                        <button
                                          onClick={() => handleInvitationResponse(invitation._id, false)}
                                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                                        >
                                          <FaTimes /> Decline
                                        </button>
                                      </>
                                    )}
                                    <button
                                      onClick={() => {
                                        const profile = potentialTeammates.find(t => t._id === invitation.createdBy?._id);
                                        if (profile) {
                                          setSelectedProfile(profile);
                                          setShowProfileModal(true);
                                        } else {
                                          toast.error("Profile information not available");
                                        }
                                      }}
                                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                                    >
                                      <FaUser /> View Profile
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
                          <FaEnvelope className="mx-auto text-3xl text-gray-600 mb-3" />
                          <h3 className="text-lg font-medium mb-1">No {invitationFilter === "all" ? "" : invitationFilter} received invitations</h3>
                          <p className="text-gray-400 text-sm">
                            {invitationFilter === "all" 
                              ? "You haven't received any invitations yet" 
                              : `You don't have any ${invitationFilter} invitations`}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "sent" && (
                    <div className="space-y-4">
                      {filteredSentInvitations.length > 0 ? (
                        filteredSentInvitations.map((invitation) => (
                          <div key={invitation._id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                <img
                                   src={invitation.user?.profilePicture  ?  `http://localhost:5000${invitation.user.profilePicture}`  :  "/default-profile.png"}
                                  alt={invitation.user?.name}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/30"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${invitation.user?.name}&background=random`;
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-medium">{invitation.user?.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      invitation.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                                      invitation.status === "accepted" ? "bg-green-500/20 text-green-400" :
                                      invitation.status === "rejected" ? "bg-red-500/20 text-red-400" :
                                      "bg-gray-500/20 text-gray-400"
                                    }`}>
                                      {invitation.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {invitation.status === "pending" && (
                                      <button
                                        onClick={() => withdrawInvitation(invitation._id)}
                                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                        title="Withdraw"
                                      >
                                        <FaTimes />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <p className="text-sm text-gray-300 mb-1">
                                    <span className="font-medium">Team:</span> {invitation.team?.name}
                                  </p>
                                  <p className="text-sm text-gray-400 mb-2">
                                    <span className="font-medium">Sent:</span> {new Date(invitation.createdAt).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm text-gray-300 mb-3">
                                    <span className="font-medium">Message:</span> {invitation.message}
                                  </p>
                                  <div>
                                    <button
                                      onClick={() => alert(`Starting chat with ${invitation.student?.name}`)}
                                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                                    >
                                      <FaComment /> Chat
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
                          <FaEnvelope className="mx-auto text-3xl text-gray-600 mb-3" />
                          <h3 className="text-lg font-medium mb-1">No {invitationFilter === "all" ? "" : invitationFilter} sent invitations</h3>
                          <p className="text-gray-400 text-sm">
                            {invitationFilter === "all" 
                              ? "You haven't sent any invitations yet" 
                              : `You don't have any ${invitationFilter} invitations`}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showInviteModal && selectedTeammate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Connect with {selectedTeammate.name}</h2>
                <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-white">
                  ×
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-700">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                     src={selectedTeammate?.profilePicture  ?  `http://localhost:5000${selectedTeammate.profilePicture}`  :  "/default-profile.png"}
                    alt={selectedTeammate.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${selectedTeammate.name}&background=random`;
                    }}
                  />
                </div>
                <div>
                  <p className="font-medium">{selectedTeammate.name}</p>
                  <p className="text-sm text-gray-400">{selectedTeammate.rolePreference}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Team</label>
                <select
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                >
                  <option value="">Choose a team</option>
                  {teams
                    .filter(team => ['active', 'pending'].includes(team.status))
                    .map(team => (
                      <option key={team._id} value={team._id}>{team.name}</option>
                    ))
                  }
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Write a message to introduce yourself and your project..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  onClick={sendConnectionRequest}
                  disabled={!selectedTeam || !message.trim()}
                >
                  Send Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showProfileModal && selectedProfile && (
        <ProfileModal 
          profile={selectedProfile} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}
    </div>
  );
}