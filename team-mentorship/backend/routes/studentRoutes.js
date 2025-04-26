const express = require("express");
const router = express.Router();
const StudentProfile = require("../models/StudentProfile");
const upload = require("../middleware/upload");
const Team = require("../models/Team");
const Application = require("../models/Application");
const TeamOpening = require("../models/TeamOpening");
const CompApplication = require("../models/CompApplication");
const Invitation = require("../models/Invitation");
const fs = require("fs");
const path = require("path");

// Helper function to delete files
const deleteFile = (filePath) => {
  const fullPath = path.join(__dirname, '../..', filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });
  }
};
router.delete('/:id', async (req, res) => {
  try {
    // Find the student by ID
    const student = await StudentProfile.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }


    // Delete the student
    await StudentProfile.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true, 
      message: 'Student profile deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting student',
      error: err.message 
    });
  }
});
// 🔹 Upload Profile Picture
router.post("/uploadProfile", upload.single("profilePicture"), async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      if (req.file) deleteFile(req.file.path);
      return res.status(400).json({ message: "UID is required" });
    }

    const profilePictureUrl = `/uploads/${req.file.filename}`;
    
    // Update profile with new picture immediately
    const updatedProfile = await StudentProfile.findOneAndUpdate(
      { uid },
      { profilePicture: profilePictureUrl },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Profile picture uploaded successfully",
      profilePictureUrl,
      profile: updatedProfile
    });

  } catch (error) {
    if (req.file) deleteFile(req.file.path);
    console.error("Upload error:", error);
    res.status(500).json({ 
      message: "Error uploading profile picture",
      error: error.message 
    });
  }
});

// 🔹 Create/Update Student Profile
router.post("/profile", async (req, res) => {
  try {
    const { uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({ message: "UID is required" });
    }

    // Prepare profile data
    const profileData = {
      ...req.body,
      skills: parseField(req.body.skills),
      projects: parseField(req.body.projects),
      certifications: parseField(req.body.certifications),
      experience: parseField(req.body.experience)
    };

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
      profile: student
    });

  } catch (error) {
    console.error("Profile save error:", error);
    res.status(500).json({
      message: "Error saving profile",
      error: error.message
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

// 🔹 Get All Student Profiles
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

// 🔹 Get Profile by Username
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
// Enhanced dashboard stats route
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user document
    const user = await StudentProfile.findOne({ uid: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🟦 1. Get pending applications from Application model (via openings)
    const openings = await TeamOpening.find({ createdBy: userId }).select('_id');
    const openingIds = openings.map(opening => opening._id);
  
    let pendingFromApplications = 0;
    if (openingIds.length > 0) {
      pendingFromApplications = await Application.countDocuments({
        opening: { $in: openingIds },
        status: 'pending'
      });
    }
    console.log("✅ Pending from Application model:", pendingFromApplications);
  
  let pendingFromInvitations = 0;
    pendingFromInvitations = await Invitation.countDocuments({
user: user._id,
      status: 'pending'
    });
    console.log("✅ Pending from Invitation model:", pendingFromInvitations);
    let pendingApplications = pendingFromApplications + pendingFromInvitations;
    console.log("✅ Total pending applications:", pendingApplications);

    // Get competitions user has applied to and been accepted
    const competitionApplications = await CompApplication.find({
      student: user._id,
      status: 'accepted'
    }).populate('competition');

    // Get upcoming deadlines (competitions and teams)
    const now = new Date();
    const teams = await Team.find({
      $or: [
        { createdBy: userId },
        { 'members.user': user._id }
      ]
    }).populate('tasks.items');
console.log("✅ Teams found:", teams.length);
    // Calculate progress for each team
    const activeProjects = teams.map(team => {
      const totalTasks = team.tasks?.items?.length || 0;
      const completedTasks = team.tasks?.items?.filter(task => task.completed).length || 0;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        name: team.name,
        teamId: team._id,
        teamName: team.name,
        deadline: team.deadline,
        status: progress === 100 ? 'completed' : 
               progress > 0 ? 'in-progress' : 'planning',
        progress,
        totalTasks,
        completedTasks
      };
    }).filter(project => project.status !== 'completed');
    const teamDeadlines = teams
      .filter(team => team.deadline && new Date(team.deadline) > now)
      .map(team => ({
        title: team.name,
        date: team.deadline,
        type: 'team',
        link: `/my-teams/${team._id}`
      }));

    // Competition deadlines where user is accepted
    const competitionDeadlines = competitionApplications
      .filter(app => app.competition?.deadline && new Date(app.competition.deadline) > now)
      .map(app => ({
        title: app.competition.name,
        date: app.competition.deadline,
        type: 'competition',
        link: `/competitions/${app.competition._id}`
      }));

    // Combine and sort all deadlines
    const upcomingDeadlines = [...teamDeadlines, ...competitionDeadlines]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5); // Limit to 5 upcoming events

    // Count potential teammates (users with matching skills)
    const potentialTeammates = await StudentProfile.countDocuments({
      _id: { $ne: user._id },
      skills: { $in: user.skills || [] }
    });

    res.json({
      stats: {
        potentialTeammates,
        openTeams: await TeamOpening.countDocuments({ status: 'open' }),
        myTeams: teams.length,
        pendingApplications
      },
      upcomingDeadlines,
      updates: [], // Can be populated from notifications later
      activeProjects
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching dashboard data",
      error: error.message 
    });
  }
});

// 🔹 Get Basic Profile by UID
router.get('/profile/uid/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    const student = await StudentProfile.findOne({ uid })
      .select('_id name profilePicture skills rolePreference domain department')
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
      domain: student.domain,
      department: student.department
    });

  } catch (error) {
    console.error('Error finding student by UID:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding student',
      error: error.message
    });
  }
});

module.exports = router;