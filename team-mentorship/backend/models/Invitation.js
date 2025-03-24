const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Explicit ID field
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    receiverId: { type: String, required: true },
    receiverName: { type: String, required: true }, // Added receiverName for consistency
    type: { 
      type: String, 
      required: true,
      enum: ["project", "competition", "feedback"] // Restrict to specific types
    },
    message: { type: String, required: true },
    status: { 
      type: String, 
      default: "pending",
      enum: ["pending", "accepted", "declined", "cancelled"] // Restrict to specific statuses
    },
    responseMessage: { type: String } // Track responses
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Invitation = mongoose.model("Invitation", invitationSchema);
module.exports = Invitation;