import { useState, useEffect } from 'react';
import { 
  FaBell, FaUser, FaSearch, FaTrophy, FaUsers, 
  FaComment, FaHandshake, FaBriefcase, FaCalendarAlt,
  FaGraduationCap, FaClock, FaMedal, FaStar, FaRegStar,
  FaFilter, FaPlus, FaUserPlus, FaChevronLeft, FaChevronDown,
  FaMagic, FaHeart, FaRegHeart, FaLightbulb, FaUserTie, FaUserFriends, 
  FaChevronRight, FaSignOutAlt, FaGlobe, FaChartLine, FaComments
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../config/firebase";
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { FaQuestionCircle } from 'react-icons/fa';  

const StudentLandingPage = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState("/default-profile.png");
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFeature, setActiveFeature] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('competitions');
  const [savedCompetitions, setSavedCompetitions] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
const [deadlinesLoading, setDeadlinesLoading] = useState(true);
  // Data states
  const [competitions, setCompetitions] = useState([]);
  const [suggestedTeams, setSuggestedTeams] = useState([]);
  const [suggestedMentors, setSuggestedMentors] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [sdgData, setSdgData] = useState({});
  const [userTeams, setUserTeams] = useState([]);

  const user = auth.currentUser;

  const initTour = () => {
    const tour = new Shepherd.Tour({
      defaultStepOptions: {
        cancelIcon: {
          enabled: true
        },
        classes: 'shadow-md bg-gray-800 border border-gray-700',
        scrollTo: { behavior: 'smooth', block: 'center' }
      },
      useModalOverlay: true
    });
  
    // Step 1: Welcome
    tour.addStep({
      id: 'welcome',
      text: 'Welcome to ScholarCompete! This tour will help you navigate the platform.',
      buttons: [
        {
          text: 'Next',
          action: tour.next
        }
      ],
      attachTo: {
        element: '.flex.items-center.gap-3', // Logo area
        on: 'bottom'
      }
    });
  
    // Step 2: Navigation
    tour.addStep({
      id: 'navigation',
      text: 'Use these tabs to switch between Competitions, Team Match, and Mentorship sections.',
      buttons: [
        {
          text: 'Back',
          action: tour.back
        },
        {
          text: 'Next',
          action: tour.next
        }
      ],
      attachTo: {
        element: '.hidden.md\\:flex.items-center.gap-4', // Main nav
        on: 'bottom'
      }
    });
  
    // Step 3: Profile
    tour.addStep({
      id: 'profile',
      text: 'Access your profile, notifications, and account settings here.',
      buttons: [
        {
          text: 'Back',
          action: tour.back
        },
        {
          text: 'Next',
          action: tour.next
        }
      ],
      attachTo: {
        element: '.relative.group', // Profile dropdown
        on: 'left'
      }
    });
  
    // Step 4: Search
    tour.addStep({
      id: 'search',
      text: 'Search for competitions, teammates, or resources across the platform.',
      buttons: [
        {
          text: 'Back',
          action: tour.back
        },
        {
          text: 'Next',
          action: tour.next
        }
      ],
      attachTo: {
        element: '.relative.max-w-md', // Search bar
        on: 'bottom'
      }
    });
  
    // Step 5: Deadlines
    tour.addStep({
      id: 'deadlines',
      text: 'Keep track of your upcoming deadlines and important dates here.',
      buttons: [
        {
          text: 'Back',
          action: tour.back
        },
        {
          text: 'Next',
          action: tour.next
        }
      ],
      attachTo: {
        element: '.lg\\:w-1\\/2.w-full.max-w-xl', // Deadlines card
        on: 'left'
      }
    });
  
    // Step 6: Competitions
    tour.addStep({
      id: 'competitions',
      text: 'Browse featured competitions. Click on any to see details and register.',
      buttons: [
        {
          text: 'Back',
          action: tour.back
        },
        {
          text: 'Next',
          action: tour.next
        }
      ],
      attachTo: {
        element: '.container.mx-auto.px-4.sm\\:px-6', // Competitions section
        on: 'top'
      }
    });
  
    // Step 7: Features
    tour.addStep({
      id: 'features',
      text: 'Quick access to all platform features from this dashboard.',
      buttons: [
        {
          text: 'Back',
          action: tour.back
        },
        {
          text: 'Next',
          action: tour.next
        }
      ],
      attachTo: {
        element: '.grid.grid-cols-2.sm\\:grid-cols-3.md\\:grid-cols-4.lg\\:grid-cols-4.gap-4', // Features grid
        on: 'top'
      }
    });
  
    // Step 8: Main Content
    tour.addStep({
      id: 'content',
      text: 'This area changes based on your selected tab - Competitions, Team Match, or Mentorship.',
      buttons: [
        {
          text: 'Back',
          action: tour.back
        },
        {
          text: 'Finish',
          action: tour.next
        }
      ],
      attachTo: {
        element: '.container.mx-auto.px-4.sm\\:px-6.py-8', // Main content
        on: 'top'
      }
    });

      // Step 9: Profile Toolkit Feature
  tour.addStep({
    id: 'toolkit-profile',
    text: '<strong>Profile</strong>: Manage your personal information and competition history.',
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Next',
        action: tour.next
      }
    ],
    attachTo: {
      element: '.bg-gradient-to-br.from-blue-500.to-blue-600 + h3', // Targets profile feature title
      on: 'top'
    }
  });

  // Step 10: Competitions Toolkit Feature
  tour.addStep({
    id: 'toolkit-competitions',
    text: '<strong>Competitions</strong>: Browse and join competitions.',
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Next',
        action: tour.next
      }
    ],
    attachTo: {
      element: '.bg-gradient-to-br.from-purple-500.to-purple-600 + h3', // Targets competitions feature title
      on: 'top'
    }
  });

  // Step 11: Team Match Toolkit Feature
  tour.addStep({
    id: 'toolkit-team-match',
    text: '<strong>Team Match</strong>: Connect with skilled peers or join open teams to compete together.',
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Next',
        action: tour.next
      }
    ],
    attachTo: {
      element: '.bg-gradient-to-br.from-green-500.to-green-600 + h3', // Targets team match feature title
      on: 'top'
    }
  });

  // Step 12: Mentorship Toolkit Feature
  tour.addStep({
    id: 'toolkit-mentorship',
    text: '<strong>Mentorship</strong>: Connect with experienced mentors in your field.',
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Next',
        action: tour.next
      }
    ],
    attachTo: {
      element: '.bg-gradient-to-br.from-yellow-500.to-yellow-600 + h3', // Targets mentorship feature title
      on: 'top'
    }
  });

  // Step 13: SDG Tracker Toolkit Feature
  tour.addStep({
    id: 'toolkit-sdg',
    text: '<strong>SDG Tracker</strong>: Track your progress on Sustainable Development Goals.',
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Next',
        action: tour.next
      }
    ],
    attachTo: {
      element: '.bg-gradient-to-br.from-teal-500.to-teal-600 + h3', // Targets SDG feature title
      on: 'top'
    }
  });

  // Step 14: Progress Toolkit Feature
  tour.addStep({
    id: 'toolkit-progress',
    text: '<strong>Progress</strong>: Track your goals and tasks to stay on top of competitions.',
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Next',
        action: tour.next
      }
    ],
    attachTo: {
      element: '.bg-gradient-to-br.from-orange-500.to-orange-600 + h3', // Targets progress feature title
      on: 'top'
    }
  });

  // Step 15: Analysis Toolkit Feature
  tour.addStep({
    id: 'toolkit-analysis',
    text: '<strong>Analysis</strong>: Get insights into your performance.',
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Next',
        action: tour.next
      }
    ],
    attachTo: {
      element: '.bg-gradient-to-br.from-indigo-500.to-indigo-600 + h3', // Targets analysis feature title
      on: 'top'
    }
  });

  // Step 16: Chats Toolkit Feature
  tour.addStep({
    id: 'toolkit-chats',
    text: '<strong>Chats</strong>: Communicate with your teams and mentors.',
    buttons: [
      {
        text: 'Back',
        action: tour.back
      },
      {
        text: 'Finish',
        action: tour.next
      }
    ],
    attachTo: {
      element: '.bg-gradient-to-br.from-red-500.to-purple-600 + h3', // Targets chats feature title
      on: 'top'
    }
  });
  
    return tour;
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await fetchStudentProfile();
        await fetchAllData();
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
        
        // Fetch saved competitions
        const savedResponse = await axios.get(`http://localhost:5000/api/compapp/me/${user.uid}`);
        setSavedCompetitions(savedResponse.data.map(app => app.competition._id));

        // Fetch user teams - ensure we always get an array
        const teamsResponse = await axios.get(`http://localhost:5000/api/teams/user/${user.uid}`);
        // Ensure we have an array and each team has sdgs array
        setUserTeams(teamsResponse);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setStudent({
        name: "New User",
        rolePreference: "Aspiring Developer",
        profilePicture: "/default-profile.png",
      });
      setUserTeams([]); // Ensure we always have an array
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      setDeadlinesLoading(true);
      
      // Fetch all data in parallel
      const [compResponse, teamsResponse, mentorsResponse, sdgResponse, userTeamsResponse] = 
        await Promise.all([
          axios.get('http://localhost:5000/api/competitions').catch(() => ({ data: [] })),
          axios.get('http://localhost:5000/api/invitations/openings?limit=4').catch(() => ({ data: [] })),
          axios.get('http://localhost:5000/api/mentor/mentors?limit=4').catch(() => ({ data: [] })),
          axios.get('http://localhost:5000/api/sdgs').catch(() => ({ data: [] })),
          axios.get(`http://localhost:5000/api/teams/user/${user.uid}`).catch(() => ({ data: { data: [] } }))
        ]);
  
      // Update all states
      setCompetitions(compResponse.data || []);
      setSuggestedTeams(teamsResponse.data || []);
      setSuggestedMentors(mentorsResponse.data || []);
      setUserTeams(userTeamsResponse.data || { data: [] });
  
      // Process SDG data
      const sdgMap = {};
      if (Array.isArray(sdgResponse.data)) {
        sdgResponse.data.forEach(sdg => {
          sdgMap[sdg.id] = {
            name: sdg.name,
            color: sdg.color,
            icon: sdg.icon || '🎯',
            description: sdg.description
          };
        });
      }
      setSdgData(sdgMap);
  
      // Process deadlines with the latest team data
      updateDeadlines(compResponse.data || [], userTeamsResponse.data?.data || []);
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setDeadlinesLoading(false);
    }
  };

  useEffect(() => {
    // Check if this is the user's first visit
    const firstVisit = localStorage.getItem('firstVisit') === null;
    
    if (firstVisit) {
      const tour = initTour();
      tour.start();
      localStorage.setItem('firstVisit', 'false');
      
      // Add a help button to restart the tour
      const helpButton = document.createElement('button');
      helpButton.className = 'fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg z-50 hover:bg-blue-700 transition-colors';
      helpButton.innerHTML = '<FaQuestionCircle className="text-xl" />';
      helpButton.title = 'Help / Restart Tour';
      helpButton.onclick = () => {
        const newTour = initTour();
        newTour.start();
      };
      document.body.appendChild(helpButton);
    }
  }, []);
  
  // Separate function to update deadlines
  const updateDeadlines = (competitions, teams) => {
    const processDeadline = (item, type) => {
      if (!item?.deadline) return null;
      
      try {
        const deadlineDate = new Date(item.deadline);
        if (isNaN(deadlineDate.getTime())) return null;
        
        const today = new Date();
        if (deadlineDate <= today) return null;
        
        return {
          id: item._id,
          title: type === 'competition' 
            ? `${item.name} Registration` 
            : `${item.name} Team Deadline`,
          date: deadlineDate.toLocaleDateString(),
          daysLeft: Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24)),
          [`${type}Id`]: item._id,
          type
        };
      } catch (error) {
        console.error("Error processing deadline:", error);
        return null;
      }
    };
  
    const compDeadlines = competitions
      .map(comp => processDeadline(comp, 'competition'))
      .filter(Boolean);
  
    const teamDeadlines = teams
      .map(team => processDeadline(team, 'team'))
      .filter(Boolean);
  
    const allDeadlines = [...compDeadlines, ...teamDeadlines]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
  
    setUpcomingDeadlines(allDeadlines);
  };

  useEffect(() => {
    if (student?.profilePicture) {
      setProfileImage(student.profilePicture.startsWith('http') ? 
        student.profilePicture : 
        `http://localhost:5000${student.profilePicture}`);
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

  const toggleSaveCompetition = async (id) => {
    try {
      const token = await user.getIdToken();
      if (savedCompetitions.includes(id)) {
        await axios.delete(`http://localhost:5000/api/compapp/${id}/save`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedCompetitions(savedCompetitions.filter(compId => compId !== id));
      } else {
        await axios.post(`http://localhost:5000/api/compapp/${id}/save`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedCompetitions([...savedCompetitions, id]);
      }
    } catch (error) {
      console.error("Error saving competition:", error);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === Math.ceil(competitions.length / 3) - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? Math.ceil(competitions.length / 3) - 1 : prev - 1));
  };

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
  console.log("userTeams", userTeams);

  const teamSDGs = new Set();

  const teamsArray = Array.isArray(userTeams?.data) ? userTeams.data : [];
  
  teamsArray.forEach(team => {
    if (Array.isArray(team.sdgs)) {
      team.sdgs.forEach(sdg => {
        if (typeof sdg === 'number' && sdg >= 1 && sdg <= 17) {
          teamSDGs.add(sdg);
        }
      });
    }
  });


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
            <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors relative">
              <FaBell />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button 
  className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
  onClick={() => {
    const tour = initTour();
    tour.start();
  }}
  title="Help / Restart Tour"
>
  <FaQuestionCircle />
</button>
            
            {/* Enhanced Profile Photo with Dropdown */}
            <div className="relative group">
              <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border-2 border-blue-500/50 cursor-pointer hover:border-blue-400 transition-all duration-200">
                <img 
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-profile.png";
                    setProfileImage("/default-profile.png");
                  }}
                />
              </div>
              
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-sm text-white font-medium">{profileData.name}</p>
                  <p className="text-xs text-gray-400">{profileData.rolePreference}</p>
                </div>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                  onClick={() => navigate('/student-dashboard')}
                >
                  <FaUser className="text-gray-400" />
                  My Profile
                </button>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                  onClick={async () => {
                    navigate("/login");
                  }}
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
              Welcome, <span className="text-blue-400">{profileData.name}!</span> 
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
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                  }
                }}
              />
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => {
                  if (searchQuery.trim()) {
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                  }
                }}
              >
                <FaSearch />
              </button>
            </div>
{console.log("team sdg",teamSDGs)}
            {/* Show SDGs from user teams */}
  {teamSDGs.size > 0 && (
  <div className="pt-2">
    <p className="text-sm text-gray-400 mb-2">Your teams are working on:</p>
    <div className="flex flex-wrap gap-3">
      {Array.from(teamSDGs).map(sdg => (
        <span 
          key={sdg} 
          className={`px-3 py-1 text-xs rounded-full text-white ${sdgData[sdg]?.color || 'bg-gray-600'} flex items-center gap-1`}
        >
          {sdgData[sdg]?.icon || '🎯'} SDG {sdg}
        </span>
      ))}
    </div>
  </div>
)}

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
                <button 
                  className="text-blue-400 text-sm flex items-center gap-1 hover:text-blue-300"
                  onClick={() => navigate('/competitions')}
                >
                  View all <FaChevronRight className="text-xs" />
                </button>
              </div>
              <div className="space-y-3">
                {upcomingDeadlines.map(deadline => (
                  <motion.div 
                    key={deadline.id} 
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-700/50 p-4 rounded-lg border-l-4 border-blue-500 hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => navigate(
                      deadline.type === 'competition' 
                        ? `/competitions/${deadline.competitionId}`
                        : `/teams/${deadline.teamId}`
                    )}
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
              <h2 className="text-2xl sm:text-3xl font-bold">All Competitions</h2>
              <p className="text-gray-400">Browse all available competitions</p>
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
                <div key={comp._id} className="w-full flex-shrink-0 px-2">
                  <motion.div 
                    className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-shadow border border-gray-700 hover:border-blue-500/30 group relative"
                    whileHover={{ y: -5 }}
                  >
                    {comp.featured && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-xs px-2 py-1 rounded-full z-10">
                        Featured
                      </div>
                    )}
                    <div className="h-48 bg-gray-700 overflow-hidden relative">
                      <img 
                        src={comp.photo ? `http://localhost:5000${comp.photo}` : "https://images.unsplash.com/photo-1466611653911-95081537e5b7"} 
                        alt={comp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button 
                        className="absolute top-3 right-3 p-2 bg-gray-900/60 rounded-full hover:bg-gray-800 transition-colors"
                        onClick={() => toggleSaveCompetition(comp._id)}
                      >
                        {savedCompetitions.includes(comp._id) ? (
                          <FaHeart className="text-red-400" />
                        ) : (
                          <FaRegHeart className="text-gray-300 hover:text-red-400" />
                        )}
                      </button>
                      {comp.sdgs && comp.sdgs.length > 0 && (
                        <div className="absolute bottom-3 left-3 flex gap-2">
                          {comp.sdgs.slice(0, 3).map((sdg) => (
                            <span 
                              key={sdg} 
                              className={`px-2 py-1 text-xs rounded-full text-white ${sdgData[sdg]?.color || 'bg-gray-600'} flex items-center gap-1`}
                              title={sdgData[sdg]?.name}
                            >
                              {sdgData[sdg]?.icon || '🎯'} {sdg}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold line-clamp-2">{comp.name}</h3>
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded whitespace-nowrap ml-2">
                          {comp.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-400 text-xs mb-3 gap-3">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt /> {comp.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaUsers /> {comp.participants || 0}+
                        </span>
                        <span className="flex items-center gap-1 text-yellow-400">
                          <FaStar /> {comp.rating || 'New'}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-4 line-clamp-2">{comp.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-gray-400">{comp.organization || 'Various'}</p>
                          <p className="text-sm font-medium text-blue-400">
                            <FaMedal className="inline mr-1" /> {comp.prizePool || 'Various prizes'}
                          </p>
                        </div>
                       
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
              onClick={() => navigate("/competitions")}
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
              onClick={() => navigate("/mentorfind")}
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
              onClick={() => navigate("/sdg")}
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
              onClick={() => navigate("/student-analysis")}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 mx-auto bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md">
                <FaBriefcase className="text-xl" />
              </div>
              <h3 className="text-center text-sm font-medium">Analysis</h3>
            </motion.div>

            <motion.div
              className={`p-4 rounded-xl cursor-pointer transition-all ${activeFeature === 'chats' ? 'bg-gray-700 scale-105 shadow-lg' : 'bg-gray-800 hover:bg-gray-700'}`}
              whileHover={{ y: -5 }}
              onClick={() => navigate("/chats")}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 mx-auto bg-gradient-to-br from-red-500 to-purple-600 shadow-md">
                <FaComments className="text-xl" />
              </div>
              <h3 className="text-center text-sm font-medium">Chats</h3>
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
                  <select 
                    className="appearance-none w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    onChange={(e) => {
                      if (e.target.value !== 'all') {
                        navigate(`/competitions?category=${e.target.value}`);
                      }
                    }}
                  >
                    <option value="all">All Categories</option>
                    <option value="hackathon">Hackathons</option>
                    <option value="research">Research</option>
                    <option value="case">Case Competitions</option>
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                </div>
                <div className="relative flex-1 sm:w-48 min-w-[120px]">
                  <select 
                    className="appearance-none w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    onChange={(e) => {
                      if (e.target.value !== 'all') {
                        navigate(`/competitions?sdg=${e.target.value}`);
                      }
                    }}
                  >
                    <option value="all">All SDGs</option>
                    {Object.keys(sdgData).map(sdg => (
                      <option key={sdg} value={sdg}>SDG {sdg}</option>
                    ))}
                  </select>
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitions.slice(0, 4).map((comp) => (
                <motion.div 
                  key={comp._id}
                  className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-shadow border border-gray-700 hover:border-blue-500/30 group"
                  whileHover={{ y: -5 }}
                >
                  <div className="h-48 bg-gray-700 overflow-hidden relative">
                    <img 
                      src={comp.photo ? `http://localhost:5000${comp.photo}` : "https://images.unsplash.com/photo-1466611653911-95081537e5b7"} 
                      alt={comp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button 
                      className="absolute top-3 right-3 p-2 bg-gray-900/60 rounded-full hover:bg-gray-800 transition-colors"
                      onClick={() => toggleSaveCompetition(comp._id)}
                    >
                      {savedCompetitions.includes(comp._id) ? (
                        <FaHeart className="text-red-400" />
                      ) : (
                        <FaRegHeart className="text-gray-300 hover:text-red-400" />
                      )}
                    </button>
                    {comp.sdgs && comp.sdgs.length > 0 && (
                      <div className="absolute bottom-3 left-3 flex gap-2">
                        {comp.sdgs.slice(0, 3).map((sdg) => (
                          <span 
                            key={sdg} 
                            className={`px-2 py-1 text-xs rounded-full text-white ${sdgData[sdg]?.color || 'bg-gray-600'} flex items-center gap-1`}
                            title={sdgData[sdg]?.name}
                          >
                            {sdgData[sdg]?.icon || '🎯'} {sdg}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold line-clamp-2">{comp.name}</h3>
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded whitespace-nowrap ml-2">
                        {comp.category}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-400 text-xs mb-3 gap-3">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt /> {comp.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaUsers /> {comp.participants || 0}+
                      </span>
                      <span className="flex items-center gap-1 text-yellow-400">
                        <FaStar /> {comp.rating || 'New'}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{comp.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-400">{comp.organization || 'Various'}</p>
                        <p className="text-sm font-medium text-blue-400">
                          <FaMedal className="inline mr-1" /> {comp.prizePool || 'Various prizes'}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Team Match Tab */}
        {activeTab === 'team-match' && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Suggested Teams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {suggestedTeams.slice(0, 4).map(team => (
                <motion.div 
                  key={team._id}
                  className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-blue-500/30 transition-colors"
                  whileHover={{ y: -2 }}
                >
                   {console.log("teasm:",team)}
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{team.team.name}</h3>
                      <p className="text-gray-400 text-sm">{team.team.description || 'Various competitions'}</p>
                      <p className="text-xs text-blue-400 mt-1">
                        {team.team.members?.length || 0} members • Looking for {team.seatsAvailable || 1} more
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Skills Needed:</h4>
                    <div className="flex flex-wrap gap-2">
                      {team.skillsNeeded?.map((skill, idx) => (
                        <span key={idx} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => navigate(`/teams/${team._id}`)}
                  >
                    Join Team
                  </button>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Mentorship Tab */}
        {activeTab === 'mentorship' && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Suggested Mentors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {suggestedMentors.slice(0, 4).map(mentor => (
                <motion.div 
                  key={mentor._id}
                  className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-blue-500/30 transition-colors"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gray-700 rounded-full overflow-hidden border-2 border-blue-500/50">
                      <img src={mentor.profilePicture || "https://randomuser.me/api/portraits/women/65.jpg"} alt={mentor.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{mentor.name}</h3>
                      <p className="text-gray-400 text-sm">{mentor.specialization || 'Mentor'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 text-yellow-400 text-xs">
                          <FaStar /> {mentor.rating || 4.5}
                        </div>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-400">{mentor.availability || 'Available'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => navigate(`/mentors/${mentor._id}`)}
                  >
                    Request Session
                  </button>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default StudentLandingPage;