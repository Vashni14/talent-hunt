import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: String,
  role: String,
  avatar: String, // Initials or image URL
});

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  members: [memberSchema],
  project: String,
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Completed'],
    default: 'Active',
  },
  lastMeeting: String,
  progress: {
    type: Number,
    min: 0,
    max: 100,
  },
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);

export default Team;
