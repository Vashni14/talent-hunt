import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  Avatar,
  AvatarGroup,
  Chip,
  Button,
  LinearProgress,
  Tooltip,
  Stack,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Paper,
  CircularProgress,
  Fade,
} from '@mui/material';
import {
  Group as GroupIcon,
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
  Feedback as FeedbackIcon,
  Public as PublicIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreVertIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  EmojiEvents as EmojiEventsIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';

const Item = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(17, 25, 40, 0.7), rgba(22, 31, 49, 0.7))'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(247, 250, 252, 0.9))',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
  boxShadow: 'none',
  borderRadius: '20px',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 12px 24px rgba(0, 0, 0, 0.2)'
      : '0 12px 24px rgba(0, 0, 0, 0.1)',
  },
}));

const ListItemStyled = styled(ListItem)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(17, 25, 40, 0.6)' : 'rgba(255, 255, 255, 0.9)',
  borderRadius: '12px',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2.5),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(17, 25, 40, 0.8)' : 'rgba(255, 255, 255, 1)',
    transform: 'translateY(-2px) scale(1.01)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 24px rgba(0, 0, 0, 0.3)'
      : '0 8px 24px rgba(0, 0, 0, 0.08)',
  },
  '&:last-child': {
    marginBottom: 0,
  },
}));

const CardHeaderStyled = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(1, 0),
}));

const CardContentStyled = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  '&:last-child': {
    paddingBottom: theme.spacing(3),
  },
}));

const ListItemContentWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  gap: theme.spacing(2),
}));

const StatusWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginLeft: 'auto',
  flexShrink: 0,
}));

const MotionBox = motion(Box);
const MotionCard = motion(Item);

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

