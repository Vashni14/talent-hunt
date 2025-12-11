import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaEye, FaFilter, FaPlus, FaComments, FaUsers, FaTrophy,FaTrash } from 'react-icons/fa';
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
                  {profile.department && (
                    <span className="text-blue-400">{profile.department}</span>
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
                      src={profile?.profilePicture ? `https://talent-hunt-2.onrender.com${profile.profilePicture}` : "/default-profile.png"}
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


const CompetitionParticipationModal = ({ userId, onClose }) => {
  const [stats, setStats] = useState({
    totalParticipations: 0,
    wins: 0,
    top3: 0,
    successRatio: '0%'
  });
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch competition participation data
  const fetchParticipationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First find the student document using Firebase UID
      const studentResponse = await axios.get(`https://talent-hunt-2.onrender.com/api/student/profile/${userId}`);
      if (!studentResponse.data) {
        throw new Error('User not found');
      }

      // Get all applications for this student
      const applicationsResponse = await axios.get(`https://talent-hunt-2.onrender.com/api/compapp/me/${userId}`);
      const applications = applicationsResponse.data;

      // Calculate statistics
      const totalParticipations = applications.length;
      const wins = applications.filter(app => app.result === 'winner').length;
      const top3 = applications.filter(app => 
        app.result === 'winner' || 
        app.result === 'runner-up' || 
        app.result === '3rd Place'
      ).length;
      const successRatio = totalParticipations > 0 
        ? `${Math.round((top3 / totalParticipations) * 100)}%` 
        : '0%';

      setStats({
        totalParticipations,
        wins,
        top3,
        successRatio
      });

      // Prepare competitions list
      const formattedCompetitions = applications
        .filter(app => app.result) // Only include competitions with results
        .map(app => ({
          id: app._id,
          name: app.competition.name,
          date: app.competition.date,
          result: app.result,
          team: app.team?.name || 'Individual',
          status: app.status,
          competitionId: app.competition._id,
          teamId: app.team?._id
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending

      setCompetitions(formattedCompetitions);
    } catch (err) {
      console.error('Error fetching participation data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch competition data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchParticipationData();
    }
  }, [userId]);

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
                onClick={fetchParticipationData}
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
            <h2 className="text-xl font-bold text-white">My Competition Participation</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <p className="text-sm text-gray-400">Total Participations</p>
              <p className="text-2xl font-bold text-white">{stats.totalParticipations}</p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <p className="text-sm text-gray-400">Wins</p>
              <p className="text-2xl font-bold text-green-400">{stats.wins}</p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <p className="text-sm text-gray-400">Top 3 Finishes</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.top3}</p>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <p className="text-sm text-gray-400">Success Ratio</p>
              <p className="text-2xl font-bold text-blue-400">{stats.successRatio}</p>
            </div>
          </div>

          {/* Competitions List */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 pb-2 border-b border-gray-700">
              {competitions.length > 0 ? 'Recent Competitions' : 'No Competition History'}
            </h3>
            {competitions.length > 0 ? (
              <div className="space-y-3">
                {competitions.map((comp) => (
                  <div key={comp.id} className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-medium">{comp.name}</h4>
                        <p className="text-gray-400 text-sm">
                          {comp.date ? new Date(comp.date).toLocaleDateString() : 'Date not available'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        comp.result.includes('1st') || comp.result.includes('Winner') ? 'bg-yellow-500/20 text-yellow-400' :
                        comp.result.includes('3rd') ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {comp.result}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-gray-300 text-sm">Team: {comp.team}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        comp.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                        comp.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {comp.status}
                      </span>
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
                <p className="text-gray-400">You haven't participated in any competitions yet.</p>
              </div>
            )}
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


const MyTeamsModal = ({ userId, onClose }) => {
  const [teams, setTeams] = useState([]);
  const [mentorDetails, setMentorDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch mentor details
  const fetchMentorDetails = async (mentorId) => {
    try {
      // Check if we already have this mentor's details
      if (mentorDetails[mentorId]) return;

      const response = await axios.get(`https://talent-hunt-2.onrender.com/api/mentor/profile/id/${mentorId}`);
      if (response.data) {
        setMentorDetails(prev => ({
          ...prev,
          [mentorId]: response.data
        }));
      }
    } catch (err) {
      console.error(`Error fetching mentor ${mentorId}:`, err);
      // Store minimal mentor info if fetch fails
      setMentorDetails(prev => ({
        ...prev,
        [mentorId]: {
          _id: mentorId,
          name: "Unknown Mentor",
          profilePicture: ""
        }
      }));
    }
  };

  // Fetch teams data from backend
  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const response = await axios.get(`https://talent-hunt-2.onrender.com/api/teams/by-user/${userId}`);

      if (!response.data) {
        throw new Error('No data received from server');
      }
      if (response.data.success) {
        const teamsData = response.data.data;
        setTeams(teamsData);

        // Fetch mentor details for all mentors in all teams
        const mentorIds = [];
        teamsData.forEach(team => {
          if (team.mentors && team.mentors.length > 0) {
            team.mentors.forEach(mentorId => {
              if (typeof mentorId === 'string' && !mentorDetails[mentorId]) {
                mentorIds.push(mentorId);
              }
            });
          }
        });

        // Fetch all mentor details in parallel
        await Promise.all(mentorIds.map(fetchMentorDetails));
      } else {
        throw new Error(response.data.message || 'Failed to fetch teams');
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTeams();
    }
  }, [userId]);

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
                onClick={fetchTeams}
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
            <h2 className="text-xl font-bold text-white">My Teams</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
              <FaTimes className="text-xl" />
            </button>
          </div>

          {teams.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <FaUsers className="inline-block text-4xl" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No Teams Found</h3>
              <p className="text-gray-400">You're not currently part of any teams.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teams.map((team) => (
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
                      {team.createdBy && typeof team.createdBy === 'object' && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <img
                              className="w-6 h-6 rounded-full mr-2"
                              src={team.createdBy?.profilePicture ? `https://talent-hunt-2.onrender.com${team.createdBy.profilePicture}` : "/default-profile.png"}
                              alt={team.createdBy.name}
                            />
                            <span className="text-yellow-400">
                              {team.createdBy.name} (Creator)
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {team.createdBy.rolePreference || 'Team Lead'}
                          </span>
                        </div>
                      )}
                      
                      {team.members?.map((member, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <img
                              className="w-6 h-6 rounded-full mr-2"
                              src={member.user?.profilePicture ? `https://talent-hunt-2.onrender.com${member.user.profilePicture}` : "/default-profile.png"}
                              alt={member.user?.name || member.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/default-profile.png';
                              }}
                            />
                            <span className="text-gray-300">
                              {member.user?.name || member.name}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {member.role || 'Member'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {team.mentors?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Mentors</h4>
                      <div className="space-y-2">
                        {team.mentors.map((mentorId, idx) => {
                          const mentor = mentorDetails[mentorId] || {
                            _id: mentorId,
                            name: "Loading...",
                            profilePicture: ""
                          };

                          return (
                            <div key={idx} className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center mr-2 overflow-hidden">
                                {mentor.profilePicture ? (
                                  <img
                                  src={mentor?.profilePicture ? `https://talent-hunt-2.onrender.com${mentor.profilePicture}` : "/default-profile.png"}
                                    alt={mentor.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '/default-profile.png';
                                    }}
                                  />
                                ) : (
                                  <FaUserTie className="text-xs text-blue-400" />
                                )}
                              </div>
                              <span className="text-blue-400">
                                {mentor.name}
                                {mentor.currentPosition && (
                                  <span className="text-gray-400 text-xs ml-2">
                                    ({mentor.currentPosition})
                                  </span>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
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
  
  const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterdepartment, setFilterdepartment] = useState('all');
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
      const response = await axios.get('https://talent-hunt-2.onrender.com/api/student/profile');
      
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
  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(`https://talent-hunt-2.onrender.com/api/student/${studentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // If using JWT
        },
      });
      
      if (response.data.success) {
        setStudents(prevStudents => prevStudents.filter(student => student._id !== studentId));
        // You could use a toast notification here instead of alert
        alert('Student deleted successfully');
      } else {
        throw new Error(response.data.message || 'Failed to delete student');
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      alert(err.response?.data?.message || err.message || 'Failed to delete student');
    } finally {
      setLoading(false);
    }
  };

  // Search students by username
  const searchStudents = async (username) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`https://talent-hunt-2.onrender.com/api/student/profile/username/${username}`);
      
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
      const response = await axios.get(`https://talent-hunt-2.onrender.com/api/student/profile/${uid}`);
      
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

  // Filter students based on search term and department
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.uid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesdepartment = filterdepartment === 'all' || student.department === filterdepartment;
    return matchesSearch && matchesdepartment;
  });

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  // Get unique departments for filter dropdown
  const departments = ['all', ...new Set(students.map(student => student.department).filter(Boolean))];

  const openProfileModal = async (student) => {
    // Fetch fresh data when opening modal
    const freshData = await fetchStudentByUid(student.uid);
    setSelectedStudent(freshData || student);
    setIsModalOpen(true);
  };
  const openTeamsModal = async (student) => {
    setSelectedStudent(student);
    setIsTeamsModalOpen(true);  // Changed from setIsModalOpen
  };
  const openCompetitionsModal = async (student) => {
    setSelectedStudent(student);
    setIsCompetitionsModalOpen(true);  // Changed from setIsModalOpen
  };
  const closeTeamsModal = () => {
    setIsTeamsModalOpen(false);
    setSelectedStudent(null);
  };
  const closeProfileModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const refreshData = () => {
    setSearchTerm('');
    setFilterdepartment('all');
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
              value={filterdepartment}
              onChange={(e) => setFilterdepartment(e.target.value)}
            >
              {departments.map(department => (
                <option key={department} value={department}>
                  {department === 'all' ? 'All departments' : department}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      {/* Students Table */}
<div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
  <div className="overflow-x-auto">
    <table className="w-full divide-y divide-gray-700">
      <thead className="bg-gray-750">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Profile</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">department</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
          <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-gray-800 divide-y divide-gray-700">
        {currentStudents.length > 0 ? (
          currentStudents.map(student => (
            <tr key={student._id} className="hover:bg-gray-750/50 transition-colors">
              <td className="px-4 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={student?.profilePicture ? `https://talent-hunt-2.onrender.com${student.profilePicture}` : "/default-profile.png"}
                      alt={student.name}
                    />
                  </div>
                  <div className="ml-2 text-xs text-gray-400 hidden sm:block">
                    {student.uid}
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="text-sm font-medium text-white truncate max-w-[150px]">{student.name}</div>
                <div className="text-xs text-gray-400 truncate max-w-[150px]">{student.contact}</div>
              </td>
              <td className="px-4 py-4 text-sm text-gray-300 truncate max-w-[100px]">
                {student.department || 'N/A'}
              </td>
              <td className="px-4 py-4">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  student.isPublic ? 'bg-green-900 text-green-200' : 'bg-gray-700 text-gray-300'
                }`}>
                  {student.isPublic ? 'Public' : 'Private'}
                </span>
              </td>
              <td className="px-4 py-4 text-right text-sm font-medium">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => openProfileModal(student)}
                    className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-900/20"
                    title="View Profile"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => openCompetitionsModal(student)}
                    className="text-yellow-400 hover:text-yellow-300 p-2 rounded-lg hover:bg-yellow-900/20"
                    title="View Competitions"
                  >
                    <FaTrophy />
                  </button>
                  <button
                    onClick={() => openTeamsModal(student)}
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
                  <button
                    onClick={() => handleDeleteStudent(student._id)}
                    className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/20"
                    title="Delete Student"
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

  {/* Pagination - remains the same */}
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


      {isCompetitionsModalOpen && (
  <CompetitionParticipationModal 
    userId={selectedStudent?.uid} 
    onClose={() => {
      setIsCompetitionsModalOpen(false);
      setSelectedStudent(null);
    }} 
  />
)}


{isTeamsModalOpen && (
  <MyTeamsModal 
    userId={selectedStudent?.uid} 
    onClose={() => {
      setIsTeamsModalOpen(false);
      setSelectedStudent(null);
    }} 
  />
)}

{isModalOpen && selectedStudent && (
  <ProfileModal 
    profile={selectedStudent} 
    onClose={() => {
      setIsModalOpen(false);
      setSelectedStudent(null);
    }}
  />
)}
    </div>
  );
};
export default Students;