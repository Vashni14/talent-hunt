import React, { useState } from 'react';
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
  FaEdit,
  FaTrash,
  FaStar
} from "react-icons/fa";

const Mentors = () => {
  const [mentors, setMentors] = useState([
    {
      id: 1,
      name: 'Dr. Sarah Williams',
      email: 'sarah.williams@university.edu',
      department: 'Computer Science',
      expertise: ['Web Development', 'AI/ML', 'Data Science'],
      status: 'Active',
      assignedTeams: 3,
      maxTeams: 5,
      availability: 'Full-time',
      rating: 4.8,
    },
    {
      id: 2,
      name: 'Prof. Robert Chen',
      email: 'robert.chen@university.edu',
      department: 'Electrical Engineering',
      expertise: ['Embedded Systems', 'Robotics', 'IoT'],
      status: 'Active',
      assignedTeams: 2,
      maxTeams: 4,
      availability: 'Part-time',
      rating: 4.5,
    },
    {
      id: 3,
      name: 'Dr. Maria Garcia',
      email: 'maria.garcia@university.edu',
      department: 'Mechanical Engineering',
      expertise: ['CAD', 'Product Design', '3D Printing'],
      status: 'On Leave',
      assignedTeams: 0,
      maxTeams: 3,
      availability: 'Unavailable',
      rating: 4.7,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [filters, setFilters] = useState({
    department: '',
    status: '',
    search: '',
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleStatusChange = (mentorId, newStatus) => {
    setMentors(mentors.map(mentor => 
      mentor.id === mentorId ? { ...mentor, status: newStatus } : mentor
    ));
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesDepartment = !filters.department || mentor.department === filters.department;
    const matchesStatus = !filters.status || mentor.status === filters.status;
    const matchesSearch = !filters.search || 
      mentor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      mentor.email.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesDepartment && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/20 text-green-400';
      case 'On Leave':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <FaStar
        key={index}
        className={`w-4 h-4 ${index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-600'}`}
      />
    ));
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar Navigation - Same as FindTeammatesPage */}
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-3 md:p-5 lg:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold">Mentors</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              Add Mentor
            </button>
          </div>

          {/* Filters */}
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Department</label>
                <select
                  name="department"
                  value={filters.department}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search mentors..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 pl-10 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <div key={mentor.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500/30 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{mentor.name}</h3>
                    <p className="text-gray-400">{mentor.department}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(mentor.status)}`}>
                    {mentor.status}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400">Email: {mentor.email}</p>
                    <p className="text-gray-400">Availability: {mentor.availability}</p>
                    <p className="text-gray-400">Teams: {mentor.assignedTeams}/{mentor.maxTeams}</p>
                  </div>

                  <div>
                    <p className="text-white mb-1">Rating:</p>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {renderStars(mentor.rating)}
                      </div>
                      <span className="text-gray-400">({mentor.rating})</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-white mb-2">Expertise</p>
                    <div className="flex flex-wrap gap-2">
                      {mentor.expertise.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-700 text-gray-400 rounded-lg text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setIsModalOpen(true);
                      }}
                    >
                      <FaEdit size={14} /> Edit
                    </button>
                    <button className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
                      <FaTrash size={14} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add/Edit Mentor Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {selectedMentor ? 'Edit Mentor' : 'Add New Mentor'}
                  </h2>
                  <button 
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedMentor(null);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <FaTimes />
                  </button>
                </div>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                      <input
                        type="text"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-blue-500"
                        defaultValue={selectedMentor?.name || ''}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-blue-500"
                        defaultValue={selectedMentor?.email || ''}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Department</label>
                      <select 
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-blue-500"
                        defaultValue={selectedMentor?.department || ''}
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                      <select 
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-blue-500"
                        defaultValue={selectedMentor?.status || 'Active'}
                      >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Unavailable">Unavailable</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Max Teams</label>
                      <input
                        type="number"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-blue-500"
                        defaultValue={selectedMentor?.maxTeams || 3}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Availability</label>
                      <select 
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-blue-500"
                        defaultValue={selectedMentor?.availability || 'Full-time'}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Unavailable">Unavailable</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Expertise (comma separated)</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-blue-500"
                      defaultValue={selectedMentor?.expertise.join(', ') || ''}
                      placeholder="Web Development, AI/ML, etc."
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setSelectedMentor(null);
                      }}
                      className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700/70"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      {selectedMentor ? 'Update' : 'Add'} Mentor
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Mentors;