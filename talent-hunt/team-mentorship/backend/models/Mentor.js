import mongoose from 'mongoose';

const MentorSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Custom string ID
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  title: { type: String, default: 'Mentor' },
  phone: { 
    type: String,
    match: [/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Please enter a valid phone number']
  },
  location: String,
  bio: String,
  profilePicture: {
    type: String,
    default: '/default-avatar.png',
    validate: {
      validator: function(url) {
        // Basic URL validation
        return /^(ftp|http|https):\/\/[^ "]+$/.test(url) || url.startsWith('/');
      },
      message: props => `${props.value} is not a valid image URL`
    }
  },
  expertise: [String], // No arbitrary limits
  education: String,
  experience: String,
  // Replace languages with linkedin
linkedin: {
  type: String,
  match: [/^https?:\/\/(www\.)?linkedin\.com\/.+/i, 'Please enter a valid LinkedIn URL']
},
  achievements: [String], // No arbitrary limits
  // Replace the rating field with branch
branch: {
  type: String,
  enum: ['Computer Branch', 'AIDS Branch', 'ECS Branch', 'Mechanical Branch'],
  default: 'Computer Branch'
},
}, { 
  timestamps: true,
  _id: false // Disable automatic _id generation
});

// Handle duplicate email errors
MentorSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Email already exists'));
  } else {
    next(error);
  }
});

// Virtual for profile picture URL
MentorSchema.virtual('profilePictureUrl').get(function() {
  if (this.profilePicture.startsWith('http')) {
    return this.profilePicture;
  }
  return `${process.env.BASE_URL || ''}${this.profilePicture}`;
});

export default mongoose.model('Mentor', MentorSchema);