import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import TeammateCard from "./TeammateCard";
import Invitations from "./Invitations";
import Chat from "./Chat";

const FindTeammatesPage = () => {
  const { user } = useAuth();
  const [teammates, setTeammates] = useState([]); // Default to an empty array
  const [filters, setFilters] = useState({
    skills: "",
    domain: "",
    experience: "",
  });
  const [showInvitations, setShowInvitations] = useState(false);

  useEffect(() => {
    fetchTeammates();
  }, [filters]);

  const fetchTeammates = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/teammates", { params: filters });
  
      console.log("Backend Response:", data); // Debugging
  
      if (Array.isArray(data)) {
        setTeammates(data);
      } else {
        console.error("Invalid response format: Expected an array");
        setTeammates([]); // Set to empty array to avoid errors
      }
    } catch (error) {
      console.error("Error fetching teammates:", error);
      alert("Failed to fetch teammates. Please try again later.");
      setTeammates([]);
    }
  };
  

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-8">
      <h1 className="text-3xl font-bold text-teal-400 mb-6">Find Teammates</h1>

      {/* Filter Section */}
      <div className="mb-6">
        <input
          type="text"
          name="skills"
          placeholder="Filter by skills"
          value={filters.skills}
          onChange={handleFilterChange}
          className="p-2 rounded bg-gray-700 border border-gray-600 text-white mr-2"
        />
        <input
          type="text"
          name="domain"
          placeholder="Filter by domain"
          value={filters.domain}
          onChange={handleFilterChange}
          className="p-2 rounded bg-gray-700 border border-gray-600 text-white mr-2"
        />
        <input
          type="number"
          name="experience"
          placeholder="Filter by experience"
          value={filters.experience}
          onChange={handleFilterChange}
          className="p-2 rounded bg-gray-700 border border-gray-600 text-white"
        />
      </div>

      {/* Teammates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teammates.length > 0 ? (
          teammates.map((teammate) => (
            <TeammateCard key={teammate._id} teammate={teammate} />
          ))
        ) : (
          <p className="text-gray-300">No teammates found.</p>
        )}
      </div>

      {/* Invitations Button */}
      <button
        onClick={() => setShowInvitations(!showInvitations)}
        className="mt-6 bg-teal-500 px-4 py-2 rounded font-bold hover:bg-teal-600"
      >
        {showInvitations ? "Hide Invitations" : "View Invitations"}
      </button>

      {/* Invitations Section */}
      {showInvitations && <Invitations />}

      {/* Chat Section */}
      <Chat />
    </div>
  );
};

export default FindTeammatesPage;