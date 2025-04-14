const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  teamSize: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Active', 'Upcoming', 'Completed']
  },
  prizePool: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    required: true
  },
  requirements: {
    type: [String],
    required: true
  },
  sdgs: {
    type: [Number],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.every(num => num >= 1 && num <= 17);
      },
      message: 'SDGs must be numbers between 1 and 17'
    }
  }
}, {
  timestamps: true
});

const Competition = mongoose.model('Competition', competitionSchema);

module.exports = Competition;