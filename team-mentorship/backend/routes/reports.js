const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const StudentProfile = require('../models/StudentProfile');
const Mentor = require('../models/Mentor');
const Competition = require('../models/Competition');
const Application = require('../models/CompApplication');
const TeamOpening = require('../models/TeamOpening');
const mongoose = require('mongoose');

// Helper function to get last 12 months labels
const getLast12Months = () => {
  const months = [];
  const date = new Date();
  
  for (let i = 0; i < 12; i++) {
    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    months.unshift(monthYear);
    date.setMonth(date.getMonth() - 1);
  }
  
  return months;
};

// Helper function to get month name
const getMonthName = (monthNumber) => {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString('default', { month: 'short' });
};

// Dashboard analytics endpoint
router.get('/dashboard', async (req, res) => {
  try {
    // Get counts for all key metrics
    const [
      totalStudents,
      totalMentors,
      totalTeams,
      totalCompetitions,
      totalApplications,
      totalOpenings,
      activeCompetitions,
      completedCompetitions
    ] = await Promise.all([
      StudentProfile.countDocuments(),
      Mentor.countDocuments(),
      Team.countDocuments(),
      Competition.countDocuments(),
      Application.countDocuments(),
      TeamOpening.countDocuments(),
      Competition.countDocuments({ status: 'Active' }),
      Competition.countDocuments({ status: 'Completed' })
    ]);

    // Calculate growth percentages (compared to previous period)
    const previousPeriod = new Date();
    previousPeriod.setMonth(previousPeriod.getMonth() - 1);
    
    const [
      prevStudents,
      prevMentors,
      prevTeams,
      prevCompetitions
    ] = await Promise.all([
      StudentProfile.countDocuments({ createdAt: { $lt: previousPeriod } }),
      Mentor.countDocuments({ createdAt: { $lt: previousPeriod } }),
      Team.countDocuments({ createdAt: { $lt: previousPeriod } }),
      Competition.countDocuments({ createdAt: { $lt: previousPeriod } })
    ]);

    const growth = {
      students: prevStudents > 0 ? 
        Math.round(((totalStudents - prevStudents) / prevStudents) * 100) : 100,
      mentors: prevMentors > 0 ? 
        Math.round(((totalMentors - prevMentors) / prevMentors) * 100) : 100,
      teams: prevTeams > 0 ? 
        Math.round(((totalTeams - prevTeams) / prevTeams) * 100) : 100,
      competitions: prevCompetitions > 0 ? 
        Math.round(((totalCompetitions - prevCompetitions) / prevCompetitions) * 100) : 100
    };

    // Get participation trends (last 12 months)
    const monthlyData = await Promise.all([
      StudentProfile.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 }
      ]),
      Mentor.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 }
      ])
    ]);

    // Format monthly data
    const months = getLast12Months();
    const monthlyStudents = Array(12).fill(0);
    const monthlyMentors = Array(12).fill(0);

    monthlyData[0].forEach(item => {
      const index = months.findIndex(m => 
        m.includes(getMonthName(item._id.month)) && m.includes(item._id.year.toString()));
      if (index !== -1) {
        monthlyStudents[index] = item.count;
      }
    });

    monthlyData[1].forEach(item => {
      const index = months.findIndex(m => 
        m.includes(getMonthName(item._id.month)) && m.includes(item._id.year.toString()));
      if (index !== -1) {
        monthlyMentors[index] = item.count;
      }
    });

    // Get domain participation
    const domainStats = await StudentProfile.aggregate([
      { $group: { _id: "$domain", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const byDomain = domainStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Get SDG engagement stats
    const sdgStats = await Team.aggregate([
      { $unwind: "$sdgs" },
      { $group: { _id: "$sdgs", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get top skills
    const skillsStats = await StudentProfile.aggregate([
      { $unwind: "$skills" },
      { $group: { _id: "$skills", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get team performance metrics
    const performanceStats = await Team.aggregate([
      {
        $group: {
          _id: null,
          avgCompletion: { $avg: "$progress" },
          totalTasks: { $sum: "$tasks.total" },
          completedTasks: { $sum: "$tasks.completed" }
        }
      }
    ]);

    const performance = performanceStats[0] || {
      avgCompletion: 0,
      totalTasks: 0,
      completedTasks: 0
    };

    res.json({
      success: true,
      data: {
        totals: {
          students: totalStudents,
          mentors: totalMentors,
          teams: totalTeams,
          competitions: totalCompetitions,
          applications: totalApplications,
          openings: totalOpenings
        },
        growth,
        performance: {
          teamCompletion: Math.round(performance.avgCompletion) || 0,
          competitionSuccess: Math.round((completedCompetitions / totalCompetitions) * 100) || 0,
          taskCompletion: performance.totalTasks > 0 ? 
            Math.round((performance.completedTasks / performance.totalTasks) * 100) : 0
        },
        participation: {
          monthlyLabels: months,
          monthlyStudents,
          monthlyMentors,
          byDomain
        },
        sdgs: {
          top: sdgStats,
          totalCoverage: sdgStats.length
        },
        skills: {
          top: skillsStats
        }
      }
    });

  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch dashboard data',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;