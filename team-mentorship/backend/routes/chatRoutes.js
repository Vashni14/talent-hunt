const express = require("express");
const router = express.Router();
const ChatMessage = require("../models/ChatMessage");
const Team = require("../models/Team");
const Mentor = require("../models/Mentor");
const StudentProfile = require("../models/StudentProfile");

// Helper function to format chat response
const formatChatResponse = (conversations) => {
  return conversations.map((conv) => ({
    id: conv._id,
    name: conv.name,
    avatar: conv.avatar,
    lastMessage: conv.lastMessage,
    time: conv.timestamp,
    unread: conv.unreadCount,
    online: conv.online,
    ...(conv.memberCount && { memberCount: conv.memberCount }),
    ...(conv.department && { department: conv.department }),
  }));
};

// Get conversations for a user
router.get("/conversations/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const conversations = await ChatMessage.aggregate([
      {
        $match: {
          $or: [{ from: userId }, { to: userId }],
          isTeamMessage: { $ne: true },
        },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$from", userId] }, "$to", "$from"],
          },
          lastMessage: { $last: "$text" },
          timestamp: { $last: "$timestamp" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$to", userId] },
                    { $ne: ["$readBy", userId] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { timestamp: -1 } },
    ]);

    // Get complete user profiles
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const user = await StudentProfile.findOne({ uid: conv._id }).lean();
        if (!user) {
          const mentor = await Mentor.findOne({ userId: conv._id }).lean();
          if (!mentor) return null;

          return {
            _id: conv._id,
            name: mentor.name,
            avatar: mentor.profilePicture || "/default-profile.png",
            lastMessage: conv.lastMessage,
            timestamp: conv.timestamp,
            unreadCount: conv.unreadCount,
            expertise: mentor.expertise || "Mentor",
          };
        }

        return {
          _id: conv._id,
          name: user.name,
          avatar: user.profilePicture || "/default-profile.png",
          lastMessage: conv.lastMessage,
          timestamp: conv.timestamp,
          unreadCount: conv.unreadCount,
          department: user.department || "Student",
          online: user.isOnline || false,
        };
      })
    );

    // Filter out null results
    const filteredConversations = populatedConversations.filter(
      (conv) => conv !== null
    );

    res.json(formatChatResponse(filteredConversations));
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching conversations",
      error: error.message,
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
        { from: otherUserId, to: userId },
      ],
      isTeamMessage: { $ne: true },
    }).sort({ timestamp: 1 });

    // Mark messages as read when fetched
    await ChatMessage.updateMany(
      { from: otherUserId, to: userId },
      { $addToSet: { readBy: userId } }
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

    // Validate required fields
    if (!from || !to || !text) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create a new message
    const newMessage = new ChatMessage({
      from,
      to,
      text,
      readBy: [from],
    });

    await newMessage.save();

    // Emit socket event if Socket.IO is configured
    if (req.app.get("io")) {
      req.app
        .get("io")
        .to(`user_${to}`)
        .emit("newMessage", newMessage.toObject());
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Error sending message", error });
  }
});

// Get team conversations for a user
router.get("/team-conversations/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find teams where the user is a member or the creator
    const teams = await Team.find({
      $or: [{ createdBy: userId }, { "members.user": userId }],
    })
      .select("_id name logo members")
      .lean();

    if (!teams || teams.length === 0) {
      return res.json([]); // Return an empty array if no teams are found
    }

    // Get last messages and unread counts for each team
    const conversations = await Promise.all(
      teams.map(async (team) => {
        const lastMessage = await ChatMessage.findOne({
          to: team._id.toString(),
          isTeamMessage: true,
        }).sort({ timestamp: -1 });

        const unreadCount = await ChatMessage.countDocuments({
          to: team._id.toString(),
          isTeamMessage: true,
          readBy: { $ne: userId },
        });

        return {
          _id: team._id.toString(),
          name: team.name,
          avatar: team.logo || "/default-team.png",
          lastMessage: lastMessage?.text || "",
          timestamp: lastMessage?.timestamp || new Date(),
          unreadCount,
          memberCount: team.members.length,
          isTeam: true,
        };
      })
    );

    res.json(conversations);
  } catch (error) {
    console.error("Error fetching team conversations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching team conversations",
      error: error.message,
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
      isTeamMessage: true,
    }).sort({ timestamp: 1 });

    // Mark messages as read by this user
    await ChatMessage.updateMany(
      {
        to: teamId,
        isTeamMessage: true,
        readBy: { $ne: userId },
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
      readBy: [from],
    });

    await newMessage.save();

    // Emit socket event
    if (req.app.get("io")) {
      const team = await Team.findById(to).lean();
      if (team) {
        const memberIds = team.members.map((m) => m.user);
        memberIds.push(team.createdBy);
        memberIds.forEach((userId) => {
          req.app
            .get("io")
            .to(`user_${userId}`)
            .emit("newTeamMessage", newMessage.toObject());
        });
      }
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending team message:", error);
    res.status(500).json({ message: "Error sending team message", error });
  }
});

