import { useState, useEffect } from 'react';
import { 
  FaBell, FaUser, FaSearch, FaTrophy, FaUsers, 
  FaComment, FaHandshake, FaBriefcase, FaCalendarAlt,
  FaGraduationCap, FaClock, FaMedal, FaStar, FaRegStar,
  FaFilter, FaPlus, FaUserPlus, FaChevronLeft, FaChevronDown,
  FaMagic, FaHeart, FaRegHeart, FaLightbulb, FaUserTie, FaUserFriends, FaChevronRight,FaSignOutAlt,
  FaGlobe, FaChartLine
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../config/firebase";

const StudentLandingPage = () => {
  // All hooks must be called unconditionally at the top level
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState("/default-profile.png");
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFeature, setActiveFeature] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('competitions');
  const [savedCompetitions, setSavedCompetitions] = useState([1]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMatchmaker, setShowMatchmaker] = useState(false);
  const [matchmakerPreferences, setMatchmakerPreferences] = useState({
    interests: [],
    skills: [],
    sdgs: []
  });

  const user = auth.currentUser;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchStudentProfile();
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      if (user) {
        const { data } = await axios.get(`http://localhost:5000/api/student/profile/${user.uid}`);
        setStudent(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setStudent({
        name: "New User",
        rolePreference: "Aspiring Developer",
        profilePicture: "/default-profile.png",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (student?.profilePicture) {
      // If it's a Firebase storage reference, you might need to get download URL
      // Otherwise, use the direct URL
      setProfileImage(student.profilePicture);
    } else {
      setProfileImage("/default-profile.png");
    }
  }, [student]);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const defaultProfile = {
    name: "New User",
    rolePreference: "Aspiring Developer",
    profilePicture: "/default-profile.png",
  };

  const profileData = student || defaultProfile;

  const toggleSaveCompetition = (id) => {
    if (savedCompetitions.includes(id)) {
      setSavedCompetitions(savedCompetitions.filter(compId => compId !== id));
    } else {
      setSavedCompetitions([...savedCompetitions, id]);
    }
  };

  // Sample Data
  const competitions = [
    { 
      id: 1, 
      title: "Sustainability Hackathon 2024", 
      date: "Jun 1 - Aug 31", 
      deadline: "May 15, 2024",
      daysLeft: 12,
      image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7",
      sdgs: [4, 7, 13],
      description: "Develop innovative solutions for environmental challenges. Open to all disciplines.",
      type: "Hackathon",
      teamSize: "2-5 members",
      prize: "$10,000",
      organization: "GreenTech Foundation",
      rating: 4.8,
      participants: 320,
      recommended: true
    },
    { 
      id: 2, 
      title: "AI for Social Good Challenge", 
      date: "Jul 15 - Sep 15", 
      deadline: "Jun 30, 2024",
      daysLeft: 28,
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
      sdgs: [4, 9, 10],
      description: "Apply AI technologies to address social inequalities and accessibility issues.",
      type: "Research Competition",
      teamSize: "1-3 members",
      prize: "Research grant + mentorship",
      organization: "AI Ethics Institute",
      rating: 4.6,
      participants: 180,
      recommended: false
    },
    { 
      id: 3, 
      title: "Global Health Innovation Awards", 
      date: "Aug 1 - Oct 31", 
      deadline: "Jul 15, 2024",
      daysLeft: 43,
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef",
      sdgs: [3, 9, 17],
      description: "Develop solutions to improve healthcare access in underserved communities worldwide.",
      type: "Innovation Challenge",
      teamSize: "1-4 members",
      prize: "$15,000 + incubation support",
      organization: "World Health Innovators",
      rating: 4.7,
      participants: 210,
      recommended: true
    },
    { 
      id: 4, 
      title: "Future Cities Design Competition", 
      date: "Sep 5 - Nov 5", 
      deadline: "Aug 20, 2024",
      daysLeft: 79,
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
      sdgs: [11, 12, 13],
      description: "Redesign urban spaces for sustainability and community wellbeing.",
      type: "Design Competition",
      teamSize: "Individual or teams of 2",
      prize: "$8,000 + publication",
      organization: "Urban Futures Collective",
      rating: 4.5,
      participants: 150,
      recommended: false
    },
    { 
      id: 5, 
      title: "Blockchain for Transparency Hackathon", 
      date: "Oct 10 - Dec 10", 
      deadline: "Sep 25, 2024",
      daysLeft: 115,
      image: "https://images.unsplash.com/photo-1639762681057-408e52192e55",
      sdgs: [8, 16, 17],
      description: "Create blockchain solutions to enhance transparency in governance and supply chains.",
      type: "Hackathon",
      teamSize: "3-6 members",
      prize: "$12,000 + potential implementation",
      organization: "Decentralized Solutions Org",
      rating: 4.9,
      participants: 275,
      recommended: true
    }
  ];
  
  const suggestedTeams = [
    {
      id: 1,
      name: "Eco Innovators",
      competition: "Sustainability Hackathon",
      needed: ["Frontend Developer", "UX Designer"],
      members: 3,
      lookingFor: 2,
      skills: ["React", "Figma", "Sustainability"],
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: 2,
      name: "AI Justice League",
      competition: "AI for Social Good Challenge",
      needed: ["Data Scientist", "Ethics Researcher"],
      members: 2,
      lookingFor: 1,
      skills: ["Python", "Machine Learning", "Social Sciences"],
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 3,
      name: "Health Pioneers",
      competition: "Global Health Innovation Awards",
      needed: ["Biomedical Engineer", "Public Health Expert"],
      members: 1,
      lookingFor: 3,
      skills: ["Prototyping", "Healthcare Systems", "Field Research"],
      avatar: "https://randomuser.me/api/portraits/women/68.jpg"
    },
    {
      id: 4,
      name: "Urban Visionaries",
      competition: "Future Cities Design Competition",
      needed: ["Architect", "Environmental Planner"],
      members: 2,
      lookingFor: 1,
      skills: ["AutoCAD", "Sustainable Design", "Community Engagement"],
      avatar: "https://randomuser.me/api/portraits/men/55.jpg"
    }
  ];
  
  const suggestedMentors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialization: "Sustainability Tech",
      available: "3 sessions/week",
      rating: 4.9,
      avatar: "https://randomuser.me/api/portraits/women/65.jpg"
    },
    {
      id: 2,
      name: "Prof. Michael Chen",
      specialization: "AI Ethics",
      available: "2 sessions/week",
      rating: 4.7,
      avatar: "https://randomuser.me/api/portraits/men/22.jpg"
    },
    {
      id: 3,
      name: "Dr. Aisha Rahman",
      specialization: "Global Health Innovations",
      available: "4 sessions/month",
      rating: 4.8,
      avatar: "https://randomuser.me/api/portraits/women/33.jpg"
    },
    {
      id: 4,
      name: "Arch. David Müller",
      specialization: "Sustainable Urban Design",
      available: "1 session/week",
      rating: 4.6,
      avatar: "https://randomuser.me/api/portraits/men/40.jpg"
    },
  ];
  
  const sdgData = {
    3: { title: "Good Health and Well-being", color: "bg-green-600", icon: "❤️" },
    4: { title: "Quality Education", color: "bg-red-500", icon: "🎓" },
    7: { title: "Affordable Energy", color: "bg-yellow-500", icon: "⚡" },
    8: { title: "Decent Work and Economic Growth", color: "bg-red-700", icon: "💼" },
    9: { title: "Industry, Innovation and Infrastructure", color: "bg-orange-500", icon: "🏗️" },
    10: { title: "Reduced Inequalities", color: "bg-pink-600", icon: "⚖️" },
    11: { title: "Sustainable Cities and Communities", color: "bg-yellow-600", icon: "🏙️" },
    12: { title: "Responsible Consumption and Production", color: "bg-brown-500", icon: "🔄" },
    13: { title: "Climate Action", color: "bg-teal-500", icon: "🌱" },
    16: { title: "Peace, Justice and Strong Institutions", color: "bg-blue-700", icon: "⚖️" },
    17: { title: "Partnerships for the Goals", color: "bg-blue-500", icon: "🤝" }
  };
  
  const upcomingDeadlines = [
    {
      id: 1,
      title: "Sustainability Hackathon Registration",
      date: "May 15, 2024",
      daysLeft: 12,
      competitionId: 1
    },
    {
      id: 2,
      title: "AI for Social Good Challenge Submission",
      date: "Jun 30, 2024",
      daysLeft: 28,
      competitionId: 2
    },
    {
      id: 3,
      title: "Global Health Innovation Awards Proposal",
      date: "Jul 15, 2024",
      daysLeft: 43,
      competitionId: 3
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === Math.ceil(competitions.length / 3) - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? Math.ceil(competitions.length / 3) - 1 : prev - 1));
  };

  const toggleSDGPreference = (sdg) => {
    setMatchmakerPreferences(prev => ({
      ...prev,
      sdgs: prev.sdgs.includes(sdg) 
        ? prev.sdgs.filter(s => s !== sdg) 
        : [...prev.sdgs, sdg]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Header */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-gray-800/95 backdrop-blur-sm py-2 shadow-lg' : 'bg-gray-900 py-3'} border-b border-gray-700`}>
  <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
        <FaGraduationCap className="text-sm" />
      </div>
      <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">ScholarCompete</h1>
    </div>
    
    <nav className="hidden md:flex items-center gap-4">
      <button
        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'competitions' ? 'text-white bg-gray-700' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
        onClick={() => setActiveTab('competitions')}
      >
        <FaTrophy className="inline mr-1" /> Competitions
      </button>
      <button
        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'team-match' ? 'text-white bg-gray-700' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
        onClick={() => setActiveTab('team-match')}
      >
        <FaUsers className="inline mr-1" /> Team Match
      </button>
      <button
        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'mentorship' ? 'text-white bg-gray-700' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
        onClick={() => setActiveTab('mentorship')}
      >
        <FaComment className="inline mr-1" /> Mentorship
      </button>
    </nav>
    
    <div className="flex items-center gap-4">
      <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors relative">
        <FaBell />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
      
      {/* Enhanced Profile Photo with Dropdown */}
      <div className="relative group">
        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border-2 border-blue-500/50 cursor-pointer hover:border-blue-400 transition-all duration-200">
          <img 
            src={student?.profilePicture ? `http://localhost:5000${student.profilePicture}` : "/default-profile.png"}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-profile.png";
              setProfileImage("/default-profile.png");
            }}
          />
        </div>
        
        {/* Dropdown Menu */}
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200">
          <div className="px-4 py-2 border-b border-gray-700">
            <p className="text-sm text-white font-medium">{student?.name || 'User'}</p>
            <p className="text-xs text-gray-400">{student?.email || ''}</p>
          </div>
          <button 
            onClick={() => {
              // Add your logout logic here
              auth.signOut();
              navigate('/login');
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
          >
            <FaSignOutAlt className="text-gray-400" />
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</header>
      {/* Hero Section */}
      <section className="pt-28 pb-12 px-4 sm:px-6">
        <div className="container mx-auto flex flex-col lg:flex-row items-center gap-8">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:w-1/2 space-y-6"
          >
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Welcome,<span className="text-blue-400">{profileData.name}!</span> 
            </h1>
            <p className="text-lg text-gray-300 max-w-lg">
              The complete platform for academic competitions, team building, and professional growth.
            </p>
            
            <div className="relative max-w-md w-full">
              <input
                type="text"
                placeholder="Search competitions, teammates, resources..."
                className="w-full bg-gray-800 rounded-full py-3 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 border border-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                <FaSearch />
              </button>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {Object.entries(sdgData).slice(0, 3).map(([sdg, data]) => (
                <span 
                  key={sdg} 
                  className={`px-3 py-1 text-xs rounded-full text-white ${data.color} flex items-center gap-1`}
                >
                  {data.icon} SDG {sdg}
                </span>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:w-1/2 w-full max-w-xl"
          >
            <div className="w-full bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FaClock className="text-blue-400" /> Upcoming Deadlines
                </h3>
                <button className="text-blue-400 text-sm flex items-center gap-1 hover:text-blue-300">
                  View all <FaChevronRight className="text-xs" />
                </button>
              </div>
              <div className="space-y-3">
                {upcomingDeadlines.map(deadline => (
                  <motion.div 
                    key={deadline.id} 
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-700/50 p-4 rounded-lg border-l-4 border-blue-500 hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm sm:text-base">{deadline.title}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${deadline.daysLeft < 7 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {deadline.daysLeft} {deadline.daysLeft === 1 ? 'day' : 'days'} left
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm mb-2">Due: {deadline.date}</p>
                    <div className="w-full bg-gray-600 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-1.5 rounded-full" 
                        style={{ width: `${Math.max(10, 100 - (deadline.daysLeft/30)*100)}%` }}
                      ></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Competitions Carousel */}
      <section className="py-12 bg-gradient-to-b from-gray-900 to-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Featured Competitions</h2>
              <p className="text-gray-400">Top picks based on your profile</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={prevSlide}
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <FaChevronLeft />
              </button>
              <button 
                onClick={nextSlide}
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <motion.div
              className="flex transition-transform duration-300"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {competitions.map((comp) => (
                <div key={comp.id} className="w-full flex-shrink-0 px-2">
                  <motion.div 
                    className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-shadow border border-gray-700 hover:border-blue-500/30 group relative"
                    whileHover={{ y: -5 }}
                  >
                    {comp.recommended && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xs px-2 py-1 rounded-full z-10">
                        Recommended
                      </div>
                    )}
                    <div className="h-48 bg-gray-700 overflow-hidden relative">
                      <img 
                        src={comp.image} 
                        alt={comp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button 
                        className="absolute top-3 right-3 p-2 bg-gray-900/60 rounded-full hover:bg-gray-800 transition-colors"
                        onClick={() => toggleSaveCompetition(comp.id)}
                      >
                        {savedCompetitions.includes(comp.id) ? (
                          <FaHeart className="text-red-400" />
                        ) : (
                          <FaRegHeart className="text-gray-300 hover:text-red-400" />
                        )}
                      </button>
                      <div className="absolute bottom-3 left-3 flex gap-2">
                        {comp.sdgs.map((sdg) => (
                          <span 
                            key={sdg} 
                            className={`px-2 py-1 text-xs rounded-full text-white ${sdgData[sdg]?.color} flex items-center gap-1`}
                            title={sdgData[sdg]?.title}
                          >
                            {sdgData[sdg]?.icon} {sdg}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold line-clamp-2">{comp.title}</h3>
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded whitespace-nowrap ml-2">
                          {comp.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-400 text-xs mb-3 gap-3">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt /> {comp.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaUsers /> {comp.participants}+
                        </span>
                        <span className="flex items-center gap-1 text-yellow-400">
                          <FaStar /> {comp.rating}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{comp.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-400">{comp.organization}</p>
                          <p className="text-sm font-medium text-blue-400">
                            <FaMedal className="inline mr-1" /> {comp.prize}
                          </p>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Your Competition Toolkit</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Everything you need to find, join, and succeed in academic competitions
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {/* Core Features */}
            <motion.div
              className={`p-4 rounded-xl cursor-pointer transition-all ${activeFeature === 'profile' ? 'bg-gray-700 scale-105 shadow-lg' : 'bg-gray-800 hover:bg-gray-700'}`}
              whileHover={{ y: -5 }}
              onClick={() => navigate("/student-dashboard")}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                <FaUser className="text-xl" />
              </div>
              <h3 className="text-center text-sm font-medium">Profile</h3>
            </motion.div>

            <motion.div
              className={`p-4 rounded-xl cursor-pointer transition-all ${activeFeature === 'competitions' ? 'bg-gray-700 scale-105 shadow-lg' : 'bg-gray-800 hover:bg-gray-700'}`}
              whileHover={{ y: -5 }}
              onClick={() => setActiveFeature('competitions')}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 shadow-md">
                <FaTrophy className="text-xl" />
              </div>
              <h3 className="text-center text-sm font-medium">Competitions</h3>
            </motion.div>

            <motion.div
              className={`p-4 rounded-xl cursor-pointer transition-all ${activeFeature === 'team-match' ? 'bg-gray-700 scale-105 shadow-lg' : 'bg-gray-800 hover:bg-gray-700'}`}
              whileHover={{ y: -5 }}
              onClick={() => navigate("/find-teammates")}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 mx-auto bg-gradient-to-br from-green-500 to-green-600 shadow-md">
                <FaUserFriends className="text-xl" />
              </div>
              <h3 className="text-center text-sm font-medium">Team Match</h3>
            </motion.div>

            <motion.div
              className={`p-4 rounded-xl cursor-pointer transition-all ${activeFeature === 'mentorship' ? 'bg-gray-700 scale-105 shadow-lg' : 'bg-gray-800 hover:bg-gray-700'}`}
              whileHover={{ y: -5 }}
              onClick={() => setActiveFeature('mentorship')}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 mx-auto bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-md">
                <FaUserTie className="text-xl" />
              </div>
              <h3 className="text-center text-sm font-medium">Mentorship</h3>
            </motion.div>

            {/* Additional Features in Toolkit */}
            <motion.div
              className={`p-4 rounded-xl cursor-pointer transition-all ${activeFeature === 'sdg-tracker' ? 'bg-gray-700 scale-105 shadow-lg' : 'bg-gray-800 hover:bg-gray-700'}`}
              whileHover={{ y: -5 }}
              onClick={() => setActiveFeature('sdg-tracker')}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 mx-auto bg-gradient-to-br from-teal-500 to-teal-600 shadow-md">
                <FaGlobe className="text-xl" />
              </div>
              <h3 className="text-center text-sm font-medium">SDG Tracker</h3>
            </motion.div>

            <motion.div
              className={`p-4 rounded-xl cursor-pointer transition-all ${activeFeature === 'progress' ? 'bg-gray-700 scale-105 shadow-lg' : 'bg-gray-800 hover:bg-gray-700'}`}
              whileHover={{ y: -5 }}
              onClick={() => navigate("/add-goals")}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
                <FaChartLine className="text-xl" />
              </div>
              <h3 className="text-center text-sm font-medium">Progress</h3>
            </motion.div>

            <motion.div
              className={`p-4 rounded-xl cursor-pointer transition-all ${activeFeature === 'internships' ? 'bg-gray-700 scale-105 shadow-lg' : 'bg-gray-800 hover:bg-gray-700'}`}
              whileHover={{ y: -5 }}
              onClick={() => setActiveFeature('internships')}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 mx-auto bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md">
                <FaBriefcase className="text-xl" />
              </div>
              <h3 className="text-center text-sm font-medium">Internships</h3>
            </motion.div>

            <motion.div
              className={`p-4 rounded-xl cursor-pointer transition-all ${activeFeature === 'matchmaker' ? 'bg-gray-700 scale-105 shadow-lg' : 'bg-gray-800 hover:bg-gray-700'}`}
              whileHover={{ y: -5 }}
              onClick={() => {
                setActiveFeature('matchmaker');
                setActiveTab('competitions');
                setShowMatchmaker(true);
              }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 mx-auto bg-gradient-to-br from-red-500 to-purple-600 shadow-md">
                <FaMagic className="text-xl" />
              </div>
              <h3 className="text-center text-sm font-medium">Matchmaker</h3>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="flex overflow-x-auto pb-2 scrollbar-hide">
            <button
              className={`px-5 py-3 font-medium whitespace-nowrap ${activeTab === 'competitions' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('competitions')}
            >
              <FaTrophy className="inline mr-2" /> Competitions
            </button>
            <button
              className={`px-5 py-3 font-medium whitespace-nowrap ${activeTab === 'team-match' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('team-match')}
            >
              <FaUsers className="inline mr-2" /> Team Match
            </button>
            <button
              className={`px-5 py-3 font-medium whitespace-nowrap ${activeTab === 'mentorship' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setActiveTab('mentorship')}
            >
              <FaComment className="inline mr-2" /> Mentorship
            </button>
          </div>
        </div>

        {/* Competitions Tab */}
        {activeTab === 'competitions' && (
          <section className="mb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold">All Competitions</h2>
                <p className="text-gray-400 text-sm">Find your next challenge</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48 min-w-[120px]">
                  <select className="appearance-none w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white">
                    <option>All Categories</option>
                    <option>Hackathons</option>
                    <option>Case Competitions</option>
                    <option>Research</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                </div>
                <div className="relative flex-1 sm:w-48 min-w-[120px]">
                  <select className="appearance-none w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white">
                    <option>All SDGs</option>
                    {Object.keys(sdgData).map(sdg => (
                      <option key={sdg}>SDG {sdg}</option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitions.map((comp) => (
                <motion.div 
                  key={comp.id}
                  className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-shadow border border-gray-700 hover:border-blue-500/30 group"
                  whileHover={{ y: -5 }}
                >
                  <div className="h-48 bg-gray-700 overflow-hidden relative">
                    <img 
                      src={comp.image} 
                      alt={comp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button 
                      className="absolute top-3 right-3 p-2 bg-gray-900/60 rounded-full hover:bg-gray-800 transition-colors"
                      onClick={() => toggleSaveCompetition(comp.id)}
                    >
                      {savedCompetitions.includes(comp.id) ? (
                        <FaHeart className="text-red-400" />
                      ) : (
                        <FaRegHeart className="text-gray-300 hover:text-red-400" />
                      )}
                    </button>
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      {comp.sdgs.map((sdg) => (
                        <span 
                          key={sdg} 
                          className={`px-2 py-1 text-xs rounded-full text-white ${sdgData[sdg]?.color} flex items-center gap-1`}
                          title={sdgData[sdg]?.title}
                        >
                          {sdgData[sdg]?.icon} {sdg}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold line-clamp-2">{comp.title}</h3>
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded whitespace-nowrap ml-2">
                        {comp.type}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-400 text-xs mb-3 gap-3">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt /> {comp.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaUsers /> {comp.participants}+
                      </span>
                      <span className="flex items-center gap-1 text-yellow-400">
                        <FaStar /> {comp.rating}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{comp.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-400">{comp.organization}</p>
                        <p className="text-sm font-medium text-blue-400">
                          <FaMedal className="inline mr-1" /> {comp.prize}
                        </p>
                      </div>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Matchmaker Section (shown when activated from toolkit) */}
            <AnimatePresence>
              {showMatchmaker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden mt-12"
                >
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <FaMagic className="text-purple-400" /> Competition Matchmaker
                      </h2>
                      <button 
                        onClick={() => setShowMatchmaker(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-bold mb-3">Which SDGs interest you?</h3>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(sdgData).map(([sdg, data]) => (
                            <button
                              key={sdg}
                              onClick={() => toggleSDGPreference(Number(sdg))}
                              className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 transition-all ${
                                matchmakerPreferences.sdgs.includes(Number(sdg))
                                  ? `${data.color} text-white`
                                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                            >
                              {data.icon} SDG {sdg}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold mb-3">Your perfect competition would be...</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                            <input type="checkbox" id="hackathon" className="accent-blue-500" />
                            <label htmlFor="hackathon" className="text-sm">Fast-paced hackathon</label>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                            <input type="checkbox" id="research" className="accent-blue-500" />
                            <label htmlFor="research" className="text-sm">In-depth research project</label>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                            <input type="checkbox" id="case" className="accent-blue-500" />
                            <label htmlFor="case" className="text-sm">Business case competition</label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2">
                      <FaMagic /> Find My Matches
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        {/* Team Match Tab */}
        {activeTab === 'team-match' && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Suggested Teams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {suggestedTeams.map(team => (
                <motion.div 
                  key={team.id}
                  className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-blue-500/30 transition-colors"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gray-700 rounded-full overflow-hidden border-2 border-blue-500/50">
                      <img src={team.avatar} alt={team.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{team.name}</h3>
                      <p className="text-gray-400 text-sm">{team.competition}</p>
                      <p className="text-xs text-blue-400 mt-1">
                        {team.members} members • Looking for {team.lookingFor} more
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Skills Needed:</h4>
                    <div className="flex flex-wrap gap-2">
                      {team.needed.map((skill, idx) => (
                        <span key={idx} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                    Join Team
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Team Updates</h2>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 pb-4 border-b border-gray-700">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-blue-400">
                      <FaLightbulb />
                    </div>
                    <div>
                      <h3 className="font-medium">New team matching algorithm</h3>
                      <p className="text-gray-400 text-sm mt-1">
                        We've improved our matching system to better connect you with compatible teammates.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-green-400">
                      <FaUserFriends />
                    </div>
                    <div>
                      <h3 className="font-medium">3 new teams matching your skills</h3>
                      <p className="text-gray-400 text-sm mt-1">
                        Check out the Teams section to see new opportunities that match your profile.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Mentorship Tab */}
        {activeTab === 'mentorship' && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Suggested Mentors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {suggestedMentors.map(mentor => (
                <motion.div 
                  key={mentor.id}
                  className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-blue-500/30 transition-colors"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gray-700 rounded-full overflow-hidden border-2 border-blue-500/50">
                      <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{mentor.name}</h3>
                      <p className="text-gray-400 text-sm">{mentor.specialization}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 text-yellow-400 text-xs">
                          <FaStar /> {mentor.rating}
                        </div>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-400">{mentor.available}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                    Request Session
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Mentorship Updates</h2>
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 pb-4 border-b border-gray-700">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-purple-400">
                      <FaUserTie />
                    </div>
                    <div>
                      <h3 className="font-medium">New mentorship program</h3>
                      <p className="text-gray-400 text-sm mt-1">
                        We've launched a structured 12-week mentorship program with industry experts.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-green-400">
                      <FaHandshake />
                    </div>
                    <div>
                      <h3 className="font-medium">5 mentors available in your field</h3>
                      <p className="text-gray-400 text-sm mt-1">
                        New mentors specializing in sustainability and AI have joined our platform.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default StudentLandingPage;