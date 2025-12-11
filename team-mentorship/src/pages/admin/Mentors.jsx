import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaTimes, 
  FaEnvelope, 
  FaLinkedin, 
  FaUserTie,
  FaGraduationCap,
  FaBriefcase,
  FaLightbulb,
  FaCalendarAlt,
  FaComments,
  FaUsers,
  FaTrash,
  FaTrophy,
  FaSearch,
  FaFilter,
  FaEye,
  FaMedal
} from "react-icons/fa";
import axios from 'axios';

const MentorProfileModal = ({ mentor, onClose }) => {
  const formatLinkedin = (url) => {
    if (!url) return null;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };
  const linkedinUrl = formatLinkedin(mentor?.linkedin);

  return (
    <AnimatePresence>
      {mentor && (
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
            className="bg-gray-800 rounded-xl w-full max-w-4xl border border-gray-700 overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-900 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">{mentor.name}</h2>
                <p className="text-gray-400 text-sm">{mentor.domain}</p>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[80vh]">
              <div className="h-64 w-full bg-gray-700 overflow-hidden relative">
                <img 
                  src={mentor?.profilePicture ? `https://talent-hunt-3.onrender.com${mentor.profilePicture}` : "/default-profile.png"}
                  alt={mentor.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = 'https://via.placeholder.com/500x300?text=Image+Not+Available';
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent h-20" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400">
                    Mentor
                  </span>
                  <div className="text-white bg-yellow-600 px-3 py-1 rounded-full text-sm font-medium">
                    {mentor.experience || 'N/A'} Exp
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <FaBriefcase className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Current Role</p>
                        <p className="text-white font-medium">{mentor.currentPosition || "Not specified"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaUsers className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Students Mentored</p>
                        <p className="text-white font-medium">{mentor.studentsMentored || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <FaEnvelope className="w-5 h-5 mr-2 text-blue-400" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-gray-300">{mentor.email || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">LinkedIn</p>
                      {linkedinUrl ? (
                        <a 
                          href={linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          View Profile
                        </a>
                      ) : (
                        <p className="text-gray-400">Not provided</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <FaUserTie className="w-5 h-5 mr-2 text-blue-400" />
                    About
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {mentor.bio || "No bio provided"}
                  </p>
                </div>
                
                {mentor.skills?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <FaLightbulb className="w-5 h-5 mr-2 text-blue-400" />
                      Expertise Areas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {mentor.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {mentor.education && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <FaGraduationCap className="w-5 h-5 mr-2 text-blue-400" />
                      Education
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start">
                        <FaGraduationCap className="w-5 h-5 mt-0.5 mr-3 text-blue-400 flex-shrink-0" />
                        <div>
                          <h4 className="text-white font-medium">{mentor.education}</h4>
                          {mentor.educationInstitution && (
                            <p className="text-gray-300">{mentor.educationInstitution}</p>
                          )}
                          {mentor.educationYear && (
                            <p className="text-gray-400 text-sm">{mentor.educationYear}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {mentor.experience && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <FaBriefcase className="w-5 h-5 mr-2 text-blue-400" />
                      Experience
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-start">
                        <FaBriefcase className="w-5 h-5 mt-0.5 mr-3 text-blue-400 flex-shrink-0" />
                        <div>
                          {mentor.currentPosition && (
                            <h4 className="text-white font-medium">{mentor.currentPosition}</h4>
                          )}
                          {mentor.currentCompany && (
                            <p className="text-gray-300">{mentor.currentCompany}</p>
                          )}
                          {mentor.experienceYears && (
                            <p className="text-gray-400 text-sm">{mentor.experienceYears} years</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-900 px-6 py-4 border-t border-gray-700 flex justify-between">
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
};

const MentorCompetitionsModal = ({ mentorId, onClose }) => {
  const [competitions, setCompetitions] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const competitionsPerPage = 5;

  const fetchMentoredCompetitions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`https://talent-hunt-3.onrender.com/api/compapp/mentor/${mentorId}`);
      console.log(response)
      if (response.data?.success) {
        setCompetitions(response.data.data || []); // Ensure we set an array
      } else {
        throw new Error(response.data?.message || 'Failed to fetch competitions');
      }
    } catch (err) {
      console.error('Error fetching mentored competitions:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch competitions');
      setCompetitions([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mentorId) {
      fetchMentoredCompetitions();
    }
  }, [mentorId]);

  // Safe filtering with optional chaining
  const filteredCompetitions = competitions?.filter?.(comp => {
    const matchesSearch = comp.competition.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) || 
                         comp.competition.description?.toLowerCase()?.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || comp.competition.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || []; // Fallback to empty array

  // Safe pagination
  const indexOfLastCompetition = currentPage * competitionsPerPage;
  const indexOfFirstCompetition = indexOfLastCompetition - competitionsPerPage;
  const currentCompetitions = filteredCompetitions.slice(indexOfFirstCompetition, indexOfLastCompetition);
  const totalPages = Math.ceil(filteredCompetitions.length / competitionsPerPage);

  // Rest of your component...
  const statuses = ['all', ...new Set(competitions.map(comp => comp.competition.status).filter(Boolean))];

  if (loading) {
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
            className="bg-gray-800 rounded-xl p-6 w-full max-w-3xl border border-gray-700 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (error) {
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
            className="bg-gray-800 rounded-xl p-6 w-full max-w-3xl border border-gray-700 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-red-400 p-4 rounded-lg bg-red-900/20 mb-4">
              Error: {error}
              <button 
                onClick={fetchMentoredCompetitions}
                className="ml-4 text-white bg-red-600 px-3 py-1 rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
            <div className="flex justify-end">
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
  }

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
            <h2 className="text-xl font-bold text-white">Mentored Competitions</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
              <FaTimes className="text-xl" />
            </button>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search competitions..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-400" />
                <select
                  className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <p className="text-sm text-gray-400">Total Competitions</p>
              <p className="text-2xl font-bold text-white">{competitions.length}</p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <p className="text-sm text-gray-400">Active</p>
              <p className="text-2xl font-bold text-green-400">
                {competitions.filter(c => c.competition.status === 'active').length}
              </p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <p className="text-sm text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-blue-400">
                {competitions.filter(c => c.application.status === 'accepted').length}
              </p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <p className="text-sm text-gray-400">Upcoming</p>
              <p className="text-2xl font-bold text-yellow-400">
                {competitions.filter(c => c.competition.status === 'upcoming').length}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-gray-700">
              {currentCompetitions.length > 0 ? 'Competitions' : 'No Competitions Found'}
            </h3>
            {currentCompetitions.length > 0 ? (
              <div className="space-y-3">
                {currentCompetitions.map((comp) => (
                  <div key={comp._id} className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-medium">{comp.competition.name}</h4>
                        <p className="text-gray-400 text-sm">
                          {comp.competition.description && comp.competition.description.length > 100 
                            ? `${comp.competition.description.substring(0, 100)}...` 
                            : comp.competition.description}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        comp.competition.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        comp.competition.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {comp.competition.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center text-gray-400 text-sm">
                        <FaCalendarAlt className="mr-1" />
                        {comp.competition.date} 
                      </div>
                      <div className="text-sm text-gray-300">
                        Result: {comp.application.result || 0}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <FaTrophy className="inline-block text-4xl" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No Competition History</h3>
                <p className="text-gray-400">This mentor hasn't participated in any competitions yet.</p>
              </div>
            )}
          </div>

          {filteredCompetitions.length > competitionsPerPage && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Showing <span className="font-medium">{indexOfFirstCompetition + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastCompetition, filteredCompetitions.length)}
                </span>{' '}
                of <span className="font-medium">{filteredCompetitions.length}</span> competitions
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

const MentorTeamsModal = ({ mentorId, onClose }) => {
  const [teams, setTeams] = useState([]);
  const [studentDetails, setStudentDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const teamsPerPage = 5;

  const fetchStudentDetails = async (studentId) => {
    try {
      if (studentDetails[studentId]) return;

      const response = await axios.get(`https://talent-hunt-3.onrender.com/api/student/profile/id/${studentId}`);
      if (response.data) {
        setStudentDetails(prev => ({
          ...prev,
          [studentId]: response.data
        }));
      }
    } catch (err) {
      console.error(`Error fetching student ${studentId}:`, err);
      setStudentDetails(prev => ({
        ...prev,
        [studentId]: {
          _id: studentId,
          name: "Unknown Student",
          profilePicture: ""
        }
      }));
    }
  };

  const fetchMentoredTeams = async () => {
    try {
      setLoading(true);
      setError(null);
  
      // 1. Fetch teams data
      const { data } = await axios.get(`https://talent-hunt-3.onrender.com/api/teams/mentor/${mentorId}`);
      if (!data.success) throw new Error(data.message || 'Failed to fetch teams');
  
      // 2. Process teams and collect creator UIDs
      const teamsWithCreators = [];
      const creatorUids = new Set();
  
      data.teams.forEach(team => {
        // Store the team with temporary creator reference
        teamsWithCreators.push({
          ...team,
          _creatorUid: team.createdBy // Store original UID for reference
        });
  
        // Collect unique creator UIDs
        if (team.createdBy && typeof team.createdBy === 'string') {
          creatorUids.add(team.createdBy);
        }
      });
  
      // 3. Fetch all creator profiles in parallel
      const creatorProfiles = await Promise.all(
        Array.from(creatorUids).map(async uid => {
          try {
            const response = await axios.get(`https://talent-hunt-3.onrender.com/api/student/profile/uid/${uid}`);
            return response.data.success ? { uid, ...response.data } : null;
          } catch (error) {
            console.error(`Failed to fetch creator ${uid}:`, error);
            return null;
          }
        })
      );
  
      // 4. Create a mapping of UID to creator profile
      const creatorMap = creatorProfiles.reduce((map, creator) => {
        if (creator) map[creator.uid] = creator;
        return map;
      }, {});
  
      // 5. Properly enrich teams with creator data
      const enrichedTeams = teamsWithCreators.map(team => {
        const creator = team._creatorUid ? creatorMap[team._creatorUid] : null;
        
        // Remove temporary field and add creator data
        const { _creatorUid, ...teamData } = team;
        
        return {
          ...teamData,
          createdBy: creator ? {
            _id: creator._id,
            uid: creator.uid,
            name: creator.name,
            profilePicture: creator.profilePicture,
            rolePreference: creator.rolePreference,
            skills: creator.skills || []
          } : null
        };
      });
  
      setTeams(enrichedTeams);
      console.log('Final enriched teams:', enrichedTeams);
  
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mentorId) {
      fetchMentoredTeams();
    }
  }, [mentorId]);

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         team.project?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || team.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastTeam = currentPage * teamsPerPage;
  const indexOfFirstTeam = indexOfLastTeam - teamsPerPage;
  const currentTeams = filteredTeams.slice(indexOfFirstTeam, indexOfLastTeam);
  const totalPages = Math.ceil(filteredTeams.length / teamsPerPage);

  const statuses = ['all', ...new Set(teams.map(team => team.status).filter(Boolean))];

  if (loading) {
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
            className="bg-gray-800 rounded-xl p-6 w-full max-w-3xl border border-gray-700 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (error) {
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
            className="bg-gray-800 rounded-xl p-6 w-full max-w-3xl border border-gray-700 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-red-400 p-4 rounded-lg bg-red-900/20 mb-4">
              Error: {error}
              <button 
                onClick={fetchMentoredTeams}
                className="ml-4 text-white bg-red-600 px-3 py-1 rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
            <div className="flex justify-end">
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
  }

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
            <h2 className="text-xl font-bold text-white">Mentored Teams</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
              <FaTimes className="text-xl" />
            </button>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search teams..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-600 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-400" />
                <select
                  className="bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <p className="text-sm text-gray-400">Total Teams</p>
              <p className="text-2xl font-bold text-white">{teams.length}</p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <p className="text-sm text-gray-400">Active</p>
              <p className="text-2xl font-bold text-green-400">
                {teams.filter(t => t.status === 'active').length}
              </p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <p className="text-sm text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-blue-400">
                {teams.filter(t => t.status === 'completed').length}
              </p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <p className="text-sm text-gray-400">Competition Teams</p>
              <p className="text-2xl font-bold text-yellow-400">
                {teams.filter(t => t.competition).length}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-gray-700">
              {currentTeams.length > 0 ? 'Teams' : 'No Teams Found'}
            </h3>
            {currentTeams.length > 0 ? (
              <div className="space-y-4">
                {currentTeams.map((team) => (
                  <div key={team._id} className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                        <p className="text-gray-400 text-sm">
                          {team.competition || 'General Team'} • {team.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Created</p>
                        <p className="text-blue-400 text-sm">
                          {new Date(team.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {team.project && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Project</h4>
                        <p className="text-gray-300">{team.project}</p>
                      </div>
                    )}

                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Team Members</h4>
                      <div className="space-y-2">
                        {team.createdBy && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <img
                                className="w-6 h-6 rounded-full mr-2"
                                src={
                                  (typeof team.createdBy === 'object' 
                                    ? team.createdBy.profilePicture 
                                    : studentDetails[team.createdBy]?.profilePicture)
                                    ? `https://talent-hunt-3.onrender.com${typeof team.createdBy === 'object' ? team.createdBy.profilePicture : studentDetails[team.createdBy]?.profilePicture}`
                                    : "/default-profile.png"
                                }
                                alt={
                                  typeof team.createdBy === 'object' 
                                    ? team.createdBy.name 
                                    : studentDetails[team.createdBy]?.name || 'Creator'
                                }
                              />
                              <span className="text-yellow-400">
                                {typeof team.createdBy === 'object' 
                                  ? team.createdBy.name 
                                  : studentDetails[team.createdBy]?.name || 'Creator'} (Creator)
                              </span>
                            </div>
                            <span className="text-xs text-gray-400">
                              {typeof team.createdBy === 'object' 
                                ? team.createdBy.rolePreference 
                                : studentDetails[team.createdBy]?.rolePreference || 'Team Lead'}
                            </span>
                          </div>
                        )}
                        
                        {team.members?.map((member, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <img
                                className="w-6 h-6 rounded-full mr-2"
                                src={
                                  member.user?.profilePicture 
                                    ? `https://talent-hunt-3.onrender.com${member.user.profilePicture}`
                                    : studentDetails[member.user]?.profilePicture
                                      ? `https://talent-hunt-3.onrender.com${studentDetails[member.user].profilePicture}`
                                      : "/default-profile.png"
                                }
                                alt={member.user?.name || studentDetails[member.user]?.name || member.name}
                              />
                              <span className="text-gray-300">
                                {member.user?.name || studentDetails[member.user]?.name || member.name}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400">
                              {member.role || 'Member'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <FaUsers className="inline-block text-4xl" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No Teams Found</h3>
                <p className="text-gray-400">This mentor hasn't mentored any teams yet.</p>
              </div>
            )}
          </div>

          {filteredTeams.length > teamsPerPage && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Showing <span className="font-medium">{indexOfFirstTeam + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastTeam, filteredTeams.length)}
                </span>{' '}
                of <span className="font-medium">{filteredTeams.length}</span> teams
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

const Mentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDomain, setFilterDomain] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompetitionsModalOpen, setIsCompetitionsModalOpen] = useState(false);
  const [isTeamsModalOpen, setIsTeamsModalOpen] = useState(false);
  const mentorsPerPage = 10;

  const fetchMentors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('https://talent-hunt-3.onrender.com/api/mentor/mentors');
      
      if (response.status === 200) {
        if (Array.isArray(response.data)) {
          setMentors(response.data);
        } else {
          throw new Error('Unexpected data format from server');
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch mentors');
      }
    } catch (err) {
      console.error('Error fetching mentors:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch mentors');
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         mentor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = filterDomain === 'all' || mentor.domain === filterDomain;
    return matchesSearch && matchesDomain;
  });

  const indexOfLastMentor = currentPage * mentorsPerPage;
  const indexOfFirstMentor = indexOfLastMentor - mentorsPerPage;
  const currentMentors = filteredMentors.slice(indexOfFirstMentor, indexOfLastMentor);
  const totalPages = Math.ceil(filteredMentors.length / mentorsPerPage);

  const domains = ['all', ...new Set(mentors.map(mentor => mentor.domain).filter(Boolean))];

  const openMentorModal = (mentor) => {
    setSelectedMentor(mentor);
    setIsModalOpen(true);
  };

  const closeMentorModal = () => {
    setIsModalOpen(false);
    setSelectedMentor(null);
  };

  const openCompetitionsModal = (mentor) => {
    setSelectedMentor(mentor);
    setIsCompetitionsModalOpen(true);
  };

  const openTeamsModal = (mentor) => {
    setSelectedMentor(mentor);
    setIsTeamsModalOpen(true);
  };

  const refreshData = () => {
    setSearchTerm('');
    setFilterDomain('all');
    setCurrentPage(1);
    fetchMentors();
  };
  const handleDeleteMentor = async (mentorId) => {
    if (!window.confirm('Are you sure you want to delete this mentor? This action cannot be undone.')) {
      return;
    }
  
    try {
      setLoading(true);
      const response = await axios.delete(`https://talent-hunt-3.onrender.com/api/mentor/profile/${mentorId}`);
      
      if (response.data.success) {
        // Remove the deleted mentor from the local state
        setMentors(prevMentors => prevMentors.filter(mentor => mentor._id !== mentorId));
        // Show success message
        alert('Mentor deleted successfully');
      } else {
        throw new Error(response.data.message || 'Failed to delete mentor');
      }
    } catch (err) {
      console.error('Error deleting mentor:', err);
      alert(err.response?.data?.message || err.message || 'Failed to delete mentor');
    } finally {
      setLoading(false);
    }
  };

  if (loading && mentors.length === 0) {
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
        <h2 className="text-2xl font-bold text-white">Mentor Directory</h2>
        <div className="flex gap-4">
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-white"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
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

      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
  <div className="overflow-x-auto">
    <div className="min-w-[800px]"> {/* Ensures table doesn't collapse too much */}
      <table className="w-full divide-y divide-gray-700">
        <thead className="bg-gray-750">
          <tr>
            {/* Profile Column (Fixed width) */}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16">
              Profile
            </th>
            
            {/* Name Column (Flexible but with min-width) */}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[180px]">
              Name
            </th>
            
            {/* Domain Column (Medium width) */}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[120px]">
              Domain
            </th>
            
            {/* Experience Column (Limited width with truncation) */}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[100px] max-w-[150px]">
              Experience
            </th>
            
            {/* Actions Column (Fixed width) */}
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider w-40">
              Actions
            </th>
          </tr>
        </thead>
        
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {currentMentors.length > 0 ? (
            currentMentors.map(mentor => (
              <tr key={mentor._id} className="hover:bg-gray-750/50 transition-colors">
                {/* Profile Image Cell */}
                <td className="px-4 py-4 whitespace-nowrap w-16">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={mentor?.profilePicture ? `https://talent-hunt-3.onrender.com${mentor.profilePicture}` : "/default-profile.png"}
                      alt={mentor.name}
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = "/default-profile.png";
                      }}
                    />
                  </div>
                </td>
                
                {/* Name & Email Cell */}
                <td className="px-4 py-4 min-w-[180px]">
                  <div className="text-sm font-medium text-white truncate max-w-[180px]" title={mentor.name}>
                    {mentor.name}
                  </div>
                  <div className="text-sm text-gray-400 truncate max-w-[180px]" title={mentor.email}>
                    {mentor.email}
                  </div>
                </td>
                
                {/* Domain Cell */}
                <td className="px-4 py-4 whitespace-nowrap min-w-[120px]">
                  <div className="text-sm text-gray-300 truncate max-w-[120px]" title={mentor.domain}>
                    {mentor.domain || 'N/A'}
                  </div>
                </td>
                
                {/* Experience Cell (with truncation) */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div 
                    className="max-w-[150px] truncate text-sm text-gray-300" 
                    title={mentor.experience}
                  >
                    {mentor.experience ? (
                      mentor.experience.length > 20 
                        ? `${mentor.experience.substring(0, 20)}...` 
                        : mentor.experience
                    ) : 'N/A'}
                  </div>
                </td>
                
                {/* Action Buttons Cell */}
                <td className="px-4 py-4 whitespace-nowrap text-right w-40">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => openMentorModal(mentor)}
                      className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-900/20"
                      title="View Profile"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => openCompetitionsModal(mentor)}
                      className="text-yellow-400 hover:text-yellow-300 p-2 rounded-lg hover:bg-yellow-900/20"
                      title="View Competitions"
                    >
                      <FaTrophy />
                    </button>
                    <button
                      onClick={() => openTeamsModal(mentor)}
                      className="text-green-400 hover:text-green-300 p-2 rounded-lg hover:bg-green-900/20"
                      title="View Teams"
                    >
                      <FaUsers />
                    </button>
                    <button
                      onClick={() => console.log('Initiate chat with:', mentor._id)}
                      className="text-purple-400 hover:text-purple-300 p-2 rounded-lg hover:bg-purple-900/20"
                      title="Chat"
                    >
                      <FaComments />
                    </button>
                    <button
  onClick={() => handleDeleteMentor(mentor._id)}
  className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/20"
  title="Delete Mentor"
>
  <FaTrash />
</button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                No mentors found matching your criteria
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
  </div>

  {/* Pagination - remains unchanged */}
  {filteredMentors.length > mentorsPerPage && (
    <div className="px-6 py-4 bg-gray-750 flex items-center justify-between border-t border-gray-700">
      <div className="text-sm text-gray-400">
        Showing <span className="font-medium">{indexOfFirstMentor + 1}</span> to{' '}
        <span className="font-medium">
          {Math.min(indexOfLastMentor, filteredMentors.length)}
        </span>{' '}
        of <span className="font-medium">{filteredMentors.length}</span> mentors
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

      {isModalOpen && (
        <MentorProfileModal 
          mentor={selectedMentor} 
          onClose={closeMentorModal} 
        />
      )}

      {isCompetitionsModalOpen && selectedMentor && (
        <MentorCompetitionsModal 
          mentorId={selectedMentor._id} 
          onClose={() => {
            setIsCompetitionsModalOpen(false);
            setSelectedMentor(null);
          }} 
        />
      )}

      {isTeamsModalOpen && selectedMentor && (
        <MentorTeamsModal 
          mentorId={selectedMentor._id} 
          onClose={() => {
            setIsTeamsModalOpen(false);
            setSelectedMentor(null);
          }} 
        />
      )}
    </div>
  );
};

export default Mentors;