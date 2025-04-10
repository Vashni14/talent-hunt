const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  user: { type: String, required: true },
  message: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdBy: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Invitation', invitationSchema);