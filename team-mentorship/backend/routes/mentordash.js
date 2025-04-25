const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Mentor = require('../models/Mentor');
const MentorApplication = require('../models/MentorApplication');
const StudentProfile = require('../models/StudentProfile');

// Get mentor dashboard stats
router.get('/stats/:mentorId', async (req, res) => {
  try {
    const { mentorId } = req.params;

    // Find mentor document using Firebase UID
    const mentor = await Mentor.findOne({ userId: mentorId });
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Get active teams where mentor is assigned
    const teams = await Team.find({ 
      mentors: mentor._id,
      status: "active"
    }).populate('createdBy', 'name contact');
    console.log('Active mentor teams:', teams);

    // Get team IDs
    const teamIds = teams.map(team => team._id);

    // Get pending mentor applications
    const applications = await MentorApplication.find({ 
      status: 'pending'
    });
    console.log('Pending applications:', applications);

    // Get all unique student IDs from active teams
    const studentIds = [];
    for (const team of teams) {
      if (team.members && team.members.length > 0) {
        team.members.forEach(member => {
          let userId = member.user._id || member.userId; 
          if (userId && !studentIds.includes(userId.toString())) {
            studentIds.push(userId.toString());
          }
        });
      }
    }
    console.log('Student IDs:', studentIds);
    
    // Count active students (using userId field instead of _id)
    const activeStudentsCount = await StudentProfile.countDocuments({
      _id: { $in: studentIds },
    });
    console.log('Active students count:', activeStudentsCount);
    
    // Get upcoming team deadlines
    const upcomingDeadlines = await Team.aggregate([
      { $match: { 
        _id: { $in: teamIds },
        status: "active",
        deadline: { $exists: true, $gte: new Date() }
      }},
      { $project: {
          teamName: '$name',
          deadline: 1,
          daysLeft: {
            $ceil: {
              $divide: [
                { $subtract: ['$deadline', new Date()] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      { $sort: { deadline: 1 } },
      { $limit: 3 }
    ]);
    console.log('Upcoming deadlines:', upcomingDeadlines);

    // Update active teams data preparation
    const activeTeamsData = await Promise.all(teams.map(async (team) => {
      let leaderInfo = {};
      console.log('leader', team.createdBy);

      if (team.createdBy) {
        const leader = await StudentProfile.findOne({ uid: team.createdBy }).select('name contact');
        console.log('Leader:', leader);
        leaderInfo = {
          name: leader?.name || 'Unknown',
          email: leader?.contact || ''
        };
      }

      // Calculate progress based on tasks
      const progress = team.tasks && team.tasks.total > 0 
        ? Math.round((team.tasks.completed / team.tasks.total) * 100)
        : 0;

      return {
        name: team.name,
        project: team.project || 'No project specified',
        progress: progress,
        members: team.members?.length || 0,
        tasks: team.tasks || { total: 0, completed: 0 },
        leader: leaderInfo
      };
    }));

    // Update recent updates to show specific activities
    const recentUpdates = await Team.aggregate([
      { $match: { 
        _id: { $in: teamIds },
        status: "active" 
      }},
      { $project: {
          name: 1,
          updatedAt: 1,
          lastActivityType: {
            $cond: [
              { $gt: ['$updatedAt', '$lastMeeting'] },
              {
                $cond: [
                  { $gt: ['$members.updatedAt', '$tasks.updatedAt'] },
                  'new_member',
                  {
                    $cond: [
                      { $gt: ['$mentors.updatedAt', '$tasks.updatedAt'] },
                      'new_mentor',
                      'new_task'
                    ]
                  }
                ]
              },
              'meeting'
            ]
          },
          lastActivity: { $max: ['$updatedAt', '$lastMeeting'] },
          lastActivityDetails: {
            $cond: [
              { $gt: ['$updatedAt', '$lastMeeting'] },
              {
                $cond: [
                  { $gt: ['$members.updatedAt', '$tasks.updatedAt'] },
                  { type: 'member', count: { $size: '$members' } },
                  {
                    $cond: [
                      { $gt: ['$mentors.updatedAt', '$tasks.updatedAt'] },
                      { type: 'mentor', count: { $size: '$mentors' } },
                      { type: 'task', completed: '$tasks.completed', total: '$tasks.total' }
                    ]
                  }
                ]
              },
              { type: 'meeting', date: '$lastMeeting' }
            ]
          }
        }
      },
      { $sort: { lastActivity: -1 } },
      { $limit: 3 }
    ]);

    // Update stats to show pending tasks instead of suggestions
    res.json({
      stats: {
        mentoredTeams: teams.length,
        activeStudents: activeStudentsCount,
        pendingApplications: applications.length,
        pendingTasks: teams.reduce((sum, team) => sum + (team.tasks?.total - team.tasks?.completed || 0), 0)
      },
      upcomingDeadlines,
      recentUpdates,
      activeTeams: activeTeamsData
    });

  } catch (error) {
    console.error('Error fetching mentor dashboard data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;