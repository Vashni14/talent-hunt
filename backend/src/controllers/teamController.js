import Team from '../models/teamModel.js';

// GET all teams
export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST a new team
export const createTeam = async (req, res) => {
    try {
      console.log('Incoming team data:', req.body); // 👈 Debug log
      const team = new Team(req.body);
      const savedTeam = await team.save();
      res.status(201).json(savedTeam);
    } catch (error) {
      console.error('Error saving team:', error); // 👈 Error log
      res.status(400).json({ message: error.message });
    }
  };
  

// GET a team by ID
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
