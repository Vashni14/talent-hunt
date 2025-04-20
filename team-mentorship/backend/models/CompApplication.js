const mongoose = require('mongoose');

const compAppliactionSchema = new mongoose.Schema({
  competition: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Competition', 
    required: true 
  },
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'StudentProfile', 
    required: true 
  },
  team: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team', 
    required: true 
  },
  motivation: { type: String, required: true },
  skills: { type: [String], required: true },
  additionalInfo: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  },
  result: { 
    type: String, 
    enum: [null, 'winner', 'runner-up', 'finalist', 'participated'], 
    default: null 
  },
  analysis: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('CompAppliaction', compAppliactionSchema);