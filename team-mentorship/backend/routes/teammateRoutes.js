const express = require("express");
const router = express.Router();
const Teammate = require("../models/Teammate");
const Invitation = require("../models/Invitation");
const mongoose = require("mongoose");

// routes/teammates.js
router.get('/', async (req, res) => {
  try {
    const { excludeUserId } = req.query; // Get current user ID from query params
    const filter = { isPublic: true }; // Only show public profiles
    
    if (excludeUserId) {
      filter.uid = { $ne: excludeUserId }; // Exclude current user
    }

    const teammates = await Teammate.find(filter);
    res.status(200).json(teammates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch teammates" });
  }
});
// Get all teammates with filtering
router.get("/teammates", async (req, res) => {
  try {
    const { skills, domain, experience, excludeUserId } = req.query;
    const filter = {};

    // Apply filters
    if (skills) {
      filter.skills = {
        $in: Array.isArray(skills) ? skills : skills.split(",")
      };
    }
    if (domain) filter.domain = { $regex: domain, $options: "i" };
    if (experience) filter["experience.duration"] = { $gte: parseInt(experience) };
    if (excludeUserId) filter.uid = { $ne: excludeUserId };

    // Projection to control returned fields
    const projection = {
      password: 0,
      __v: 0,
      createdAt: 0,
      updatedAt: 0
    };

    const teammates = await Teammate.find(filter, projection)
      .sort({ createdAt: -1 })
      .lean();

    // Convert Mongoose documents to plain objects
    const result = teammates.map(teammate => {
      // Transform experience if it exists
      if (teammate.experience) {
        teammate.experience = Array.isArray(teammate.experience) 
          ? teammate.experience 
          : [teammate.experience];
      }
      return teammate;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching teammates:", error);
    res.status(500).json({ 
      error: "Failed to fetch teammates",
      details: error.message 
    });
  }
});

// Send invitation
router.post("/invitations", async (req, res) => {
  try {
    const { fromUserId, fromUserName, toUserId, toUserName, type, message } = req.body;

    // Validate required fields
    if (!fromUserId || !toUserId || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Prevent self-invitation
    if (fromUserId === toUserId) {
      return res.status(400).json({ error: "Cannot invite yourself" });
    }

    // Validate invitation type
    const validTypes = ["project", "competition", "feedback"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: "Invalid invitation type" });
    }

    const invitation = new Invitation({
      fromUserId,
      fromUserName: fromUserName || "Anonymous",
      toUserId,
      toUserName: toUserName || "Unknown User",
      type,
      message: message || `Invitation for ${type}`,
      status: "pending"
    });

    await invitation.save();

    res.status(201).json({
      message: "Invitation sent successfully",
      invitation
    });
  } catch (error) {
    console.error("Error sending invitation:", error);
    res.status(500).json({ 
      error: "Failed to send invitation",
      details: error.message 
    });
  }
});

// Get invitations for a user
router.get("/invitations/:userId", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { 
      $or: [
        { fromUserId: req.params.userId },
        { toUserId: req.params.userId }
      ]
    };

    if (status) filter.status = status;

    const invitations = await Invitation.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(invitations);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    res.status(500).json({ 
      error: "Failed to fetch invitations",
      details: error.message 
    });
  }
});

// Update invitation status
router.put("/invitations/:id", async (req, res) => {
  try {
    const { status, responseMessage } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const validStatuses = ["accepted", "declined", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const invitation = await Invitation.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        responseMessage,
        updatedAt: new Date() 
      },
      { new: true }
    );

    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    res.status(200).json({
      message: "Invitation updated successfully",
      invitation
    });
  } catch (error) {
    console.error("Error updating invitation:", error);
    res.status(500).json({ 
      error: "Failed to update invitation",
      details: error.message 
    });
  }
});

module.exports = router;