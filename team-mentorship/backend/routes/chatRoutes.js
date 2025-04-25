const express = require("express");
const router = express.Router();
const ChatMessage = require("../models/ChatMessage");
const Team = require("../models/Team"); 
const Mentor = require("../models/Mentor");
const StudentProfile = require("../models/StudentProfile");

router.get("/conversations/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    
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

    // Get complete user profiles
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const user = await StudentProfile.findOne({ uid: conv._id }).lean();
        if (!user) {
          console.warn(`User not found for UID: ${conv._id}`);
          return null;
        }
        return {
          id: conv._id,
          name: user.name,
          avatar: user.profilePicture || "/default-profile.png",
          department: user.department || "Unknown",
          lastMessage: conv.lastMessage,
          time: conv.timestamp,
          unread: conv.unreadCount
        };
      })
    );

    // Filter out null results
    const filteredConversations = populatedConversations.filter(conv => conv !== null);
    
    res.json(filteredConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching conversations",
      error: error.message 
    });
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
    
    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').emit('newMessage', newMessage);
    }
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Error sending message", error });
  }
});

// Search users
router.get("/search/:userId/:query", async (req, res) => {
  try {
    const { userId, query } = req.params;
    
    // Search all users matching query (including existing conversations)
    const users = await StudentProfile.find({
      uid: { $ne: userId }, // Exclude self
      name: { $regex: query, $options: "i" }
    }).limit(10);

    // Get existing conversations to mark them
    const existingConversations = await ChatMessage.distinct('to', { from: userId });
    existingConversations.push(...await ChatMessage.distinct('from', { to: userId }));
    const uniqueConversationIds = [...new Set(existingConversations)];

    const results = users.map(user => ({
      id: user.uid,
      name: user.name,
      avatar: user.profilePicture || "/default-profile.png",
      isExisting: uniqueConversationIds.includes(user.uid)
    }));
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error searching users",
      error: error.message 
    });
  }
});

// Get mentor's students for chat
router.get("/mentor-students/:mentorId", async (req, res) => {
  try {
    const mentorId = req.params.mentorId;
    
    // Get all students assigned to this mentor
    const students = await StudentProfile.find({ 
      mentorId: mentorId 
    }).lean();

    // Get last messages for each student
    const conversations = await Promise.all(
      students.map(async (student) => {
        const lastMessage = await ChatMessage.findOne({
          $or: [
            { from: mentorId, to: student.uid },
            { from: student.uid, to: mentorId }
          ]
        }).sort({ timestamp: -1 });

        const unreadCount = await ChatMessage.countDocuments({
          from: student.uid,
          to: mentorId,
          read: false
        });

        return {
          id: student.uid,
          name: student.name,
          avatar: student.profilePicture || "/default-profile.png",
          lastMessage: lastMessage?.text || "",
          time: lastMessage?.timestamp || new Date(),
          unread: unreadCount
        };
      })
    );

    res.json(conversations);
  } catch (error) {
    console.error("Error fetching mentor's students:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching mentor's students",
      error: error.message 
    });
  }
});

// Get student's mentors for chat
router.get("/student-mentors/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId;
    
    // Get all mentors assigned to this student
    const student = await StudentProfile.findOne({ uid: studentId }).lean();
    if (!student || !student.mentorId) {
      return res.json([]);
    }

    // Get mentor details
    const mentor = await Mentor.findOne({ userId: student.mentorId }).lean();
    if (!mentor) {
      return res.json([]);
    }

    // Get last message
    const lastMessage = await ChatMessage.findOne({
      $or: [
        { from: studentId, to: mentor.userId },
        { from: mentor.userId, to: studentId }
      ]
    }).sort({ timestamp: -1 });

    const unreadCount = await ChatMessage.countDocuments({
      from: mentor.userId,
      to: studentId,
      read: false
    });

    const conversation = {
      id: mentor.userId,
      name: mentor.name,
      avatar: mentor.profilePicture || "/default-profile.png",
      lastMessage: lastMessage?.text || "",
      time: lastMessage?.timestamp || new Date(),
      unread: unreadCount
    };

    res.json([conversation]);
  } catch (error) {
    console.error("Error fetching student's mentors:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching student's mentors",
      error: error.message 
    });
  }
});

// Get team conversations for a user
// Get team conversations for a user
router.get("/team-conversations/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Find teams where user is owner or member
    const teams = await Team.find({
      $or: [
        { createdBy: userId },
        { "members.user": userId }
      ]
    })
    .select('name logo members mentors')
    .lean();

    if (!teams || teams.length === 0) {
      return res.json([]);
    }

    // Get last messages for each team
    const conversations = await Promise.all(
      teams.map(async (team) => {
        const lastMessage = await ChatMessage.findOne({
          to: team._id.toString(),
          isTeamMessage: true
        }).sort({ timestamp: -1 });

        return {
          id: team._id.toString(),
          name: team.name,
          avatar: team.logo || "/default-team.png",
          lastMessage: lastMessage?.text || "",
          time: lastMessage?.timestamp || new Date(),
          isTeam: true,
          memberCount: team.members.length
        };
      })
    );

    res.json(conversations);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching team conversations",
      error: error.message 
    });
  }
});

// Get team messages
router.get("/team-messages/:teamId", async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.query.userId;
    
    const messages = await ChatMessage.find({
      to: teamId,
      isTeamMessage: true
    }).sort({ timestamp: 1 });

    // Mark messages as read by this user
    await ChatMessage.updateMany(
      { 
        to: teamId, 
        isTeamMessage: true,
        readBy: { $ne: userId },
        from: { $ne: userId }
      },
      { $addToSet: { readBy: userId } }
    );

    res.json(messages);
  } catch (error) {
    console.error("Error fetching team messages:", error);
    res.status(500).json({ message: "Error fetching team messages", error });
  }
});

// Send a team message
router.post("/send-team-message", async (req, res) => {
  try {
    const { from, to, text, senderName } = req.body;
    
    if (!from || !to || !text || !senderName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newMessage = new ChatMessage({
      from,
      to,
      text,
      isTeamMessage: true,
      senderName,
      readBy: [from] // Sender has "read" the message
    });

    await newMessage.save();
    
    // Emit socket event
    if (req.app.get('io')) {
      req.app.get('io').emit('newTeamMessage', newMessage);
    }
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending team message:", error);
    res.status(500).json({ message: "Error sending team message", error });
  }
});

module.exports = router;