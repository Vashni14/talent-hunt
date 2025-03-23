const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true }, // ✅ Store as Firebase UID (String)
    senderName: { type: String, required: true }, // ✅ Store sender's name
    receiverId: { type: String, required: true }, // ✅ Store as Firebase UID (String)
    type: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

const Invitation = mongoose.model("Invitation", invitationSchema);
module.exports = Invitation;
