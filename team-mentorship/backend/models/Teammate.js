const mongoose = require("mongoose");

const TeammateSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  domain: { type: String, required: true },
  skills: { type: [String], required: true },
  experience: { type: Number, required: true },
  rolePreference: { type: String, required: true },
  projects: { type: [String], default: [] },
  competitions: { type: [String], default: [] },
  invitations: { type: [String], default: [] }, // Array of invitation IDs
});

module.exports = mongoose.model("Teammate", TeammateSchema);