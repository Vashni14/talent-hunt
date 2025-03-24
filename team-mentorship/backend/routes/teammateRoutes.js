const express = require("express");
const router = express.Router();
const Teammate = require("../models/Teammate");
const Invitation = require("../models/Invitation");

// Fetch all teammates
router.get("/teammates", async (req, res) => {
    try {
      const { skills, domain, experience } = req.query;
      const filter = {};
      if (skills) filter.skills = { $in: skills.split(",") };
      if (domain) filter.domain = domain;
      if (experience) filter.experience = { $gte: parseInt(experience) };
  
      const teammates = await Teammate.find(filter);
      res.status(200).json(teammates); // Return an array of teammates
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teammates" });
    }
  });
  

// Send invitation
router.post("/invitations", async (req, res) => {
  try {
    const { fromUserId, toUserId, type, message } = req.body;
    const invitation = new Invitation({ fromUserId, toUserId, type, message });
    await invitation.save();
    res.status(201).json(invitation);
  } catch (error) {
    res.status(500).json({ error: "Failed to send invitation" });
  }
});

// Fetch invitations for a user
router.get("/invitations/:userId", async (req, res) => {
  try {
    const invitations = await Invitation.find({ toUserId: req.params.userId });
    res.status(200).json(invitations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invitations" });
  }
});

// Accept/Decline invitation
router.put("/invitations/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const invitation = await Invitation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.status(200).json(invitation);
  } catch (error) {
    res.status(500).json({ error: "Failed to update invitation" });
  }
});

module.exports = router;