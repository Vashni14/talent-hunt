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
    // Here you would typically make an API call to save the competition
    const newCompetition = {
      id: competitions.length + 1,
      ...formData,
      teams: formData.teams.split('/').map(Number),
      requirements: formData.requirements.split(',').map(req => req.trim()),
    };
    setCompetitions([...competitions, newCompetition]);
    setIsModalOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-[#1b5e20] text-[#4CAF50]';
      case 'Upcoming':
        return 'bg-[#f57f17] text-[#FFC107]';
      case 'Completed':
        return 'bg-[#0d47a1] text-[#2196F3]';
      default:
        return 'bg-gray-700 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Competitions</h1>
        <button
          onClick={handleCreateCompetition}
          className="px-4 py-2 bg-[#2196F3] text-white rounded-lg hover:bg-[#1976D2] transition-colors duration-200"
        >
          Create Competition
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {competitions.map((competition) => (
          <div key={competition.id} className="bg-[#242424] rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-white">{competition.name}</h3>
                <p className="text-gray-400">{competition.category}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(competition.status)}`}>
                {competition.status}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-gray-400">Date: {competition.date}</p>
              <p className="text-gray-400">Teams: {competition.teams}</p>
            </div>

            <div>
              <p className="text-white mb-2">Requirements:</p>
              <div className="flex flex-wrap gap-2">
                {competition.requirements.map((req, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#2a2a2a] text-gray-400 rounded-lg text-sm"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button className="text-[#2196F3] hover:text-[#1976D2] transition-colors duration-200">
                Edit
              </button>
              <button className="text-[#f44336] hover:text-[#d32f2f] transition-colors duration-200">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">
              {selectedCompetition ? 'Edit Competition' : 'Create New Competition'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="YYYY-MM-DD - YYYY-MM-DD"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teams</label>
                  <input
                    type="text"
                    value={formData.teams}
                    onChange={(e) => setFormData({ ...formData, teams: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="15/30"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700">Requirements (comma-separated)</label>
                <input
                  type="text"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Web Development, UI/UX Design, etc."
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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