const mongoose = require('mongoose');

const MentorSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  domain: {
    type: String,
    default: ''
  },
  skills: {
    type: [String],
    default: []
  },
  experience: {
    type: String,
    default: ''
  },
  education: {
    type: String,
    default: ''
  },
  linkedin: {
    type: String,
    default: ''
  },
  currentPosition: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
MentorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
module.exports = mongoose.model("Mentor", MentorSchema);