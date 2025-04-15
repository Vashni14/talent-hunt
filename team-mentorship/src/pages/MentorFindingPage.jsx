import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  FaLinkedin
} from "react-icons/fa";

const MentorFindingPage = () => {
  // Sample mentor data
  const allMentors = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      profilePicture: "/default-profile.png",
      domain: "Software Engineering",
      skills: ["JavaScript", "React", "Node.js", "AWS"],
      bio: "Senior Software Engineer with 10+ years of experience. Passionate about mentoring new developers.",
      currentPosition: "Senior Engineering Manager at TechCorp",
      education: "PhD in Computer Science, Stanford University",
      linkedin: "sarah-johnson-tech",
      experience: "12 years at TechCorp, 5 years at StartupInc"
    },
    {
      id: "2",
      name: "Alex Chen",
      profilePicture: "/default-profile.png",
      domain: "UX Design",
      skills: ["Figma", "User Research", "Prototyping", "UI/UX"],
      bio: "UX Designer with 8 years of experience in product design and user research.",
      currentPosition: "Lead UX Designer at DesignCo",
      education: "MSc in Human-Computer Interaction, CMU",
      linkedin: "alex-chen-ux",
      experience: "5 years at DesignCo, 3 years at Creative Agency"
    },
    {
      id: "3",
      name: "Michael Rodriguez",
      profilePicture: "/default-profile.png",
      domain: "Data Science",
      skills: ["Python", "Machine Learning", "TensorFlow", "SQL"],
      bio: "Data Scientist specializing in machine learning and AI applications.",
      currentPosition: "Principal Data Scientist at DataWorks",
      education: "PhD in Artificial Intelligence, MIT",
      linkedin: "michael-rodriguez-ds",
      experience: "7 years at DataWorks, 4 years at Research Lab"
    },
    {
      id: "4",
      name: "Priya Patel",
      profilePicture: "/default-profile.png",
      domain: "Product Management",
      skills: ["Agile", "Scrum", "Product Strategy", "Market Research"],
      bio: "Product leader with experience building successful SaaS products.",
      currentPosition: "Director of Product at SaaS Corp",
      education: "MBA, Harvard Business School",
      linkedin: "priya-patel-pm",
      experience: "10 years in product management roles"
    }
  ];

  // Sample applications data
  const allApplications = [
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
    },
    {
      id: "3",
      mentorId: "3",
      mentorName: "Michael Rodriguez",
      teamName: "Data Explorers",
      message: "Looking for guidance on implementing ML models.",
      status: "rejected",
      date: "2023-06-05"
    }
  ];

  // State management
  const [activeTab, setActiveTab] = useState("find");
  const [mentors, setMentors] = useState(allMentors);
  const [applications, setApplications] = useState(allApplications);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    domain: "",
    skill: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [applicationFilter, setApplicationFilter] = useState("all");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [currentMentor, setCurrentMentor] = useState(null);
  const [requestData, setRequestData] = useState({
    team: "",
    message: ""
  });
  const [teams, setTeams] = useState([
    { id: "1", name: "Code Warriors" },
    { id: "2", name: "Design Innovators" },
    { id: "3", name: "Data Explorers" }
  ]);

  // Filter mentors based on search and filters
  useEffect(() => {
    let filtered = allMentors;
    
    if (searchTerm) {
      filtered = filtered.filter(mentor =>
        mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.skills.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
      ));
}
    
    if (filters.domain) {
      filtered = filtered.filter(mentor => 
        mentor.domain.toLowerCase() === filters.domain.toLowerCase());
    }
    
    if (filters.skill) {
      filtered = filtered.filter(mentor => 
        mentor.skills.some(skill => 
          skill.toLowerCase().includes(filters.skill.toLowerCase())));
    }
    
    setMentors(filtered);
  }, [searchTerm, filters]);

  // Filter applications
  useEffect(() => {
    if (applicationFilter === "all") {
      setApplications(allApplications);
    } else {
      setApplications(allApplications.filter(app => app.status === applicationFilter));
    }
  }, [applicationFilter]);

  // Handle request submission
  const handleSendRequest = () => {
    if (!requestData.team || !requestData.message) return;
    
    const newApplication = {
      id: `${applications.length + 1}`,
      mentorId: currentMentor.id,
      mentorName: currentMentor.name,
      teamName: requestData.team,
      message: requestData.message,
      status: "pending",
      date: new Date().toISOString().split('T')[0]
    };
    
    setApplications([...applications, newApplication]);
    setShowRequestModal(false);
    setRequestData({ team: "", message: "" });
  };

  // Handle withdraw application
  const handleWithdraw = (applicationId) => {
    setApplications(applications.filter(app => app.id !== applicationId));
  };

  // Get unique domains for filter
  const uniqueDomains = [...new Set(allMentors.map(mentor => mentor.domain))];

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
              {mentors.map(mentor => (
                <div key={mentor.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gray-700 overflow-hidden border-2 border-blue-500/30 flex-shrink-0">
                        <img 
                          src={mentor.profilePicture} 
                          alt={mentor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{mentor.name}</h3>
                        <p className="text-blue-400 text-sm">{mentor.currentPosition}</p>
                        <p className="text-gray-400 text-sm">{mentor.domain}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-gray-300 text-sm line-clamp-3">{mentor.bio}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {mentor.skills.slice(0, 4).map((skill, index) => (
                        <span key={index} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                      {mentor.skills.length > 4 && (
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
                        onClick={() => {
                          setCurrentMentor(mentor);
                          // In a real app, this would open a chat
                          alert(`Opening chat with ${mentor.name}`);
                        }}
                      >
                        <FaEnvelope /> Chat
                      </button>
                      <Link 
                        to={`/mentor-profile/${mentor.id}`}
                        className="text-gray-300 hover:text-white flex items-center gap-1 text-sm"
                      >
                        <FaUser /> Profile
                      </Link>
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

            {mentors.length === 0 && (
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
                        onClick={() => {
                          // In a real app, this would open a chat
                          alert(`Opening chat with ${app.mentorName}`);
                        }}
                      >
                        <FaEnvelope /> Chat
                      </button>
                      
                      {app.status === "pending" && (
                        <>
                          <Link 
                            to={`/mentor-profile/${app.mentorId}`}
                            className="text-gray-300 hover:text-white flex items-center gap-1 text-sm"
                          >
                            <FaUser /> View Profile
                          </Link>
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
                <select
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                  value={requestData.team}
                  onChange={(e) => setRequestData({...requestData, team: e.target.value})}
                >
                  <option value="">Select a team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.name}>{team.name}</option>
                  ))}
                </select>
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
    </div>
  );
};

export default MentorFindingPage;