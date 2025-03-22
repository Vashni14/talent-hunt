const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const path = require("path"); // ✅ Import path module


dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.post("/upload-profile-picture", (req, res) => {
    // Handle file upload logic here
  });
  

// Student Profile Routes
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/users", require("./routes/userRoutes")); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
