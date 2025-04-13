const express = require('express');
const router = express.Router();
const { Team } = require('../models/Team');
const TeamOpening  = require('../models/TeamOpening');
const { Application } = require('../models/Application');
const { StudentProfile } = require('../models/StudentProfile');

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

// PUT /api/openings/:openingId - Update opening
router.put('/openings/:openingId', async (req, res) => {
  try {
    const opening = await TeamOpening.findOne({
      _id: req.params.openingId,
      createdBy: req.user.id
    }).populate('team');

    if (!opening) return res.status(404).json({ error: 'Opening not found' });

    // Validate seat changes
    if (req.body.seatsAvailable) {
      const availableSeats = opening.team.maxMembers - opening.team.currentMembers;
      if (req.body.seatsAvailable > availableSeats + opening.seatsAvailable) {
        return res.status(400).json({ 
          error: `Only ${availableSeats + opening.seatsAvailable} total seats available` 
        });
      }
    }

    Object.assign(opening, req.body);
    await opening.save();
    res.json(opening);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/openings/:openingId - Close opening
router.delete('/openings/:openingId', async (req, res) => {
  try {
    const opening = await TeamOpening.findOneAndDelete({
      _id: req.params.openingId,
      createdBy: req.user.id
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
    const opening = await TeamOpening.findOne({
      _id: req.params.openingId,
      status: 'open'
    });
    
    if (!opening) return res.status(404).json({ error: 'Opening not available' });

    // Check if already applied
    const existingApp = await Application.findOne({
      opening: req.params.openingId,
      applicant: req.user.id
    });
    
    if (existingApp) {
      return res.status(400).json({ error: 'Already applied to this opening' });
    }

    // Get applicant skills from profile
    const profile = await StudentProfile.findOne({ uid: req.user.id });
    const applicantSkills = profile?.skills?.map(s => s.name) || [];

    const application = new Application({
      opening: req.params.openingId,
      applicant: req.user.id,
      message: req.body.message,
      skills: applicantSkills
    });

    await application.save();
    
    // Add to team's applications array
    await Team.updateOne(
      { _id: opening.team },
      { $push: { 
        applications: {
          user: req.user.id,
          message: req.body.message,
          skills: applicantSkills,
          status: 'pending'
        }
      }}
    );

    res.status(201).json(application);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/applications/sent - Get applications I've sent
router.get('/applications/sent', async (req, res) => {
  try {
    const applications = await Application.find({ 
      applicant: req.user.id 
    })
      .populate({
        path: 'opening',
        populate: {
          path: 'team',
          select: 'name logo'
        }
      })
      .sort('-appliedAt');

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/applications/received - Get applications to my teams
router.get('/applications/received', async (req, res) => {
  try {
    // Find openings I created
    const openings = await TeamOpening.find({ 
      createdBy: req.user.id 
    }).select('_id');

    const applications = await Application.find({
      opening: { $in: openings.map(o => o._id) }
    })
      .populate('applicant', 'name profilePicture')
      .populate({
        path: 'opening',
        select: 'title team',
        populate: {
          path: 'team',
          select: 'name'
        }
      })
      .sort('-appliedAt');

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/applications/:applicationId - Update application status
router.put('/applications/:applicationId', async (req, res) => {
  try {
    // Find application and verify ownership
    const application = await Application.findById(req.params.applicationId)
      .populate('opening');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const isOwner = await TeamOpening.exists({
      _id: application.opening._id,
      createdBy: req.user.id
    });

    if (!isOwner) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Validate status transition
    const validTransitions = {
      pending: ['accepted', 'rejected'],
      accepted: [],
      rejected: []
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

    // If accepted, add to team members
    if (req.body.status === 'accepted') {
      const profile = await StudentProfile.findOne({ uid: application.applicant });
      
      await Team.updateOne(
        { _id: application.opening.team },
        { 
          $push: { 
            members: {
              user: application.applicant,
              name: profile?.name || 'New Member',
              role: 'Member',
              avatar: profile?.profilePicture
            }
          },
          $inc: { currentMembers: 1 }
        }
      );

      // Reduce available seats
      await TeamOpening.updateOne(
        { _id: application.opening._id },
        { $inc: { seatsAvailable: -1 } }
      );
    }

    res.json(application);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/applications/:applicationId - Withdraw application
router.delete('/applications/:applicationId', async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.applicationId,
      applicant: req.user.id,
      status: 'pending'
    });

    if (!application) {
      return res.status(404).json({ 
        error: 'Application not found or cannot be withdrawn' 
      });
    }

    // Remove from team's applications array
    await Team.updateOne(
      { _id: application.opening.team },
      { $pull: { applications: { _id: req.params.applicationId } } }
    );

    res.json({ message: 'Application withdrawn' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
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
      .populate('createdBy', 'name profilePicture');

    if (!opening) {
      return res.status(404).json({ error: 'Opening not found' });
    }

    res.json(opening);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;