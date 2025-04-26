import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
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
  FaUser,
  FaQuestionCircle
} from 'react-icons/fa';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const tour = useRef(null);

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

  // Initialize the tour
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
      text: 'Welcome to the Admin Dashboard! Let me guide you through the main features.',
      buttons: [
        {
          text: 'Next',
          action: tour.current.next
        }
      ]
    });

    // Sidebar step
    tour.current.addStep({
      id: 'sidebar',
      text: 'This is your navigation sidebar. Use it to access all admin sections.',
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

    // Dashboard link step
    tour.current.addStep({
      id: 'dashboard-link',
      text: 'Return to the main dashboard view from any page.',
      attachTo: {
        element: 'a[href="/admin-dashboard"]',
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

    // Competitions link step
    tour.current.addStep({
      id: 'competitions-link',
      text: 'Manage all competitions - create, edit, or monitor ongoing ones.',
      attachTo: {
        element: 'a[href="/admin-dashboard/competitions"]',
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

    // Students link step
    tour.current.addStep({
      id: 'students-link',
      text: 'View and manage all student accounts and their activities.',
      attachTo: {
        element: 'a[href="/admin-dashboard/students"]',
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

    // Teams link step
    tour.current.addStep({
      id: 'teams-link',
      text: 'Monitor and manage all student teams participating in competitions.',
      attachTo: {
        element: 'a[href="/admin-dashboard/teams"]',
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

    // Mentors link step
    tour.current.addStep({
      id: 'mentors-link',
      text: 'Manage mentor accounts and their assigned teams.',
      attachTo: {
        element: 'a[href="/admin-dashboard/mentors"]',
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

    // Reports link step
    tour.current.addStep({
      id: 'reports-link',
      text: 'Access detailed reports and analytics about platform usage.',
      attachTo: {
        element: 'a[href="/admin-dashboard/reports"]',
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

    // SDG Mapping link step
    tour.current.addStep({
      id: 'sdg-link',
      text: 'View and manage Sustainable Development Goals mapping for projects.',
      attachTo: {
        element: 'a[href="/admin-dashboard/sdg"]',
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

    // Logout step
    tour.current.addStep({
      id: 'logout-link',
      text: 'Securely log out of the admin panel when you\'re done.',
      attachTo: {
        element: 'a[href="/auth"]',
        on: 'right'
      },
      buttons: [
        {
          text: 'Back',
          action: tour.current.back
        },
        {
          text: 'Finish',
          action: tour.current.complete
        }
      ]
    });
  };

  const startTour = () => {
    if (tour.current) {
      const isFirstVisit = localStorage.getItem('adminTourCompleted') !== 'true';
      if (isFirstVisit) {
        localStorage.setItem('adminTourCompleted', 'true');
      }
      tour.current.start();
    }
  };

  // Initialize tour on component mount
  useEffect(() => {
    initTour();
    
    return () => {
      if (tour.current) {
        tour.current.complete();
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar Navigation */}
      <div
        className={`fixed inset-y-0 left-0 z-50 ${isSidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 border-r border-gray-700 transform transition-all duration-300 ease-in-out sidebar-nav`}
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

        {/* Help Button */}
        <div className="absolute bottom-4 left-0 right-0 px-2">
          <button
            onClick={startTour}
            className={`flex items-center px-3 py-3 text-sm rounded-lg w-full text-gray-300 hover:text-white hover:bg-gray-700/70 ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}
          >
            <FaQuestionCircle className={`${isSidebarOpen ? 'mr-3' : ''} text-lg`} />
            {isSidebarOpen && 'Help'}
          </button>
        </div>
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

      {/* Shepherd.js custom theme */}
      <style>{`
        .shepherd-theme-custom {
          background: #1f2937;
          color: white;
          border: 1px solid #374151;
          border-radius: 0.5rem;
        }
        .shepherd-theme-custom .shepherd-header {
          background: #1f2937;
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

export default AdminDashboard;