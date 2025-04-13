import Mentor from '../models/Mentor.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const getMentorProfile = async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ _id: req.params.id });
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    res.json(mentor);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: err.message
    });
  }
};

export const updateMentorProfile = async (req, res) => {
  try {
    const updatedMentor = await Mentor.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { 
        new: true,
        upsert: false
      }
    );
    
    if (!updatedMentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    
    res.json(updatedMentor);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ 
      message: 'Error updating profile',
      error: err.message 
    });
  }
};

export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    // Use path.join to create correct file paths
    const fileUrl = `/uploads/${req.file.filename}`;
    const fullPath = path.join(process.cwd(), 'uploads', req.file.filename);
    
    // Verify file was saved
    if (!fs.existsSync(fullPath)) {
      throw new Error('File was not saved correctly');
    }

    // Update mentor profile
    const mentor = await Mentor.findByIdAndUpdate(
      req.params.id,
      { profilePicture: fileUrl },
      { new: true }
    );

    if (!mentor) {
      // Clean up the uploaded file if mentor not found
      fs.unlinkSync(fullPath);
      return res.status(404).json({ 
        success: false,
        message: 'Mentor not found' 
      });
    }

    res.json({ 
      success: true,
      profilePicture: fileUrl
    });
    
  } catch (err) {
    console.error('Upload error:', err);
    
    // Clean up any uploaded file if error occurred
    if (req.file) {
      const fullPath = path.join(process.cwd(), 'uploads', req.file.filename);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error uploading profile picture',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};