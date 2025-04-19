const express = require('express');
const router = express.Router();
const axios = require('axios');

// Configure Django API base URL
const DJANGO_API = 'http://localhost:8000'; // Update if Django runs on different port

// Proxy to Django's complementary teammates endpoint
router.post('/find-complementary-teammates', async (req, res) => {
  try {
    const response = await axios.post(`${DJANGO_API}/api/find-complementary-teammates/`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying to Django:', error.message);
    res.status(500).json({ 
      error: 'Failed to get recommendations',
      details: error.response?.data || error.message 
    });
  }
});

// Proxy to get student profile
router.get('/student-profile/:uid', async (req, res) => {
    try {
      const response = await axios.get(`${DJANGO_API}/api/student/profile/${req.params.uid}`);
      
      // Transform response if needed to match expected format
      const transformed = {
        ...response.data,
        skills: response.data.skills || [], // Ensure skills exists
        // Add other transformations if needed
      };
      
      res.json(transformed);
    } catch (error) {
      console.error('Error getting student profile:', error);
      res.status(500).json({ 
        error: 'Failed to get profile',
        details: error.response?.data || error.message 
      });
    }
  });

module.exports = router;