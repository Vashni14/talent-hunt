const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const StudentProfile = require("./models/StudentProfile"); 
const goalRoutes = require("./routes/goals");
const teamsRouter = require('./routes/team');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

  
  app.post("/api/student/profile", async (req, res) => {
    try {
      const { uid, name, contact, domain, rolePreference, linkedin, github, portfolio, skills, projects, certifications, experience, bio } = req.body;
  
      // Update the database (MongoDB example)
      await StudentProfile.findOneAndUpdate(
        { uid },
        { $set: { name, contact, domain, rolePreference, linkedin, github, portfolio, skills, projects, certifications, experience, bio } },
        { new: true, upsert: true } // Ensures document is updated or created if missing
      );
  
      res.status(200).json({ message: "Profile updated successfully!" });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });
  // In your main server file (app.js or server.js)
const sdgRoutes = require('./routes/sdg');
app.use('/api/sdgs', sdgRoutes);
app.use("/api/invitations", require("./routes/teamOpenings"));
// Student Profile Routes
app.use("/api/student", require("./routes/studentRoutes"));
app.use('/api/teams', teamsRouter);
app.use("/api/goals", goalRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
