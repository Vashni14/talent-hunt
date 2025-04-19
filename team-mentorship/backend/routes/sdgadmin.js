const express = require('express');
const router = express.Router();
const Competition = require('../models/Competition');
const Team = require('../models/Team');
const debug = require('debug')('sdg-analysis');

// Enhanced logger
const logger = {
  info: (message, data) => {
    debug(message, data);
    console.log(`[INFO] ${message}`, data || '');
  },
  error: (message, error) => {
    debug(message, error);
    console.error(`[ERROR] ${message}`, error);
  },
  debug: (message, data) => {
    debug(message, data);
    console.debug(`[DEBUG] ${message}`, data || '');
  }
};

/**
 * @route GET /api/sdg-analysis/stats
 * @description Get SDG statistics for dashboard
 */
router.get('/stats', async (req, res) => {
  logger.info('Fetching SDG stats started');
  
  try {
    // 1. Get competition data
    logger.info('Fetching competition stats');
    const competitionStats = await Competition.aggregate([
      { $unwind: "$sdgs" },
      { $match: { sdgs: { $exists: true, $ne: null } } },
      { $group: { 
        _id: "$sdgs",
        competitions: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] } },
        upcoming: { $sum: { $cond: [{ $eq: ["$status", "Upcoming"] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } }
      }},
      { $sort: { _id: 1 } }
    ]);

    logger.info(`Found ${competitionStats.length} competition records`);

    // 2. Get team data with improved query
    logger.info('Fetching team stats');
    const teamStats = await Team.aggregate([
      { 
        $match: { 
          sdgs: { $exists: true, $ne: null, $not: { $size: 0 } } // Only teams with non-empty sdgs array
        } 
      },
      { $unwind: "$sdgs" },
      { $group: { 
        _id: "$sdgs",
        teams: { $sum: 1 },
        members: { $sum: { $size: "$members" } }
      }},
      { $sort: { _id: 1 } }
    ]);

    logger.info(`Team stats aggregation result:`, teamStats);

    // 3. Build complete SDG stats
    logger.info('Building SDG stats response');
    const sdgStats = Array.from({ length: 17 }, (_, i) => {
      const sdgId = i + 1;
      const compStat = competitionStats.find(s => s._id === sdgId) || {};
      const teamStat = teamStats.find(s => s._id === sdgId) || {};
      
      return {
        sdgId,
        name: getSDGName(sdgId),
        competitions: compStat.competitions || 0,
        activeCompetitions: compStat.active || 0,
        upcomingCompetitions: compStat.upcoming || 0,
        completedCompetitions: compStat.completed || 0,
        teams: teamStat.teams || 0,
        members: teamStat.members || 0,
        coverage: calculateCoverage(sdgId, teamStats)
      };
    });

    // 4. Calculate totals
    const totalIndicators = sdgStats.reduce((sum, stat) => sum + stat.teams, 0);
    logger.info(`Calculated total indicators: ${totalIndicators}`);

    // 5. Build final response
    const response = {
      success: true,
      data: {
        sdgStats,
        totalGoals: 17,
        totalIndicators,
        lastUpdated: new Date()
      }
    };

    logger.info('SDG stats fetch completed successfully');
    res.json(response);

  } catch (err) {
    logger.error('Error in /stats endpoint', err);
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch SDG statistics',
      error: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        stack: err.stack
      } : undefined
    });
  }
});

// Helper function to calculate coverage percentage
function calculateCoverage(sdgId, teamStats) {
  try {
    const totalTeams = teamStats.reduce((sum, stat) => sum + (stat.teams || 0), 0);
    const sdgTeams = teamStats.find(s => s._id === sdgId)?.teams || 0;
    return totalTeams > 0 ? Math.round((sdgTeams / totalTeams) * 100) : 0;
  } catch (err) {
    logger.error(`Error calculating coverage for SDG ${sdgId}`, err);
    return 0;
  }
}

// Helper function to get SDG name
function getSDGName(sdgId) {
  const sdgNames = {
    1: 'No Poverty',
    2: 'Zero Hunger',
    3: 'Good Health',
    4: 'Quality Education',
    5: 'Gender Equality',
    6: 'Clean Water',
    7: 'Clean Energy',
    8: 'Economic Growth',
    9: 'Innovation',
    10: 'Reduced Inequality',
    11: 'Sustainable Cities',
    12: 'Responsible Consumption',
    13: 'Climate Action',
    14: 'Life Below Water',
    15: 'Life on Land',
    16: 'Peace & Justice',
    17: 'Partnerships'
  };
  return sdgNames[sdgId] || `SDG ${sdgId}`;
}

module.exports = router;