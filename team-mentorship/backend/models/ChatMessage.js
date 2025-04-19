const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema({
  from: { type: String, required: true }, // Firebase UID of sender
  to: { type: String, required: true },   // Firebase UID of recipient
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

module.exports = mongoose.model("ChatMessage", ChatMessageSchema);