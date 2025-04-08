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
        return 'bg-[#1b5e20] text-[#4CAF50]';
      case 'Pending':
        return 'bg-[#f57f17] text-[#FFC107]';
      case 'Rejected':
        return 'bg-[#b71c1c] text-[#f44336]';
      default:
        return 'bg-gray-700 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Teams</h1>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Competition</label>
            <select
              name="competition"
              value={filters.competition}
              onChange={handleFilterChange}
              className="w-full bg-[#2a2a2a] text-white rounded-lg p-2 border border-[#404040]"
            >
              <option value="">All Competitions</option>
              <option value="Hackathon 2024">Hackathon 2024</option>
              <option value="Robotics Challenge">Robotics Challenge</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full bg-[#2a2a2a] text-white rounded-lg p-2 border border-[#404040]"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search teams or members..."
              className="w-full bg-[#2a2a2a] text-white rounded-lg p-2 border border-[#404040] placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        {filteredTeams.map((team) => (
          <div key={team.id} className="bg-[#242424] rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{team.name}</h3>
                <p className="text-gray-400">{team.competition}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(team.status)}`}>
                  {team.status}
                </span>
                <button
                  onClick={() => handleStatusChange(team.id, 'Approved')}
                  className="text-[#f44336] hover:text-[#d32f2f] transition-colors duration-200"
                  disabled={team.status === 'Approved'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={() => handleStatusChange(team.id, 'Rejected')}
                  className="text-[#f44336] hover:text-[#d32f2f] transition-colors duration-200"
                  disabled={team.status === 'Rejected'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-4">
              <div>
                <h4 className="text-white mb-2">Team Members</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {team.members.map((member) => (
                    <div key={member.id} className="bg-[#2a2a2a] rounded-lg p-4">
                      <p className="text-white font-medium">{member.name}</p>
                      <p className="text-gray-400 text-sm">{member.role}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {member.skills.map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="px-2 py-1 bg-[#404040] text-gray-400 rounded text-xs"
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
                <p className="text-white mb-2">Progress</p>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-gray-400">
                        {team.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="flex h-2 overflow-hidden bg-[#2a2a2a] rounded">
                    <div
                      style={{ width: `${team.progress}%` }}
                      className="bg-[#2196F3]"
                    />
                  </div>
                </div>
              </div>

              {/* Mentor Info */}
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-gray-400">Mentor: {team.mentor}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teams; 