const ProgressCircle = ({ value, size = 40, thickness = 4 }) => (
  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
    <CircularProgress
      variant="determinate"
      value={value}
      size={size}
      thickness={thickness}
      sx={{
        color: value > 70 ? 'success.main' : value > 40 ? 'warning.main' : 'error.main',
      }}
    />
    <Box
      sx={{
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="caption" component="div" color="text.secondary">
        {value}%
      </Typography>
    </Box>
  </Box>
);

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      display: 'flex',
      alignItems: 'center',
      gap: 2.5,
      borderRadius: '16px',
      backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(17, 25, 40, 0.6)' : 'rgba(255, 255, 255, 0.9)',
      border: '1px solid',
      borderColor: 'divider',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: (theme) => theme.palette.mode === 'dark'
          ? '0 8px 24px rgba(0, 0, 0, 0.3)'
          : '0 8px 24px rgba(0, 0, 0, 0.08)',
      },
    }}
  >
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) => `linear-gradient(135deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
        boxShadow: `0 4px 12px ${color}.light`,
      }}
    >
      <Icon sx={{ fontSize: 28, color: 'white' }} />
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.025em' }}>
        {value}
      </Typography>
    </Box>
  </Paper>
);

const MentorDashboard = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [mentorName, setMentorName] = useState('Mentor');

  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        const uid = auth.currentUser.uid; // Get Firebase UID directly
        const response = await fetch(`http://localhost:5000/api/mentors/${uid}`);
        const data = await response.json();
        
        // Set data for your dashboard
        setMentorName(data.name || 'Mentor');
        // Add other data states as needed
      } catch (error) {
        console.error('Failed to load mentor data:', error);
      }
    };
    fetchMentorData();
  }, []);
  
  const handleMenuClick = (event, team) => {
    setAnchorEl(event.currentTarget);
    setSelectedTeam(team);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTeam(null);
  };

  const upcomingSessions = [
    { id: 1, team: 'Team Alpha', date: '2024-03-20', time: '14:00', type: 'Weekly Review', status: 'upcoming' },
    { id: 2, team: 'Team Beta', date: '2024-03-21', time: '15:30', type: 'Project Planning', status: 'upcoming' },
  ];

  const pendingFeedback = [
    { id: 1, team: 'Team Alpha', task: 'Project Proposal Review', due: '2024-03-19', priority: 'high' },
    { id: 2, team: 'Team Beta', task: 'Code Review', due: '2024-03-20', priority: 'medium' },
  ];

  const sdgProgress = [
    { id: 1, goal: 'SDG 4: Quality Education', progress: 85, icon: '📚' },
    { id: 2, goal: 'SDG 9: Industry, Innovation', progress: 70, icon: '🏭' },
    { id: 3, goal: 'SDG 11: Sustainable Cities', progress: 60, icon: '🏙️' },
  ];

  const teams = [
    {
      id: 1,
      name: 'Team Alpha',
      project: 'Smart Agriculture System',
      members: [
        { id: 1, name: 'John Doe', role: 'Team Lead', avatar: 'JD' },
        { id: 2, name: 'Jane Smith', role: 'Developer', avatar: 'JS' },
        { id: 3, name: 'Mike Johnson', role: 'Designer', avatar: 'MJ' },
      ],
      status: 'active',
      progress: 75,
      lastMeeting: '2024-03-15',
    },
    {
      id: 2,
      name: 'Team Beta',
      project: 'Healthcare Monitoring App',
      members: [
        { id: 1, name: 'Sarah Wilson', role: 'Team Lead', avatar: 'SW' },
        { id: 2, name: 'David Brown', role: 'Developer', avatar: 'DB' },
        { id: 3, name: 'Emma Davis', role: 'Designer', avatar: 'ED' },
      ],
      status: 'active',
      progress: 60,
      lastMeeting: '2024-03-16',
    },
  ];

  return (
    <MotionBox
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        maxWidth: '1600px', 
        mx: 'auto',
        background: (theme) => theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
          : 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
        minHeight: '100vh',
        borderRadius: '24px',
      }}
    >
      <Box sx={{ mb: 6 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 800, 
            mb: 2, 
            letterSpacing: '-0.025em',
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(to right, #60A5FA, #34D399)'
              : 'linear-gradient(to right, #2563EB, #059669)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Welcome back, {mentorName}!
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ 
            fontWeight: 400,
            opacity: 0.8,
            mb: 4,
          }}
        >
          Here's an overview of your teams and activities
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={GroupIcon}
              label="Active Teams"
              value={teams.length}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={CalendarTodayIcon}
              label="Upcoming Sessions"
              value={upcomingSessions.length}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={AssessmentIcon}
              label="Average Progress"
              value={`${Math.round(teams.reduce((acc, team) => acc + team.progress, 0) / teams.length)}%`}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={WarningIcon}
              label="Pending Feedback"
              value={pendingFeedback.length}
              color="warning"
            />
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={7}>
          <MotionCard variants={itemVariants}>
            <CardContentStyled>
              <CardHeaderStyled>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                    }}
                  >
                    <GroupIcon sx={{ fontSize: 24, color: 'white' }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Assigned Teams
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  sx={{
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                      boxShadow: '0 6px 16px rgba(59, 130, 246, 0.3)',
                    },
                  }}
                >
                  Add Team
                </Button>
              </CardHeaderStyled>

              <List>
                {teams.map((team) => (
                  <ListItemStyled key={team.id}>
                    <ListItemContentWrapper>
                      <AvatarGroup
                        max={3}
                        sx={{
                          '& .MuiAvatar-root': {
                            width: 40,
                            height: 40,
                            fontSize: '1rem',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                            '&:hover': {
                              transform: 'scale(1.1) translateY(-2px)',
                              zIndex: 2,
                              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
                            },
                          },
                        }}
                      >
                        {team.members.map((member) => (
                          <Tooltip
                            key={member.id}
                            title={`${member.name} (${member.role})`}
                            arrow
                            placement="top"
                          >
                            <Avatar>{member.avatar}</Avatar>
                          </Tooltip>
                        ))}
                      </AvatarGroup>

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {team.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {team.project}
                        </Typography>
                      </Box>

                      <StatusWrapper>
                        <Box
                          sx={{
                            position: 'relative',
                            display: 'inline-flex',
                            p: 0.5,
                            background: (theme) => theme.palette.mode === 'dark'
                              ? 'rgba(17, 25, 40, 0.4)'
                              : 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '12px',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <CircularProgress
                            variant="determinate"
                            value={team.progress}
                            size={44}
                            thickness={4}
                            sx={{
                              color: team.progress > 70 ? 'success.main' : team.progress > 40 ? 'warning.main' : 'error.main',
                            }}
                          />
                          <Box
                            sx={{
                              top: 0,
                              left: 0,
                              bottom: 0,
                              right: 0,
                              position: 'absolute',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="caption" component="div" color="text.secondary" sx={{ fontWeight: 600 }}>
                              {team.progress}%
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={team.status}
                          size="small"
                          color="success"
                          icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            borderRadius: '8px',
                            height: '32px',
                            '& .MuiChip-label': { px: 2, fontWeight: 600 },
                            background: 'linear-gradient(135deg, #34D399, #10B981)',
                            color: 'white',
                            '& .MuiChip-icon': { color: 'white' },
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, team)}
                          sx={{
                            width: 32,
                            height: 32,
                            backgroundColor: (theme) => theme.palette.mode === 'dark'
                              ? 'rgba(17, 25, 40, 0.4)'
                              : 'rgba(255, 255, 255, 0.9)',
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': {
                              backgroundColor: (theme) => theme.palette.mode === 'dark'
                                ? 'rgba(17, 25, 40, 0.6)'
                                : 'rgba(255, 255, 255, 1)',
                            },
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </StatusWrapper>
                    </ListItemContentWrapper>
                  </ListItemStyled>
                ))}
              </List>
            </CardContentStyled>
          </MotionCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <MotionCard variants={itemVariants}>
                <CardContentStyled>
                  <CardHeaderStyled>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #818CF8, #6366F1)',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                        }}
                      >
                        <EventIcon sx={{ fontSize: 24, color: 'white' }} />
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Upcoming Sessions
                      </Typography>
                    </Box>
                    <Badge badgeContent={upcomingSessions.length} color="primary">
                      <NotificationsIcon />
                    </Badge>
                  </CardHeaderStyled>

                  <List>
                    {upcomingSessions.map((session) => (
                      <ListItemStyled key={session.id}>
                        <ListItemContentWrapper>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {session.team}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {session.date} at {session.time}
                              </Typography>
                            </Box>
                          </Box>

                          <StatusWrapper>
                            <Chip
                              label={session.type}
                              size="small"
                              sx={{
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #818CF8, #6366F1)',
                                color: 'white',
                                '& .MuiChip-icon': { color: 'white' },
                              }}
                              icon={<EventIcon sx={{ fontSize: 16 }} />}
                            />
                          </StatusWrapper>
                        </ListItemContentWrapper>
                      </ListItemStyled>
                    ))}
                  </List>
                </CardContentStyled>
              </MotionCard>
            </Grid>

            <Grid item xs={12}>
              <MotionCard variants={itemVariants}>
                <CardContentStyled>
                  <CardHeaderStyled>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #F472B6, #EC4899)',
                          boxShadow: '0 4px 12px rgba(236, 72, 153, 0.2)',
                        }}
                      >
                        <FeedbackIcon sx={{ fontSize: 24, color: 'white' }} />
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Pending Feedback
                      </Typography>
                    </Box>
                    <Badge badgeContent={pendingFeedback.length} color="error">
                      <WarningIcon />
                    </Badge>
                  </CardHeaderStyled>

                  <List>
                    {pendingFeedback.map((feedback) => (
                      <ListItemStyled key={feedback.id}>
                        <ListItemContentWrapper>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {feedback.team}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {feedback.task}
                            </Typography>
                          </Box>

                          <StatusWrapper>
                            <Chip
                              label={`Due: ${feedback.due}`}
                              size="small"
                              sx={{
                                borderRadius: '8px',
                                background: feedback.priority === 'high' 
                                  ? 'linear-gradient(135deg, #FB7185, #E11D48)'
                                  : 'linear-gradient(135deg, #FBBF24, #D97706)',
                                color: 'white',
                                '& .MuiChip-icon': { color: 'white' },
                              }}
                              icon={<WarningIcon sx={{ fontSize: 16 }} />}
                            />
                          </StatusWrapper>
                        </ListItemContentWrapper>
                      </ListItemStyled>
                    ))}
                  </List>
                </CardContentStyled>
              </MotionCard>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <MotionCard variants={itemVariants}>
            <CardContentStyled>
              <CardHeaderStyled>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #34D399, #059669)',
                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)',
                    }}
                  >
                    <PublicIcon sx={{ fontSize: 24, color: 'white' }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    SDG Mapping Progress
                  </Typography>
                </Box>
              </CardHeaderStyled>

              <Grid container spacing={3}>
                {sdgProgress.map((goal) => (
                  <Grid item xs={12} md={4} key={goal.id}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: '16px',
                        background: (theme) => theme.palette.mode === 'dark'
                          ? 'rgba(17, 25, 40, 0.4)'
                          : 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: (theme) => theme.palette.mode === 'dark'
                            ? '0 8px 24px rgba(0, 0, 0, 0.2)'
                            : '0 8px 24px rgba(0, 0, 0, 0.1)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="h4">{goal.icon}</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                          {goal.goal}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Progress
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={goal.progress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              background: `linear-gradient(90deg, ${goal.progress > 70 ? '#10B981' : goal.progress > 40 ? '#F59E0B' : '#EF4444'}, ${goal.progress > 70 ? '#34D399' : goal.progress > 40 ? '#FBBF24' : '#F87171'})`,
                            },
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon 
                          sx={{ 
                            fontSize: 16, 
                            color: goal.progress > 70 ? 'success.main' : goal.progress > 40 ? 'warning.main' : 'error.main' 
                          }} 
                        />
                        <Typography variant="body2" color="text.secondary">
                          {goal.progress}% Complete
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContentStyled>
          </MotionCard>
        </Grid>
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            minWidth: 220,
            borderRadius: '16px',
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.4)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            mt: 1,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            '& .MuiMenuItem-root': {
              py: 1.5,
              px: 2,
              mx: 1,
              my: 0.5,
              borderRadius: '8px',
              gap: 1.5,
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(17, 25, 40, 0.4)'
                  : 'rgba(0, 0, 0, 0.04)',
              },
            },
            '& .MuiDivider-root': {
              my: 1,
              opacity: 0.1,
            },
          },
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          Edit Team
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EmojiEventsIcon sx={{ fontSize: 20, color: 'warning.main' }} />
          View Achievements
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ fontSize: 20 }} />
          Delete Team
        </MenuItem>
      </Menu>
    </MotionBox>
  );
};

export default MentorDashboard;