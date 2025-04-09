 express = require('express');
const router = express.Router();
const Team = require('../models/Team');

// Add this at the top of your routes
const validateTeamData = (req, res, next) => {
  const requiredFields = ['name', 'project', 'createdBy'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    return res.status(400).json({
      message: 'Missing required fields',
      missing: missingFields
    });
  }
  
  // Validate task counts are numbers
  if (req.body.tasks) {
    if (isNaN(req.body.tasks.total) || isNaN(req.body.tasks.completed)) {
      return res.status(400).json({
        message: 'Task counts must be numbers'
      });
    }
  }
  
  next();
};

router.post('/',validateTeamData, async (req, res) => {
  try {
    const teamData = {
      ...req.body,
      createdBy: req.body.createdBy, // Ensure this is required
      members: req.body.members || [], // Default empty array
      status: req.body.status || 'active' // Default status
    };
    
    const newTeam = new Team(teamData);
    const savedTeam = await newTeam.save();
    
    // Return the complete team with all populated fields
    const completeTeam = await Team.findById(savedTeam._id);
    res.status(201).json(completeTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all teams with optional status filter
router.get('/', async (req, res) => {
  try {
    const { status, userId } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (userId) query.$or = [
      { createdBy: userId },
      { 'members.id': userId }
    ];
    
    const teams = await Team.find(query).sort({ createdAt: -1 });
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get teams for specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { status } = req.query;
    const query = {
      $or: [
        { createdBy: req.params.userId },
        { 'members.id': req.params.userId }
      ]
    };
    
    if (status) query.status = status;
    
    const teams = await Team.find(query).sort({ createdAt: -1 });
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific team by ID
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a team
router.put('/:id', async (req, res) => {
  try {
    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!updatedTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.status(200).json(updatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a team
router.delete('/:id', async (req, res) => {
  try {
    const deletedTeam = await Team.findByIdAndDelete(req.params.id);
    
    if (!deletedTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a member to a team
router.post('/:id/members', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    const newMember = {
      ...req.body,
      id: Date.now().toString()
    };
    
    team.members.push(newMember);
    const updatedTeam = await team.save();
    
    res.status(200).json(updatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a team member
router.put('/:teamId/members/:memberId', async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const memberIndex = team.members.findIndex(m => m.id === req.params.memberId);
    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found' });
    }

    team.members[memberIndex] = {
      ...team.members[memberIndex],
      ...req.body
    };

    const updatedTeam = await team.save();
    res.status(200).json(updatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove a member from a team
router.delete('/:teamId/members/:memberId', async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    team.members = team.members.filter(m => m.id !== req.params.memberId);
    const updatedTeam = await team.save();
    
    res.status(200).json(updatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Complete a task
router.patch('/:id/tasks/complete', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    team.tasks.completed += 1;
    
    if (team.tasks.total > 0) {
      team.progress = Math.round((team.tasks.completed / team.tasks.total) * 100);
    }
    
    if (team.tasks.completed >= team.tasks.total) {
      team.status = 'completed';
    }
    
    team.updatedAt = Date.now();
    const updatedTeam = await team.save();
    
    res.status(200).json(updatedTeam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;