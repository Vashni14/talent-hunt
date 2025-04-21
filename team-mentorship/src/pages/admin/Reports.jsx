import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  PieController,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { 
  FaTrophy, 
  FaUsers, 
  FaUserGraduate, 
  FaChartLine,
  FaFilePdf,
  FaPrint,
  FaCalendarAlt,
  FaTasks,
  FaMedal,
  FaAward,
  FaChartBar,
  FaHandsHelping,
  FaGlobe,
  FaLightbulb,
  FaUserTie,
  FaUserFriends,
  FaRegChartBar,
  FaCheckCircle,
  FaPercentage,
  FaChevronDown
} from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  PieController,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const StatsDashboard = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [expandedSection, setExpandedSection] = useState('participation');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:5000/api/reports/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        
        if (data.success) {
          setStats(data.data);
        } else {
          throw new Error(data.message || 'Failed to load dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Generate PDF function
  const generatePDF = () => {
    alert('PDF generation would be implemented here. In a real app, this would export the dashboard as a PDF.');
  };

  // Chart data configurations
  const participationTrendsData = {
    labels: stats?.participation.monthlyLabels || [],
    datasets: [
      {
        label: 'Students',
        data: stats?.participation.monthlyStudents || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Mentors',
        data: stats?.participation.monthlyMentors || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const domainParticipationData = {
    labels: stats?.participation.byDomain ? Object.keys(stats.participation.byDomain) : [],
    datasets: [{
      label: 'Students by Domain',
      data: stats?.participation.byDomain ? Object.values(stats.participation.byDomain) : [],
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)'
      ]
    }]
  };

  const sdgEngagementData = {
    labels: stats?.sdgs.top.map(sdg => `SDG ${sdg._id}`) || [],
    datasets: [{
      label: 'SDG Engagement',
      data: stats?.sdgs.top.map(sdg => sdg.count) || [],
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(255, 99, 132, 0.6)'
      ]
    }]
  };

  const topSkillsData = {
    labels: stats?.skills.top.map(skill => skill._id) || [],
    datasets: [{
      label: 'Top Skills',
      data: stats?.skills.top.map(skill => skill.count) || [],
      backgroundColor: [
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)'
      ]
    }]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#9ca3af',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f9fafb',
        bodyColor: '#9ca3af',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
      }
    },
    scales: {
      x: {
        grid: {
          color: '#374151',
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af',
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#374151',
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af',
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-900 min-h-screen">
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Platform Analytics Dashboard</h1>
          <p className="text-gray-400">Comprehensive overview of platform engagement and performance</p>
        </div>
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
          <button 
            onClick={generatePDF}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
          >
            <FaFilePdf /> PDF
          </button>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
          >
            <FaPrint /> Print
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard 
          icon={<FaUserGraduate className="text-blue-400" />}
          title="Total Students"
          value={stats.totals.students.toLocaleString()}
          change={`+${stats.growth.students}%`}
          isPositive={stats.growth.students >= 0}
        />
        <MetricCard 
          icon={<FaUserTie className="text-purple-400" />}
          title="Active Mentors"
          value={stats.totals.mentors.toLocaleString()}
          change={`+${stats.growth.mentors}%`}
          isPositive={stats.growth.mentors >= 0}
        />
        <MetricCard 
          icon={<FaUsers className="text-green-400" />}
          title="Active Teams"
          value={stats.totals.teams.toLocaleString()}
          change={`+${stats.growth.teams}%`}
          isPositive={stats.growth.teams >= 0}
        />
        <MetricCard 
          icon={<FaTrophy className="text-yellow-400" />}
          title="Competitions"
          value={stats.totals.competitions.toLocaleString()}
          change={`+${stats.growth.competitions}%`}
          isPositive={stats.growth.competitions >= 0}
        />
      </div>

      {/* Participation Trends Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div 
          className="flex justify-between items-center p-4 md:p-6 cursor-pointer hover:bg-gray-750 transition-colors"
          onClick={() => toggleSection('participation')}
        >
          <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
            <FaChartLine className="text-blue-400" /> Participation Trends
          </h2>
          <FaChevronDown className={`text-gray-400 transition-transform ${
            expandedSection === 'participation' ? 'transform rotate-180' : ''
          }`} />
        </div>
        {expandedSection === 'participation' && (
          <div className="p-4 md:p-6 pt-0">
            <div className="h-64 md:h-80">
              <Line options={chartOptions} data={participationTrendsData} />
            </div>
          </div>
        )}
      </div>

      {/* Performance Metrics Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div 
          className="flex justify-between items-center p-4 md:p-6 cursor-pointer hover:bg-gray-750 transition-colors"
          onClick={() => toggleSection('performance')}
        >
          <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
            <FaPercentage className="text-purple-400" /> Performance Metrics
          </h2>
          <FaChevronDown className={`text-gray-400 transition-transform ${
            expandedSection === 'performance' ? 'transform rotate-180' : ''
          }`} />
        </div>
        {expandedSection === 'performance' && (
          <div className="p-4 md:p-6 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PercentageCard 
              icon={<FaCheckCircle className="text-green-400" />}
              title="Team Completion"
              value={stats.performance.teamCompletion}
              description="of teams complete their projects"
            />
            <PercentageCard 
              icon={<FaMedal className="text-yellow-400" />}
              title="Competition Success"
              value={stats.performance.competitionSuccess}
              description="of competitions result in wins"
            />
            <PercentageCard 
              icon={<FaTasks className="text-blue-400" />}
              title="Task Completion"
              value={stats.performance.taskCompletion}
              description="of tasks are completed"
            />
          </div>
        )}
      </div>

      {/* Domain Participation Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div 
          className="flex justify-between items-center p-4 md:p-6 cursor-pointer hover:bg-gray-750 transition-colors"
          onClick={() => toggleSection('domain')}
        >
          <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
            <FaUserGraduate className="text-green-400" /> Domain Participation
          </h2>
          <FaChevronDown className={`text-gray-400 transition-transform ${
            expandedSection === 'domain' ? 'transform rotate-180' : ''
          }`} />
        </div>
        {expandedSection === 'domain' && (
          <div className="p-4 md:p-6 pt-0">
            <div className="h-64">
              <Pie 
                data={domainParticipationData} 
                options={{
                  ...chartOptions,
                  plugins: {
                    legend: {
                      position: 'right'
                    }
                  }
                }} 
              />
            </div>
          </div>
        )}
      </div>

      {/* SDG Engagement Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div 
          className="flex justify-between items-center p-4 md:p-6 cursor-pointer hover:bg-gray-750 transition-colors"
          onClick={() => toggleSection('sdg')}
        >
          <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
            <FaGlobe className="text-green-400" /> SDG Engagement
          </h2>
          <FaChevronDown className={`text-gray-400 transition-transform ${
            expandedSection === 'sdg' ? 'transform rotate-180' : ''
          }`} />
        </div>
        {expandedSection === 'sdg' && (
          <div className="p-4 md:p-6 pt-0">
            <div className="h-64">
              <Bar 
                data={sdgEngagementData} 
                options={{
                  ...chartOptions,
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }} 
              />
            </div>
            <div className="mt-4 bg-gray-750 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-300 text-sm">SDG Coverage</span>
                <span className="text-white font-medium">
                  {stats.sdgs.totalCoverage}/17
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(stats.sdgs.totalCoverage / 17) * 100}%` }}
                  ></div>
                </div>
                <span className="text-white text-xs">
                  {Math.round((stats.sdgs.totalCoverage / 17) * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Skills Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div 
          className="flex justify-between items-center p-4 md:p-6 cursor-pointer hover:bg-gray-750 transition-colors"
          onClick={() => toggleSection('skills')}
        >
          <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
            <FaLightbulb className="text-yellow-400" /> Top Skills
          </h2>
          <FaChevronDown className={`text-gray-400 transition-transform ${
            expandedSection === 'skills' ? 'transform rotate-180' : ''
          }`} />
        </div>
        {expandedSection === 'skills' && (
          <div className="p-4 md:p-6 pt-0">
            <div className="h-64">
              <Bar 
                data={topSkillsData} 
                options={{
                  ...chartOptions,
                  indexAxis: 'y',
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable Components
const MetricCard = ({ icon, title, value, change, isPositive }) => (
  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-opacity-10 rounded-full">
        {icon}
      </div>
      <p className="text-gray-400 text-sm">{title}</p>
    </div>
    <div className="flex items-baseline mt-1">
      <p className="text-xl md:text-2xl font-semibold text-white">{value}</p>
      <span className={`ml-2 text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {change}
      </span>
    </div>
  </div>
);

const PercentageCard = ({ icon, title, value, description }) => (
  <div className="bg-gray-750 p-3 rounded-lg hover:bg-gray-700 transition-colors">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-opacity-10 rounded-full">
        {icon}
      </div>
      <h3 className="text-md font-semibold">{title}</h3>
    </div>
    <div className="flex items-end gap-2">
      <p className="text-2xl font-bold">{value}%</p>
      <div className="flex-1 mb-1">
        <div className="h-2 bg-gray-700 rounded-full">
          <div 
            className="h-2 rounded-full" 
            style={{ 
              width: `${value}%`,
              backgroundColor: getPercentageColor(value)
            }}
          ></div>
        </div>
      </div>
    </div>
    <p className="text-gray-400 text-xs mt-1">{description}</p>
  </div>
);

// Helper function for percentage colors
const getPercentageColor = (value) => {
  if (value >= 80) return '#10B981'; // green-500
  if (value >= 60) return '#3B82F6'; // blue-500
  if (value >= 40) return '#F59E0B'; // yellow-500
  return '#EF4444'; // red-500
};

export default StatsDashboard;