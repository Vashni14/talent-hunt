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
  FaTrophy,
  FaSearch,
  FaFilter,
  FaEye
} from "react-icons/fa";
import axios from 'axios';

const MentorProfileModal = ({ mentor, onClose }) => {
  // Format LinkedIn URL
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
                  src={mentor?.profilePicture ? `http://localhost:5000${mentor.profilePicture}` : "/default-profile.png"}
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

                {/* Contact Info */}
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

                {/* About Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <FaUserTie className="w-5 h-5 mr-2 text-blue-400" />
                    About
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {mentor.bio || "No bio provided"}
                  </p>
                </div>
                
                {/* Expertise Section */}
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

                {/* Education Section */}
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

                {/* Experience Section */}
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
              <button
                onClick={() => {
                  console.log('Request mentorship from:', mentor._id);
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Request Mentorship
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
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
  const mentorsPerPage = 10;

  // Fetch all mentors
  const fetchMentors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/mentor/mentors');
      
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

  // Filter mentors based on search term and domain
  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         mentor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = filterDomain === 'all' || mentor.domain === filterDomain;
    return matchesSearch && matchesDomain;
  });

  // Pagination logic
  const indexOfLastMentor = currentPage * mentorsPerPage;
  const indexOfFirstMentor = indexOfLastMentor - mentorsPerPage;
  const currentMentors = filteredMentors.slice(indexOfFirstMentor, indexOfLastMentor);
  const totalPages = Math.ceil(filteredMentors.length / mentorsPerPage);

  // Get unique domains for filter dropdown
  const domains = ['all', ...new Set(mentors.map(mentor => mentor.domain).filter(Boolean))];

  const openMentorModal = (mentor) => {
    setSelectedMentor(mentor);
    setIsModalOpen(true);
  };

  const closeMentorModal = () => {
    setIsModalOpen(false);
    setSelectedMentor(null);
  };

  const refreshData = () => {
    setSearchTerm('');
    setFilterDomain('all');
    setCurrentPage(1);
    fetchMentors();
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

      {/* Search and Filter Bar */}
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

      {/* Mentors Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-750">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Profile</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Domain</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Experience</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {currentMentors.length > 0 ? (
                currentMentors.map(mentor => (
                  <tr key={mentor._id} className="hover:bg-gray-750/50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={mentor?.profilePicture ? `http://localhost:5000${mentor.profilePicture}` : "/default-profile.png"}
                            alt={mentor.name}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{mentor.name}</div>
                      <div className="text-sm text-gray-400">{mentor.email}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {mentor.domain || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {mentor.experience || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openMentorModal(mentor)}
                          className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-900/20"
                          title="View Profile"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => console.log('View mentees for:', mentor._id)}
                          className="text-green-400 hover:text-green-300 p-2 rounded-lg hover:bg-green-900/20"
                          title="View Mentees"
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

        {/* Pagination */}
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

      {/* Mentor Profile Modal */}
      {isModalOpen && (
        <MentorProfileModal 
          mentor={selectedMentor} 
          onClose={closeMentorModal} 
        />
      )}
    </div>
  );
};

export default Mentors;