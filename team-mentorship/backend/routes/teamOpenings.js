const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const TeamOpening  = require('../models/TeamOpening');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');
const mongoose = require('mongoose')
// 1. Team Opening Management Routes

// GET /api/teams/my - List teams I own
// In your backend routes (Express.js example)
router.get('/api/teams/my', async (req, res) => {
  try {
    // Get user ID from verified Firebase token
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    
    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    // Query teams created by this user
    const teams = await Team.find({ createdBy: userId });
    res.json(teams);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// POST /api/teams/openings - Create new opening using team name
router.post('/teams/openings', async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.team || !req.body.title || !req.body.description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Create opening
    const teamData = {
      team: req.body.team,
      title: req.body.title,
      description: req.body.description,
      skillsNeeded: req.body.skillsNeeded || [],
      seatsAvailable: req.body.seatsAvailable || 1,
      deadline: req.body.deadline || null,
      contactEmail: req.body.contactEmail || '',
      status: req.body.status || 'open',
      createdBy:req.body.createdBy
    };

    const newTeamOpening = new TeamOpening(teamData);
    const savedTeamOpening = await newTeamOpening.save();

    res.status(201).json(savedTeamOpening);
    
  } catch (err) {
    console.error('Error creating opening:', err);
    res.status(400).json({ 
      error: err.message,
      details: err.errors // Mongoose validation errors
    });
  }
});
// Get all openings posted by a specific user
router.get('/openings/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Find all openings where createdBy matches the userId
    const openings = await TeamOpening.find({ createdBy: userId })
      .populate('team', 'name') // Populate team name and logo
      .sort({ createdAt: -1 }); // Sort by newest first

    // If no openings found, return empty array rather than 404
    res.status(200).json(openings || []);

  } catch (err) {
    console.error('Error fetching user openings:', err);
    res.status(500).json({ 
      error: 'Server error while fetching openings',
      details: err.message
    });
  }
});
// GET /api/teams/:teamId/openings - List team's openings
router.get('/teams/:teamId/openings', async (req, res) => {
  try {
    const openings = await TeamOpening.find({ 
      team: req.params.teamId 
    }).sort('-createdAt');
    res.json(openings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


router.put('/openings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedOpening = await TeamOpening.findByIdAndUpdate(
      id, 
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedOpening) {
      return res.status(404).json({ error: 'Opening not found' });
    }

    res.json(updatedOpening);
  } catch (err) {
    console.error('Error updating opening:', err);
    res.status(400).json({ 
      error: err.message,
      details: err.errors
    });
  }
});

// DELETE /api/openings/:openingId - Close opening
router.delete('/openings/:openingId', async (req, res) => {
  try {
    const opening = await TeamOpening.findOneAndDelete({
      _id: req.params.openingId,
    });

    if (!opening) return res.status(404).json({ error: 'Opening not found' });

    // Check if team has other openings
    const hasOtherOpenings = await TeamOpening.exists({
      team: opening.team,
      status: 'open'
    });

    // Update team status if no more openings
    if (!hasOtherOpenings) {
      await Team.updateOne(
        { _id: opening.team },
        { status: 'active' }
      );
    }

    res.json({ message: 'Opening closed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Application System Routes

// POST /api/openings/:openingId/apply - Apply to opening
router.post('/openings/:openingId/apply', async (req, res) => {
  try {
    // 1. Validate input
    if (!req.body.userId || !req.body.message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['userId', 'message']
      });
    }

    // 2. Find user by Firebase UID (now properly imported)
    const user = await StudentProfile.findOne({ uid: req.body.userId });
    console.log(user); // Debug log

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        userId: req.body.userId
      });
    }

    // 3. Verify opening exists and is open
    const opening = await TeamOpening.findOne({
      _id: req.params.openingId,
      status: 'open'
    });

    if (!opening) {
      return res.status(404).json({ 
        error: 'Opening not available',
        openingId: req.params.openingId
      });
    }

    // 4. Check for existing application using ObjectId reference
    const existingApp = await Application.findOne({
      opening: req.params.openingId,
      applicant: user._id // Using MongoDB ObjectId
    });

    if (existingApp) {
      return res.status(409).json({ 
        error: 'Already applied to this opening',
        applicationId: existingApp._id
      });
    }

    // 5. Create new application with ObjectId reference
    const newApplication = await Application.create({
      opening: req.params.openingId,
      applicant: user._id, // MongoDB ObjectId
      message: req.body.message,
      status: 'pending'
    });

    // 6. Update Team's applications array
    await Team.findByIdAndUpdate(
      opening.team,
      { 
        $push: { 
          applications: {
            _id: newApplication._id,
            user: user._id, // MongoDB ObjectId
            message: req.body.message,
            status: 'pending',
            appliedAt: new Date()
          }
        }
      }
    );

    // 7. Return success response with populated data
    const result = await Application.findById(newApplication._id)
      .populate('opening', 'title team')
      .populate('applicant', 'name contact uid') // Populate user details
      .lean();

    res.status(201).json({
      success: true,
      application: result
    });

  } catch (err) {
    console.error('Application Error:', {
      params: req.params,
      body: req.body,
      error: err.message,
      stack: err.stack
    });

    res.status(500).json({ 
      error: 'Application processing failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});


// GET /api/applications/sent - Get applications I've sent
router.get('/applications/sent/:userId', async (req, res) => {
  try {
    // 1. Get the Firebase UID from the URL parameter
    const firebaseUid = req.params.userId;
    if (!firebaseUid) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // 2. Find the corresponding MongoDB user document
    const user = await StudentProfile.findOne({ uid: firebaseUid });
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // 3. Find applications using the MongoDB ObjectId
    const applications = await Application.find({ 
      applicant: user._id 
    })
    .populate({
      path: 'opening',
      populate: {
        path: 'team',
        select: 'name'
      }
    })
    .sort('-appliedAt');

    res.json(applications);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// GET /api/applications/received - Get applications to my teams
router.get('/applications/received/:userId', async (req, res) => {
  try {
    // 1. Get the Firebase UID from URL params
    const firebaseUid = req.params.userId;
    if (!firebaseUid) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // 2. Find the corresponding MongoDB user document
    const user = await StudentProfile.findOne({ uid: firebaseUid });
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // 3. Find openings created by this user
    const openings = await TeamOpening.find({ 
      createdBy: firebaseUid 
    }).select('_id');

    // 4. Find applications for these openings
    const applications = await Application.find({
      opening: { $in: openings.map(o => o._id) }
    })
      .populate('applicant', 'name profilePicture uid')
      .populate({
        path: 'opening',
        select: 'title team',
        populate: {
          path: 'team',
          select: 'name logo'
        }
      })
      .sort('-appliedAt');

    res.json(applications || []);

  } catch (err) {
    console.error('Error fetching received applications:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// PUT /api/applications/:applicationId - Update application status
router.put('/applications/:applicationId', async (req, res) => {
  try {
    // Find application and verify ownership
    const application = await Application.findById(req.params.applicationId)
      .populate('opening')
      .populate('applicant');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Validate status transition
    const validTransitions = {
      pending: ['accepted', 'rejected'],
      accepted: [],
      rejected: [],
    };

    if (!validTransitions[application.status].includes(req.body.status)) {
      return res.status(400).json({ 
        error: `Cannot change status from ${application.status} to ${req.body.status}`
      });
    }

    // Update application
    application.status = req.body.status;
    await application.save();

    // Update in team's applications array
    await Team.updateOne(
      { 
        _id: application.opening.team,
        'applications._id': req.params.applicationId 
      },
      { $set: { 'applications.$.status': req.body.status } }
    );

    // If status is accepted, add user to team and team to user
    if (req.body.status === 'accepted') {
      // Add user to team members
      await Team.updateOne(
        { _id: application.opening.team },
        { $addToSet:{ members: {
          user: application.applicant._id,
          name: application.applicant.name,
          role: application.applicant.rolePreference || 'Member',
          avatar: application.applicant.profilePicture || '/default-avatar.png'
        }} }
      );

      // Add team to user's teams
      await StudentProfile.updateOne(
        { _id: application.applicant._id },
        { $addToSet: { teams: application.opening.team } }
      );

      const populatedTeam = await Team.findById(application.opening.team)
    .populate({
      path: 'members',
      select: 'name contact avatar role' // Include all fields you need
    })
    .populate('createdBy', 'name contact'); // Also populate other relations if needed

  // 4. Include this in the response
  application.team = populatedTeam;

      // Close the opening if it's set to close on acceptance
      if (application.opening.closeOnAccept) {
        await TeamOpening.updateOne(
          { _id: application.opening._id },
          { $set: { status: 'closed' } }
        );
      }
    }

    res.json(application);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/applications/:applicationId - Withdraw application

// Add new dedicated DELETE route for withdrawals
router.delete('/applications/:applicationId/withdraw', async (req, res) => {
  console.log('[WITHDRAW] Request received:', req.params);
  
  try {
    const { applicationId } = req.params;

    // Validate application ID
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid application ID'
      });
    }

    // Find and update the application
    const updatedApp = await Application.findOneAndUpdate(
      {
        _id: applicationId,
        status: 'pending' // Only allow withdrawal of pending applications
      },
      {
        status: 'withdrawn',
        withdrawnAt: new Date()
      },
      { new: true }
    );

    if (!updatedApp) {
      return res.status(404).json({
        success: false,
        error: 'Application not found or cannot be withdrawn'
      });
    }

    // Update team's applications array
    const opening = await TeamOpening.findById(updatedApp.opening);
    if (opening) {
      await Team.updateOne(
        { _id: opening.team },
        { 
          $pull: { applications: { _id: applicationId } },
          $push: { withdrawnApplications: applicationId }
        }
      );
    }

    console.log('[WITHDRAW] Success:', updatedApp._id);
    res.json({
      success: true,
      message: 'Application withdrawn successfully',
      application: updatedApp
    });

  } catch (err) {
    console.error('[WITHDRAW] Error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error during withdrawal'
    });
  }
});

// 3. Browse Openings Routes

// GET /api/openings - List active openings
router.get('/openings', async (req, res) => {
  try {
    const { skills, limit = 20, team } = req.query;
    const filter = { status: 'open' };

    if (skills) {
      filter.skillsNeeded = { $in: skills.split(',') };
    }

    if (team) {
      filter.team = team;
    }

    const openings = await TeamOpening.find(filter)
      .populate('team', 'name logo description createdBy')
      .sort('-createdAt')
      .limit(parseInt(limit));

    res.json(openings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/openings/:openingId - Get opening details
router.get('/openings/:openingId', async (req, res) => {
  try {
    const opening = await TeamOpening.findById(req.params.openingId)
      .populate('team', 'name logo description createdBy')
      .populate('createdBy', 'name profilePicture uid');

    if (!opening) {
      return res.status(404).json({ error: 'Opening not found' });
    }

    res.json(opening);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;