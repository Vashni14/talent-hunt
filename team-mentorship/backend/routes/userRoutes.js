const express = require("express");
const router = express.Router();
const StudentProfile = require("../models/StudentProfile");

// ✅ Fetch all teammates (Exclude logged-in user)
router.get("/", async (req, res) => {
  try {
    const { uid, skills, domain, experience } = req.query;
    let filters = {};

    if (skills) filters.skills = { $elemMatch: { name: { $in: skills.split(",") } } };
    if (domain) filters.domain = domain;
    if (experience) filters.experience = { $gte: Number(experience) };

    // Exclude the logged-in user
    if (uid) filters.uid = { $ne: uid };

    const users = await StudentProfile.find(filters).select("uid name domain profilePicture skills experience github linkedin");

    res.json(users);  // ✅ Return JSON array, not an object
  } catch (error) {
    console.error("Error fetching teammates:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
