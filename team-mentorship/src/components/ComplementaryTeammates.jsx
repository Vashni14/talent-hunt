"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FaSearch,
  FaUsers,
  FaLightbulb,
  FaCode,
  FaPython,
  FaJs,
} from "react-icons/fa";
import axios from "axios";

const skillIcons = {
  python: <FaPython className="text-blue-400" />,
  javascript: <FaJs className="text-yellow-400" />,
  react: <FaCode className="text-blue-500" />,
  nodejs: <FaCode className="text-green-500" />,
  html: <FaCode className="text-orange-500" />,
  css: <FaCode className="text-purple-500" />,
  java: <FaCode className="text-red-500" />,
  csharp: <FaCode className="text-teal-500" />,
  ruby: <FaCode className="text-pink-500" />,
  php: <FaCode className="text-gray-500" />,
  go: <FaCode className="text-green-400" />,
  swift: <FaCode className="text-orange-400" />,
};

export default function ComplementaryTeammates() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [error, setError] = useState(null);
  const DJANGO_URL = "http://127.0.0.1:8000";

  const filterOutCurrentUser = (data) => {
    if (!user?.uid || !data) return data;
    
    // Filter similar_users array
    const filteredSimilarUsers = (data.similar_users || []).filter(
      (teammate) => teammate.user_id !== user.uid
    );
    
    // Filter by_skill object
    const filteredBySkill = {};
    Object.entries(data.by_skill || {}).forEach(([skill, teammates]) => {
      filteredBySkill[skill] = teammates.filter(
        (teammate) => teammate.user_id !== user.uid
      );
    });
    
    return {
      ...data,
      similar_users: filteredSimilarUsers,
      by_skill: filteredBySkill,
    };
  };

  const fetchRecommendations = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);

      // Get profile
      const profileRes = await axios.get(
        `${DJANGO_URL}/api/student-profile/${user.uid}/` // Note trailing slash
      );

      // Process skills
      let userSkills = [];
      if (profileRes.data?.skills) {
        userSkills = profileRes.data.skills
          .map((skill) => {
            if (typeof skill === "object")
              return skill.name || skill.skill || null;
            if (typeof skill === "string") return skill;
            return null;
          })
          .filter((skill) => skill)
          .map((skill) => skill.toLowerCase().trim());
      }

      // Get recommendations
      const recRes = await axios.post(
        `${DJANGO_URL}/api/find-complementary-teammates`, // No trailing slash
        {
          userId: user.uid,
          skills: userSkills,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const filteredResults = filterOutCurrentUser({
        by_skill: recRes.data.by_skill || {},
        similar_users: recRes.data.similar_users || [],
      });

      setResults(filteredResults);
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg text-red-400">
        Error: {error}
        <button
          onClick={fetchRecommendations}
          className="ml-4 px-3 py-1 bg-blue-600 text-white rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaLightbulb className="text-yellow-400" /> AI-Powered Teammate
        Recommendations
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Skill Matches */}
        <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaCode /> Complementary Skills Matches
          </h3>

          <div className="space-y-4">
            {Object.entries(results.by_skill || {}).map(
              ([skill, teammates]) => (
                <div
                  key={skill}
                  className="border-b border-gray-700 pb-4 last:border-0"
                >
                  <button
                    onClick={() =>
                      setSelectedSkill(selectedSkill === skill ? null : skill)
                    }
                    className="flex justify-between items-center w-full text-left group"
                  >
                    <span className="flex items-center gap-2 font-medium capitalize">
                      {skillIcons[skill.toLowerCase()] || <FaCode />}
                      {skill}
                    </span>
                    <span className="text-sm text-gray-400 group-hover:text-white transition">
                      {teammates.length} matches
                    </span>
                  </button>

                  {selectedSkill === skill && (
                    <div className="mt-3 space-y-3">
                      {(teammates || []).map((teammate) => (
                        <div
                          key={teammate.user_id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-700/50 rounded-lg transition"
                        >
                          <img
                            src={
                              teammate.profile_picture || "/default-profile.png"
                            }
                            alt={teammate.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-600"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {teammate.name}
                            </p>
                            <p className="text-sm text-gray-400 truncate">
                              {teammate.matching_skills?.join(", ") ||
                                "No matching skills"}
                            </p>
                          </div>
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                            {teammate.role_preference || "No role"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* Similar Users */}
        <div className="bg-gray-800 p-5 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaUsers /> Similar Teammates
          </h3>

          <div className="space-y-4">
            {(results.similar_users || []).map((user) => (
              <div
                key={user.user_id}
                className="flex items-center gap-4 p-3 hover:bg-gray-700/50 rounded-lg transition"
              >
                <img
                  src={user.profile_picture || "/default-profile.png"}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-600"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-sm text-gray-400 truncate">
                        {user.role_preference || "No role"}
                      </p>
                    </div>
                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                      {Math.round((user.similarity_score || 0) * 100)}% match
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {(user.skills || []).slice(0, 3).map((skill, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {(user.skills || []).length > 3 && (
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                        +{(user.skills || []).length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
