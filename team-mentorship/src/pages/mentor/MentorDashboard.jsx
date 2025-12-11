import { useState, useEffect, useRef } from "react";
  import { Link, useNavigate } from "react-router-dom";
  import { auth } from "/src/config/firebase";
  import { signOut } from "firebase/auth";
  import Shepherd from 'shepherd.js';
  import {
    FaUser,
    FaHome,
    FaUserPlus,
    FaTrophy,
    FaComments,
    FaUsers,
    FaBell,
    FaGraduationCap,
    FaSearch,
    FaCalendarAlt,
    FaCog,
    FaSignOutAlt,
    FaChartBar,
    FaChalkboardTeacher,
    FaUserCheck,
    FaTasks,
    FaLightbulb,
    FaClock,
    FaTimes,
    FaFilter,
    FaQuestionCircle
  } from "react-icons/fa";
  import axios from "axios";
  import 'shepherd.js/dist/css/shepherd.css';
  
  const MentorDashboard = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState({
      name: "",
      email: "",
      domain: "",
      profilePicture: "",
    });
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
      stats: {
        mentoredTeams: 0,
        activeStudents: 0,
        pendingApplications: 0,
        pendingTasks: 0
      },
      upcomingDeadlines: [],
      recentUpdates: [],
      activeTeams: []
    });
    const [showUpdatesModal, setShowUpdatesModal] = useState(false);
    const [showDeadlinesModal, setShowDeadlinesModal] = useState(false);
    const [updateFilter, setUpdateFilter] = useState("all");
    const [deadlineFilter, setDeadlineFilter] = useState("all");
    const [showChat, setShowChat] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const tour = useRef(null);
  
    // Always show help button
    const showHelpButton = true;
  
    const logout = async () => {
      await signOut(auth);
    };
  
    // Initialize the tour
