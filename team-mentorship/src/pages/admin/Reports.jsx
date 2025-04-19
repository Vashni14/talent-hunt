import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#9ca3af', // text-gray-400
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: '#1f2937', // gray-800
        titleColor: '#f9fafb', // gray-50
        bodyColor: '#9ca3af', // gray-400
        borderColor: '#374151', // gray-700
        borderWidth: 1,
        padding: 12,
        displayColors: true,
      }
    },
    scales: {
      x: {
        grid: {
          color: '#374151', // gray-700
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af', // gray-400
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#374151', // gray-700
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af', // gray-400
          stepSize: 5,
        }
      }
    }
  };

  // Chart data
  const participationData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Teams',
        data: [12, 19, 15, 25, 22, 30],
        borderColor: '#3b82f6', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Mentors',
        data: [8, 12, 10, 15, 18, 20],
        borderColor: '#10b981', // emerald-500
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const stats = [
    {
      title: 'Total Competitions',
      value: '15',
      change: '+5%',
      isPositive: true
    },
    {
      title: 'Active Teams',
      value: '45',
      change: '+12%',
      isPositive: true
    },
    {
      title: 'Active Mentors',
      value: '25',
      change: '+8%',
      isPositive: true
    },
    {
      title: 'Success Rate',
      value: '78%',
      change: '+3%',
      isPositive: true
    }
  ];

  const departmentParticipation = [
    { name: 'Computer Science', teams: 25 },
    { name: 'Electrical Engineering', teams: 18 },
    { name: 'Mechanical Engineering', teams: 15 },
    { name: 'Civil Engineering', teams: 12 }
  ];

  const topTeams = [
    {
      name: 'Tech Innovators',
      competition: 'Hackathon 2024',
      members: 4,
      progress: 95
    },
    {
      name: 'RoboMasters',
      competition: 'Robotics Challenge',
      members: 3,
      progress: 92
    }
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Reports & Analytics</h1>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="overview">Overview</option>
            <option value="competitions">Competitions</option>
            <option value="teams">Teams</option>
            <option value="mentors">Mentors</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
            <p className="text-gray-400 text-sm">{stat.title}</p>
            <div className="flex items-baseline mt-1">
              <p className="text-xl md:text-2xl font-semibold text-white">{stat.value}</p>
              <span className={`ml-2 text-xs ${stat.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Participation Trends */}
      <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
        <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Participation Trends</h2>
        <div className="h-64 md:h-80">
          <Line options={chartOptions} data={participationData} />
        </div>
        <div className="flex gap-4 mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-400 text-sm">Teams</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
            <span className="text-gray-400 text-sm">Mentors</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Department Participation */}
        <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Department Participation</h2>
          <div className="space-y-4">
            {departmentParticipation.map((dept, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white">{dept.name}</span>
                  <span className="text-gray-400">{dept.teams} teams</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${(dept.teams / Math.max(...departmentParticipation.map(d => d.teams))) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Teams */}
        <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Top Performing Teams</h2>
          <div className="space-y-3">
            {topTeams.map((team, index) => (
              <div key={index} className="bg-gray-700/50 rounded-lg p-3 md:p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-white font-medium">{team.name}</h3>
                    <p className="text-gray-400 text-xs md:text-sm">{team.competition}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{team.progress}%</p>
                    <p className="text-gray-400 text-xs md:text-sm">{team.members} members</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${team.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h2 className="text-lg md:text-xl font-semibold text-white">Export Reports</h2>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors text-sm">
              Export as PDF
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Export as CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;