import React, { useState, useEffect, useRef } from 'react';
import { useSnackbar } from 'notistack'; 
import { MenuItem } from '@mui/material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  TextField,
  Divider,
  IconButton,
  Chip,
  Stack,
  Paper,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Star as StarIcon,
  Language as LanguageIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const ProfileCard = styled(Card)(({ theme }) => ({
  borderRadius: '24px',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(17, 25, 40, 0.7), rgba(22, 31, 49, 0.7))'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(247, 250, 252, 0.9))',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
  boxShadow: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 12px 24px rgba(0, 0, 0, 0.2)'
      : '0 12px 24px rgba(0, 0, 0, 0.1)',
  },
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const MentorProfile = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const mockData = {
    _id: '1',
    name: 'Dr. Sarah Johnson',
    title: 'Senior Mentor',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 123-4567',
    profilePicture: '/default-avatar.png',
    expertise: ['Machine Learning', 'Data Science', 'AI Ethics'],
    education: 'Ph.D. in Computer Science, Stanford University',
    experience: '10+ years in AI research and mentoring',
    branch: 'Computer Branch',
    linkedin: 'https://linkedin.com/in/example',
    bio: 'Experienced mentor with a passion for guiding students...',
    achievements: [
      'Mentored 50+ successful projects',
      'Published 15 research papers',
      'Speaker at 10+ tech conferences',
    ],
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/mentor-profile/1');
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          throw new Error('API request failed');
        }
      } catch (err) {
        console.error('Failed to fetch profile, using mock data:', err);
        setProfile(mockData);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Prepare data with proper formatting
      const dataToSend = {
        ...profile,
        // Ensure branch is valid or default to Computer Branch
        branch: ['Computer Branch', 'AIDS Branch', 'ECS Branch', 'Mechanical Branch'].includes(profile.branch) 
          ? profile.branch 
          : 'Computer Branch',
        // Clean LinkedIn URL (remove trailing slashes, etc.)
        linkedin: profile.linkedin ? profile.linkedin.trim() : '',
        // Format expertise as array if needed
        expertise: Array.isArray(profile.expertise) 
          ? profile.expertise 
          : profile.expertise.split(',').map(s => s.trim()),
        // Format achievements as array if needed
        achievements: Array.isArray(profile.achievements) 
          ? profile.achievements 
          : profile.achievements.split('\n').filter(a => a.trim())
      };
  
      const response = await fetch(`http://localhost:5001/api/mentor-profile/${profile._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save');
      }
  
      const data = await response.json();
   
      // Update profile with formatted data from server
      setProfile({
        ...data,
        branch: data.branch || 'Computer Branch', // Ensure branch always has a value
        linkedin: data.linkedin || '', // Ensure linkedin exists even if empty
        expertise: Array.isArray(data.expertise) ? data.expertise : [],
        achievements: Array.isArray(data.achievements) ? data.achievements : []
      });
  
      setIsEditing(false);
      enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
    } catch (err) {
      console.error('Save error:', err);
      enqueueSnackbar(`Failed to save: ${err.message}`, { variant: 'error' });
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    try {
      setUploading(true);
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.');
      }
  
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB limit');
      }
  
      const formData = new FormData();
      formData.append('profilePicture', file);
  
      const response = await fetch(
        `http://localhost:5001/api/mentor-profile/${profile._id}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
  
      const result = await response.json();
      
      setProfile(prev => ({
        ...prev,
        profilePicture: `${result.profilePicture}?t=${Date.now()}` // Cache busting
      }));
  
      enqueueSnackbar('Profile picture updated successfully!', { variant: 'success' });
      
    } catch (error) {
      console.error('Upload error:', error);
      enqueueSnackbar(error.message, { variant: 'error' });
    } finally {
      setUploading(false);
      // Reset file input
      if (event.target) event.target.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleInputChange = (field, value) => {
    if (field === 'rating') {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue)) {
        value = 0;
      } else if (numericValue > 5) {
        value = 5;
      } else if (numericValue < 0) {
        value = 0;
      }
    }
    
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? value.split(',').map(item => item.trim()) : value
    }));
  };

  if (loading || !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">Loading profile...</Typography>
      </Box>
    );
  }

  return (
    <MotionBox
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        maxWidth: '1400px', 
        mx: 'auto',
        background: (theme) => theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
          : 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
        minHeight: '100vh',
      }}
    >
      {/* Header Section */}
      <MotionCard variants={itemVariants} sx={{ mb: 4 }}>
        <ProfileCard>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ position: 'relative' }}>
                <Avatar
  sx={{
    width: 160,
    height: 160,
    border: '4px solid',
    borderColor: uploading ? 'grey.500' : 'primary.main',
    transition: 'border-color 0.3s ease',
  }}
  src={
    profile.profilePicture?.startsWith('/uploads/') 
      ? `http://localhost:5001${profile.profilePicture}?t=${Date.now()}`
      : profile.profilePicture || '/default-avatar.png'
  }
  onError={(e) => {
    e.target.src = '/default-avatar.png';
  }}
