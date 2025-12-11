import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  FaTrophy, 
  FaUsers, 
  FaUserTie, 
  FaGlobe, 
  FaChartLine,
  FaFilePdf,
  FaPrint,
  FaCalendarAlt,
  FaTasks
} from 'react-icons/fa';
import axios from 'axios';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { auth } from "../config/firebase";

const StudentAnalysisReport = () => {
     const [userId, setUserId] = useState(null);
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
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      setUserId(user.uid);
    }
  }, [user]);
  useEffect(() => {
    fetchData();
  }, [userId]);


    const fetchData = async () => {
      try {
        // Initialize all data with defaults
        const data = {
          profile: null,
          competitions: [],
          teams: [],
          mentors: [],
          goals: [],
          sdgContributions: []
        };

     // Fetch profile data
try {
    const profileRes = await axios.get(`https://talent-hunt-2.onrender.com/api/student/profile/${userId}`);
    data.profile = profileRes.data || null;
  } catch (error) {
    console.error("Profile fetch error:", error);
  }
  
  // Fetch teams data with multiple fallbacks
  let userTeams = [];
  try {
    const teamsRes = await axios.get(`https://talent-hunt-2.onrender.com/api/teams/user/${userId}`);
    userTeams = Array.isArray(teamsRes.data?.data) ? teamsRes.data.data :
                Array.isArray(teamsRes.data) ? teamsRes.data : [];
    data.teams = userTeams;
    data.mentors = userTeams.map(team => team.mentors || []);
  } catch (error) {
    console.error("Teams fetch error:", error);
  }
  
  // Fetch mentors for each team
  if (userTeams.length > 0) {
    try {
      // Get all unique team IDs
      const teamIds = userTeams.map(team => team._id || team.id).filter(id => id);
      
      if (teamIds.length > 0) {
        // Fetch mentors for these teams
        const mentorsRes = await axios.post(`https://talent-hunt-2.onrender.com/api/teams`, { teamIds });
        data.mentors = Array.isArray(mentorsRes.data) ? mentorsRes.data : [];
      }
    } catch (error) {
      console.error("Mentors fetch error:", error);
    }
  }
  
  // Fetch competition applications
  try {
    const compAppsRes = await axios.get(`https://talent-hunt-2.onrender.com/api/compapp/me/${userId}`);
    data.competitions = Array.isArray(compAppsRes.data) ? compAppsRes.data : [];
  } catch (error) {
    console.error("Competitions fetch error:", error);
  }
  
  // Fetch goals
  try {
    const goalsRes = await axios.get(`https://talent-hunt-2.onrender.com/api/goals/${userId}`);
    data.goals = Array.isArray(goalsRes.data) ? goalsRes.data : [];
  } catch (error) {
    console.error("Goals fetch error:", error);
  }
     // Calculate SDG contributions from teams data
        const sdgCounts = {};
        data.teams.forEach(team => {
          if (team?.sdgs && Array.isArray(team.sdgs)) {
            team.sdgs.forEach(sdg => {
              if (sdg) {
                sdgCounts[sdg] = (sdgCounts[sdg] || 0) + 1;
              }
            });
          }
        });

        data.sdgContributions = Object.entries(sdgCounts).map(([id, count]) => ({
          id: parseInt(id),
          name: getSDGName(parseInt(id)),
          contribution: Math.min(count * 10, 100) // Cap at 100%
        }));

        setReportData({
          ...data,
          isLoading: false,
          error: null
        });

      } catch (error) {
        console.error("Error in report data fetch:", error);
        setReportData(prev => ({
          ...prev,
          isLoading: false,
          error: error.response?.data?.message || 
                "Failed to load report data. Please try again later."
        }));
      }
    };

  

  // Calculate team progress with safety checks
  const calculateTeamProgress = (team) => {
    if (!team?.tasks || typeof team.tasks.total !== 'number' || team.tasks.total === 0) {
      return 0;
    }
    const completed = typeof team.tasks.completed === 'number' ? team.tasks.completed : 0;
    return Math.round((completed / team.tasks.total) * 100);
  };

  // Safely get teams data for rendering
  const getValidTeams = () => {
    return Array.isArray(reportData.teams) ? 
           reportData.teams.filter(team => team && typeof team === 'object') : 
           [];
  };

  // Chart data configurations
  const teamProgressData = {
    labels: getValidTeams().map(team => team.name || 'Unnamed Team'),
    datasets: [{
      label: 'Team Progress (%)',
      data: getValidTeams().map(calculateTeamProgress),
      backgroundColor: getValidTeams().map((_, i) => 
        `hsl(${(i * 360) / Math.max(getValidTeams().length, 1)}, 70%, 50%)`),
      borderColor: getValidTeams().map((_, i) => 
        `hsl(${(i * 360) / Math.max(getValidTeams().length, 1)}, 70%, 30%)`),
      borderWidth: 1
    }]
  };

  const sdgContributionData = {
    labels: reportData.sdgContributions.map(sdg => sdg.name),
    datasets: [{
      label: 'SDG Contribution Level',
      data: reportData.sdgContributions.map(sdg => sdg.contribution),
      backgroundColor: reportData.sdgContributions.map(sdg => 
        `hsl(${(sdg.id * 360) / 17}, 70%, 50%)`),
      borderWidth: 1
    }]
  };