const initTour = () => {
  tour.current = new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: {
        enabled: true
      },
      classes: 'shepherd-theme-custom',
      scrollTo: { behavior: 'smooth', block: 'center' }
    },
    useModalOverlay: true
  });

  // Step 1: Welcome
  tour.current.addStep({
    id: 'welcome',
    text: '<div class="dark:text-white"><h3 class="text-xl font-bold mb-2">Welcome to Mentor Dashboard!</h3><p>Let me show you around.</p></div>',
    buttons: [
      {
        text: 'Next',
        action: tour.current.next
      }
    ]
  });

  // Step 2: Sidebar
  tour.current.addStep({
    id: 'sidebar',
    text: '<div class="dark:text-white"><h3 class="text-xl font-bold mb-2">Navigation Menu</h3><p>Access your profile, teams, students, tasks, and analytics from here.</p></div>',
    attachTo: {
      element: '.sidebar-nav',
      on: 'right'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.current.back
      },
      {
        text: 'Next',
        action: tour.current.next
      }
    ]
  });

  // Step 3: Stats Cards
  tour.current.addStep({
    id: 'stats',
    text: '<div class="dark:text-white"><h3 class="text-xl font-bold mb-2">Your Stats</h3><p>Quick overview of your mentoring activity.</p></div>',
    attachTo: {
      element: '.stats-cards',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.current.back
      },
      {
        text: 'Next',
        action: tour.current.next
      }
    ]
  });

  // Step 4: Recent Updates
  tour.current.addStep({
    id: 'updates',
    text: '<div class="dark:text-white"><h3 class="text-xl font-bold mb-2">Recent Activity</h3><p>See what needs your attention.</p></div>',
    attachTo: {
      element: '.recent-updates',
      on: 'bottom'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.current.back
      },
      {
        text: 'Next',
        action: tour.current.next
      }
    ]
  });

  // Step 5: Deadlines
  tour.current.addStep({
    id: 'deadlines',
    text: '<div class="dark:text-white"><h3 class="text-xl font-bold mb-2">Upcoming Deadlines</h3><p>Track important dates for your teams.</p></div>',
    attachTo: {
      element: '.upcoming-deadlines',
      on: 'left'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.current.back
      },
      {
        text: 'Next',
        action: tour.current.next
      }
    ]
  });

  // Step 6: Active Teams (changed from Finish to Next)
  tour.current.addStep({
    id: 'teams',
    text: '<div class="dark:text-white"><h3 class="text-xl font-bold mb-2">Your Teams</h3><p>Track all teams you\'re currently mentoring with their progress.</p></div>',
    attachTo: {
      element: '.active-teams',
      on: 'top'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.current.back
      },
      {
        text: 'Next',
        action: tour.current.next
      }
    ]
  });

  // Step 7: Dashboard Navigation
  tour.current.addStep({
    id: 'sidebar-dashboard',
    text: '<div class="dark:text-white"><h3 class="text-xl font-bold mb-2">Dashboard</h3><p>This is your main dashboard with all key information.</p></div>',
    attachTo: {
      element: 'a[href="/mentor-dashboard"]',
      on: 'right'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.current.back
      },
      {
        text: 'Next',
        action: tour.current.next
      }
    ]
  });

  // Step 8: Profile Navigation
  tour.current.addStep({
    id: 'sidebar-profile',
    text: '<div class="dark:text-white"><h3 class="text-xl font-bold mb-2">Profile</h3><p>View and edit your mentor profile information.</p></div>',
    attachTo: {
      element: 'a[href="/mentor-profile"]',
      on: 'right'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.current.back
      },
      {
        text: 'Next',
        action: tour.current.next
      }
    ]
  });

  // Step 9: Mentored Teams Navigation
  tour.current.addStep({
    id: 'sidebar-teams',
    text: '<div class="dark:text-white"><h3 class="text-xl font-bold mb-2">Mentored Teams</h3><p>View all teams you are mentoring and their progress.</p></div>',
    attachTo: {
      element: 'a[href="/mentored-teams"]',
      on: 'right'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.current.back
      },
      {
        text: 'Next',
        action: tour.current.next
      }
    ]
  });

  // Step 10: My Students Navigation
  tour.current.addStep({
    id: 'sidebar-students',
    text: '<div class="dark:text-white"><h3 class="text-xl font-bold mb-2">My Students</h3><p>View all students you are mentoring across teams.</p></div>',
    attachTo: {
      element: 'a[href="/mentor-students"]',
      on: 'right'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.current.back
      },
      {
        text: 'Next',
        action: tour.current.next
      }
    ]
  });

  // Step 11: Tasks Navigation
  tour.current.addStep({
    id: 'sidebar-tasks',
    text: '<div class="dark:text-white"><h3 class="text-xl font-bold mb-2">Tasks</h3><p>Manage tasks assigned to you as a mentor.</p></div>',
    attachTo: {
      element: 'a[href="/mentor-tasks"]',
      on: 'right'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.current.back
      },
      {
        text: 'Next',
        action: tour.current.next
      }
    ]
  });

  // Step 12: Analytics Navigation
  tour.current.addStep({
    id: 'sidebar-analytics',
    text: '<div class="dark:text-white"><h3 class="text-xl font-bold mb-2">Analytics</h3><p>View detailed mentoring analytics and reports.</p></div>',
    attachTo: {
      element: 'a[href="/mentor-analytics"]',
      on: 'right'
    },
    buttons: [
      {
        text: 'Back',
        action: tour.current.back
      },
      {
        text: 'Next',
        action: tour.current.next
      }
    ]
  });

  // Step 13: Chat Navigation - Updated selector
tour.current.addStep({
  id: 'sidebar-chat',
  text: '<div class="dark:text-white"><h3 class="text-xl font-bold mb-2">Chat</h3><p>Communicate with students and other mentors.</p></div>',
  attachTo: {
    element: '.sidebar-nav button:has(svg)', // More specific selector
    on: 'right'
  },
  buttons: [
    {
      text: 'Back',
      action: tour.current.back
    },
    {
      text: 'Next',
      action: tour.current.next
    }
  ],
  beforeShowPromise: function() {
    // Ensure sidebar is open
    setIsMobileMenuOpen(true);
    return new Promise((resolve) => setTimeout(resolve, 300)); // Wait for animation
  }
});

