const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require('path');
const fs = require('fs');

// Load environment variables first
dotenv.config();

// Initialize Express app
const app = express();

// Your MongoDB connection setup
const connectMentorDB = async () => {
  try {
    await mongoose.connect(process.env.MENTOR_MONGO_URI);
    console.log('✅ MongoDB Connected!');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Connect to your mentorDB
connectMentorDB();

// Your upload directory setup
const uploadsDir = path.join(__dirname, 'uploads');
const ensureUploadsDir = () => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`Upload directory created at: ${uploadsDir}`);
    }
    fs.accessSync(uploadsDir, fs.constants.W_OK);
  } catch (err) {
    console.error(`Upload directory error: ${err.message}`);
    process.exit(1);
  }
};
ensureUploadsDir();

// Middleware (preserve teammate's existing middleware)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
  origin: 'http://localhost:5174',  // Match your frontend port
  methods: ['GET', 'PUT', 'POST'],
  credentials: true,
  allowedHeaders: ['Content-Type']
}));

// Static files (your enhanced version)
app.use("/uploads", express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    res.set('Cache-Control', 'public, max-age=31536000');
    const ext = path.extname(filePath);
    if (ext === '.jpg' || ext === '.jpeg') {
      res.type('image/jpeg');
    } else if (ext === '.png') {
      res.type('image/png');
    }
  }
}));

// Your health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    dbConnection: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    uploadDir: {
      path: uploadsDir,
      exists: fs.existsSync(uploadsDir),
      writable: (() => {
        try {
          fs.accessSync(uploadsDir, fs.constants.W_OK);
          return true;
        } catch {
          return false;
        }
      })()
    }
  });
});

// Your mentor routes
app.use('/api/mentor-profile', require('./routes/mentorRoutes'));  // Unique endpoint

// Preserve all of your teammate's existing routes below this line
app.use('/api/sdgs', require('./routes/sdg'));
app.use("/api/student", require("./routes/studentRoutes"));
app.use('/api/teams', require('./routes/team'));
app.use("/api/goals", require("./routes/goals"));

// Preserve teammate's student profile endpoint
app.post("/api/student/profile", async (req, res) => {
  try {
    const { uid, name, contact, domain, rolePreference, linkedin, github, portfolio, skills, projects, certifications, experience, bio } = req.body;
    await require("./models/StudentProfile").findOneAndUpdate(
      { uid },
      { $set: { name, contact, domain, rolePreference, linkedin, github, portfolio, skills, projects, certifications, experience, bio } },
      { new: true, upsert: true }
    );
    res.status(200).json({ message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));