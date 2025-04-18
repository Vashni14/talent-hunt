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
  deadline: {
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
competitionSchema.pre('save', function(next) {
  if (this.isModified('date')) {
    const [startStr, endStr] = this.date.split(' - ');
    
    // Create dates in UTC
    const now = new Date();
    const nowUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    
    const startDate = new Date(startStr + 'T00:00:00Z');
    const endDate = new Date(endStr + 'T23:59:59Z');

    if (nowUTC < startDate) {
      this.status = 'Upcoming';
    } else if (nowUTC >= startDate && nowUTC <= endDate) {
      this.status = 'Active';
    } else {
      this.status = 'Completed';
    }
  }
  next();
});

const Competition = mongoose.model('Competition', competitionSchema);

module.exports = Competition;