"use client"

import { useState } from "react";
import {
  FaCalendarAlt,
  FaFilter,
  FaSearch,
  FaUserPlus,
  FaUsers,
  FaPlus,
  FaEnvelope,
  FaCheck,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaUser,
  FaProjectDiagram,
  FaEye,
  FaTrash
} from "react-icons/fa";

export default function OpenTeams() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showPostTeamModal, setShowPostTeamModal] = useState(false);
  const [showReceivedApplicationsModal, setShowReceivedApplicationsModal] = useState(false);
  const [showSentApplicationsModal, setShowSentApplicationsModal] = useState(false);
  const [showApplicantProfileModal, setShowApplicantProfileModal] = useState(false);
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  
  // Form states
  const [newTeamForm, setNewTeamForm] = useState({
    name: "",
    project: "",
    description: "",
    skills: [],
    members: 1,
    maxMembers: 3,
    deadline: "",
    contact: ""
  });
  
  const [applicationForm, setApplicationForm] = useState({
    message: "",
    skills: ""
  });

  // Data - would normally come from API
  const allSkills = [
    "JavaScript", "React", "Node.js", "Python", "Data Science",
    "UI/UX Design", "Machine Learning", "Mobile Development", "DevOps"
  ];

  // Sample data - in a real app, this would come from your backend
  const [publicTeams, setPublicTeams] = useState([
    {
      id: "1",
      name: "Web Wizards",
      isMyTeam: true, // This is a team I own
      logo: "/placeholder-team.svg",
      project: "E-commerce Platform",
      description: "Building a modern e-commerce platform with React, Node.js, and MongoDB.",
      skills: ["JavaScript", "React", "Node.js"],
      members: 3,
      maxMembers: 5,
      deadline: "Apr 30, 2025",
      contact: "webwizards@example.com",
      applications: [
        {
          id: "app1",
          applicant: "Alex Chen",
          email: "alex.chen@example.com",
          message: "I have 3 years of React experience and would love to contribute!",
          status: "pending",
          date: "Apr 5, 2025",
          skills: ["React", "JavaScript", "UI/UX"],
          bio: "Full-stack developer with experience in building scalable web applications."
        }
      ]
    },
    {
      id: "2",
      name: "Data Dynamos",
      isMyTeam: false, // This is someone else's team
      logo: "/placeholder-team.svg",
      project: "Predictive Analytics Tool",
      description: "Creating machine learning models for healthcare analytics.",
      skills: ["Python", "Machine Learning", "Data Science"],
      members: 2,
      maxMembers: 4,
      deadline: "May 15, 2025",
      contact: "datadynamos@example.com",
      applications: []
    },
    {
      id: "3",
      name: "Mobile Mavericks",
      isMyTeam: false,
      logo: "/placeholder-team.svg",
      project: "Fitness Tracking App",
      description: "Developing a cross-platform mobile app for fitness tracking.",
      skills: ["React Native", "Mobile Development", "UI/UX"],
      members: 2,
      maxMembers: 4,
      deadline: "May 10, 2025",
      contact: "mobilemavericks@example.com",
      applications: []
    }
  ]);

  const [mySentApplications, setMySentApplications] = useState([
    {
      id: "sent1",
      teamId: "2",
      team: "Data Dynamos",
      project: "Predictive Analytics Tool",
      message: "I have strong Python skills for your ML project",
      status: "pending",
      date: "Apr 1, 2025",
      skills: ["Python", "Data Science"]
    },
    {
      id: "sent2",
      teamId: "3",
      team: "Mobile Mavericks",
      project: "Fitness Tracking App",
      message: "I'm experienced with React Native development",
      status: "pending",
      date: "Apr 3, 2025",
      skills: ["React Native", "JavaScript"]
    }
  ]);

  // Helper functions
  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const toggleTeamExpand = (teamId) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };

  // Filter teams to show only others' teams that I haven't applied to
  const filteredTeams = publicTeams.filter(team => {
    // Only show teams that are not mine
    const isNotMyTeam = !team.isMyTeam;
    
    const matchesSearch = 
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSkills = 
      selectedSkills.length === 0 || 
      selectedSkills.some(skill => team.skills.includes(skill));

    return isNotMyTeam && matchesSearch && matchesSkills;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSkills([]);
  };

  // Application handlers
  const handleApplySubmit = (e) => {
    e.preventDefault();
    const newApplication = {
      id: `sent${mySentApplications.length + 1}`,
      teamId: selectedTeam.id,
      team: selectedTeam.name,
      project: selectedTeam.project,
      message: applicationForm.message,
      skills: applicationForm.skills.split(",").map(s => s.trim()),
      status: "pending",
      date: new Date().toLocaleDateString()
    };
    
    setMySentApplications([...mySentApplications, newApplication]);
    setShowApplyModal(false);
    setApplicationForm({ message: "", skills: "" });
  };

  const handleApplicationAction = (teamId, applicationId, action) => {
    setPublicTeams(publicTeams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          applications: team.applications.map(app => 
            app.id === applicationId ? { ...app, status: action } : app
          )
        };
      }
      return team;
    }));
  };

  const handleWithdrawApplication = (applicationId) => {
    setMySentApplications(mySentApplications.filter(app => app.id !== applicationId));
  };

  const handleTeamSubmit = (e) => {
    e.preventDefault();
    const newTeam = {
      id: `team${publicTeams.length + 1}`,
      isMyTeam: true,
      logo: "/placeholder-team.svg",
      ...newTeamForm,
      applications: []
    };
    
    setPublicTeams([...publicTeams, newTeam]);
    setShowPostTeamModal(false);
    setNewTeamForm({
      name: "",
      project: "",
      description: "",
      skills: [],
      members: 1,
      maxMembers: 3,
      deadline: "",
      contact: ""
    });
  };

  // Get teams I own
  const myTeams = publicTeams.filter(team => team.isMyTeam);

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Open Teams</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowReceivedApplicationsModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaEnvelope /> Received Apps
            </button>
            <button
              onClick={() => setShowSentApplicationsModal(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaEnvelope /> Sent Apps
            </button>
            <button
              onClick={() => setShowPostTeamModal(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaPlus /> Post Team
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-1/3 lg:w-1/4 space-y-4">
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search teams..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
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

          {/* Teams List - Showing only others' teams */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <div className="space-y-4">
              {filteredTeams.length > 0 ? (
                filteredTeams.map(team => (
                  <div
                    key={team.id}
                    className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                          <img
                            src={team.logo}
                            alt={`${team.name} logo`}
                            className="w-14 h-14 rounded-lg object-cover border-2 border-blue-500/30"
                          />
                          <div>
                            <h3 className="font-medium text-white text-lg">{team.name}</h3>
                            <p className="text-sm text-blue-400">{team.project}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleTeamExpand(team.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          {expandedTeamId === team.id ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                      </div>

                      {expandedTeamId === team.id && (
                        <>
                          <p className="mt-4 text-sm text-gray-300">{team.description}</p>

                          <div className="mt-4">
                            <div className="flex flex-wrap gap-1 mb-3">
                              {team.skills.map(skill => (
                                <span 
                                  key={skill} 
                                  className="px-2 py-0.5 bg-gray-700 rounded-full text-xs text-gray-300"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-3">
                              <div className="flex items-center">
                                <FaUsers className="mr-1" />
                                <span>
                                  {team.members}/{team.maxMembers} members
                                </span>
                              </div>
                              <div className="flex items-center">
                                <FaCalendarAlt className="mr-1" />
                                <span>Deadline: {team.deadline}</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="border-t border-gray-700 p-3 flex justify-between items-center">
                      <button 
                        className="text-xs text-gray-300 hover:text-white"
                        onClick={() => {
                          setSelectedTeam(team);
                          setShowDetailsModal(true);
                        }}
                      >
                        View Details
                      </button>
                      <button
                        className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                        onClick={() => {
                          setSelectedTeam(team);
                          setShowApplyModal(true);
                        }}
                      >
                        <FaUserPlus className="text-xs" />
                        Apply to Join
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
                  <p className="text-gray-400">No teams found matching your criteria.</p>
                  <button
                    className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Team Details Modal */}
        {showDetailsModal && selectedTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">{selectedTeam.name}</h2>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex items-start gap-4 mb-6">
                <img
                  src={selectedTeam.logo}
                  alt={`${selectedTeam.name} logo`}
                  className="w-16 h-16 rounded-lg object-cover border-2 border-blue-500/30"
                />
                <div>
                  <p className="text-blue-400 font-medium">{selectedTeam.project}</p>
                  <p className="text-gray-300 mt-2">{selectedTeam.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-white font-medium mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTeam.skills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <p className="text-gray-400 text-sm">Team Size</p>
                  <p className="text-white">{selectedTeam.members}/{selectedTeam.maxMembers} members</p>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <p className="text-gray-400 text-sm">Deadline</p>
                  <p className="text-white">{selectedTeam.deadline}</p>
                </div>
              </div>

              <div className="bg-gray-700 p-3 rounded-lg">
                <p className="text-gray-400 text-sm">Contact</p>
                <p className="text-white">{selectedTeam.contact}</p>
              </div>
            </div>
          </div>
        )}

        {/* Apply to Team Modal */}
        {showApplyModal && selectedTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">Apply to {selectedTeam.name}</h2>
                <button 
                  onClick={() => setShowApplyModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Your Message</label>
                  <textarea
                    rows={4}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={applicationForm.message}
                    onChange={(e) => setApplicationForm({...applicationForm, message: e.target.value})}
                    required
                    placeholder="Why do you want to join this team?"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-1">Your Skills</label>
                  <input
                    type="text"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={applicationForm.skills}
                    onChange={(e) => setApplicationForm({...applicationForm, skills: e.target.value})}
                    required
                    placeholder="List your relevant skills (comma separated)"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg mt-4"
                >
                  Submit Application
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Received Applications Modal */}
        {showReceivedApplicationsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-white">Received Applications</h2>
                  <button 
                    onClick={() => setShowReceivedApplicationsModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {myTeams.length > 0 ? (
                  myTeams.map(team => (
                    team.applications.length > 0 ? (
                      <div key={team.id} className="mb-8">
                        <div className="flex items-center gap-3 mb-3">
                          <FaProjectDiagram className="text-blue-400" />
                          <h3 className="text-blue-400 font-medium">{team.name} - {team.project}</h3>
                        </div>
                        <div className="space-y-3">
                          {team.applications.map(app => (
                            <div key={app.id} className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <FaUser className="text-gray-400" />
                                    <h4 className="font-medium text-white">{app.applicant}</h4>
                                  </div>
                                  <p className="text-sm text-blue-400 mt-1">{app.email}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  app.status === "accepted" 
                                    ? "bg-green-500/20 text-green-400" 
                                    : app.status === "rejected" 
                                      ? "bg-red-500/20 text-red-400" 
                                      : "bg-yellow-500/20 text-yellow-400"
                                }`}>
                                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm mb-3">{app.message}</p>
                              <div className="flex justify-between items-center text-xs text-gray-400">
                                <span>Applied: {app.date}</span>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedApplicant(app);
                                      setShowApplicantProfileModal(true);
                                    }}
                                    className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs flex items-center gap-1"
                                  >
                                    <FaEye /> View Profile
                                  </button>
                                  {app.status === "pending" && (
                                    <>
                                      <button
                                        onClick={() => handleApplicationAction(team.id, app.id, "reject")}
                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1 text-xs"
                                      >
                                        <FaTimes /> Reject
                                      </button>
                                      <button
                                        onClick={() => handleApplicationAction(team.id, app.id, "accept")}
                                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1 text-xs"
                                      >
                                        <FaCheck /> Accept
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div key={team.id} className="text-gray-400 text-sm mb-4">
                        No applications received for {team.name} yet.
                      </div>
                    )
                  ))
                ) : (
                  <div className="text-gray-400 text-center py-4">
                    You don't own any teams yet. Post a team to receive applications.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Applicant Profile Modal */}
        {showApplicantProfileModal && selectedApplicant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">{selectedApplicant.applicant}'s Profile</h2>
                <button 
                  onClick={() => setShowApplicantProfileModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl">
                    <FaUser className="text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{selectedApplicant.applicant}</h3>
                    <p className="text-sm text-blue-400">{selectedApplicant.email}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedApplicant.skills || []).map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-medium mb-2">Bio</h4>
                  <p className="text-gray-300">{selectedApplicant.bio || "No bio provided"}</p>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-white font-medium mb-2">Application Details</h4>
                  <p className="text-gray-300 text-sm mb-1">Status: 
                    <span className={`ml-2 ${
                      selectedApplicant.status === "accepted" 
                        ? "text-green-400" 
                        : selectedApplicant.status === "rejected" 
                          ? "text-red-400" 
                          : "text-yellow-400"
                    }`}>
                      {selectedApplicant.status.charAt(0).toUpperCase() + selectedApplicant.status.slice(1)}
                    </span>
                  </p>
                  <p className="text-gray-300 text-sm">Applied: {selectedApplicant.date}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sent Applications Modal */}
        {showSentApplicationsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-white">Sent Applications</h2>
                  <button 
                    onClick={() => setShowSentApplicationsModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {mySentApplications.length > 0 ? (
                  <div className="space-y-3">
                    {mySentApplications.map(app => {
                      const team = publicTeams.find(t => t.id === app.teamId);
                      return (
                        <div key={app.id} className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <FaProjectDiagram className="text-purple-400" />
                                <h4 className="font-medium text-white">{app.team} - {app.project}</h4>
                              </div>
                              {team && (
                                <p className="text-sm text-gray-400 mt-1">
                                  Team contact: {team.contact}
                                </p>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              app.status === "accepted" 
                                ? "bg-green-500/20 text-green-400" 
                                : app.status === "rejected" 
                                  ? "bg-red-500/20 text-red-400" 
                                  : "bg-yellow-500/20 text-yellow-400"
                            }`}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mb-3">{app.message}</p>
                          <div className="flex justify-between items-center">
                            <div className="flex flex-wrap gap-1 text-xs">
                              {(app.skills || []).map((skill, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-700 rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              {app.status === "pending" && (
                                <button
                                  onClick={() => handleWithdrawApplication(app.id)}
                                  className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs"
                                >
                                  <FaTrash /> Withdraw
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 mt-2">
                            Applied: {app.date}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-4">
                    You haven't applied to any teams yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Post Team Modal */}
        {showPostTeamModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">Post New Team</h2>
                <button 
                  onClick={() => setShowPostTeamModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleTeamSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Team Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newTeamForm.name}
                      onChange={(e) => setNewTeamForm({...newTeamForm, name: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Project Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newTeamForm.project}
                      onChange={(e) => setNewTeamForm({...newTeamForm, project: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-1">Project Description</label>
                  <textarea 
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTeamForm.description}
                    onChange={(e) => setNewTeamForm({...newTeamForm, description: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-1">Required Skills</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {allSkills.map(skill => (
                      <button
                        key={skill}
                        type="button"
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          newTeamForm.skills.includes(skill)
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
                        }`}
                        onClick={() => setNewTeamForm({
                          ...newTeamForm,
                          skills: newTeamForm.skills.includes(skill)
                            ? newTeamForm.skills.filter(s => s !== skill)
                            : [...newTeamForm.skills, skill]
                        })}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Current Members</label>
                    <input 
                      type="number" 
                      min="1"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newTeamForm.members}
                      onChange={(e) => setNewTeamForm({...newTeamForm, members: parseInt(e.target.value)})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Max Members Needed</label>
                    <input 
                      type="number" 
                      min="1"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newTeamForm.maxMembers}
                      onChange={(e) => setNewTeamForm({...newTeamForm, maxMembers: parseInt(e.target.value)})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Project Deadline</label>
                    <input 
                      type="date" 
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newTeamForm.deadline}
                      onChange={(e) => setNewTeamForm({...newTeamForm, deadline: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-1">Contact Email</label>
                  <input 
                    type="email" 
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTeamForm.contact}
                    onChange={(e) => setNewTeamForm({...newTeamForm, contact: e.target.value})}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPostTeamModal(false)}
                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Post Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}