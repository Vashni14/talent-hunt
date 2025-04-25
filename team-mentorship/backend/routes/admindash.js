const StudentProfile = require("../models/StudentProfile");
const Mentor = require("../models/Mentor");
const Team = require("../models/Team");
const Competition = require("../models/Competition");
const Application = require("../models/CompApplication");
express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Dashboard Reports Route
router.get("/reports/dashboard", async (req, res) => {
  try {
    // Get counts for all key metrics
    const [
      totalStudents,
      totalMentors,
      totalTeams,
      totalCompetitions,
      totalApplications,
      activeCompetitions,
      completedCompetitions,
    ] = await Promise.all([
      StudentProfile.countDocuments(),
      Mentor.countDocuments(),
      Team.countDocuments(),
      Competition.countDocuments(),
      Application.countDocuments(),
      Competition.countDocuments({ status: "Active" }),
      Competition.countDocuments({ status: "Completed" }),
    ]);

    // Calculate growth percentages
    const previousPeriod = new Date();
    previousPeriod.setMonth(previousPeriod.getMonth() - 1);

    const [prevStudents, prevMentors, prevTeams, prevCompetitions] =
      await Promise.all([
        StudentProfile.countDocuments({ createdAt: { $lt: previousPeriod } }),
        Mentor.countDocuments({ createdAt: { $lt: previousPeriod } }),
        Team.countDocuments({ createdAt: { $lt: previousPeriod } }),
        Competition.countDocuments({ createdAt: { $lt: previousPeriod } }),
      ]);

    const growth = {
      students: prevStudents > 0 ? Math.round(((totalStudents - prevStudents) / prevStudents) * 100) : 100,
      mentors: prevMentors > 0 ? Math.round(((totalMentors - prevMentors) / prevMentors) * 100) : 100,
      teams: prevTeams > 0 ? Math.round(((totalTeams - prevTeams) / prevTeams) * 100) : 100,
      competitions: prevCompetitions > 0 ? Math.round(((totalCompetitions - prevCompetitions) / prevCompetitions) * 100) : 100,
    };

    // Get participation trends
    const monthlyData = await Promise.all([
      StudentProfile.aggregate([
        {
          $match: {
            createdAt: {
              $exists: true,
              $ne: null,
              $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Mentor.aggregate([
        {
          $match: {
            createdAt: {
              $exists: true,
              $ne: null,
              $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    // Format monthly data
    const months = getLast12Months();
    const monthlyStudents = Array(12).fill(0);
    const monthlyMentors = Array(12).fill(0);

    // Process student data
    monthlyData[0].forEach((item) => {
      const monthName = getMonthName(item._id.month);
      const key = `${monthName} ${item._id.year}`;
      const index = months.indexOf(key);
      if (index !== -1) {
        monthlyStudents[index] = item.count || 0;
      }
    });

    // Process mentor data
    monthlyData[1].forEach((item) => {
      const monthName = getMonthName(item._id.month);
      const key = `${monthName} ${item._id.year}`;
      const index = months.indexOf(key);
      if (index !== -1) {
        monthlyMentors[index] = item.count || 0;
      }
    });

    // Get domain participation
    const domainStats = await StudentProfile.aggregate([
      { $group: { _id: "$domain", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const byDomain = domainStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totals: {
          students: totalStudents,
          mentors: totalMentors,
          teams: totalTeams,
          competitions: totalCompetitions,
          applications: totalApplications,
          activeCompetitions,
          completedCompetitions,
        },
        growth,
        participation: {
          monthlyLabels: months,
          monthlyStudents,
          monthlyMentors,
          byDomain,
        },
      },
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Helper functions
function getLast12Months() {
  const months = [];
  const date = new Date();
  date.setDate(1); // Ensure we're at the start of the month

  for (let i = 0; i < 12; i++) {
    const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
    months.unshift(monthYear);
    date.setMonth(date.getMonth() - 1);
  }

  return months;
}

function getMonthName(monthNumber) {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString("default", { month: "short" });
}

// Competition Routes
router.get("/competitions", async (req, res) => {
  try {
    const competitions = await Competition.find().sort({ createdAt: -1 });
    res.json(competitions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Team Routes
router.get("/teams", async (req, res) => {
  try {
    const teams = await Team.find().sort({ createdAt: -1 });
    res.json({ success: true, data: teams });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mentor Routes
router.get("/mentor/mentors", async (req, res) => {
  try {
    const mentors = await Mentor.find();
    res.json(mentors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Application Routes
router.get("/applications", async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;
    
    const applications = await Application.find(query)
      .populate('competition', 'name category status date prizePool deadline')
      .populate('student', 'name email profilePicture department')
      .populate('team', 'name');
      
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;