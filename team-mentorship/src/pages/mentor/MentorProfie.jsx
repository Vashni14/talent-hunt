import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "/src/config/firebase";
import { signOut } from "firebase/auth";
import {
    FaChartBar,
  FaCamera,
  FaUser,
  FaHome,
  FaUsers,
  FaBell,
  FaSearch,
  FaCog,
  FaSignOutAlt,
  FaUserCheck,
  FaTasks,
  FaEdit,
  FaLinkedin,
  FaBriefcase,
  FaBook,
  FaGraduationCap,
  FaEnvelope
} from "react-icons/fa";
import axios from "axios";

const MentorProfile = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState({
    name: "",
    email: "",
    domain: "",
    profilePicture: "",
    bio: "",
    skills: [],
    experience: "",
    education: "",
    linkedin: "",
    currentPosition: ""
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    domain: "",
    skills: "",
    experience: "",
    education: "",
    linkedin: "",
    currentPosition: ""
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);

  // Mock data for display purposes only (not for editing)
  const MOCK_DISPLAY_DATA = {
    name: "New Mentor",
    domain: "Select Your Domain",
    bio: "Tell us about yourself and your mentoring approach",
    skills: ["Add your skills"],
    experience: "Describe your professional experience",
    education: "List your educational background",
    linkedin: "yourusername",
    currentPosition: "Your Current Position"
  };

  const logout = async () => {
    await signOut(auth);
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch mentor data
  useEffect(() => {
    const fetchMentorProfile = async (userId) => {
      try {
        const response = await axios.get(`http://localhost:5000/api/mentor/profile/${userId}`);
        const mentorData = response.data;
        
        if (mentorData) {
          setUser(mentorData);
          setFormData({
            name: mentorData.name || "",
            email: mentorData.email || "",
            bio: mentorData.bio || "",
            domain: mentorData.domain || "",
            skills: mentorData.skills?.join(", ") || "",
            experience: mentorData.experience || "",
            education: mentorData.education || "",
            linkedin: mentorData.linkedin || "",
            currentPosition: mentorData.currentPosition || "",
            profilePicture: mentorData.profilePicture || ""
          });
          
          if (mentorData.profilePicture) {
            setImagePreview(`http://localhost:5000${mentorData.profilePicture}`);
          }
        }
      } catch (error) {
        console.error("Error fetching mentor data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchMentorProfile(user.uid);
      } else {
        navigate('/login');
      }
    });
  
    return () => unsubscribe();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSaveProfile = async () => {
    try {
      const userId = auth.currentUser.uid;
      const formDataToSend = new FormData();
      
      // Append all text fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('domain', formData.domain);
      formDataToSend.append('skills', formData.skills);
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('education', formData.education);
      formDataToSend.append('linkedin', formData.linkedin);
      formDataToSend.append('currentPosition', formData.currentPosition);
      
      // Append the image file if it exists
      if (profileImage) {
        formDataToSend.append('profilePicture', profileImage);
      }
  
      const response = await axios.put(
        `http://localhost:5000/api/mentor/profile/${userId}`,
        formDataToSend,
      );
  
      // Update local state with the response data
      const updatedMentor = response.data;
      setUser(updatedMentor);
      setFormData({
        name: updatedMentor.name || "a",
        email: updatedMentor.email || "a",
        bio: updatedMentor.bio || "a",
        domain: updatedMentor.domain || "a",
        skills: updatedMentor.skills?.join(", ") || "a",
        experience: updatedMentor.experience || "a",
        education: updatedMentor.education || "a",
        linkedin: updatedMentor.linkedin || "a",
        currentPosition: updatedMentor.currentPosition || "a"
      });
  
      // Clear the image preview and file if successful
      if (profileImage) {
        setProfileImage(null);
        setImagePreview(`http://localhost:5000${updatedMentor.profilePicture}`);
      }
  
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Helper function to display data (uses actual data if exists, otherwise mock for display only)
  const displayData = (field) => {
    return user[field] || (MOCK_DISPLAY_DATA[field] && !editMode) ? 
      (user[field] || MOCK_DISPLAY_DATA[field]) : 
      "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar Navigation */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}
      >
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            <FaGraduationCap className="text-blue-400 text-xl" />
            MentorHub
          </h1>
        </div>

        <div className="p-3">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border-2 border-blue-500/50">
              <img 
                src={user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : "/default-profile.png"}
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-profile.png";
                }}
              />
            </div>
            <div>
              <p className="font-medium text-sm">{user?.name || "Loading..."
 || "New Mentor"}</p>
              <p className="text-xs text-gray-400">Mentor - {user.domain || "Select Domain"}</p>
            </div>
          </div>
        </div>

        <nav className="mt-1 px-2">
          <Link
            to="/mentor-dashboard"
            className="flex items-center px-3 py-2 text-sm rounded-lg mb-1 text-gray-300 hover:text-white hover:bg-gray-700/70"
          >
            <FaHome className="mr-2 text-base" />
            Dashboard
          </Link>
          <Link
            to="/mentor-profile"
            className="flex items-center px-3 py-2 text-sm rounded-lg mb-1 text-white bg-gradient-to-r from-blue-600/40 to-purple-600/40 border border-blue-500/20"
          >
            <FaUser className="mr-2 text-base" />
            Profile
          </Link>
          <Link
            to="/mentored-teams"
            className="flex items-center px-3 py-2 text-sm rounded-lg mb-1 text-gray-300 hover:text-white hover:bg-gray-700/70"
          >
            <FaUsers className="mr-2 text-base" />
            Mentored Teams
          </Link>
          <Link
            to="/my-students"
            className="flex items-center px-3 py-2 text-sm rounded-lg mb-1 text-gray-300 hover:text-white hover:bg-gray-700/70"
          >
            <FaUserCheck className="mr-2 text-base" />
            My Students
          </Link>
          <Link
            to="/mentor-tasks"
            className="flex items-center px-3 py-2 text-sm rounded-lg mb-1 text-gray-300 hover:text-white hover:bg-gray-700/70"
          >
            <FaTasks className="mr-2 text-base" />
            Tasks
          </Link>
           <Link
                      to="/mentor-analytics"
                      className="flex items-center px-3 py-2 text-sm rounded-lg mb-1 text-gray-300 hover:text-white hover:bg-gray-700/70"
                    >
                      <FaChartBar className="mr-2 text-base" />
                      Analytics
                    </Link>

          <div className="mt-8 pt-4 border-t border-gray-700">
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2 text-sm rounded-lg mb-1 text-gray-300 hover:text-white hover:bg-gray-700/70"
            >
              <FaSignOutAlt className="mr-2 text-base" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search teams, students..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>
        </header>

        {/* Profile Content */}
        <main className="flex-1 overflow-auto p-3 md:p-5 lg:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold">Professional Profile</h1>
            <div className="flex gap-3">
              {editMode ? (
                <>
                  <button 
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <FaEdit /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Header */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden border-4 border-blue-500/30 flex-shrink-0">
                  <img 
                    src={imagePreview || (user?.profilePicture ? `http://localhost:5000${user.profilePicture}` : "/default-profile.png")}
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-profile.png";
                    }}
                  />
                </div>
                {editMode && (
                  <>
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full text-white"
                    >
                      <FaCamera />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </>
                )}
              </div>
              
              <div className="flex-1">
                {editMode ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="text-2xl font-bold bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full"
                      placeholder="Your name"
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full"
                      placeholder="Email address"
                    />
                    <input
                      type="text"
                      name="currentPosition"
                      value={formData.currentPosition}
                      onChange={handleInputChange}
                      className="text-blue-400 bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full"
                      placeholder="Current position"
                    />
                    <input
                      type="text"
                      name="domain"
                      value={formData.domain}
                      onChange={handleInputChange}
                      className="text-gray-300 bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full"
                      placeholder="Primary domain/expertise"
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold">{displayData("name")}</h2>
                    <div className="flex items-center text-gray-400 mt-1">
                      <FaEnvelope className="mr-2" />
                      <span>{user.email}</span>
                    </div>
                    {displayData("currentPosition") && (
                      <p className="text-blue-400">{displayData("currentPosition")}</p>
                    )}
                    <p className="text-gray-300">{displayData("domain")}</p>
                  </div>
                )}
              </div>
              
              {(user.linkedin || (!editMode && MOCK_DISPLAY_DATA.linkedin)) && (
                <a 
                  href={`https://linkedin.com/in/${user.linkedin || MOCK_DISPLAY_DATA.linkedin}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg flex items-center justify-center transition-colors"
                >
                  <FaLinkedin className="text-xl" />
                </a>
              )}
            </div>
          </div>

          {/* Main Profile Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <FaUser className="text-blue-400" />
                  About
                </h2>
                {editMode ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 min-h-[120px]"
                    placeholder="Describe your professional background and mentoring approach..."
                  />
                ) : (
                  <p className="text-gray-300">
                    {displayData("bio") || "No bio information available."}
                  </p>
                )}
              </div>

              {/* Skills Section */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <FaBook className="text-blue-400" />
                  Skills & Expertise
                </h2>
                {editMode ? (
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    placeholder="Comma separated list of skills (e.g., React, Node.js, UI/UX)"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {user.skills?.length > 0 ? (
                      user.skills.map((skill, index) => (
                        <span key={index} className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">{displayData("skills")}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Experience Section */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <FaBriefcase className="text-blue-400" />
                  Professional Experience
                </h2>
                {editMode ? (
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 min-h-[150px]"
                    placeholder="Detail your professional experience relevant to mentoring..."
                  />
                ) : (
                  <div className="prose prose-invert max-w-none">
                    {displayData("experience") ? (
                      <p className="whitespace-pre-line">{displayData("experience")}</p>
                    ) : (
                      <p className="text-gray-500">No experience information available.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Education Section */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <FaGraduationCap className="text-blue-400" />
                  Education
                </h2>
                {editMode ? (
                  <textarea
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 min-h-[120px]"
                    placeholder="List your educational qualifications..."
                  />
                ) : (
                  <div className="prose prose-invert max-w-none">
                    {displayData("education") ? (
                      <p className="whitespace-pre-line">{displayData("education")}</p>
                    ) : (
                      <p className="text-gray-500">No education information available.</p>
                    )}
                  </div>
                )}
              </div>

              {/* LinkedIn Section */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <FaLinkedin className="text-blue-400" />
                  LinkedIn Profile
                </h2>
                {editMode ? (
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">linkedin.com/in/</span>
                    <input
                      type="text"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2"
                      placeholder="your-profile"
                    />
                  </div>
                ) : displayData("linkedin") ? (
                  <a 
                    href={`https://linkedin.com/in/${displayData("linkedin")}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    <FaLinkedin className="mr-2" />
                    linkedin.com/in/{displayData("linkedin")}
                  </a>
                ) : (
                  <p className="text-gray-500">No LinkedIn profile added</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MentorProfile;