"use client"

import { useState, useEffect } from "react"
import { auth } from "../config/firebase";
import {
  FaCalendarAlt,
  FaChartBar,
  FaCheckCircle,
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
  FaSave
} from "react-icons/fa"

export default function MyTeams() {
  const[userId,setUserId]=useState(null)
  const [activeTab, setActiveTab] = useState("active")
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
  const [newMember, setNewMember] = useState({
    name: "",
    role: "",
    skills: []
  })
  const [newSkill, setNewSkill] = useState("")

  const mentors = [
    { id: "m1", name: "Dr. Alan Turing", role: "Senior Architect" },
    { id: "m2", name: "Dr. Yann LeCun", role: "AI Research Lead" },
    { id: "m3", name: "Grace Hopper", role: "Mobile Tech Lead" },
    { id: "m4", name: "Werner Vogels", role: "Cloud Architect" },
    { id: "m5", name: "Andrew Ng", role: "AI Advisor" }
  ]
  const user = auth.currentUser;

  useEffect(() => {
    if (user){
      setUserId(user.uid)
    }
  }, [user]);


  const fetchTeams = async () => {
    try {
      if (!userId) return;
      
      setIsLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:5000/api/teams/user/${userId}?status=${activeTab}`);
      
      if (!response.ok) throw new Error('Failed to fetch teams');
      
      const data = await response.json();
      setTeams(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [activeTab, userId]);

  const toggleExpandTeam = (teamId) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  const handleCreateTeam = async () => {
    try {
          console.log('Current values:', {
            name: newTeam.name,
            project: newTeam.project,
            userId: userId
          });
      
          // Validate required fields
          if (!newTeam.name || !newTeam.project || !userId) {
            console.error('Validation failed:', {
              nameMissing: !newTeam.name,
              projectMissing: !newTeam.project,
              userIdMissing: !userId
            });
            throw new Error('Team name, project, and user ID are required');
          }
      // Prepare the request body to match your backend expectations
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
        members: [] // Initialize with empty array
      };
      // Only add deadline if it exists
      if (newTeam.deadline) {
        requestBody.deadline = new Date(newTeam.deadline).toISOString();
      }
  
      const response = await fetch('http://localhost:5000/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization if needed
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create team');
      }
  
      const createdTeam = await response.json();
      setTeams(prevTeams => [...prevTeams, createdTeam]);
      
      // Reset form
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
      setActiveTab(createdTeam.status || "active");
      
    } catch (err) {
      setError(err.message);
      console.error('Create team error:', err);
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
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMember = async (teamId) => {
    try {
      setIsLoading(true);
      const newMember = {
        name: "New Member",  // Required field
        role: "Team Member", // Required field
        // Add other required fields your backend expects
      };
  
      const response = await fetch(`http://localhost:5000/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMember)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add member');
      }
  
      const updatedTeam = await response.json();
      setTeams(teams.map(team => team._id === teamId ? updatedTeam : team));
    } catch (err) {
      setError(err.message);
      console.error('Add member error:', err);
    } finally {
      setIsLoading(false);
    }
  };

 const handleCompleteTask = async (teamId) => {
  try {
    setIsLoading(true);
    const response = await fetch(`http://localhost:5000/api/teams/${teamId}/tasks/complete`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to complete task');
    }

    const updatedTeam = await response.json();
    setTeams(teams.map(team => team._id === teamId ? updatedTeam : team));
  } catch (err) {
    setError(err.message);
    console.error('Complete task error:', err);
  } finally {
    setIsLoading(false);
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
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMemberChange = (memberId, field, value) => {
    setEditingTeam(prev => ({
      ...prev,
      members: prev.members.map(member => 
        member.id === memberId ? { ...member, [field]: value } : member
      )
    }))
  }

  const addNewMember = () => {
    if (newMember.name && newMember.role) {
      setEditingTeam(prev => ({
        ...prev,
        members: [...prev.members, {
          ...newMember,
          id: Date.now().toString(),
          avatar: "/placeholder.svg"
        }]
      }))
      setNewMember({ name: "", role: "", skills: [] })
    }
  }

  const removeMember = async (teamId, memberId) => {
    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:5000/api/teams/${teamId}/members/${memberId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to remove member')

      const updatedTeam = await response.json()
      setTeams(teams.map(team => team._id === teamId ? updatedTeam : team))
      if (editingTeam?._id === teamId) {
        setEditingTeam(updatedTeam)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const addSkillToMember = (memberId) => {
    if (newSkill) {
      setEditingTeam(prev => ({
        ...prev,
        members: prev.members.map(member => 
          member.id === memberId 
            ? { ...member, skills: [...member.skills, newSkill] } 
            : member
        )
      }))
      setNewSkill("")
    }
  }

  const removeSkillFromMember = (memberId, skillIndex) => {
    setEditingTeam(prev => ({
      ...prev,
      members: prev.members.map(member => 
        member.id === memberId
          ? { ...member, skills: member.skills.filter((_, i) => i !== skillIndex) }
          : member
      )
    }))
  }

  const getProgressBarColor = (team) => {
    if (team.status === "completed") return "bg-green-500"
    if (team.progress > 50) return "bg-yellow-500"
    return "bg-blue-500"
  }

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case "active":
        return "You don't have any active teams yet."
      case "completed":
        return "You don't have any completed teams yet."
      case "pending":
        return "You don't have any pending teams yet."
      default:
        return "No teams found."
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
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Total Tasks</label>
                  <input
                    type="number"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    value={editingTeam.tasks.total}
                    onChange={(e) => setEditingTeam({
                      ...editingTeam,
                      tasks: { ...editingTeam.tasks, total: parseInt(e.target.value) || 0 }
                    })}
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Completed Tasks</label>
                  <input
                    type="number"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    value={editingTeam.tasks.completed}
                    onChange={(e) => setEditingTeam({
                      ...editingTeam,
                      tasks: { ...editingTeam.tasks, completed: parseInt(e.target.value) || 0 }
                    })}
                    min="0"
                    max={editingTeam.tasks.total}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Members</h3>
                <div className="space-y-4">
                  {editingTeam.members.map(member => (
                    <div key={member.id} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => handleMemberChange(member.id, 'name', e.target.value)}
                            className="w-full bg-gray-600 text-white p-2 rounded"
                            placeholder="Member name"
                          />
                          <input
                            type="text"
                            value={member.role}
                            onChange={(e) => handleMemberChange(member.id, 'role', e.target.value)}
                            className="w-full bg-gray-600 text-white p-2 rounded"
                            placeholder="Member role"
                          />
                        </div>
                        <button
                          onClick={() => removeMember(editingTeam._id, member.id)}
                          className="ml-2 text-red-500 hover:text-red-400 p-2"
                          disabled={isLoading}
                        >
                          <FaTrash />
                        </button>
                      </div>
                      
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-300 mb-1">Skills</h4>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {member.skills?.map((skill, index) => (
                            <span key={index} className="flex items-center text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                              {skill}
                              <button 
                                onClick={() => removeSkillFromMember(member.id, index)}
                                className="ml-1 text-red-400 hover:text-red-300"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Add skill"
                            className="flex-1 bg-gray-600 text-white p-2 rounded"
                          />
                          <button
                            onClick={() => addSkillToMember(member.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Add New Member</h4>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newMember.name}
                        onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                        placeholder="Member name"
                        className="w-full bg-gray-600 text-white p-2 rounded"
                      />
                      <input
                        type="text"
                        value={newMember.role}
                        onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                        placeholder="Member role"
                        className="w-full bg-gray-600 text-white p-2 rounded"
                      />
                      <button 
  onClick={() => navigate('/dashboard')}
  className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white border-2 border-gray-800"
>
  <FaPlus className="text-xs" />Add Member
</button>
                    </div>
                  </div>
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
            <button 
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus />
              Create New Team
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "active"
                ? "text-yellow-400 border-b-2 border-yellow-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("active")}
          >
            Active Teams
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "completed"
                ? "text-green-400 border-b-2 border-green-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("completed")}
          >
            Completed
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "pending" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("pending")}
          >
            Pending
          </button>
        </div>

        {/* Teams List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teams.length > 0 ? (
            teams.map((team) => (
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
                      <img
                        src={team.logo || "/placeholder.svg"}
                        alt={`${team.name} logo`}
                        className="w-14 h-14 rounded-lg object-cover border-2 border-yellow-500/30"
                        width={56}
                        height={56}
                      />
                      <div>
                        <h3 className="font-medium text-white text-lg">{team.name}</h3>
                        <p className="text-sm text-yellow-400">{team.project}</p>
                        {team.status === "completed" && (
                          <div className="flex items-center mt-1 text-xs text-green-400">
                            <FaThumbsUp className="mr-1" />
                            <span>Completed</span>
                          </div>
                        )}
                        {team.status === "pending" && (
                          <div className="flex items-center mt-1 text-xs text-blue-400">
                            <FaHourglassStart className="mr-1" />
                            <span>Pending Start</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                      <span className="text-xs text-gray-400">{team.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressBarColor(team)}`}
                        style={{ width: `${team.progress || 0}%` }}
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
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-white mb-2">Team Members</h4>
                        <div className="space-y-3">
                          {team.members?.map((member) => (
                            <div key={member.id} className="flex items-start gap-3">
                              <img
                                src={member.avatar || "/placeholder.svg"}
                                alt={member.name}
                                className="w-8 h-8 rounded-full border border-gray-600"
                                width={32}
                                height={32}
                              />
                              <div className="flex-1">
                                <p className="text-sm text-white">{member.name}</p>
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
                              {team.createdBy === userId && (
                                <button
                                  onClick={() => removeMember(team._id, member.id)}
                                  className="text-red-500 hover:text-red-400 p-1"
                                  disabled={isLoading}
                                >
                                  <FaTimes />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {team.skillsNeeded?.length > 0 && (
                        <div className="mb-4">
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

                      {team.status === "completed" && (
                        <>
                          {team.retrospective && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-white mb-2">Retrospective</h4>
                              <p className="text-xs text-gray-300 mb-2">{team.retrospective}</p>
                            </div>
                          )}
                          {team.lessons?.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-white mb-2">Key Lessons</h4>
                              <ul className="text-xs text-gray-300 space-y-1">
                                {team.lessons.map((lesson, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="mr-1">•</span>
                                    <span>{lesson}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {team.successMetrics && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-white mb-2">Success Metrics</h4>
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                                {Object.entries(team.successMetrics).map(([metric, value]) => (
                                  <div key={metric} className="bg-gray-700/50 p-2 rounded">
                                    <span className="capitalize">{metric}: </span>
                                    <span className="text-white">{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {team.status === "pending" && (
                        <>
                          {team.onboarding?.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-white mb-2">Onboarding Tasks</h4>
                              <ul className="text-xs text-gray-300 space-y-2">
                                {team.onboarding.map((task, index) => (
                                  <li key={index} className="flex items-start">
                                    <input 
                                      type="checkbox" 
                                      id={`task-${team._id}-${index}`} 
                                      className="mr-2 mt-0.5" 
                                    />
                                    <label htmlFor={`task-${team._id}-${index}`}>{task}</label>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {team.pendingTasks?.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-white mb-2">Pending Tasks</h4>
                              <ul className="text-xs text-gray-300 space-y-1">
                                {team.pendingTasks.map((task, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="mr-1">•</span>
                                    <span>{task}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      )}

                      {team.meetings?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-white mb-2">Meetings</h4>
                          <div className="space-y-2">
                            {team.meetings.map((meeting, index) => (
                              <div key={index} className="flex items-center text-xs text-gray-300">
                                <FaVideo className="mr-2 text-gray-400" />
                                <span>{meeting.day} {meeting.time} - {meeting.type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex -space-x-2 mt-4">
                    {team.members?.map((member) => (
                      <img
                        key={member.id}
                        src={member.avatar || "/placeholder.svg"}
                        alt={member.name}
                        title={`${member.name} - ${member.role}`}
                        className="w-8 h-8 rounded-full border-2 border-gray-800"
                        width={32}
                        height={32}
                      />
                    ))}
                    {team.status === "active" && team.createdBy === userId && (
                      <button 
                        className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white border-2 border-gray-800"
                        onClick={() => handleAddMember(team._id)}
                        disabled={isLoading}
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
                    >
                      <FaChartBar className="mr-1" />
                      <span>Analytics</span>
                    </button>
                    <button 
                      className="flex items-center gap-1 text-xs text-gray-300 hover:text-white"
                    >
                      <FaComments className="mr-1" />
                      <span>Chat</span>
                    </button>
                  </div>
                  {team.status === "active" && team.tasks?.total > 0 && (
                    <button 
                      className="flex items-center gap-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                      onClick={() => handleCompleteTask(team._id)}
                      disabled={isLoading}
                    >
                      <FaCheckCircle className="text-xs" />
                      Complete Task
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
              <p className="text-gray-400">{getEmptyStateMessage()}</p>
              <button 
                className="mt-4 flex items-center gap-1 mx-auto text-yellow-400 hover:text-yellow-300 text-sm px-4 py-2 bg-gray-700 rounded-lg"
                onClick={() => setShowCreateModal(true)}
              >
                <FaPlus />
                Create New Team
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}