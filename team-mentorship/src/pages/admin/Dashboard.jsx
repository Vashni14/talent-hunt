import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import {
  FaTrophy,
  FaUsers,
  FaUserPlus,
  FaBell,
  FaFilter,
  FaTimes,
  FaCalendarAlt,
  FaChevronDown,
  FaSearch,
  FaQuestionCircle
} from "react-icons/fa";
import axios from 'axios';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    date: 'all',
    search: ''
  });
  const [allActivities, setAllActivities] = useState([]);
  const tour = useRef(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const [reportsRes, competitionsRes, teamsRes, mentorsRes, applicationsRes] = await Promise.all([
          axios.get('https://team-match.up.railway.app/api/admindash/reports/dashboard'),
          axios.get('https://team-match.up.railway.app/api/admindash/competitions'),
          axios.get('https://team-match.up.railway.app/api/admindash/teams'),
          axios.get('https://team-match.up.railway.app/api/admindash/mentor/mentors'),
          axios.get('https://team-match.up.railway.app/api/admindash/applications?status=pending')
        ]);

        const dashboardData = reportsRes.data.data || {};
        const competitions = competitionsRes.data || [];
        const teams = Array.isArray(teamsRes.data?.data) ? teamsRes.data.data : [];
        const mentors = Array.isArray(mentorsRes.data) ? mentorsRes.data : [];
        const pendingApplications = Array.isArray(applicationsRes.data) ? applicationsRes.data : [];

        // Process stats
        const processedStats = [
          { 
            title: 'Active Competitions', 
            value: dashboardData.totals?.competitions || competitions.filter(c => c.status === 'Active').length || 0, 
            icon: <FaTrophy className="text-yellow-400" />,
            link: "/admin-dashboard/competitions"
          },
          { 
            title: 'Total Teams', 
            value: dashboardData.totals?.teams || teams.length || 0, 
            icon: <FaUsers className="text-blue-400" />,
            link: "/admin-dashboard/students"
          },
          { 
            title: 'Active Mentors', 
            value: dashboardData.totals?.mentors || mentors.length || 0, 
            icon: <FaUserPlus className="text-green-400" />,
            link: "/admin-dashboard/mentors"
          },
          { 
            title: 'Pending Approvals', 
            value: pendingApplications.length || 0, 
            icon: <FaBell className="text-purple-400" />,
            link: "/admin-dashboard/teams"
          },
        ];

        // Process activities
        const processedActivity = [];
        
        // Add competitions
        competitions
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)
          .forEach(comp => {
            processedActivity.push({
              id: comp._id,
              type: "competition",
              message: `New competition added: ${comp.name}`,
              time: comp.createdAt,
              icon: <FaTrophy className="text-yellow-400" />,
              fullData: comp
            });
          });

        // Add teams
        teams
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)
          .forEach(team => {
            processedActivity.push({
              id: team._id,
              type: "team",
              message: `New team formed: ${team.name}`,
              time: team.createdAt,
              icon: <FaUsers className="text-blue-400" />,
              fullData: team
            });
          });

        // Add applications
        if (pendingApplications.length > 0) {
          processedActivity.push({
            id: `applications-${Date.now()}`,
            type: "application",
            message: `${pendingApplications.length} pending applications to review`,
            time: new Date().toISOString(),
            icon: <FaBell className="text-purple-400" />,
            fullData: pendingApplications
          });
        }

        // Sort all activities by time (newest first)
        processedActivity.sort((a, b) => new Date(b.time) - new Date(a.time));

        setStats(processedStats);
        setRecentActivity(processedActivity);
        setAllActivities(processedActivity);
        setLoading(false);
        
        // Initialize tour after data loads
        initTour();
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      if (tour.current) {
        tour.current.complete();
      }
    };
  }, []);

  const initTour = () => {
    tour.current = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'shadow-md bg-gray-800 border border-gray-700',
        scrollTo: { behavior: 'smooth', block: 'center' }
      }
    });

    // Welcome step
    tour.current.addStep({
      id: 'welcome',
      text: 'Welcome to your Admin Dashboard! Let me show you around.',
      buttons: [
        {
          text: 'Next',
          action: tour.current.next
        }
      ],
      attachTo: {
        element: '.dashboard-title',
        on: 'bottom'
      }
    });

    // Sidebar navigation step
    tour.current.addStep({
      id: 'sidebar-nav',
      text: 'Use this sidebar to navigate between different sections of the admin dashboard.',
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
      attachTo: {
        element: '.sidebar-nav',
        on: 'right'
      }
    });

    // Stats cards
    tour.current.addStep({
      id: 'stats-cards',
      text: 'These cards show important statistics at a glance. Click any card to view more details.',
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
      attachTo: {
        element: '.stats-grid',
        on: 'bottom'
      }
    });

    // Recent activity
    tour.current.addStep({
      id: 'recent-activity',
      text: 'Here you can see recent activities. Click "View All" to see a filtered list of all activities.',
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
      attachTo: {
        element: '.recent-activity-section',
        on: 'bottom'
      }
    });

    // Quick links
    tour.current.addStep({
      id: 'quick-links',
      text: 'Quick access to all major sections of the dashboard.',
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
      attachTo: {
        element: '.quick-links-section',
        on: 'bottom'
      }
    });

    // Create competition button
    tour.current.addStep({
      id: 'create-competition',
      text: 'Start here to create a new competition for students.',
      buttons: [
        {
          text: 'Back',
          action: tour.current.back
        },
        {
          text: 'Finish',
          action: tour.current.next
        }
      ],
      attachTo: {
        element: '.create-competition-btn',
        on: 'bottom'
      }
    });
  };

  const startTour = () => {
    if (tour.current) {
      const isFirstVisit = localStorage.getItem('dashboardTourCompleted') !== 'true';
      if (isFirstVisit) {
        localStorage.setItem('dashboardTourCompleted', 'true');
      }
      tour.current.start();
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredActivities = allActivities.filter(activity => {
    // Type filter
    if (filters.type !== 'all' && activity.type !== filters.type) return false;
    
    // Date filter
    if (filters.date !== 'all') {
      const activityDate = new Date(activity.time);
      const now = new Date();
      const diffInDays = Math.floor((now - activityDate) / (1000 * 60 * 60 * 24));
      
      if (filters.date === 'today' && diffInDays > 0) return false;
      if (filters.date === 'week' && diffInDays > 7) return false;
      if (filters.date === 'month' && diffInDays > 30) return false;
    }
    
    // Search filter
    if (filters.search && !activity.message.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const resetFilters = () => {
    setFilters({
      type: 'all',
      date: 'all',
      search: ''
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Dashboard Content */}
      <main className="flex-1 overflow-auto p-3 md:p-5 lg:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <h1 className="dashboard-title text-2xl md:text-3xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex gap-3">
            <Link 
              to="/admin-dashboard/competitions" 
              className="create-competition-btn px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              Create New Competition
            </Link>
            <button 
              onClick={startTour}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              title="Take a tour"
            >
              <FaQuestionCircle /> Help
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
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
        <div className="recent-activity-section bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            {recentActivity.length > 0 && (
              <button 
                onClick={() => setShowModal(true)}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                View All
              </button>
            )}
          </div>
          <div className="space-y-4">
            {recentActivity.slice(0, 3).length > 0 ? (
              recentActivity.slice(0, 3).map((activity, index) => (
                <div
                  key={`${activity.id}-${index}`}
                  className="flex items-start p-3 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center">
                      {activity.icon}
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.time)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">
                No recent activity found
              </div>
            )}
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="quick-links-section mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Quick Access</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Link
              to="/admin-dashboard/competitions"
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
              to="/admin-dashboard/students"
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
              to="/admin-dashboard/mentors"
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
              to="/admin-dashboard/teams"
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

      {/* Activities Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">All Activities</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            {/* Filters */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaFilter className="text-gray-400" />
                    </div>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({...filters, type: e.target.value})}
                      className="bg-gray-700 text-white rounded-md pl-10 pr-8 py-2 w-full appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="competition">Competitions</option>
                      <option value="team">Teams</option>
                      <option value="application">Applications</option>
                    </select>
                    <FaChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaCalendarAlt className="text-gray-400" />
                    </div>
                    <select
                      value={filters.date}
                      onChange={(e) => setFilters({...filters, date: e.target.value})}
                      className="bg-gray-700 text-white rounded-md pl-10 pr-8 py-2 w-full appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                    <FaChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search activities..."
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                      className="bg-gray-700 text-white rounded-md pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm text-white transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
            
            {/* Activities List */}
            <div className="overflow-y-auto flex-1">
              {filteredActivities.length > 0 ? (
                <ul className="divide-y divide-gray-700">
                  {filteredActivities.map((activity) => (
                    <li key={activity.id} className="hover:bg-gray-700/50 transition-colors">
                      <div className="p-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center">
                              {activity.icon}
                            </div>
                          </div>
                          <div className="ml-4 flex-1">
                            <p className="text-sm font-medium text-white">{activity.message}</p>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-gray-500">{formatFullDate(activity.time)}</p>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                                {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No activities found matching your filters
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-700 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Showing {filteredActivities.length} of {allActivities.length} activities
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;