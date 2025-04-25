const mongoose = require('mongoose');

const mentorApplicationSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
mentorApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find applications by mentor
mentorApplicationSchema.statics.findByMentor = function(mentorId, status) {
  let query = { mentor: mentorId };
  if (status) {
    query.status = status;
  }
  return this.find(query)
    .populate('team', 'name description members')
    .sort({ createdAt: -1 });
};

// Static method to find applications by team
mentorApplicationSchema.statics.findByTeam = function(teamId, status) {
  let query = { team: teamId };
  if (status) {
    query.status = status;
  }
  return this.find(query)
    .populate('mentor', 'name domain currentPosition profilePicture skills')
    .sort({ createdAt: -1 });
};

const MentorApplication = mongoose.model('MentorApplication', mentorApplicationSchema);

module.exports = MentorApplication;