import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../config/firebase";
import { FaTrash, FaEdit, FaSave, FaCheckCircle, FaUndoAlt } from "react-icons/fa";

function AddGoals() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [total, setTotal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [goals, setGoals] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedTotal, setEditedTotal] = useState("");
  const [editedDeadline, setEditedDeadline] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      fetchGoals();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/goals/${user.uid}`);
      const sortedGoals = data.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      setGoals(sortedGoals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      alert("❌ Error fetching goals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted"); // Debugging
  
    if (isSubmitting) return; // Prevent multiple submissions
    setIsSubmitting(true);
  
    if (!title || !total || !deadline) {
      alert("Please enter goal title, total tasks, and deadline.");
      setIsSubmitting(false); // Re-enable the button
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/api/goals", {
        userId: user.uid,
        title,
        total: parseInt(total),
        completed: 0,
        deadline,
      });
  
      console.log("API Response:", response.data); // Debugging
  
      if (response.data._id) {
        // If the response contains the newly added goal object
        alert("✅ Goal added successfully!");
  
        // Use functional update to ensure you're working with the latest state
        setGoals((prevGoals) => {
          console.log("Previous Goals:", prevGoals); // Debugging
          const updatedGoals = [...prevGoals, response.data];
          return updatedGoals.sort((a, b) => new Date(a.deadline) - new Date(b.deadline)); // Sort goals by deadline
        });
  
        // Reset form fields
        setTitle("");
        setTotal("");
        setDeadline("");
      } else {
        alert("❌ Error: Goal not added. Please try again.");
      }
    } catch (error) {
      console.error("Error adding goal:", error.response?.data || error);
      alert("❌ Error adding goal.");
    } finally {
      setIsSubmitting(false); // Re-enable the button
    }
  };

  const handleDelete = async (goalId) => {
    try {
      await axios.delete(`http://localhost:5000/api/goals/${goalId}`);
      alert("❌ Goal deleted!");
      setGoals((prevGoals) => prevGoals.filter((goal) => goal._id !== goalId));
    } catch (error) {
      console.error("Error deleting goal:", error);
      alert("❌ Error deleting goal.");
    }
  };

  const handleEdit = (goal) => {
    console.log("Editing Goal:", goal); // Debugging
    setEditingId(goal._id);
    setEditedTitle(goal.title);
    setEditedTotal(goal.total.toString());
    setEditedDeadline(goal.deadline);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/goals/${editingId}`, {
        title: editedTitle,
        total: parseInt(editedTotal),
        deadline: editedDeadline,
      });

      console.log("Backend Response:", response.data); // Debugging

      alert("✅ Goal updated successfully!");
      await fetchGoals(); // Fetch updated goals
      setEditingId(null); // Exit edit mode
    } catch (error) {
      console.error("Error updating goal:", error);
      alert("❌ Error updating goal.");
    }
  };

  const markTaskCompleted = async (goal) => {
    if (goal.completed < goal.total) {
      try {
        const updatedGoal = { ...goal, completed: goal.completed + 1 };
        await axios.put(`http://localhost:5000/api/goals/${goal._id}`, updatedGoal);
        setGoals((prevGoals) =>
          prevGoals.map((g) => (g._id === goal._id ? updatedGoal : g))
        );
      } catch (error) {
        console.error("Error updating goal:", error);
        alert("❌ Error updating goal.");
      }
    }
  };

  const undoTaskCompleted = async (goal) => {
    if (goal.completed > 0) {
      try {
        const updatedGoal = { ...goal, completed: goal.completed - 1 };
        await axios.put(`http://localhost:5000/api/goals/${goal._id}`, updatedGoal);
        setGoals((prevGoals) =>
          prevGoals.map((g) => (g._id === goal._id ? updatedGoal : g))
        );
      } catch (error) {
        console.error("Error undoing task:", error);
        alert("❌ Error undoing task.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-6 py-10">
      <h2 className="text-3xl font-bold text-teal-400 text-center mb-6">
        "Your goals shape your future. Keep pushing forward!"
      </h2>

      <div className="w-full max-w-4xl bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-teal-400 text-center">🎯 Manage Your Goals</h2>

        {/* Add Goal Form */}
        <form onSubmit={handleSubmit} className="mt-6">
          <input
            type="text"
            placeholder="Goal Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white"
          />
          <input
            type="number"
            min="1"
            placeholder="Total Tasks"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white mt-3"
          />
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white mt-3"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 bg-teal-500 px-4 py-2 rounded font-bold hover:bg-teal-600 w-full"
          >
            {isSubmitting ? "Adding..." : "Add Goal"}
          </button>
        </form>

        {/* Goals List */}
        <ul className="mt-6 space-y-3">
          {goals.map((goal) => (
            <li key={goal._id} className="bg-gray-700 p-4 rounded-lg flex flex-col">
              {editingId === goal._id ? (
                // Edit Form
                <div className="w-full">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full p-2 rounded bg-gray-600 border border-gray-500 text-white mb-2"
                  />
                  <input
                    type="number"
                    min="1"
                    value={editedTotal}
                    onChange={(e) => setEditedTotal(e.target.value)}
                    className="w-full p-2 rounded bg-gray-600 border border-gray-500 text-white mb-2"
                  />
                  <input
                    type="date"
                    value={editedDeadline}
                    onChange={(e) => setEditedDeadline(e.target.value)}
                    className="w-full p-2 rounded bg-gray-600 border border-gray-500 text-white mb-2"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveEdit}
                      className="bg-green-500 px-3 py-1 rounded font-bold hover:bg-green-600"
                    >
                      <FaSave />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-500 px-3 py-1 rounded font-bold hover:bg-gray-600"
                    >
                      <FaUndoAlt />
                    </button>
                  </div>
                </div>
              ) : (
                // Display Goal
                <div className="w-full flex justify-between items-center">
                  <div className="w-full">
                    <p className="text-white font-medium">
                      {goal.title} (Tasks: {goal.completed}/{goal.total})
                    </p>
                    <p className="text-sm text-gray-300">
                      📅 {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                    <div className="w-full bg-gray-600 rounded-full h-2 mt-3">
                      <div
                        className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(goal.completed / goal.total) * 100}%`, maxWidth: "100%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => markTaskCompleted(goal)}
                      className="text-green-400 hover:text-green-300"
                    >
                      <FaCheckCircle />
                    </button>
                    <button
                      onClick={() => undoTaskCompleted(goal)}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      <FaUndoAlt />
                    </button>
                    <button
                      onClick={() => handleDelete(goal._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        <button onClick={() => navigate("/student/dashboard")} className="mt-6 bg-teal-400 px-4 py-2 rounded font-bold hover:bg-teal-700 w-full">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default AddGoals;