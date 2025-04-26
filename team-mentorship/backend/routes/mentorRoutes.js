const express = require('express');
const Mentor = require('../models/Mentor');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// DELETE /api/mentor/profile/:id - Delete a mentor profile
router.delete('/profile/:id', async (req, res) => {
  try {
    // Find the mentor by ID
    const mentor = await Mentor.findById(req.params.id);
    
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }

    // Delete the mentor
    await Mentor.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true, 
      message: 'Mentor profile deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting mentor:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting mentor',
      error: err.message 
    });
  }
});
// Get mentor profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ userId: req.params.userId });
    
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    
    res.json(mentor);
  } catch (error) {
    console.error('Error fetching mentor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/profile/id/:userId', async (req, res) => {
    try {
      const mentor = await Mentor.findById({ _id:req.params.userId });
      
      if (!mentor) {
        return res.status(404).json({ message: 'Mentor not found' });
      }
      
      res.json(mentor);
    } catch (error) {
      console.error('Error fetching mentor profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

 // Update mentor profile
router.put('/profile/:userId', upload.single('profilePicture'), async (req, res) => {
  try {
    const { name, bio, domain, skills, experience, education, linkedin, currentPosition,email } = req.body;
    const updatedData = {
      name,
      bio,
      domain,
      email,
      skills: Array.isArray(skills) ? skills : skills.split(',').map(skill => skill.trim()),
      experience,
      education,
      linkedin,
      currentPosition,
      updatedAt: Date.now()
    };

    // If a file was uploaded, add it to the update
    if (req.file) {
      updatedData.profilePicture = `/uploads/${req.file.filename}`;
    }
    
    const mentor = await Mentor.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: updatedData },
      { new: true, upsert: true }
    );
    res.json(mentor);
  } catch (error) {
    console.error('Error updating mentor profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
  // Get all mentors
router.get('/mentors', async (req, res) => {
    try {
      const mentors = await Mentor.find({});
      res.json(mentors);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;