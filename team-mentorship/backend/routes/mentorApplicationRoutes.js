const express = require('express');
const router = express.Router();
const MentorApplication = require('../models/MentorApplication');
const Team = require('../models/Team');
const Mentor = require('../models/Mentor');

// Helper function to get applications with populated data
const getPopulatedApplications = async (query) => {
  return await MentorApplication.find(query)
    .populate({
      path: 'mentor',
      select: 'name domain profilePicture currentPosition'
    })
    .populate({
      path: 'team',
      select: 'name description sdgs members createdAt',
      populate: {
        path: 'members',
        select: 'name role profilePicture'
      }
    });
};

// POST /api/mentor/applications - Create new application
router.post('/applications', async (req, res) => {
  try {
    const { mentor, team, message } = req.body;

    // Validate input
    if (!mentor || !team || !message) {
      return res.status(400).json({ 
        success: false,
        message: 'Mentor ID, team ID and message are required' 
      });
    }

    // Check if mentor exists
    const mentorExists = await Mentor.findById(mentor);
    if (!mentorExists) {
      return res.status(404).json({ 
        success: false,
        message: 'Mentor not found' 
      });
    }

    // Check if team exists
    const teamExists = await Team.findById(team);
    if (!teamExists) {
      return res.status(404).json({ 
        success: false,
        message: 'Team not found' 
      });
    }

    // Check for duplicate pending/accepted application
    const existingApplication = await MentorApplication.findOne({ 
      mentor, 
      team,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: existingApplication.status === 'accepted' 
          ? 'This mentor has already accepted your team' 
          : 'Application already sent to this mentor'
      });
    }

    // Create new application
    const application = new MentorApplication({
      mentor,
      team,
      message
    });

    await application.save();

    // Populate the response data
    const populatedApp = await MentorApplication.findById(application._id)
      .populate('mentor', 'name domain profilePicture')
      .populate('team', 'name');

    res.status(201).json({
      success: true,
      message: 'Application sent successfully',
      application: populatedApp
    });

  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// GET /api/mentor/applications/mentor/:mentorId - Get applications for mentor
router.get('/applications/mentor/:mentorId', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { status } = req.query;

    let query = { mentor: mentorId };
    if (status) {
      query.status = status;
    }

    const applications = await getPopulatedApplications(query);

    res.json({
      success: true,
      applications
    });

  } catch (error) {
    console.error('Error fetching mentor applications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// GET /api/mentor/applications/team/:teamId - Get applications for team
router.get('/applications/team/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { status } = req.query;

    let query = { team: teamId };
    if (status) {
      query.status = status;
    }

    const applications = await getPopulatedApplications(query);

    res.json({
      success: true,
      applications
    });

  } catch (error) {
    console.error('Error fetching team applications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// PATCH /api/mentor/applications/:id - Update application status
router.patch('/applications/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      // Validate status
      if (!['accepted', 'rejected', 'pending'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }
  
      // Update application and populate mentor (singular) and team with its mentors (plural)
      const application = await MentorApplication.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      )
      .populate({
        path: 'mentor',  // Singular - from Mentor model
        select: 'name domain profilePicture'
      })
      .populate({
        path: 'team',
        select: 'name description members mentors',
        populate: [
          {
            path: 'members',
            select: 'name role profilePicture'
          },
          {
            path: 'mentors',  // Plural - array in Team model
            select: 'name domain profilePicture'
          }
        ]
      });
  
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }
  
      // Handle accepted status
      if (status === 'accepted') {
        // Reject other pending applications for this team
        await MentorApplication.updateMany(
          {
            team: application.team._id,
            status: 'pending',
            _id: { $ne: application._id }
          },
          { status: 'rejected' }
        );
  
        // Add mentor to team's mentors array (plural)
        await Team.findByIdAndUpdate(
          application.team._id,
          { $addToSet: { mentors: application.mentor._id } }  // Adding to plural array
        );
  
        // Optional: Fetch updated team with populated mentors if needed
        const updatedTeam = await Team.findById(application.team._id)
          .populate('mentors', 'name domain profilePicture');
        console.log('Updated team mentors:', updatedTeam.mentors);
      }
  
      res.json({
        success: true,
        message: 'Application status updated',
        application
      });
  
    } catch (error) {
      console.error('Error updating application:', error);
      res.status(500).json({ 
        success: false,
        message: 'Server error',
        error: error.message 
      });
    }
  });
// DELETE /api/mentor/applications/:id - Withdraw application
router.delete('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const application = await MentorApplication.findByIdAndDelete(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });

  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;