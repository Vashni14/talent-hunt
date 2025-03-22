import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import axios from "axios";
import { FaBell, FaUserCircle, FaSignOutAlt, FaUsers, FaTrophy, FaChalkboardTeacher } from "react-icons/fa";

function StudentLandingPage() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      fetchStudentProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchStudentProfile = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/student/profile/${user.uid}`);
      setStudent(data);
      setError(null);
      console.log("Profile Data:", data); // Debugging
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

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

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      {/* 🔹 NAVBAR */}
      <nav className="bg-gray-800 p-4 flex justify-between items-center shadow-md fixed w-full top-0 left-0 z-50">
        <h1 className="text-2xl font-bold text-teal-400 cursor-pointer" onClick={() => navigate("/")}>
          Team Connect
        </h1>
        <div className="flex space-x-6 items-center">
          <FaBell className="text-xl cursor-pointer hover:text-teal-400" />
          <FaUserCircle className="text-2xl cursor-pointer hover:text-teal-400" />
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
            <FaSignOutAlt className="mr-1" /> Logout
          </button>
        </div>
      </nav>

      <div className="flex flex-row w-full pt-16">
        {/* 🔹 LEFT SIDEBAR */}
        <aside className="w-1/5 bg-gray-800 min-h-screen p-6 fixed left-0">
          <div className="text-center mb-6">
          <img
  src={student?.profilePicture ? `http://localhost:5000${student.profilePicture}` : "/default-profile.png"}
  alt="Profile"
  className="w-20 h-20 rounded-full mx-auto border border-teal-400"
/>
            <h2 className="text-lg font-bold mt-2">{student?.name || "Your Name"}</h2>
            <p className="text-gray-400">{student?.rolePreference || "Aspiring Developer"}</p>
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
            <li className="flex items-center gap-3 hover:bg-gray-700 p-3 rounded cursor-pointer" onClick={() => navigate("/team-matching")}>
              <FaUsers /> Find Teammates
            </li>
            <li className="flex items-center gap-3 hover:bg-gray-700 p-3 rounded cursor-pointer" onClick={() => navigate("/mentorship")}>
              <FaChalkboardTeacher /> Mentorship
            </li>
          </ul>
        </aside>

        {/* 🔹 MAIN CONTENT AREA */}
        <div className="flex-1 ml-[22%] mr-[22%]">
          {/* 🔹 HERO SECTION */}
          <header className="relative w-full h-40 flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-bold text-teal-400">Welcome, {student?.name || "Student"}!</h1>
            <p className="text-gray-300 mt-1 text-md">Build your profile, join competitions, and find the perfect team.</p>
            <button
              className="mt-3 bg-teal-500 px-5 py-2 rounded-lg text-lg font-bold hover:bg-teal-600 shadow-md"
              onClick={() => navigate("/student-dashboard")}
            >
              Complete Your Profile
            </button>
          </header>

          {/* 🔹 CENTRAL FEED */}
          <div className="container mx-auto px-6 grid grid-cols-1 gap-6 mt-4 w-3/4">
            {/* Team Updates */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-teal-400">🔥 Latest Team Updates</h2>
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

            {/* Competitions List */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-teal-400">🏆 Upcoming Competitions</h2>
              <ul className="mt-3 space-y-2">
                <li className="bg-gray-700 p-3 rounded hover:bg-gray-600">Hackathon 2025 - March 30</li>
                <li className="bg-gray-700 p-3 rounded hover:bg-gray-600">AI Challenge - April 10</li>
                <li className="bg-gray-700 p-3 rounded hover:bg-gray-600">Web Dev Sprint - April 20</li>
              </ul>
              <button className="mt-3 bg-orange-500 px-4 py-2 rounded font-bold hover:bg-orange-600 w-full">
                Explore Competitions
              </button>
            </div>
          </div>
        </div>

        {/* 🔹 RIGHT SIDEBAR */}
        <aside className="w-64 bg-gray-800 min-h-screen p-6 fixed right-0">
          <h2 className="text-xl font-bold text-teal-400">🚀 Top Teams</h2>
          <ul className="mt-3 space-y-2">
            <li className="bg-gray-700 p-3 rounded hover:bg-gray-600">⚡ AI Warriors</li>
            <li className="bg-gray-700 p-3 rounded hover:bg-gray-600">💻 Code Masters</li>
            <li className="bg-gray-700 p-3 rounded hover:bg-gray-600">🎨 Design Gurus</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

export default StudentLandingPage;