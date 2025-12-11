import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const SDG = () => {
  const [sdgStats, setSdgStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('competitions'); // 'competitions' or 'teams'

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
        
        const response = await axios.get('https://talent-hunt-3.onrender.com/api/sdgadmin/stats');
        
        if (response.data?.data?.sdgStats) {
          setSdgStats(response.data.data.sdgStats);
        } else {
          throw new Error('Unexpected API response structure');
        }

      } catch (err) {
        console.error('Error fetching SDG data:', err);
        setError('Failed to load SDG data. Please try again later.');
        setSdgStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare chart data based on view mode
  const chartData = {
    labels: allSDGs.map(sdg => `SDG ${sdg.id}`),
    datasets: [
      {
        label: viewMode === 'competitions' ? 'Number of Competitions' : 'Number of Teams',
        data: allSDGs.map(sdg => {
          const stat = sdgStats.find(s => s.sdgId === sdg.id);
          return viewMode === 'competitions' ? (stat?.competitions || 0) : (stat?.teams || 0);
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
            return `${sdg.name}: ${context.dataset.label === 'Number of Competitions' 
              ? (stat?.competitions || 0) 
              : (stat?.teams || 0)}`;
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
      
      {/* Chart Section with Toggle */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            {viewMode === 'competitions' ? 'Competitions by SDG' : 'Teams by SDG'}
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">View:</span>
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setViewMode('competitions')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  viewMode === 'competitions'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Competitions
              </button>
              <button
                type="button"
                onClick={() => setViewMode('teams')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  viewMode === 'teams'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Teams
              </button>
            </div>
          </div>
        </div>
        
        <div className="h-80 md:h-96">
          {sdgStats.length > 0 ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No data available
            </div>
          )}
        </div>
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