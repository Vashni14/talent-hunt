import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaUsers,
  FaEnvelope,
  FaFilter,
  FaUser,
  FaUserFriends,
  FaRegCommentDots,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
  FaSpinner,
  FaTimes
} from "react-icons/fa";
import { auth } from "/src/config/firebase";
import { useNavigate } from "react-router-dom";
import ProfileModal from "/src/components/ProfileModal"; // Adjust the path as needed

// SDG data with symbols and names
const SDG_DATA = [
  { number: 1, symbol: "🌍", name: "No Poverty" },
  { number: 2, symbol: "🍏", name: "Zero Hunger" },
  { number: 3, symbol: "💊", name: "Good Health" },
  { number: 4, symbol: "🎓", name: "Quality Education" },
  { number: 9, symbol: "🏭", name: "Industry Innovation" },
  { number: 7, symbol: "⚡", name: "Affordable Energy" },
  { number: 13, symbol: "🌡️", name: "Climate Action" }
];

const MentorStudents = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    team: "all",
    role: "all",
    status: "active"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
    const [userId, setUserId] = useState(null)
  const user = auth.currentUser;
  

  // Get SDG details by number
  const getSDGDetails = (number) => {
    return SDG_DATA.find(sdg => sdg.number === number);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);
  
  // Update the fetchMembers useEffect to depend on userId
  useEffect(() => {
    if (userId) {  // Only fetch if userId exists
      fetchMembers();
    }
  }, [userId]);  // Add userId as dependency
  
  // Update fetchMembers function to handle errors better
  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
  
      const response = await fetch(
        `http://localhost:5000/api/teams/mentor/${userId}/members`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch members");
      }
      
      // Transform data to match frontend expectations
      const transformedMembers = data.members.map(member => ({
        ...member,
        profile: {
          name: member.name,
          domain: member.domain,
          contact: member.contact,
          profilePicture: member.profilePicture,
          rolePreference: member.rolePreference,
          skills: member.skills?.map(skill => ({
            name: skill.name || skill,
            level: skill.level,
            _id: skill._id
          })) || [],
          bio: member.bio
        },
        status: member.status || 'active'
      }));
      
      setMembers(transformedMembers);
      setTeams(data.teams);
      
    } catch (err) {
      setError(err.message);
      console.error("Error fetching members:", err);
    } finally {
      setIsLoading(false);
    }
  };


  // Filter members based on search and filters
  const filteredMembers = members.filter(member => {
    // Early return if no search term and no filters
    if (!searchTerm && filters.team === "all" && filters.role === "all") {
      return true;
    }
  
    // Convert search term to lowercase once for performance
    const searchTermLower = searchTerm.toLowerCase();
  
    // Helper function to safely check string matches
    const matchesSearchTerm = (value) => {
      if (!value) return false;
      return String(value).toLowerCase().includes(searchTermLower);
    };
  
    // Check basic fields (name, role, team)
    const basicFieldMatches = 
      matchesSearchTerm(member.name) ||
      matchesSearchTerm(member.rolePreference) ||
      matchesSearchTerm(member.teamName) ||
      matchesSearchTerm(member.memberRole);
  
    // Check skills - handles both string and object formats
    const skillMatches = member.skills?.some(skill => {
      // Handle string format
      if (typeof skill === 'string') {
        return matchesSearchTerm(skill);
      }
      // Handle object format
      if (skill && typeof skill === 'object') {
        return matchesSearchTerm(skill.name) || matchesSearchTerm(skill.level);
      }
      return false;
    }) || false;
  
    // Check filters
    const matchesTeam = filters.team === "all" || 
      (member.teamName && member.teamName === filters.team);
    
    const matchesRole = filters.role === "all" || 
      [member.rolePreference, member.memberRole].some(role => 
        role && role.toLowerCase().includes(filters.role.toLowerCase()));
    
    const matchesStatus = member.status === filters.status;
  
    // Combine all conditions
    const matchesSearch = searchTerm ? (basicFieldMatches || skillMatches) : true;
    
    return matchesSearch && matchesTeam && matchesRole && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6">
        <div className="text-red-500 text-center py-10">
          Error: {error}
          <button 
            onClick={fetchMembers}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Team Members Dashboard
        </h1>
        <p className="text-gray-400 mt-2">
          View and manage all members across your {teams.length} teams
        </p>
      </header>

      {/* Search and Filter Bar */}
      <div className="mb-6 bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search members by name, role, team or skills..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Filters {showFilters ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Team Filter */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Team</label>
              <select
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.team}
                onChange={(e) => setFilters({...filters, team: e.target.value})}
              >
                <option value="all">All Teams</option>
                {teams.map(team => (
                  <option key={team._id} value={team.name}>{team.name}</option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Role</label>
              <select
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
              >
                <option value="all">All Roles</option>
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="researcher">Researcher</option>
                <option value="data">Data Scientist</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status</label>
              <select
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-400">
            No members found matching your criteria.
            <button 
              onClick={fetchMembers}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Refresh Data
            </button>
          </div>
        ) : (
          filteredMembers.map(member => (
            <div 
              key={member._id} 
              className="bg-gray-800 rounded-xl border border-gray-700 p-5 hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => setSelectedMember(member)}
            >
              <div className="flex gap-4">
                {/* Member Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500/50">
                    <img
                      src={member?.profilePicture  ?  `http://localhost:5000${member.profilePicture}`  :  "/default-profile.png"}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Member Info */}
                <div className="flex-grow">
                  <h3 className="text-lg font-bold">{member.name}</h3>
                  <p className="text-blue-400">{member.memberRole || member.rolePreference || "Team Member"}</p>
                  <p className="text-sm text-gray-400 mt-1">{member.teamName}</p>
                  
                  {/* Skills */}
                  {/* In the member card component */}
{member.skills && member.skills.length > 0 && (
  <div className="mt-2 flex flex-wrap gap-1">
    {member.skills.slice(0, 3).map(skill => (
      <span key={skill._id || skill.name} className="text-xs bg-gray-700/50 rounded-full px-2 py-1">
        {skill.name}
        {skill.level && (
          <span className="text-xs ml-1 text-gray-400">({skill.level})</span>
        )}
      </span>
    ))}
    {member.skills.length > 3 && (
      <span className="text-xs bg-gray-700/50 rounded-full px-2 py-1">
        +{member.skills.length - 3}
      </span>
    )}
  </div>
)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                <button 
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Chat functionality would go here
                    console.log(`Initiate chat with ${member.name}`);
                  }}
                >
                  <FaRegCommentDots size={12} /> Chat
                </button>
                <button 
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMember(member);
                  }}
                >
                  <FaUser size={12} /> View
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header with close button */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">{selectedMember.name}</h2>
                  <p className="text-blue-400">
                    {selectedMember.memberRole || selectedMember.rolePreference || "Team Member"} • {selectedMember.teamName}
                  </p>
                </div>
                <button 
                  className="text-gray-400 hover:text-white"
                  onClick={() => setSelectedMember(null)}
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Member Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Profile */}
                <div className="md:col-span-1 flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500/50 mb-4">
                    <img
                    src={selectedMember?.profilePicture  ?  `http://localhost:5000${selectedMember.profilePicture}`  :  "/default-profile.png"}
                      alt={selectedMember.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="text-center">
                    <p className="text-lg font-medium">{selectedMember.name}</p>
                    <p className="text-blue-400">{selectedMember.memberRole || selectedMember.rolePreference || "Team Member"}</p>
                    <p className="text-sm text-gray-400 mt-1">{selectedMember.domain}</p>
                    
                    <div className="mt-4 flex flex-col gap-2">
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium flex items-center justify-center gap-2">
                        <FaRegCommentDots /> Chat
                      </button>
                      <button 
  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium flex items-center justify-center gap-2"
  onClick={() => {
    setSelectedProfile(selectedMember);
    setShowProfileModal(true);
    setSelectedMember(null); // Close the member detail modal
  }}
>
  <FaUser /> Full Profile
</button>
                    </div>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="md:col-span-2">
                  {/* Bio */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      <FaUser /> About
                    </h3>
                    <p className="text-gray-300">{selectedMember.bio || "No bio provided"}</p>
                  </div>

                  {/* Team Info */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      <FaUserFriends /> Team Details
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-gray-700/50 rounded-full px-3 py-1">
                        {selectedMember.teamName} ({selectedMember.teamStatus})
                      </span>
                      {selectedMember.teamSDGs?.map(sdgNumber => {
                        const sdg = getSDGDetails(sdgNumber);
                        return sdg ? (
                          <span 
                            key={sdg.number} 
                            className="text-sm bg-gray-700/50 rounded-full px-2 py-0.5 flex items-center gap-1"
                            title={`SDG ${sdg.number}: ${sdg.name}`}
                          >
                            <span>{sdg.symbol}</span>
                            <span>{sdg.number}</span>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>

                  {/* Skills */}
                  {/* In the member detail modal */}
{selectedMember.skills && selectedMember.skills.length > 0 && (
  <div className="mb-6">
    <h3 className="text-lg font-bold mb-2">Skills</h3>
    <div className="flex flex-wrap gap-2">
      {selectedMember.skills.map(skill => (
        <span key={skill._id || skill.name} className="bg-blue-500/20 text-blue-400 rounded-full px-3 py-1">
          {skill.name}
          {skill.level && (
            <span className="text-xs ml-1 text-blue-300">({skill.level})</span>
          )}
        </span>
      ))}
    </div>
  </div>
)}

                  {/* Activity */}
                  <div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showProfileModal && selectedProfile && (
  <ProfileModal 
    profile={selectedProfile} 
    onClose={() => setShowProfileModal(false)} 
  />
)}
    </div>
  );
};

export default MentorStudents;