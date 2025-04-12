"use client"
import { useState } from "react";
import {
  FaSearch, FaFilter, FaUserPlus, FaTimes, FaChevronDown,
  FaUsers, FaEnvelope, FaCheck, FaClock, FaPlus, FaCalendarAlt,
  FaProjectDiagram, FaTrash, FaEdit, FaUser, FaChevronRight, FaComment,
  FaInbox, FaPaperPlane, FaLink, FaUserCircle, FaUserFriends
} from "react-icons/fa";

function TeamCard({ team, onView, onEdit, onJoin, isOwner }) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 w-full flex flex-col">
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-white text-lg mb-1">{team.name}</h3>
            <p className="text-blue-400 text-sm flex items-center gap-1">
              <FaProjectDiagram size={12} /> {team.project}
            </p>
          </div>
          {isOwner && (
            <button 
              className="text-gray-400 hover:text-blue-400 p-1"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(team);
              }}
            >
              <FaEdit size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3 flex-1 flex flex-col overflow-hidden">
        {/* Description */}
        <div className="mb-3 flex-1 overflow-y-auto">
          <p className="text-sm text-gray-300 line-clamp-3">{team.description}</p>
        </div>

        {/* Skills */}
        <div className="mb-2 overflow-x-auto whitespace-nowrap pb-1">
          {team.skillsNeeded?.map((skill, index) => (
            <span key={index} className="inline-block px-2.5 py-1 bg-gray-700 rounded-full text-xs text-gray-300 mr-2 last:mr-0">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-800/50 border-t border-gray-700 rounded-b-lg flex justify-between items-center">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <FaUsers size={12} />
            {team.members?.length || 0}/{team.maxMembers}
          </span>
          <span className="flex items-center gap-1">
            <FaCalendarAlt size={12} />
            {new Date(team.deadline).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex gap-2">
          <button 
            className="text-xs text-gray-300 hover:text-blue-400 px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onView(team);
            }}
          >
            View
          </button>
          {!isOwner && (
            <button 
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onJoin(team);
              }}
            >
              Join
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OpenTeams() {
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeTab, setActiveTab] = useState("find");
  const [message, setMessage] = useState("");
  
  // Application states
  const [applicationsTab, setApplicationsTab] = useState("received");
  const [sentFilter, setSentFilter] = useState("all");
  const [receivedTeamFilter, setReceivedTeamFilter] = useState("all");
  const [receivedStatusFilter, setReceivedStatusFilter] = useState("all");

  // Form state
  const [teamForm, setTeamForm] = useState({
    name: "",
    project: "",
    description: "",
    skillsNeeded: [],
    maxMembers: 3,
    deadline: "",
    contact: "",
    status: "active"
  });

  // Sample data
  const allSkills = [
    "JavaScript", "React", "Node.js", "Python", "Data Science",
    "UI/UX Design", "Machine Learning", "Mobile Development", "DevOps"
  ];

  const [teams, setTeams] = useState([
    {
      id: "1",
      name: "Web Wizards",
      isOwner: true,
      project: "E-commerce Platform",
      description: "Building a modern e-commerce platform with React, Node.js, and MongoDB. Looking for frontend and backend developers with experience in these technologies.",
      skillsNeeded: ["JavaScript", "React", "Node.js"],
      members: [{ id: "u1", name: "You", role: "Owner", avatar: "/default-profile.png" }],
      maxMembers: 5,
      deadline: "2023-12-31",
      contact: "webwizards@example.com",
      status: "active",
      applications: [
        {
          id: "app1",
          userId: "u2",
          userName: "Alex Johnson",
          userAvatar: "/default-profile.png",
          message: "I'm a full-stack developer with 3 years of React experience.",
          status: "pending",
          date: "2023-10-15"
        },
        {
          id: "app3",
          userId: "u3",
          userName: "Sam Wilson",
          userAvatar: "/default-profile.png",
          message: "Frontend specialist looking to contribute.",
          status: "accepted",
          date: "2023-10-16"
        }
      ]
    },
    {
      id: "2",
      name: "Data Dynamos",
      isOwner: false,
      project: "Predictive Analytics Tool",
      description: "Creating machine learning models for healthcare analytics. Need data scientists and Python developers.",
      skillsNeeded: ["Python", "Machine Learning", "Data Science"],
      members: [{ id: "u2", name: "Sarah Lee", role: "Lead", avatar: "/default-profile.png" }],
      maxMembers: 4,
      deadline: "2024-01-15",
      contact: "datadynamos@example.com",
      status: "active",
      applications: []
    }
  ]);

  // Sent applications
  const [sentApplications, setSentApplications] = useState([
    {
      id: "app2",
      teamId: "2",
      teamName: "Data Dynamos",
      message: "I have experience with Python and ML and would love to contribute.",
      status: "pending",
      date: "2023-10-18"
    },
    {
      id: "app4",
      teamId: "3",
      teamName: "AI Innovators",
      message: "I'd like to join your AI research team.",
      status: "rejected",
      date: "2023-10-19"
    }
  ]);

  // Filter sent applications
  const filteredSentApplications = sentApplications.filter(app => {
    if (sentFilter === "all") return true;
    return app.status === sentFilter;
  });

  // Filter received applications
  const filteredReceivedApplications = teams.flatMap(team => {
    if (receivedTeamFilter !== "all" && team.id !== receivedTeamFilter) return [];
    
    return team.applications
      .filter(app => receivedStatusFilter === "all" || app.status === receivedStatusFilter)
      .map(app => ({ ...app, teamId: team.id, teamName: team.name }));
  });

  // Get my teams
  const myTeams = teams.filter(team => team.isOwner);

  // Helper functions
  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSkills([]);
  };

  const handleTeamSubmit = (e) => {
    e.preventDefault();
    const newTeam = {
      id: `team${Date.now()}`,
      isOwner: true,
      ...teamForm,
      members: [{ id: "u1", name: "You", role: "Owner", avatar: "/default-profile.png" }],
      applications: []
    };
    
    setTeams([...teams, newTeam]);
    setShowTeamModal(false);
    resetTeamForm();
  };

  const handleEditTeam = (team) => {
    setTeamForm({
      name: team.name,
      project: team.project,
      description: team.description,
      skillsNeeded: team.skillsNeeded,
      maxMembers: team.maxMembers,
      deadline: team.deadline,
      contact: team.contact,
      status: team.status
    });
    setSelectedTeam(team);
    setShowEditModal(true);
  };

  const updateTeam = (e) => {
    e.preventDefault();
    const updatedTeams = teams.map(t => 
      t.id === selectedTeam.id ? { ...t, ...teamForm } : t
    );
    setTeams(updatedTeams);
    setShowEditModal(false);
    resetTeamForm();
  };

  const deleteTeam = (teamId) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      setTeams(teams.filter(t => t.id !== teamId));
    }
  };

  const resetTeamForm = () => {
    setTeamForm({
      name: "",
      project: "",
      description: "",
      skillsNeeded: [],
      maxMembers: 3,
      deadline: "",
      contact: "",
      status: "active"
    });
  };

  const handleApplicationAction = (teamId, applicationId, action) => {
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        const updatedApplications = team.applications.map(app => {
          if (app.id === applicationId) {
            return { ...app, status: action };
          }
          return app;
        }).filter(app => app.id !== applicationId || action !== "rejected");
        
        // If accepted, add to members
        if (action === "accepted") {
          const application = team.applications.find(app => app.id === applicationId);
          if (application && team.members.length < team.maxMembers) {
            return {
              ...team,
              applications: updatedApplications,
              members: [...team.members, { 
                id: application.userId, 
                name: application.userName,
                role: "Member",
                avatar: application.userAvatar
              }]
            };
          }
        }
        
        return { ...team, applications: updatedApplications };
      }
      return team;
    }));
  };

  const handleSendApplication = (team) => {
    const newApplication = {
      id: `app${Date.now()}`,
      teamId: team.id,
      teamName: team.name,
      message: message,
      status: "pending",
      date: new Date().toISOString().split('T')[0]
    };
    
    setSentApplications([...sentApplications, newApplication]);
    
    // Also add to the team's applications if it's not your own team
    if (!team.isOwner) {
      setTeams(teams.map(t => {
        if (t.id === team.id) {
          return {
            ...t,
            applications: [...t.applications, {
              id: newApplication.id,
              userId: "currentUserId",
              userName: "Current User",
              userAvatar: "/default-profile.png",
              message: message,
              status: "pending",
              date: new Date().toISOString().split('T')[0]
            }]
          };
        }
        return t;
      }));
    }
    
    setShowJoinModal(false);
    setMessage("");
  };

  const withdrawApplication = (applicationId) => {
    setSentApplications(sentApplications.map(app => 
      app.id === applicationId ? { ...app, status: "withdrawn" } : app
    ));
    
    // Also remove from team's applications if it exists
    setTeams(teams.map(team => ({
      ...team,
      applications: team.applications.filter(app => app.id !== applicationId)
    })));
  };

  // Filter teams based on search and selected skills
  const filteredTeams = teams.filter(team => {
    const matchesSearch = 
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSkills = 
      selectedSkills.length === 0 || 
      selectedSkills.some(skill => team.skillsNeeded.includes(skill));

    return matchesSearch && matchesSkills && !team.isOwner;
  });

  // View profile handler
  const handleViewProfile = (userId) => {
    alert(`Viewing profile of user ${userId}`);
  };

  // Start chat handler
  const handleStartChat = (userId) => {
    alert(`Starting chat with user ${userId}`);
  };

  return (
    <div className="p-4 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white">Team Collaboration</h1>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('applications')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors border border-gray-700"
            >
              <FaInbox /> Applications
            </button>
            <button
              onClick={() => {
                resetTeamForm();
                setShowTeamModal(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaPlus /> Create Team
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
          <button
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === "find" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
            onClick={() => setActiveTab("find")}
          >
            Find Teams
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === "my" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
            onClick={() => setActiveTab("my")}
          >
            My Teams
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === "applications" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
            onClick={() => setActiveTab("applications")}
          >
            Applications
          </button>
        </div>

        {/* Find Teams Tab */}
        {activeTab === "find" && (
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="w-full md:w-1/3 lg:w-1/4 space-y-4">
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search teams..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                  {allSkills.map(skill => (
                    <button
                      key={skill}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedSkills.includes(skill)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
                {selectedSkills.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-3 text-xs text-blue-400 hover:text-blue-300"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Teams List */}
            <div className="w-full md:w-2/3 lg:w-3/4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeams.length > 0 ? (
                  filteredTeams.map(team => (
                    <TeamCard 
                      key={team.id}
                      team={team}
                      onView={(team) => {
                        setSelectedTeam(team);
                        setShowViewModal(true);
                      }}
                      onJoin={(team) => {
                        setSelectedTeam(team);
                        setShowJoinModal(true);
                      }}
                      isOwner={false}
                    />
                  ))
                ) : (
                  <div className="col-span-full bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
                    <p className="text-gray-400">No teams found matching your criteria.</p>
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* My Teams Tab */}
        {activeTab === "my" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTeams.length > 0 ? (
              myTeams.map(team => (
                <TeamCard 
                  key={team.id}
                  team={team}
                  onView={(team) => {
                    setSelectedTeam(team);
                    setShowViewModal(true);
                  }}
                  onEdit={(team) => {
                    handleEditTeam(team);
                  }}
                  isOwner={true}
                />
              ))
            ) : (
              <div className="col-span-full bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
                <p className="text-gray-400">You haven't created any teams yet.</p>
                <button
                  onClick={() => {
                    resetTeamForm();
                    setShowTeamModal(true);
                  }}
                  className="mt-4 flex items-center gap-1 mx-auto text-blue-400 hover:text-blue-300 text-sm px-4 py-2 bg-gray-700 rounded-lg"
                >
                  <FaPlus /> Create Your First Team
                </button>
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="flex border-b border-gray-700">
              <button
                className={`px-4 py-3 font-medium text-sm flex-1 text-center ${applicationsTab === "received" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
                onClick={() => setApplicationsTab("received")}
              >
                <FaInbox className="inline mr-2" /> Received
              </button>
              <button
                className={`px-4 py-3 font-medium text-sm flex-1 text-center ${applicationsTab === "sent" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
                onClick={() => setApplicationsTab("sent")}
              >
                <FaPaperPlane className="inline mr-2" /> Sent
              </button>
            </div>
            
            <div className="p-4">
              {applicationsTab === "received" ? (
                <div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                    <h3 className="text-sm font-medium text-gray-300">Applications to your teams</h3>
                    <div className="flex gap-2 w-full md:w-auto">
                      <div className="relative flex-1 md:flex-none">
                        <select
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-xs appearance-none pr-7"
                          value={receivedTeamFilter}
                          onChange={(e) => setReceivedTeamFilter(e.target.value)}
                        >
                          <option value="all">All Teams</option>
                          {myTeams.map(team => (
                            <option key={team.id} value={team.id}>{team.name}</option>
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
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
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
                        <div key={app.id} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="bg-gray-600 rounded-full p-2">
                              <FaUserFriends className="text-gray-300" size={16} />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-white">{app.userName}</p>
                                  <p className="text-xs text-gray-400">
                                    {app.teamName} • {new Date(app.date).toLocaleDateString()}
                                  </p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  app.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                                  app.status === "accepted" ? "bg-green-500/20 text-green-400" :
                                  "bg-gray-500/20 text-gray-400"
                                }`}>
                                  {app.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-300 mt-1">{app.message}</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            {app.status === "pending" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApplicationAction(app.teamId, app.id, "rejected")}
                                  className="text-xs px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleApplicationAction(app.teamId, app.id, "accepted")}
                                  className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded"
                                  disabled={teams.find(t => t.id === app.teamId)?.members.length >= teams.find(t => t.id === app.teamId)?.maxMembers}
                                >
                                  Accept
                                </button>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <button
                                className="text-xs px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded flex items-center gap-1"
                                onClick={() => handleViewProfile(app.userId)}
                              >
                                <FaUser size={10} /> Profile
                              </button>
                              <button
                                className="text-xs px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded flex items-center gap-1"
                                onClick={() => handleStartChat(app.userId)}
                              >
                                <FaComment size={10} /> Chat
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaInbox className="mx-auto text-gray-500 text-3xl mb-3" />
                      <p className="text-gray-400">No applications found matching your criteria</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
                    <h3 className="text-sm font-medium text-gray-300">Your sent applications</h3>
                    <div className="relative w-full md:w-auto">
                      <select
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-xs appearance-none pr-7"
                        value={sentFilter}
                        onChange={(e) => setSentFilter(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                        <option value="withdrawn">Withdrawn</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <FaChevronDown className="text-gray-400 text-xs" />
                      </div>
                    </div>
                  </div>
                  
                  {filteredSentApplications.length > 0 ? (
                    <div className="space-y-3">
                      {filteredSentApplications.map(app => (
                        <div key={app.id} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="bg-gray-600 rounded-lg p-2">
                              <FaUserFriends className="text-gray-300" size={16} />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-white">{app.teamName}</p>
                                  <p className="text-xs text-gray-400">
                                    {new Date(app.date).toLocaleDateString()}
                                  </p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  app.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                                  app.status === "accepted" ? "bg-green-500/20 text-green-400" :
                                  app.status === "rejected" ? "bg-red-500/20 text-red-400" :
                                  "bg-gray-500/20 text-gray-400"
                                }`}>
                                  {app.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-300 mt-1">{app.message}</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            {app.status === "pending" && (
                              <button
                                onClick={() => withdrawApplication(app.id)}
                                className="text-xs px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded"
                              >
                                Withdraw
                              </button>
                            )}
                            <div className="flex gap-2">
                              <button
                                className="text-xs px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded flex items-center gap-1"
                                onClick={() => {
                                  const team = teams.find(t => t.id === app.teamId);
                                  if (team) {
                                    setSelectedTeam(team);
                                    setShowViewModal(true);
                                  }
                                }}
                              >
                                <FaLink size={10} /> View Team
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaPaperPlane className="mx-auto text-gray-500 text-3xl mb-3" />
                      <p className="text-gray-400">No applications found matching your criteria</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create/Edit Team Modal */}
        {(showTeamModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
                <h2 className="text-lg font-semibold text-white">
                  {showEditModal ? "Edit Team" : "Create New Team"}
                </h2>
                <button 
                  onClick={() => {
                    setShowTeamModal(false);
                    setShowEditModal(false);
                    resetTeamForm();
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes size={18} />
                </button>
              </div>
              
              <div className="overflow-y-auto p-4 flex-1">
                <form onSubmit={showEditModal ? updateTeam : handleTeamSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Team Name</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                      value={teamForm.name}
                      onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Project Name</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                      value={teamForm.project}
                      onChange={(e) => setTeamForm({...teamForm, project: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                    <textarea
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                      rows={3}
                      value={teamForm.description}
                      onChange={(e) => setTeamForm({...teamForm, description: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Skills Needed</label>
                    <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto py-1">
                      {allSkills.map(skill => (
                        <button
                          type="button"
                          key={skill}
                          className={`px-2.5 py-1 rounded text-xs ${
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Max Members</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                        value={teamForm.maxMembers}
                        onChange={(e) => setTeamForm({...teamForm, maxMembers: parseInt(e.target.value) || 1})}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Deadline</label>
                      <input
                        type="date"
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                        value={teamForm.deadline}
                        onChange={(e) => setTeamForm({...teamForm, deadline: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Contact Email</label>
                    <input
                      type="email"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                      value={teamForm.contact}
                      onChange={(e) => setTeamForm({...teamForm, contact: e.target.value})}
                      required
                    />
                  </div>
                </form>
              </div>
              
              <div className="p-4 border-t border-gray-700 sticky bottom-0 bg-gray-800">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTeamModal(false);
                      setShowEditModal(false);
                      resetTeamForm();
                    }}
                    className="px-4 py-2 text-sm text-gray-300 bg-transparent border border-gray-600 rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                    onClick={showEditModal ? updateTeam : handleTeamSubmit}
                  >
                    {showEditModal ? "Save Changes" : "Create Team"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Team Modal */}
        {showViewModal && selectedTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] flex flex-col">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600/20 p-2 rounded-lg">
                    <FaUserFriends className="text-blue-400" size={20} />
                  </div>
                  <h2 className="text-lg font-semibold text-white">{selectedTeam.name}</h2>
                </div>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes size={18} />
                </button>
              </div>
              
              <div className="overflow-y-auto p-6 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-6">
                    {/* Project Section */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                        <FaProjectDiagram /> Project Details
                      </h3>
                      <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                        <h4 className="text-lg font-medium text-white mb-2">{selectedTeam.project}</h4>
                        <p className="text-sm text-gray-300">{selectedTeam.description}</p>
                      </div>
                    </div>
                    
                    {/* Skills Section */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                        <FaCheck /> Skills Needed
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTeam.skillsNeeded.map((skill, index) => (
                          <span key={index} className="px-3 py-1.5 bg-gray-700 rounded-full text-xs font-medium text-gray-300">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Details Section */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                        <FaLink /> Team Info
                      </h3>
                      <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 space-y-3">
                        <div>
                          <p className="text-xs font-medium text-gray-400">Status</p>
                          <p className={`text-sm ${
                            selectedTeam.status === "active" ? "text-green-400" :
                            selectedTeam.status === "pending" ? "text-yellow-400" :
                            "text-gray-400"
                          }`}>
                            {selectedTeam.status.charAt(0).toUpperCase() + selectedTeam.status.slice(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-400">Members</p>
                          <p className="text-sm text-white">
                            {selectedTeam.members.length}/{selectedTeam.maxMembers}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-400">Deadline</p>
                          <p className="text-sm text-white">
                            {new Date(selectedTeam.deadline).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-400">Contact</p>
                          <p className="text-sm text-blue-400">{selectedTeam.contact}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Members Section */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                        <FaUsers /> Team Members
                      </h3>
                      <div className="bg-gray-700/50 rounded-lg border border-gray-600 divide-y divide-gray-600">
                        {selectedTeam.members.map((member, index) => (
                          <div key={index} className="p-3 flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                                <FaUser className="text-gray-300" />
                              </div>
                              {member.role === "Owner" && (
                                <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  <FaUserCircle size={10} />
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{member.name}</p>
                              <p className="text-xs text-gray-400">{member.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-700 sticky bottom-0 bg-gray-800">
                <div className="flex justify-between items-center">
                  {selectedTeam.isOwner && (
                    <button
                      onClick={() => deleteTeam(selectedTeam.id)}
                      className="px-4 py-2 text-sm text-red-400 bg-transparent hover:bg-gray-700 rounded-lg"
                    >
                      Delete Team
                    </button>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (selectedTeam.isOwner) {
                          handleEditTeam(selectedTeam);
                        } else {
                          setShowJoinModal(true);
                        }
                      }}
                      className="px-4 py-2 text-sm text-white bg-gray-700 rounded-lg hover:bg-gray-600"
                    >
                      {selectedTeam.isOwner ? "Edit Team" : "Join Team"}
                    </button>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Join Team Modal */}
        {showJoinModal && selectedTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600/20 p-2 rounded-lg">
                    <FaUserFriends className="text-blue-400" size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-white">Join {selectedTeam.name}</h2>
                </div>
                <button 
                  onClick={() => setShowJoinModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Message to Team</label>
                  <textarea
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-white text-sm"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell them why you'd be a good fit for their team..."
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be sent to the team owner</p>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className="px-4 py-2 text-sm text-gray-300 bg-transparent border border-gray-600 rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSendApplication(selectedTeam)}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Send Application
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}