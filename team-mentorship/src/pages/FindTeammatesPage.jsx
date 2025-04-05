"use client"

import ProfileModal from "../components/ProfileModal";
import { useState, useEffect } from "react"
import axios from "axios";
import {
  FaBell,
  FaUser,
  FaSearch,
  FaTrophy,
  FaUsers,
  FaGraduationCap,
  FaStar,
  FaFilter,
  FaPlus,
  FaUserPlus,
  FaChevronDown,
  FaMagic,
  FaSignOutAlt,
  FaTimes,
  FaCheck,
  FaEnvelope,
} from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import { auth } from "../config/firebase";

// API base URL - replace with your actual API URL
const API_URL = "http://localhost:5000/api"

export default function FindTeammatesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("")
const [showProfileModal, setShowProfileModal] = useState(false);
const [selectedProfile, setSelectedProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("find-teammates")
  const [scrolled, setScrolled] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState([])
  const [selectedDepartments, setSelectedDepartments] = useState([])
  const [selectedCompetitions, setSelectedCompetitions] = useState([])
  const [availabilityFilter, setAvailabilityFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedTeammate, setSelectedTeammate] = useState(null)
  const [loading, setLoading] = useState({
    user: true,
    teammates: true,
    teams: false,
    invitations: false,
    requests: false,
    mentors: false,
  })

  // User data state
  const [user, setUser] = useState({
    uid: "",
    name: "",
    email: "",
    department: "",
    skills: [],
    competitions: [],
    availability: "Available",
    profilePicture: "",
  })
  // State for teammates (fetched from backend)
  const [potentialTeammates, setPotentialTeammates] = useState([])

  // Hardcoded data for other sections
  const openTeams = [
    {
      _id: "team1",
      name: "AI Innovators",
      competition: "AI Competitions",
      description: "We're building an AI solution for healthcare diagnostics.",
      needed: ["ML Engineer", "Data Scientist", "UI Designer"],
      members: [
        {
          uid: "leader1",
          name: "Taylor Smith",
          role: "Team Leader",
          skills: ["Project Management", "AI"],
          profilePicture: "",
        },
      ],
      lookingFor: 3,
      skills: ["Machine Learning", "Python", "Healthcare"],
      leader: {
        uid: "leader1",
        name: "Taylor Smith",
        profilePicture: "",
      },
      isOpen: true,
      applied: false,
    },
    {
      _id: "team2",
      name: "Sustainable Solutions",
      competition: "Case Competitions",
      description: "Working on sustainable business models for renewable energy.",
      needed: ["Business Analyst", "Environmental Scientist", "Engineer"],
      members: [
        {
          uid: "leader2",
          name: "Jamie Wilson",
          role: "Team Leader",
          skills: ["Business Strategy", "Sustainability"],
          profilePicture: "",
        },
      ],
      lookingFor: 2,
      skills: ["Business Analysis", "Sustainability", "Renewable Energy"],
      leader: {
        uid: "leader2",
        name: "Jamie Wilson",
        profilePicture: "",
      },
      isOpen: true,
      applied: false,
    },
  ]

  const myTeams = [
    {
      _id: "myteam1",
      name: "Web Wizards",
      competition: "Hackathons",
      description: "Building innovative web applications for social good.",
      members: [
        {
          uid: "hardcoded-user-id",
          name: "Test User",
          role: "Team Leader",
          profilePicture: "",
        },
        {
          uid: "member1",
          name: "Riley Johnson",
          role: "Frontend Developer",
          profilePicture: "",
        },
      ],
      leader: {
        uid: "hardcoded-user-id",
        name: "Test User",
        profilePicture: "",
      },
      progress: 65,
      deadlines: [
        {
          title: "Project Proposal",
          date: "2023-05-15",
          completed: true,
        },
        {
          title: "MVP Development",
          date: "2023-05-30",
          completed: false,
        },
        {
          title: "Final Submission",
          date: "2023-06-15",
          completed: false,
        },
      ],
    }
  ]

  const invitations = [
    {
      _id: "inv1",
      team: {
        id: "team3",
        name: "Data Explorers",
      },
      competition: "Data Science Competition",
      from: {
        uid: "sender1",
        name: "Casey Morgan",
        profilePicture: "",
      },
      to: {
        uid: "hardcoded-user-id",
      },
      message: "We'd love to have you join our team for the upcoming data science competition. Your skills would be a great addition!",
      status: "Pending",
      date: "1 day ago",
    }
  ]

  const sentRequests = [
    {
      _id: "req1",
      team: {
        id: "team4",
        name: "Robotics Challenge",
      },
      competition: "Robotics Competition",
      from: {
        uid: "hardcoded-user-id",
        name: "Test User",
        profilePicture: "",
      },
      to: {
        uid: "teamleader1",
        name: "Alex Chen",
      },
      message: "I'm interested in joining your robotics team. I have experience with Arduino and sensor integration.",
      status: "Pending",
      date: "2 days ago",
    }
  ]

  const suggestedMentors = [
    {
      _id: "mentor1",
      uid: "mentor1",
      name: "Dr. Sarah Johnson",
      specialization: "AI & Machine Learning",
      department: "Computer Science",
      available: "Weekdays",
      rating: 4.8,
      profilePicture: "",
    },
    {
      _id: "mentor2",
      uid: "mentor2",
      name: "Prof. Michael Chen",
      specialization: "Data Science",
      department: "Statistics",
      available: "By Appointment",
      rating: 4.5,
      profilePicture: "",
    },
    {
      _id: "mentor3",
      uid: "mentor3",
      name: "Dr. Emily Rodriguez",
      specialization: "Robotics",
      department: "Electrical Engineering",
      available: "Weekends",
      rating: 4.9,
      profilePicture: "",
    },
  ]

  // Skills list for filtering
  const skillsList = [
    "AI",
    "Machine Learning",
    "Web Development",
    "UI/UX Design",
    "Data Analysis",
    "Embedded Systems",
    "IoT",
    "Robotics",
    "CAD Design",
    "3D Printing",
    "Mobile Development",
    "Cloud Computing",
    "Blockchain",
    "Cybersecurity",
    "Business Strategy",
    "Market Research",
    "Presentation",
    "Project Management",
  ]

  // Departments list for filtering
  const departmentsList = [
    "Computer Science",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Business Administration",
    "Data Science",
    "Biomedical Engineering",
    "Environmental Science",
    "Industrial Design",
    "Civil Engineering",
  ]

  // Competition types for filtering
  const competitionTypes = [
    "Hackathons",
    "Case Competitions",
    "Robotics",
    "Drone Design",
    "Car Design",
    "Product Design",
    "AI Competitions",
    "Business Pitch",
  ]

  // SDG data for mapping
  const sdgData = {
    3: { title: "Good Health and Well-being", color: "bg-green-600", icon: "❤️" },
    4: { title: "Quality Education", color: "bg-red-500", icon: "🎓" },
    7: { title: "Affordable Energy", color: "bg-yellow-500", icon: "⚡" },
    9: { title: "Industry, Innovation and Infrastructure", color: "bg-orange-500", icon: "🏗️" },
    11: { title: "Sustainable Cities and Communities", color: "bg-yellow-600", icon: "🏙️" },
    13: { title: "Climate Action", color: "bg-teal-500", icon: "🌱" },
  }

   // Auth state listener
   useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchStudentProfile(user.uid);
        fetchTeammates(user.uid);
      } else {
        navigate('/student/dashboard');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch user profile
  const fetchStudentProfile = async (userId) => {
    try {
      setLoading(prev => ({ ...prev, user: true }));
      const response = await axios.get(`${API_URL}/student/profile/${userId}`);
      setUser({
        uid: response.data._id,
        name: response.data.name,
        contact: response.data.contact,
        department: response.data.department,
        skills: response.data.skills?.map(skill => skill.name) || [],
        experience: response.data.experience || [],
        profilePicture: response.data.profilePicture || "",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(prev => ({ ...prev, user: false }));
    }
  };

  // Fetch potential teammates
  const fetchTeammates = async (userId) => {
    try {
      if (!userId) return;
      setLoading(prev => ({ ...prev, teammates: true }));
      const myProfile = await axios.get(`${API_URL}/student/profile/${userId}`);
    const myBackendId = myProfile.data._id; // e.g., "67f019b541ba1df9650f5140"
    
    // 2. Fetch all profiles and exclude yourself using backend _id
    const response = await axios.get(`${API_URL}/student/profile`);
    const teammates = response.data
      .filter(profile => profile._id !== myBackendId) // Now comparing backend IDs
        .map(profile => ({
          _id: profile._id,
          uid: profile._id,
          name: profile.name,
          rolePreference: profile.rolePreference,
          contact: profile.contact,
          linkedin: profile.linkedin,
          github: profile.github,
          portfolio: profile.portfolio,
          department: profile.domain,
          projects: profile.projects || [],
          certifications: profile.certifications?.map(certification => certification) || [],
          skills: profile.skills?.map(skill => skill.name) || [],
          competitions: profile.experience?.map(exp => exp.competition) || [],
          availability: "Available",
          experience: "Intermediate",
          bio: profile.bio || `${profile.name} is a ${profile.domain} student`,
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
 
  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Teammate matching functions
  const calculateMutualInterests = (currentUser, profile) => {
    const userSkills = new Set(currentUser.skills);
    const profileSkills = new Set(profile.skills?.map(skill => skill.name) || []);
    return [...userSkills].filter(skill => profileSkills.has(skill));
  };

  const calculateCompatibility = (currentUser, profile) => {
    const sharedSkills = calculateMutualInterests(currentUser, profile).length;
    const userCompetitions = new Set(currentUser.competitions);
    const profileCompetitions = new Set(profile.experience?.map(exp => exp.competition) || []);
    const sharedCompetitions = [...userCompetitions].filter(comp => profileCompetitions.has(comp)).length;
    
    const maxPossible = Math.max(currentUser.skills.length, 1) + Math.max(currentUser.competitions.length, 1);
    const score = (sharedSkills * 0.7 + sharedCompetitions * 0.3) / maxPossible;
    
    return Math.floor(score * 100);
  };
  // Toggle skill selection
  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill))
    } else {
      setSelectedSkills([...selectedSkills, skill])
    }
  }

  // Toggle department selection
  const toggleDepartment = (department) => {
    if (selectedDepartments.includes(department)) {
      setSelectedDepartments(selectedDepartments.filter(d => d !== department))
    } else {
      setSelectedDepartments([...selectedDepartments, department])
    }
  }

  // Toggle competition selection
  const toggleCompetition = (competition) => {
    if (selectedCompetitions.includes(competition)) {
      setSelectedCompetitions(selectedCompetitions.filter(c => c !== competition))
    } else {
      setSelectedCompetitions([...selectedCompetitions, competition])
    }
  }

  // Handle team application
  const applyToTeam = async (teamId) => {
    try {
      // Find the team
      const team = openTeams.find(t => t._id === teamId)

      if (!team) {
        toast.error("Team not found")
        return
      }

      // In a real implementation, you would make an API call here
      toast.success("Application sent successfully")
    } catch (error) {
      console.error("Error applying to team:", error)
      toast.error("Failed to apply to team")
    }
  }

  // Handle invitation acceptance
  const acceptInvitation = async (invitationId) => {
    try {
      toast.success("Invitation accepted")
    } catch (error) {
      console.error("Error accepting invitation:", error)
      toast.error("Failed to accept invitation")
    }
  }

  // Handle invitation rejection
  const rejectInvitation = async (invitationId) => {
    try {
      toast.success("Invitation rejected")
    } catch (error) {
      console.error("Error rejecting invitation:", error)
      toast.error("Failed to reject invitation")
    }
  }

  // Open invite modal for a specific teammate
  const openInviteModal = (teammate) => {
    setSelectedTeammate(teammate)
    setShowInviteModal(true)
  }

  // Send invitation to teammate
  const sendInvitation = async (teamId, message) => {
    try {
      if (!selectedTeammate) {
        toast.error("No teammate selected")
        return
      }

      // Find the team
      const team = myTeams.find(t => t._id === teamId)

      if (!team) {
        toast.error("Team not found")
        return
      }

      // Close modal
      setShowInviteModal(false)
      setSelectedTeammate(null)

      toast.success(`Invitation sent to ${selectedTeammate.name}`)
    } catch (error) {
      console.error("Error sending invitation:", error)
      toast.error("Failed to send invitation")
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedSkills([])
    setSelectedDepartments([])
    setSelectedCompetitions([])
    setAvailabilityFilter("all")
    setSearchQuery("")
  }
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Header */}
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-gray-800/95 backdrop-blur-sm py-2 shadow-lg" : "bg-gray-900 py-3"} border-b border-gray-700`}
      >
        <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <FaGraduationCap className="text-sm" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              ScholarCompete
            </h1>
          </div>

          <nav className="hidden md:flex items-center gap-4">
            <button
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${activeTab === "find-teammates" ? "text-white bg-gray-700" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
              onClick={() => setActiveTab("find-teammates")}
            >
              <FaUsers className="inline mr-1" /> Find Teammates
            </button>
            <button
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${activeTab === "open-teams" ? "text-white bg-gray-700" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
              onClick={() => setActiveTab("open-teams")}
            >
              <FaUserPlus className="inline mr-1" /> Open Teams
            </button>
            <button
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${activeTab === "my-teams" ? "text-white bg-gray-700" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
              onClick={() => setActiveTab("my-teams")}
            >
              <FaTrophy className="inline mr-1" /> My Teams
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors relative">
              <FaBell />
              {invitations.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

           {/* Profile Photo with Dropdown */}
           {!loading.user && (
              <div className="relative group">
                <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border-2 border-blue-500/50 cursor-pointer hover:border-blue-400 transition-all duration-200">
                  <img
                   src={user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : "/default-profile.png"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=User&background=random`;
                    }}
                  />
                </div>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <p className="text-sm text-white font-medium">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.contact}</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                   onClick={() => {navigate('/student-dashboard');}}>
                    <FaUser className="text-gray-400" />
                    My Profile
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                                                    onClick={() => {
                                                                 // Add your logout logic here
                                                                 auth.signOut();
                                                                 navigate('/login');}}>
                    <FaSignOutAlt className="text-gray-400" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar - Filters */}
            <div className="lg:w-1/4 space-y-6">
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Filters</h2>
                  <button onClick={clearFilters} className="text-xs text-blue-400 hover:text-blue-300">
                    Clear All
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Search */}
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

                  {/* Availability Filter */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Availability</h3>
                    <div className="flex gap-2">
                      <button
                        className={`px-3 py-1 text-xs rounded-full ${availabilityFilter === "all" ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                        onClick={() => setAvailabilityFilter("all")}
                      >
                        All
                      </button>
                      <button
                        className={`px-3 py-1 text-xs rounded-full ${availabilityFilter === "Available" ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                        onClick={() => setAvailabilityFilter("Available")}
                      >
                        Available
                      </button>
                      <button
                        className={`px-3 py-1 text-xs rounded-full ${availabilityFilter === "Busy" ? "bg-red-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                        onClick={() => setAvailabilityFilter("Busy")}
                      >
                        Busy
                      </button>
                    </div>
                  </div>

                  {/* Skills Filter - Collapsed by default on mobile */}
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

                  {/* Department Filter - Collapsed by default on mobile */}
                  <div>
                    <button
                      className="flex justify-between items-center w-full text-sm font-medium mb-2"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <span>Department</span>
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
                            {departmentsList.map((dept, index) => (
                              <button
                                key={index}
                                className={`px-2 py-1 text-xs rounded-full ${selectedDepartments.includes(dept) ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                                onClick={() => toggleDepartment(dept)}
                              >
                                {dept}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Competition Interest Filter - Collapsed by default on mobile */}
                  <div>
                    <button
                      className="flex justify-between items-center w-full text-sm font-medium mb-2"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <span>Competition Interest</span>
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
                            {competitionTypes.map((comp, index) => (
                              <button
                                key={index}
                                className={`px-2 py-1 text-xs rounded-full ${selectedCompetitions.includes(comp) ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                                onClick={() => toggleCompetition(comp)}
                              >
                                {comp}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* My Status Card */}
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <h2 className="text-lg font-bold mb-4">My Status</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${user.availability === "Available" ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <span className="text-sm">{user.availability}</span>
                  </div>
                </div>
              </div>

              {/* SDG Mapping */}
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <h2 className="text-lg font-bold mb-4">SDG Alignment</h2>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(sdgData).map(([sdg, data]) => (
                    <span
                      key={sdg}
                      className={`px-2 py-1 text-xs rounded-full text-white ${data.color} flex items-center gap-1`}
                      title={data.title}
                    >
                      {data.icon} {sdg}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:w-2/4">
              {/* Find Teammates Tab */}
              {activeTab === "find-teammates" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Find Teammates</h1>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{potentialTeammates.length} results</span>
                      <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                        <FaFilter />
                      </button>
                    </div>
                  </div>

                  {loading.teammates ? (
                    <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p>Loading teammates...</p>
                    </div>
                  ) : (
                    <>
                      {/* AI Recommended Section */}
                      <div className="mb-8">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                          <FaMagic className="text-purple-400" /> AI-Recommended Teammates
                        </h2>
                        <div className="space-y-4">
                          {potentialTeammates
                            .filter((teammate) => teammate.compatibility >= 85)
                            .slice(0, 2)
                            .map((teammate) => (
                              <motion.div
                                key={teammate._id}
                                className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-purple-500/30 transition-colors"
                                whileHover={{ y: -2 }}
                              >
                                <div className="flex items-start gap-4">
                                  <div className="w-16 h-16 bg-gray-700 rounded-full overflow-hidden border-2 border-purple-500/50">
                                    <img
                                     src={teammate?.profilePicture ? `http://localhost:5000${teammate.profilePicture}` : "/default-profile.png"}
                                      alt={teammate.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.onerror = null
                                        e.target.src = "/placeholder.svg?height=64&width=64"
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h3 className="font-bold text-lg">{teammate.name}</h3>
                                        <p className="text-gray-400 text-sm">{teammate.department}</p>
                                      </div>
                                      <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs font-medium">
                                        {teammate.compatibility}% Match
                                      </span>
                                    </div>

                                    <div className="mt-2">
                                      <p className="text-sm text-gray-300 mb-2">{teammate.bio}</p>
                                      <div className="flex flex-wrap gap-2 mb-3">
                                        {teammate.skills.map((skill, idx) => (
                                          <span key={idx} className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                                            {skill}
                                          </span>
                                        ))}
                                      </div>

                                      <div className="mt-3">
                                        <h4 className="text-xs font-medium text-gray-400 mb-1">Mutual Interests</h4>
                                        <div className="flex flex-wrap gap-2">
                                          {teammate.mutualInterests &&
                                            teammate.mutualInterests.map((interest, idx) => (
                                              <span
                                                key={idx}
                                                className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full"
                                              >
                                                {interest}
                                              </span>
                                            ))}
                                        </div>
                                      </div>

                                      <div className="flex justify-end mt-3 gap-2">
                                        <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-medium transition-colors"
                                        onClick={() => {
                                          setSelectedProfile(teammate);
                                          setShowProfileModal(true);
                                        }}>
                                          View Profile
                                        </button>
                                        <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-medium transition-colors">
                                          Chat
                                        </button>
                                        <button
                                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                                          onClick={() => openInviteModal(teammate)}
                                        >
                                          <FaUserPlus className="text-xs" /> Invite
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                        </div>
                      </div>

                      {/* All Teammates Section */}
                      <div>
                        <h2 className="text-lg font-bold mb-4">All Potential Teammates</h2>
                        <div className="space-y-4">
                          {potentialTeammates.length > 0 ? (
                            potentialTeammates.map((teammate) => (
                              <motion.div
                                key={teammate._id}
                                className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-blue-500/30 transition-colors"
                                whileHover={{ y: -2 }}
                              >
                                <div className="flex items-start gap-4">
                                  <div className="w-16 h-16 bg-gray-700 rounded-full overflow-hidden border-2 border-blue-500/50">
                                    <img
                                       src={teammate?.profilePicture ? `http://localhost:5000${teammate.profilePicture}` : "/default-profile.png"}
                                      alt={teammate.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.onerror = null
                                        e.target.src = "/placeholder.svg?height=64&width=64"
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h3 className="font-bold text-lg">{teammate.name}</h3>
                                        <p className="text-gray-400 text-sm">{teammate.department}</p>
                                      </div>
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          teammate.availability === "Available"
                                            ? "bg-green-500/20 text-green-400"
                                            : "bg-red-500/20 text-red-400"
                                        }`}
                                      >
                                        {teammate.availability}
                                      </span>
                                    </div>

                                    <div className="mt-2">
                                      <p className="text-sm text-gray-300 mb-2">{teammate.bio}</p>
                                      <div className="flex flex-wrap gap-2 mb-3">
                                        {teammate.skills.map((skill, idx) => (
                                          <span key={idx} className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                                            {skill}
                                          </span>
                                        ))}
                                      </div>

                                      <div className="mt-3">
                                        <h4 className="text-xs font-medium text-gray-400 mb-1">
                                          Competition Experience
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                          {teammate.competitions &&
                                            teammate.competitions.map((comp, idx) => (
                                              <span key={idx} className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                                                {comp}
                                              </span>
                                            ))}
                                        </div>
                                      </div>

                                      <div className="flex justify-end mt-3 gap-2">
                                        <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-medium transition-colors"
                                        onClick={() => {
                                          setSelectedProfile(teammate);
                                          setShowProfileModal(true);
                                        }}>
                                          View Profile
                                        </button>
                                        <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-medium transition-colors">
                                          Chat
                                        </button>
                                        <button
                                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                                          onClick={() => openInviteModal(teammate)}
                                        >
                                          <FaUserPlus className="text-xs" /> Invite
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))
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
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Open Teams Tab */}
              {activeTab === "open-teams" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Open Teams</h1>
                    <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                      <FaPlus className="text-xs" /> Post Team Opening
                    </button>
                  </div>

                  <div className="space-y-6">
                    {openTeams.map((team) => (
                      <motion.div
                        key={team._id}
                        className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-blue-500/30 transition-colors"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gray-700 rounded-full overflow-hidden border-2 border-blue-500/50">
                            <img
                              src={team.leader.profilePicture || "/placeholder.svg?height=64&width=64"}
                              alt={team.leader.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = "/placeholder.svg?height=64&width=64"
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-lg">{team.name}</h3>
                                <p className="text-blue-400 text-sm">{team.competition}</p>
                              </div>
                              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                                {team.members.length} members • Need {team.lookingFor} more
                              </span>
                            </div>

                            <div className="mt-2">
                              <p className="text-sm text-gray-300 mb-3">{team.description}</p>

                              <div className="mb-3">
                                <h4 className="text-xs font-medium text-gray-400 mb-1">Looking for:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {team.needed.map((role, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full"
                                    >
                                      {role}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="mb-4">
                                <h4 className="text-xs font-medium text-gray-400 mb-1">Required Skills:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {team.skills.map((skill, idx) => (
                                    <span key={idx} className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="flex justify-between items-center mt-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400">Team Leader: {team.leader.name}</span>
                                </div>
                                {team.applied ? (
                                  <span className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg text-xs font-medium">
                                    Application Sent
                                  </span>
                                ) : (
                                  <button
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                                    onClick={() => applyToTeam(team._id)}
                                  >
                                    Apply to Join
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* My Teams Tab */}
              {activeTab === "my-teams" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">My Teams</h1>
                    <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                      <FaPlus className="text-xs" /> Create Team
                    </button>
                  </div>

                  <div className="space-y-8">
                    {myTeams.map((team) => (
                      <div key={team._id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-xl">{team.name}</h3>
                              <p className="text-blue-400 text-sm">{team.competition}</p>
                            </div>
                            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                              {team.members.length} members
                            </span>
                          </div>

                          <p className="text-sm text-gray-300 mb-4">{team.description}</p>

                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-2">Team Progress</h4>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full"
                                style={{ width: `${team.progress}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-gray-400">Progress: {team.progress}%</span>
                              <span className="text-xs text-gray-400">
                                {team.deadlines.filter((d) => d.completed).length}/{team.deadlines.length}{" "}
                                milestones completed
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-700 p-5">
                          <h4 className="text-sm font-medium mb-3">Team Members</h4>
                          <div className="space-y-3">
                            {team.members.map((member, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden">
                                  <img
                                    src={member.profilePicture || "/placeholder.svg?height=40&width=40"}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null
                                      e.target.src = "/placeholder.svg?height=40&width=40"
                                    }}
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{member.name}</p>
                                  <p className="text-xs text-gray-400">{member.role}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-gray-700 p-5">
                          <h4 className="text-sm font-medium mb-3">Upcoming Deadlines</h4>
                          <div className="space-y-2">
                            {team.deadlines
                              .filter((deadline) => !deadline.completed)
                              .map((deadline, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center p-2 bg-gray-700/50 rounded-lg"
                                >
                                  <span className="text-sm">{deadline.title}</span>
                                  <span className="text-xs text-gray-400">{deadline.date}</span>
                                </div>
                              ))}
                          </div>
                        </div>

                        <div className="border-t border-gray-700 p-5 flex justify-between">
                          <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-medium transition-colors">
                            Team Details
                          </button>
                          <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
                            Team Chat
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - Invitations & Notifications */}
            <div className="lg:w-1/4 space-y-6 mt-8 lg:mt-0">
              {/* Invitations Section */}
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <h2 className="text-lg font-bold mb-4">Invitations</h2>
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div key={invitation._id} className="p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img
                            src={invitation.from.profilePicture || "/placeholder.svg?height=40&width=40"}
                            alt={invitation.from.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "/placeholder.svg?height=40&width=40"
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{invitation.from.name}</p>
                          <p className="text-xs text-gray-400">{invitation.team.name}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 mb-3">{invitation.message}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">{invitation.date}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => rejectInvitation(invitation._id)}
                            className="p-1.5 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-xs transition-colors"
                          >
                            <FaTimes />
                          </button>
                          <button
                            onClick={() => acceptInvitation(invitation._id)}
                            className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs transition-colors"
                          >
                            <FaCheck />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sent Requests Section */}
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <h2 className="text-lg font-bold mb-4">Sent Requests</h2>
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <div key={request._id} className="p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img
                            src={request.to.profilePicture || "/placeholder.svg?height=40&width=40"}
                            alt={request.to.name || "Team Leader"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "/placeholder.svg?height=40&width=40"
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{request.to.name || "Team Leader"}</p>
                          <p className="text-xs text-gray-400">{request.team.name}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 mb-3">{request.message}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">{request.date}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            request.status === "Pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : request.status === "Accepted"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mentor Recommendations */}
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <h2 className="text-lg font-bold mb-4">Suggested Mentors</h2>
                <div className="space-y-4">
                  {suggestedMentors.map((mentor) => (
                    <div key={mentor._id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img
                          src={mentor.profilePicture || "/placeholder.svg?height=48&width=48"}
                          alt={mentor.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = "/placeholder.svg?height=48&width=48"
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{mentor.name}</p>
                        <p className="text-xs text-gray-400">{mentor.specialization}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex items-center text-yellow-400 text-xs">
                            <FaStar />
                            <span className="ml-1">{mentor.rating}</span>
                          </div>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-400">{mentor.available}</span>
                        </div>
                      </div>
                      <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs transition-colors">
                        <FaEnvelope />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
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
                <h2 className="text-xl font-bold">Invite to Team</h2>
                <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-white">
                  ×
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-700">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={selectedTeammate.profilePicture || "/placeholder.svg?height=48&width=48"}
                    alt={selectedTeammate.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = "/placeholder.svg?height=48&width=48"
                    }}
                  />
                </div>
                <div>
                  <p className="font-medium">{selectedTeammate.name}</p>
                  <p className="text-sm text-gray-400">{selectedTeammate.department}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Team</label>
                <select
                  id="team-select"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                >
                  {myTeams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  id="invitation-message"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white h-24 resize-none"
                  placeholder="Write a personalized invitation message..."
                  defaultValue={`Hi ${selectedTeammate.name}, I'd like to invite you to join my team for the upcoming competition. Your skills in ${selectedTeammate.skills[0] || "your field"} would be a great addition to our team.`}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const teamId = document.getElementById("team-select").value
                    const message = document.getElementById("invitation-message").value
                    sendInvitation(teamId, message)
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Send Invitation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {showProfileModal && (
      <ProfileModal 
        profile={selectedProfile} 
        onClose={() => setShowProfileModal(false)} 
      />
    )}
    </div>
  )
}