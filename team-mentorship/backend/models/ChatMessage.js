const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema({
  from: { type: String, required: true }, // Firebase UID of sender
  to: { type: String, required: true },   // Firebase UID of recipient or team ID
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  readBy: [{ type: String }], // Array of user IDs who have read the message
  isTeamMessage: { type: Boolean, default: false },
  senderName: { type: String }, // Name of sender (for team chats)
  tempId: { type: String } // For optimistic updates on client
}, {
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);