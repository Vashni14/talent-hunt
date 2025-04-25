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
  try {
    const { userId, title, total, completed = 0, deadline } = req.body;

    if (!deadline) {
      return res.status(400).json({ error: "Deadline is required" });
    }

    const newGoal = new GoalModel({ userId, title, total, completed, deadline });
    await newGoal.save();

    res.status(201).json({ message: "Goal added successfully!", goal: newGoal });
  } catch (error) {
    console.error("Error adding goal:", error);
    res.status(500).json({ error: error.message });
  }
});


// 📌 Update goal progress
router.put("/:goalId", async (req, res) => {
  try {
    const { title, total, completed, deadline } = req.body;

    const updatedGoal = await GoalModel.findByIdAndUpdate(
      req.params.goalId, // ✅ Corrected parameter
      { title, total, completed, deadline }, // ✅ Ensuring all fields can be updated
      { new: true } // ✅ Return updated document
    );

    if (!updatedGoal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.status(200).json(updatedGoal);
  } catch (error) {
    console.error("Error updating goal:", error);
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