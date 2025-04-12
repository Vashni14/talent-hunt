"use client"
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react"
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaChartBar,
  FaCheckCircle,
  FaInfoCircle,
  FaClock,
  FaComments,
  FaEllipsisH,
  FaPlus,
  FaUsers,
  FaVideo,
  FaBook,
  FaTimes,
  FaUserTie,
  FaThumbsUp,
  FaHourglassStart,
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaSave,
  FaSearch,
  FaSignOutAlt
} from "react-icons/fa"

export default function MyTeams() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null)
  const [activeTab, setActiveTab] = useState("created")
  const [statusFilter, setStatusFilter] = useState("all")
  const [expandedTeam, setExpandedTeam] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [teams, setTeams] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [newTeam, setNewTeam] = useState({
    name: "",
    project: "",
    description: "",
    deadline: "",
    mentor: "",
    status: "active",
    tasks: { total: 0, completed: 0 },
    members: []
  })
  const [editingTeam, setEditingTeam] = useState(null)
  const [currentTeam, setCurrentTeam] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
   const [allSDGs, setAllSDGs] = useState([]);

  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      setUserId(user.uid)
    }
  }, [user]);

  const fetchTeams = async () => {
    try {
      if (!userId) return;
      
      setIsLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:5000/api/teams/user/${userId}`);
      
      if (!response.ok) throw new Error('Failed to fetch teams');
      
      const result = await response.json();
      setTeams(result.data || []);
      
      console.log('Teams data:', result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [userId]);
    useEffect(() => {
      const fetchSDGs = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/sdgs');
          if (!response.ok) throw new Error('Failed to fetch SDGs');
          const data = await response.json();
          setAllSDGs(data);
        } catch (err) {
          console.error('Error fetching SDGs:', err);
          toast.error('Failed to load SDG data');
        }
      };
      fetchSDGs();
    }, []);

  // Separate teams into created by me and teams I'm a member of
  const createdTeams = teams.filter(team => team.createdBy === userId);
  const memberTeams = teams.filter(team => team.createdBy !== userId);

  // Filter teams based on active tab, search query and status filter
  const filteredTeams = activeTab === "created" 
    ? createdTeams.filter(team => 
        (team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.project?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (statusFilter === "all" || team.status === statusFilter))
    : memberTeams.filter(team => 
        (team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.project?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (statusFilter === "all" || team.status === statusFilter));

  const toggleExpandTeam = (teamId) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  const handleCreateTeam = async () => {
    try {
      if (!newTeam.name || !newTeam.project || !userId) {
        throw new Error('Team name, project, and user ID are required');
      }

      const requestBody = {
        name: newTeam.name.trim(),
        project: newTeam.project.trim(),
        description: newTeam.description.trim(),
        status: newTeam.status || 'active',
        tasks: {
          total: Number(newTeam.tasks.total) || 0,
          completed: Number(newTeam.tasks.completed) || 0
        },
        createdBy: userId,
        members: []
      };

      if (newTeam.deadline) {
        requestBody.deadline = new Date(newTeam.deadline).toISOString();
      }

      const response = await fetch('http://localhost:5000/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create team');
      }

      const createdTeam = await response.json();
      setTeams(prevTeams => [...prevTeams, createdTeam]);
      setNewTeam({
        name: "",
        project: "",
        description: "",
        deadline: "",
        mentor: "",
        status: "active",
        tasks: { total: 0, completed: 0 },
        members: []
      });
      setShowCreateModal(false);
      setActiveTab("created");
      toast.success("Team created successfully");
      
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to create team");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:5000/api/teams/${teamId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete team')
      }

      setTeams(teams.filter(team => team._id !== teamId))
      toast.success("Team deleted successfully");
    } catch (err) {
      setError(err.message)
      toast.error(err.message || "Failed to delete team");
    } finally {
      setIsLoading(false)
    }
  }
  const handleLeaveTeam = async (teamId) => {
    console.log('Attempting to leave team:', teamId);
    try {
      setIsLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error('Authentication required');
  
      // 1. Optimistic UI update
      setTeams(prevTeams => prevTeams.filter(t => t._id !== teamId));
  
      // 2. Make API call
      const response = await fetch(
        `http://localhost:5000/api/teams/${teamId}/members/${user.uid}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${await user.getIdToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      // 3. Handle response
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to leave team');
      }
  
      // 4. Verify with separate fetch
      await verifyRemoval(teamId, user.uid);
      toast.success("Successfully left the team");
  
    } catch (err) {
      console.error('Leave team failed:', {
        error: err,
        teamId,
        time: new Date().toISOString()
      });
      
      toast.error(err.message.includes('Server error') 
        ? 'Failed to leave team (please try again)' 
        : err.message
      );
      
      // 5. Revert by refreshing data
      await fetchTeams();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add this helper function
  const verifyRemoval = async (teamId, userId) => {
    const verifyResponse = await fetch(
      `http://localhost:5000/api/teams/${teamId}/verify-member/${userId}`
    );
    
    if (!verifyResponse.ok) {
      throw new Error('Verification failed');
    }
    
    const { isMember } = await verifyResponse.json();
    if (isMember) {
      throw new Error('Still appears to be a member');
    }
  };
  const handleUpdateTeam = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:5000/api/teams/${editingTeam._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTeam)
      })

      if (!response.ok) throw new Error('Failed to update team')

      const updatedTeam = await response.json()
      setTeams(teams.map(t => t._id === updatedTeam._id ? updatedTeam : t))
      setShowEditModal(false)
      toast.success("Team updated successfully");
    } catch (err) {
      setError(err.message)
      toast.error(err.message || "Failed to update team");
    } finally {
      setIsLoading(false)
    }
  }

  const removeMember = async (teamId, memberId) => {
    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:5000/api/teams/${teamId}/delete/${memberId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to remove member')

      const updatedTeam = await response.json()
      setTeams(teams.map(team => team._id === teamId ? updatedTeam : team))
      if (editingTeam?._id === teamId) {
        setEditingTeam(updatedTeam)
      }
      toast.success("Member removed successfully");
    } catch (err) {
      setError(err.message)
      toast.error(err.message || "Failed to remove member");
    } finally {
      setIsLoading(false)
    }
  }

  const getProgressBarColor = (team) => {
    if (team.status === "completed") return "bg-green-500"
    if (team.progress > 50) return "bg-yellow-500"
    return "bg-blue-500"
  }

  const getEmptyStateMessage = () => {
    if (searchQuery) return "No teams match your search criteria";
    
    switch (activeTab) {
      case "created":
        return statusFilter === "all" 
          ? "You haven't created any teams yet." 
          : `You don't have any ${statusFilter} teams.`;
      case "member":
        return statusFilter === "all" 
          ? "You're not a member of any teams yet." 
          : `You're not in any ${statusFilter} teams.`;
      default:
        return "No teams found.";
    }
  }

  if (isLoading && teams.length === 0) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-white">Loading teams...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Create New Team</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Team Name*</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                  placeholder="Web Wizards"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Project Name*</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  value={newTeam.project}
                  onChange={(e) => setNewTeam({...newTeam, project: e.target.value})}
                  placeholder="E-commerce Platform"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  rows={3}
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                  placeholder="Brief description of the project..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Deadline</label>
                <input
                  type="date"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  value={newTeam.deadline}
                  onChange={(e) => setNewTeam({...newTeam, deadline: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Total Tasks</label>
                <input
                  type="number"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  value={newTeam.tasks.total}
                  onChange={(e) => setNewTeam({
                    ...newTeam,
                    tasks: { ...newTeam.tasks, total: parseInt(e.target.value) || 0 }
                  })}
                  placeholder="10"
                  min="0"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm text-white bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeam}
                className="px-4 py-2 text-sm text-white bg-yellow-600 rounded-lg hover:bg-yellow-700"
                disabled={!newTeam.name || !newTeam.project || isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Team'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {showEditModal && editingTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Edit Team</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Team Name</label>
                  <input
                    type="text"
                    value={editingTeam.name}
                    onChange={(e) => setEditingTeam({...editingTeam, name: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={editingTeam.project}
                    onChange={(e) => setEditingTeam({...editingTeam, project: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  rows={3}
                  value={editingTeam.description}
                  onChange={(e) => setEditingTeam({...editingTeam, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Deadline</label>
                  <input
                    type="date"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    value={editingTeam.deadline ? editingTeam.deadline.split('T')[0] : ''}
                    onChange={(e) => setEditingTeam({...editingTeam, deadline: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select
                    value={editingTeam.status}
                    onChange={(e) => setEditingTeam({...editingTeam, status: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
                

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Members</h3>
                <div className="space-y-4">
                  {editingTeam.members?.map(member => (
                    <div key={member._id} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <img
                             src={member?.avatar  ?  `http://localhost:5000${member.avatar}`  :  "/default-profile.png"}
                            alt={member.name}
                            className="w-10 h-10 rounded-full border border-gray-600"
                          />
                          <div>
                            <p className="text-white font-medium">{member.name}</p>
                            <p className="text-gray-400 text-sm">{member.role}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeMember(editingTeam._id, member._id)}
                          className="text-red-500 hover:text-red-400 p-2"
                          disabled={isLoading}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm text-white bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTeam}
                className="px-4 py-2 text-sm text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : (
                  <>
                    <FaSave /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white">My Teams</h1>
          <div className="flex gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search teams..."
                className="bg-gray-700 rounded-lg py-2 px-4 pr-10 text-white placeholder-gray-400 border border-gray-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button 
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus />
              Create New Team
            </button>
          </div>
        </div>

        {/* Tabs and Status Filters */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex border-b border-gray-700">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "created"
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => {
                setActiveTab("created");
                setStatusFilter("all");
              }}
            >
              Teams I Created
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "member"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => {
                setActiveTab("member");
                setStatusFilter("all");
              }}
            >
              Teams I'm In
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 text-xs rounded-full ${
                statusFilter === "all"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => setStatusFilter("all")}
            >
              All
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-full ${
                statusFilter === "active"
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => setStatusFilter("active")}
            >
              Active
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-full ${
                statusFilter === "pending"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => setStatusFilter("pending")}
            >
              Pending
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-full ${
                statusFilter === "completed"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => setStatusFilter("completed")}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Teams List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {filteredTeams.length > 0 ? (
    filteredTeams.map((team) => {
      const isCreator = team.createdBy === userId;
      
      return (
        <div
          key={team._id}
          className={`bg-gray-800 rounded-xl border border-gray-700 overflow-hidden transition-all duration-300 ${
            expandedTeam === team._id 
              ? "border-yellow-500 shadow-lg shadow-yellow-500/10" 
              : "hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/10"
          }`}
        >
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div>
                  <h3 className="font-medium text-white text-lg">{team.name}</h3>
                  <p className="text-sm text-yellow-400">{team.project}</p>
                  <div className="flex items-center mt-1 gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      team.status === "active" ? "bg-green-900 text-green-400" :
                      team.status === "pending" ? "bg-blue-900 text-blue-400" :
                      "bg-purple-900 text-purple-400"
                    }`}>
                      {team.status === "active" ? (
                        <span className="flex items-center">
                          <FaCheckCircle className="mr-1" /> Active
                        </span>
                      ) : team.status === "pending" ? (
                        <span className="flex items-center">
                          <FaHourglassStart className="mr-1" /> Pending
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <FaThumbsUp className="mr-1" /> Completed
                        </span>
                      )}
                    </span>
                    {team.sdgs?.length > 0 && (
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full flex items-center">
                        <FaBook className="mr-1 text-blue-400" />
                        {team.sdgs.length} SDGs
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isCreator ? (
                  <>
                    <button 
                      className="text-gray-400 hover:text-white p-1"
                      onClick={() => {
                        setEditingTeam(team)
                        setShowEditModal(true)
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="text-gray-400 hover:text-red-500 p-1"
                      onClick={() => handleDeleteTeam(team._id)}
                      disabled={isLoading}
                    >
                      <FaTrash />
                    </button>
                  </>
                ) : (
                  <button 
                    className="text-gray-400 hover:text-red-500 p-1"
                    onClick={() => handleLeaveTeam(team._id)}
                    disabled={isLoading}
                  >
                    <FaSignOutAlt />
                  </button>
                )}
                <button 
                  className="text-gray-400 hover:text-white p-1"
                  onClick={() => toggleExpandTeam(team._id)}
                >
                  <FaEllipsisH />
                </button>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-300">{team.description}</p>

            {team.mentor && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-300">
                <FaUserTie className="text-yellow-400" />
                <span>Mentor: </span>
                <span className="text-white">{team.mentor.name}</span>
                <span className="text-gray-400 text-xs ml-1">({team.mentor.role})</span>
              </div>
            )}

            <div className="mt-4">
              <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-400">Progress</span>
                <span className="text-xs text-gray-400">{team.tasks?.total ? Math.round((team.tasks.completed / team.tasks.total) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getProgressBarColor(team)}`}
                  style={{ width: `${team.tasks?.total ? Math.round((team.tasks.completed / team.tasks.total) * 100) : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center text-xs text-gray-400">
                <FaUsers className="mr-1" />
                <span>{team.members?.length || 0} members</span>
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <FaCalendarAlt className="mr-1" />
                <span>Deadline: {team.deadline ? new Date(team.deadline).toLocaleDateString() : 'Not set'}</span>
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <FaCheckCircle className="mr-1" />
                <span>
                  {team.tasks?.completed || 0}/{team.tasks?.total || 0} tasks
                </span>
              </div>
            </div>

            {expandedTeam === team._id && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                {/* Team Members Section */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-white">Team Members</h4>
                    {isCreator && (
                      <button 
                        onClick={() => navigate(`/dashboard`)}
                        className="flex items-center gap-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded"
                      >
                        <FaPlus size={10} /> Add Member
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {team.members?.length > 0 ? (
                      team.members.map((member) => (
                        <div key={member._id} className="flex items-start gap-3">
                          <img
                            src={member?.avatar ? `http://localhost:5000${member.avatar}` : "/default-profile.png"}
                            alt={member.name}
                            className="w-8 h-8 rounded-full border border-gray-600"
                          />
                          <div className="flex-1">
                            <p className="text-sm text-white font-medium">{member.name}</p>
                            <p className="text-xs text-gray-400">{member.role}</p>
                            {member.skills?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {member.skills.map((skill, index) => (
                                  <span key={index} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {isCreator && (
                            <button
                              onClick={() => removeMember(team._id, member._id)}
                              className="text-red-500 hover:text-red-400 p-1"
                              disabled={isLoading}
                            >
                              <FaTimes />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">No members added yet</p>
                    )}
                  </div>
                </div>

                {/* Skills Needed Section */}
                {team.skillsNeeded?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-white mb-2">Skills Needed</h4>
                    <div className="flex flex-wrap gap-2">
                      {team.skillsNeeded.map((skill, index) => (
                        <span key={index} className="text-xs bg-yellow-900/50 text-yellow-400 px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* SDGs Section */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-white">Sustainable Development Goals</h4>
                    <button
                      onClick={() => navigate(`/sdg`)}
                      className="flex items-center gap-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded"
                    >
                      <FaPlus size={10} /> Add SDGs
                    </button>
                  </div>
                  {team.sdgs?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {team.sdgs.map(sdgId => {
                        const sdg = allSDGs.find(s => s.id === sdgId);
                        return sdg ? (
                          <div 
                            key={sdgId} 
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${sdg.color} text-white`}
                          >
                            <span>SDG {sdg.id}</span>
                           
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No SDGs mapped yet</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex -space-x-2 mt-4">
              {team.members?.slice(0, 5).map((member) => (
                <img
                  key={member._id}
                  src={member?.avatar ? `http://localhost:5000${member.avatar}` : "/default-profile.png"}
                  alt={member.name}
                  title={`${member.name} - ${member.role}`}
                  className="w-8 h-8 rounded-full border-2 border-gray-800"
                />
              ))}
              {team.members?.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs text-gray-300">
                  +{team.members.length - 5}
                </div>
              )}
              {team.status === "active" && isCreator && !expandedTeam &&(
                <button 
                  className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white border-2 border-gray-800"
                  onClick={() => navigate(`/dashboard`)}
                >
                  <FaPlus className="text-xs" />
                </button>
              )}
            </div>
          </div>
          
          <div className="border-t border-gray-700 p-3 flex justify-between items-center">
            <div className="flex gap-3">
              <button 
                className="flex items-center gap-1 text-xs text-gray-300 hover:text-white"
                onClick={() => navigate(`/team-analytics/${team._id}`)}
              >
                <FaChartBar className="mr-1" />
                <span>Analytics</span>
              </button>
              <button 
                className="flex items-center gap-1 text-xs text-gray-300 hover:text-white"
                onClick={() => navigate(`/team-chat/${team._id}`)}
              >
                <FaComments className="mr-1" />
                <span>Chat</span>
              </button>
            </div>
            {team.status === "active" && team.tasks?.total > 0 && (
              <button 
                className="flex items-center gap-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <FaCheckCircle className="text-xs" />
                Complete Task
              </button>
            )}
          </div>
        </div>
      )
    })
  ) : (
    <div className="col-span-full bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
      <p className="text-gray-400">{getEmptyStateMessage()}</p>
      {activeTab === "created" && (
        <button 
          className="mt-4 flex items-center gap-1 mx-auto text-yellow-400 hover:text-yellow-300 text-sm px-4 py-2 bg-gray-700 rounded-lg"
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus />
          Create New Team
        </button>
      )}
    </div>
  )}
</div>
      </div>
    </div>
  )
}