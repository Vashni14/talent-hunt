const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Application = require('../models/CompApplication');
const Competition = require('../models/Competition');
const Team = require('../models/Team');
const User = require('../models/StudentProfile'); // Import User model
const Mentor = require('../models/Mentor'); 

// Helper function to determine application status
const determineStatus = (dateRange) => {
  if (!dateRange) return 'Upcoming';
  
  const [startStr, endStr] = dateRange.split(' - ');
  const now = new Date();
  const nowUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  
  const startDate = new Date(startStr + 'T00:00:00Z');
  const endDate = new Date(endStr + 'T23:59:59Z');

  if (nowUTC < startDate) return 'Upcoming';
  if (nowUTC >= startDate && nowUTC <= endDate) return 'Active';
  return 'Completed';
};

// @route   POST /api/competitions/:id/apply
// @desc    Apply to a competition
// @access  Private (Student)
router.post('/:id/apply/:userId', async (req, res) => {
    try {
      const { motivation, skills, teamId, additionalInfo } = req.body;
      const competitionId = req.params.id;
      const userId = req.params.userId;
  
      // ===== INPUT VALIDATION =====
      // Validate IDs
      if (!mongoose.Types.ObjectId.isValid(competitionId)) {
        return res.status(400).json({ message: 'Invalid competition ID format' });
      }
      if (!mongoose.Types.ObjectId.isValid(teamId)) {
        return res.status(400).json({ message: 'Invalid team ID format' });
      }
  
      // Validate skills array
      if (!Array.isArray(skills)) {
        return res.status(400).json({ message: 'Skills must be an array' });
      }
  
      // Clean and validate skills
      const cleanedSkills = skills
        .map(skill => typeof skill === 'string' ? skill.trim() : String(skill).trim())
        .filter(skill => skill.length > 0);
  
      if (cleanedSkills.length === 0) {
        return res.status(400).json({ message: 'At least one valid skill is required' });
      }
  
      // Optional: Limit number of skills
      if (cleanedSkills.length > 10) {
        return res.status(400).json({ message: 'Maximum 10 skills allowed' });
      }
  
      // ===== DATABASE OPERATIONS =====
      // Find student document
      const student = await User.findOne({ uid: userId }).select('_id uid');
      if (!student) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check competition exists
      const competition = await Competition.findById(competitionId);
      if (!competition) {
        return res.status(404).json({ message: 'Competition not found' });
      }
  
      // Check deadline
      if (competition.deadline && new Date(competition.deadline) < new Date()) {
        return res.status(400).json({ message: 'Application deadline has passed' });
      }
  
      // Check team membership (creator or member)
      const team = await Team.findOne({
        _id: teamId,
        $or: [
          { createdBy: student.uid },
          { members: student._id }
        ]
      });
      if (!team) {
        return res.status(403).json({ message: 'You must be a team creator to apply' });
      }
  
      // Check for existing application (user or team)
      const existingApplication = await Application.findOne({
        competition: competitionId,
        $or: [
          { student: student._id },
          { team: teamId }
        ]
      });
      if (existingApplication) {
        const message = existingApplication.student.equals(student._id)
          ? 'You have already applied to this competition'
          : 'Your team has already applied to this competition';
        return res.status(409).json({ message });
      }
  
      // ===== CREATE APPLICATION =====
      const application = new Application({
        competition: competitionId,
        student: student._id,
        team: teamId,
        motivation: motivation?.trim() || '',
        skills: cleanedSkills,
        additionalInfo: additionalInfo?.trim() || '',
        status: 'pending',
        appliedAt: new Date()
      });
  
      await application.save();
  
      // ===== PREPARE RESPONSE =====
      const populatedApplication = await Application.findById(application._id)
        .populate('competition', 'name category status date prizePool')
        .populate('team', 'name members createdBy tasks')
        .populate('student', 'name email');
  
      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: populatedApplication
      });
  
    } catch (err) {
      console.error('Error submitting application:', err);
      
      // Specific error handling
      if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid ID format',
          error: 'Invalid identifier provided'
        });
      }
      
      if (err instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ 
          success: false,
          message: 'Validation failed',
          errors
        });
      }
  
      // Generic server error
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? {
          message: err.message,
          stack: err.stack
        } : undefined
      });
    }
  });


