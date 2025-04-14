import React, { useState } from 'react';
import { FaCheck, FaEllipsisV, FaPlus, FaSort } from 'react-icons/fa';

const SDG = () => {
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [selectedSDGs, setSelectedSDGs] = useState([]);

  // Mock data for SDGs with official colors
  const sdgs = [
    { id: 1, title: 'No Poverty', color: 'bg-[#E5243B]' },
    { id: 2, title: 'Zero Hunger', color: 'bg-[#DDA63A]' },
    { id: 3, title: 'Good Health', color: 'bg-[#4C9F38]' },
    { id: 4, title: 'Quality Education', color: 'bg-[#C5192D]' },
    { id: 5, title: 'Gender Equality', color: 'bg-[#FF3A21]' },
    { id: 6, title: 'Clean Water', color: 'bg-[#26BDE2]' },
    { id: 7, title: 'Clean Energy', color: 'bg-[#FCC30B]' },
    { id: 8, title: 'Economic Growth', color: 'bg-[#A21942]' },
    { id: 9, title: 'Innovation', color: 'bg-[#FD6925]' },
    { id: 10, title: 'Reduced Inequalities', color: 'bg-[#DD1367]' },
    { id: 11, title: 'Sustainable Cities', color: 'bg-[#FD9D24]' },
    { id: 12, title: 'Responsible Consumption', color: 'bg-[#BF8B2E]' },
    { id: 13, title: 'Climate Action', color: 'bg-[#3F7E44]' },
    { id: 14, title: 'Life Below Water', color: 'bg-[#0A97D9]' },
    { id: 15, title: 'Life on Land', color: 'bg-[#56C02B]' },
    { id: 16, title: 'Peace & Justice', color: 'bg-[#00689D]' },
    { id: 17, title: 'Partnerships', color: 'bg-[#19486A]' },
  ];

  // Mock data for competitions
  const competitions = [
    {
      id: 1,
      name: 'Hackathon 2024',
      mappedSDGs: [1, 4, 9],
      impact: {
        description: 'Developing solutions for education access and poverty alleviation',
        metrics: {
          studentsReached: 1000,
          communitiesImpacted: 5,
          partnerships: 3,
        },
      },
    },
    {
      id: 2,
      name: 'Robotics Challenge',
      mappedSDGs: [7, 9, 13],
      impact: {
        description: 'Creating sustainable energy solutions and smart infrastructure',
        metrics: {
          studentsReached: 500,
          communitiesImpacted: 3,
          partnerships: 2,
        },
      },
    },
  ];

  const handleSDGSelection = (sdgId) => {
    setSelectedSDGs(prev => {
      if (prev.includes(sdgId)) {
        return prev.filter(id => id !== sdgId);
      } else {
        return [...prev, sdgId];
      }
    });
  };

  const handleSaveMapping = () => {
    // Here you would typically make an API call to save the SDG mapping
    console.log('Saving SDG mapping:', {
      competitionId: selectedCompetition,
      sdgIds: selectedSDGs,
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-3 md:p-5 lg:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">SDG Mapping</h1>
              <p className="mt-2 text-gray-400">Map competitions to Sustainable Development Goals and track their impact</p>
            </div>
            <button
              onClick={handleSaveMapping}
              disabled={!selectedCompetition || selectedSDGs.length === 0}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save Mapping
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Competition Selection */}
            <div className="lg:col-span-4">
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 sticky top-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Select Competition</h2>
                  <select
                    value={selectedCompetition || ''}
                    onChange={(e) => setSelectedCompetition(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select a competition</option>
                    {competitions.map((competition) => (
                      <option key={competition.id} value={competition.id}>
                        {competition.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Impact Tracking */}
                {selectedCompetition && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-4">Impact Tracking</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Impact Description</label>
                        <textarea
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-blue-500"
                          rows="3"
                          placeholder="Describe the impact of this competition on the selected SDGs..."
                        ></textarea>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                          <label className="block text-sm font-medium text-gray-400 mb-1">Students Reached</label>
                          <input
                            type="number"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                          <label className="block text-sm font-medium text-gray-400 mb-1">Communities Impacted</label>
                          <input
                            type="number"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                          <label className="block text-sm font-medium text-gray-400 mb-1">Partnerships Formed</label>
                          <input
                            type="number"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - SDG Grid and Existing Mappings */}
            <div className="lg:col-span-8 space-y-6">
              {/* SDG Grid */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Select SDGs</h2>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-400">
                      {selectedSDGs.length} selected
                    </span>
                    <button className="text-sm text-blue-400 hover:text-blue-300">
                      View All SDGs
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {sdgs.map((sdg) => (
                    <div
                      key={sdg.id}
                      onClick={() => handleSDGSelection(sdg.id)}
                      className={`p-4 rounded-lg cursor-pointer transition-all border ${
                        selectedSDGs.includes(sdg.id)
                          ? `${sdg.color} text-white border-transparent shadow-md`
                          : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">SDG {sdg.id}</span>
                        {selectedSDGs.includes(sdg.id) && (
                          <FaCheck className="w-4 h-4" />
                        )}
                      </div>
                      <p className="mt-2 text-sm text-gray-300">{sdg.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Existing Mappings */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Existing SDG Mappings</h2>
                  <div className="flex items-center space-x-4">
                    <button className="text-gray-400 hover:text-white">
                      <FaSort className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-white">
                      <FaPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {competitions.map((competition) => (
                    <div key={competition.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white">{competition.name}</h3>
                        <div className="flex items-center space-x-4">
                          <div className="flex flex-wrap gap-2">
                            {competition.mappedSDGs.map((sdgId) => {
                              const sdg = sdgs.find(s => s.id === sdgId);
                              return (
                                <span
                                  key={sdgId}
                                  className={`px-3 py-1 rounded-full text-xs font-medium text-white ${sdg.color}`}
                                >
                                  SDG {sdgId}
                                </span>
                              );
                            })}
                          </div>
                          <button className="text-gray-400 hover:text-white">
                            <FaEllipsisV className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-400 mb-3">Impact Metrics</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                            <p className="text-xs text-gray-400 mb-1">Students Reached</p>
                            <p className="text-lg font-semibold text-white">{competition.impact.metrics.studentsReached}</p>
                          </div>
                          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                            <p className="text-xs text-gray-400 mb-1">Communities Impacted</p>
                            <p className="text-lg font-semibold text-white">{competition.impact.metrics.communitiesImpacted}</p>
                          </div>
                          <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                            <p className="text-xs text-gray-400 mb-1">Partnerships</p>
                            <p className="text-lg font-semibold text-white">{competition.impact.metrics.partnerships}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SDG;