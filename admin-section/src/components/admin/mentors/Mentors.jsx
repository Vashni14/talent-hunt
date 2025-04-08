import React, { useState } from 'react';

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
        return 'bg-[#1b5e20] text-[#4CAF50]';
      case 'On Leave':
        return 'bg-[#f57f17] text-[#FFC107]';
      default:
        return 'bg-gray-700 text-gray-400';
    }
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${index < Math.floor(rating) ? 'text-[#FFC107]' : 'text-gray-600'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Mentors</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#2196F3] text-white rounded-lg hover:bg-[#1976D2] transition-colors duration-200"
        >
          Add Mentor
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Department</label>
            <select
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="w-full bg-[#2a2a2a] text-white rounded-lg p-2 border border-[#404040] focus:border-blue-500 focus:ring-blue-500"
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
              className="w-full bg-[#2a2a2a] text-white rounded-lg p-2 border border-[#404040] focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search mentors..."
              className="w-full bg-[#2a2a2a] text-white rounded-lg p-2 border border-[#404040] placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <div key={mentor.id} className="bg-[#242424] rounded-lg p-6">
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
                      className="px-3 py-1 bg-[#2a2a2a] text-gray-400 rounded-lg text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button className="text-[#2196F3] hover:text-[#1976D2] transition-colors duration-200">
                  Edit
                </button>
                <button className="text-[#f44336] hover:text-[#d32f2f] transition-colors duration-200">
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Mentor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">
              {selectedMentor ? 'Edit Mentor' : 'Add New Mentor'}
            </h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option>Computer Science</option>
                    <option>Electrical Engineering</option>
                    <option>Mechanical Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option>Active</option>
                    <option>On Leave</option>
                    <option>Unavailable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Teams</label>
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Availability</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Unavailable</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expertise (comma-separated)</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Web Development, AI/ML, etc."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {selectedMentor ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mentors; 