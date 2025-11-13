"use client"

import { Link } from "react-router-dom"
import {
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
} from "react-icons/fa"
import { useState, useEffect } from "react"
import axios from "axios"
import { auth } from "../config/firebase"
import { useNavigate } from "react-router-dom"

// API base URL
const API_URL = "https://team-match.up.railway.app/api"

export default function FindTeammatesPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const [user, setUser] = useState({
    uid: "",
    name: "",
    email: "",
    domain: "",
    skills: [],
    competitions: [],
    profilePicture: "",
  })
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    stats: {
      potentialTeammates: 0,
      openTeams: 0,
      myTeams: 0,
      pendingApplications: 0
    },
    upcomingDeadlines: [],
    updates: [],
    activeProjects: []
  })

  // Fetch user data from backend
  const fetchUserProfile = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/student/profile/${userId}`)
      setUser({
        uid: response.data._id,
        name: response.data.name,
        email: response.data.email,
        domain: response.data.domain,
        skills: response.data.skills || [],
        competitions: response.data.competitions || [],
        profilePicture: response.data.profilePicture || "/default-profile.png",
      })
      // Fetch dashboard data after user profile is loaded
      await fetchDashboardData(userId)
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch dashboard data
  const fetchDashboardData = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/student/dashboard/${userId}`)
      setDashboardData(response.data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  // Auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserProfile(user.uid)
      } else {
        navigate('/login')
      }
    })
    return () => unsubscribe()
  }, [navigate])

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    };
    return date.toLocaleString('en-US', options);
  }

  // Format time since for updates
  const formatTimeSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  }

  // Dynamic updates based on dashboard data
  const updates = [
    {
      type: "application",
      message: `You have ${dashboardData.stats.pendingApplications} pending team applications`,
      time: formatTimeSince(new Date()),
      link: "/my-teams",
      icon: <FaUserPlus className="text-purple-400" />
    },
    {
      type: "competition",
      message: `You have ${dashboardData.upcomingDeadlines.filter(d => d.type === 'competition').length} upcoming competition deadlines`,
      time: formatTimeSince(new Date(Date.now() - 3600000)), // 1 hour ago
      link: "/competitions",
      icon: <FaTrophy className="text-yellow-400" />
    },
    {
      type: "team",
      message: `You have ${dashboardData.upcomingDeadlines.filter(d => d.type === 'team').length} team deadlines approaching`,
      time: formatTimeSince(new Date(Date.now() - 7200000)), // 2 hours ago
      link: "/my-teams",
      icon: <FaUsers className="text-blue-400" />
    }
  ]

  // Stats cards configuration
  const stats = [
    { 
      title: "Potential Teammates", 
      value: dashboardData.stats.potentialTeammates, 
      icon: <FaUsers className="text-blue-400" />, 
      link: "/find-teammates",
      color: "blue"
    },
    { 
      title: "Open Teams", 
      value: dashboardData.stats.openTeams, 
      icon: <FaUserPlus className="text-green-400" />, 
      link: "/open-teams",
      color: "green"
    },
    { 
      title: "My Teams", 
      value: dashboardData.stats.myTeams, 
      icon: <FaTrophy className="text-yellow-400" />, 
      link: "/my-teams",
      color: "yellow"
    },
    { 
      title: "Pending Apps", 
      value: dashboardData.stats.pendingApplications, 
      icon: <FaComments className="text-purple-400" />, 
      link: "/my-teams",
      color: "purple"
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar Navigation */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}
      >
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            <FaGraduationCap className="text-blue-400 text-xl" />
            ScholarCompete
          </h1>
        </div>

        <div className="p-3">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border-2 border-blue-500/50">
              <img 
                src={user?.profilePicture ? `https://team-match.up.railway.app${user.profilePicture}` : "/default-profile.png"}
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = "/default-profile.png"
                }}
              />
            </div>
            <div>
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-xs text-gray-400">{user.domain}</p>
            </div>
          </div>
        </div>

        <nav className="mt-1 px-2">
          <Link
            to="/find-teammates"
            className="flex items-center px-3 py-2 text-sm rounded-lg mb-1 text-white bg-gradient-to-r from-blue-600/40 to-purple-600/40 border border-blue-500/20"
          >
            <FaHome className="mr-2 text-base" />
            Dashboard
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center px-3 py-2 text-sm rounded-lg mb-1 text-gray-300 hover:text-white hover:bg-gray-700/70"
          >
            <FaUsers className="mr-2 text-base" />
            Find Teammates
          </Link>
          <Link
            to="/open-teams"
            className="flex items-center px-3 py-2 text-sm rounded-lg mb-1 text-gray-300 hover:text-white hover:bg-gray-700/70"
          >
            <FaUserPlus className="mr-2 text-base" />
            Open Teams
          </Link>
          <Link
            to="/my-teams"
            className="flex items-center px-3 py-2 text-sm rounded-lg mb-1 text-gray-300 hover:text-white hover:bg-gray-700/70"
          >
            <FaTrophy className="mr-2 text-base" />
            My Teams
          </Link>
          <Link
            to="/chats"
            className="flex items-center px-3 py-2 text-sm rounded-lg mb-1 text-gray-300 hover:text-white hover:bg-gray-700/70"
          >
            <FaComments className="mr-2 text-base" />
            Chats
          </Link>

          <div className="mt-8 pt-4 border-t border-gray-700">
            <Link
              to="/logout"
              className="flex items-center px-3 py-2 text-sm rounded-lg mb-1 text-gray-300 hover:text-white hover:bg-gray-700/70"
              onClick={() => {
                auth.signOut()
                navigate('/login')
              }}
            >
              <FaSignOutAlt className="mr-2 text-base" />
              Logout
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-300 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            ScholarCompete
          </h1>
          <div className="w-6"></div> {/* Spacer for alignment */}
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-3 md:p-5 lg:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard Overview</h1>
            <div className="flex gap-3">
              <Link 
                to="/teams/create" 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center"
              >
                <FaUserPlus className="mr-2" />
                Create New Team
              </Link>
              <Link 
                to="/competitions" 
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors flex items-center"
              >
                <FaTrophy className="mr-2" />
                Browse Competitions
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            {stats.map((stat, index) => (
              <Link
                key={index}
                to={stat.link}
                className={`bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-${stat.color}-500/30 hover:shadow-lg hover:shadow-${stat.color}-500/5 transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className="text-2xl bg-gray-700/50 p-2 rounded-lg">{stat.icon}</div>
                </div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Recent Updates */}
            <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Recent Updates</h2>
              </div>
              <div className="space-y-4">
                {updates.map((update, index) => (
                  <Link
                    key={index}
                    to={update.link}
                    className="flex items-start p-3 hover:bg-gray-700/50 rounded-lg transition-colors group"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-10 h-10 bg-${update.type === 'application' ? 'purple' : update.type === 'competition' ? 'yellow' : 'blue'}-500/20 rounded-full flex items-center justify-center`}>
                        {update.icon}
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium group-hover:text-blue-400 transition-colors">{update.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{update.time}</p>
                    </div>
                    <div className="ml-auto self-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Upcoming Deadlines</h2>
              </div>
              <div className="space-y-4">
                {dashboardData.upcomingDeadlines.length > 0 ? (
                  dashboardData.upcomingDeadlines.slice(0, 5).map((event, index) => (
                      <div className="flex items-center">
                        <div className={`w-10 h-10 ${event.type === 'competition' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'} rounded-full flex items-center justify-center mr-3`}>
                          <FaCalendarAlt />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-blue-400 transition-colors">{event.title}</p>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(event.date)}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full ${event.type === 'competition' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-blue-500/10 text-blue-400'}`}>
                              {event.type === 'competition' ? 'Competition' : 'Team'}
                            </span>
                          </div>
                        </div>
                      </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <FaCalendarAlt className="mx-auto text-gray-500 text-2xl mb-2" />
                    <p className="text-sm text-gray-400">No upcoming deadlines</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Access Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Quick Access</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Link
                to="/dashboard"
                className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-blue-500/30 transition-colors flex items-center hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mr-3 group-hover:bg-blue-500/20 transition-colors">
                  <FaUsers className="text-lg" />
                </div>
                <div>
                  <h3 className="font-medium text-sm group-hover:text-blue-400 transition-colors">Find Teammates</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Connect with skilled peers</p>
                </div>
              </Link>
              <Link
                to="/open-teams"
                className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-green-500/30 transition-colors flex items-center hover:shadow-lg hover:shadow-green-500/5 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mr-3 group-hover:bg-green-500/20 transition-colors">
                  <FaUserPlus className="text-lg" />
                </div>
                <div>
                  <h3 className="font-medium text-sm group-hover:text-green-400 transition-colors">Open Teams</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Join teams looking for members</p>
                </div>
              </Link>
              <Link
                to="/my-teams"
                className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-yellow-500/30 transition-colors flex items-center hover:shadow-lg hover:shadow-yellow-500/5 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-yellow-500/10 text-yellow-400 rounded-full flex items-center justify-center mr-3 group-hover:bg-yellow-500/20 transition-colors">
                  <FaTrophy className="text-lg" />
                </div>
                <div>
                  <h3 className="font-medium text-sm group-hover:text-yellow-400 transition-colors">My Teams</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Manage your active teams</p>
                </div>
              </Link>
              <Link
                to="/competitions"
                className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-purple-500/30 transition-colors flex items-center hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center mr-3 group-hover:bg-purple-500/20 transition-colors">
                  <FaChartBar className="text-lg" />
                </div>
                <div>
                  <h3 className="font-medium text-sm group-hover:text-purple-400 transition-colors">Competitions</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Browse and join challenges</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Active Projects Section */}
<div className="mt-8">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-lg font-semibold">Active Projects</h2>
    <Link to="/my-teams" className="text-sm text-blue-400 hover:text-blue-300">
      View all projects
    </Link>
  </div>
  <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-700/50">
            <th className="text-left py-3 px-4 text-sm font-medium">Project Name</th>
            <th className="text-left py-3 px-4 text-sm font-medium">Team</th>
            <th className="text-left py-3 px-4 text-sm font-medium">Deadline</th>
            <th className="text-left py-3 px-4 text-sm font-medium">Tasks</th>
            <th className="text-left py-3 px-4 text-sm font-medium">Progress</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {dashboardData.activeProjects && dashboardData.activeProjects.length > 0 ? (
            dashboardData.activeProjects.map((project, index) => (
              <tr key={index} className="hover:bg-gray-700/30">
                <td className="py-3 px-4">
                  <Link to={`/my-teams/${project.teamId}`} className="font-medium hover:text-blue-400 transition-colors">
                    {project.name}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  <Link to={`/my-teams/${project.teamId}`} className="hover:text-blue-400 transition-colors">
                    {project.teamName}
                  </Link>
                </td>
                <td className="py-3 px-4">
                  {project.deadline ? formatDate(project.deadline) : 'No deadline'}
                </td>
                <td className="py-3 px-4 text-sm">
                  {project.completedTasks} / {project.totalTasks} completed
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          project.progress >= 80 ? 'bg-green-500' :
                          project.progress >= 50 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {project.progress}%
                    </span>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="py-6 text-center text-gray-400">
                No active projects found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 border-t border-gray-700 p-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} ScholarCompete. All rights reserved.
        </footer>
      </div>
    </div>
  )
}