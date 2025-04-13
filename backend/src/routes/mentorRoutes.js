import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import {
  getMentorProfile,
  updateMentorProfile,
  uploadProfilePicture
} from '../controllers/mentorController.js';

const router = express.Router();

// Upload configuration using absolute path
const UPLOAD_DIR = path.resolve('uploads');
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Ensure upload directory exists
const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log(`Upload directory created at: ${UPLOAD_DIR}`);
  }
  // Verify directory is writable
  fs.accessSync(UPLOAD_DIR, fs.constants.W_OK);
};

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDir();
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `mentor-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Only ${ALLOWED_MIME_TYPES.join(', ')} files are allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // Limit to 1 file
    parts: 2 // Form data parts (file + field)
  }
}).single('profilePicture'); // Explicitly declare single file


// Error handling middleware
const handleUploadErrors = (err, req, res, next) => {
  if (err) {
    let message = 'File upload failed';
    let status = 400;

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        message = 'File size exceeds 5MB limit';
      }
    }

    return res.status(status).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  next();
};

// Routes
router.route('/:id')
  .get(getMentorProfile)
  .put(updateMentorProfile);

  router.post(
    '/:id/upload',
    (req, res, next) => {
      upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          // Multer-specific errors
          return res.status(400).json({
            success: false,
            message: 'File upload error',
            error: err.code === 'LIMIT_FILE_SIZE' 
              ? 'File too large (max 5MB)' 
              : err.message
          });
        } else if (err) {
          // Other errors
          return res.status(500).json({
            success: false,
            message: 'Upload failed',
            error: err.message
          });
        }
        next();
      });
    },
    uploadProfilePicture
  );

export default router;