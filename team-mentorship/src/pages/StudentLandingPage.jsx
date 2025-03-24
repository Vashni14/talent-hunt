import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import axios from "axios";
import { FaBell, FaUserCircle, FaRegStickyNote, FaSignOutAlt, FaUsers, FaTrophy, FaChalkboardTeacher, FaSearch, FaCalendar, FaPlus, FaEnvelope } from "react-icons/fa";
import Slider from "react-slick"; // For the carousel
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

function StudentLandingPage() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = auth.currentUser;
  const [goals, setGoals] = useState([]); // 🔹 State for storing goals

  // 🔹 Fetch goals from the backend
  const fetchGoals = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/goals/${user.uid}`);
      console.log("Fetched Goals:", data); // 🔹 Check if updated goals are coming
      setGoals(data);
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStudentProfile();
      fetchGoals();
    } else {
      setLoading(false);
    }
  }, [user]);

  // 🔹 Fetch student profile from the backend
  const fetchStudentProfile = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/student/profile/${user.uid}`);
      setStudent(data);
      setError(null);
      console.log("Profile Data:", data); // Debugging
    } catch (error) {
      console.error("Error fetching profile:", error);
      // If the profile doesn't exist, set a default profile
      setStudent({
        name: "New User",
        rolePreference: "Aspiring Developer",
        profilePicture: "/default-profile.png",
      });
      setError(null); // Clear the error since we're using a default profile
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // 🔹 Error state (if any)
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-900 text-white">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button
          onClick={fetchStudentProfile}
          className="bg-teal-500 px-6 py-2 rounded-lg font-bold hover:bg-teal-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // 🔹 Mock data for competition highlights
  const competitionHighlights = [
    {
      id: 1,
      title: "Hackathon 2025",
      description: "Join the biggest hackathon of the year!",
      image: "https://via.placeholder.com/600x300?text=Hackathon+2025",
    },
    {
      id: 2,
      title: "AI Challenge",
      description: "Showcase your AI skills and win exciting prizes!",
      image: "https://via.placeholder.com/600x300?text=AI+Challenge",
    },
    {
      id: 3,
      title: "Robotics Competition",
      description: "Build and compete with your robotics project!",
      image: "https://via.placeholder.com/600x300?text=Robotics+Competition",
    },
  ];

  // 🔹 Mock data for team collaboration
  const teamMembers = [
    { id: 1, name: "John Doe", role: "Backend Developer", avatar: "https://via.placeholder.com/40" },
    { id: 2, name: "Jane Smith", role: "UI/UX Designer", avatar: "https://via.placeholder.com/40" },
  ];

  // 🔹 Mock data for mentor feedback
  const mentorFeedback = [
    {
      id: 1,
      message: "Great progress on the prototype! Keep it up.",
      mentor: "Dr. Smith",
    },
    {
      id: 2,
      message: "Your UI design is impressive. Let's refine the backend.",
      mentor: "Prof. Johnson",
    },
  ];

  // 🔹 Mock data for recent winning teams
  const recentWinningTeams = [
    { id: 1, name: "AI Warriors", competition: "AI Challenge 2024" },
    { id: 2, name: "Code Masters", competition: "Hackathon 2024" },
    { id: 3, name: "Design Gurus", competition: "UI/UX Design Sprint 2024" },
  ];

  // 🔹 Settings for the carousel
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  // 🔹 Default profile data for new users
  const defaultProfile = {
    name: "New User",
    rolePreference: "Aspiring Developer",
    profilePicture: "/default-profile.png",
  };

  // 🔹 Use the student data or default profile if student data is not available
  const profileData = student || defaultProfile;

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      {/* 🔹 NAVBAR */}
      <nav className="bg-gray-800 p-4 flex justify-between items-center shadow-md fixed w-full top-0 left-0 z-50">
        {/* 🔹 Left: Logo */}
        <h1 className="text-3xl font-bold text-teal-400 cursor-pointer" onClick={() => navigate("/")}>
          TeamSphere
        </h1>

        {/* 🔹 Center: Welcome Message (Bigger & Centered) */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-teal-400">
            Welcome, {profileData.name}!
          </h2>
        </div>

        {/* 🔹 Right: Search + Icons + Logout */}
        <div className="flex space-x-6 items-center">
          {/* 🔹 Search Bar */}
          <div className="relative w-75">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search competitions, teammates..."
              className="bg-gray-700 text-white pl-12 pr-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* 🔹 Notification Bell with Badge */}
          <div className="relative">
            <FaBell className="text-3xl cursor-pointer hover:text-teal-400" />
            <span className="absolute top-0 right-0 bg-red-500 text-xs rounded-full px-1.5 py-0.5">3</span>
          </div>

          {/* 🔹 Logout Button */}
          <button
            onClick={() => {
              auth.signOut().then(() => {
                navigate("/");
              }).catch(error => {
                console.error("Logout Error:", error);
              });
            }}
            className="flex items-center text-red-400 hover:text-red-500"
          >
            <FaSignOutAlt className="mr-1 text-2xl" /> Logout
          </button>
        </div>
      </nav>

      <div className="flex flex-row w-full pt-16">
        {/* 🔹 LEFT SIDEBAR */}
        <aside className="w-1/6 bg-gray-800 min-h-screen p-6 fixed left-0">
          <div className="text-center mb-6">
          <img
  src={student?.profilePicture ? `http://localhost:5000${student.profilePicture}` : "/default-profile.png"}
  alt="Profile"
  className="w-20 h-20 rounded-full mx-auto border border-teal-400"
/>
            <h2 className="text-lg font-bold mt-2">{profileData.name}</h2>
            <p className="text-gray-400">{profileData.rolePreference}</p>
            <button
              className="mt-3 bg-teal-500 px-4 py-2 rounded font-bold hover:bg-teal-600 w-full"
              onClick={() => navigate("/student-dashboard")}
            >
              Edit Profile
            </button>
          </div>
          {/* Sidebar Links */}
          <ul className="space-y-4">
            <li className="flex items-center gap-3 hover:bg-gray-700 p-3 rounded cursor-pointer" onClick={() => navigate("/competitions")}>
              <FaTrophy /> Competitions
            </li>
            <li className="flex items-center gap-3 hover:bg-gray-700 p-3 rounded cursor-pointer" onClick={() => navigate("/find-teammates")}>
              <FaUsers /> Find Teammates
            </li>
            <li className="flex items-center gap-3 hover:bg-gray-700 p-3 rounded cursor-pointer" onClick={() => navigate("/mentorship")}>
              <FaChalkboardTeacher /> Mentorship
            </li>
            <li className="flex items-center gap-3 hover:bg-gray-700 p-3 rounded cursor-pointer relative" onClick={() => navigate("/mentorship")}>
              <FaEnvelope /> Messages
              <span className="bg-red-500 text-xs rounded-full px-1.5 py-0.5 ml-9">3</span>
            </li>
            <li className="flex items-center gap-3 hover:bg-gray-700 p-3 rounded cursor-pointer" onClick={() => navigate("/mentorship")}>
              <FaRegStickyNote /> Feedback
              <span className="bg-red-500 text-xs rounded-full px-1.5 py-0.5 ml-9">3</span>
            </li>
          </ul>
        </aside>

        {/* 🔹 MAIN CONTENT AREA */}
        <div className="flex-1 ml-[17%] mr-[16%]">
          {/* 🔹 CENTRAL FEED */}
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {/* Calendar Widget */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-bold text-teal-400 flex items-center gap-2 whitespace-nowrap">
                <FaCalendar /> Upcoming Events
              </h2>
              <ul className="mt-3 space-y-2">
                <li className="bg-gray-700 p-3 rounded hover:bg-gray-600 cursor-pointer">
                  <p className="text-gray-300">Mentorship Session: <strong>April 5</strong></p>
                </li>
                <li className="bg-gray-700 p-3 rounded hover:bg-gray-600 cursor-pointer">
                  <p className="text-gray-300">Hackathon Deadline: <strong>April 10</strong></p>
                </li>
                <li className="bg-gray-700 p-3 rounded hover:bg-gray-600 cursor-pointer">
                  <p className="text-gray-300">AI Challenge: <strong>April 15</strong></p>
                </li>
              </ul>
              <button
                className="mt-3 bg-teal-500 px-4 py-2 rounded font-bold hover:bg-teal-600 w-full"
                onClick={() => navigate("/team-matching")}
              >
                View More
              </button>
            </div>

            {/* 🔹 Goals Progress Section */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-bold text-teal-400 flex items-center gap-2 whitespace-nowrap">🎯 Your Goals</h2>
              <div className="space-y-4 mt-3">
                {goals.slice(0, 2).map((goal, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-300 font-medium">{goal.title}</p>
                    <div className="w-full bg-gray-600 rounded-full h-2 mt-3">
                      <div className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(goal.completed / goal.total) * 100}%` }}></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">{goal.completed}/{goal.total} completed</p>
                  </div>
                ))}
              </div>
              <button
                className="mt-3 bg-teal-500 px-4 py-2 rounded font-bold hover:bg-teal-600 w-full"
                onClick={() => navigate("/add-goals")}
              >
                Add And View Goals
              </button>
            </div>

            {/* 🔹 Skills in Demand Section */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-bold text-teal-400 flex items-center gap-2 whitespace-nowrap">
                🔥 Skills in Demand
              </h2>
              <ul className="mt-3 space-y-3">
                <li className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-all duration-200">
                  React.js - Needed in <strong>5 teams</strong>
                </li>
                <li className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-all duration-200">
                  AI/ML - Required in <strong>3 competitions</strong>
                </li>
                <li className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-all duration-200">
                  UI/UX Design - Wanted in <strong>4 projects</strong>
                </li>
              </ul>
              <button
                className="mt-3 bg-teal-500 px-4 py-2 rounded font-bold hover:bg-teal-600 w-full"
                onClick={() => navigate("/team-matching")}
              >
                View More
              </button>
            </div>

            {/* 🔹 Competition Highlights Carousel */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md col-span-1 md:col-span-2 lg:col-span-3">
              <h2 className="text-xl font-bold text-teal-400 mb-4">🌟 Competition Highlights</h2>
              <Slider {...carouselSettings}>
                {competitionHighlights.map((comp) => (
                  <div key={comp.id} className="relative">
                    <img src={comp.image} alt={comp.title} className="w-full h-48 object-cover rounded-lg" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4 rounded-b-lg">
                      <h3 className="text-lg font-bold">{comp.title}</h3>
                      <p className="text-gray-300">{comp.description}</p>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>

            {/* 🔹 Team Updates */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-teal-400 whitespace-nowrap">🔥 Latest Team Updates</h2>
              <div className="bg-gray-700 p-3 rounded mt-3 hover:bg-gray-600 cursor-pointer">
                🚀 <strong>Hackathon 2025</strong> – New team looking for a **Backend Developer**!
              </div>
              <div className="bg-gray-700 p-3 rounded mt-3 hover:bg-gray-600 cursor-pointer">
                👥 <strong>AI Challenge</strong> – Need **UI/UX Designer** for the upcoming competition.
              </div>
              <button className="mt-3 bg-blue-500 px-4 py-2 rounded font-bold hover:bg-blue-600 w-full">
                View More Updates
              </button>
            </div>

            {/* 🔹 Upcoming Competitions */}
            <div className="bg-gray-800 p-5 rounded-lg shadow-md w-full md:w-[30rem]">
              <h2 className="text-lg font-bold text-teal-400 flex items-center gap-2 whitespace-nowrap">
                🏆 Upcoming Competitions
              </h2>
              <ul className="mt-3 space-y-2">
                <li className="bg-gray-700 p-3 rounded hover:bg-gray-600">Hackathon 2025 - March 30</li>
                <li className="bg-gray-700 p-3 rounded hover:bg-gray-600">AI Challenge - April 10</li>
                <li className="bg-gray-700 p-3 rounded hover:bg-gray-600">Web Dev Sprint - April 20</li>
              </ul>
              <button className="mt-3 bg-orange-500 px-4 py-2 rounded font-bold hover:bg-orange-600 w-full">
                Explore Competitions
              </button>
            </div>

            {/* 🔹 Mentor Feedback Section */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-teal-400">📝 Mentor Feedback</h2>
              <ul className="mt-3 space-y-2">
                {mentorFeedback.map((feedback) => (
                  <li key={feedback.id} className="bg-gray-700 p-3 rounded hover:bg-gray-600 cursor-pointer">
                    <p className="text-gray-300">"{feedback.message}"</p>
                    <p className="text-sm text-gray-400 mt-1">- {feedback.mentor}</p>
                  </li>
                ))}
              </ul>
              <button className="mt-3 bg-purple-500 px-4 py-2 rounded font-bold hover:bg-purple-600 w-full">
                View More Feedback
              </button>
            </div>

            {/* 🔹 SDG Alignment */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-teal-400">🌍 SDG Alignment</h2>
              <div className="mt-3 bg-gray-700 p-3 rounded">
                <p className="text-gray-300">Your project aligns with:</p>
                <ul className="list-disc list-inside mt-1">
                  <li className="text-gray-300">SDG 9: Industry, Innovation, and Infrastructure</li>
                  <li className="text-gray-300">SDG 4: Quality Education</li>
                </ul>
              </div>
              <button className="mt-3 bg-green-500 px-4 py-2 rounded font-bold hover:bg-green-600 w-full">
                View More SDGs
              </button>
            </div>

            {/* 🔹 Team Collaboration Space */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-teal-400">👥 Team Collaboration</h2>
              <div className="mt-3 space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="bg-gray-700 p-3 rounded hover:bg-gray-600 cursor-pointer flex items-center gap-3">
                    <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="text-gray-300 font-bold">{member.name}</p>
                      <p className="text-sm text-gray-400">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="mt-3 bg-teal-500 px-4 py-2 rounded font-bold hover:bg-teal-600 w-full"
                onClick={() => navigate("/team-matching")}
              >
                Add More Teammates
              </button>
            </div>

            {/* 🔹 Job & Internship Board */}
            <div className="bg-gray-800 p-5 rounded-lg shadow-md w-full md:w-96">
              <h2 className="text-xl font-bold text-teal-400 flex items-center gap-2">
                💼 Job & Internships
              </h2>
              <ul className="mt-3 space-y-2">
                <li className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-all duration-200">
                  <p className="text-md text-white font-semibold">Software Engineering Intern</p>
                  <p className="text-sm text-gray-300">Google | Deadline: <strong>April 10</strong></p>
                </li>
                <li className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-all duration-200">
                  <p className="text-md text-white font-semibold">AI Research Intern</p>
                  <p className="text-sm text-gray-300">Microsoft | Deadline: <strong>April 15</strong></p>
                </li>
              </ul>
              <button className="mt-3 bg-green-500 px-3 py-2 text-md rounded font-bold hover:bg-green-600 w-full">
                Browse More Internships 🔎
              </button>
            </div>
          </div>
        </div>

        {/* 🔹 RIGHT SIDEBAR */}
        <aside className="w-54 bg-gray-800 min-h-screen p-6 fixed right-0">
          <h2 className="text-xl font-bold text-teal-400 whitespace-nowrap text-center">
            <span className="-ml-2 inline-block">🏆 Recent Winning</span> <br />
            <span className="block">Teams</span>
          </h2>
          <ul className="mt-3 space-y-2">
            {recentWinningTeams.map((team) => (
              <li key={team.id} className="bg-gray-700 p-3 rounded hover:bg-gray-600 cursor-pointer">
                <strong>{team.name}</strong> - {team.competition}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

export default StudentLandingPage;