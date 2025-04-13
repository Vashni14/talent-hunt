const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  progress: { type: Number, default: 0 }, // Example: 0 to 100%
  total: { type: Number, required: true }, // Total number to complete
  completed: { type: Number, default: 0 }, // Current progress
  deadline: { type: Date, required: true }, // 📅 Added deadline field
});

const GoalModel = mongoose.model("Goal", GoalSchema);
module.exports = GoalModel;