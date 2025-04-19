const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  message: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected','withdrawn'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true  },
}, { timestamps: true });

module.exports = mongoose.model('Invitation', invitationSchema);