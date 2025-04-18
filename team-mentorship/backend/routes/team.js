express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/StudentProfile'); // Import User model
const Invitation = require('../models/Invitation'); // Import Invitation model
const Mentor = require('../models/Mentor'); // Import Invitation model

const mongoose = require('mongoose');
const StudentProfile = require('../models/StudentProfile');
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

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

router.get('/user/:userId', async (req, res) => {
  console.log(`\n=== GET /user/${req.params.userId} ===`);
  console.log('Query params:', req.query);

  try {
    const { status, populateMembers } = req.query;

    let userId = req.params.userId;
    let userObjectId = null;
    let userUid = null;

    // If not a valid ObjectId, treat as UID and get corresponding ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('Looking up user by UID');
      const user = await User.findOne({ uid: userId }).select('_id uid');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      userObjectId = user._id;
      userUid = user.uid;
    } else {
      userObjectId = new mongoose.Types.ObjectId(userId);
    }

    // Build query conditions
    const orConditions = [];

    if (userObjectId) orConditions.push({ 'members.user': userObjectId });
    if (userUid) orConditions.push({ createdBy: userUid });
    else orConditions.push({ createdBy: userId }); // in case userId was a UID or already string

    const query = { $or: orConditions };

    // Optional status filter
    if (status) {
      const validStatuses = ['active', 'pending', 'completed', 'archived'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }
      query.status = status;
    }

    console.log('Final query:', query);

    // Build query
    let teamsQuery = Team.find(query).sort({ createdAt: -1 }).lean();

    // Optional population
    if (populateMembers === 'true') {
      teamsQuery = teamsQuery
        .populate({
          path: 'createdBy',
          select: 'name profilePicture rolePreference department',
          model: 'StudentProfile'
        })
        .populate({
          path: 'members.user',
          select: 'name profilePicture rolePreference department',
          model: 'StudentProfile'
        });
    }

    const teams = await teamsQuery.exec();

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams
    });

    console.log('teams:', teams);
    console.log('count:', teams.length);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

// In your backend route for adding members
// Updated backend route in teams.js
router.post('/:teamId/members', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId, role } = req.body;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(teamId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    // Find team and user
    const team = await Team.findById(teamId);
    const user = await StudentProfile.findById(userId);

    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Check if user is already a member
    const isMember = team.members.some(member => member.user.toString() === userId);
    if (isMember) {
      return res.status(400).json({ success: false, message: 'User already in team' });
    }

    // Add member
    team.members.push({
      user: userId,
      name: user.name,
      role: role || 'Member',
      avatar: user.profilePicture || '/default-avatar.png'
    });

    // Add team to user's teams array if not already present
    if (!user.teams.includes(teamId)) {
      user.teams.push(teamId);
      await user.save();
    }

    const updatedTeam = await team.save();
    
    res.status(200).json({
      success: true,
      data: await Team.findById(updatedTeam._id).populate('members.user', 'name profilePicture rolePreference')
    });

  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
// Updated DELETE route in your backend
router.delete('/:teamId/members/:userId', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { teamId, userId } = req.params;

    // 1. Validate team exists
    const team = await Team.findById(teamId).session(session);
    if (!team) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false, 
        message: 'Team not found' 
      });
    }

    // 2. Find user by UID (not ID)
    const user = await User.findOne({ uid: userId }).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // 3. Remove from team's members array
    const memberIndex = team.members.findIndex(m => 
      m.user.equals(user._id) || m.user === userId
    );
    
    if (memberIndex === -1) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: 'User not in team' 
      });
    }

    team.members.splice(memberIndex, 1);
    team.currentMembers = team.members.length;

    // 4. Remove team from user's teams array
    user.teams = user.teams.filter(t => !t.equals(team._id));

    // 5. Save both documents
    await team.save({ session });
    await user.save({ session });

    await session.commitTransaction();

    res.status(200).json({ 
      success: true,
      remainingMembers: team.members.length 
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Removal error:', {
      message: error.message,
      stack: error.stack,
      userId: req.params.userId,
      teamId: req.params.teamId
    });
    res.status(500).json({ 
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Server error during removal'
    });
  } finally {
    session.endSession();
  }
}); 

