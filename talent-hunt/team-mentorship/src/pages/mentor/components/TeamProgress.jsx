import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const TeamProgress = () => {
  const [teams] = useState([
    {
      id: 1,
      name: 'Team Alpha',
      progress: 65,
      milestones: [
        { id: 1, title: 'Project Proposal', status: 'completed' },
        { id: 2, title: 'Initial Design', status: 'completed' },
        { id: 3, title: 'Prototype Development', status: 'in-progress' },
        { id: 4, title: 'Testing', status: 'pending' },
        { id: 5, title: 'Final Submission', status: 'pending' },
      ],
    },
    {
      id: 2,
      name: 'Team Beta',
      progress: 40,
      milestones: [
        { id: 1, title: 'Project Proposal', status: 'completed' },
        { id: 2, title: 'Initial Design', status: 'in-progress' },
        { id: 3, title: 'Prototype Development', status: 'pending' },
        { id: 4, title: 'Testing', status: 'pending' },
        { id: 5, title: 'Final Submission', status: 'pending' },
      ],
    },
  ]);

  const [newMilestone, setNewMilestone] = useState({
    title: '',
    teamId: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMilestone((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddMilestone = () => {
    if (newMilestone.title && newMilestone.teamId) {
      // Here you would typically update the backend
      console.log('Adding milestone:', newMilestone);
      setNewMilestone({
        title: '',
        teamId: '',
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'pending':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Team Progress Tracking
      </Typography>

      {teams.map((team) => (
        <Card key={team.id} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {team.name}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Overall Progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={team.progress}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" color="text.secondary" align="right">
                {team.progress}%
              </Typography>
            </Box>

            <List>
              {team.milestones.map((milestone) => (
                <ListItem
                  key={milestone.id}
                  sx={{
                    bgcolor: 'background.paper',
                    mb: 1,
                    borderRadius: 1,
                  }}
                >
                  <ListItemText primary={milestone.title} />
                  <ListItemSecondaryAction>
                    <Chip
                      label={milestone.status}
                      color={getStatusColor(milestone.status)}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <IconButton edge="end" aria-label="edit">
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="New Milestone"
                    name="title"
                    value={newMilestone.teamId === team.id ? newMilestone.title : ''}
                    onChange={handleInputChange}
                    onFocus={() => setNewMilestone((prev) => ({ ...prev, teamId: team.id }))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddMilestone}
                    disabled={!newMilestone.title || newMilestone.teamId !== team.id}
                  >
                    Add Milestone
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default TeamProgress; 