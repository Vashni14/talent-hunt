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
// 🔹 Create/Update Student Profile with optional profile picture upload
router.post("/profile", upload.single("profilePicture"), async (req, res) => {
  try {
    const { uid, name, contact, domain, rolePreference, linkedin, github, portfolio, skills, projects, certifications, experience, bio } = req.body;

    // Parse skills, projects, certifications, and experience if they're sent as strings
    const parsedSkills = typeof skills === 'string' ? JSON.parse(skills) : skills;
    const parsedProjects = typeof projects === 'string' ? JSON.parse(projects) : projects;
    const parsedCertifications = typeof certifications === 'string' ? JSON.parse(certifications) : certifications;
    const parsedExperience = typeof experience === 'string' ? JSON.parse(experience) : experience;

    let student = await StudentProfile.findOne({ uid });

    if (!student) {
      student = new StudentProfile({ uid, name, contact });
    }

    // Update profile fields
    student.domain = domain;
    student.rolePreference = rolePreference;
    student.linkedin = linkedin;
    student.github = github;
    student.portfolio = portfolio;
    student.skills = parsedSkills || [];
    student.projects = parsedProjects || [];
    student.certifications = parsedCertifications || [];
    student.experience = parsedExperience || [];
    student.bio = bio;

    // If a file was uploaded, update the profile picture
    if (req.file) {
      student.profilePicture = `/uploads/${req.file.filename}`;
    }

    await student.save();
    
    res.json({ 
      message: "Profile updated successfully!", 
      student,
      profilePicture: student.profilePicture 
    });
  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).json({ 
      message: "Error saving profile", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

router.post("/uploadProfile", upload.single("profilePicture"), async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid || !req.file) {
      return res.status(400).json({ message: "Invalid request: Missing user ID or file." });
    }

    // Update profile picture URL in the database
    const updatedStudent = await StudentProfile.findOneAndUpdate(
      { uid },
      { profilePicture: `/uploads/${req.file.filename}` }, // Store path in DB
      { new: true }
    );

    res.json({ message: "Profile picture updated successfully!", profilePicture: updatedStudent.profilePicture });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ message: "Error uploading profile picture", error });
  }
});
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
