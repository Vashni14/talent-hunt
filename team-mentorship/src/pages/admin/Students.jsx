import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaEye, FaFilter, FaPlus, FaComments, FaUsers, FaTrophy } from 'react-icons/fa';
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaUserPlus, 
  FaTimes, 
  FaEnvelope, 
  FaLinkedin, 
  FaGithub, 
  FaGlobe, 
  FaCertificate, 
  FaCode,
  FaUserTie,
  FaMedal 
} from "react-icons/fa";
import axios from 'axios';

const ProfileModal = ({ profile, onClose }) => {
  // Ensure links are properly formatted
  const formatLink = (url) => {
    if (!url) return null;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };
  const linkedinUrl = profile?.linkedin ? formatLink(Array.isArray(profile.linkedin) ? profile.linkedin[0] : profile.linkedin) : null;
  const githubUrl = profile?.github ? formatLink(Array.isArray(profile.github) ? profile.github[0] : profile.github) : null;
  const portfolioUrl = profile?.portfolio ? formatLink(Array.isArray(profile.portfolio) ? profile.portfolio[0] : profile.portfolio) : null;

  // Skill level to color mapping
  const getSkillLevelColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'beginner': return 'bg-blue-500/10 text-blue-400';
      case 'intermediate': return 'bg-purple-500/10 text-purple-400';
      case 'advanced': return 'bg-green-500/10 text-green-400';
      case 'expert': return 'bg-yellow-500/10 text-yellow-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <AnimatePresence>
      {profile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl border border-gray-700 shadow-xl overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                <div className="flex gap-2 items-center">
                  {profile.domain && (
                    <span className="text-blue-400">{profile.domain}</span>
                  )}
                  {profile.rolePreference && (
                    <span className="text-gray-400 text-sm flex items-center gap-1">
                      <FaUserTie className="text-xs" /> {profile.rolePreference}
                    </span>
                  )}
                </div>
              </div>
              <button  
                onClick={onClose}
                className="text-gray-400 hover:text-white p-1"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Left Column - Profile Info */}
              <div className="md:col-span-1">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500/50 mb-4">
                    <img
                      src={profile?.profilePicture ? `http://localhost:5000${profile.profilePicture}` : "/default-profile.png"}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://ui-avatars.com/api/?name=User&background=random";
                      }}
                    />
                  </div>
                  <div className="text-center mb-6">
                    <p className="text-sm text-gray-400 mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      profile.isPublic  
                        ? "bg-green-500/20 text-green-400"  
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {profile.isPublic ? "Public" : "Private"}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" /> Contact
                  </h3>
                  <p className="text-sm text-gray-300">{profile.contact || "Not provided"}</p>
                </div>

                {/* Social Links */}
                <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium text-white mb-2">Social Links</h3>
                  {linkedinUrl && (
                    <div className="flex items-center gap-2 text-sm text-gray-300 hover:text-blue-400 transition-colors">
                      <FaLinkedin className="text-blue-400" />
                      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="truncate">
                        LinkedIn
                      </a>
                    </div>
                  )}
                  {githubUrl && (
                    <div className="flex items-center gap-2 text-sm text-gray-300 hover:text-blue-400 transition-colors">
                      <FaGithub />
                      <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="truncate">
                        GitHub
                      </a>
                    </div>
                  )}
                  {portfolioUrl && (
                    <div className="flex items-center gap-2 text-sm text-gray-300 hover:text-blue-400 transition-colors">
                      <FaGlobe className="text-green-400" />
                      <a href={portfolioUrl} target="_blank" rel="noopener noreferrer" className="truncate">
                        Portfolio
                      </a>
                    </div>
                  )}
                  {!linkedinUrl && !githubUrl && !portfolioUrl && (
                    <p className="text-gray-400 text-sm">No social links provided</p>
                  )}
                </div>
              </div>

              {/* Right Column - Detailed Info */}
              <div className="md:col-span-2 space-y-6">
                {/* About Section */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-gray-700">
                    About
                  </h3>
                  <p className="text-gray-300">
                    {profile.bio || "This user hasn't added a bio yet."}
                  </p>
                </div>

                {/* Skills Section - Updated to show levels */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-gray-700">
                    Skills ({profile.skills?.length || 0})
                  </h3>
                  {profile.skills?.length > 0 ? (
                    <div className="space-y-3">
                      {profile.skills.map((skill, idx) => {
                        const skillName = typeof skill === 'object' ? skill.name : skill;
                        const skillLevel = typeof skill === 'object' ? skill.level : 'Intermediate';
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-300">{skillName}</span>
                              <span className="text-xs text-gray-400 capitalize">{skillLevel}</span>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-1.5">
                              <div  
                                className={`h-1.5 rounded-full ${
                                  skillLevel?.toLowerCase() === 'beginner' ? 'bg-blue-500 w-1/4' :
                                  skillLevel?.toLowerCase() === 'intermediate' ? 'bg-purple-500 w-1/2' :
                                  skillLevel?.toLowerCase() === 'advanced' ? 'bg-green-500 w-3/4' :
                                  'bg-yellow-500 w-full'
                                }`}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-400">No skills listed</p>
                  )}
                </div>

                {/* Projects Section - Fixed */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-gray-700">
                    Projects ({profile.projects?.length || 0})
                  </h3>
                  {profile.projects?.length > 0 ? (
                    <ul className="space-y-2">
                      {profile.projects.map((project, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                       <FaCode className="text-blue-400 mt-1 flex-shrink-0" />
                          <span className="text-gray-300">{project}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400">No projects listed</p>
                  )}
                </div>

                {/* Competitions Section */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-gray-700">
                    Competition Experience ({profile.experience?.length || 0})
                  </h3>
                  {profile.experience?.length > 0 ? (
                    <ul className="space-y-2">
                      {profile.experience.map((competition, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <FaMedal className="text-yellow-400 mt-1 flex-shrink-0" />
                          <span className="text-gray-300">{competition.competition}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400">No competition experience listed</p>
                  )}
                </div>

                {/* Certifications Section - Fixed */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-gray-700">
                    Certifications ({profile.certifications?.length || 0})
                  </h3>
                  {profile.certifications?.length > 0 ? (
                    <ul className="space-y-2">
                      {profile.certifications.map((certification, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                           <FaCertificate className="text-green-400 mt-1 flex-shrink-0" />
                          <span className="text-gray-300">{certification}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400">No certification listed</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer with Action Buttons */}
            <div className="mt-8 pt-5 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  console.log('Initiate chat with:', profile._id);
                  onClose();
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center"
              >
                <FaComments className="mr-2" /> Start Chat
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const CompetitionParticipationModal = ({ onClose }) => {
    // Static data for demonstration
    const competitionStats = {
      totalParticipations: 8,
      wins: 3,
      top3: 5,
      successRatio: '62.5%'
    };
  
    const competitions = [
      {
        name: "Hackathon 2023",
        date: "2023-05-15",
        result: "1st Place",
        team: "Tech Innovators"
      },
      {
        name: "AI Challenge 2022",
        date: "2022-11-20",
        result: "3rd Place",
        team: "Data Wizards"
      },
      {
        name: "Code Wars 2022",
        date: "2022-08-10",
        result: "Finalist",
        team: "Byte Force"
      }
    ];
  
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-3xl border border-gray-700 shadow-xl overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-white">My Competition Participation</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
                <FaTimes className="text-xl" />
              </button>
            </div>
  
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <p className="text-sm text-gray-400">Total Participations</p>
                <p className="text-2xl font-bold text-white">{competitionStats.totalParticipations}</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <p className="text-sm text-gray-400">Wins</p>
                <p className="text-2xl font-bold text-green-400">{competitionStats.wins}</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <p className="text-sm text-gray-400">Top 3 Finishes</p>
                <p className="text-2xl font-bold text-yellow-400">{competitionStats.top3}</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <p className="text-sm text-gray-400">Success Ratio</p>
                <p className="text-2xl font-bold text-blue-400">{competitionStats.successRatio}</p>
              </div>
            </div>
  
            {/* Competitions List */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-gray-700">
                Recent Competitions
              </h3>
              <div className="space-y-3">
                {competitions.map((comp, index) => (
                  <div key={index} className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-medium">{comp.name}</h4>
                        <p className="text-gray-400 text-sm">{comp.date}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        comp.result.includes('1st') ? 'bg-yellow-500/20 text-yellow-400' :
                        comp.result.includes('3rd') ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {comp.result}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mt-2">Team: {comp.team}</p>
                  </div>
                ))}
              </div>
            </div>
  
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };
  
  const MyTeamsModal = ({ onClose }) => {
    // Static data for demonstration
    const teams = [
      {
        name: "Tech Innovators",
        competition: "Hackathon 2023",
        members: [
          { name: "John Doe", role: "Frontend Dev" },
          { name: "Jane Smith", role: "Backend Dev" },
          { name: "You", role: "Team Lead" }
        ],
        mentor: "Dr. Sarah Johnson"
      },
      {
        name: "Data Wizards",
        competition: "AI Challenge 2022",
        members: [
          { name: "Mike Chen", role: "Data Scientist" },
          { name: "You", role: "ML Engineer" }
        ],
        mentor: "Prof. Robert Brown"
      }
    ];
  
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-3xl border border-gray-700 shadow-xl overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-white">My Teams</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
                <FaTimes className="text-xl" />
              </button>
            </div>
  
            <div className="space-y-4">
              {teams.map((team, index) => (
                <div key={index} className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                      <p className="text-gray-400 text-sm">{team.competition}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Mentor</p>
                      <p className="text-blue-400">{team.mentor}</p>
                    </div>
                  </div>
  
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Team Members</h4>
                    <div className="space-y-2">
                      {team.members.map((member, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center mr-2">
                              <FaUserTie className="text-xs text-gray-300" />
                            </div>
                            <span className={`${member.name === 'You' ? 'text-yellow-400' : 'text-gray-300'}`}>
                              {member.name}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">{member.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
  
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };
  
  const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDomain, setFilterDomain] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCompetitionsModalOpen, setIsCompetitionsModalOpen] = useState(false);
    const [isTeamsModalOpen, setIsTeamsModalOpen] = useState(false);
    const studentsPerPage = 10;

  // Fetch all students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/student/profile');
      
      if (response.status === 200) {
        if (Array.isArray(response.data)) {
          setStudents(response.data);
        } else {
          throw new Error('Unexpected data format from server');
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch students');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Search students by username
  const searchStudents = async (username) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/api/student/profile/username/${username}`);
      
      if (response.data?.success) {
        if (response.data.data) {
          // If you want to show only the searched student
          // setStudents([response.data.data]);
          
          // Or filter existing students to include matches
          const filtered = students.filter(student => 
            student.name.toLowerCase().includes(username.toLowerCase())
          );
          setStudents(filtered.length > 0 ? filtered : [response.data.data]);
        } else {
          setStudents([]);
        }
      } else {
        throw new Error(response.data.message || 'No results found');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Get student by UID
  const fetchStudentByUid = async (uid) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/api/student/profile/${uid}`);
      
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Student not found');
      }
    } catch (err) {
      console.error('Error fetching student:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch student');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle search input changes with debounce
  useEffect(() => {
    if (searchTerm.trim() === '') {
      fetchStudents();
      return;
    }

    const timerId = setTimeout(() => {
      searchStudents(searchTerm);
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // Filter students based on search term and domain
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.uid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = filterDomain === 'all' || student.domain === filterDomain;
    return matchesSearch && matchesDomain;
  });

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  // Get unique domains for filter dropdown
  const domains = ['all', ...new Set(students.map(student => student.domain).filter(Boolean))];

  const openProfileModal = async (student) => {
    // Fetch fresh data when opening modal
    const freshData = await fetchStudentByUid(student.uid);
    setSelectedStudent(freshData || student);
    setIsModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const refreshData = () => {
    setSearchTerm('');
    setFilterDomain('all');
    setCurrentPage(1);
    fetchStudents();
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900/20 text-red-400 p-4 rounded-lg mb-4">
          Error: {error}
          <button 
            onClick={refreshData}
            className="ml-4 text-white bg-red-600 px-3 py-1 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white">Student Management</h2>
        <div className="flex gap-4">
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-white"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or ID..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              value={filterDomain}
              onChange={(e) => setFilterDomain(e.target.value)}
            >
              {domains.map(domain => (
                <option key={domain} value={domain}>
                  {domain === 'all' ? 'All Domains' : domain}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-750">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Profile</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-24">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Domain</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {currentStudents.length > 0 ? (
                currentStudents.map(student => (
                  <tr key={student._id} className="hover:bg-gray-750/50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={student?.profilePicture ? `http://localhost:5000${student.profilePicture}` : "/default-profile.png"}
                            alt={student.name}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-300 w-24 truncate">
                      {student.uid}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{student.name}</div>
                      <div className="text-sm text-gray-400">{student.contact}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {student.domain || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        student.isPublic ? 'bg-green-900 text-green-200' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {student.isPublic ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openProfileModal(student)}
                          className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-900/20"
                          title="View Profile"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => setIsCompetitionsModalOpen(true)}
                          className="text-yellow-400 hover:text-yellow-300 p-2 rounded-lg hover:bg-yellow-900/20"
                          title="View Competitions"
                        >
                          <FaTrophy />
                        </button>
                        <button
                          onClick={() => setIsTeamsModalOpen(true)}
                          className="text-green-400 hover:text-green-300 p-2 rounded-lg hover:bg-green-900/20"
                          title="View Teams"
                        >
                          <FaUsers />
                        </button>
                        <button
                          onClick={() => console.log('Initiate chat with:', student._id)}
                          className="text-purple-400 hover:text-purple-300 p-2 rounded-lg hover:bg-purple-900/20"
                          title="Chat"
                        >
                          <FaComments />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                    No students found matching your criteria
                    <button 
                      onClick={refreshData}
                      className="ml-4 text-blue-400 hover:text-blue-300"
                    >
                      Reset filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredStudents.length > studentsPerPage && (
          <div className="px-6 py-4 bg-gray-750 flex items-center justify-between border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Showing <span className="font-medium">{indexOfFirstStudent + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(indexOfLastStudent, filteredStudents.length)}
              </span>{' '}
              of <span className="font-medium">{filteredStudents.length}</span> students
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <ProfileModal 
        profile={selectedStudent} 
        onClose={closeProfileModal} 
      />

      {/* Competitions Modal */}
      {isCompetitionsModalOpen && (
        <CompetitionParticipationModal 
          onClose={() => setIsCompetitionsModalOpen(false)} 
        />
      )}

      {/* Teams Modal */}
      {isTeamsModalOpen && (
        <MyTeamsModal 
          onClose={() => setIsTeamsModalOpen(false)} 
        />
      )}
    </div>
  );
};
export default Students;