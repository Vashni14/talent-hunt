import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
} from '@mui/material';

const SDGMapping = () => {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedSDGs, setSelectedSDGs] = useState([]);
  const [problemStatement, setProblemStatement] = useState('');

  const teams = [
    { id: 1, name: 'Team Alpha' },
    { id: 2, name: 'Team Beta' },
    { id: 3, name: 'Team Gamma' },
  ];

  const sdgList = [
    { id: 1, name: 'No Poverty' },
    { id: 2, name: 'Zero Hunger' },
    { id: 3, name: 'Good Health and Well-being' },
    { id: 4, name: 'Quality Education' },
    { id: 5, name: 'Gender Equality' },
    { id: 6, name: 'Clean Water and Sanitation' },
    { id: 7, name: 'Affordable and Clean Energy' },
    { id: 8, name: 'Decent Work and Economic Growth' },
    { id: 9, name: 'Industry, Innovation and Infrastructure' },
    { id: 10, name: 'Reduced Inequalities' },
    { id: 11, name: 'Sustainable Cities and Communities' },
    { id: 12, name: 'Responsible Consumption and Production' },
    { id: 13, name: 'Climate Action' },
    { id: 14, name: 'Life Below Water' },
    { id: 15, name: 'Life on Land' },
    { id: 16, name: 'Peace, Justice and Strong Institutions' },
    { id: 17, name: 'Partnerships for the Goals' },
  ];

  const handleSDGSelect = (event) => {
    const value = event.target.value;
    setSelectedSDGs(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSubmit = () => {
    // Here you would typically send the data to your backend
    console.log({
      team: selectedTeam,
      sdgs: selectedSDGs,
      problemStatement,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        SDG Mapping
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Team</InputLabel>
                <Select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  label="Select Team"
                >
                  {teams.map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Problem Statement"
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select SDGs</InputLabel>
                <Select
                  multiple
                  value={selectedSDGs}
                  onChange={handleSDGSelect}
                  label="Select SDGs"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={sdgList.find((sdg) => sdg.id === value)?.name}
                        />
                      ))}
                    </Box>
                  )}
                >
                  {sdgList.map((sdg) => (
                    <MenuItem key={sdg.id} value={sdg.id}>
                      {sdg.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={!selectedTeam || selectedSDGs.length === 0 || !problemStatement}
              >
                Map SDGs
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Display existing mappings */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Existing SDG Mappings
          </Typography>
          {/* Here you would display the existing mappings from your backend */}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SDGMapping; 