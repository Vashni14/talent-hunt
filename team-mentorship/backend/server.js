const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const StudentProfile = require("./models/StudentProfile"); 
const goalRoutes = require("./routes/goals");
const teamsRouter = require('./routes/team');
const mentorApplicationRoutes = require('./routes/mentorApplicationRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
