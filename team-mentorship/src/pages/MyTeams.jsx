"use client"
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import {
  FaSpinner,
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
} from "react-icons/fa";

export default function MyTeams() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("created");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentProcessingTeam, setCurrentProcessingTeam] = useState(null);
  const [mentorsData, setMentorsData] = useState({});
  const [newTeam, setNewTeam] = useState({
    name: "",
    project: "",
    description: "",
    deadline: "",
    mentor: "",
    status: "active",
    tasks: { 
      total: 0,
      completed: 0,
      items: []
    },
    members: []
  });
  const [editingTeam, setEditingTeam] = useState(null);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [allSDGs, setAllSDGs] = useState([]);
  
  // Task management states
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [currentTeamIdForTask, setCurrentTeamIdForTask] = useState(null);
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    completed: false
  });
  const [editingTask, setEditingTask] = useState(null);

  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      setUserId(user.uid);
    }
  }, [user]);

  const fetchMentorDetails = async (mentorId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/mentor/profile/id/${mentorId}`);
      if (!response.ok) throw new Error('Failed to fetch mentor details');
      return await response.json();
    } catch (err) {
      console.error('Error fetching mentor details:', err);
      return null;
    }
  };

  const fetchAllMentors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/mentors/mentors');
      if (!response.ok) throw new Error('Failed to fetch mentors');
      return await response.json();
    } catch (err) {
      console.error('Error fetching mentors:', err);
      return [];
    }
  };

  const fetchTeams = async () => {
    try {
      if (!userId) return;
      
      setIsLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:5000/api/teams/user/${userId}`);
      
      if (!response.ok) throw new Error('Failed to fetch teams');
      
      const result = await response.json();
      const teamsWithTasks = await Promise.all(
        result.data.map(async team => {
          const tasksResponse = await fetch(`http://localhost:5000/api/teams/${team._id}/tasks`);
          if (!tasksResponse.ok) return team;
          
          const tasksData = await tasksResponse.json();
          return {
            ...team,
            tasks: tasksData || {
              total: 0,
              completed: 0,
              items: []
            }
          };
        })
      );
      
      setTeams(teamsWithTasks);
      
      // Fetch mentor details for all teams
      const mentorDetails = {};
      const mentorFetchPromises = [];
      
      teamsWithTasks.forEach(team => {
        if (team.mentors && team.mentors.length > 0) {
          team.mentors.forEach(mentorId => {
            if (!mentorDetails[mentorId]) {
              mentorFetchPromises.push(
                fetchMentorDetails(mentorId).then(mentor => {
                  if (mentor) mentorDetails[mentorId] = mentor;
                })
              );
            }
          });
        }
      });
      
      await Promise.all(mentorFetchPromises);
      setMentorsData(mentorDetails);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [userId]);

  // Task CRUD Operations
  const handleAddTask = async () => {
    try {
      if (!newTask.name || !currentTeamIdForTask) {
        throw new Error('Task name is required');
      }

      setIsLoading(true);
      
      const response = await fetch(`http://localhost:5000/api/teams/${currentTeamIdForTask}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTask.name,
          description: newTask.description
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add task');
      }

      await fetchTeams();
      setShowAddTaskModal(false);
      setNewTask({
        name: "",
        description: "",
        completed: false
      });
      toast.success("Task added successfully");
      
    } catch (err) {
      toast.error(err.message || "Failed to add task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTask = async () => {
    try {
      if (!editingTask?.name || !editingTask?.teamId) {
        throw new Error('Task name is required');
      }

      setIsLoading(true);
      
      const response = await fetch(
        `http://localhost:5000/api/teams/${editingTask.teamId}/tasks/${editingTask._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: editingTask.name,
            description: editingTask.description,
            completed: editingTask.completed
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task');
      }

      await fetchTeams();
      setShowEditTaskModal(false);
      setEditingTask(null);
      toast.success("Task updated successfully");
      
    } catch (err) {
      toast.error(err.message || "Failed to update task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (teamId, taskId) => {
    try {
      if (!window.confirm("Are you sure you want to delete this task?")) return;
      
      setIsLoading(true);
      
      const response = await fetch(
        `http://localhost:5000/api/teams/${teamId}/tasks/${taskId}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete task');
      }

      await fetchTeams();
      toast.success("Task deleted successfully");
      
    } catch (err) {
      toast.error(err.message || "Failed to delete task");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskCompletion = async (teamId, taskId) => {
    try {
      setIsLoading(true);
      
      // Find the current state of the task
      const team = teams.find(t => t._id === teamId);
      if (!team) return;
      
      const task = team.tasks.items.find(t => t._id === taskId);
      if (!task) return;
      
      const newCompletedState = !task.completed;

      // Update the task on the backend
      const response = await fetch(`http://localhost:5000/api/teams/${teamId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: newCompletedState
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Refresh the team data
      await fetchTeams();
      
    } catch (err) {
      console.error('Error toggling task completion:', err);
      toast.error(err.message || 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
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
          total: 0,
          completed: 0,
          items: []
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
      
      // Create default tasks for the new team
      const defaultTasks = [
        { name: "Project Planning", completed: false },
        { name: "Research", completed: false },
        { name: "Design Mockups", completed: false },
        { name: "Development", completed: false },
        { name: "Testing", completed: false }
      ];
      
      for (const task of defaultTasks) {
        await fetch(`http://localhost:5000/api/teams/${createdTeam._id}/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(task)
        });
      }

      // Refresh the teams list
      await fetchTeams();
      
      setNewTeam({
        name: "",
        project: "",
        description: "",
        deadline: "",
        mentor: "",
        status: "active",
        tasks: { 
          total: 0,
          completed: 0,
          items: []
        },
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

  const handleRemoveMentor = async (teamId, mentorId) => {
    try {
      setCurrentProcessingTeam(teamId);
      setIsLoading(true);
      
      const response = await fetch(`http://localhost:5000/api/teams/${teamId}/mentors/${mentorId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove mentor');
      }
  
      await fetchTeams();
      toast.success('Mentor removed successfully');
      
    } catch (err) {
      console.error('Error removing mentor:', err);
      toast.error(err.message || 'Failed to remove mentor');
    } finally {
      setCurrentProcessingTeam(null);
      setIsLoading(false);
    }
  };

  const handleAddMentor = (teamId) => {
    navigate(`/mentors?teamId=${teamId}`);
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
    try {
      setIsLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error('Authentication required');
  
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
  
      if (!response.ok) {
        throw new Error('Failed to leave team');
      }

      setTeams(teams.filter(t => t._id !== teamId));
      toast.success("Successfully left the team");
  
    } catch (err) {
      console.error('Leave team failed:', err);
      toast.error(err.message || 'Failed to leave team');
      await fetchTeams();
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
        body: JSON.stringify({
          ...editingTeam,
          tasks: {
            total: editingTeam.tasks.total,
            completed: editingTeam.tasks.completed
          }
        })
      })

      if (!response.ok) throw new Error('Failed to update team')

      await fetchTeams();
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
      const response = await fetch(`http://localhost:5000/api/teams/${teamId}/members/${memberId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to remove member')

      await fetchTeams();
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
    const progress = team.tasks?.total ? (team.tasks.completed / team.tasks.total) * 100 : 0;
    if (progress > 70) return "bg-green-500"
    if (progress > 30) return "bg-yellow-500"
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

  // Separate teams into created by me and teams I'm a member of
  const createdTeams = teams.filter(team => team.createdBy === userId);
  const memberTeams = teams.filter(team => team.createdBy !== userId);

  // Filter teams based on active tab, search query and status filter
  const filteredTeams = activeTab === "created" 
    ? createdTeams.filter(team => 
        (team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (team.project?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (statusFilter === "all" || team.status === statusFilter)))
    : memberTeams.filter(team => 
        (team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (team.project?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (statusFilter === "all" || team.status === statusFilter)));

  const toggleExpandTeam = (teamId) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  const renderTaskItem = (teamId, task) => (
    <div key={task._id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleTaskCompletion(teamId, task._id)}
          className="h-4 w-4 text-yellow-600 rounded border-gray-600 bg-gray-700 focus:ring-yellow-500"
        />
        <span className={`ml-2 text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-gray-300'}`}>
          {task.name}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setEditingTask({
              ...task,
              teamId: teamId
            });
            setShowEditTaskModal(true);
          }}
          className="text-blue-400 hover:text-blue-300 p-1"
        >
          <FaEdit className="text-xs" />
        </button>
        <button
          onClick={() => handleDeleteTask(teamId, task._id)}
          className="text-red-400 hover:text-red-300 p-1"
        >
          <FaTrash className="text-xs" />
        </button>
        {task.completed ? (
          <FaCheckCircle className="text-green-500 text-xs" />
        ) : (
          <FaClock className="text-yellow-500 text-xs" />
        )}
      </div>
    </div>
  );

  const renderEditTaskModal = () => (
    showEditTaskModal && editingTask && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Edit Task</h3>
            <button 
              onClick={() => setShowEditTaskModal(false)}
              className="text-gray-400 hover:text-white"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Task Name*</label>
              <input
                type="text"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                value={editingTask.name}
                onChange={(e) => setEditingTask({...editingTask, name: e.target.value})}
                placeholder="Task name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                rows={3}
                value={editingTask.description}
                onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                placeholder="Task description"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="completed"
                checked={editingTask.completed}
                onChange={(e) => setEditingTask({...editingTask, completed: e.target.checked})}
                className="h-4 w-4 text-yellow-600 rounded border-gray-600 bg-gray-700 focus:ring-yellow-500"
              />
              <label htmlFor="completed" className="text-sm text-gray-300">
                Mark as completed
              </label>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowEditTaskModal(false)}
              className="px-4 py-2 text-sm text-white bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleEditTask}
              className="px-4 py-2 text-sm text-white bg-yellow-600 rounded-lg hover:bg-yellow-700"
              disabled={!editingTask.name || isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    )
  );

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
                            src={member?.avatar ? `http://localhost:5000${member.avatar}` : "/default-profile.png"}
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

              {/* Progress Section in Edit Modal */}
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Task Progress</h3>
                <div className="space-y-2">
                  {editingTeam.tasks?.items?.map(task => (
                    <div key={task._id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => {
                            const updatedTasks = editingTeam.tasks.items.map(t => 
                              t._id === task._id ? {...t, completed: !t.completed} : t
                            );
                            setEditingTeam({
                              ...editingTeam,
                              tasks: {
                                ...editingTeam.tasks,
                                items: updatedTasks,
                                completed: updatedTasks.filter(t => t.completed).length
                              }
                            });
                          }}
                          className="h-4 w-4 text-yellow-600 rounded border-gray-600 bg-gray-700 focus:ring-yellow-500"
                        />
                        <span className={`ml-2 text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-gray-300'}`}>
                          {task.name}
                        </span>
                      </div>
                      {task.completed ? (
                        <FaCheckCircle className="text-green-500 text-xs" />
                      ) : (
                        <FaClock className="text-yellow-500 text-xs" />
                      )}
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

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Add New Task</h3>
              <button 
                onClick={() => setShowAddTaskModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Task Name*</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  value={newTask.name}
                  onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                  placeholder="Complete project documentation"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  rows={3}
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Detailed description of the task..."
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="px-4 py-2 text-sm text-white bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="px-4 py-2 text-sm text-white bg-yellow-600 rounded-lg hover:bg-yellow-700"
                disabled={!newTask.name || isLoading}
              >
                {isLoading ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {renderEditTaskModal()}

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
              const progressPercentage = team.tasks?.total ? 
                Math.round((team.tasks.completed / team.tasks.total) * 100) : 0;
              
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

                    <div className="mt-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs text-gray-400">Progress</span>
                        <span className="text-xs text-gray-400">
                          {team.tasks?.completed || 0}/{team.tasks?.total || 0} tasks
                          ({progressPercentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressBarColor(team)}`}
                          style={{ width: `${progressPercentage}%` }}
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
                        {/* Task Progress Section */}
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-white mb-3">Task Progress</h4>
                          <div className="space-y-2">
                            {team.tasks?.items?.map(task => renderTaskItem(team._id, task))}
                          </div>
                          
                          {/* Progress Summary */}
                          <div className="mt-4 bg-gray-700/50 p-3 rounded-lg">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-300">Overall Progress</span>
                              <span className="text-yellow-400">
                                {progressPercentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${getProgressBarColor(team)}`}
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-gray-400">
                              <span>{team.tasks?.completed || 0} completed</span>
                              <span>{team.tasks?.total ? team.tasks.total - team.tasks.completed : 0} remaining</span>
                            </div>
                          </div>
                        </div>

                        {/* Mentor Section */}
                        {team.mentors && team.mentors.length > 0 ? (
                          <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-sm font-medium text-white">Mentors</h4>
                              {isCreator && (
                                <button 
                                  onClick={() => navigate("/mentorfind")}
                                  className="flex items-center gap-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded"
                                >
                                  <FaPlus size={10} /> Add Mentor
                                </button>
                              )}
                            </div>
                            <div className="space-y-3">
                              {team.mentors.map(mentorId => {
                                const mentor = mentorsData[mentorId];
                                if (!mentor) return null;
                                
                                return (
                                  <div key={mentorId} className="bg-gray-700/50 p-3 rounded-lg">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={mentor.profilePicture 
                                            ? `http://localhost:5000${mentor.profilePicture}`
                                            : "/default-profile.png"}
                                          alt={mentor.name}
                                          className="w-10 h-10 rounded-full border border-gray-600"
                                        />
                                        <div>
                                          <p className="text-white font-medium">{mentor.name}</p>
                                          <p className="text-gray-400 text-sm">{mentor.domain}</p>
                                          {mentor.currentPosition && (
                                            <p className="text-gray-400 text-xs">{mentor.currentPosition}</p>
                                          )}
                                        </div>
                                      </div>
                                      {isCreator && (
                                        <button
                                          onClick={() => handleRemoveMentor(team._id, mentorId)}
                                          className="text-red-500 hover:text-red-400 p-2"
                                          disabled={isLoading && currentProcessingTeam === team._id}
                                        >
                                          {isLoading && currentProcessingTeam === team._id ? (
                                            <FaSpinner className="animate-spin" />
                                          ) : (
                                            <FaTimes />
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-sm font-medium text-white">Mentors</h4>
                              {isCreator && (
                                <button 
                                  onClick={() => handleAddMentor(team._id)}
                                  className="flex items-center gap-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded"
                                >
                                  <FaPlus size={10} /> Add Mentor
                                </button>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm">No mentors assigned yet</p>
                          </div>
                        )}

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
                    {team.status === "active" && (
                      <button 
                        className="flex items-center gap-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                        disabled={isLoading}
                        onClick={() => {
                          setCurrentTeamIdForTask(team._id);
                          setShowAddTaskModal(true);
                        }}
                      >
                        <FaPlus className="text-xs" />
                        Add Task
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
  );
}