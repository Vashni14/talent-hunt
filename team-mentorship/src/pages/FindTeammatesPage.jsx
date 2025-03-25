import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import TeammateCard from "./TeammateCard";
import Invitations from "./Invitations";
import MatchingModal from "./MatchingModal";

const FindTeammatesPage = () => {
  const { user } = useAuth();
  const [teammates, setTeammates] = useState([]);
  const [matchedTeammates, setMatchedTeammates] = useState([]);
  const [filters, setFilters] = useState({
    skills: "",
    domain: "",
    experience: "",
  });
  const [showInvitations, setShowInvitations] = useState(false);
  const [showMatchingModal, setShowMatchingModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTeammates();
  }, [filters]);

  // In your fetchTeammates function
// In your fetchTeammates function
const fetchTeammates = async () => {
  try {
    setIsLoading(true);
    const { data } = await axios.get("http://localhost:5000/api/teammates", {
      params: {
        ...filters,
        excludeUserId: user?.uid // Pass current user ID
      }
    });
    setTeammates(data);
  } catch (error) {
    console.error("Error fetching teammates:", error);
  } finally {
    setIsLoading(false);
  }
};
  // Define handleFilterChange function
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  // Define handleSearchChange function
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const getFilteredTeammates = () => {
    if (!searchQuery) return teammates;

    return teammates.filter((teammate) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        teammate.name?.toLowerCase().includes(searchLower) ||
        teammate.domain?.toLowerCase().includes(searchLower) ||
        teammate.skills?.some(skill => 
          typeof skill === 'object' 
            ? skill.name?.toLowerCase().includes(searchLower)
            : skill?.toLowerCase().includes(searchLower)
        )
      );
    });
  };

  const findMatches = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`http://localhost:5000/api/teammates/matches/${user.uid}`);
      
      if (Array.isArray(data)) {
        setMatchedTeammates(data);
        setShowMatchingModal(true);
      } else {
        console.error("Invalid response format for matches");
        setMatchedTeammates([]);
      }
    } catch (error) {
      console.error("Error finding matches:", error);
      alert("Failed to find matches. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-8">
      <h1 className="text-3xl font-bold text-teal-400 mb-6">Find Teammates</h1>

      {/* Search and Match Section */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, skills or domain..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="p-2 rounded bg-gray-700 border border-gray-600 text-white w-full"
          />
        </div>
        <button
          onClick={findMatches}
          disabled={isLoading}
          className="bg-indigo-600 px-4 py-2 rounded font-bold hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? "Finding Matches..." : "Find Automatic Matches"}
        </button>
      </div>

      {/* Filter Section */}
      <div className="mb-6 bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-teal-300 mb-3">Advanced Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-300 mb-1">Skills</label>
            <input
              type="text"
              name="skills"
              placeholder="e.g. React, Design"
              value={filters.skills}
              onChange={handleFilterChange}
              className="p-2 rounded bg-gray-700 border border-gray-600 text-white w-full"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Domain</label>
            <select
              name="domain"
              value={filters.domain}
              onChange={handleFilterChange}
              className="p-2 rounded bg-gray-700 border border-gray-600 text-white w-full"
            >
              <option value="">All Domains</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Data Science">Data Science</option>
              <option value="Machine Learning">Machine Learning</option>
              <option value="Cybersecurity">Cybersecurity</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Experience (years)</label>
            <select
              name="experience"
              value={filters.experience}
              onChange={handleFilterChange}
              className="p-2 rounded bg-gray-700 border border-gray-600 text-white w-full"
            >
              <option value="">Any Experience</option>
              <option value="1">1+ years</option>
              <option value="2">2+ years</option>
              <option value="3">3+ years</option>
              <option value="5">5+ years</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teammates List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">
            {searchQuery ? "Search Results" : "Available Teammates"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredTeammates().length > 0 ? (
              getFilteredTeammates().map((teammate) => (
                <TeammateCard 
                  key={teammate._id} 
                  teammate={teammate}
                  currentUserId={user?.uid}
                  isMatch={matchedTeammates.some(match => match._id === teammate._id)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-400 text-lg">No teammates found matching your criteria.</p>
                <button 
                  onClick={() => {
                    setFilters({ skills: "", domain: "", experience: "" });
                    setSearchQuery("");
                  }}
                  className="mt-4 text-teal-400 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Invitations Button */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button
          onClick={() => setShowInvitations(!showInvitations)}
          className="bg-teal-600 px-4 py-3 rounded-full font-bold hover:bg-teal-700 shadow-lg flex items-center gap-2"
        >
          <span className="material-icons"></span>
          {showInvitations ? "Hide Invitations" : "View Invitations"}
        </button>
      </div>

      {/* Invitations Section */}
      {showInvitations && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-end">
          <div className="bg-gray-800 w-full max-w-md h-full overflow-y-auto p-6">
            <button 
              onClick={() => setShowInvitations(false)}
              className="mb-4 text-gray-400 hover:text-white"
            >
              ← Back
            </button>
            <Invitations />
          </div>
        </div>
      )}

      {/* Matching Modal */}
      {showMatchingModal && (
        <MatchingModal 
          matchedTeammates={matchedTeammates}
          onClose={() => setShowMatchingModal(false)}
        />
      )}
    </div>
  );
};

export default FindTeammatesPage;