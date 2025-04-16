import { useState, useEffect } from "react";
import {
  FaSearch,
  FaUsers,
  FaEnvelope,
  FaCheck,
  FaTimes,
  FaClock,
  FaUser,
  FaUserFriends,
  FaInfoCircle,
  FaSpinner
} from "react-icons/fa";
import { auth } from "/src/config/firebase";
import axios from "axios";
import { toast } from 'react-hot-toast';

// SDG data with symbols and names
const SDG_DATA = [
  { number: 1, symbol: "🌍", name: "No Poverty" },
  { number: 2, symbol: "🍏", name: "Zero Hunger" },
  { number: 3, symbol: "💊", name: "Good Health" },
  { number: 4, symbol: "🎓", name: "Quality Education" },
  { number: 5, symbol: "♀️", name: "Gender Equality" },
  { number: 6, symbol: "💧", name: "Clean Water" },
  { number: 7, symbol: "⚡", name: "Affordable Energy" },
  { number: 8, symbol: "💼", name: "Decent Work" },
  { number: 9, symbol: "🏭", name: "Industry Innovation" },
  { number: 10, symbol: "⚖️", name: "Reduced Inequalities" },
  { number: 11, symbol: "🏙️", name: "Sustainable Cities" },
  { number: 12, symbol: "🔄", name: "Responsible Consumption" },
  { number: 13, symbol: "🌡️", name: "Climate Action" },
  { number: 14, symbol: "🐠", name: "Life Below Water" },
  { number: 15, symbol: "🌳", name: "Life On Land" },
  { number: 16, symbol: "🕊️", name: "Peace and Justice" },
  { number: 17, symbol: "🤝", name: "Partnerships" }
];

