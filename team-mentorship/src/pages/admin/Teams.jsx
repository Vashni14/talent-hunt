import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from "/src/config/firebase";

const Teams = () => {
  const [applications, setApplications] = useState([]);
  const [teamDetails, setTeamDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'pending',
    search: '',
    competition: '',
    sort: 'newest'
  });
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const token = await auth.currentUser.getIdToken();
      const response = await axios.get('http://localhost:5000/api/compapp', {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      setApplications(response.data);
      
      // Fetch team details for each application with a team
      const teamPromises = response.data
        .filter(app => app.team)
        .map(app => 
          axios.get(`http://localhost:5000/api/teams/${app.team._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        );
      
      const teamResponses = await Promise.all(teamPromises);
      const teamData = {};
      
      // For each team, fetch mentor details
      for (const teamResponse of teamResponses) {
        const team = teamResponse.data;
        if (team.mentors && team.mentors.length > 0) {
          // Fetch details for each mentor
          const mentorPromises = team.mentors.map(mentorId => 
            axios.get(`http://localhost:5000/api/mentor/profile/id/${mentorId}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          );
          
          const mentorResponses = await Promise.all(mentorPromises);
          team.mentors = mentorResponses.map(response => response.data);
        }
        
        teamData[team._id] = team;
      }
      
      setTeamDetails(teamData);
      setIsLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchApplications();
  }, [filters]);

  const updateApplicationStatus = async (status) => {
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.put(
        `http://localhost:5000/api/compapp/${selectedApplication._id}/status`,
        { 
          status,
          feedback: feedback || undefined 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setApplications(applications.map(app => 
        app._id === selectedApplication._id ? { ...app, status } : app
      ));
      setIsModalOpen(false);
      setFeedback('');
      alert(`Application ${status} successfully!`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      alert('Failed to update application status');
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = !filters.search || 
      app.student.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      app.competition.name.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || app.status === filters.status;
    const matchesCompetition = !filters.competition || 
      app.competition._id === filters.competition;
    
    return matchesSearch && matchesStatus && matchesCompetition;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (filters.sort === 'newest') return new Date(b.appliedAt) - new Date(a.appliedAt);
    if (filters.sort === 'oldest') return new Date(a.appliedAt) - new Date(b.appliedAt);
    return 0;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-500/20 text-green-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-700/50 text-gray-400';
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'Technical': 'bg-blue-500/20 text-blue-400',
      'Design': 'bg-purple-500/20 text-purple-400',
      'Management': 'bg-green-500/20 text-green-400',
      'Research': 'bg-yellow-500/20 text-yellow-400',
      'Marketing': 'bg-pink-500/20 text-pink-400'
    };
    return colors[role] || 'bg-gray-700/50 text-gray-400';
  };

  const calculateProgress = (team) => {
    if (!team.tasks || team.tasks.total === 0) return 0;
    return Math.round((team.tasks.completed / team.tasks.total) * 100);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-6 text-red-500">
      Error: {error}
      <button 
        onClick={() => setError(null)} 
        className="ml-4 px-3 py-1 bg-red-500 text-white rounded"
      >
        Dismiss
      </button>
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-white">Applications Management</h1>
      
      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Sort By</label>
            <select
              value={filters.sort}
              onChange={(e) => setFilters({...filters, sort: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search applications..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
        {sortedApplications.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
            <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-white">No applications found</h3>
            <p className="mt-1 text-gray-400">No applications match your current filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Competition
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Team
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Applied At
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {sortedApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full" 
                            src={app.student?.profilePicture ? `http://localhost:5000${app.student.profilePicture}` : "/default-profile.png"}
                            alt={app.student.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{app.student.name}</div>
                          <div className="text-sm text-gray-400">{app.student.contact}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{app.competition.name}</div>
                      <div className="text-sm text-gray-400">{app.competition.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {app.team ? (
                        <div className="text-sm text-white">{app.team.name}</div>
                      ) : (
                        <span className="text-sm text-gray-400">Individual</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedApplication(app);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {isModalOpen && selectedApplication && (
  <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-800 rounded-xl w-full max-w-5xl border border-gray-700 overflow-hidden shadow-xl">
      {/* Modal Header */}
      <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Application Review</h2>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedApplication.status)}`}>
              {selectedApplication.status}
            </span>
            <p className="text-gray-400 text-sm">
              {selectedApplication.competition.name} • {new Date(selectedApplication.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(false)}
          className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Modal Body */}
      <div className="overflow-y-auto max-h-[80vh]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Left Column - Applicant and Competition Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Applicant Card */}
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Applicant Details
              </h3>
              <div className="flex items-center space-x-3">
                <img 
                  className="h-12 w-12 rounded-full" 
                  src={selectedApplication.student?.profilePicture ? `http://localhost:5000${selectedApplication.student.profilePicture}` : "/default-profile.png"}
                  alt={selectedApplication.student.name}
                />
                <div>
                  <h4 className="text-sm font-medium text-white">{selectedApplication.student.name}</h4>
                  <p className="text-xs text-gray-400">{selectedApplication.student.contact}</p>
                  <p className="text-xs text-gray-400">{selectedApplication.student.domain}</p>
                </div>
              </div>
            </div>

            {/* Competition Card */}
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Competition Details
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm text-white">{selectedApplication.competition.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="text-sm text-white">{selectedApplication.competition.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Deadline</p>
                  <p className="text-sm text-white">
                    {new Date(selectedApplication.competition.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Skills Card */}
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Applicant Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedApplication.skills.map((skill, index) => (
                  <span key={index} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Team and Application Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team Details Card */}
            {selectedApplication.team && teamDetails[selectedApplication.team._id] && (
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-gray-400 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Team Details
                  </h3>
                  <span className="text-xs text-gray-400">
                    {teamDetails[selectedApplication.team._id].members?.length || 0} members
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-1">Team Name</h4>
                    <p className="text-sm text-white">{teamDetails[selectedApplication.team._id].name}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-1">Project</h4>
                    <p className="text-sm text-white">{teamDetails[selectedApplication.team._id].project}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-xs font-medium text-gray-500 mb-1">Progress</h4>
                  <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${calculateProgress(teamDetails[selectedApplication.team._id])}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{calculateProgress(teamDetails[selectedApplication.team._id])}% complete</span>
                    <span>
                      {teamDetails[selectedApplication.team._id].tasks?.completed || 0}/
                      {teamDetails[selectedApplication.team._id].tasks?.total || 0} tasks
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-xs font-medium text-gray-500 mb-2">Members</h4>
                  <div className="space-y-3">
                    {teamDetails[selectedApplication.team._id].members?.map((member, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img 
                            className="h-8 w-8 rounded-full" 
                            src={member.user?.profilePicture ? `http://localhost:5000${member.user.profilePicture}` : "/default-profile.png"}
                            alt={member.name || member.user?.name}
                          />
                          <div>
                            <p className="text-sm text-white">{member.name || member.user?.name}</p>
                            <p className="text-xs text-gray-400">{member.user?.contact}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(member.role)}`}>
                          {member.role || 'Member'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {teamDetails[selectedApplication.team._id].mentors?.length > 0 && (
  <div className="mt-4">
    <h4 className="text-xs font-medium text-gray-500 mb-2">Mentors</h4>
    <div className="space-y-3">
      {teamDetails[selectedApplication.team._id].mentors.map((mentor, index) => (
        <div key={index} className="flex items-center space-x-3">
          <img 
            className="h-8 w-8 rounded-full" 
            src={mentor?.profilePicture ? `http://localhost:5000${mentor.profilePicture}` : "/default-profile.png"}
            alt={mentor.name}
          />
          <div>
            <p className="text-sm text-white">{mentor.name}</p>
            <p className="text-xs text-gray-400">{mentor.email}</p>
            <p className="text-xs text-gray-400">{mentor.skills?.join(', ')}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
              </div>
            )}

            {/* Motivation Card */}
            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
              <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Motivation
              </h3>
              <p className="text-sm text-gray-300 whitespace-pre-line">
                {selectedApplication.motivation}
              </p>
            </div>

            {/* Additional Info Card */}
            {selectedApplication.additionalInfo && (
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Additional Information
                </h3>
                <p className="text-sm text-gray-300 whitespace-pre-line">
                  {selectedApplication.additionalInfo}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="bg-gray-900 px-6 py-4 border-t border-gray-700 flex justify-between">
        <div className="text-sm text-gray-400">
          Applied on: {new Date(selectedApplication.appliedAt).toLocaleString()}
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => updateApplicationStatus('rejected')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
          >
            Reject
          </button>
          <button
            onClick={() => updateApplicationStatus('accepted')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Teams;