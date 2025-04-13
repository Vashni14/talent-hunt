import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip,
  IconButton,
  Divider,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Assignment as AssignmentIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';

const Teams = () => {
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: 'Team Alpha',
      members: [
        { id: 1, name: 'John Doe', role: 'Team Lead', avatar: 'JD' },
        { id: 2, name: 'Jane Smith', role: 'Developer', avatar: 'JS' },
        { id: 3, name: 'Mike Johnson', role: 'Designer', avatar: 'MJ' },
      ],
      project: 'Smart Agriculture System',
      status: 'Active',
      lastMeeting: '2024-03-15',
      progress: 75,
    },
    {
      id: 2,
      name: 'Team Beta',
      members: [
        { id: 4, name: 'Sarah Wilson', role: 'Team Lead', avatar: 'SW' },
        { id: 5, name: 'David Brown', role: 'Developer', avatar: 'DB' },
        { id: 6, name: 'Emily Davis', role: 'Researcher', avatar: 'ED' },
      ],
      project: 'Healthcare Monitoring App',
      status: 'Active',
      lastMeeting: '2024-03-14',
      progress: 60,
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({ name: '', project: '', status: 'Active' });

  const handleEditTeam = (team) => {
    setSelectedTeam(team);
    setFormData({ name: team.name, project: team.project, status: team.status });
    setOpenDialog(true);
  };

  const handleAddTeam = () => {
    setSelectedTeam(null);
    setFormData({ name: '', project: '', status: 'Active' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTeam(null);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveTeam = () => {
    if (!formData.name || !formData.project) return;

    if (selectedTeam) {
      // Edit mode
      setTeams((prev) =>
        prev.map((team) =>
          team.id === selectedTeam.id ? { ...team, ...formData } : team
        )
      );
    } else {
      // Add mode
      const newTeam = {
        id: Date.now(),
        name: formData.name,
        project: formData.project,
        status: formData.status,
        members: [],
        lastMeeting: new Date().toISOString().slice(0, 10),
        progress: 0,
      };
      setTeams((prev) => [...prev, newTeam]);
    }
    handleCloseDialog();
  };

  const handleDeleteTeam = (id) => {
    setTeams((prev) => prev.filter((team) => team.id !== id));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Assigned Teams
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and monitor your assigned teams
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddTeam}
          color="primary"
          sx={{ borderRadius: '8px', px: 3, py: 1 }}
        >
          Add New Team
        </Button>
      </Box>

      <Grid container spacing={3}>
        {teams.map((team) => (
          <Grid item xs={12} md={6} key={team.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {team.name}
                    </Typography>
                    <Chip
                      label={team.status}
                      color={team.status === 'Active' ? 'success' : 'default'}
                      size="small"
                      sx={{ borderRadius: '6px' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit Team">
                      <IconButton onClick={() => handleEditTeam(team)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Team">
                      <IconButton onClick={() => handleDeleteTeam(team.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Project: {team.project}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <AccessTimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Last Meeting: {team.lastMeeting}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Team Members
                  </Typography>
                  <AvatarGroup max={4} sx={{ mb: 2 }}>
                    {team.members.map((member) => (
                      <Tooltip key={member.id} title={`${member.name} (${member.role})`}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: 'primary.main',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              transition: 'transform 0.2s',
                            },
                          }}
                        >
                          {member.avatar}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </AvatarGroup>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Progress: {team.progress}%
                  </Typography>
                  <Box sx={{ width: '60%', bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Box
                      sx={{
                        width: `${team.progress}%`,
                        height: 8,
                        bgcolor: 'primary.main',
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedTeam ? 'Edit Team' : 'Add New Team'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Team Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Project"
              name="project"
              value={formData.project}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              margin="normal"
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveTeam} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Teams;
