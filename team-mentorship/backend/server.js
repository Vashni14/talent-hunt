const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const StudentProfile = require("./models/StudentProfile"); 
const socketIo = require("socket.io");
const goalRoutes = require("./routes/goals");
const GoalModel = require("./models/Goals"); // ✅ Import the model


dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.post("/upload-profile-picture", (req, res) => {
    // Handle file upload logic here
  });
  
  app.post("/api/student/profile", async (req, res) => {
    try {
      const { uid, name, contact, domain, rolePreference, linkedin, github, portfolio, skills, projects, certifications, experience } = req.body;
  
      // Update the database (MongoDB example)
      await StudentProfile.findOneAndUpdate(
        { uid },
        { $set: { name, contact, domain, rolePreference, linkedin, github, portfolio, skills, projects, certifications, experience } },
        { new: true, upsert: true } // Ensures document is updated or created if missing
      );
  
      res.status(200).json({ message: "Profile updated successfully!" });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });
  app.post("/api/goals", async (req, res) => {
    try {
      const { userId, title, total, completed, deadline } = req.body;
  
      if (!deadline) {
        return res.status(400).json({ error: "Deadline is required" });
      }
  
      const newGoal = new GoalModel({ userId, title, total, completed, deadline });
      await newGoal.save();
  
      res.status(201).json({ message: "Goal added successfully!" });
    } catch (error) {
      console.error("Error adding goal:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app.put("/api/goals/:id", async (req, res) => {
    try {
      const { title, total, deadline } = req.body;
      const updatedGoal = await GoalModel.findByIdAndUpdate(
        req.params.id,
        { title, total, deadline },
        { new: true } // Return the updated document
      );
      res.status(200).json(updatedGoal);
    } catch (error) {
      console.error("Error updating goal:", error);
      res.status(500).json({ error: "Failed to update goal" });
    }
  });
  
  const server = http.createServer(app);
const io = socketIo(server);
  io.on("connection", (socket) => {
    console.log("A user connected");
  
    socket.on("message", (message) => {
      io.emit("message", message); // Broadcast the message to all clients
    });
  
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
// Student Profile Routes
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/users", require("./routes/userRoutes")); 
app.use("/api/teammates", require("./routes/userRoutes"))
app.use("/api/invites", require("./routes/inviteRoutes"));
app.use("/api/goals", goalRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
