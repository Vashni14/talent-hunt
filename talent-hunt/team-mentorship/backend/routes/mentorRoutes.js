const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const {
  getMentorProfile,
  updateMentorProfile,
  uploadProfilePicture
} = require('../controllers/mentorController');

const router = express.Router();

// Improved upload configuration
const UPLOAD_DIR = path.resolve(__dirname, '../uploads');  // More reliable path resolution
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Enhanced directory handling
const ensureUploadDir = () => {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      console.log(`Upload directory created at: ${UPLOAD_DIR}`);
    }
    fs.accessSync(UPLOAD_DIR, fs.constants.W_OK | fs.constants.R_OK);
  } catch (err) {
    console.error('Upload directory error:', err);
    throw new Error('Failed to initialize upload directory');
  }
};

// More robust multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      ensureUploadDir();
      cb(null, UPLOAD_DIR);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `mentor-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  try {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only ${ALLOWED_MIME_TYPES.join(', ')} are allowed`), false);
    }
  } catch (err) {
    cb(err);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  }
}).single('profilePicture');

// Unified error handling middleware
const handleUploadErrors = (err, req, res, next) => {
  if (err) {
    console.error('Upload error:', err);
    
    const status = err instanceof multer.MulterError ? 400 : 500;
    const message = err instanceof multer.MulterError 
      ? err.code === 'LIMIT_FILE_SIZE' 
        ? 'File size exceeds 5MB limit' 
        : 'File upload failed'
      : 'Server error during file upload';

    return res.status(status).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  next();
};

// Routes with improved error handling
router.route('/:id')
  .get(getMentorProfile)
  .put(updateMentorProfile);

router.post(
  '/:id/upload',
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err) return next(err);
      if (!req.file) return next(new Error('No file uploaded'));
      next();
    });
  },
  handleUploadErrors,
  uploadProfilePicture
);

module.exports = router;