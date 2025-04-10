 express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/StudentProfile'); // Import User model
const Invitation = require('../models/Invitation'); // Import Invitation model

const mongoose = require('mongoose');

router.post('/', async (req, res) => {
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
// Remove the duplicate /invite route and keep this improved version:
router.post('/invite', async (req, res) => {
  try {
    const { teamId, teammateId, message, createdBy } = req.body;
    
    // Validate all required fields
    if (!teamId || !teammateId || !createdBy) {
      return res.status(400).json({ 
        success: false,
        message: 'Team ID, teammate ID, and creator ID are required' 
      });
    }

    // Check if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ 
        success: false,
        message: 'Team not found' 
      });
    }

    // Check if team can accept members
    if (!['active', 'pending'].includes(team.status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Team is not accepting new members' 
      });
    }

    // Check if user exists
    const user = await User.findById(teammateId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check for existing invitation
    const existingInvite = await Invitation.findOne({
      team: teamId,
      user: teammateId,
      status: 'pending'
    });
    
    if (existingInvite) {
      return res.status(400).json({ 
        success: false,
        message: 'Pending invitation already exists' 
      });
    }

    // Create new invitation
    const newInvitation = new Invitation({
      team: teamId,
      user: teammateId,
      message: message || '',
      status: 'pending',
      createdBy: createdBy
    });

    await newInvitation.save();

    // Populate invitation data before returning
    const populatedInvite = await Invitation.findById(newInvitation._id)
      .populate('team', 'name')
      .populate('user', 'name rolePreference department profilePicture')
      .populate('createdBy', 'name profilePicture');

    res.status(201).json({
      success: true,
      data: populatedInvite
    });
  } catch (error) {
    console.error('Invitation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});
router.patch('/invite/:id/accept', async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) {
      return res.status(404).json({ 
        message: 'Invitation not found' 
      });
    }

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    // Add user to team
    const team = await Team.findById(invitation.team);
    if (!team) {
      return res.status(404).json({ 
        message: 'Team not found' 
      });
    }

    const user = await User.findById(invitation.user);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    team.members.push({
      id: user._id,
      name: user.name,
      role: user.rolePreference || 'Member',
      skills: user.skills || []
    });

    await team.save();

    res.status(200).json({
      message: 'Invitation accepted',
      team: team
    });
  } catch (error) {
    console.error('Error in /invite/:id/accept:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});



router.get('/invitations/sent/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    let invitations = [];

    // Check if it's a valid ObjectId
    const isObjectId = mongoose.Types.ObjectId.isValid(userId);

    if (isObjectId) {
      invitations = await Invitation.find({ createdBy: userId })
        .populate('team', 'name')
        .populate('user', 'name rolePreference department profilePicture')
        .sort({ createdAt: -1 });
    }

    // If no results or invalid ObjectId, try using UID
    if (invitations.length === 0) {
      const user = await User.findOne({ uid: userId });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found by UID'
        });
      }

      invitations = await Invitation.find({ createdBy: user._id })
        .populate('team', 'name')
        .populate('user', 'name department profilePicture')
        .sort({ createdAt: -1 });
    }

    return res.status(200).json({
      success: true,
      count: invitations.length,
      data: invitations
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching invitations',
      error: error.message
    });
  }
});

router.get('/invitations/received/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    let invitations = [];

    // Check if it's a valid ObjectId
    const isObjectId = mongoose.Types.ObjectId.isValid(userId);

    if (isObjectId) {
      invitations = await Invitation.find({ user: userId })
        .populate('team', 'name')
        .populate('createdBy', 'name rolePreference department profilePicture')
        .sort({ createdAt: -1 });
    }

    // If no results or invalid ObjectId, try using UID
    if (invitations.length === 0) {
      const user = await User.findOne({ uid: userId });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found by UID'
        });
      }

      invitations = await Invitation.find({ user: user._id })
        .populate('team', 'name')
        .populate('createdBy', 'name department profilePicture')
        .sort({ createdAt: -1 });
    }

    return res.status(200).json({
      success: true,
      count: invitations.length,
      data: invitations
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching invitations',
      error: error.message
    });
  }
});



// Get all invitations for a team (admin view)
router.get('/invitations/team/:teamId', async (req, res) => {
  try {
    const invitations = await Invitation.find({ team: req.params.teamId })
      .populate('user', 'name rolePreference department profilePicture')
      .populate('createdBy', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json(invitations);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching team invitations',
      error: error.message 
    });
  }
});

// Get a single invitation by ID
router.get('/invitations/:id', async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id)
      .populate('team', 'name')
      .populate('user', 'name rolePreference department profilePicture')
      .populate('createdBy', 'name profilePicture');

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    res.status(200).json(invitation);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching invitation',
      error: error.message 
    });
  }
});

// Update invitation status (accept/reject)
router.patch('/invitations/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const invitation = await Invitation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('team', 'name')
      .populate('user', 'name rolePreference department profilePicture');

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // If accepted, add user to team
    if (status === 'accepted') {
      const team = await Team.findById(invitation.team);
      const user = await User.findById(invitation.user);

      if (team && user) {
        // Check if user is already a member
        const isMember = team.members.some(m => m.id.toString() === user._id.toString());
        
        if (!isMember) {
          team.members.push({
            id: user._id,
            name: user.name,
            role: user.rolePreference || 'Member',
            skills: user.skills || []
          });
          await team.save();
        }
      }
    }

    res.status(200).json(invitation);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating invitation',
      error: error.message 
    });
  }
});

// In your backend routes
router.delete('/invitations/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid invitation ID format' 
      });
    }

    const invitation = await Invitation.findById(req.params.id);
    
    if (!invitation) {
      return res.status(404).json({ 
        success: false,
        message: 'Invitation not found' 
      });
    }

    console.log('Current invitation status:', invitation.status);
    
    if (invitation.status === 'accepted') {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot withdraw an accepted invitation' 
      });
    }

    invitation.status = 'withdrawn';
    await invitation.save();
    res.status(200).json({
      success: true,
      data: invitation
    });
  } catch (error) {
    console.error('SERVER ERROR:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during withdrawal',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;