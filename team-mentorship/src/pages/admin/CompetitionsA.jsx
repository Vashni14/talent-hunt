import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CompetitionsA = () => {
  const [competitions, setCompetitions] = useState([]);
  const [filteredCompetitions, setFilteredCompetitions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [currentCompetition, setCurrentCompetition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    date: '',
    deadline: '',
    teamSize: '',
    prizePool: '',
    photo: null,
    requirements: '',
    sdgs: []
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [deadlineDate, setDeadlineDate] = useState(null);
  const [isSDGDropdownOpen, setIsSDGDropdownOpen] = useState(false);
  const sdgDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

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

  // Fetch competitions from API
  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await axios.get('https://team-match.up.railway.app/api/competitions');
        setCompetitions(response.data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        console.error('Error fetching competitions:', err);
      }
    };

    fetchCompetitions();
  }, []);

  // Apply filters whenever competitions, search term, or filters change
  useEffect(() => {
    const filtered = competitions.filter(comp => {
      const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           comp.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || comp.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || determineStatus(comp.date) === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
    setFilteredCompetitions(filtered);
  }, [competitions, searchTerm, categoryFilter, statusFilter]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sdgDropdownRef.current && !sdgDropdownRef.current.contains(event.target)) {
        setIsSDGDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get unique categories for filter dropdown
  const getUniqueCategories = () => {
    const categories = competitions.map(comp => comp.category);
    return ['All', ...new Set(categories)];
  };

  // Status options for filter dropdown
  const statusOptions = ['All', 'Active', 'Upcoming', 'Completed'];

  // Update form data when date range changes
  useEffect(() => {
    if (startDate && endDate) {
      const formattedStart = formatDateWithoutTimezone(startDate);
      const formattedEnd = formatDateWithoutTimezone(endDate);
      setFormData(prev => ({
        ...prev,
        date: `${formattedStart} - ${formattedEnd}`
      }));
    }
  }, [dateRange]);

  // Update form data when deadline changes
  useEffect(() => {
    if (deadlineDate) {
      setFormData(prev => ({
        ...prev,
        deadline: formatDateWithoutTimezone(deadlineDate)
      }));
    }
  }, [deadlineDate]);

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr;
  };

  const formatDateWithoutTimezone = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (selectedCompetition) {
      const [startStr, endStr] = selectedCompetition.date.split(' - ');
      const startDate = new Date(startStr + 'T00:00:00Z');
      const endDate = new Date(endStr + 'T00:00:00Z');
      setDateRange([startDate, endDate]);
      
      if (selectedCompetition.deadline) {
        setDeadlineDate(new Date(selectedCompetition.deadline + 'T00:00:00Z'));
      }
    } else {
      setDateRange([null, null]);
      setDeadlineDate(null);
    }
  }, [selectedCompetition]);

  const determineStatus = (dateRange) => {
    if (!dateRange) return 'Upcoming';
    
    const [startStr, endStr] = dateRange.split(' - ');
    const now = new Date();
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    if (now < startDate) return 'Upcoming';
    if (now >= startDate && now <= endDate) return 'Active';
    return 'Completed';
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

  const handleCreateCompetition = () => {
    setSelectedCompetition(null);
    setFormData({
      name: '',
      category: '',
      description: '',
      date: '',
      deadline: '',
      teamSize: '',
      prizePool: '',
      photo: null,
      requirements: '',
      sdgs: []
    });
    setDateRange([null, null]);
    setDeadlineDate(null);
    setIsModalOpen(true);
  };

  const handleEditCompetition = (competition) => {
    setSelectedCompetition(competition);
    setFormData({
      name: competition.name,
      category: competition.category,
      description: competition.description,
      date: competition.date,
      deadline: competition.deadline,
      teamSize: competition.teamSize,
      prizePool: competition.prizePool,
      photo: competition.photo,
      requirements: competition.requirements.join(', '),
      sdgs: competition.sdgs
    });
    setIsDetailsModalOpen(false);
    setIsModalOpen(true);
  };

  const handleViewDetails = (competition) => {
    setCurrentCompetition(competition);
    setIsDetailsModalOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        photo: e.target.files[0]
      });
    }
  };

  const handleSDGSelection = (sdgId) => {
    setFormData(prev => {
      if (prev.sdgs.includes(sdgId)) {
        return { ...prev, sdgs: prev.sdgs.filter(id => id !== sdgId) };
      } else {
        return { ...prev, sdgs: [...prev.sdgs, sdgId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('deadline', formData.deadline);
      formDataToSend.append('teamSize', formData.teamSize);
      formDataToSend.append('prizePool', formData.prizePool);
      
      if (formData.photo) {
        if (typeof formData.photo === 'string') {
          // Existing photo (string URL)
        } else {
          formDataToSend.append('photo', formData.photo);
        }
      }
      
      const requirementsArray = formData.requirements.split(',').map(req => req.trim());
      formDataToSend.append('requirements', JSON.stringify(requirementsArray));
      formDataToSend.append('sdgs', JSON.stringify(formData.sdgs));
  
      let response;
      if (selectedCompetition) {
        response = await axios.put(
          `https://team-match.up.railway.app/api/competitions/${selectedCompetition._id}`,
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        response = await axios.post(
          'https://team-match.up.railway.app/api/competitions',
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }
      
      if (selectedCompetition) {
        setCompetitions(competitions.map(comp => 
          comp._id === selectedCompetition._id ? response.data : comp
        ));
      } else {
        setCompetitions([...competitions, response.data]);
      }
      
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving competition:', err.response?.data || err.message);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteCompetition = async (id) => {
    try {
      await axios.delete(`https://team-match.up.railway.app/api/competitions/${id}`);
      setCompetitions(competitions.filter(comp => comp._id !== id));
      if (currentCompetition && currentCompetition._id === id) {
        setIsDetailsModalOpen(false);
      }
    } catch (err) {
      console.error('Error deleting competition:', err.response?.data || err.message);
      setError(err.response?.data?.message || err.message);
    }
  };

  const SDGDropdown = () => (
    <div className="relative" ref={sdgDropdownRef}>
      <button
        type="button"
        onClick={() => setIsSDGDropdownOpen(!isSDGDropdownOpen)}
        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-left flex justify-between items-center hover:border-gray-500 transition-colors"
      >
        <span className="truncate">
          {formData.sdgs.length > 0 
            ? formData.sdgs.sort((a, b) => a - b).map(id => id).join(', ')
            : "Select SDGs"}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform ${isSDGDropdownOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isSDGDropdownOpen && (
        <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 space-y-1">
            {allSDGs.map(sdg => (
              <div 
                key={sdg.id}
                onClick={() => handleSDGSelection(sdg.id)}
                className={`flex items-center p-2 rounded-md cursor-pointer ${formData.sdgs.includes(sdg.id) ? getSDGColor(sdg.id) + ' text-white' : 'hover:bg-gray-700'}`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-medium ${formData.sdgs.includes(sdg.id) ? 'bg-white ' + getSDGColor(sdg.id).replace('bg-', 'text-') : 'bg-gray-600 text-gray-300'}`}>
                  {sdg.id}
                </span>
                <span className="text-sm">{sdg.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {formData.sdgs.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.sdgs.sort((a, b) => a - b).map(sdgId => {
            const sdg = allSDGs.find(s => s.id === sdgId);
            return (
              <span
                key={sdgId}
                className={`px-2 py-1 ${getSDGColor(sdgId)} text-white rounded-full text-xs flex items-center`}
              >
                <span className="w-4 h-4 mr-1 flex items-center justify-center">{sdgId}</span>
                {sdg?.name}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSDGSelection(sdgId);
                  }}
                  className="ml-1 hover:text-gray-200"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );

  const DetailsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-4xl border border-gray-700 overflow-hidden shadow-xl">
        <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">{currentCompetition.name}</h2>
            <p className="text-gray-400 text-sm">{currentCompetition.category}</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleEditCompetition(currentCompetition)}
              className="text-yellow-400 hover:text-yellow-300 p-1 rounded-full hover:bg-gray-700 transition-colors"
              title="Edit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this competition?')) {
                  handleDeleteCompetition(currentCompetition._id);
                }
              }}
              className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-gray-700 transition-colors"
              title="Delete"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button 
              onClick={() => setIsDetailsModalOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[80vh]">
          <div className="h-64 w-full bg-gray-700 overflow-hidden relative">
            <img 
              src={currentCompetition?.photo ? `https://team-match.up.railway.app${currentCompetition.photo}` : "/default-profile.png"}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-400">Deadline</p>
                    <p className="text-white font-medium">{currentCompetition.deadline}</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
  
        <div className="bg-gray-900 px-6 py-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={() => setIsDetailsModalOpen(false)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Competitions</h1>
        <button
          onClick={handleCreateCompetition}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Competition
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Bar */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search competitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pl-10 text-white focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
            <div className="relative" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-left flex justify-between items-center hover:border-gray-500 transition-colors"
              >
                <span className="truncate">{categoryFilter}</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isCategoryDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2 space-y-1">
                    {getUniqueCategories().map((category, index) => (
                      <div 
                        key={index}
                        onClick={() => {
                          setCategoryFilter(category);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`p-2 rounded-md cursor-pointer ${categoryFilter === category ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
            <div className="relative" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-left flex justify-between items-center hover:border-gray-500 transition-colors"
              >
                <span className="truncate">{statusFilter}</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isStatusDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2 space-y-1">
                    {statusOptions.map((status, index) => (
                      <div 
                        key={index}
                        onClick={() => {
                          setStatusFilter(status);
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`p-2 rounded-md cursor-pointer ${statusFilter === status ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {filteredCompetitions.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
          <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-white">No competitions found</h3>
          <p className="mt-1 text-gray-400">Try adjusting your search or filters</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('All');
              setStatusFilter('All');
            }}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredCompetitions.map((competition) => (
            <div key={competition._id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
              <div className="h-40 overflow-hidden relative">
                <img 
                  src={competition?.photo ? `https://team-match.up.railway.app${competition.photo}` : "/default-profile.png"}
                  alt={competition.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent h-16" />
                <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(determineStatus(competition.date))}`}>
                  {determineStatus(competition.date)}
                </span>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-white truncate max-w-[70%]">{competition.name}</h3>
                  <span className="text-blue-400 text-sm font-medium">{competition.prizePool}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-400 mt-2">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDisplayDate(competition.deadline)}
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {competition.teamSize}
                  </div>
                  <button
                    onClick={() => handleViewDetails(competition)}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors flex items-center"
                  >
                    View Details
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {selectedCompetition ? 'Edit Competition' : 'Create New Competition'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Competition Photo {!selectedCompetition && '*'}
                </label>
                <div className="flex items-center">
                  <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg px-4 py-2 text-white transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      required={!selectedCompetition}
                    />
                    Choose File
                  </label>
                  <span className="ml-3 text-sm text-gray-300 truncate max-w-xs">
                    {formData.photo ? 
                      (typeof formData.photo === 'string' ? 
                        formData.photo.split('/').pop() : 
                        formData.photo.name) : 
                      'No file selected'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Category *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., Software Development, Hardware, etc."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Date Range *</label>
                  <DatePicker
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update) => setDateRange(update)}
                    minDate={new Date()}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                    placeholderText="Select date range"
                    required
                    dateFormat="yyyy-MM-dd"
                    utcOffset={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Deadline to Apply *</label>
                  <DatePicker
                    selected={deadlineDate}
                    onChange={(date) => setDeadlineDate(date)}
                    minDate={new Date()}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                    placeholderText="Select deadline"
                    required
                    dateFormat="yyyy-MM-dd"
                    utcOffset={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Team Size *</label>
                  <input
                    type="text"
                    value={formData.teamSize}
                    onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., 1-3, 3-5, etc."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                  <div className={`w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 ${getStatusColor(determineStatus(formData.date))}`}>
                    {determineStatus(formData.date)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Prize Pool *</label>
                  <input
                    type="text"
                    value={formData.prizePool}
                    onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., $10,000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Requirements (comma-separated) *</label>
                <input
                  type="text"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Web Development, UI/UX Design, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Aligned SDGs</label>
                <SDGDropdown />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  {selectedCompetition ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Update
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && currentCompetition && <DetailsModal />}
    </div>
  );
};

export default CompetitionsA;