const mongoose = require('mongoose');

const TeamOpeningSchema = new mongoose.Schema({
  team: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team', 
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  skillsNeeded: [{ 
    type: String 
  }],
  seatsAvailable: { 
    type: Number, 
    required: true,
  },
  deadline: { 
    type: Date,
    required: true 
  },
  status: { 
    type: String, 
    enum: ['open', 'closed'], 
    default: 'open' 
  },
  createdBy: { 
    type:String,
    required: true 
  }
}, { timestamps: true });

// Auto-update Team's applications when opening is created
TeamOpeningSchema.post('save', async function(doc) {
  await mongoose.model('Team').updateOne(
    { _id: doc.team },
    { $push: { applications: [] } } // Initialize if needed
  );
});

const TeamOpening = mongoose.models.TeamOpening || mongoose.model('TeamOpening', TeamOpeningSchema);

module.exports = TeamOpening;