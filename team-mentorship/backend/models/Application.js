const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  opening: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TeamOpening', 
    required: true 
  },
  applicant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'StudentProfile', 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  skills: [{ 
    type: String 
  }],
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  }
}, { timestamps: { createdAt: 'appliedAt', updatedAt: 'processedAt' } });

// Sync with Team.applications subdocument
ApplicationSchema.post('save', async function(doc) {
  const opening = await mongoose.model('TeamOpening').findById(doc.opening);
  
  await mongoose.model('Team').updateOne(
    { _id: opening.team },
    { $push: { 
      applications: {
        user: doc.applicant,
        message: doc.message,
        skills: doc.skills,
        status: doc.status
      }
    }}
  );
});

const Application = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);

module.exports = Application;