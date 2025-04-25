const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const goalRoutes = require("./routes/goals");
const teamsRouter = require('./routes/team');
const mentorApplicationRoutes = require('./routes/mentorApplicationRoutes');
const { createServer } = require("http");
const { Server } = require("socket.io");
const djangoProxy = require("./routes/djangoProxy");
const chatRoutes = require("./routes/chatRoutes");
const { StudentProfile, ChatMessage } = require("./models");
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true,
  })
);
app.use("/uploads", express.static("uploads"));
app.post("/api/student/profile", async (req, res) => {
  try {
    const {
      uid,
      name,
      contact,
      domain,
      rolePreference,
      linkedin,
      github,
      portfolio,
      skills,
      projects,
      certifications,
      experience,
      bio,
    } = req.body;

    // Update the database (MongoDB example)
    await StudentProfile.findOneAndUpdate(
      { uid },
      {
        $set: {
          name,
          contact,
          domain,
          rolePreference,
          linkedin,
          github,
          portfolio,
          skills,
          projects,
          certifications,
          experience,
          bio,
        },
      },
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
//Mentor Routes
app.use("/api/mentor", require("./routes/mentorRoutes"));
app.use('/api/mentor', mentorApplicationRoutes);
//Admin Routes
app.use("/api/competitions", require("./routes/competitions"));
app.use("/api/compapp", require("./routes/compapp"));
app.use("/api/sdgadmin", require("./routes/sdgadmin"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/admindash", require("./routes/admindash"));
app.use("/api/chat", chatRoutes);

app.use("/api/django", djangoProxy);
// Add this to your server.js file after other route imports
app.use("/api/mentor-dashboard", require("./routes/mentordash"));
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  let currentUserId = null;

  // Register user with their UID
  socket.on("register", (userId) => {
    currentUserId = userId;
    console.log(`User ${userId} registered for real-time updates`);
  });

  // Handle new messages
  socket.on("sendMessage", async (message, callback) => {
    try {
      // Only save to database if not already saved (check for tempId)
      if (!message.tempId) {
        const newMessage = new ChatMessage({
          from: message.from,
          to: message.to,
          text: message.text,
        });

        const savedMessage = await newMessage.save();

        // Only emit if this is a fresh message (not from API)
        io.emit("newMessage", savedMessage.toObject());

        if (callback) callback({ success: true, message: savedMessage });
      }
    } catch (error) {
      console.error("Error handling message:", error);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  // In your socket.io connection handler
  socket.on("sendTeamMessage", async (message, callback) => {
    try {
      if (!message.tempId) {
        const newMessage = new ChatMessage({
          from: message.from,
          to: message.to,
          text: message.text,
          isTeamMessage: true,
          senderName: message.senderName,
          readBy: [message.from],
        });

        const savedMessage = await newMessage.save();
        io.emit("newTeamMessage", savedMessage.toObject());

        if (callback) callback({ success: true, message: savedMessage });
      }
    } catch (error) {
      console.error("Error handling team message:", error);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});


httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
