import React, { useState } from 'react';

const Competitions = () => {
  const [competitions, setCompetitions] = useState([
    {
      id: 1,
      name: 'Hackathon 2024',
      category: 'Software Development',
      date: '2024-05-01 - 2024-05-03',
      teams: '15/30',
      status: 'Active',
      requirements: ['Web Development', 'Mobile Development', 'UI/UX Design']
    },
    {
      id: 2,
      name: 'Robotics Challenge',
      category: 'Hardware',
      date: '2024-06-15 - 2024-06-17',
      teams: '8/20',
      status: 'Upcoming',
      requirements: ['Electronics', 'Mechanical Design', 'Programming']
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    date: '',
    teams: '',
    status: '',
    requirements: '',
  });

  const handleCreateCompetition = () => {
    setSelectedCompetition(null);
    setFormData({
      name: '',
      category: '',
      date: '',
      teams: '',
      status: '',
      requirements: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCompetition = {
      id: competitions.length + 1,
      ...formData,
      teams: formData.teams,
      requirements: formData.requirements.split(',').map(req => req.trim()),
    };
    setCompetitions([...competitions, newCompetition]);
    setIsModalOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/20 text-green-400';
      case 'Upcoming':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Completed':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-700/50 text-gray-400';
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Competitions</h1>
        <button
          onClick={handleCreateCompetition}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
        >
          Create Competition
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {competitions.map((competition) => (
          <div key={competition.id} className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-white">{competition.name}</h3>
                <p className="text-gray-400 text-sm">{competition.category}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(competition.status)}`}>
                {competition.status}
              </span>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex items-center text-sm text-gray-400">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {competition.date}
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Teams: {competition.teams}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-white mb-2">Requirements:</p>
              <div className="flex flex-wrap gap-2">
                {competition.requirements.map((req, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded-md text-xs"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                Edit
              </button>
              <button className="text-red-400 hover:text-red-300 text-sm transition-colors">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              {selectedCompetition ? 'Edit Competition' : 'Create New Competition'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Software Development">Software Development</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Research">Research</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                    placeholder="YYYY-MM-DD - YYYY-MM-DD"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Teams</label>
                  <input
                    type="text"
                    value={formData.teams}
                    onChange={(e) => setFormData({ ...formData, teams: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                    placeholder="15/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Requirements (comma-separated)</label>
                <input
                  type="text"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Web Development, UI/UX Design, etc."
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {selectedCompetition ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Competitions;