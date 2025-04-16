import { useState } from "react";
import {
  FaSearch,
  FaUsers,
  FaEnvelope,
  FaCheck,
  FaTimes,
  FaClock,
  FaUser,
  FaUserFriends,
  FaInfoCircle
} from "react-icons/fa";

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

  // Teams data with SDGs
  const [teams] = useState([
    {
      id: "1",
      name: "Code Warriors",
      status: "active",
      members: [
        { id: "m1", name: "Alice Johnson", role: "Developer" },
        { id: "m2", name: "Bob Smith", role: "Designer" }
      ],
      description: "Building a React application for campus events",
      sdgs: [4, 9],
      createdAt: "2023-05-15"
    },
    {
      id: "2",
      name: "Eco Solutions",
      status: "active",
      members: [
        { id: "m3", name: "Charlie Brown", role: "Researcher" },
        { id: "m4", name: "Dana Lee", role: "Data Analyst" }
      ],
      description: "Developing sustainable energy solutions for rural areas",
      sdgs: [7, 13],
      createdAt: "2023-04-10"
    },
    {
      id: "3",
      name: "Health Innovators",
      status: "completed",
      members: [
        { id: "m5", name: "Eva Green", role: "Medical Student" },
        { id: "m6", name: "Frank White", role: "Developer" }
      ],
      description: "Mobile app for remote health diagnostics",
      sdgs: [3, 9],
      createdAt: "2023-01-20"
    }
  ]);

  // Applications data with SDGs
  const [applications] = useState([
    {
      id: "a1",
      teamId: "4",
      teamName: "Clean Water Initiative",
      status: "pending",
      message: "Need guidance on water purification technology",
      members: [
        { id: "m7", name: "Grace Hopper", role: "Engineer" },
        { id: "m8", name: "Henry Ford", role: "Chemist" }
      ],
      projectDescription: "Developing affordable water filters for communities",
      sdgs: [6, 14],
      appliedDate: "2023-06-15"
    },
    {
      id: "a2",
      teamId: "5",
      teamName: "EduTech Pioneers",
      status: "accepted",
      message: "Mentorship request for our learning platform",
      members: [
        { id: "m9", name: "Ivy Zhang", role: "Educator" },
        { id: "m10", name: "Jack Wilson", role: "Developer" }
      ],
      projectDescription: "Online platform for STEM education in rural schools",
      sdgs: [4, 10],
      appliedDate: "2023-05-28"
    }
  ]);

  // Filter teams based on status and search term
  const filteredTeams = teams.filter(team => 
    teamFilter === "all" || team.status === teamFilter
  ).filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.members.some(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
  ));

  // Filter applications based on status and search term
  const filteredApplications = applications.filter(app => 
    applicationFilter === "all" || app.status === applicationFilter
  ).filter(app =>
    app.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.projectDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.members.some(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
  ));

  // Get SDG details by number
  const getSDGDetails = (number) => {
    return SDG_DATA.find(sdg => sdg.number === number);
  };

  // Handle application actions
  const handleApplicationAction = (action, applicationId) => {
    alert(`${action} application ${applicationId}`);
  };

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
              {filteredTeams.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  No teams found matching your criteria.
                </div>
              ) : (
                filteredTeams.map(team => (
                  <div key={team.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
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
                            Created: {team.createdAt}
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
                          <div key={member.id} className="flex items-center gap-3 p-2 bg-gray-700/50 rounded">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-blue-400 border border-blue-500/30">
                              <FaUser />
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
              {filteredApplications.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  No applications found matching your criteria.
                </div>
              ) : (
                filteredApplications.map(app => (
                  <div key={app.id} className="bg-gray-800 rounded-xl border border-gray-700 p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold">{app.teamName}</h3>
                          <div className="flex gap-1">
                            {app.sdgs.map(sdgNumber => {
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
                            app.status === "pending" ? "bg-yellow-600/30 text-yellow-400" :
                            app.status === "accepted" ? "bg-green-600/30 text-green-400" :
                            "bg-red-600/30 text-red-400"
                          }`}>
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500">
                            Applied: {app.appliedDate}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-gray-300">{app.message}</p>
                    <p className="mt-2 text-sm text-gray-400">
                      <span className="font-medium">Project:</span> {app.projectDescription}
                    </p>

                    <div className="mt-4">
                      <h4 className="font-medium flex items-center gap-2 text-gray-300">
                        <FaUserFriends className="text-blue-400" /> Team Members
                      </h4>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {app.members.map(member => (
                          <div key={member.id} className="flex items-center gap-3 p-2 bg-gray-700/50 rounded">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-blue-400 border border-blue-500/30">
                              <FaUser />
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
                      
                      {app.status === "pending" && (
                        <>
                          <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium flex items-center gap-1">
                            <FaInfoCircle /> View Team
                          </button>
                          <button 
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium flex items-center gap-1"
                            onClick={() => handleApplicationAction("accept", app.id)}
                          >
                            <FaCheck /> Accept
                          </button>
                          <button 
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium flex items-center gap-1"
                            onClick={() => handleApplicationAction("reject", app.id)}
                          >
                            <FaTimes /> Reject
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