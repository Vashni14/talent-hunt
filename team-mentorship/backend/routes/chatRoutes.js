const express = require("express");
const router = express.Router();
const ChatMessage = require("../models/ChatMessage");
const StudentProfile = require("../models/StudentProfile");

// Get all conversations for a user
router.get("/conversations/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Find all unique users this user has chatted with
    const conversations = await ChatMessage.aggregate([
      {
        $match: {
          $or: [{ from: userId }, { to: userId }]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$from", userId] },
              "$to",
              "$from"
            ]
          },
          lastMessage: { $last: "$text" },
          timestamp: { $last: "$timestamp" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$to", userId] }, { $eq: ["$read", false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { timestamp: -1 } }
    ]);

    // Populate user details for each conversation
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const user = await StudentProfile.findOne({ uid: conv._id });
        return {
          id: conv._id,
          name: user?.name || "Unknown User",
          avatar: user?.profilePicture || "/default-profile.png",
          lastMessage: conv.lastMessage,
          time: conv.timestamp,
          unread: conv.unreadCount
        };
      })
    );

    res.json(populatedConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Error fetching conversations", error });
  }
});

// Get messages between two users
router.get("/messages/:userId/:otherUserId", async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    
    const messages = await ChatMessage.find({
      $or: [
        { from: userId, to: otherUserId },
        { from: otherUserId, to: userId }
      ]
    }).sort({ timestamp: 1 });

    // Mark messages as read when fetched
    await ChatMessage.updateMany(
      { from: otherUserId, to: userId, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages", error });
  }
});

// Send a new message
router.post("/send", async (req, res) => {
  try {
    const { from, to, text } = req.body;
    
    if (!from || !to || !text) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newMessage = new ChatMessage({
      from,
      to,
      text
    });

    await newMessage.save();
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Error sending message", error });
  }
});

// Search for users to chat with
// Add this temporary route to check all users
// Enhanced search endpoint
router.get("/search/:userId/:query", async (req, res) => {
    try {
      const { userId, query } = req.params;
      
      if (!query?.trim()) {
        return res.json([]);
      }
  
      // Sanitize and prepare search query
      const searchTerm = query.trim()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .split(/\s+/)
        .map(term => `(${term})`)
        .join('|');
  
      const users = await StudentProfile.aggregate([
        {
          $match: {
            uid: { $ne: userId },
            $or: [
              { name: { $regex: searchTerm, $options: "i" } },
              { email: { $regex: searchTerm, $options: "i" } }
            ]
          }
        },
        {
          $project: {
            _id: 0,
            id: "$uid",
            name: 1,
            email: 1,
            avatar: { $ifNull: ["$profilePicture", "/default-profile.png"] },
            matchScore: {
              $cond: [
                { $regexMatch: { input: "$name", regex: searchTerm, options: "i" } },
                2, // Higher score for name matches
                1  // Lower score for email matches
              ]
            }
          }
        },
        { $sort: { matchScore: -1, name: 1 } },
        { $limit: 10 }
      ]);
  
      res.json(users);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ 
        success: false,
        message: "Search failed",
        error: error.message 
      });
    }
  });

module.exports = router;