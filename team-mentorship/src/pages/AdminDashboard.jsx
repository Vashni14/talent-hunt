import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaTrophy,
  FaUsers,
  FaUserGraduate,
  FaChartBar,
  FaShieldAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
  FaUser
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const menuItems = [
    { name: 'Dashboard', path: '/admin-dashboard', icon: <FaHome className="text-lg" /> },
    { name: 'Competitions', path: '/admin-dashboard/competitions', icon: <FaTrophy className="text-lg" /> },
    { name: 'Students', path: '/admin-dashboard/students', icon: <FaUser className="text-lg" /> },
    { name: 'Teams', path: '/admin-dashboard/teams', icon: <FaUsers className="text-lg" /> },
    { name: 'Mentors', path: '/admin-dashboard/mentors', icon: <FaUserGraduate className="text-lg" /> },
    { name: 'Reports', path: '/admin-dashboard/reports', icon: <FaChartBar className="text-lg" /> },
    { name: 'SDG Mapping', path: '/admin-dashboard/sdg', icon: <FaShieldAlt className="text-lg" /> },
    { name: 'Logout', path: '/auth', icon: <FaSignOutAlt className="text-lg" /> },
  ];
  
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar Navigation */}
      <div
        className={`fixed inset-y-0 left-0 z-50 ${isSidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 border-r border-gray-700 transform transition-all duration-300 ease-in-out`}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          {isSidebarOpen && (
            <h1 className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              <FaTrophy className="text-blue-400 text-xl" />
              Admin Panel
            </h1>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-700/70 text-gray-400"
          >
            {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
        </div>

        <nav className="mt-4 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-3 text-sm rounded-lg mb-1 ${location.pathname === item.path ? 
                'text-white bg-gradient-to-r from-blue-600/40 to-purple-600/40 border border-blue-500/20' : 
                'text-gray-300 hover:text-white hover:bg-gray-700/70'}`}
            >
              <span className={`${isSidebarOpen ? 'mr-3' : 'mx-auto'}`}>
                {item.icon}
              </span>
              {isSidebarOpen && item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-3 md:p-5 lg:p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 border-t border-gray-700 p-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} ScholarCompete Admin Panel
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboard;