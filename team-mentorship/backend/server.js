const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const StudentProfile = require("./models/StudentProfile");
const goalRoutes = require("./routes/goals");
const teamsRouter = require("./routes/team");
const { createServer } = require("http");
const { Server } = require("socket.io");
const chatRoutes = require("./routes/chatRoutes");
const mentorApplicationRoutes = require("./routes/mentorApplicationRoutes");
const ChatMessage = require("./models/ChatMessage");
const Team = require("./models/Team");

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

// Add middleware to parse JSON request bodies
app.use(express.json());

// Configure CORS properly
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make sure this comes before your routes
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// In your main server file (app.js or server.js)
const sdgRoutes = require("./routes/sdg");
app.use("/api/sdgs", sdgRoutes);
app.use("/api/invitations", require("./routes/teamOpenings"));
// Student Profile Routes
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/teams", teamsRouter);
app.use("/api/goals", goalRoutes);
//Mentor Routes
app.use("/api/mentor", require("./routes/mentorRoutes"));
app.use("/api/mentor", mentorApplicationRoutes);
//Admin Routes
app.use("/api/competitions", require("./routes/competitions"));
app.use("/api/compapp", require("./routes/compapp"));
app.use("/api/sdgadmin", require("./routes/sdgadmin"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/admindash", require("./routes/admindash"));
// Add this to your server.js file after other route imports
app.use("/api/mentor-dashboard", require("./routes/mentordash"));
app.use("/api/chat", chatRoutes);

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  let currentUserId = null;

  // Register user with their UID
  socket.on("register", (userId) => {
    currentUserId = userId;
    console.log(`User ${userId} registered for real-time updates`);
    socket.join(`user_${userId}`);
  });

  // Handle new private messages
  socket.on("sendMessage", async (message, callback) => {
    try {
      if (!message.tempId) {
        const newMessage = new ChatMessage({
          from: message.from,
          to: message.to,
          text: message.text,
          readBy: [message.from],
        });

        const savedMessage = await newMessage.save();

        // Emit to sender and receiver
        io.to(`user_${message.from}`).emit(
          "newMessage",
          savedMessage.toObject()
        );
        io.to(`user_${message.to}`).emit("newMessage", savedMessage.toObject());

        if (callback)
          callback({ success: true, message: savedMessage.toObject() });
      }
    } catch (error) {
      console.error("Error handling message:", error);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  // Handle new team messages
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

        // Emit to all team members
        const team = await Team.findById(message.to).lean();
        if (team) {
          const memberIds = team.members.map((m) => m.user);
          memberIds.push(team.createdBy);
          memberIds.forEach((userId) => {
            io.to(`user_${userId}`).emit(
              "newTeamMessage",
              savedMessage.toObject()
            );
          });
        }

        if (callback)
          callback({ success: true, message: savedMessage.toObject() });
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

// Attach io to app for use in routes
app.set("io", io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
