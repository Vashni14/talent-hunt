const express = require('express');
const Mentor = require('../models/Mentor');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

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