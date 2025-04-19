const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const mongoose = require('mongoose');

// SDG metadata
const sdgMetadata = [
  { id: 1, name: "No Poverty", color: "bg-red-600", description: "End poverty in all its forms everywhere" },
  { id: 2, name: "Zero Hunger", color: "bg-orange-500", description: "End hunger, achieve food security and improved nutrition" },
  { id: 3, name: "Good Health", color: "bg-green-600", description: "Ensure healthy lives and promote well-being for all" },
  { id: 4, name: "Quality Education", color: "bg-red-500", description: "Ensure inclusive and equitable quality education" },
  { id: 5, name: "Gender Equality", color: "bg-yellow-500", description: "Achieve gender equality and empower all women and girls" },
  { id: 6, name: "Clean Water", color: "bg-blue-500", description: "Ensure availability of water and sanitation for all" },
  { id: 7, name: "Affordable Energy", color: "bg-yellow-600", description: "Ensure access to affordable, reliable energy" },
  { id: 8, name: "Decent Work", color: "bg-red-700", description: "Promote sustained economic growth and productive employment" },
  { id: 9, name: "Innovation", color: "bg-orange-600", description: "Build resilient infrastructure and foster innovation" },
  { id: 10, name: "Reduced Inequality", color: "bg-pink-600", description: "Reduce inequality within and among countries" },
  { id: 11, name: "Sustainable Cities", color: "bg-yellow-700", description: "Make cities inclusive, safe, resilient and sustainable" },
  { id: 12, name: "Responsible Consumption", color: "bg-amber-700", description: "Ensure sustainable consumption and production patterns" },
  { id: 13, name: "Climate Action", color: "bg-green-700", description: "Take urgent action to combat climate change" },
  { id: 14, name: "Life Below Water", color: "bg-blue-600", description: "Conserve and sustainably use the oceans and marine resources" },
  { id: 15, name: "Life on Land", color: "bg-green-800", description: "Protect and promote sustainable use of terrestrial ecosystems" },
  { id: 16, name: "Peace and Justice", color: "bg-blue-700", description: "Promote peaceful and inclusive societies" },
  { id: 17, name: "Partnerships", color: "bg-indigo-600", description: "Strengthen implementation and revitalize global partnerships" }
];

// Get all SDG metadata
router.get('/', (req, res) => {
  res.json(sdgMetadata);
});

// Get SDG statistics across all teams
router.get('/stats', async (req, res) => {
  try {
    const stats = await Team.aggregate([
      { $unwind: "$sdgs" },
      { $group: { _id: "$sdgs", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const formattedStats = sdgMetadata.map(sdg => {
      const stat = stats.find(s => s._id === sdg.id);
      return {
        ...sdg,
        count: stat ? stat.count : 0
      };
    });

    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update SDGs for a specific team
router.put('/team/:teamId', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { teamId } = req.params;
    const { sdgs } = req.body;

    // Validate teamId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid team ID format' 
      });
    }

    // Validate SDGs is an array
    if (!Array.isArray(sdgs)) {
      return res.status(400).json({ 
        success: false,
        message: 'SDGs must be an array' 
      });
    }

    // Validate each SDG is a number between 1-17
    const invalidSDGs = sdgs.filter(sdg => 
      !Number.isInteger(sdg) || sdg < 1 || sdg > 17
    );
    
    if (invalidSDGs.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid SDG values: ${invalidSDGs.join(', ')}`,
        validRange: 'SDGs must be numbers between 1-17'
      });
    }

    const team = await Team.findByIdAndUpdate(
      teamId,
      { 
        sdgs: [...new Set(sdgs)], // Remove duplicates
        updatedAt: new Date()
      },
      { new: true, session }
    );

    if (!team) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false,
        message: 'Team not found' 
      });
    }

    await session.commitTransaction();
    res.status(200).json({
      success: true,
      data: {
        _id: team._id,
        name: team.name,
        sdgs: team.sdgs
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('SDG update error:', {
      message: error.message,
      stack: error.stack,
      teamId,
      sdgs: req.body.sdgs
    });
    res.status(500).json({ 
      success: false,
      message: 'Server error updating SDGs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
});

// Get SDGs for a specific team
router.get('/team/:teamId', async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId).select('sdgs');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    
    const teamSDGs = sdgMetadata.filter(sdg => team.sdgs.includes(sdg.id));
    res.json(teamSDGs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;