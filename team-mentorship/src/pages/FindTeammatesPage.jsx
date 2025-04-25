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
const API_URL = "http://localhost:5000/api"

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
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
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

  const updates = [
    {
      type: "invitation",
      message: "You have 2 new team invitations",
      time: "10 minutes ago",
      link: "/my-teams",
    },
    {
      type: "message",
      message: "Alex Chen sent you a message",
      time: "1 hour ago",
      link: "/chats",
    },
    {
      type: "team",
      message: "Web Wizards project deadline in 3 days",
      time: "2 hours ago",
      link: "/my-teams",
    },
    {
      type: "invitation",
      message: "Data Science Team invited you to join",
      time: "5 hours ago",
      link: "/my-teams",
    },
  ]

  const stats = [
    { title: "Potential Teammates", value: "24", icon: <FaUsers className="text-blue-400" />, link: "/find-teammates" },
    { title: "Open Teams", value: "8", icon: <FaUserPlus className="text-green-400" />, link: "/open-teams" },
    { title: "My Teams", value: "3", icon: <FaTrophy className="text-yellow-400" />, link: "/my-teams" },
    { title: "Unread Messages", value: "5", icon: <FaComments className="text-purple-400" />, link: "/chats" },
  ]

  const upcomingEvents = [
    { title: "Team Meeting: Web Wizards", date: "Today, 3:00 PM", type: "meeting" },
    { title: "Project Submission Deadline", date: "Apr 10, 11:59 PM", type: "deadline" },
    { title: "Hackathon Registration Opens", date: "Apr 15, 9:00 AM", type: "event" },
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
                  src={user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : "/default-profile.png"}
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
          <Link
            to="/team-chats"
            className="flex items-center px-3 py-2 text-sm rounded-lg mb-1 text-gray-300 hover:text-white hover:bg-gray-700/70"
          >
            <FaComments className="mr-2 text-base" />
            Team Chat
          </Link>
          <Link
            to="/mentor-student-chats"
            className="flex items-center px-3 py-2 text-sm rounded-lg mb-1 text-gray-300 hover:text-white hover:bg-gray-700/70"
          >
            <FaComments className="mr-2 text-base" />
            Mentor Chat
          </Link>
          <Link
            to="/calendar"
            className="flex items-center px-3 py-2 text-sm rounded-lg mb-1 text-gray-300 hover:text-white hover:bg-gray-700/70"
          >
            <FaCalendarAlt className="mr-2 text-base" />
            Calendar
          </Link>
          <Link
            to="/analytics"
            className="flex items-center px-3 py-2 text-sm rounded-lg mb-1 text-gray-300 hover:text-white hover:bg-gray-700/70"
          >
            <FaChartBar className="mr-2 text-base" />
            Analytics
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
       

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-3 md:p-5 lg:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold"></h1>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
                Create New Team
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
                <Link to="/notifications" className="text-sm text-blue-400 hover:text-blue-300">
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
                      {update.type === "invitation" && (
                        <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center">
                          <FaUserPlus />
                        </div>
                      )}
                      {update.type === "message" && (
                        <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center">
                          <FaComments />
                        </div>
                      )}
                      {update.type === "team" && (
                        <div className="w-10 h-10 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center">
                          <FaTrophy />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium">{update.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{update.time}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Upcoming Events</h2>
                <Link to="/calendar" className="text-sm text-blue-400 hover:text-blue-300">
                  View calendar
                </Link>
              </div>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="p-3 hover:bg-gray-700/50 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mr-3">
                        <FaCalendarAlt />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{event.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Quick Access</h2>
              <button className="text-sm text-blue-400 hover:text-blue-300">Customize</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Link
                to="/find-teammates"
                className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-blue-500/30 transition-colors flex items-center hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mr-3">
                  <FaUsers className="text-lg" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Find Teammates</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Browse and connect</p>
                </div>
              </Link>
              <Link
                to="/open-teams"
                className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-green-500/30 transition-colors flex items-center hover:shadow-lg hover:shadow-green-500/5 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mr-3">
                  <FaUserPlus className="text-lg" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Open Teams</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Join teams looking</p>
                </div>
              </Link>
              <Link
                to="/my-teams"
                className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-yellow-500/30 transition-colors flex items-center hover:shadow-lg hover:shadow-yellow-500/5 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-yellow-500/10 text-yellow-400 rounded-full flex items-center justify-center mr-3">
                  <FaTrophy className="text-lg" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">My Teams</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Manage your teams</p>
                </div>
              </Link>
              <Link
                to="/chats"
                className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-purple-500/30 transition-colors flex items-center hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center mr-3">
                  <FaComments className="text-lg" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Chats</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Communicate teams</p>
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
                      <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    <tr className="hover:bg-gray-700/30">
                      <td className="py-3 px-4">
                        <div className="font-medium">Web Development Portfolio</div>
                      </td>
                      <td className="py-3 px-4">Web Wizards</td>
                      <td className="py-3 px-4">Apr 10, 2025</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                          In Progress
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-700/30">
                      <td className="py-3 px-4">
                        <div className="font-medium">Machine Learning Model</div>
                      </td>
                      <td className="py-3 px-4">Data Dynamos</td>
                      <td className="py-3 px-4">Apr 20, 2025</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">Planning</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-700/30">
                      <td className="py-3 px-4">
                        <div className="font-medium">Mobile App Prototype</div>
                      </td>
                      <td className="py-3 px-4">App Architects</td>
                      <td className="py-3 px-4">May 5, 2025</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">On Track</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 border-t border-gray-700 p-4 text-center text-sm text-gray-500">
        </footer>
      </div>
    </div>
  )
}

