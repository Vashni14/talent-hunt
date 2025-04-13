import express from 'express';
import {
  getAllTeams,
  createTeam,
  getTeamById,
} from '../controllers/teamController.js';

const router = express.Router();

router.route('/')
  .get(getAllTeams)
  .post(createTeam);

router.route('/:id')
  .get(getTeamById);

export default router;