// Get mentor's students for chat
router.get("/mentor-students/:mentorId", async (req, res) => {
  try {
    const mentorId = req.params.mentorId;

    // Get all students assigned to this mentor
    const students = await StudentProfile.find({
      mentorId: mentorId,
    }).lean();

    // Get last messages and unread counts for each student
    const conversations = await Promise.all(
      students.map(async (student) => {
        const lastMessage = await ChatMessage.findOne({
          $or: [
            { from: mentorId, to: student.uid },
            { from: student.uid, to: mentorId },
          ],
        }).sort({ timestamp: -1 });

        const unreadCount = await ChatMessage.countDocuments({
          from: student.uid,
          to: mentorId,
          readBy: { $ne: mentorId },
        });

        return {
          _id: student.uid,
          name: student.name,
          avatar: student.profilePicture || "/default-profile.png",
          lastMessage: lastMessage?.text || "",
          timestamp: lastMessage?.timestamp || new Date(),
          unreadCount,
          department: student.department || "Student",
        };
      })
    );

    res.json(formatChatResponse(conversations));
  } catch (error) {
    console.error("Error fetching mentor's students:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching mentor's students",
      error: error.message,
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

    // Get last message and unread count
    const lastMessage = await ChatMessage.findOne({
      $or: [
        { from: studentId, to: mentor.userId },
        { from: mentor.userId, to: studentId },
      ],
    }).sort({ timestamp: -1 });

    const unreadCount = await ChatMessage.countDocuments({
      from: mentor.userId,
      to: studentId,
      readBy: { $ne: studentId },
    });

    const conversation = {
      _id: mentor.userId,
      name: mentor.name,
      avatar: mentor.profilePicture || "/default-profile.png",
      lastMessage: lastMessage?.text || "",
      timestamp: lastMessage?.timestamp || new Date(),
      unreadCount,
      expertise: mentor.expertise || "Mentor",
    };

    res.json(formatChatResponse([conversation]));
  } catch (error) {
    console.error("Error fetching student's mentors:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching student's mentors",
      error: error.message,
    });
  }
});

// Search for users (students and mentors) matching the search term
router.get("/search/:userId/:searchTerm", async (req, res) => {
  try {
    const { userId, searchTerm } = req.params;

    // Search for users (students and mentors) matching the search term
    const students = await StudentProfile.find({
      name: { $regex: searchTerm, $options: "i" }, // Case-insensitive search
      uid: { $ne: userId }, // Exclude the current user
    })
      .select("uid name profilePicture department")
      .lean();

    const mentors = await Mentor.find({
      name: { $regex: searchTerm, $options: "i" }, // Case-insensitive search
      userId: { $ne: userId }, // Exclude the current user
    })
      .select("userId name profilePicture expertise")
      .lean();

    // Combine results
    const results = [
      ...students.map((student) => ({
        id: student.uid,
        name: student.name,
        avatar: student.profilePicture || "/default-profile.png",
        department: student.department || "Student",
        isExisting: false, // Mark as a new chat
      })),
      ...mentors.map((mentor) => ({
        id: mentor.userId,
        name: mentor.name,
        avatar: mentor.profilePicture || "/default-profile.png",
        expertise: mentor.expertise || "Mentor",
        isExisting: false, // Mark as a new chat
      })),
    ];

    res.json({ success: true, results });
  } catch (error) {
    console.error("Error searching for members:", error);
    res
      .status(500)
      .json({ success: false, message: "Error searching for members" });
  }
});

module.exports = router;
