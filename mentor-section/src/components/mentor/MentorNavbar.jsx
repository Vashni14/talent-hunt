import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
  Public as PublicIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Chat as ChatIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MentorNavbar = ({ mode, setMode }) => {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleTheme = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { path: '/mentor/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/mentor/teams', label: 'Teams', icon: <GroupIcon /> },
    { path: '/mentor/sessions', label: 'Sessions', icon: <EventIcon /> },
    { path: '/mentor/progress', label: 'Progress', icon: <TrendingUpIcon /> },
    { path: '/mentor/sdg', label: 'SDG Mapping', icon: <PublicIcon /> },
    { path: '/mentor/chat', label: 'Chat', icon: <ChatIcon /> },
    { path: '/mentor/profile', label: 'Profile', icon: <PersonIcon /> },
  ];

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        px: { xs: 2, md: 4 },
        py: 1,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Typography
              variant="h6"
              component={RouterLink}
              to="/mentor/dashboard"
              sx={{
                textDecoration: 'none',
                color: 'text.primary',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 32,
                  height: 32,
                }}
              >
                M
              </Avatar>
              Mentor Portal
            </Typography>
          </motion.div>
        </Box>

        <Box sx={{ 
          display: { xs: 'none', md: 'flex' },
          gap: 1,
        }}>
          {navItems.map((item) => (
            <motion.div
              key={item.path}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                component={RouterLink}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'rgba(37, 99, 235, 0.04)',
                  },
                }}
              >
                {item.label}
              </Button>
            </motion.div>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <IconButton
                onClick={toggleTheme}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.04)',
                  },
                }}
              >
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </motion.div>
          </Tooltip>

          <Tooltip title="Notifications">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <IconButton
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.04)',
                  },
                }}
              >
                <NotificationsIcon />
              </IconButton>
            </motion.div>
          </Tooltip>

          <Tooltip title="Account Settings">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <IconButton
                onClick={handleMenuOpen}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.04)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                  }}
                >
                  A
                </Avatar>
              </IconButton>
            </motion.div>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                borderRadius: 2,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
              },
            }}
          >
            <MenuItem onClick={handleMenuClose}>
              <SettingsIcon sx={{ mr: 2 }} />
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
              <LogoutIcon sx={{ mr: 2 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default MentorNavbar; 