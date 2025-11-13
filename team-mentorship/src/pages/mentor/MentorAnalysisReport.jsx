import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { 
  FaTrophy, 
  FaUsers, 
  FaUserGraduate, 
  FaGlobe, 
  FaChartLine,
  FaFilePdf,
  FaPrint,
  FaCalendarAlt,
  FaTasks,
  FaMedal,
  FaAward,
  FaChartBar,
  FaHandsHelping
} from 'react-icons/fa';
import axios from 'axios';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { auth } from "/src/config/firebase";

const MentorAnalysisReport = () => {
  const [userId, setUserId] = useState(null);
  const [reportData, setReportData] = useState({
    profile: null,
    teams: [],
    students: [],
    competitions: [],
    applications: [],
    stats: {
      competitionSuccessRate: 0,
      teamCompletionRate: 0,
      studentGrowth: 0,
      applicationAcceptanceRate: 0
    },
    isLoading: true,
    error: null
  });

  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      setUserId(user.uid);
    }
  }, [user]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

 // Update your fetchData function to better handle errors
 const fetchData = async () => {
    try {
      const data = {
        profile: null,
        teams: [],
        students: [],
        competitions: [],
        applications: [],
        stats: {
          competitionSuccessRate: 0,
          teamCompletionRate: 0,
          studentGrowth: 0
        }
      };
  
      // Fetch mentor profile data
      try {
        const profileRes = await axios.get(`https://team-match.up.railway.app/api/mentor/profile/${userId}`);
        data.profile = profileRes.data || null;
      } catch (error) {
        console.error("Profile fetch error:", error);
      }
  
      // Fetch teams where mentor is assigned
      try {
        const teamsRes = await axios.get(`https://team-match.up.railway.app/api/teams/mentor/${userId}/members`);
        data.teams = Array.isArray(teamsRes.data?.teams) ? teamsRes.data.teams : [];
        data.students = Array.isArray(teamsRes.data?.members) ? teamsRes.data.members : [];
        data.teams = (teamsRes.data?.teams || []).map(team => ({
          ...team,
          tasks: team.tasks || { total: 0, completed: 0 } // Default empty tasks
        }));
        console.log("Mentor teams data:", data.teams);    
      } catch (error) {
        console.error("Teams fetch error:", error);
      }
  
      // Fetch competitions where mentor's teams are participating
      try {
        if (data.teams.length > 0) {
          const compRes = await axios.get(`https://team-match.up.railway.app/api/compapp/mentor/${data.profile._id}`);
          data.competitions = Array.isArray(compRes.data.data) ? compRes.data.data : [];
          console.log("Mentor competition data:", data.competitions);
        }
      } catch (error) {
        console.error("Competitions fetch error:", error);
      }
  
      // Calculate statistics
      if (data.competitions.length > 0) {
        const successfulComps = data.competitions.filter(comp => 
          comp.application?.result === 'winner'
        ).length;
        data.stats.competitionSuccessRate = Math.round(
          (successfulComps / data.competitions.length) * 100
        );
      }
      if (data.teams.length > 0) {
        const completedTeams = data.teams.filter(team => 
          team.status === 'completed'
        ).length;
        data.stats.teamCompletionRate = Math.round(
          (completedTeams / data.teams.length) * 100
        );
      }
  
      // Calculate student growth (placeholder - could be based on skills improvement)
      data.stats.studentGrowth = Math.min(
        data.students.length * 10, 
        100
      );
  
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
    // Calculate team progress based on tasks
    const calculateTeamProgress = (team) => {
      if (!team?.tasks || typeof team.tasks.total !== 'number' || team.tasks.total === 0) {
        return 0;
      }
      const completed = Math.min(
        typeof team.tasks.completed === 'number' ? team.tasks.completed : 0,
        team.tasks.total
      );
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

  const competitionPerformanceData = {
    labels: reportData.competitions.map(comp => 
      comp.competition?.name || 'Unknown competition'),
    datasets: [{
      label: 'Competition Results',
      data: reportData.competitions.map(comp => {
        if (comp.application?.result === 'winner') return 100;
        if (comp.application?.result === 'runner-up') return 80;
        if (comp.application?.result === 'finalist') return 60;
        if (comp.application?.status === 'accepted') return 40;
        if (comp.application?.status === 'pending') return 20;
        return 0;
      }),
      backgroundColor: reportData.competitions.map(comp => {
        if (comp.application?.result === 'winner') return 'rgba(75, 192, 192, 0.6)';
        if (comp.application?.result === 'runner-up') return 'rgba(54, 162, 235, 0.6)';
        if (comp.application?.result === 'finalist') return 'rgba(153, 102, 255, 0.6)';
        if (comp.application?.status === 'accepted') return 'rgba(255, 206, 86, 0.6)';
        return 'rgba(255, 99, 132, 0.6)';
      }),
      borderColor: reportData.competitions.map(comp => {
        if (comp.application?.result === 'winner') return 'rgba(75, 192, 192, 1)';
        if (comp.application?.result === 'runner-up') return 'rgba(54, 162, 235, 1)';
        if (comp.application?.result === 'finalist') return 'rgba(153, 102, 255, 1)';
        if (comp.application?.status === 'accepted') return 'rgba(255, 206, 86, 1)';
        return 'rgba(255, 99, 132, 1)';
      }),
      borderWidth: 1
    }]
  };
  const statsData = {
    labels: ['Success Rate', 'Team Completion', 'Student Growth'],
    datasets: [{
      label: 'Performance Metrics (%)',
      data: [
        reportData.stats.competitionSuccessRate,
        reportData.stats.teamCompletionRate,
        reportData.stats.studentGrowth
      ],
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)'
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)'
      ],
      borderWidth: 1
    }]
  };

  // Generate PDF report
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
  
      pdf.save(`mentor-report-${userId}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      document.querySelectorAll('[style*="z-index: 99999"]').forEach(el => el.remove());
    }
  };

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
        <div className="text-gray-500 text-xl">No profile data found for this mentor</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-6">
      <div id="report-content" className="bg-gray-800 rounded-lg p-6 max-w-6xl mx-auto">
        
        {/* Report Header */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-6">
          <div>
            <h1 className="text-3xl font-bold">Mentor Performance Analysis Report</h1>
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

        {/* Mentor Profile Summary */}
        <div className="mb-10 p-6 bg-gray-750 rounded-lg">
          <div className="flex items-center gap-6">
            <img 
              src={reportData.profile.profilePicture 
                ? `https://team-match.up.railway.app${reportData.profile.profilePicture}`
                : "/default-profile.png"}
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
            />
            <div>
              <h2 className="text-2xl font-bold">{reportData.profile.name}</h2>
              <p className="text-gray-300">{reportData.profile.currentPosition || 'Mentor'} in {reportData.profile.domain || 'No domain specified'}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {reportData.profile.skills?.length > 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
  <MetricCard 
    icon={<FaTrophy className="text-purple-400 text-xl" />}
    title="Competitions"
    value={reportData.competitions.length}
    subtext={`${reportData.stats.competitionSuccessRate}% success rate`}
  />
  <MetricCard 
    icon={<FaUsers className="text-blue-400 text-xl" />}
    title="Teams"
    value={reportData.teams.length}
    subtext={`${reportData.stats.teamCompletionRate}% completed`}
  />
  <MetricCard 
    icon={<FaUserGraduate className="text-green-400 text-xl" />}
    title="Students"
    value={reportData.students.length}
    subtext={`${reportData.stats.studentGrowth}% avg. growth`}
  />
</div>

        {/* Performance Statistics Section */}
        <ReportSection 
          icon={<FaChartBar className="text-purple-400" />}
          title="Performance Statistics"
        >
          <div className="h-64">
            <Bar 
              data={statsData}
              options={{
                ...chartOptions,
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
                }
              }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
  <StatCard 
    icon={<FaMedal className="text-purple-400" />}
    title="Competition Success"
    value={`${reportData.stats.competitionSuccessRate}%`}
    description="Of competitions resulted in wins"
  />
  <StatCard 
    icon={<FaTasks className="text-blue-400" />}
    title="Team Completion"
    value={`${reportData.stats.teamCompletionRate}%`}
    description="Of teams completed their projects"
  />
  <StatCard 
    icon={<FaUserGraduate className="text-green-400" />}
    title="Student Growth"
    value={`${reportData.stats.studentGrowth}%`}
    description="Average skill improvement"
  />
</div>
        </ReportSection>

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
                    />
                  ))}
                </div>
              </div>
            </div>
          </ReportSection>
        )}

        {/* Competition Performance Section */}
        {reportData.competitions.length > 0 && (
          <ReportSection 
            icon={<FaTrophy className="text-purple-400" />}
            title="Competition Performance"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-64">
                <Bar 
                  data={competitionPerformanceData}
                  options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          color: '#9CA3AF',
                          callback: function(value) {
                            if (value === 100) return 'winner';
                            if (value === 80) return 'runner-up';
                            if (value === 60) return 'finalist';
                            if (value === 40) return 'participated';
                            if (value === 20) return 'applied';
                            return '';
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Competition Results</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <TableHeader>Team</TableHeader>
                        <TableHeader>Competition</TableHeader>
                        <TableHeader>Status</TableHeader>
                        <TableHeader>Result</TableHeader>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {reportData.competitions.map((comp, index) => (
                        <tr key={index}>
                          <TableCell>{comp.team?.name || 'Unknown team'}</TableCell>
                          <TableCell>{comp.competition?.name || 'Unknown competition'}</TableCell>
                          <TableCell>
                            <StatusBadge 
                              status={comp.competition?.status || 'unknown'}
                            />
                          </TableCell>
                          <TableCell>
                            <ResultBadge 
                              result={comp.application?.result}
                              status={comp.application?.status}
                            />
                          </TableCell>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </ReportSection>
        )}

        {/* Student Development Section */}
        {reportData.students.length > 0 && (
  <ReportSection 
    icon={<FaUserGraduate className="text-green-400" />}
    title="Student Development"
  >
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Skill Distribution</h3>
        <div className="h-64">
          {(() => {
            // Extract all skills with their levels
            const allSkills = reportData.students.flatMap(student => 
              Array.isArray(student.skills) 
                ? student.skills.map(skill => ({
                    name: skill.name || 'Unknown Skill',
                    level: skill.level || 'Beginner'
                  }))
                : []
            );

            // Count skill occurrences
            const skillCounts = allSkills.reduce((acc, skill) => {
              const key = `${skill.name}-${skill.level}`;
              acc[key] = (acc[key] || 0) + 1;
              return acc;
            }, {});

            const skillData = Object.entries(skillCounts).map(([key, count]) => {
              const [name, level] = key.split('-');
              return { name, level, count };
            });

            if (skillData.length === 0) {
              return <p className="text-gray-400">No skill data available</p>;
            }

            return (
              <Pie 
                data={{
                  labels: skillData.map(skill => `${skill.name} (${skill.level})`),
                  datasets: [{
                    data: skillData.map(skill => skill.count),
                    backgroundColor: skillData.map((_, i) => 
                      `hsl(${(i * 360) / Math.max(skillData.length, 1)}, 70%, 50%)`
                    ),
                    borderWidth: 1
                  }]
                }}
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
            );
          })()}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Top Students</h3>
        <div className="space-y-3">
          {[...reportData.students]
            .sort((a, b) => {
              const aSkills = Array.isArray(a.skills) ? a.skills.length : 0;
              const bSkills = Array.isArray(b.skills) ? b.skills.length : 0;
              return bSkills - aSkills;
            })
            .slice(0, 5)
            .map((student, index) => (
              <StudentItem 
                key={`${student._id || student.uid}-${index}`}
                student={student}
              />
            ))}
        </div>
      </div>
    </div>
  </ReportSection>
)}
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

const StatCard = ({ icon, title, value, description }) => (
  <div className="bg-gray-750 p-4 rounded-lg">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-opacity-10 rounded-full">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <p className="text-2xl font-bold mb-1">{value}</p>
    <p className="text-gray-400 text-sm">{description}</p>
  </div>
);

const ReportSection = ({ icon, title, children }) => (
  <section className="bg-gray-750 rounded-lg p-6 mb-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold flex items-center gap-3">
        {icon} {title}
      </h2>
    </div>
    {children}
  </section>
);

const TeamCard = ({ team, progress }) => (
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
    {team.members?.length > 0 && (
      <div className="mt-3 text-sm text-gray-400">
        {team.members.length} members
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

  const style = statusStyles[status?.toLowerCase()] || statusStyles.default;

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${style}`}>
      {status}
    </span>
  );
};

const ResultBadge = ({ result, status }) => {
  const resultStyles = {
    winner: 'bg-yellow-500/20 text-yellow-400',
    runnerup: 'bg-blue-500/20 text-blue-400',
    finalist: 'bg-purple-500/20 text-purple-400',
    accepted: 'bg-green-500/20 text-green-400',
    pending: 'bg-gray-500/20 text-gray-400',
    default: 'bg-gray-500/20 text-gray-400'
  };

  const displayText = result || status || 'unknown';
  const style = resultStyles[displayText?.toLowerCase()] || resultStyles.default;

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${style}`}>
      {displayText}
    </span>
  );
};

const StudentItem = ({ student }) => (
    <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
      <img 
       src={student.profilePicture 
        ? `https://team-match.up.railway.app${student.profilePicture}`
        : "/default-profile.png"} 
        alt={student.name} 
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex-1">
        <h4 className="font-medium">{student.name || 'Unknown Student'}</h4>
        <p className="text-sm text-gray-400">{student.rolePreference || 'Team Member'}</p>
      </div>
      <div className="flex flex-wrap gap-1">
        {Array.isArray(student.skills) && student.skills.slice(0, 3).map((skill, index) => (
          <div key={`${skill._id || skill.name || index}`} className="flex flex-col">
            <span className="px-2 py-1 rounded-full text-xs bg-gray-600 text-gray-300">
              {skill.name || 'Unknown Skill'}
            </span>
            <span className="text-xs text-gray-400 text-center mt-1">
              {skill.level || 'Beginner'}
            </span>
          </div>
        ))}
        {Array.isArray(student.skills) && student.skills.length > 3 && (
          <div className="flex flex-col">
            <span className="px-2 py-1 rounded-full text-xs bg-gray-600 text-gray-300">
              +{student.skills.length - 3}
            </span>
            <span className="text-xs text-gray-400 text-center mt-1">
              more
            </span>
          </div>
        )}
      </div>
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

export default MentorAnalysisReport;