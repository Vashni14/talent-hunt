const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String, default: "/placeholder-team.svg" },
  project: { type: String, required: true },
  description: { type: String, required: true },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'StudentProfile', 
  },
  mentors: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Mentor', 
  }],
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile' },
    name: String,
    role: String,
    avatar: String,
    joinedAt: { type: Date, default: Date.now }
  }],
  skillsNeeded: [{ type: String }],
  maxMembers: { type: Number,  min: 1 },
  currentMembers: { type: Number, default: 1 },
  deadline: { type: Date, required: true },
  contactEmail: { type: String},
  status: { 
    type: String, 
    enum: ['recruiting', 'active', 'completed'], 
    default: 'recruiting' 
  },
  applications: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile' },
    message: { type: String },
    skills: [{ type: String }],
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'rejected'], 
      default: 'pending' 
    },
    appliedAt: { type: Date, default: Date.now }
  }],
  createdBy:{
    type:String,
    required:true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  sdgs: [{
    type: Number,
    enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    default: []
  }],
});

// Indexes for better query performance
TeamSchema.index({ owner: 1 });
TeamSchema.index({ status: 1 });
TeamSchema.index({ skillsNeeded: 1 });
TeamSchema.index({ 'members.user': 1 });
TeamSchema.index({ 'applications.user': 1 });
TeamSchema.pre('find', function() {
  this.populate('members.user', 'name profilePicture rolePreference');
});
TeamSchema.pre('findOne', function() {
  this.populate('members.user', 'name profilePicture rolePreference');
});

module.exports = mongoose.model('Team', TeamSchema);