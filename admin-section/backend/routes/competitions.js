const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const Competition = require('../models/Competition');

// Get all competitions
router.get('/', async (req, res) => {
  try {
    const competitions = await Competition.find().sort({ createdAt: -1 });
    res.json(competitions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single competition
router.get('/:id', async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }
    res.json(competition);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new competition
// Create new competition
router.post('/', upload.single('photo'), async (req, res) => {
    try {
      // Parse requirements and SDGs safely
      let requirements = [];
      if (req.body.requirements) {
        try {
          requirements = JSON.parse(req.body.requirements);
        } catch (e) {
          // If not valid JSON, treat as comma-separated string
          requirements = req.body.requirements.split(',').map(item => item.trim());
        }
      }
  
      let sdgs = [];
      if (req.body.sdgs) {
        try {
          sdgs = JSON.parse(req.body.sdgs);
        } catch (e) {
          // If not valid JSON, try to parse as array
          sdgs = Array.isArray(req.body.sdgs) ? req.body.sdgs : [];
        }
      }
  
      const competition = new Competition({
        name: req.body.name,
        category: req.body.category,
        description: req.body.description,
        date: req.body.date,
        teamSize: req.body.teamSize,
        status: req.body.status,
        prizePool: req.body.prizePool,
        photo: req.file ? `/uploads/competitions/${req.file.filename}` : undefined,
        requirements: requirements,
        sdgs: sdgs
      });
  
      const savedCompetition = await competition.save();
      res.status(201).json(savedCompetition);
    } catch (err) {
      console.error('Error creating competition:', err);
      res.status(400).json({ 
        message: err.message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  });
  
  // Update competition
  router.put('/:id', upload.single('photo'), async (req, res) => {
    try {
      const competition = await Competition.findById(req.params.id);
      if (!competition) {
        return res.status(404).json({ message: 'Competition not found' });
      }
  
      // Parse requirements and SDGs safely
      let requirements = competition.requirements;
      if (req.body.requirements) {
        try {
          requirements = JSON.parse(req.body.requirements);
        } catch (e) {
          requirements = req.body.requirements.split(',').map(item => item.trim());
        }
      }
  
      let sdgs = competition.sdgs;
      if (req.body.sdgs) {
        try {
          sdgs = JSON.parse(req.body.sdgs);
        } catch (e) {
          sdgs = Array.isArray(req.body.sdgs) ? req.body.sdgs : [];
        }
      }
  
      competition.name = req.body.name || competition.name;
      competition.category = req.body.category || competition.category;
      competition.description = req.body.description || competition.description;
      competition.date = req.body.date || competition.date;
      competition.teamSize = req.body.teamSize || competition.teamSize;
      competition.status = req.body.status || competition.status;
      competition.prizePool = req.body.prizePool || competition.prizePool;
      
      if (req.file) {
        competition.photo = `/uploads/competitions/${req.file.filename}`;
      }
      
      competition.requirements = requirements;
      competition.sdgs = sdgs;
  
      const updatedCompetition = await competition.save();
      res.json(updatedCompetition);
    } catch (err) {
      console.error('Error updating competition:', err);
      res.status(400).json({ 
        message: err.message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  });

// Delete competition
router.delete('/:id', async (req, res) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    await Competition.deleteOne({ _id: req.params.id });
    res.json({ message: 'Competition deleted' });
  } catch (err) {
    console.error('Error deleting competition:', err);
    res.status(500).json({ 
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

module.exports = router;