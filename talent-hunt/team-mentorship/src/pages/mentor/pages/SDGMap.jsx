import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  IconButton,
  Tooltip,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Divider,
  Avatar,
  AvatarGroup,
  Badge,
  Stack,
  useTheme,
  Tabs,
  Tab,
  CircularProgress,
  Slider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Group as GroupIcon,
  Public as PublicIcon,
  EmojiEvents as EmojiEventsIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineChartIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

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
    },
  },
};

const SDGGoalCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '16px',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(17, 25, 40, 0.7), rgba(22, 31, 49, 0.7))'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(247, 250, 252, 0.9))',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 12px 24px rgba(0, 0, 0, 0.2)'
      : '0 12px 24px rgba(0, 0, 0, 0.1)',
  },
}));

const ProgressBar = styled(LinearProgress)(({ theme, value }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    background: value > 70
      ? 'linear-gradient(90deg, #10B981, #34D399)'
      : value > 40
      ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
      : 'linear-gradient(90deg, #EF4444, #F87171)',
    transition: 'none',
    animation: 'none',
  },
  '& .MuiLinearProgress-bar1Determinate': {
    transition: 'none',
  },
  '& .MuiLinearProgress-bar2Indeterminate': {
    display: 'none',
  },
}));

const SDGMapping = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('progress');
  const [viewMode, setViewMode] = useState('grid');
  const [timeRange, setTimeRange] = useState('month');
  const [showCharts, setShowCharts] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const sdgGoals = [
    {
      id: 1,
      goal: 'No Poverty',
      icon: '🌍',
      progress: 85,
      teams: 12,
      description: 'End poverty in all its forms everywhere',
      targets: [
        { id: '1.1', description: 'Eradicate extreme poverty', progress: 90 },
        { id: '1.2', description: 'Reduce poverty by at least 50%', progress: 85 },
        { id: '1.3', description: 'Implement social protection systems', progress: 80 },
      ],
      lastUpdated: '2024-03-15',
      status: 'On Track',
    },
    {
      id: 2,
      goal: 'Zero Hunger',
      icon: '🍽️',
      progress: 75,
      teams: 8,
      description: 'End hunger, achieve food security and improved nutrition',
      targets: [
        { id: '2.1', description: 'End hunger and ensure access to food', progress: 80 },
        { id: '2.2', description: 'End all forms of malnutrition', progress: 70 },
        { id: '2.3', description: 'Double agricultural productivity', progress: 75 },
      ],
      lastUpdated: '2024-03-14',
      status: 'On Track',
    },
    {
      id: 3,
      goal: 'Good Health and Well-being',
      icon: '🏥',
      progress: 65,
      teams: 15,
      description: 'Ensure healthy lives and promote well-being for all',
      targets: [
        { id: '3.1', description: 'Reduce maternal mortality', progress: 70 },
        { id: '3.2', description: 'End preventable deaths of newborns', progress: 65 },
        { id: '3.3', description: 'End epidemics of communicable diseases', progress: 60 },
      ],
      lastUpdated: '2024-03-13',
      status: 'Needs Attention',
    },
    {
      id: 4,
      goal: 'Quality Education',
      icon: '📚',
      progress: 55,
      teams: 10,
      description: 'Ensure inclusive and equitable quality education',
      targets: [
        { id: '4.1', description: 'Free primary and secondary education', progress: 60 },
        { id: '4.2', description: 'Equal access to quality pre-primary education', progress: 50 },
        { id: '4.3', description: 'Equal access to affordable technical education', progress: 55 },
      ],
      lastUpdated: '2024-03-12',
      status: 'Needs Attention',
    },
    {
      id: 5,
      goal: 'Gender Equality',
      icon: '⚖️',
      progress: 45,
      teams: 7,
      description: 'Achieve gender equality and empower all women and girls',
      targets: [
        { id: '5.1', description: 'End discrimination against women', progress: 50 },
        { id: '5.2', description: 'Eliminate violence against women', progress: 45 },
        { id: '5.3', description: 'Eliminate harmful practices', progress: 40 },
      ],
      lastUpdated: '2024-03-11',
      status: 'Needs Attention',
    },
    {
      id: 6,
      goal: 'Clean Water and Sanitation',
      icon: '💧',
      progress: 35,
      teams: 5,
      description: 'Ensure availability and sustainable management of water',
      targets: [
        { id: '6.1', description: 'Universal access to safe drinking water', progress: 40 },
        { id: '6.2', description: 'Access to sanitation and hygiene', progress: 35 },
        { id: '6.3', description: 'Improve water quality', progress: 30 },
      ],
      lastUpdated: '2024-03-10',
      status: 'Needs Attention',
    },
  ];

  const handleOpenDialog = (goal) => {
    setSelectedGoal(goal);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGoal(null);
  };

  const filteredGoals = sdgGoals
    .filter(goal => {
      if (filter === 'all') return true;
      if (filter === 'on-track') return goal.progress >= 70;
      if (filter === 'needs-attention') return goal.progress < 70;
      return true;
    })
    .filter(goal => 
      goal.goal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'progress') return b.progress - a.progress;
      if (sortBy === 'teams') return b.teams - a.teams;
      if (sortBy === 'name') return a.goal.localeCompare(b.goal);
      return 0;
    });

  const chartData = [
    { name: 'Jan', progress: 30 },
    { name: 'Feb', progress: 45 },
    { name: 'Mar', progress: 60 },
    { name: 'Apr', progress: 75 },
    { name: 'May', progress: 85 },
    { name: 'Jun', progress: 90 },
  ];

  const pieData = [
    { name: 'On Track', value: 3 },
    { name: 'Needs Attention', value: 3 },
  ];

  const COLORS = ['#10B981', '#F59E0B'];

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleExport = () => {
    console.log('Exporting data...');
  };

  const handleShare = () => {
    console.log('Sharing data...');
  };

  const handleNotification = () => {
    console.log('Setting notification...');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
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
              SDG Mapping Progress
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                fontWeight: 400,
                opacity: 0.8,
              }}
            >
              Track and manage your team's progress towards Sustainable Development Goals
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{
                borderRadius: '8px',
                borderColor: 'divider',
              }}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={handleShare}
              sx={{
                borderRadius: '8px',
                borderColor: 'divider',
              }}
            >
              Share
            </Button>
            <Button
              variant="outlined"
              startIcon={<NotificationsIcon />}
              onClick={handleNotification}
              sx={{
                borderRadius: '8px',
                borderColor: 'divider',
              }}
            >
              Notify
            </Button>
          </Box>
        </Box>

        <Paper sx={{ p: 3, mb: 4, borderRadius: '16px' }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search SDG goals..."
              variant="outlined"
              size="small"
              sx={{ 
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(17, 25, 40, 0.4)'
                    : 'rgba(255, 255, 255, 0.8)',
                },
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filter}
                label="Filter by Status"
                onChange={(e) => setFilter(e.target.value)}
                sx={{
                  borderRadius: '12px',
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(17, 25, 40, 0.4)'
                    : 'rgba(255, 255, 255, 0.8)',
                }}
              >
                <MenuItem value="all">All Goals</MenuItem>
                <MenuItem value="on-track">On Track</MenuItem>
                <MenuItem value="needs-attention">Needs Attention</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                sx={{
                  borderRadius: '12px',
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(17, 25, 40, 0.4)'
                    : 'rgba(255, 255, 255, 0.8)',
                }}
              >
                <MenuItem value="progress">Progress</MenuItem>
                <MenuItem value="teams">Number of Teams</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
                sx={{
                  borderRadius: '12px',
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(17, 25, 40, 0.4)'
                    : 'rgba(255, 255, 255, 0.8)',
                }}
              >
                <MenuItem value="week">Last Week</MenuItem>
                <MenuItem value="month">Last Month</MenuItem>
                <MenuItem value="quarter">Last Quarter</MenuItem>
                <MenuItem value="year">Last Year</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Tabs value={selectedTab} onChange={handleTabChange}>
              <Tab label="Overview" icon={<BarChartIcon />} />
              <Tab label="Progress" icon={<TimelineChartIcon />} />
              <Tab label="Distribution" icon={<PieChartIcon />} />
            </Tabs>
            <FormControlLabel
              control={
                <Switch
                  checked={showCharts}
                  onChange={(e) => setShowCharts(e.target.checked)}
                  color="primary"
                />
              }
              label="Show Charts"
            />
          </Box>

          {showCharts && (
            <Box sx={{ height: 300, mb: 4 }}>
              {selectedTab === 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="progress" fill="#60A5FA" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {selectedTab === 1 && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="progress" stroke="#60A5FA" />
                  </LineChart>
                </ResponsiveContainer>
              )}
              {selectedTab === 2 && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Box>
          )}
        </Paper>

        <Grid container spacing={3}>
          {filteredGoals.map((goal) => (
            <Grid item xs={12} md={6} lg={4} key={goal.id}>
              <MotionCard variants={itemVariants}>
                <SDGGoalCard>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                      }}
                    >
                      <Typography variant="h4">{goal.icon}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {goal.goal}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {goal.description}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={() => handleOpenDialog(goal)}
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: (theme) => theme.palette.mode === 'dark'
                          ? 'rgba(17, 25, 40, 0.4)'
                          : 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          backgroundColor: (theme) => theme.palette.mode === 'dark'
                            ? 'rgba(17, 25, 40, 0.6)'
                            : 'rgba(255, 255, 255, 1)',
                        },
                      }}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {goal.progress}%
                      </Typography>
                    </Box>
                    <ProgressBar value={goal.progress} />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Chip
                      icon={<GroupIcon />}
                      label={`${goal.teams} Teams`}
                      size="small"
                      sx={{
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #818CF8, #6366F1)',
                        color: 'white',
                        '& .MuiChip-icon': { color: 'white' },
                      }}
                    />
                    <Chip
                      icon={goal.status === 'On Track' ? <CheckCircleIcon /> : <WarningIcon />}
                      label={goal.status}
                      size="small"
                      sx={{
                        borderRadius: '8px',
                        background: goal.status === 'On Track'
                          ? 'linear-gradient(135deg, #34D399, #059669)'
                          : 'linear-gradient(135deg, #F59E0B, #D97706)',
                        color: 'white',
                        '& .MuiChip-icon': { color: 'white' },
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Key Targets
                    </Typography>
                    {goal.targets.map((target) => (
                      <Box key={target.id} sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {target.id}: {target.description}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {target.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={target.progress}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 2,
                              background: target.progress > 70
                                ? 'linear-gradient(90deg, #10B981, #34D399)'
                                : target.progress > 40
                                ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                                : 'linear-gradient(90deg, #EF4444, #F87171)',
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Last updated: {goal.lastUpdated}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<TimelineIcon />}
                      onClick={() => handleOpenDialog(goal)}
                      sx={{
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                        },
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </SDGGoalCard>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(17, 25, 40, 0.95), rgba(22, 31, 49, 0.95))'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(247, 250, 252, 0.95))',
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        {selectedGoal && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <Typography variant="h4">{selectedGoal.icon}</Typography>
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {selectedGoal.goal}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedGoal.description}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: '16px',
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(17, 25, 40, 0.4)'
                        : 'rgba(255, 255, 255, 0.8)',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Progress Overview
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Overall Progress
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {selectedGoal.progress}%
                        </Typography>
                      </Box>
                      <ProgressBar value={selectedGoal.progress} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                      <Chip
                        icon={<GroupIcon />}
                        label={`${selectedGoal.teams} Teams`}
                        sx={{
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #818CF8, #6366F1)',
                          color: 'white',
                          '& .MuiChip-icon': { color: 'white' },
                        }}
                      />
                      <Chip
                        icon={selectedGoal.status === 'On Track' ? <CheckCircleIcon /> : <WarningIcon />}
                        label={selectedGoal.status}
                        sx={{
                          borderRadius: '8px',
                          background: selectedGoal.status === 'On Track'
                            ? 'linear-gradient(135deg, #34D399, #059669)'
                            : 'linear-gradient(135deg, #F59E0B, #D97706)',
                          color: 'white',
                          '& .MuiChip-icon': { color: 'white' },
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Last updated: {selectedGoal.lastUpdated}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: '16px',
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(17, 25, 40, 0.4)'
                        : 'rgba(255, 255, 255, 0.8)',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Target Progress
                    </Typography>
                    {selectedGoal.targets.map((target) => (
                      <Box key={target.id} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {target.id}: {target.description}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {target.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={target.progress}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 2,
                              background: target.progress > 70
                                ? 'linear-gradient(90deg, #10B981, #34D399)'
                                : target.progress > 40
                                ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                                : 'linear-gradient(90deg, #EF4444, #F87171)',
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: '16px',
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(17, 25, 40, 0.4)'
                        : 'rgba(255, 255, 255, 0.8)',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Team Contributions
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {[...Array(selectedGoal.teams)].map((_, index) => (
                        <Chip
                          key={index}
                          avatar={<Avatar>TM</Avatar>}
                          label={`Team ${index + 1}`}
                          variant="outlined"
                          sx={{
                            borderRadius: '8px',
                            borderColor: 'divider',
                            '&:hover': {
                              background: theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'rgba(0, 0, 0, 0.05)',
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button
                onClick={handleCloseDialog}
                sx={{
                  borderRadius: '8px',
                  px: 3,
                  py: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                startIcon={<AssessmentIcon />}
                sx={{
                  borderRadius: '8px',
                  px: 3,
                  py: 1,
                  background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                  },
                }}
              >
                Generate Report
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </MotionBox>
  );
};

export default SDGMapping; 