router.get('/me/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // First find the student document using Firebase UID
      const student = await User.findOne({ uid: userId }).select('_id');
      if (!student) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Now find applications using the student's ObjectId (_id)
      const applications = await Application.find({ student: student._id })
        .populate({
          path: 'competition',
          select: 'name category status date prizePool deadline photo description requirements sdgs'
        })
        .populate('team', 'name members createdBy')
        .sort({ appliedAt: -1 });
  
      // Add competition status based on current date
      const applicationsWithStatus = applications.map(app => {
        const competition = app.competition.toObject();
        return {
          ...app.toObject(),
          competition: {
            ...competition,
            status: determineStatus(competition.date)
          }
        };
      });
  
      res.json(applicationsWithStatus);
    } catch (err) {
      console.error('Error fetching applications:', err);
      
      if (err instanceof mongoose.Error.CastError) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      res.status(500).json({ 
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  });

// @route   PUT /api/applications/:id/result
// @desc    Update application result
// @access  Private (Student)
router.put('/:id/result/:userId',  async (req, res) => {
  try {
    const { result, analysis } = req.body;
    const applicationId = req.params.id;
    const userId = req.params.userId;
  
    // First find the student document using Firebase UID
    const student = await User.findOne({ uid: userId }).select('_id');
    if (!student) {
      return res.status(404).json({ message: 'User not found' });
    }

    const application = await Application.findOne({
      _id: applicationId,
      student: student._id
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Only allow updating result if application was accepted
    if (application.status !== 'accepted') {
      return res.status(400).json({ message: 'You can only update results for accepted applications' });
    }

    application.result = result;
    application.analysis = analysis;
    application.updatedAt = new Date();

    await application.save();

    res.json({
      message: 'Application result updated successfully',
      application
    });
  } catch (err) {
    console.error('Error updating application result:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   GET /api/applications
// @desc    Get all applications (Admin)
// @access  Private (Admin)
router.get('/', async (req, res) => {
    try {
  
      // Build query based on filters
      const { status, search, competition, sort } = req.query;
      const query = {};
      
      if (status && status !== 'all') {
        query.status = status;
      }
      
      if (competition) {
        query.competition = competition;
      }
      
      if (search) {
        query.$or = [
          { 'student.name': { $regex: search, $options: 'i' } },
          { 'competition.name': { $regex: search, $options: 'i' } }
        ];
      }
  
      // Build and execute query
      const applications = await Application.find(query)
        .populate({
          path: 'competition',
          select: 'name category status date prizePool deadline'
        })
        .populate('student', 'name email profilePicture department')
        .populate('team', 'name')
        .sort(sort === 'oldest' ? { appliedAt: 1 } : { appliedAt: -1 });
  
      res.json(applications);
    } catch (err) {
      console.error('Error fetching all applications:', err);
      res.status(500).json({ 
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  });
// Add this route to your competitionRoutes.js or similar file

// @route   GET /api/competitions/mentor/:mentorId
// @desc    Get competitions where mentor is involved
// @access  Private (Mentor)
// In your competitionRoutes.js
router.get('/mentor/:mentorId', async (req, res) => {
  try {
    const mentorId = req.params.mentorId;

    // Validate mentorId format
    if (!mongoose.Types.ObjectId.isValid(mentorId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid mentor ID format',
        error: 'Invalid ID'
      });
    }

    // 1. Find all teams where this mentor is listed
    const teams = await Team.find({ mentors: mentorId })
      .select('_id name')
      .lean();

    if (!teams || teams.length === 0) {
      return res.status(200).json({ 
        success: true,
        data: [],
        message: 'No teams found for this mentor'
      });
    }

    const teamIds = teams.map(team => team._id);

    // 2. Find all applications for these teams, populated with competition and team data
    const applications = await Application.find({ team: { $in: teamIds } })
      .populate({
        path: 'competition',
        select: 'name description category date prizePool deadline photo requirements sdgs status'
      })
      .populate('team', 'name members')
      .sort({ appliedAt: -1 }) // Sort by most recent first
      .lean();

    if (!applications || applications.length === 0) {
      return res.status(200).json({ 
        success: true,
        data: [],
        message: 'No applications found for mentor teams'
      });
    }

    // 3. Transform data into a more organized structure
    const result = applications.map(app => {
      // Calculate current competition status
      const status = determineStatus(app.competition?.date);
      
      return {
        competition: {
          ...app.competition,
          status, // Add calculated status
          deadline: app.competition?.deadline || null
        },
        application: {
          id: app._id,
          status: app.status,
          result: app.result || null,
          createdAt: app.createdAt,
          motivation: app.motivation || null,
          skills: app.skills || []
        },
        team: {
          id: app.team?._id || null,
          name: app.team?.name || 'Unknown Team',
          members: app.team?.members || []
        }
      };
    });

    res.status(200).json({
      success: true,
      data: result,
      message: 'Successfully fetched mentor competition data'
    });
    console.log('Mentor competition data:', result);

  } catch (err) {
    console.error('Error in /api/competitions/mentor/:mentorId:', err);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        stack: err.stack
      } : null
    });
  }
});
// @route   PUT /api/applications/:id/status
// @desc    Update application status (Admin)
// @access  Private (Admin)
router.put('/:id/status',  async (req, res) => {
  try {
    // Check if user is admin
    const { status } = req.body;
    const applicationId = req.params.id;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    application.updatedAt = new Date();

    await application.save();

    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (err) {
    console.error('Error updating application status:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;