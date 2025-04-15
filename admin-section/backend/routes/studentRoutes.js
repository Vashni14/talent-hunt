const express = require("express");
const router = express.Router();
const StudentProfile = require("../models/StudentProfile");
const upload = require("../middleware/upload"); // Import image upload middleware

// 🔹 Get Student Profile by UID
router.get("/profile/:uid", async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ uid: req.params.uid });
    if (!student) return res.status(404).json({ message: "Profile not found" });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
});
router.get("/profile", async (req, res) => {
  try {
    const students = await StudentProfile.find({});
    if (!students || students.length === 0) {
      return res.status(404).json({ message: "No profiles found" });
    }
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profiles", error });
  }
});
// In your student profile routes
router.get('/profile/username/:username', async (req, res) => {
  try {
    const user = await StudentProfile.findOne({ 
      name: { $regex: new RegExp(req.params.username, 'i') } 
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        profilePicture: user.profilePicture,
        skills: user.skills
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
