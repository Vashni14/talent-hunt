const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Firebase UID
  name: String,
  teams: [String] // Array of team IDs
});

module.exports = mongoose.model('Mentor', mentorSchema);