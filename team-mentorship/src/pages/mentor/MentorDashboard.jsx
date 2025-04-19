import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "/src/config/firebase";
import { signOut } from "firebase/auth";
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
} from "react-icons/fa";
import axios from "axios";

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

  const logout = async () => {
    await signOut(auth);
  };

  // Fetch mentor data
  useEffect(() => {
    const fetchMentorProfile = async (userId) => {
      try {
        // Replace with your actual API endpoint for mentors
        const response = await axios.get(
          `http://localhost:5000/api/mentor/profile/${userId}`
        );
        setUser({
          name: response.data.name,
          email: response.data.email,
          domain: response.data.domain,
          profilePicture:
            response.data.profilePicture || "/default-profile.png",
        });
      } catch (error) {
        console.error("Error fetching mentor data:", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchMentorProfile(user.uid);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Stats data
  const stats = [
    {
      title: "Mentored Teams",
      value: "12",
      icon: <FaChalkboardTeacher className="text-blue-400" />,
      link: "/mentored-teams",
    },
    {
      title: "Active Students",
      value: "24",
      icon: <FaUserCheck className="text-green-400" />,
      link: "/my-students",
    },
    {
      title: "Pending Tasks",
      value: "5",
      icon: <FaTasks className="text-yellow-400" />,
      link: "/tasks",
    },
    {
      title: "Suggestions",
      value: "8",
      icon: <FaLightbulb className="text-purple-400" />,
      link: "/suggestions",
    },
  ];

  // Recent updates
  const updates = [
    {
      type: "message",
      message: "Team Web Wizards needs your review",
      time: "30 minutes ago",
      link: "/team/web-wizards",
    },
    {
      type: "task",
      message: "New project submission from Data Dynamos",
      time: "2 hours ago",
      link: "/review/project-123",
    },
    {
      type: "request",
      message: "3 new mentorship requests",
      time: "5 hours ago",
      link: "/mentorship-requests",
    },
  ];

  // Upcoming sessions
  const upcomingSessions = [
    {
      title: "Weekly Check-in: Web Wizards",
      date: "Today, 4:00 PM",
      type: "meeting",
    },
    {
      title: "Project Review Session",
      date: "Apr 12, 2:00 PM",
      type: "review",
    },
    {
      title: "Mentor Training Workshop",
      date: "Apr 15, 10:00 AM",
      type: "workshop",
    },
  ];

  // Active teams
  const activeTeams = [
    {
      name: "Web Wizards",
      project: "E-commerce Platform",
      progress: "75%",
      lastMeeting: "2 days ago",
    },
    {
      name: "Data Dynamos",
      project: "ML Prediction Model",
      progress: "50%",
      lastMeeting: "1 week ago",
    },
    {
      name: "App Architects",
      project: "Mobile Prototype",
      progress: "30%",
      lastMeeting: "3 days ago",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar Navigation */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static`}
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
                    ? `http://localhost:5000${user.profilePicture}`
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
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white relative">
              <FaBell className="text-xl" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="text-gray-400 hover:text-white">
              <FaCog className="text-xl" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-3 md:p-5 lg:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold">Mentor Dashboard</h1>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
                Schedule Session
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            {stats.map((stat, index) => (
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
            <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Recent Updates</h2>
                <Link
                  to="/mentor-notifications"
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {updates.map((update, index) => (
                  <Link
                    key={index}
                    to={update.link}
                    className="flex items-start p-3 hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {update.type === "message" && (
                        <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center">
                          <FaComments />
                        </div>
                      )}
                      {update.type === "task" && (
                        <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center">
                          <FaTasks />
                        </div>
                      )}
                      {update.type === "request" && (
                        <div className="w-10 h-10 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
                          <FaUserPlus />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium">{update.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {update.time}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Upcoming Sessions</h2>
                <Link
                  to="/mentor-calendar"
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  View calendar
                </Link>
              </div>
              <div className="space-y-4">
                {upcomingSessions.map((session, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mr-3">
                        <FaCalendarAlt />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{session.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {session.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Teams Section */}
          <div className="mt-8">
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
                      <th className="text-left py-3 px-4 text-sm font-medium">
                        Team Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium">
                        Project
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium">
                        Progress
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium">
                        Last Meeting
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {activeTeams.map((team, index) => (
                      <tr key={index} className="hover:bg-gray-700/30">
                        <td className="py-3 px-4">
                          <div className="font-medium">{team.name}</div>
                        </td>
                        <td className="py-3 px-4">{team.project}</td>
                        <td className="py-3 px-4">
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: team.progress }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400 mt-1 block">
                            {team.progress}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-400">
                          {team.lastMeeting}
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            to={`/team/${team.name
                              .toLowerCase()
                              .replace(" ", "-")}`}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            View
                          </Link>
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
    </div>
  );
};

export default MentorDashboard;
