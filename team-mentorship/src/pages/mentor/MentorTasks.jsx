import { useState, useEffect } from "react";
import { 
  FaCheckCircle, 
  FaClock, 
  FaPlus, 
  FaSpinner, 
  FaTrash, 
  FaEdit,
  FaArrowLeft,
  FaSearch,
  FaUsers,
  FaExclamationTriangle,
  FaTimes
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { auth } from "/src/config/firebase";

const MentorTasks = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState({
    mentor: true,
    teams: true,
    tasks: true
  });
  const [error, setError] = useState(null);
  const [teams, setTeams] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    teamId: "" // Added teamId to new task
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [userId, setUserId] = useState(null);
  const [mentorId, setMentorId] = useState(null);
  
  const user = auth.currentUser;
  
  useEffect(() => {
    if (user) {
      setUserId(user.uid);
    }
  }, [user]);

  // Fetch mentor profile to get mentorId
  const fetchMentorProfile = async () => {
    try {
      setLoading(prev => ({ ...prev, mentor: true }));
      const response = await axios.get(
        `http://localhost:5000/api/mentor/profile/${userId}`);
        setMentorId(response.data._id); // Store mentorId in state
      return response.data._id;
    } catch (err) {
      console.error("Error fetching mentor profile:", err);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, mentor: false }));
    }
  };

  // Fetch all teams where this mentor is assigned with their tasks
  const fetchMentorTeamsWithTasks = async (mentorId) => {
    try {
      setLoading(prev => ({ ...prev, teams: true, tasks: true }));
      setError(null);
      
      const response = await axios.get(
        `http://localhost:5000/api/teams/mentor/${mentorId}`);
      
      setTeams(response.data.teams || []);
    } catch (err) {
      console.error("Error fetching mentor teams:", err);
      setError(err.response?.data?.message || "Failed to load teams");
    } finally {
      setLoading(prev => ({ ...prev, teams: false, tasks: false }));
    }
  };

  // Add new task to a team
  const handleAddTask = async () => {
    try {
      if (!newTask.name || !newTask.teamId) {
        throw new Error("Task name and team selection are required");
      }

      setLoading(prev => ({ ...prev, tasks: true }));
      
      const response = await axios.post(
        `http://localhost:5000/api/teams/${newTask.teamId}/tasks`,
        {
          name: newTask.name,
          description: newTask.description
        });

      // Update the team's tasks in state
      await fetchMentorTeamsWithTasks(mentorId);
      setShowAddModal(false);
      setNewTask({ name: "", description: "", teamId: "" });
      toast.success("Task added successfully");
      
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add task");
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  // Toggle task completion status
  const toggleTaskCompletion = async (teamId, taskId) => {
    try {
      setLoading(prev => ({ ...prev, tasks: true }));
      
      const team = teams.find(t => t._id === teamId);
      const taskToUpdate = team?.tasks?.items?.find(t => t._id === taskId);
      if (!taskToUpdate) return;
      
      const response = await axios.patch(
        `http://localhost:5000/api/teams/${teamId}/tasks/${taskId}`,
        { completed: !taskToUpdate.completed });

        await fetchMentorTeamsWithTasks(mentorId);
      
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update task");
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  // Delete task
  const handleDeleteTask = async (teamId, taskId) => {
    try {
      if (!window.confirm("Are you sure you want to delete this task?")) return;
      
      setLoading(prev => ({ ...prev, tasks: true }));
      
      await axios.delete(
        `http://localhost:5000/api/teams/${teamId}/tasks/${taskId}`);

        await fetchMentorTeamsWithTasks(mentorId);
      
      toast.success("Task deleted successfully");
      
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete task");
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  // Update task
  const handleUpdateTask = async () => {
    try {
      if (!editingTask?.name || !editingTask?.teamId) {
        throw new Error("Task name is required");
      }

      setLoading(prev => ({ ...prev, tasks: true }));
      
      const response = await axios.put(
        `http://localhost:5000/api/teams/${editingTask.teamId}/tasks/${editingTask._id}`,
        editingTask);

        await fetchMentorTeamsWithTasks(mentorId);
      setEditingTask(null);
      toast.success("Task updated successfully");
      
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update task");
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  };

  // Calculate progress for a team
  const calculateProgress = (team) => {
    const completed = team.tasks?.items?.filter(t => t.completed).length || 0;
    const total = team.tasks?.items?.length || 0;
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  // Filter teams and tasks based on search term
  const filterTeamsAndTasks = (teams) => {
    if (!searchTerm) return teams;
    
    return teams
      .filter(team => 
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.tasks?.items?.some(task =>
          task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      .map(team => ({
        ...team,
        tasks: {
          ...team.tasks,
          items: team.tasks?.items?.filter(task =>
            task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
      }));
  };

  // Initialize data fetching
  useEffect(() => {
    const initializeData = async () => {
      const mentorId = await fetchMentorProfile();
      if (mentorId) {
        await fetchMentorTeamsWithTasks(mentorId);
      }
    };
    
    initializeData();
  }, [userId]);

  if (loading.mentor || loading.teams) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6 flex justify-center items-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p>Loading your teams...</p>
        </div>
      </div>
    );
  }

  // Get filtered teams based on search
  const filteredTeams = filterTeamsAndTasks(teams);

    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <button 
                onClick={() => navigate("/mentor/dashboard")}
                className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
              >
                <FaArrowLeft size={14} /> Back
              </button>
              <div className="flex items-center gap-2 mt-1">
                <h1 className="text-xl font-bold">Team Tasks</h1>
                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                  {teams.length} teams
                </span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1 min-w-[200px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" size={14} />
                </div>
                <input
                  type="text"
                  placeholder="Search tasks or teams..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm"
                disabled={loading.tasks || teams.length === 0}
              >
                <FaPlus size={12} /> Add Task
              </button>
            </div>
          </div>
  
          {/* Error message */}
          {error && (
            <div className="mb-4 bg-red-900/30 border border-red-700 text-red-300 p-3 rounded-lg flex items-start gap-2 text-sm">
              <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Error Loading Data</h3>
                <p>{error}</p>
              </div>
            </div>
          )}
  
          {/* Teams List */}
          {teams.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
              {error ? "Cannot load teams due to error" : "You are not assigned as mentor to any teams yet"}
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
              No teams or tasks match your search
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredTeams.map(team => {
                const progress = calculateProgress(team);
                
                return (
                  <div key={team._id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                    {/* Team Header */}
                    <div className="p-4 border-b border-gray-700">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h2 className="font-medium truncate">{team.name}</h2>
                          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                            {team.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span>{team.members?.length || 0} members</span>
                          <span>{team.tasks?.items?.length || 0} tasks</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mt-1 truncate">{team.project}</p>
                    </div>
  
                    {/* Progress Bar */}
                    <div className="px-4 pt-3 pb-2">
                      <div className="flex justify-between items-center mb-1 text-xs">
                        <span className="text-gray-300">Progress</span>
                        <span className="text-gray-400">
                          {progress.completed}/{progress.total} ({progress.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            progress.percentage === 100 ? "bg-green-500" :
                            progress.percentage >= 70 ? "bg-green-400" :
                            progress.percentage >= 40 ? "bg-yellow-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${progress.percentage}%` }}
                        ></div>
                      </div>
                    </div>
  
                    {/* Tasks List */}
                    <div className="divide-y divide-gray-700">
                      {loading.tasks ? (
                        <div className="p-3 flex justify-center">
                          <FaSpinner className="animate-spin text-blue-400" />
                        </div>
                      ) : team.tasks?.items?.length === 0 ? (
                        <div className="p-3 text-center text-sm text-gray-400">
                          No tasks yet for this team
                        </div>
                      ) : (
                        team.tasks?.items?.map(task => (
                          <div 
                            key={task._id} 
                            className="p-3 hover:bg-gray-750 transition-colors"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-start gap-2 flex-1 min-w-0">
                                <button
                                  onClick={() => toggleTaskCompletion(team._id, task._id)}
                                  className={`mt-0.5 flex-shrink-0 ${
                                    task.completed ? "text-green-500" : "text-gray-400"
                                  }`}
                                >
                                  {task.completed ? 
                                    <FaCheckCircle size={16} /> : 
                                    <FaClock size={16} />
                                  }
                                </button>
                                <div className="flex-1 min-w-0">
                                  <h3 className={`text-sm ${
                                    task.completed ? 
                                      "text-gray-400 line-through" : 
                                      "text-gray-100"
                                  } truncate`}>
                                    {task.name}
                                  </h3>
                                  {task.description && (
                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}
                                  <div className="flex gap-2 mt-1.5">
                                    <span className="text-xs text-gray-500">
                                      {new Date(task.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setEditingTask({
                                    ...task,
                                    teamId: team._id
                                  })}
                                  className="text-blue-400 hover:text-blue-300 p-1"
                                  title="Edit task"
                                >
                                  <FaEdit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(team._id, task._id)}
                                  className="text-red-400 hover:text-red-300 p-1"
                                  title="Delete task"
                                >
                                  <FaTrash size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
  
        {/* Add Task Modal - Keep existing but make more compact */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md">
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h2 className="font-medium">Add New Task</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <FaTimes size={16} />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Select Team*</label>
                  <select
                    className="w-full text-sm bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={newTask.teamId}
                    onChange={(e) => setNewTask({...newTask, teamId: e.target.value})}
                    required
                  >
                    <option value="">Select a team</option>
                    {teams.map(team => (
                      <option key={team._id} value={team._id}>
                        {team.name} - {team.project}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Task Name*</label>
                  <input
                    type="text"
                    className="w-full text-sm bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={newTask.name}
                    onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Description</label>
                  <textarea
                    className="w-full text-sm bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={2}
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-sm text-gray-300 bg-gray-700 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-1"
                  disabled={!newTask.name || !newTask.teamId || loading.tasks}
                >
                  {loading.tasks ? <FaSpinner className="animate-spin" /> : <FaPlus size={12} />}
                  Add Task
                </button>
              </div>
            </div>
          </div>
        )}
  
        {/* Edit Task Modal - Keep existing but make more compact */}
        {editingTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md">
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h2 className="font-medium">Edit Task</h2>
                <button 
                  onClick={() => setEditingTask(null)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <FaTimes size={16} />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Task Name*</label>
                  <input
                    type="text"
                    className="w-full text-sm bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={editingTask.name}
                    onChange={(e) => setEditingTask({...editingTask, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Description</label>
                  <textarea
                    className="w-full text-sm bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={2}
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="completed"
                    checked={editingTask.completed || false}
                    onChange={(e) => setEditingTask({
                      ...editingTask, 
                      completed: e.target.checked
                    })}
                    className="h-4 w-4 text-blue-600 rounded border-gray-600 bg-gray-700 focus:ring-blue-500"
                  />
                  <label htmlFor="completed" className="text-sm text-gray-300">
                    Mark as completed
                  </label>
                </div>
              </div>
              <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
                <button
                  onClick={() => setEditingTask(null)}
                  className="px-3 py-1.5 text-sm text-gray-300 bg-gray-700 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTask}
                  className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-1"
                  disabled={!editingTask.name || loading.tasks}
                >
                  {loading.tasks ? <FaSpinner className="animate-spin" /> : <FaEdit size={12} />}
                  Update Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

export default MentorTasks;