const MentorTeamsPage = () => {
  const [activeTab, setActiveTab] = useState("teams");
  const [teamFilter, setTeamFilter] = useState("all");
  const [applicationFilter, setApplicationFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentProcessingId, setCurrentProcessingId] = useState(null);

  // Get SDG details by number
  const getSDGDetails = (number) => {
    return SDG_DATA.find(sdg => sdg.number === number);
  };

  // Fetch mentor's teams
  const fetchMentorTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First get the mentor's ID based on the logged-in user
      const mentorResponse = await axios.get(`http://localhost:5000/api/mentor/profile/${userId}`);
      const mentorId = mentorResponse.data._id;
      
      // Then fetch teams where this mentor is a mentor
      const response = await axios.get(`http://localhost:5000/api/teams/mentor/${mentorId}`);
      
      setTeams(response.data.teams || []);
    } catch (err) {
      console.error("Error fetching mentor teams:", err);
      setError(err.message);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First get the mentor's ID based on the logged-in user
      const mentorResponse = await axios.get(`http://localhost:5000/api/mentor/profile/${userId}`);
      const mentorId = mentorResponse.data._id;
      
      // Then fetch applications for this mentor
      const response = await axios.get(`http://localhost:5000/api/mentor/applications/mentor/${mentorId}`, {
        params: {
          status: applicationFilter === "all" ? undefined : applicationFilter
        }
      });
      
      setApplications(response.data.applications || []);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(err.message);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (action, applicationId) => {
    try {
      if (!['accepted', 'rejected', 'pending'].includes(action)) {
        throw new Error('Invalid action value');
      }
      
      setCurrentProcessingId(applicationId);
      setLoading(true);
      
      const response = await axios.patch(
        `http://localhost:5000/api/mentor/applications/${applicationId}`,
        { status: action },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
          }
        }
      );

      if (response.data.success) {
        toast.success(`Application ${action} successfully`);
        
        // Update applications state
        setApplications(prev => prev.map(app => 
          app._id === applicationId 
            ? { ...app, status: action } 
            : app
        ));
        
        // If accepted, we should also update teams list
        if (action === 'accepted') {
          const acceptedApp = applications.find(app => app._id === applicationId);
          if (acceptedApp) {
            // Reject other pending applications for this team in UI
            setApplications(prev => prev.map(app => 
              app.team._id === acceptedApp.team._id && app.status === 'pending' && app._id !== applicationId
                ? { ...app, status: 'rejected' }
                : app
            ));
            
            // Refresh teams list
            await fetchMentorTeams();
          }
        }
      } else {
        toast.error(response.data.message || "Failed to update application");
      }
    } catch (err) {
      console.error("Error updating application:", err);
      toast.error(err.response?.data?.message || "Failed to update application");
    } finally {
      setCurrentProcessingId(null);
      setLoading(false);
    }
  };

  // Get user ID when auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch data when user ID or filter changes
  useEffect(() => {
    if (userId) {
      if (activeTab === "applications") {
        fetchApplications();
      } else if (activeTab === "teams") {
        fetchMentorTeams();
      }
    }
  }, [userId, activeTab, applicationFilter, teamFilter]);

  // Filter teams based on status and search term
  const filteredTeams = teams.filter(team => 
    teamFilter === "all" || team.status === teamFilter
  ).filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.members.some(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
  ));

  // Filter applications based on search term
  const filteredApplications = applications.filter(app => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      app.team?.name?.toLowerCase().includes(searchLower) ||
      app.message?.toLowerCase().includes(searchLower) ||
      app.team?.members?.some(member => 
        member.name?.toLowerCase().includes(searchLower)
    ));
  });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Mentor Dashboard
        </h1>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          className={`px-6 py-3 font-medium flex items-center gap-2 ${activeTab === "teams" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
          onClick={() => setActiveTab("teams")}
        >
          <FaUsers /> My Teams
        </button>
        <button
          className={`px-6 py-3 font-medium flex items-center gap-2 ${activeTab === "applications" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
          onClick={() => setActiveTab("applications")}
        >
          <FaEnvelope /> Applications
        </button>
      </div>

      {/* Main Content */}
      <main className="p-4 md:p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search ${activeTab === "teams" ? "teams" : "applications"}...`}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {activeTab === "teams" ? (
          <>
            {/* Team Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                className={`px-4 py-2 rounded-lg ${teamFilter === "all" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
                onClick={() => setTeamFilter("all")}
              >
                All Teams
              </button>
              <button
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${teamFilter === "active" ? "bg-green-600" : "bg-gray-700 hover:bg-gray-600"}`}
                onClick={() => setTeamFilter("active")}
              >
                <FaCheck /> Active
              </button>
              <button
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${teamFilter === "completed" ? "bg-gray-600" : "bg-gray-700 hover:bg-gray-600"}`}
                onClick={() => setTeamFilter("completed")}
              >
                <FaTimes /> Completed
              </button>
            </div>

            {/* Teams List */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-10">
                  <FaSpinner className="animate-spin text-2xl text-blue-400" />
                </div>
              ) : error ? (
                <div className="text-center py-10 text-red-400">
                  Error loading teams: {error}
                </div>
              ) : filteredTeams.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  No teams found matching your criteria.
                </div>
              ) : (
                filteredTeams.map(team => (
                  <div key={team._id} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex gap-10 items-center">
                          <h3 className="text-xl font-bold whitespace-nowrap">{team.name}</h3>
                          <div className="flex gap-1">
                            {team.sdgs.map(sdgNumber => {
                              const sdg = getSDGDetails(sdgNumber);
                              return (
                                <span 
                                  key={sdg.number} 
                                  className="text-sm bg-gray-700/50 rounded-full px-2 py-0.5 flex items-center gap-1"
                                  title={`SDG ${sdg.number}: ${sdg.name}`}
                                >
                                  <span>{`SDG : ${sdg.number}`}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            team.status === "active" ? "bg-green-600/30 text-green-400" : "bg-gray-600/30 text-gray-400"
                          }`}>
                            {team.status === "active" ? "Active" : "Completed"}
                          </span>
                          <span className="text-sm text-gray-500">
                            Created: {new Date(team.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-gray-300">{team.description}</p>
                    
                    <div className="mt-4">
                      <h4 className="font-medium flex items-center gap-2 text-gray-300">
                        <FaUserFriends className="text-blue-400" /> Team Members
                      </h4>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {team.members.map(member => (
                          <div key={member._id} className="flex items-center gap-3 p-2 bg-gray-700/50 rounded">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/50">
                              <img
                                src={
                                  member?.avatar
                                    ? member.avatar.startsWith('http') 
                                      ? member.avatar
                                      : `http://localhost:5000${member.avatar}`
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'User')}&background=random`
                                }
                                alt={member.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'User')}&background=random`;
                                }}
                              />
                            </div>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-gray-400">{member.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-1">
                        <FaEnvelope /> Chat
                      </button>
                      <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium flex items-center gap-1">
                        <FaInfoCircle /> View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            {/* Applications Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                className={`px-4 py-2 rounded-lg ${applicationFilter === "all" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
                onClick={() => setApplicationFilter("all")}
              >
                All Applications
              </button>
              <button
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${applicationFilter === "pending" ? "bg-yellow-600" : "bg-gray-700 hover:bg-gray-600"}`}
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

            {/* Applications List */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-10">
                  <FaSpinner className="animate-spin text-2xl text-blue-400" />
                </div>
              ) : error ? (
                <div className="text-center py-10 text-red-400">
                  Error loading applications: {error}
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  No applications found matching your criteria.
                </div>
              ) : (
                filteredApplications.map(app => (
                  <div key={app._id} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold">{app.team?.name || "Unknown Team"}</h3>
                          <div className="flex gap-1">
                            {app.team?.sdgs?.map(sdgNumber => {
                              const sdg = getSDGDetails(sdgNumber);
                              return sdg ? (
                                <span 
                                  key={sdg.number} 
                                  className="text-sm bg-gray-700/50 rounded-full px-2 py-0.5 flex items-center gap-1"
                                  title={`SDG ${sdg.number}: ${sdg.name}`}
                                >
                                  <span>{sdg.symbol}</span>
                                  <span>{sdg.number}</span>
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            app.status === "pending" ? "bg-yellow-600/30 text-yellow-400" :
                            app.status === "accepted" ? "bg-green-600/30 text-green-400" :
                            "bg-red-600/30 text-red-400"
                          }`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500">
                            Applied: {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-gray-300">{app.message}</p>
                    <p className="mt-2 text-sm text-gray-400">
                      <span className="font-medium">Project:</span> {app.team?.description || "No description"}
                    </p>

                    <div className="mt-4">
                      <h4 className="font-medium flex items-center gap-2 text-gray-300">
                        <FaUserFriends className="text-blue-400" /> Team Members
                      </h4>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {app.team?.members?.map(member => (
                          <div
                            key={member._id}
                            className="flex items-center gap-3 p-2 bg-gray-700/50 rounded"
                          >
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/50">
                              <img
                                src={
                                  member?.avatar
                                    ? member.avatar.startsWith('http')
                                      ? member.avatar
                                      : `http://localhost:5000${member.avatar}`
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'User')}&background=random`
                                }
                                alt={member.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'User')}&background=random`;
                                }}
                              />
                            </div>
                            <div>
                              <p className="font-medium text-white">{member.name}</p>
                              <p className="text-sm text-gray-400">{member.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-1">
                        <FaEnvelope /> Chat
                      </button>
                      
                      {app.status === "pending" && (
                        <>
                          <button 
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium flex items-center gap-1"
                            onClick={() => handleApplicationAction("accepted", app._id)}
                            disabled={loading && currentProcessingId === app._id}
                          >
                            {loading && currentProcessingId === app._id ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <>
                                <FaCheck /> Accept
                              </>
                            )}
                          </button>
                          <button 
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium flex items-center gap-1"
                            onClick={() => handleApplicationAction("rejected", app._id)}
                            disabled={loading && currentProcessingId === app._id}
                          >
                            {loading && currentProcessingId === app._id ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <>
                                <FaTimes /> Reject
                              </>
                            )}
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
    </div>
  );
};

export default MentorTeamsPage;