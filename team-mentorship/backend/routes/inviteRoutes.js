const express = require("express");
const router = express.Router();
const Invitation = require("../models/Invitation");
const User = require("../models/StudentProfile"); // ✅ Import StudentProfile model

// ✅ SEND INVITE (Now Includes `senderName`)
router.post("/", async (req, res) => {
  try {
    console.log("🔹 Incoming Invitation Request:", req.body);

    let { senderId, receiverId, type, message } = req.body;

    if (!senderId || !receiverId) {
      console.error("❌ Error: Missing senderId or receiverId");
      return res.status(400).json({ message: "Sender and Receiver IDs are required." });
    }

    console.log("✅ Searching for receiver UID:", receiverId);
    
    // ✅ Ensure `receiverId` exists in the database
    const recipient = await User.findOne({ uid: receiverId });

    if (!recipient) {
      console.error("❌ Error: Receiver UID not found in database");
      return res.status(400).json({ message: "Receiver UID not found." });
    }

    // ✅ Fetch sender's name
    const sender = await User.findOne({ uid: senderId });
    if (!sender) {
      console.error("❌ Error: Sender UID not found in database");
      return res.status(400).json({ message: "Sender UID not found." });
    }

    const newInvite = new Invitation({
      senderId,  // ✅ Firebase UID
      senderName: sender.name, // ✅ Store sender's name
      receiverId, // ✅ Store Firebase UID
      type,
      message,
      status: "pending",
    });

    await newInvite.save();
    console.log("✅ Invitation saved:", newInvite);
    res.status(201).json({ message: "Invitation sent successfully!" });
  } catch (error) {
    console.error("❌ Error sending invite:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ GET RECEIVED INVITES (Now Returns `senderName`)
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("🔹 Fetching invites for user:", userId);

    const receivedInvites = await Invitation.find({ receiverId: userId }).select(
      "senderId senderName type message status"
    );
    const sentInvites = await Invitation.find({ senderId: userId }).select(
      "receiverId type message status"
    );

    console.log("✅ Found received invitations:", receivedInvites);
    console.log("✅ Found sent invitations:", sentInvites);

    res.json({ receivedInvites, sentInvites });
  } catch (error) {
    console.error("❌ Error fetching invites:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
