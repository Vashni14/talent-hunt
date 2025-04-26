import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from "/src/config/firebase";

const Competitions = () => {
  const [competitions, setCompetitions] = useState([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentCompetition, setCurrentCompetition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [applicationForm, setApplicationForm] = useState({
    motivation: '',
    skills: '',
    teamId: '',
    additionalInfo: ''
  });
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('allCompetitions');
  const [myApplications, setMyApplications] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
    const [userId, setUserId] = useState(null);
  const user = auth.currentUser;
  // At the top of your component
const [authInitialized, setAuthInitialized] = useState(false);

// Auth state listener
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("User authenticated:", user.uid);
      setUserId(user.uid); // Make sure this is setting properly
      fetchData()
    } else {
      console.log("No user authenticated");
      setUserId(null);
    }
    setAuthInitialized(true);
  });
  
  return () => unsubscribe();
}, []);


  const allSDGs = [
    { id: 1, name: 'No Poverty' },
    { id: 2, name: 'Zero Hunger' },
    { id: 3, name: 'Good Health' },
    { id: 4, name: 'Quality Education' },
    { id: 5, name: 'Gender Equality' },
    { id: 6, name: 'Clean Water' },
    { id: 7, name: 'Clean Energy' },
    { id: 8, name: 'Economic Growth' },
    { id: 9, name: 'Innovation' },
    { id: 10, name: 'Reduced Inequality' },
    { id: 11, name: 'Sustainable Cities' },
    { id: 12, name: 'Responsible Consumption' },
    { id: 13, name: 'Climate Action' },
    { id: 14, name: 'Life Below Water' },
    { id: 15, name: 'Life on Land' },
    { id: 16, name: 'Peace & Justice' },
    { id: 17, name: 'Partnerships' }
  ];

    const fetchData = async () => {
      try {
        if (!userId) {
          console.log('No user ID available');
          return;
        }
        const [competitionsRes, applicationsRes, teamsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/competitions'),
          axios.get(`http://localhost:5000/api/compapp/me/${userId}`),
          axios.get(`http://localhost:5000/api/teams/user/${userId}`)
        ]);
        const validApplications = applicationsRes.data.filter(app => app.competition);

        setCompetitions(competitionsRes.data);
        setMyApplications(validApplications);
        setMyTeams(teamsRes.data.data);
        setIsLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setIsLoading(false);
      }
    };
    useEffect(() => {
        fetchData();
      }, [userId]);

  const handleViewDetails = (competition) => {
    setCurrentCompetition(competition);
    setIsDetailsModalOpen(true);
  };

  const handleApplyToCompetition = (competition) => {
    setCurrentCompetition(competition);
    setApplicationForm({
      motivation: '',
      skills: '',
      teamId: '',
      additionalInfo: ''
    });
    setIsApplicationModalOpen(true);
  };

  const handleApplicationChange = (e) => {
    const { name, value } = e.target;
    setApplicationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const submitApplication = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.post(
        `http://localhost:5000/api/compapp/${currentCompetition._id}/apply/${userId}`,
        {
          motivation: applicationForm.motivation,
          skills: applicationForm.skills.split(',').map(s => s.trim()),
          teamId: applicationForm.teamId,
          additionalInfo: applicationForm.additionalInfo
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIsApplicationModalOpen(false);
      setMyApplications([...myApplications, response.data.application]);
      alert('Application submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const updateCompetitionResult = async (applicationId, result, analysis) => {
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.put(
        `http://localhost:5000/api/compapp/${applicationId}/result/${userId}`,
        { result, analysis },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMyApplications(myApplications.map(app => 
        app._id === applicationId ? { ...app, result, analysis } : app
      ));
      setIsResultModalOpen(false);
      alert('Competition result updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/20 text-green-400';
      case 'Upcoming':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Completed':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-700/50 text-gray-400';
    }
  };

  const getApplicationStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-700/50 text-gray-400';
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'winner':
        return 'bg-purple-500/20 text-purple-400';
      case 'runner-up':
        return 'bg-blue-500/20 text-blue-400';
      case 'finalist':
        return 'bg-green-500/20 text-green-400';
      case 'participated':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-700/50 text-gray-400';
    }
  };

  const getSDGColor = (sdgId) => {
    const colors = [
      'bg-red-500', 'bg-yellow-600', 'bg-green-600', 'bg-red-600',
      'bg-orange-500', 'bg-teal-500', 'bg-yellow-500', 'bg-red-700',
      'bg-purple-500', 'bg-pink-600', 'bg-yellow-700', 'bg-green-700',
      'bg-green-800', 'bg-blue-600', 'bg-brown-500', 'bg-blue-800',
      'bg-blue-700'
    ];
    return colors[sdgId - 1] || 'bg-gray-500';
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return { text: 'No deadline set', color: 'text-gray-400' };
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate - now;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) {
      return { text: 'Deadline passed', color: 'text-red-500' };
    } else if (daysDiff === 0) {
      return { text: 'Today', color: 'text-red-500' };
    } else if (daysDiff <= 3) {
      return { text: `${daysDiff} day${daysDiff > 1 ? 's' : ''} left`, color: 'text-red-500' };
    } else if (daysDiff <= 7) {
      return { text: `${daysDiff} day${daysDiff > 1 ? 's' : ''} left`, color: 'text-yellow-500' };
    } else {
      return { text: new Date(deadline).toLocaleDateString(), color: 'text-gray-400' };
    }
  };

  const filteredCompetitions = competitions.filter(competition => {
    const matchesSearch = competition.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         competition.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || competition.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || competition.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const allCategories = ['all', ...new Set(competitions.map(c => c.category).filter(Boolean))];
  const allStatuses = ['all', 'Active', 'Upcoming', 'Completed'];

  const filteredApplications = (status) => {
    if (status === 'all') return myApplications;
    return myApplications.filter(app => app.status === status);
  };

  const DetailsModal = () => {
    const deadlineInfo = formatDeadline(currentCompetition.deadline);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl w-full max-w-4xl border border-gray-700 overflow-hidden shadow-xl">
          <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">{currentCompetition.name}</h2>
              <p className="text-gray-400 text-sm">{currentCompetition.category}</p>
            </div>
            <button 
              onClick={() => setIsDetailsModalOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="overflow-y-auto max-h-[80vh]">
            <div className="h-64 w-full bg-gray-700 overflow-hidden relative">
              <img 
                src={currentCompetition?.photo ? `http://localhost:5000${currentCompetition.photo}` : "/default-profile.png"}
                alt={currentCompetition.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent h-20" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentCompetition.status)}`}>
                  {currentCompetition.status}
                </span>
                <div className="text-white bg-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                  {currentCompetition.prizePool}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {currentCompetition.deadline && (
                <div className="mb-6 bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 mr-3 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-400">Application Deadline</p>
                      <p className={`text-lg font-bold ${deadlineInfo.color}`}>
                        {deadlineInfo.text} • {new Date(currentCompetition.deadline).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-400">Date</p>
                      <p className="text-white font-medium">{currentCompetition.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-400">Team Size</p>
                      <p className="text-white font-medium">{currentCompetition.teamSize}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-400">Prize Pool</p>
                      <p className="text-white font-medium">{currentCompetition.prizePool}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-400">Category</p>
                      <p className="text-white font-medium">{currentCompetition.category}</p>
                    </div>
                  </div>
                </div>
              </div>
    
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600 mb-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Aligned SDGs
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentCompetition.sdgs.map(sdgId => {
                    const sdg = allSDGs.find(s => s.id === sdgId);
                    return (
                      <span
                        key={sdgId}
                        className={`px-3 py-1 ${getSDGColor(sdgId)} text-white rounded-full text-sm flex items-center`}
                      >
                        <span className="w-5 h-5 mr-1 flex items-center justify-center font-medium">{sdgId}</span>
                        {sdg?.name}
                      </span>
                    );
                  })}
                </div>
              </div>
    
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Description
                </h3>
                <p className="text-gray-300 leading-relaxed">{currentCompetition.description}</p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Requirements
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentCompetition.requirements.map((req, index) => (
                    <div
                      key={index}
                      className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start"
                    >
                      <svg className="w-5 h-5 mt-0.5 mr-3 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-300">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
    
          <div className="bg-gray-900 px-6 py-4 border-t border-gray-700 flex justify-between">
            <button
              onClick={() => setIsDetailsModalOpen(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                setIsDetailsModalOpen(false);
                handleApplyToCompetition(currentCompetition);
              }}
              className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors ${
                currentCompetition.deadline && new Date(currentCompetition.deadline) < new Date() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={currentCompetition.deadline && new Date(currentCompetition.deadline) < new Date()}
            >
              {currentCompetition.deadline && new Date(currentCompetition.deadline) < new Date() ? 'Deadline Passed' : 'Apply Now'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ApplicationModal = () => {
    const deadlineInfo = formatDeadline(currentCompetition.deadline);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl w-full max-w-2xl border border-gray-700 overflow-hidden shadow-xl">
          <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Apply to {currentCompetition?.name}</h2>
              <p className="text-gray-400 text-sm">Fill out the application form below</p>
            </div>
            <button 
              onClick={() => setIsApplicationModalOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {currentCompetition.deadline && (
              <div className={`mb-4 p-3 rounded-lg ${
                new Date(currentCompetition.deadline) < new Date() 
                  ? 'bg-red-900/50 border border-red-700' 
                  : 'bg-blue-900/30 border border-blue-700'
              }`}>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">
                    {new Date(currentCompetition.deadline) < new Date() 
                      ? 'The deadline for this competition has passed. Late applications may not be accepted.' 
                      : `Application deadline: ${new Date(currentCompetition.deadline).toLocaleString()}`
                    }
                  </span>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Motivation *</label>
                <textarea
                  name="motivation"
                  value={applicationForm.motivation}
                  onChange={handleApplicationChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                  rows="3"
                  placeholder="Why do you want to participate in this competition?"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Relevant Skills *</label>
                <textarea
                  name="skills"
                  value={applicationForm.skills}
                  onChange={handleApplicationChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                  rows="2"
                  placeholder="What skills do you have that are relevant to this competition?"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Select Team *</label>
                <select
                  name="teamId"
                  value={applicationForm.teamId}
                  onChange={handleApplicationChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a team</option>
                  {myTeams.map(team => (
                    <option key={team._id} value={team._id}>
                      {team.name} ({team.members.length} members)
                    </option>
                  ))}
                </select>
                {myTeams.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    You don't have any teams yet. Please create a team first.
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Additional Information</label>
                <textarea
                  name="additionalInfo"
                  value={applicationForm.additionalInfo}
                  onChange={handleApplicationChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                  rows="2"
                  placeholder="Any additional information you'd like to provide..."
                />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 px-6 py-4 border-t border-gray-700 flex justify-end space-x-3">
            <button
              onClick={() => setIsApplicationModalOpen(false)}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submitApplication}
              disabled={!applicationForm.motivation || !applicationForm.skills || !applicationForm.teamId || 
                      (currentCompetition.deadline && new Date(currentCompetition.deadline) < new Date())}
              className={`px-4 py-2 rounded-lg transition-colors ${
                (!applicationForm.motivation || !applicationForm.skills || !applicationForm.teamId || 
                 (currentCompetition.deadline && new Date(currentCompetition.deadline) < new Date()))
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Submit Application
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ApplicationResultModal = ({ application, onClose, onSave }) => {
    const [result, setResult] = useState(application.result || '');
    const [analysis, setAnalysis] = useState(application.analysis || '');
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl w-full max-w-2xl border border-gray-700 overflow-hidden shadow-xl">
          <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Update Competition Result</h2>
              <p className="text-gray-400 text-sm">{application.competition.name}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Result *</label>
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select result</option>
                  <option value="winner">Winner</option>
                  <option value="runner-up">Runner-up</option>
                  <option value="finalist">Finalist</option>
                  <option value="participated">Participated</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Analysis / Experience</label>
                <textarea
                  value={analysis}
                  onChange={(e) => setAnalysis(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                  rows="4"
                  placeholder="Describe your experience, what you learned, challenges faced, etc."
                />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 px-6 py-4 border-t border-gray-700 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(result, analysis)}
              disabled={!result}
              className={`px-4 py-2 rounded-lg transition-colors ${
                !result
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Save Result
            </button>
          </div>
        </div>
      </div>
    );
  };

  const MyApplicationsTab = () => {
    const [selectedStatus, setSelectedStatus] = useState('all');
    
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-4 py-2 rounded-lg ${selectedStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedStatus('accepted')}
            className={`px-4 py-2 rounded-lg ${selectedStatus === 'accepted' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            Accepted
          </button>
          <button
            onClick={() => setSelectedStatus('pending')}
            className={`px-4 py-2 rounded-lg ${selectedStatus === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setSelectedStatus('rejected')}
            className={`px-4 py-2 rounded-lg ${selectedStatus === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            Rejected
          </button>
        </div>
        
        {filteredApplications(selectedStatus).length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
            <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-white">No applications found</h3>
            <p className="mt-1 text-gray-400">You haven't applied to any competitions yet or no applications match your filter</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications(selectedStatus).map(application => (
              <div key={application._id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{application.competition.name}</h3>
                    <div className="flex items-center mt-1 space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApplicationStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                      {application.result && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResultColor(application.result)}`}>
                          {application.result.replace('-', ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    Applied on: {new Date(application.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-300">
                  <p>Team: {application.team?.name || 'No team selected'}</p>
                </div>
                
                {application.analysis && (
                  <div className="mt-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Your Analysis</h4>
                    <p className="text-gray-300 text-sm">{application.analysis}</p>
                  </div>
                )}
                
                {application.status === 'accepted' && !application.result && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedApplication(application);
                        setIsResultModalOpen(true);
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                    >
                      Update Result
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
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
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Competitions</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('allCompetitions')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'allCompetitions' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            All Competitions
          </button>
          <button
            onClick={() => setActiveTab('myApplications')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'myApplications' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            My Applications
          </button>
        </div>
      </div>

      {activeTab === 'allCompetitions' && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search competitions..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <select
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {allCategories.filter(c => c !== 'all').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <select
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {allStatuses.filter(s => s !== 'all').map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredCompetitions.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
              <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-white">No competitions found</h3>
              <p className="mt-1 text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredCompetitions.map((competition) => {
                const deadlineInfo = formatDeadline(competition.deadline);
                
                return (
                  <div key={competition._id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                    <div className="h-40 overflow-hidden relative">
                      <img 
                        src={competition?.photo ? `http://localhost:5000${competition.photo}` : "/default-profile.png"}
                        alt={competition.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent h-16" />
                      <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(competition.status)}`}>
                        {competition.status}
                      </span>
                      
                      {competition.deadline && (
                        <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
                          deadlineInfo.color.includes('red') ? 'bg-red-900/80 text-red-100' : 
                          deadlineInfo.color.includes('yellow') ? 'bg-yellow-900/80 text-yellow-100' : 
                          'bg-gray-700/80 text-gray-300'
                        }`}>
                          {deadlineInfo.text}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-white truncate max-w-[70%]">{competition.name}</h3>
                        <span className="text-blue-400 text-sm font-medium">{competition.prizePool}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-400 mt-2">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {competition.date.split(' - ')[0]}
                      </div>

                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-400">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {competition.teamSize}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewDetails(competition)}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors flex items-center"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleApplyToCompetition(competition)}
                            className={`text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              competition.deadline && new Date(competition.deadline) < new Date() 
                                ? 'bg-gray-600 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                            disabled={competition.deadline && new Date(competition.deadline) < new Date()}
                          >
                            {competition.deadline && new Date(competition.deadline) < new Date() ? 'Closed' : 'Apply'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'myApplications' && <MyApplicationsTab />}

      {isDetailsModalOpen && currentCompetition && <DetailsModal />}
      {isApplicationModalOpen && currentCompetition && <ApplicationModal />}
      {isResultModalOpen && selectedApplication && (
        <ApplicationResultModal
          application={selectedApplication}
          onClose={() => setIsResultModalOpen(false)}
          onSave={(result, analysis) => {
            updateCompetitionResult(selectedApplication._id, result, analysis);
          }}
        />
      )}
    </div>
  );
};

export default Competitions;