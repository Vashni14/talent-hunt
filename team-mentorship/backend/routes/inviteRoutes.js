const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Invitation = require('../models/Invitation');

// Create a new invitation
router.post('/', async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['senderId', 'senderName', 'receiverId', 'receiverName', 'type', 'message'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    // Validate invitation type
    const validTypes = ['project', 'competition', 'feedback'];
    if (!validTypes.includes(req.body.type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Create new invitation
    const invitation = new Invitation({
      senderId: req.body.senderId,
      senderName: req.body.senderName,
      receiverId: req.body.receiverId,
      receiverName: req.body.receiverName,
      type: req.body.type,
      message: req.body.message,
      status: 'pending' // Default status
    });

    await invitation.save();

    res.status(201).json({
      success: true,
      data: invitation
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating invitation'
    });
  }
});

// Get all invitations for a user (received)
router.get('/received/:userId', async (req, res) => {
  try {
    const invitations = await Invitation.find({ receiverId: req.params.userId })
      .sort({ createdAt: -1 }); // Newest first

    res.json({
      success: true,
      data: invitations
    });
  } catch (error) {
    console.error('Error fetching received invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching received invitations'
    });
  }
});

// Get all invitations sent by a user
router.get('/sent/:userId', async (req, res) => {
  try {
    const invitations = await Invitation.find({ senderId: req.params.userId })
      .sort({ createdAt: -1 }); // Newest first

    res.json({
      success: true,
      data: invitations
    });
  } catch (error) {
    console.error('Error fetching sent invitations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sent invitations'
    });
  }
});

// Get a specific invitation by ID
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invitation ID format'
      });
    }

    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    res.json({
      success: true,
      data: invitation
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching invitation'
    });
  }
});

// Update an invitation (e.g., accept/decline)
router.patch('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invitation ID format'
      });
    }

    const validStatuses = ['pending', 'accepted', 'declined', 'cancelled'];
    if (req.body.status && !validStatuses.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updates = {
      ...(req.body.status && { status: req.body.status }),
      ...(req.body.responseMessage && { responseMessage: req.body.responseMessage }),
      updatedAt: new Date()
    };

    const invitation = await Invitation.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    res.json({
      success: true,
      data: invitation
    });
  } catch (error) {
    console.error('Error updating invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating invitation'
    });
  }
});

// Delete an invitation
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invitation ID format'
      });
    }

    const invitation = await Invitation.findByIdAndDelete(req.params.id);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found'
      });
    }

    res.json({
      success: true,
      message: 'Invitation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting invitation'
    });
  }
});

module.exports = router;