/>

                  {isEditing && (
                    <IconButton
  onClick={triggerFileInput}
  sx={{
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'primary.main',
    color: 'white',
    '&:hover': {
      backgroundColor: uploading ? 'primary.main' : 'primary.dark',
    },
    transition: 'background-color 0.3s ease',
  }}
  disabled={uploading}
>
  {uploading ? (
    <CircularProgress 
      size={24}
      color="inherit"
      thickness={4}
      sx={{
        animationDuration: '800ms',
        position: 'absolute',
      }}
    />
  ) : (
    <CloudUploadIcon />
  )}
</IconButton>
                  )}
                  <VisuallyHiddenInput 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={9}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        label="Name"
                        value={profile.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                    ) : (
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        {profile.name}
                      </Typography>
                    )}
                    
                    {isEditing ? (
                      <TextField
                        fullWidth
                        label="Title"
                        value={profile.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                    ) : (
                      <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                        {profile.title}
                      </Typography>
                    )}
                    
                    {/* Replace the rating section (~line 400) with: */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      {isEditing ? (
                        <TextField
                          select
                          label="Branch"
                          value={profile.branch || 'Computer Branch'}
                          onChange={(e) => handleInputChange('branch', e.target.value)}
                          variant="outlined"
                          size="small"
                          sx={{ width: 200 }}
                        >
                          {['Computer Branch', 'AIDS Branch', 'ECS Branch', 'Mechanical Branch'].map((option) => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {profile.branch || 'Computer Branch'}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <IconButton
                    onClick={isEditing ? handleSave : handleEdit}
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                  >
                    {isEditing ? <SaveIcon /> : <EditIcon />}
                  </IconButton>
                </Box>

                {/* Bio Field */}
                {isEditing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Bio"
                    value={profile.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    variant="outlined"
                    sx={{ mb: 3 }}
                  />
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {profile.bio}
                  </Typography>
                )}

                {/* Contact Information */}
                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon color="primary" />
                    {isEditing ? (
                      <TextField
                        label="Email"
                        value={profile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        variant="standard"
                        size="small"
                      />
                    ) : (
                      <Typography variant="body2">{profile.email}</Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon color="primary" />
                    {isEditing ? (
                      <TextField
                        label="Phone"
                        value={profile.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        variant="standard"
                        size="small"
                      />
                    ) : (
                      <Typography variant="body2">{profile.phone}</Typography>
                    )}
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </ProfileCard>
      </MotionCard>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid item xs={12} md={6}>
          <MotionCard variants={itemVariants}>
            <ProfileCard>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  Professional Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Education"
                      value={profile.education || ''}
                      onChange={(e) => handleInputChange('education', e.target.value)}
                      disabled={!isEditing}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Experience"
                      value={profile.experience || ''}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      disabled={!isEditing}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Expertise
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    label="Expertise (comma separated)"
                    value={(profile.expertise || []).join(', ')}
                    onChange={(e) => handleArrayChange('expertise', e.target.value)}
                    disabled={!isEditing}
                    variant="outlined"
                    sx={{ mb: 4 }}
                  />
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
                    {(profile.expertise || []).map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        color="primary"
                        sx={{
                          borderRadius: '8px',
                          backgroundColor: 'primary.main',
                          color: 'white',
                        }}
                      />
                    ))}
                  </Box>
                )}

                {/* Replace languages section (~line 500) with: */}
<Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
  LinkedIn
</Typography>
{isEditing ? (
  <TextField
    fullWidth
    label="LinkedIn URL"
    value={profile.linkedin || ''}
    onChange={(e) => handleInputChange('linkedin', e.target.value)}
    disabled={!isEditing}
    variant="outlined"
    sx={{ mb: 2 }}
  />
) : (
  <Button
    variant="text"
    color="primary"
    href={profile.linkedin}
    target="_blank"
    rel="noopener noreferrer"
    sx={{ textTransform: 'none' }}
  >
    View LinkedIn Profile
  </Button>
)}
              </CardContent>
            </ProfileCard>
          </MotionCard>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4} sx={{ 
  width: { md: '40%' } // Increase from default 33% to 40
}}>
          <MotionCard variants={itemVariants}>
            <ProfileCard>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  Achievements
                </Typography>
                {isEditing ? (
                  <Box>
                    {(profile.achievements || []).map((achievement, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                          fullWidth
                          value={achievement}
                          onChange={(e) => {
                            const newAchievements = [...profile.achievements];
                            newAchievements[index] = e.target.value;
                            handleInputChange('achievements', newAchievements);
                          }}
                          variant="outlined"
                          size="small"
                        />
                        <IconButton
                          onClick={() => {
                            const newAchievements = [...profile.achievements];
                            newAchievements.splice(index, 1);
                            handleInputChange('achievements', newAchievements);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        handleInputChange('achievements', [...profile.achievements, '']);
                      }}
                      sx={{ mt: 1 }}
                    >
                      Add Achievement
                    </Button>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {(profile.achievements || []).map((achievement, index) => (
                      <Paper
                        key={index}
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          background: (theme) => theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.02)',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <StarIcon color="primary" />
                          <Typography variant="body2">{achievement}</Typography>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </ProfileCard>
          </MotionCard>
        </Grid>
      </Grid>
    </MotionBox>
  );
};

export default MentorProfile;