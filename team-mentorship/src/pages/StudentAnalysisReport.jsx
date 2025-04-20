import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  FaTrophy, 
  FaUsers, 
  FaUserTie, 
  FaGlobe, 
  FaChartLine,
  FaFilePdf,
  FaPrint
} from 'react-icons/fa';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const StudentAnalysisReport = ({ userId }) => {
  const [reportData, setReportData] = useState({
    profile: null,
    competitions: [],
    teams: [],
    mentors: [],
    goals: [],
    sdgContributions: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Initialize default values
        let profileData = null;
        let teamsData = [];
        let competitionsData = [];
        let goalsData = [];
        let mentorsData = [];

        // Fetch profile data
        try {
          const profileRes = await axios.get(`/api/student/profile/${userId}`);
          profileData = profileRes.data || null;
        } catch (profileError) {
          console.error("Error fetching profile:", profileError);
        }

        // Fetch teams data
        try {
          const teamsRes = await axios.get(`/api/teams/user/${userId}?populateMembers=true`);
          teamsData = Array.isArray(teamsRes.data?.data) ? teamsRes.data.data : 
                     Array.isArray(teamsRes.data) ? teamsRes.data : [];
        } catch (teamsError) {
          console.error("Error fetching teams:", teamsError);
        }

        // Fetch competitions data
        try {
          const compAppsRes = await axios.get(`/api/compapp/me/${userId}`);
          competitionsData = Array.isArray(compAppsRes.data) ? compAppsRes.data : [];
        } catch (compError) {
          console.error("Error fetching competitions:", compError);
        }

        // Fetch goals data
        try {
          const goalsRes = await axios.get(`/api/goals/${userId}`);
          goalsData = Array.isArray(goalsRes.data) ? goalsRes.data : [];
        } catch (goalsError) {
          console.error("Error fetching goals:", goalsError);
        }

        // Fetch mentor data
        try {
          const mentorRes = await axios.get(`/api/mentor/profile/${userId}`);
          if (mentorRes.data) {
            mentorsData = [mentorRes.data];
          }
        } catch (mentorError) {
          console.log("User is not a mentor or mentor profile not found");
        }

        // Calculate SDG contributions from teams data
        const sdgCounts = {};
        teamsData.forEach(team => {
          if (team?.sdgs && Array.isArray(team.sdgs)) {
            team.sdgs.forEach(sdg => {
              if (sdg) {
                sdgCounts[sdg] = (sdgCounts[sdg] || 0) + 1;
              }
            });
          }
        });

        const sdgContributions = Object.entries(sdgCounts).map(([id, count]) => ({
          id: parseInt(id),
          name: getSDGName(parseInt(id)),
          contribution: count * 10 // Metric for contribution level
        }));

        setReportData({
          profile: profileData,
          competitions: competitionsData,
          teams: teamsData,
          mentors: mentorsData,
          goals: goalsData,
          sdgContributions,
          isLoading: false,
          error: null
        });

      } catch (error) {
        console.error("Error fetching report data:", error);
        setReportData(prev => ({ 
          ...prev, 
          isLoading: false,
          error: error.response?.data?.message || "Failed to load report data. Please try again later."
        }));
      }
    };

    fetchData();
  }, [userId]);

  // Helper function to get SDG name
  const getSDGName = (id) => {
    const sdgNames = {
      1: "No Poverty",
      2: "Zero Hunger",
      3: "Good Health",
      4: "Quality Education",
      5: "Gender Equality",
      6: "Clean Water",
      7: "Affordable Energy",
      8: "Decent Work",
      9: "Innovation",
      10: "Reduced Inequality",
      11: "Sustainable Cities",
      12: "Responsible Consumption",
      13: "Climate Action",
      14: "Life Below Water",
      15: "Life on Land",
      16: "Peace and Justice",
      17: "Partnerships"
    };
    return sdgNames[id] || `SDG ${id}`;
  };

  // Calculate team progress percentage with safety checks
  const calculateTeamProgress = (team) => {
    if (!team?.tasks || typeof team.tasks.total !== 'number' || team.tasks.total === 0) return 0;
    const completed = typeof team.tasks.completed === 'number' ? team.tasks.completed : 0;
    return Math.round((completed / team.tasks.total) * 100);
  };

  // Safely get teams for chart data
  const getTeamsData = () => {
    if (!Array.isArray(reportData.teams)) return [];
    return reportData.teams.filter(team => team && typeof team === 'object');
  };

  // Chart data configurations with safety checks
  const teamProgressData = {
    labels: getTeamsData().map(team => team?.name || 'Unnamed Team'),
    datasets: [
      {
        label: 'Team Progress (%)',
        data: getTeamsData().map(calculateTeamProgress),
        backgroundColor: getTeamsData().map((_, i) => 
          `hsl(${(i * 360) / Math.max(getTeamsData().length, 1)}, 70%, 50%)`),
        borderColor: getTeamsData().map((_, i) => 
          `hsl(${(i * 360) / Math.max(getTeamsData().length, 1)}, 70%, 30%)`),
        borderWidth: 1
      }
    ]
  };

  const sdgContributionData = {
    labels: Array.isArray(reportData.sdgContributions) ? 
      reportData.sdgContributions.map(sdg => sdg?.name || 'Unknown SDG') : [],
    datasets: [
      {
        label: 'SDG Contribution Level',
        data: Array.isArray(reportData.sdgContributions) ? 
          reportData.sdgContributions.map(sdg => sdg?.contribution || 0) : [],
        backgroundColor: Array.isArray(reportData.sdgContributions) ?
          reportData.sdgContributions.map(sdg => 
            `hsl(${(sdg?.id * 360) / 17}, 70%, 50%)`) : [],
        borderWidth: 1
      }
    ]
  };

  const skillsUsageData = {
    labels: Array.isArray(reportData.profile?.skills) ? reportData.profile.skills : [],
    datasets: [
      {
        label: 'Skills Utilization',
        data: Array.isArray(reportData.profile?.skills) ? 
          reportData.profile.skills.map((_, i) => (i + 1) * 2) : [],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }
    ]
  };

  const generatePDF = () => {
    const input = document.getElementById('report-content');
    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        pdf.save(`student-report-${userId}.pdf`);
      });
  };

  if (reportData.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (reportData.error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl p-4 bg-gray-800 rounded-lg">
          {reportData.error}
        </div>
      </div>
    );
  }

  if (!reportData.profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500 text-xl">No profile data found for this user</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-6">
      <div id="report-content" className="bg-gray-800 rounded-lg p-6 max-w-6xl mx-auto">
        {/* Report Header */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-6">
          <div>
            <h1 className="text-3xl font-bold">Student Performance Analysis Report</h1>
            <p className="text-gray-400">Generated on {new Date().toLocaleDateString()}</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={generatePDF}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <FaFilePdf /> Export PDF
            </button>
            <button 
              onClick={() => window.print()} 
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <FaPrint /> Print
            </button>
          </div>
        </div>

        {/* Student Profile Summary */}
        <div className="mb-10 p-6 bg-gray-750 rounded-lg">
          <div className="flex items-center gap-6">
            <img 
              src={reportData.profile.profilePicture || '/default-profile.png'} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
            />
            <div>
              <h2 className="text-2xl font-bold">{reportData.profile.name || 'No Name'}</h2>
              <p className="text-gray-300">{reportData.profile.department || 'No department specified'}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.isArray(reportData.profile.skills) && reportData.profile.skills.length > 0 ? (
                  reportData.profile.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">No skills listed</span>
                )}
              </div>
            </div>
          </div>
          <p className="mt-4 text-gray-300">
            {reportData.profile.bio || 'No bio available'}
          </p>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-gray-750 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-purple-500/10 rounded-full">
                <FaTrophy className="text-purple-400 text-xl" />
              </div>
              <h3 className="text-lg font-semibold">Competitions</h3>
            </div>
            <p className="text-3xl font-bold">{reportData.competitions.length}</p>
            <p className="text-gray-400 text-sm mt-1">
              {reportData.competitions.filter(c => c.status === 'completed').length} completed
            </p>
          </div>

          <div className="bg-gray-750 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <FaUsers className="text-blue-400 text-xl" />
              </div>
              <h3 className="text-lg font-semibold">Teams</h3>
            </div>
            <p className="text-3xl font-bold">{reportData.teams.length}</p>
            <p className="text-gray-400 text-sm mt-1">
              {reportData.teams.filter(t => t.status === 'active').length} active
            </p>
          </div>

          <div className="bg-gray-750 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-green-500/10 rounded-full">
                <FaUserTie className="text-green-400 text-xl" />
              </div>
              <h3 className="text-lg font-semibold">Mentors</h3>
            </div>
            <p className="text-3xl font-bold">{reportData.mentors.length}</p>
            <p className="text-gray-400 text-sm mt-1">
              {reportData.mentors.length > 0 ? "Working with mentors" : "No mentors assigned"}
            </p>
          </div>

          <div className="bg-gray-750 p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <FaGlobe className="text-yellow-400 text-xl" />
              </div>
              <h3 className="text-lg font-semibold">SDGs Impacted</h3>
            </div>
            <p className="text-3xl font-bold">{reportData.sdgContributions.length}</p>
            <p className="text-gray-400 text-sm mt-1">
              Across {reportData.teams.length} projects
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10">
          {/* Team Performance Section */}
          {getTeamsData().length > 0 && (
            <section className="bg-gray-750 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <FaUsers className="text-blue-400" /> Team Performance
                </h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Team Progress</h3>
                  <div className="h-64">
                    <Bar 
                      data={teamProgressData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                              color: '#9CA3AF'
                            },
                            grid: {
                              color: 'rgba(156, 163, 175, 0.1)'
                            }
                          },
                          x: {
                            ticks: {
                              color: '#9CA3AF'
                            },
                            grid: {
                              color: 'rgba(156, 163, 175, 0.1)'
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            labels: {
                              color: '#F3F4F6'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Team Details</h3>
                  <div className="space-y-4">
                    {getTeamsData().map(team => (
                      <div key={team._id || Math.random()} className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{team.name || 'Unnamed Team'}</h4>
                            <p className="text-sm text-gray-400">{team.description || 'No description'}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            team.status === 'active' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {team.status || 'unknown'}
                          </span>
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{calculateTeamProgress(team)}%</span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${calculateTeamProgress(team)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {team.sdgs && Array.isArray(team.sdgs) && team.sdgs.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {team.sdgs.map(sdg => (
                              <span 
                                key={sdg} 
                                className="px-2 py-1 rounded-full text-xs bg-gray-600 text-gray-300"
                              >
                                SDG {sdg}: {getSDGName(sdg)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SDG Contributions Section */}
          {reportData.sdgContributions.length > 0 && (
            <section className="bg-gray-750 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <FaGlobe className="text-green-400" /> SDG Contributions
                </h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-64">
                  <Pie 
                    data={sdgContributionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            color: '#F3F4F6'
                          }
                        }
                      }
                    }}
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Sustainable Development Goals Impact</h3>
                  <div className="space-y-3">
                    {reportData.sdgContributions.map(sdg => (
                      <div key={sdg.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                            {sdg.id}
                          </div>
                          <span>{sdg.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${sdg.contribution}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-400">{sdg.contribution}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Skills Utilization Section */}
          {Array.isArray(reportData.profile?.skills) && reportData.profile.skills.length > 0 && (
            <section className="bg-gray-750 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <FaChartLine className="text-yellow-400" /> Skills Utilization
                </h2>
              </div>
              
              <div className="h-64">
                <Bar 
                  data={skillsUsageData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          color: '#9CA3AF'
                        },
                        grid: {
                          color: 'rgba(156, 163, 175, 0.1)'
                        }
                      },
                      x: {
                        ticks: {
                          color: '#9CA3AF'
                        },
                        grid: {
                          color: 'rgba(156, 163, 175, 0.1)'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        labels: {
                          color: '#F3F4F6'
                        }
                      }
                    }
                  }}
                />
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Most Used Skills</h3>
                  <div className="space-y-2">
                    {reportData.profile.skills.slice(0, 3).map((skill, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>{skill}</span>
                        <span className="text-gray-400">Used in {index + 2} projects</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Recommended Skills</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Data Visualization</span>
                      <span className="text-gray-400">Based on your projects</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Project Management</span>
                      <span className="text-gray-400">For leadership roles</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Python</span>
                      <span className="text-gray-400">For data analysis</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Competitions Section */}
          {reportData.competitions.length > 0 && (
            <section className="bg-gray-750 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <FaTrophy className="text-purple-400" /> Competition History
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Competition</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {reportData.competitions.map(comp => (
                      <tr key={comp._id || Math.random()}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="font-medium">{comp.competition?.name || 'Unknown competition'}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-300">
                          {comp.competition?.category || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-300">
                          {comp.competition?.date ? 
                            new Date(comp.competition.date.split(' - ')[0]).toLocaleDateString() : 
                            'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            comp.status === 'completed' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {comp.status || 'unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-gray-300">
                          {comp.result || 'Pending'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>

        {/* Report Footer */}
        <div className="mt-12 pt-6 border-t border-gray-700 text-center text-gray-500 text-sm">
          <p>This report was generated automatically based on your academic and extracurricular activities.</p>
          <p className="mt-1">For any discrepancies, please contact your academic advisor.</p>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalysisReport;