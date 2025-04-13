import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import mentorRoutes from './routes/mentorRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

// Get the current module's directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create absolute path to uploads directory
const uploadsDir = path.join(__dirname, 'uploads');

const app = express();

// Ensure upload directory exists
const ensureUploadsDir = () => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(`Upload directory created at: ${uploadsDir}`);
    }
    // Verify write permissions
    fs.accessSync(uploadsDir, fs.constants.W_OK);
    console.log(`Upload directory is writable: ${uploadsDir}`);
  } catch (err) {
    console.error(`Upload directory error: ${err.message}`);
    process.exit(1);
  }
};

ensureUploadsDir();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res, filePath) => {
    res.set('Cache-Control', 'public, max-age=31536000');
    // Set proper content-type based on file extension
    const ext = path.extname(filePath);
    if (ext === '.jpg' || ext === '.jpeg') {
      res.type('image/jpeg');
    } else if (ext === '.png') {
      res.type('image/png');
    }
  }
}));

// Database connection
mongoose.connect(process.env.MONGO_URI, {
  dbName: "mentorDB"
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/mentors', mentorRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
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

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Uploads directory: ${uploadsDir}`);
});