const express = require("express");
const router = express.Router();
const Team = require("../models/Team");
const StudentProfile = require("../models/StudentProfile");
const Mentor = require("../models/Mentor");
const Competition = require("../models/Competition");
const Application = require("../models/CompApplication");
const TeamOpening = require("../models/TeamOpening");
const mongoose = require("mongoose");

// Helper function to get last 12 months labels
const getLast12Months = () => {
  const months = [];
  const date = new Date();
  date.setDate(1); // Ensure we're at the start of the month

  for (let i = 0; i < 12; i++) {
    const monthYear = `${date.toLocaleString("default", {
      month: "short",
    })} ${date.getFullYear()}`;
    months.unshift(monthYear);
    date.setMonth(date.getMonth() - 1);
  }

  return months;
};

// Helper function to get month name
const getMonthName = (monthNumber) => {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString("default", { month: "short" });
};

// Dashboard analytics endpoint
router.get("/dashboard", async (req, res) => {
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
      completedCompetitions,
    ] = await Promise.all([
      StudentProfile.countDocuments(),
      Mentor.countDocuments(),
      Team.countDocuments(),
      Competition.countDocuments(),
      Application.countDocuments(),
      TeamOpening.countDocuments(),
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
      students:
        prevStudents > 0
          ? Math.round(((totalStudents - prevStudents) / prevStudents) * 100)
          : 100,
      mentors:
        prevMentors > 0
          ? Math.round(((totalMentors - prevMentors) / prevMentors) * 100)
          : 100,
      teams:
        prevTeams > 0
          ? Math.round(((totalTeams - prevTeams) / prevTeams) * 100)
          : 100,
      competitions:
        prevCompetitions > 0
          ? Math.round(
              ((totalCompetitions - prevCompetitions) / prevCompetitions) * 100
            )
          : 100,
    };

    // Get participation trends with null checks
    const monthlyData = await Promise.all([
      StudentProfile.aggregate([
        {
          $match: {
            createdAt: {
              $exists: true,
              $ne: null,
              $gte: new Date(
                new Date().setFullYear(new Date().getFullYear() - 1)
              ),
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
              $gte: new Date(
                new Date().setFullYear(new Date().getFullYear() - 1)
              ),
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

    // Format monthly data with proper error handling
    const months = getLast12Months();
    const monthlyStudents = Array(12).fill(0);
    const monthlyMentors = Array(12).fill(0);

    // Create a map of month-year to array index
    const monthIndexMap = {};
    months.forEach((month, index) => {
      const [monthName, year] = month.split(" ");
      monthIndexMap[`${monthName} ${year}`] = index;
    });

    // Process student data
    monthlyData[0].forEach((item) => {
      try {
        const monthName = getMonthName(item._id.month);
        const key = `${monthName} ${item._id.year}`;
        if (monthIndexMap[key] !== undefined) {
          monthlyStudents[monthIndexMap[key]] = item.count || 0;
        }
      } catch (err) {
        console.error("Error processing student data:", err);
      }
    });

    // Process mentor data
    monthlyData[1].forEach((item) => {
      try {
        const monthName = getMonthName(item._id.month);
        const key = `${monthName} ${item._id.year}`;
        if (monthIndexMap[key] !== undefined) {
          monthlyMentors[monthIndexMap[key]] = item.count || 0;
        }
      } catch (err) {
        console.error("Error processing mentor data:", err);
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

    // Get SDG engagement stats
    const sdgStats = await Team.aggregate([
      { $unwind: "$sdgs" },
      { $group: { _id: "$sdgs", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Get top skills - properly handling both name and skills fields
    const skillsStats = await StudentProfile.aggregate([
      {
        $project: {
          combinedSkills: {
            $ifNull: ["$skills", []], // Default to an empty array if skills is null
          },
        },
      },
      { $unwind: "$combinedSkills" }, // Unwind the skills array
      {
        $project: {
          skillName: "$combinedSkills.name", // Extract the skill name
        },
      },
      {
        $match: {
          skillName: { $ne: null, $exists: true }, // Ensure skillName is not null or undefined
        },
      },
      {
        $group: {
          _id: "$skillName", // Group by skill name
          count: { $sum: 1 }, // Count occurrences
        },
      },
      { $sort: { count: -1 } }, // Sort by count in descending order
      { $limit: 5 }, // Limit to top 5 skills
    ]);

    // Map the skillsStats to a readable format
    const formattedSkillsStats = skillsStats.map((skill) => ({
      skill: skill._id, // Skill name
      count: skill.count, // Count of occurrences
    }));
       // Get team performance metrics
    const performanceStats = await Team.aggregate([
      {
        $group: {
          _id: null,
          avgCompletion: { $avg: "$progress" },
          totalTasks: { $sum: "$tasks.total" },
          completedTasks: { $sum: "$tasks.completed" },
        },
      },
    ]);

    const performance = performanceStats[0] || {
      avgCompletion: 0,
      totalTasks: 0,
      completedTasks: 0,
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
          openings: totalOpenings,
        },
        growth,
        performance: {
          teamCompletion: Math.round(performance.avgCompletion) || 0,
          competitionSuccess:
            Math.round((completedCompetitions / totalCompetitions) * 100) || 0,
          taskCompletion:
            performance.totalTasks > 0
              ? Math.round(
                  (performance.completedTasks / performance.totalTasks) * 100
                )
              : 0,
        },
        participation: {
          monthlyLabels: months,
          monthlyStudents,
          monthlyMentors,
          byDomain,
        },
        sdgs: {
          top: sdgStats,
          totalCoverage: sdgStats.length,
        },
        skills: {
          top: formattedSkillsStats,
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

module.exports = router;