const skillsUsageData = {
  labels: reportData.profile?.skills?.map(skill => skill.name) || [],
  datasets: [{
    label: 'Skills Proficiency Level',
    data: reportData.profile?.skills?.map(skill => {
      // Convert skill level to numerical value for the chart
      switch(skill.level?.toLowerCase()) {
        case 'beginner': return 30;
        case 'intermediate': return 50;
        case 'advanced': return 70;
        case 'expert': return 90;
        default: return 1; // Default to beginner if level not specified
      }
    }) || [],
    backgroundColor: reportData.profile?.skills?.map((_, i) => 
      `hsl(${(i * 360) / Math.max(reportData.profile.skills.length, 1)}, 70%, 60%)`
    ) || 'rgba(153, 102, 255, 0.6)',
    borderColor: reportData.profile?.skills?.map((_, i) => 
      `hsl(${(i * 360) / Math.max(reportData.profile.skills.length, 1)}, 70%, 40%)`
    ) || 'rgba(153, 102, 255, 1)',
    borderWidth: 1
  }]
};

  const generatePDF = async () => {
    try {
      const element = document.getElementById('report-content');
      if (!element) throw new Error('Report content element not found');
  
      // Clone the report
      const clone = element.cloneNode(true);
      document.body.appendChild(clone);
  
      clone.style.position = 'absolute';
      clone.style.left = '0';
      clone.style.top = '0';
      clone.style.zIndex = '99999';
      clone.style.background = 'white';
      clone.style.color = 'black';
      clone.style.padding = '20px';
      clone.style.width = element.scrollWidth + 'px';
      clone.style.maxWidth = '1000px';
  
      // Remove Tailwind background and text color classes
      const removeClasses = (node) => {
        if (node.classList) {
          node.classList.forEach(cls => {
            if (
              cls.startsWith('bg-') || cls.startsWith('text-') ||
              cls.startsWith('border-') || cls.startsWith('from-') ||
              cls.startsWith('to-') || cls.startsWith('via-')
            ) {
              node.classList.remove(cls);
            }
          });
        }
        node.childNodes.forEach(removeClasses);
      };
      removeClasses(clone);
  
      // Convert Chart.js canvas to images
      const originalCanvases = element.querySelectorAll('canvas');
      const clonedCanvases = clone.querySelectorAll('canvas');
      originalCanvases.forEach((origCanvas, index) => {
        const dataUrl = origCanvas.toDataURL('image/png', 1.0); // High quality
        const img = new Image();
        img.src = dataUrl;
        img.style.width = origCanvas.style.width || '100%';
        img.style.height = origCanvas.style.height || 'auto';
        clonedCanvases[index].replaceWith(img);
      });
  
      // Wait for images to load
      await Promise.all(
        Array.from(clone.querySelectorAll('img')).map(img => {
          if (!img.complete) {
            return new Promise(resolve => {
              img.onload = img.onerror = resolve;
            });
          }
        })
      );
  
      await new Promise(resolve => setTimeout(resolve, 500));
  
      // html2canvas with high DPI (2 or 3 for print)
      const canvas = await html2canvas(clone, {
        scale: 3, // 3x for better print resolution
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollY: -window.scrollY,
      });
  
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
  
      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
      let heightLeft = imgHeight;
      let position = 0;
  
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
  
      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
  
      pdf.save(`student-report-${userId}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      document.querySelectorAll('[style*="z-index: 99999"]').forEach(el => el.remove());
    }
  };
  
  
  // Helper function to convert modern color formats to hex
  function convertToHex(colorValue) {
    // Fallback colors for different scenarios
    const fallbacks = {
      'bg': '#1F2937',     // gray-800
      'text': '#F3F4F6',   // gray-100
      'border': '#374151', // gray-700
      'accent': '#7C3AED'  // purple-600
    };
    
    // Check if it's a Tailwind-like class
    if (colorValue.includes('var(--tw-')) {
      if (colorValue.includes('bg-')) return fallbacks.bg;
      if (colorValue.includes('text-')) return fallbacks.text;
      if (colorValue.includes('border-')) return fallbacks.border;
      return fallbacks.accent;
    }
    
    // Default fallback
    return fallbacks.bg;
  }

  // Loading state
  if (reportData.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Error state
  if (reportData.error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl p-4 bg-gray-800 rounded-lg">
          {reportData.error}
        </div>
      </div>
    );
  }

  // No profile data state
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
              src={reportData.profile.profilePicture 
                ? `https://talent-hunt-2.onrender.com${reportData.profile.profilePicture}`
                : "/default-profile.png"}
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
            />
            <div>
              <h2 className="text-2xl font-bold">{reportData.profile.name}</h2>
              <p className="text-gray-300">{reportData.profile.department || 'No department specified'}</p>
              <div className="flex flex-wrap gap-2 mt-2">
  {reportData.profile.skills?.length > 0 ? (
    reportData.profile.skills.map((skill, index) => (
      <span key={skill._id || index} className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
        {skill.name}
        {skill.level && (
          <span className="text-xs ml-1 text-blue-300">({skill.level})</span>
        )}
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
          <MetricCard 
            icon={<FaTrophy className="text-purple-400 text-xl" />}
            title="Competitions"
            value={reportData.competitions.length}
            subtext={`${reportData.competitions.filter(c => c.status === 'completed').length} completed`}
          />
          <MetricCard 
            icon={<FaUsers className="text-blue-400 text-xl" />}
            title="Teams"
            value={reportData.teams.length}
            subtext={`${reportData.teams.filter(t => t.status === 'active').length} active`}
          />
          <MetricCard 
            icon={<FaUserTie className="text-green-400 text-xl" />}
            title="Mentors"
            value={reportData.mentors.length}
            subtext={reportData.mentors.length > 0 ? "Working with mentors" : "No mentors assigned"}
          />
          <MetricCard 
            icon={<FaGlobe className="text-yellow-400 text-xl" />}
            title="SDGs Impacted"
            value={reportData.sdgContributions.length}
            subtext={`Across ${reportData.teams.length} projects`}
          />
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10">
          {/* Team Performance Section */}
          {getValidTeams().length > 0 && (
            <ReportSection 
              icon={<FaUsers className="text-blue-400" />}
              title="Team Performance"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Team Progress</h3>
                  <div className="h-64">
                    <Bar 
                      data={teamProgressData}
                      options={chartOptions}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Team Details</h3>
                  <div className="space-y-4">
                    {getValidTeams().map(team => (
                      <TeamCard 
                        key={team._id}
                        team={team}
                        progress={calculateTeamProgress(team)}
                        getSDGName={getSDGName}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </ReportSection>
          )}

          {/* SDG Contributions Section */}
          {reportData.sdgContributions.length > 0 && (
            <ReportSection 
              icon={<FaGlobe className="text-green-400" />}
              title="SDG Contributions"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-64">
                  <Pie 
                    data={sdgContributionData}
                    options={{
                      ...chartOptions,
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
                      <SDGContributionItem 
                        key={sdg.id}
                        sdg={sdg}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </ReportSection>
          )}

          {/* Skills Utilization Section */}
          {reportData.profile.skills?.length > 0 && (
  <ReportSection 
    icon={<FaChartLine className="text-yellow-400" />}
    title="Skills Distribution"
  >
    <div className="h-64">
      <Bar 
        data={skillsUsageData}
        options={chartOptions}
      />
    </div>
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Top Skills</h3>
        <div className="space-y-2">
          {reportData.profile.skills
            .slice(0, 3)
            .map((skill) => (
              <div key={skill._id} className="flex items-center justify-between">
                <span>{skill.name}</span>
                <span className="text-gray-400">
                  Level: {skill.level || 'not specified'}
                </span>
              </div>
            ))
          }
        </div>
      </div>
              </div>
            </ReportSection>
          )}

          {/* Competitions Section */}
          {reportData.competitions.length > 0 && (
            <ReportSection 
              icon={<FaTrophy className="text-purple-400" />}
              title="Competition History"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <TableHeader>Competition</TableHeader>
                      <TableHeader>Category</TableHeader>
                      <TableHeader>Date</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader>Result</TableHeader>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {reportData.competitions.map(comp => (
                      <tr key={comp._id}>
                        <TableCell>{comp.competition?.name || 'Unknown competition'}</TableCell>
                        <TableCell>{comp.competition?.category || 'N/A'}</TableCell>
                        <TableCell>
                          {comp.competition?.date ? 
                            new Date(comp.competition.date.split(' - ')[0]).toLocaleDateString() : 
                            'N/A'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge 
                            status={comp.status || 'unknown'}
                          />
                        </TableCell>
                        <TableCell>{comp.result || 'Pending'}</TableCell>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ReportSection>
          )}
        </div>

      
      </div>
    </div>
  );
};

// Reusable components
const MetricCard = ({ icon, title, value, subtext }) => (
  <div className="bg-gray-750 p-6 rounded-lg">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-3 bg-opacity-10 rounded-full">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <p className="text-3xl font-bold">{value}</p>
    <p className="text-gray-400 text-sm mt-1">{subtext}</p>
  </div>
);

const ReportSection = ({ icon, title, children }) => (
  <section className="bg-gray-750 rounded-lg p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold flex items-center gap-3">
        {icon} {title}
      </h2>
    </div>
    {children}
  </section>
);

const TeamCard = ({ team, progress, getSDGName }) => (
  <div className="bg-gray-700 p-4 rounded-lg">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-medium">{team.name || 'Unnamed Team'}</h4>
        <p className="text-sm text-gray-400">{team.description || 'No description'}</p>
      </div>
      <StatusBadge status={team.status} />
    </div>
    <div className="mt-3">
      <div className="flex justify-between text-sm mb-1">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <ProgressBar progress={progress} />
    </div>
    {team.sdgs?.length > 0 && (
      <div className="mt-3 flex flex-wrap gap-2">
        {team.sdgs.map(sdg => (
          <span key={sdg} className="px-2 py-1 rounded-full text-xs bg-gray-600 text-gray-300">
            SDG {sdg}: {getSDGName(sdg)}
          </span>
        ))}
      </div>
    )}
  </div>
);

const ProgressBar = ({ progress }) => (
  <div className="w-full bg-gray-600 rounded-full h-2">
    <div 
      className="bg-blue-500 h-2 rounded-full" 
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

const StatusBadge = ({ status }) => {
  const statusStyles = {
    active: 'bg-green-500/20 text-green-400',
    completed: 'bg-purple-500/20 text-purple-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    default: 'bg-gray-500/20 text-gray-400'
  };

  const style = statusStyles[status] || statusStyles.default;

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${style}`}>
      {status}
    </span>
  );
};

const SDGContributionItem = ({ sdg }) => (
  <div className="flex items-center justify-between">
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
);

const RecommendedSkill = ({ name, reason }) => (
  <div className="flex items-center justify-between">
    <span>{name}</span>
    <span className="text-gray-400">{reason}</span>
  </div>
);

const TableHeader = ({ children }) => (
  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
    {children}
  </th>
);

const TableCell = ({ children }) => (
  <td className="px-4 py-4 whitespace-nowrap text-gray-300">
    {children}
  </td>
);

// Common chart options
const chartOptions = {
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
};

export default StudentAnalysisReport;