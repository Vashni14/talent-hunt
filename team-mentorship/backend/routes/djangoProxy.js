const express = require('express');
const router = express.Router();
const axios = require('axios');

// Configure Django API base URL
const DJANGO_API = 'http://localhost:8000'; // Update if Django runs on different port

// Proxy to Django's complementary teammates endpoint
router.post('/find-complementary-teammates', async (req, res) => {
  try {
    // Remove trailing slash from Django API URL to match your frontend call
    const response = await axios.post(`${DJANGO_API}/api/find-complementary-teammates`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying to Django:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to get recommendations',
      details: error.response?.data || error.message 
    });
  }
});

// Proxy to get student profile
// routes/djangoProxy.js
router.get('/student-profile/:uid', async (req, res) => {
  try {
    const response = await axios.get(`${DJANGO_API}/api/student-profile/${req.params.uid}`);
    
    // Forward the response as-is
    res.json(response.data);
  } catch (error) {
    console.error('Error getting student profile:', error);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to get profile',
      details: error.response?.data || error.message 
    });
  }
});

module.exports = router;