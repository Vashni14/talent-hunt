export const potentialTeammates = [
    {
      _id: "1",
      name: "Alex Johnson",
      department: "Computer Science",
      skills: ["AI", "Machine Learning", "Python"],
      bio: "Passionate about AI and solving real-world problems with technology.",
      profilePicture: "",
      compatibility: 92,
      availability: "Available"
    },
    {
      _id: "2",
      name: "Sam Wilson",
      department: "Electrical Engineering",
      skills: ["Embedded Systems", "IoT", "Robotics"],
      bio: "Hardware enthusiast with experience in robotics competitions.",
      profilePicture: "",
      compatibility: 85,
      availability: "Available"
    }
  ];
  
  export const openTeams = [
    {
      _id: "team1",
      name: "AI Innovators",
      competition: "AI Competitions",
      description: "We're building an AI solution for healthcare diagnostics.",
      needed: ["ML Engineer", "Data Scientist", "UI Designer"],
      members: [
        {
          uid: "leader1",
          name: "Taylor Smith",
          role: "Team Leader",
          skills: ["Project Management", "AI"],
          profilePicture: "",
        },
      ],
      lookingFor: 3,
      skills: ["Machine Learning", "Python", "Healthcare"],
      leader: {
        uid: "leader1",
        name: "Taylor Smith",
        profilePicture: "",
      }
    }
  ];
  
  export const myTeams = [
    {
      _id: "myteam1",
      name: "Web Wizards",
      competition: "Hackathons",
      description: "Building innovative web applications for social good.",
      members: [
        {
          uid: "user1",
          name: "You",
          role: "Team Leader",
          profilePicture: "",
        },
        {
          uid: "member1",
          name: "Riley Johnson",
          role: "Frontend Developer",
          profilePicture: "",
        },
      ],
      leader: {
        uid: "user1",
        name: "You",
        profilePicture: "",
      }
    }
  ];