// Updated Logout Step
tour.current.addStep({
  id: 'sidebar-logout',
  text: '<div class="dark:text-white"><h3 class="text-xl font-bold mb-2">Logout</h3><p>Sign out of your mentor account when you\'re done.</p></div>',
  attachTo: {
    element: '.sidebar-nav nav > div:last-child button', // Targets last button in sidebar
    on: 'right'
  },
  buttons: [
    { text: 'Back', action: tour.current.back },
    { text: 'Finish', action: tour.current.complete }
  ],
  beforeShowPromise: function() {
    return new Promise((resolve) => {
      // Ensure mobile menu is open
      setIsMobileMenuOpen(true);
      // Scroll to bottom
      const sidebar = document.querySelector('.sidebar-nav');
      sidebar.scrollTop = sidebar.scrollHeight;
      setTimeout(resolve, 500); // Wait for animations
    });
  }
});
};
  
    // Fetch mentor profile and dashboard data
    useEffect(() => {
      const fetchMentorData = async (userId) => {
        try {
          // Fetch mentor profile
          const profileResponse = await axios.get(
            `https://talent-hunt-3.onrender.com/api/mentor/profile/${userId}`
          );
          setUser({
            name: profileResponse.data.name,
            email: profileResponse.data.email,
            domain: profileResponse.data.domain,
            profilePicture: profileResponse.data.profilePicture || "/default-profile.png",
          });
  
          // Fetch dashboard data
          const dashboardResponse = await axios.get(
            `https://talent-hunt-3.onrender.com/api/mentor-dashboard/stats/${userId}`
          );
          setDashboardData(dashboardResponse.data);
  
          // Fetch initial chat messages
          const chatResponse = await axios.get(
            `https://talent-hunt-3.onrender.com/api/mentor-chat/${userId}`
          );
          setChatMessages(chatResponse.data.messages || []);
        } catch (error) {
          console.error("Error fetching mentor data:", error);
        } finally {
          setLoading(false);
        }
      };
  
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          fetchMentorData(user.uid);
        } else {
          navigate("/login");
        }
      });
  
      return () => unsubscribe();
    }, [navigate]);
  
    // Initialize tour when component mounts
    useEffect(() => {
      if (!loading) {
        initTour();
      }
    }, [loading]);
  
    // Format updates with icons and messages
    const formatUpdate = (update) => {
      let message = '';
      let icon = null;
      let type = '';
      
      switch(update.lastActivityType) {
        case 'new_member':
          message = `New member joined ${update.name}`;
          icon = <FaUserPlus className="text-green-400" />;
          type = 'member';
          break;
        case 'new_mentor':
          message = `New mentor added to ${update.name}`;
          icon = <FaChalkboardTeacher className="text-blue-400" />;
          type = 'mentor';
          break;
        case 'new_task':
          message = `${update.name} added new task (${update.lastActivityDetails.completed}/${update.lastActivityDetails.total})`;
          icon = <FaTasks className="text-yellow-400" />;
          type = 'task';
          break;
        case 'meeting':
          message = `${update.name} had a meeting`;
          icon = <FaComments className="text-purple-400" />;
          type = 'meeting';
          break;
        default:
          message = `${update.name} was updated`;
          icon = <FaBell className="text-gray-400" />;
          type = 'update';
      }
  
      return {
        ...update,
        formattedMessage: message,
        icon,
        type,
        time: formatTimeAgo(update.lastActivity),
        link: `/team/${update.name.toLowerCase().replace(/\s+/g, '-')}`
      };
    };
  
    // Handle sending a new chat message
    const handleSendMessage = async () => {
      if (newMessage.trim() === '') return;
  
      const message = {
        text: newMessage,
        sender: 'mentor',
        timestamp: new Date().toISOString(),
        mentorId: auth.currentUser.uid,
        mentorName: user.name
      };
  
      try {
        // Optimistically add the message to the UI
        setChatMessages([...chatMessages, message]);
        setNewMessage('');
  
        // Send to backend
        await axios.post(`https://talent-hunt-3.onrender.com/api/mentor-chat/${auth.currentUser.uid}`, {
          message: message
        });
  
        // Optionally, you could fetch the latest messages here to ensure sync
      } catch (error) {
        console.error("Error sending message:", error);
        // Rollback the optimistic update if needed
        setChatMessages(chatMessages.slice(0, -1));
      }
    };
  
    // Format all updates
    const allUpdates = dashboardData.recentUpdates.map(formatUpdate);
    
    // Filter updates based on selected filter
    const filteredUpdates = updateFilter === "all" 
      ? allUpdates 
      : allUpdates.filter(update => update.type === updateFilter);
  
    // Format upcoming deadlines from backend
    const allDeadlines = dashboardData.upcomingDeadlines.map(deadline => ({
      ...deadline,
      formattedTitle: `${deadline.teamName} - ${deadline.projectName}`,
      formattedDate: `Due in ${deadline.daysLeft} day${deadline.daysLeft !== 1 ? 's' : ''}`,
      deadlineDate: new Date(deadline.deadline)
    }));
  
    // Filter deadlines based on selected filter
    const filteredDeadlines = deadlineFilter === "all" 
      ? allDeadlines 
      : allDeadlines.filter(deadline => 
          deadlineFilter === "upcoming" 
            ? deadline.daysLeft <= 7 
            : deadline.daysLeft > 7
        );
  
    // Helper function to format time ago
    function formatTimeAgo(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }
  
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
  
    return (
      <div className="flex min-h-screen bg-gray-900 text-gray-100 relative">
        {/* GUARANTEED VISIBLE HELP BUTTON */}
        <button
          onClick={() => tour.current?.start()}
          className="fixed z-[9999] bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{
            width: '70px',
            height: '70px',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.5)'
          }}
          title="Start Guided Tour"
        >
          <FaQuestionCircle className="text-3xl" />
        </button>
  
        {/* Sidebar Navigation */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:static sidebar-nav`}
        >
          <div className="p-4 border-b border-gray-700">
            <h1 className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              <FaGraduationCap className="text-blue-400 text-xl" />
              MentorHub
            </h1>
          </div>
  
          <div className="p-3">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border-2 border-blue-500/50">
                <img
                  src={
                    user?.profilePicture
                      ? `https://talent-hunt-3.onrender.com${user.profilePicture}`
                      : "/default-profile.png"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-profile.png";
                  }}
                />
              </div>
              <div>
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-gray-400">Mentor - {user.domain}</p>
              </div>
            </div>
          </div>
  
          <nav className="mt-1 px-2">
            <Link
              to="/mentor-dashboard"
              className="flex items-center px-3 py-2 text-sm rounded-lg mb-1 text-white bg-gradient-to-r from-blue-600/40 to-purple-600/40 border border-blue-500/20"
            >
              <FaHome className="mr-2 text-base" />
              Dashboard
            </Link>
            <Link
              to="/mentor-profile"
              className="flex items-center px-3 py-2 text-sm rounded-lg mb-1 text-gray-300 hover:text-white hover:bg-gray-700/70"
            >
              <FaUser className="mr-2 text-base" />
              Profile
            </Link>
            <Link
              to="/mentored-teams"
              className="flex items-center px-3 py-2 text-sm rounded-lg mb-1 text-gray-300 hover:text-white hover:bg-gray-700/70"
            >
              <FaUsers className="mr-2 text-base" />
              Mentored Teams
            </Link>
            <Link
              to="/mentor-students"
              className="flex items-center px-3 py-2 text-sm rounded-lg mb-1 text-gray-300 hover:text-white hover:bg-gray-700/70"
            >
              <FaUserCheck className="mr-2 text-base" />
              My Students
            </Link>
            <Link
              to="/mentor-tasks"
              className="flex items-center px-3 py-2 text-sm rounded-lg mb-1 text-gray-300 hover:text-white hover:bg-gray-700/70"
            >
              <FaTasks className="mr-2 text-base" />
              Tasks
            </Link>
            <Link
              to="/mentor-analytics"
              className="flex items-center px-3 py-2 text-sm rounded-lg mb-1 text-gray-300 hover:text-white hover:bg-gray-700/70"
            >
              <FaChartBar className="mr-2 text-base" />
              Analytics
            </Link>
  
            {/* Chat Button */}
            <button
              onClick={() => setShowChat(true)}
              className="flex items-center w-full px-3 py-2 text-sm rounded-lg mb-1 text-gray-300 hover:text-white hover:bg-gray-700/70"
            >
              <FaComments className="mr-2 text-base" />
              Chat
            </button>
  
            <div className="mt-8 pt-4 border-t border-gray-700">
              <button
                onClick={() => {
                  auth.signOut()
                  navigate('/login')
                }}
                className="flex items-center w-full px-3 py-2 text-sm rounded-lg mb-1 text-gray-300 hover:text-white hover:bg-gray-700/70"
              >
                <FaSignOutAlt className="mr-2 text-base" />
                Logout
              </button>
            </div>
          </nav>
        </div>
  
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
            <button
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="relative max-w-md w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search teams, students..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>
          </header>
  
          {/* Dashboard Content */}
          <main className="flex-1 overflow-auto p-3 md:p-5 lg:p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
              <h1 className="text-2xl md:text-3xl font-bold">Mentor Dashboard</h1>
            </div>
  
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 stats-cards">
              {[
                {
                  title: "Mentored Teams",
                  value: dashboardData.stats.mentoredTeams,
                  icon: <FaChalkboardTeacher className="text-blue-400" />,
                  link: "/mentored-teams",
                },
                {
                  title: "Active Students",
                  value: dashboardData.stats.activeStudents,
                  icon: <FaUserCheck className="text-green-400" />,
                  link: "/mentor-students",
                },
                {
                  title: "Pending Applications",
                  value: dashboardData.stats.pendingApplications,
                  icon: <FaTasks className="text-yellow-400" />,
                  link: "/mentored-teams",
                },
                {
                  title: "Pending Tasks",
                  value: dashboardData.stats.pendingTasks || 0,
                  icon: <FaTasks className="text-purple-400" />,
                  link: "/mentor-tasks",
                },
              ].map((stat, index) => (
                <Link
                  key={index}
                  to={stat.link}
                  className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-400">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className="text-2xl bg-gray-700/50 p-2 rounded-lg">
                      {stat.icon}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
  
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Recent Updates */}
              <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700 recent-updates">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Recent Updates</h2>
                  <button
                    onClick={() => setShowUpdatesModal(true)}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-4">
                  {allUpdates.slice(0, 3).map((update, index) => (
                    <Link
                      key={index}
                      to={update.link}
                      className="flex items-start p-3 hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center">
                          {update.icon}
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium">{update.formattedMessage}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {update.time}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
  
              {/* Upcoming Deadlines */}
              {allDeadlines.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 upcoming-deadlines">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Upcoming Deadlines</h2>
                    <button
                      onClick={() => setShowDeadlinesModal(true)}
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      View calendar
                    </button>
                  </div>
                  <div className="space-y-4">
                    {allDeadlines.slice(0, 3).map((deadline, index) => (
                      <div
                        key={index}
                        className="p-3 hover:bg-gray-700/50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mr-3">
                            <FaClock />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{deadline.formattedTitle}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {deadline.formattedDate}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Due: {deadline.deadlineDate.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
  
            {/* Active Teams Section */}
            <div className="mt-8 active-teams">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Active Teams</h2>
                <Link
                  to="/mentored-teams"
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  View all teams
                </Link>
              </div>
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-700/50">
                        <th className="text-left py-3 px-4 text-sm font-medium">Team Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Project</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Progress</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Members</th>
                        <th className="text-left py-3 px-4 text-sm font-medium">Tasks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {dashboardData.activeTeams.map((team, index) => (
                        <tr key={index} className="hover:bg-gray-700/30">
                          <td className="py-3 px-4">
                            <div className="font-medium">{team.name}</div>
                            {team.leader && (
                              <div className="text-xs text-gray-400">
                                Leader: {team.leader.name}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">{team.project}</td>
                          <td className="py-3 px-4">
                            <div className="w-full bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${team.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400 mt-1 block">
                              {team.progress}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {team.members}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {team.tasks?.completed || 0}/{team.tasks?.total || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
  
        {/* Chat Panel */}
        {showChat && (
          <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-gray-800 border-l border-gray-700 shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Mentor Chat</h2>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
  
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length > 0 ? (
                  chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.sender === 'mentor' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                          message.sender === 'mentor'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-100'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {message.sender === 'mentor' ? 'You' : message.studentName || 'Student'} •{' '}
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">No messages yet. Start a conversation!</p>
                  </div>
                )}
              </div>
  
              {/* Chat Input */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white p-2"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
  
        {/* Updates Modal */}
        {showUpdatesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">All Updates</h2>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <select
                        value={updateFilter}
                        onChange={(e) => setUpdateFilter(e.target.value)}
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 pr-8"
                      >
                        <option value="all">All Updates</option>
                        <option value="member">New Members</option>
                        <option value="mentor">New Mentors</option>
                        <option value="task">Task Updates</option>
                        <option value="meeting">Meetings</option>
                      </select>
                      <FaFilter className="absolute right-3 top-3 text-gray-400" />
                    </div>
                    <button
                      onClick={() => setShowUpdatesModal(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <FaTimes className="text-xl" />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {filteredUpdates.length > 0 ? (
                    filteredUpdates.map((update, index) => (
                      <Link
                        key={index}
                        to={update.link}
                        className="flex items-start p-3 hover:bg-gray-700/50 rounded-lg transition-colors"
                      >
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center">
                            {update.icon}
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium">{update.formattedMessage}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {update.time}
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No updates found matching your filter
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
  
        {/* Deadlines Modal */}
        {showDeadlinesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">All Deadlines</h2>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <select
                        value={deadlineFilter}
                        onChange={(e) => setDeadlineFilter(e.target.value)}
                        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 pr-8"
                      >
                        <option value="all">All Deadlines</option>
                        <option value="upcoming">Upcoming (≤7 days)</option>
                        <option value="later">Later (&gt;7 days)</option>
                      </select>
                      <FaFilter className="absolute right-3 top-3 text-gray-400" />
                    </div>
                    <button
                      onClick={() => setShowDeadlinesModal(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <FaTimes className="text-xl" />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {filteredDeadlines.length > 0 ? (
                    filteredDeadlines.map((deadline, index) => (
                      <div
                        key={index}
                        className="p-3 hover:bg-gray-700/50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mr-3">
                            <FaClock />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{deadline.formattedTitle}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {deadline.formattedDate}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Due: {deadline.deadlineDate.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No deadlines found matching your filter
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
  
        {/* Shepherd.js custom theme */}
        <style>{`
          .shepherd-theme-custom {
            background: white;
            color: white;
            border: 1px solid #374151;
            border-radius: 0.5rem;
          }
          .shepherd-theme-custom .shepherd-header {
            background: white;
            padding: 1rem 1rem 0;
            border-bottom: none;
          }
          .shepherd-theme-custom .shepherd-content {
            padding: 1rem;
          }
          .shepherd-theme-custom .shepherd-footer {
            padding: 0 1rem 1rem;
            border-top: none;
          }
          .shepherd-theme-custom .shepherd-button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            margin: 0 0.5rem;
            border-radius: 0.375rem;
            transition: all 0.2s ease;
          }
          .shepherd-theme-custom .shepherd-button:hover {
            background: #2563eb;
          }
          .shepherd-theme-custom .shepherd-button.shepherd-button-secondary {
            background: #4b5563;
          }
          .shepherd-theme-custom .shepherd-button.shepherd-button-secondary:hover {
            background: #374151;
          }
          .shepherd-theme-custom .shepherd-cancel-icon {
            color: #9ca3af;
          }
          .shepherd-theme-custom .shepherd-cancel-icon:hover {
            color: #d1d5db;
          }
          .shepherd-theme-custom .shepherd-has-title .shepherd-content .shepherd-header {
            background: #1f2937;
          }
        `}</style>
      </div>
    );
  };
  
  export default MentorDashboard;