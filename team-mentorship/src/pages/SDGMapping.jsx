"use client"

import { useState } from "react";
import {
  FaSearch,
  FaFilter,
  FaPlus,
  FaGlobe,
  FaChartPie,
  FaInfoCircle,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaUsers
} from "react-icons/fa";

export default function SDGMapping() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSDGs, setSelectedSDGs] = useState([]);
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [selectedTeamForMapping, setSelectedTeamForMapping] = useState(null);
  const [newSDGs, setNewSDGs] = useState([]);

  // SDG data with colors and descriptions
  const allSDGs = [
    { id: 1, name: "No Poverty", color: "bg-red-600", description: "End poverty in all its forms everywhere" },
    { id: 2, name: "Zero Hunger", color: "bg-orange-500", description: "End hunger, achieve food security and improved nutrition" },
    { id: 3, name: "Good Health", color: "bg-green-600", description: "Ensure healthy lives and promote well-being for all" },
    { id: 4, name: "Quality Education", color: "bg-red-500", description: "Ensure inclusive and equitable quality education" },
    { id: 5, name: "Gender Equality", color: "bg-yellow-500", description: "Achieve gender equality and empower all women and girls" },
    { id: 6, name: "Clean Water", color: "bg-blue-500", description: "Ensure availability of water and sanitation for all" },
    { id: 7, name: "Affordable Energy", color: "bg-yellow-600", description: "Ensure access to affordable, reliable energy" },
    { id: 8, name: "Decent Work", color: "bg-red-700", description: "Promote sustained economic growth and productive employment" },
    { id: 9, name: "Innovation", color: "bg-orange-600", description: "Build resilient infrastructure and foster innovation" },
    { id: 10, name: "Reduced Inequality", color: "bg-pink-600", description: "Reduce inequality within and among countries" },
    { id: 11, name: "Sustainable Cities", color: "bg-yellow-700", description: "Make cities inclusive, safe, resilient and sustainable" },
    { id: 12, name: "Responsible Consumption", color: "bg-amber-700", description: "Ensure sustainable consumption and production patterns" },
    { id: 13, name: "Climate Action", color: "bg-green-700", description: "Take urgent action to combat climate change" },
    { id: 14, name: "Life Below Water", color: "bg-blue-600", description: "Conserve and sustainably use the oceans and marine resources" },
    { id: 15, name: "Life on Land", color: "bg-green-800", description: "Protect and promote sustainable use of terrestrial ecosystems" },
    { id: 16, name: "Peace and Justice", color: "bg-blue-700", description: "Promote peaceful and inclusive societies" },
    { id: 17, name: "Partnerships", color: "bg-indigo-600", description: "Strengthen implementation and revitalize global partnerships" }
  ];

  // Sample teams data with SDG mappings
  const [teams, setTeams] = useState([
    {
      id: "1",
      name: "Web Wizards",
      logo: "/placeholder-team.svg",
      project: "E-commerce Platform",
      description: "Building a modern e-commerce platform with sustainability features",
      sdgs: [8, 12],
      members: 3
    },
    {
      id: "2",
      name: "Data Dynamos",
      logo: "/placeholder-team.svg",
      project: "Climate Analytics",
      description: "Creating machine learning models for climate impact assessment",
      sdgs: [13, 9],
      members: 2
    },
    {
      id: "3",
      name: "EduTech Pioneers",
      logo: "/placeholder-team.svg",
      project: "Remote Learning Platform",
      description: "Developing accessible education tools for underserved communities",
      sdgs: [4, 10],
      members: 4
    },
    {
      id: "4",
      name: "Clean Water Solutions",
      logo: "/placeholder-team.svg",
      project: "Water Purification System",
      description: "Low-cost water purification for developing regions",
      sdgs: [6, 3],
      members: 3
    }
  ]);

  // Filter teams based on search and selected SDGs
  const filteredTeams = teams.filter(team => {
    const matchesSearch = 
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSDGs = 
      selectedSDGs.length === 0 || 
      selectedSDGs.some(sdg => team.sdgs.includes(sdg));

    return matchesSearch && matchesSDGs;
  });

  // Count how many teams are mapped to each SDG
  const sdgCounts = allSDGs.map(sdg => ({
    ...sdg,
    count: teams.filter(team => team.sdgs.includes(sdg.id)).length
  }));

  // Toggle SDG selection for filtering
  const toggleSDG = (sdgId) => {
    setSelectedSDGs(prev => 
      prev.includes(sdgId) ? prev.filter(id => id !== sdgId) : [...prev, sdgId]
    );
  };

  // Toggle SDG for mapping to a team
  const toggleSDGForMapping = (sdgId) => {
    setNewSDGs(prev => 
      prev.includes(sdgId) ? prev.filter(id => id !== sdgId) : [...prev, sdgId]
    );
  };

  // Toggle team expansion
  const toggleTeamExpand = (teamId) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };

  // Handle opening mapping modal for a specific team
  const handleOpenMappingModal = (team) => {
    setSelectedTeamForMapping(team);
    setNewSDGs(team.sdgs);
    setShowMappingModal(true);
  };

  // Handle mapping SDGs to a team
  const handleMapSDGs = () => {
    if (!selectedTeamForMapping) return;
    
    setTeams(teams.map(team => 
      team.id === selectedTeamForMapping.id 
        ? { ...team, sdgs: [...newSDGs] }
        : team
    ));
    
    setShowMappingModal(false);
    setNewSDGs([]);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSDGs([]);
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">SDG Mapping</h1>
          <button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={() => setShowDashboardModal(true)}
          >
            <FaGlobe /> SDG Dashboard
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-1/3 lg:w-1/4 space-y-4">
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search teams..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center mb-4">
                <FaFilter className="text-gray-400 mr-2" />
                <h2 className="text-white font-medium">Filter by SDG</h2>
                {selectedSDGs.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="ml-auto text-xs text-blue-400 hover:text-blue-300"
                  >
                    Clear all
                  </button>
                )}
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {allSDGs.map(sdg => (
                  <div 
                    key={sdg.id}
                    className={`p-2 rounded-lg cursor-pointer transition-all ${selectedSDGs.includes(sdg.id) ? 'bg-gray-700' : 'hover:bg-gray-700/50'}`}
                    onClick={() => toggleSDG(sdg.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${sdg.color}`}>
                        {sdg.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">{sdg.name}</h3>
                        <p className="text-xs text-gray-400">{sdgCounts.find(s => s.id === sdg.id)?.count || 0} teams</p>
                      </div>
                      {selectedSDGs.includes(sdg.id) && (
                        <FaCheck className="text-green-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Teams List */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <div className="space-y-4">
              {filteredTeams.length > 0 ? (
                filteredTeams.map(team => (
                  <div
                    key={team.id}
                    className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-green-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                          <img
                            src={team.logo}
                            alt={`${team.name} logo`}
                            className="w-14 h-14 rounded-lg object-cover border-2 border-green-500/30"
                          />
                          <div className="min-w-0">
                            <h3 className="font-medium text-white text-lg truncate">{team.name}</h3>
                            <p className="text-sm text-green-400 truncate">{team.project}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleTeamExpand(team.id)}
                          className="text-gray-400 hover:text-white flex-shrink-0"
                        >
                          {expandedTeamId === team.id ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                      </div>

                      {expandedTeamId === team.id && (
                        <>
                          <p className="mt-4 text-sm text-gray-300">{team.description}</p>

                          <div className="mt-4">
                            <h4 className="text-white font-medium mb-2">Mapped SDGs</h4>
                            {team.sdgs.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {team.sdgs.map(sdgId => {
                                  const sdg = allSDGs.find(s => s.id === sdgId);
                                  return sdg ? (
                                    <div 
                                      key={sdgId} 
                                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${sdg.color} text-white whitespace-nowrap max-w-full`}
                                    >
                                      <span className="truncate">SDG {sdgId}</span>
                                      <FaInfoCircle 
                                        className="flex-shrink-0 opacity-80 hover:opacity-100" 
                                        title={sdg.description}
                                      />
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            ) : (
                              <p className="text-gray-400 text-sm">No SDGs mapped yet</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="border-t border-gray-700 p-3 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <FaUsers />
                        <span>{team.members} members</span>
                      </div>
                      <button
                        className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                        onClick={() => handleOpenMappingModal(team)}
                      >
                        <FaPlus /> Map SDGs
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
                  <p className="text-gray-400">No teams found matching your criteria.</p>
                  <button
                    className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SDG Dashboard Modal */}
        {showDashboardModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-white">
                    <FaGlobe className="inline mr-2 text-blue-400" />
                    SDG Dashboard
                  </h2>
                  <button 
                    onClick={() => setShowDashboardModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="overflow-y-auto flex-1 p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* SDG Coverage */}
                  <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                    <h3 className="text-white font-medium mb-3">SDG Coverage</h3>
                    <div className="grid grid-cols-6 gap-1">
                      {allSDGs.map(sdg => (
                        <div
                          key={sdg.id}
                          className={`aspect-square rounded flex items-center justify-center text-xs font-medium ${
                            sdgCounts.find(s => s.id === sdg.id)?.count > 0
                              ? `${sdg.color} text-white`
                              : 'bg-gray-700 text-gray-500'
                          }`}
                          title={sdg.name}
                        >
                          {sdg.id}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {sdgCounts.filter(sdg => sdg.count > 0).length} of 17 SDGs covered by your teams
                    </p>
                  </div>

                  {/* Top SDGs */}
                  <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                    <h3 className="text-white font-medium mb-3">Top SDGs</h3>
                    <div className="space-y-3">
                      {sdgCounts
                        .filter(sdg => sdg.count > 0)
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 3)
                        .map(sdg => (
                          <div key={sdg.id} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${sdg.color}`}>
                              {sdg.id}
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-300">{sdg.name}</span>
                                <span className="text-white">{sdg.count} team{sdg.count !== 1 ? 's' : ''}</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                                <div 
                                  className={`h-1.5 rounded-full ${sdg.color}`}
                                  style={{ width: `${(sdg.count / Math.max(...sdgCounts.map(s => s.count))) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* All SDG Stats */}
                  <div className="md:col-span-2 bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                    <h3 className="text-white font-medium mb-3">All SDG Statistics</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-gray-400">
                        <thead>
                          <tr className="border-b border-gray-600">
                            <th className="py-2 text-left">SDG</th>
                            <th className="py-2 text-left">Name</th>
                            <th className="py-2 text-right">Teams</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sdgCounts
                            .sort((a, b) => b.count - a.count)
                            .map(sdg => (
                              <tr key={sdg.id} className="border-b border-gray-700/50">
                                <td className="py-3">
                                  <span className={`w-6 h-6 rounded-full ${sdg.color} text-white inline-flex items-center justify-center`}>
                                    {sdg.id}
                                  </span>
                                </td>
                                <td className="py-3 text-gray-300 truncate max-w-xs">{sdg.name}</td>
                                <td className="py-3 text-right">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    sdg.count > 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'
                                  }`}>
                                    {sdg.count}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SDG Mapping Modal */}
      {/* SDG Mapping Modal */}
{/* SDG Mapping Modal */}
{/* SDG Mapping Modal - Wider Version */}
{showMappingModal && selectedTeamForMapping && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-3xl p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-white">
          Map SDGs to {selectedTeamForMapping.name}
        </h2>
        <button 
          onClick={() => {
            setShowMappingModal(false);
            setNewSDGs([]);
          }}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-white font-medium mb-3">Select SDGs for this team</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto pr-2">
          {allSDGs.map(sdg => (
            <div
              key={sdg.id}
              className={`p-3 rounded-lg cursor-pointer transition-all flex items-center ${
                newSDGs.includes(sdg.id)
                  ? `${sdg.color} text-white`
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
              onClick={() => toggleSDGForMapping(sdg.id)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${
                newSDGs.includes(sdg.id) ? 'bg-white text-gray-800' : 'bg-white/10 text-white'
              } flex-shrink-0`}>
                {sdg.id}
              </div>
              <span className="font-medium flex-1 min-w-0 overflow-hidden text-ellipsis">
                {sdg.name}
              </span>
              {newSDGs.includes(sdg.id) && (
                <FaCheck className="ml-2 text-white flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
        <button
          onClick={() => {
            setShowMappingModal(false);
            setNewSDGs([]);
          }}
          className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          onClick={handleMapSDGs}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
        >
          Save Mappings
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
}