const express = require("express");
const router = express.Router();
const GoalModel = require("../models/Goals");

// 📌 Fetch all goals for a user
router.get("/:userId", async (req, res) => {
  try {
    const goals = await GoalModel.find({ userId: req.params.userId });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

// 📌 Add a new goal
router.post("/", async (req, res) => {
  const { userId, title, total } = req.body;
  try {
    const newGoal = new GoalModel({ userId, title, total, completed: 0,deadline });
    await newGoal.save();
    res.json(newGoal);
  } catch (error) {
    res.status(500).json({ error: "Failed to add goal" });
  }
});

// 📌 Update goal progress
router.put("/:goalId", async (req, res) => {
  const { completed } = req.body;
  try {
    const goal = await GoalModel.findByIdAndUpdate(req.params.goalId, { completed }, { new: true });
    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: "Failed to update goal" });
  }
});

// 📌 Delete a goal
router.delete("/:goalId", async (req, res) => {
  try {
    await GoalModel.findByIdAndDelete(req.params.goalId);
    res.json({ message: "Goal deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete goal" });
  }
});

module.exports = router;
