const Student = require("../models/Student");

// Fetch Student Profile
const getStudentProfile = async (req, res) => {
  try {
    console.log("Fetching student profile for UID:", req.params.uid);
    const student = await Student.findOne({ uid: req.params.uid });

    if (!student) {
      console.log("Student profile not found for UID:", req.params.uid);
      return res.status(404).json({ error: "Student profile not found." });
    }

    console.log("Student profile found:", student);
    res.json(student);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update or Create Student Profile
const updateStudentProfile = async (req, res) => {
  try {
    console.log("Received profile update request:", req.body);

    const { uid, name, contact, domain, rolePreference, skills, projects, certifications, experience } = req.body;

    if (!uid || !name || !contact) {
      console.log("Missing required fields:", req.body);
      return res.status(400).json({ error: "Missing required fields: uid, name, or contact" });
    }

    const studentProfile = {
      uid,
      name,
      contact,
      domain,
      rolePreference,
      skills: skills || [],
      projects: projects || [],
      certifications: certifications || [],
      experience: experience || [],
    };

    console.log("Updating profile in database:", studentProfile);
    
    const updatedProfile = await Student.findOneAndUpdate(
      { uid },
      { $set: studentProfile },
      { new: true, upsert: true }
    );

    console.log("Profile updated successfully:", updatedProfile);
    res.json(updatedProfile);
  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getStudentProfile, updateStudentProfile };
