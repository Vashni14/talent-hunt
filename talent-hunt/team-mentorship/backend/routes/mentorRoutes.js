const express = require('express');
const router = express.Router();
const Mentor = require('../models/Mentor');

// Get mentor data
router.get('/:uid', async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ userId: req.params.uid });
    res.json(mentor || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;