// Remove a member from a team
router.delete('/:teamId/delete/:memberId', async (req, res) => {
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
// Add this to your backend routes
router.get('/:teamId/verify-member/:userId', async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    
    const team = await Team.findById(teamId)
      .populate('members.user', 'uid');
    
    const isMember = team?.members.some(m => 
      m.user?.uid === userId || m.user?._id.toString() === userId
    );
    
    res.json({ isMember });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Verification failed' 
    });
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
// Get all members from all teams where user is mentor
router.get('/mentor/:mentorUid/members', async (req, res) => {
  try {
    const { mentorUid } = req.params;

    // 1. Find the mentor's MongoDB _id using their uid
    const mentor = await Mentor.findOne({ userId: mentorUid }).select('_id');
    
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    // 2. Find all teams where this mentor is assigned
    const teams = await Team.find({ mentors: mentor._id })
      .populate({
        path: 'members.user',
        model: 'StudentProfile',
        select: 'name email contact profilePicture rolePreference domain skills bio lastActive userId'
      })
      .select('name members sdgs status createdBy')
      .lean();
  
    if (!teams || teams.length === 0) {
      return res.json({
        success: true,
        count: 0,
        members: [],
        teams: []
      });
    }

    // 3. Get all creator UIDs to find in StudentProfile
    const creatorUids = teams.map(t => t.createdBy).filter(Boolean);
    
    // Find creators by userId field (Firebase UID)
    const creators = await User.find({ 
      uid: { $in: creatorUids } 
    }).select('name email contact profilePicture rolePreference domain skills bio lastActive uid').lean();
    
    const creatorMap = new Map(creators.map(c => [c.uid, c]));
    
    // 4. Process members with team info
    const memberMap = new Map();
    
    teams.forEach(team => {
      // Add team creator first (if exists)
      if (team.createdBy) {
        const creator = creatorMap.get(team.createdBy);
        if (creator) {
          const creatorData = {
            _id: creator._id,
            uid: creator.uid, // Use Firebase UID here
            name: creator.name,
            email: creator.email,
            contact: creator.contact,
            profilePicture: creator.profilePicture,
            rolePreference: creator.rolePreference,
            skills: creator.skills || [],
            bio: creator.bio,
            lastActive: creator.lastActive,
            teamId: team._id,
            teamName: team.name,
            teamStatus: team.status,
            teamSDGs: team.sdgs,
            memberRole: 'Team Creator',
            status: 'active'
          };
    
          if (!memberMap.has(creator.uid)) {  // Changed from creator.userId to creator.uid
            memberMap.set(creator.uid, creatorData);  // Changed from creator.userId to creator.uid
          }
        }
      }

      // Add regular team members
      team.members.forEach(member => {
        if (member.user) {
          const memberData = {
            _id: member.user._id,
            uid: member.user.userId, // Use Firebase UID here
            name: member.user.name,
            email: member.user.email,
            contact: member.user.contact,
            profilePicture: member.user.profilePicture,
            rolePreference: member.user.rolePreference,
            skills: member.user.skills || [],
            bio: member.user.bio,
            lastActive: member.user.lastActive,
            teamId: team._id,
            teamName: team.name,
            teamStatus: team.status,
            teamSDGs: team.sdgs,
            memberRole: 'Team Member',
            status: 'active'
          };

          if (!memberMap.has(member.user.userId)) {
            memberMap.set(member.user.userId, memberData);
          }
        }
      });
    });

    const uniqueMembers = Array.from(memberMap.values());

    // 5. Prepare team info for response
    const teamInfo = teams.map(t => ({
      _id: t._id,
      name: t.name,
      status: t.status,
      sdgs: t.sdgs,
      createdBy: t.createdBy ? {
        _id: t.createdBy,
        name: creatorMap.get(t.createdBy)?.name || 'Unknown'
      } : null
    }));

    res.json({
      success: true,
      count: uniqueMembers.length,
      members: uniqueMembers,
      teams: teamInfo
    });

  } catch (error) {
    console.error('Error fetching mentor members:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching members',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
});
// GET /api/teams/mentor/:mentorId - Get all teams for a specific mentor
router.get('/mentor/:mentorId', async (req, res) => {
  try {
    const { mentorId } = req.params;

    // Find teams where this mentor is in the mentors array
    const teams = await Team.find({ mentors: mentorId })
      .populate({
        path: 'members',
        select: 'name role profilePicture email'
      })
      .populate({
        path: 'mentors',
        select: 'name domain profilePicture currentPosition'
      })
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json({
      success: true,
      teams
    });

  } catch (error) {
    console.error('Error fetching mentor teams:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Remove mentor from team
router.delete('/:teamId/mentor', async (req, res) => {
  try {
    const { teamId } = req.params;
    
    // Verify team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if team has a mentor to remove
    if (!team.mentors) {
      return res.status(400).json({
        success: false,
        message: 'Team has no mentor assigned'
      });
    }

    // Remove mentor
    team.mentors = undefined;
    await team.save();

    res.json({
      success: true,
      message: 'Mentor removed successfully',
      team
    });

  } catch (error) {
    console.error('Error removing mentor:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});
router.patch('/invite/:id/accept', async (req, res) => {
  console.log('\n===== START INVITATION ACCEPTANCE =====');
  console.log('Headers:', req.headers);
  console.log('Params:', req.params);
  console.log('Body:', req.body);

  try {
    // 1. Verify database connection
    console.log('\n[1/7] Checking database connection...');
    const dbState = mongoose.connection.readyState;
    console.log('Mongoose connection state:', dbState, 
      dbState === 1 ? 'Connected' : 'Disconnected');

    if (dbState !== 1) {
      throw new Error('Database not connected');
    }

    // 2. Find invitation
    console.log('\n[2/7] Finding invitation...');
    const invitation = await Invitation.findById(req.params.id).lean();
    console.log('Invitation found:', invitation);

    if (!invitation) {
      console.log('Invitation not found');
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    // 3. Verify team exists
    console.log('\n[3/7] Finding team...');
    const team = await Team.findById(invitation.team).lean();
    console.log('Team found:', team);

    if (!team) {
      console.log('Team not found');
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // 4. Verify user exists
    console.log('\n[4/7] Finding user...');
    const user = await StudentProfile.findById(invitation.user).lean();
    console.log('User found:', user);

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 5. Update invitation status
    console.log('\n[5/7] Updating invitation status...');
    const updatedInvitation = await Invitation.findByIdAndUpdate(
      req.params.id,
      { status: 'accepted' },
      { new: true }
    );
    console.log('Updated invitation:', updatedInvitation);

    // 6. Add user to team
    console.log('\n[6/7] Adding user to team...');
    const updatedTeam = await Team.findByIdAndUpdate(
      team._id,
      {
        $addToSet: {
          members: {
            user: user._id,
            name: user.name,
            role: user.rolePreference || 'Member',
            avatar: user.profilePicture || '/default-avatar.png'
          }
        }
      },
      { new: true }
    );
    console.log('Updated team:', updatedTeam);

    // 7. Add team to user
    console.log('\n[7/7] Adding team to user...');
    const updatedUser = await StudentProfile.findByIdAndUpdate(
      user._id,
      { $addToSet: { teams: team._id } },
      { new: true }
    );
    console.log('Updated user:', updatedUser);

    console.log('\n===== PROCESS COMPLETE =====');
    res.status(200).json({
      success: true,
      invitation: updatedInvitation,
      team: updatedTeam,
      user: updatedUser
    });

  } catch (error) {
    console.error('\n!!!!! ERROR !!!!!');
    console.error('Error:', error);
    console.error('Error stack:', error.stack);
    console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
router.put('/invitations/:id', async (req, res) => {
  console.log('\n=== PUT /invitations/:id ===');
  console.log('Params:', req.params);
  console.log('Body:', req.body);

  try {
    const { status } = req.body;
    
    // Validate status
    if (!['pending', 'accepted', 'rejected', 'withdrawn'].includes(status)) {
      console.log('Invalid status value:', status);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status value' 
      });
    }

    // Find and populate invitation
    console.log('\n[1/4] Finding invitation...');
    const invitation = await Invitation.findById(req.params.id)
      .populate('team', 'name members')
      .populate('user', 'name rolePreference department profilePicture teams')
      .populate('createdBy', 'name profilePicture');

    if (!invitation) {
      console.log('Invitation not found');
      return res.status(404).json({ 
        success: false,
        message: 'Invitation not found' 
      });
    }
    console.log('Found invitation:', invitation._id);

    // Check if already processed
    if (invitation.status !== 'pending') {
      console.log('Invitation already processed with status:', invitation.status);
      return res.status(400).json({ 
        success: false,
        message: `Invitation already ${invitation.status}`
      });
    }

    // Update invitation status
    console.log('\n[2/4] Updating invitation status to:', status);
    invitation.status = status;
    await invitation.save();

    // Special handling for accepted invitations
    if (status === 'accepted') {
      console.log('\n[3/4] Processing acceptance...');
      
      const team = invitation.team;
      const user = invitation.user;

      // Add user to team if not already a member
      const isTeamMember = team.members.some(member => 
        member.user && member.user.toString() === user._id.toString()
      );

      if (!isTeamMember) {
        console.log('Adding user to team members');
        team.members.push({
          user: user._id,
          name: user.name,
          role: user.rolePreference || 'Member',
          avatar: user.profilePicture || '/default-avatar.png',
          joinedAt: new Date()
        });
        await team.save();
        console.log('Team members after update:', team.members.length);
      } else {
        console.log('User already in team members');
      }

      // Add team to user's teams if not already present
      const hasTeam = user.teams.some(teamId => 
        teamId.toString() === team._id.toString()
      );

      if (!hasTeam) {
        console.log('Adding team to user teams');
        user.teams.push(team._id);
        await user.save();
        console.log('User teams after update:', user.teams.length);
      } else {
        console.log('Team already in user teams');
      }
    }

    console.log('\n[4/4] Operation complete');
    res.status(200).json({
      success: true,
      data: {
        invitation,
        team: invitation.team,
        user: invitation.user
      }
    });

  } catch (error) {
    console.error('\n!!! ERROR !!!');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({ 
      success: false,
      message: 'Server error updating invitation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
