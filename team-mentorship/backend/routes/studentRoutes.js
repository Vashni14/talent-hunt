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
// 🔹 Create/Update Student Profile
router.post("/profile", upload.single("profilePicture"), async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      // Delete uploaded file if validation fails
      if (req.file) deleteFile(req.file.path);
      return res.status(400).json({ 
        success: false,
        message: "UID is required" 
      });
    }

    // Prepare profile data
    const profileData = {
      ...req.body,
      // Parse array/object fields
      skills: parseField(req.body.skills),
      projects: parseField(req.body.projects),
      certifications: parseField(req.body.certifications),
      experience: parseField(req.body.experience),
      isPublic: req.body.isPublic === 'true' || req.body.isPublic === true
    };

    // Handle profile picture
    if (req.file) {
      profileData.profilePicture = `/uploads/${req.file.filename}`;
      
      // Delete old picture if updating
      const existingProfile = await StudentProfile.findOne({ uid });
      if (existingProfile?.profilePicture) {
        deleteFile(existingProfile.profilePicture);
      }
    }

    // Create or update profile
    const student = await StudentProfile.findOneAndUpdate(
      { uid },
      profileData,
      { 
        new: true,
        upsert: true,
        setDefaultsOnInsert: true 
      }
    );

    res.json({
      success: true,
      message: "Profile saved successfully",
      student
    });

  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) deleteFile(req.file.path);
    
    console.error("Profile save error:", error);
    res.status(500).json({
      success: false,
      message: "Error saving profile",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to parse stringified fields
function parseField(field) {
  if (!field) return [];
  try {
    return typeof field === 'string' ? JSON.parse(field) : field;
  } catch {
    return [];
  }
}

// Add this to your backend routes (likely in your studentProfileRoutes.js or similar)
router.get('/profile/uid/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    // Find the student by UID and only return the _id field
    const student = await StudentProfile.findOne({ uid })
      .select('_id name profilePicture skills rolePreference domain')
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found with the provided UID'
      });
    }

    res.status(200).json({
      success: true,
      _id: student._id,
      name: student.name,
      profilePicture: student.profilePicture,
      skills: student.skills,
      rolePreference: student.rolePreference,
      domain: student.domain
    });

  } catch (error) {
    console.error('Error finding student by UID:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding student',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
module.exports = router;
