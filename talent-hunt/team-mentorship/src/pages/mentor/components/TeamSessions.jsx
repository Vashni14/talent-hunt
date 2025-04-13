import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const TeamSessions = () => {
  const [sessions, setSessions] = useState([
    {
      id: 1,
      teamName: 'Team Alpha',
      date: '2024-03-20',
      time: '14:00',
      agenda: 'Project Progress Review',
      status: 'Upcoming',
    },
    {
      id: 2,
      teamName: 'Team Beta',
      date: '2024-03-21',
      time: '15:30',
      agenda: 'Technical Discussion',
      status: 'Upcoming',
    },
  ]);

  const [newSession, setNewSession] = useState({
    teamName: '',
    date: '',
    time: '',
    agenda: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSession((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSession = () => {
    if (newSession.teamName && newSession.date && newSession.time && newSession.agenda) {
      setSessions((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...newSession,
          status: 'Upcoming',
        },
      ]);
      setNewSession({
        teamName: '',
        date: '',
        time: '',
        agenda: '',
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Team Sessions
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Schedule New Session
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Team Name"
                name="teamName"
                value={newSession.teamName}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={newSession.date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Time"
                name="time"
                type="time"
                value={newSession.time}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Agenda"
                name="agenda"
                value={newSession.agenda}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddSession}
              >
                Add Session
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <List>
        {sessions.map((session) => (
          <ListItem
            key={session.id}
            sx={{
              bgcolor: 'background.paper',
              mb: 1,
              borderRadius: 1,
            }}
          >
            <ListItemText
              primary={`${session.teamName} - ${session.agenda}`}
              secondary={`${session.date} at ${session.time} - ${session.status}`}
            />
            <ListItemSecondaryAction>
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
    </Box>
  );
};

export default TeamSessions; 