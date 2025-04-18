import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const SDG = () => {
  const [sdgStats, setSdgStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // SDG data with official colors
  const allSDGs = [
    { id: 1, name: 'No Poverty', color: '#e5243b' },
    { id: 2, name: 'Zero Hunger', color: '#DDA63A' },
    { id: 3, name: 'Good Health', color: '#4C9F38' },
    { id: 4, name: 'Quality Education', color: '#C5192D' },
    { id: 5, name: 'Gender Equality', color: '#FF3A21' },
    { id: 6, name: 'Clean Water', color: '#26BDE2' },
    { id: 7, name: 'Clean Energy', color: '#FCC30B' },
    { id: 8, name: 'Economic Growth', color: '#A21942' },
    { id: 9, name: 'Innovation', color: '#FD6925' },
    { id: 10, name: 'Reduced Inequality', color: '#DD1367' },
    { id: 11, name: 'Sustainable Cities', color: '#FD9D24' },
    { id: 12, name: 'Responsible Consumption', color: '#BF8B2E' },
    { id: 13, name: 'Climate Action', color: '#3F7E44' },
    { id: 14, name: 'Life Below Water', color: '#0A97D9' },
    { id: 15, name: 'Life on Land', color: '#56C02B' },
    { id: 16, name: 'Peace & Justice', color: '#00689D' },
    { id: 17, name: 'Partnerships', color: '#19486A' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [statsRes, activityRes] = await Promise.all([
          axios.get('http://localhost:5000/api/sdg/stats'),
          axios.get('http://localhost:5000/api/sdg/recent-activity')
        ]);
        
        setSdgStats(statsRes.data?.sdgStats || []);
        setRecentActivity(activityRes.data?.recentActivity || []);

      } catch (err) {
        console.error('Error fetching SDG data:', err);
        setError('Failed to load SDG data. Please try again later.');
        setSdgStats([]);
        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare data for the chart - using competitions as the metric
  const chartData = {
    labels: allSDGs.map(sdg => `SDG ${sdg.id}`),
    datasets: [
      {
        label: 'Number of Competitions',
        data: allSDGs.map(sdg => {
          const stat = sdgStats.find(s => s.sdgId === sdg.id);
          return stat?.competitions || 0;
        }),
        backgroundColor: allSDGs.map(sdg => `${sdg.color}80`),
        borderColor: allSDGs.map(sdg => sdg.color),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const sdg = allSDGs[context.dataIndex];
            const stat = sdgStats.find(s => s.sdgId === sdg.id);
            return `${sdg.name}: ${stat?.competitions || 0} competitions`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          precision: 0
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      }
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-700/50 text-gray-400';
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'upcoming': return 'bg-yellow-500/20 text-yellow-400';
      case 'completed': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-700/50 text-gray-400';
    }
  };

  // Calculate summary statistics
  const totalCompetitions = sdgStats.reduce((sum, stat) => sum + (stat.competitions || 0), 0);
  const totalTeams = sdgStats.reduce((sum, stat) => sum + (stat.teams || 0), 0);
  const avgCoverage = sdgStats.length > 0 
    ? Math.round(sdgStats.reduce((sum, stat) => sum + (stat.coverage || 0), 0) / sdgStats.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
        <button 
          onClick={() => window.location.reload()} 
          className="ml-4 px-3 py-1 bg-red-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-white">SDG Analysis Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-400">Total Competitions</h3>
          <p className="text-3xl font-bold text-blue-400">
            {totalCompetitions}
          </p>
          <p className="text-sm text-gray-400 mt-1">Across all SDGs</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-400">Total Teams</h3>
          <p className="text-3xl font-bold text-green-400">
            {totalTeams}
          </p>
          <p className="text-sm text-gray-400 mt-1">Participating</p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-400">Avg Coverage</h3>
          <p className="text-3xl font-bold text-purple-400">
            {avgCoverage}%
          </p>
          <p className="text-sm text-gray-400 mt-1">Across all SDGs</p>
        </div>
      </div>
      
      {/* SDG Distribution Chart */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Competitions by SDG</h2>
        <div className="h-80 md:h-96">
          {sdgStats.length > 0 ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No competition data available
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Activity Table */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 overflow-x-auto">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">SDG Goal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {recentActivity.map((activity, index) => {
                const sdg = allSDGs.find(s => s.id === activity.goal) || allSDGs[0];
                return (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                      {new Date(activity.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">{activity.action}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span 
                        className="px-2 py-1 rounded-full text-xs text-white"
                        style={{ backgroundColor: sdg.color }}
                      >
                        Goal {activity.goal}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{activity.user}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent activity found
          </div>
        )}
      </div>

      {/* SDG Goals Overview */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">SDG Goals Overview</h2>
        {sdgStats.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allSDGs.map((sdg) => {
              const stat = sdgStats.find(s => s.sdgId === sdg.id) || {
                competitions: 0,
                teams: 0,
                coverage: 0
              };
              
              return (
                <div 
                  key={sdg.id} 
                  className="bg-gray-700/30 rounded-lg overflow-hidden border border-gray-600 hover:border-blue-500/30 transition-colors"
                >
                  <div 
                    className="h-2"
                    style={{ backgroundColor: sdg.color }}
                  ></div>
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: sdg.color }}
                      >
                        {sdg.id}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{sdg.name}</h3>
                        <p className="text-xs text-gray-400">Goal {sdg.id}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-400">Competitions</p>
                        <p className="text-white">{stat.competitions}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Teams</p>
                        <p className="text-white">{stat.teams}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-gray-400 text-sm">Coverage: {stat.coverage}%</p>
                      <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${stat.coverage}%`,
                            backgroundColor: sdg.color
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No SDG data available
          </div>
        )}
      </div>
    </div>
  );
};

export default SDG;