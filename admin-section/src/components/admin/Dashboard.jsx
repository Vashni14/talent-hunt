import React from 'react';
import { Link } from "react-router-dom";
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
} from "react-icons/fa";

const Dashboard = () => {
  const stats = [
    { 
      title: 'Active Competitions', 
      value: '12', 
      icon: <FaTrophy className="text-yellow-400" />,
      link: "/competitions"
    },
    { 
      title: 'Total Teams', 
      value: '45', 
      icon: <FaUsers className="text-blue-400" />,
      link: "/teams"
    },
    { 
      title: 'Active Mentors', 
      value: '25', 
      icon: <FaUserPlus className="text-green-400" />,
      link: "/mentors"
    },
    { 
      title: 'Pending Approvals', 
      value: '8', 
      icon: <FaBell className="text-purple-400" />,
      link: "/approvals"
    },
  ];

  const recentActivity = [
    {
      type: "team",
      message: "New team formed for Hackathon 2024",
      time: "2 hours ago",
      link: "/teams",
      icon: <FaUsers className="text-blue-400" />
    },
    {
      type: "competition",
      message: "New competition added: Robotics Challenge",
      time: "5 hours ago",
      link: "/competitions",
      icon: <FaTrophy className="text-yellow-400" />
    },
    {
      type: "mentor",
      message: "3 pending mentor approvals",
      time: "1 day ago",
      link: "/mentors",
      icon: <FaUserPlus className="text-green-400" />
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Dashboard Content */}
      <main className="flex-1 overflow-auto p-3 md:p-5 lg:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
              Create New Competition
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
                  <p className="text-2xl font-bold mt-1 text-white">{stat.value}</p>
                </div>
                <div className="text-2xl bg-gray-700/50 p-2 rounded-lg">{stat.icon}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <Link to="/activity" className="text-sm text-blue-400 hover:text-blue-300">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <Link
                key={index}
                to={activity.link}
                className="flex items-start p-3 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center">
                    {activity.icon}
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-white">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Quick Access</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Link
              to="/competitions"
              className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-blue-500/30 transition-colors flex items-center hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mr-3">
                <FaTrophy className="text-lg" />
              </div>
              <div>
                <h3 className="font-medium text-sm text-white">Competitions</h3>
                <p className="text-xs text-gray-500 mt-0.5">Manage competitions</p>
              </div>
            </Link>
            <Link
              to="/teams"
              className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-green-500/30 transition-colors flex items-center hover:shadow-lg hover:shadow-green-500/5 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mr-3">
                <FaUsers className="text-lg" />
              </div>
              <div>
                <h3 className="font-medium text-sm text-white">Teams</h3>
                <p className="text-xs text-gray-500 mt-0.5">Manage teams</p>
              </div>
            </Link>
            <Link
              to="/mentors"
              className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-yellow-500/30 transition-colors flex items-center hover:shadow-lg hover:shadow-yellow-500/5 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-yellow-500/10 text-yellow-400 rounded-full flex items-center justify-center mr-3">
                <FaUserPlus className="text-lg" />
              </div>
              <div>
                <h3 className="font-medium text-sm text-white">Mentors</h3>
                <p className="text-xs text-gray-500 mt-0.5">Manage mentors</p>
              </div>
            </Link>
            <Link
              to="/approvals"
              className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-purple-500/30 transition-colors flex items-center hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300"
            >
              <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center mr-3">
                <FaBell className="text-lg" />
              </div>
              <div>
                <h3 className="font-medium text-sm text-white">Approvals</h3>
                <p className="text-xs text-gray-500 mt-0.5">Review requests</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;