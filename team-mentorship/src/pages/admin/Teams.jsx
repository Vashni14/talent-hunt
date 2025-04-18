import React, { useState } from 'react';

const Teams = () => {
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: 'Tech Innovators',
      competition: 'Hackathon 2024',
      members: [
        { id: 1, name: 'John Doe', role: 'Team Leader', skills: ['Web Development', 'UI/UX'] },
        { id: 2, name: 'Jane Smith', role: 'Developer', skills: ['Backend', 'Database'] },
        { id: 3, name: 'Mike Johnson', role: 'Designer', skills: ['UI/UX', 'Frontend'] },
      ],
      status: 'Pending',
      mentor: 'Dr. Sarah Williams',
      progress: 30,
    },
    {
      id: 2,
      name: 'RoboMasters',
      competition: 'Robotics Challenge',
      members: [
        { id: 4, name: 'Alex Brown', role: 'Team Leader', skills: ['Electronics', 'Programming'] },
        { id: 5, name: 'Emily Davis', role: 'Hardware', skills: ['Mechanical Design', 'CAD'] },
        { id: 6, name: 'Chris Wilson', role: 'Software', skills: ['Embedded Systems', 'Python'] },
      ],
      status: 'Approved',
      mentor: 'Prof. Robert Chen',
      progress: 45,
    },
  ]);

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    competition: '',
    status: '',
    search: '',
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleStatusChange = (teamId, newStatus) => {
    setTeams(teams.map(team => 
      team.id === teamId ? { ...team, status: newStatus } : team
    ));
  };

  const filteredTeams = teams.filter(team => {
    const matchesCompetition = !filters.competition || team.competition === filters.competition;
    const matchesStatus = !filters.status || team.status === filters.status;
    const matchesSearch = !filters.search || 
      team.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      team.members.some(member => member.name.toLowerCase().includes(filters.search.toLowerCase()));
    
    return matchesCompetition && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-500/20 text-green-400';
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-700/50 text-gray-400';
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Teams</h1>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Competition</label>
            <select
              name="competition"
              value={filters.competition}
              onChange={handleFilterChange}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="">All Competitions</option>
              <option value="Hackathon 2024">Hackathon 2024</option>
              <option value="Robotics Challenge">Robotics Challenge</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search teams or members..."
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:ring-blue-500 placeholder-gray-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        {filteredTeams.map((team) => (
          <div key={team.id} className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-white">{team.name}</h3>
                <p className="text-gray-400 text-sm">{team.competition}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(team.status)}`}>
                  {team.status}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(team.id, 'Approved')}
                    className={`p-1 rounded-md ${team.status === 'Approved' ? 'text-green-400' : 'text-gray-400 hover:text-green-400'} transition-colors`}
                    disabled={team.status === 'Approved'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleStatusChange(team.id, 'Rejected')}
                    className={`p-1 rounded-md ${team.status === 'Rejected' ? 'text-red-400' : 'text-gray-400 hover:text-red-400'} transition-colors`}
                    disabled={team.status === 'Rejected'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-4">
              <div>
                <h4 className="text-white text-sm font-medium mb-3">Team Members</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {team.members.map((member) => (
                    <div key={member.id} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                      <p className="text-white font-medium text-sm">{member.name}</p>
                      <p className="text-gray-400 text-xs">{member.role}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {member.skills.map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="px-2 py-1 bg-gray-600 text-gray-300 rounded-md text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Progress */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-white text-sm font-medium">Progress</h4>
                  <span className="text-xs text-gray-400">{team.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${team.progress}%` }}
                  />
                </div>
              </div>

              {/* Mentor Info */}
              <div className="flex items-center text-sm">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-gray-400">Mentor: <span className="text-white">{team.mentor}</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teams;