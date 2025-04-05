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


// 🔹 Create/Update Student Profile
router.post("/profile", async (req, res) => {
  try {
    const { uid, name, contact, domain, rolePreference, linkedin, github, portfolio, skills, projects, certifications, experience,bio } = req.body;

    let student = await StudentProfile.findOne({ uid });

    if (!student) {
      student = new StudentProfile({ uid, name, contact });
    }
    student.domain = domain;
    student.rolePreference = rolePreference;
    student.linkedin = linkedin;
    student.github = github;
    student.portfolio = portfolio;
    student.skills = skills;
    student.projects = projects;
    student.certifications = certifications;
    student.experience = experience;
    student.bio=bio;

    await student.save();
    res.json({ message: "Profile updated successfully!", student });
  } catch (error) {
    res.status(500).json({ message: "Error saving profile", error });
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

module.exports = router;
