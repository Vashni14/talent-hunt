const mongoose = require("mongoose");

const StudentProfileSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contact: { type: String, required: true },
  domain: { type: String },
  rolePreference: { type: String },
  profilePicture: { type: String }, // Stores the image URL
  skills: [{ name: String, level: String }], // Skill with proficiency
  projects: [{ type: String }],
  linkedin: [{ type: String }],
  github: [{ type: String }],
  portfolio: [{ type: String }],
  certifications: [{ type: String }],
  isPublic: { type: Boolean, default: true } ,
  experience: [{competition: String}],
  bio: { type: String }, // Added for UI compatibility
});
module.exports = mongoose.model("StudentProfile", StudentProfileSchema);
