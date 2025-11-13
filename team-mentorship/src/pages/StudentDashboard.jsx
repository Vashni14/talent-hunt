import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../config/firebase";
import { FaTimes } from "react-icons/fa";

function StudentDashboard() {
  const navigate = useNavigate();

  const [studentData, setStudentData] = useState({
    name: "",
    contact: "",
    domain: "",
    department: "",
    rolePreference: "",
    skills: [],
    projects: [],
    certifications: [],
    experience: [],
    linkedin: "",
    github: "",
    portfolio: "",
    profilePicture: "",
    bio: ""
  });

  const [newProject, setNewProject] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [newExperience, setNewExperience] = useState({ competition: "" });
  const [newSkill, setNewSkill] = useState("");
  const [skillLevel, setSkillLevel] = useState("");

  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      fetchStudentData();
    }
  }, [user]);

  useEffect(() => {
    const summary = `${studentData.name} is an aspiring ${
      studentData.rolePreference ? studentData.rolePreference : "individual"
    } with expertise in ${
      studentData.skills.length > 0
        ? studentData.skills.map((skill) => skill.name).join(", ")
        : "various technologies"
    }. They have worked on projects like ${
      studentData.projects.length > 0
        ? studentData.projects.map((project) => project.name || project).join(", ")
        : "multiple industry-relevant projects"
    }.${
      studentData.certifications.length > 0
        ? ` Certified in ${studentData.certifications.join(", ")}.`
        : ""
    }`;
    
    setStudentData((prev) => ({ ...prev, bio: summary }));
  }, [studentData.name, studentData.rolePreference, studentData.skills, 
      studentData.projects, studentData.certifications]);

  const fetchStudentData = async () => {
    try {
      const { data } = await axios.get(`https://team-match.up.railway.app/api/student/profile/${user.uid}`);
      
      setStudentData({
        name: data.name || "",
        contact: data.contact || "",
        domain: data.domain || "",
        department: data.department || "",
        rolePreference: data.rolePreference || "",
        linkedin: data.linkedin || "",
        github: data.github || "",
        portfolio: data.portfolio || "",
        profilePicture: data.profilePicture || "",
        skills: Array.isArray(data.skills) ? data.skills : [], 
        projects: Array.isArray(data.projects) ? data.projects : [], 
        certifications: Array.isArray(data.certifications) ? data.certifications : [], 
        experience: Array.isArray(data.experience) ? data.experience : [], 
        bio: data.bio || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleChange = (e) => {
    setStudentData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };
  
  const addItem = (type, value, setValue, setLevel = null) => {
    if (typeof value === "string" && !value.trim()) return;
    if (typeof value === "object" && !value.name?.trim()) return;
  
    setStudentData((prevData) => ({
      ...prevData,
      [type]: [...prevData[type], value],
    }));
  
    setValue("");
    if (setLevel) setLevel("");
  };

  const addExperience = () => {
    if (newExperience.competition.trim()) {
      setStudentData(prev => ({
        ...prev,
        experience: [...prev.experience, newExperience]
      }));
      setNewExperience({ competition: "" });
    }
  };

  const removeItem = (type, index) => {
    setStudentData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!studentData.name || !studentData.contact) {
      alert("❌ Name and Contact are required!");
      return;
    }
  
    try {
      const payload = {
        uid: user.uid,
        name: studentData.name,
        contact: studentData.contact,
        domain: studentData.domain,
        department: studentData.department,
        rolePreference: studentData.rolePreference,
        linkedin: studentData.linkedin,
        github: studentData.github,
        portfolio: studentData.portfolio,
        skills: studentData.skills,
        projects: studentData.projects,
        certifications: studentData.certifications,
        experience: studentData.experience,
        bio: studentData.bio,
      };
  
      const response = await axios.post(
        "https://team-match.up.railway.app/api/student/profile", 
        payload
      );

      if (response.data) {
        alert("✅ Profile updated successfully!");
        setStudentData(response.data.profile);
        navigate('/student/dashboard');
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert(`❌ Error saving profile: ${error.message}`);
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);
    formData.append("uid", user.uid);

    try {
      const response = await axios.post(
        "https://team-match.up.railway.app/api/student/uploadProfile", 
        formData, 
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      
      setStudentData(prev => ({ 
        ...prev, 
        profilePicture: response.data.profilePictureUrl 
      }));
      alert("✅ Profile picture uploaded successfully!");
    } catch (error) {
      console.error("❌ Error uploading profile picture:", error);
      alert("❌ Error uploading profile picture.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <div className="w-full max-w-4xl bg-gray-800 p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-teal-400 text-center mb-6">Student Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name & Contact */}
          <div>
            <label className="block font-semibold">Name*</label>
            <input 
              type="text" 
              name="name" 
              value={studentData.name} 
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white"
            />
          </div>

          <div>
            <label className="block font-semibold">Contact*</label>
            <input 
              type="text" 
              name="contact" 
              value={studentData.contact} 
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white"
              placeholder="Enter email or phone number"
            />
          </div>

          {/* Department & Domain */}
          <div>
            <label className="block font-semibold">Department</label>
            <select 
              name="department" 
              value={studentData.department} 
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white"
            >
              <option value="">Select Department</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="AIDS">AIDS</option>
              <option value="ECS">ECS</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold">Domain of Interest</label>
            <input 
              type="text" 
              name="domain" 
              value={studentData.domain} 
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white"
            />
          </div>

          {/* Profile Picture Upload */}
          <div className="col-span-2 flex flex-col items-center">
            <label className="block font-semibold">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              className="mt-2 bg-gray-700 text-white p-2 rounded border border-gray-600 w-full cursor-pointer
                       file:bg-white file:text-black file:font-semibold file:px-3 file:py-2 
                       file:rounded file:border-none file:cursor-pointer"
            />
            {studentData.profilePicture && (
              <div className="mt-2">
                <img 
                  src={studentData.profilePicture} 
                  alt="Profile" 
                  className="h-20 w-20 rounded-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Role Preference */}
          <div>
            <label className="block font-semibold">Role Preference</label>
            <select 
              name="rolePreference" 
              value={studentData.rolePreference} 
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white"
            >
              <option value="">Select a Role</option>
              <option value="Team Leader">Team Leader</option>
              <option value="Developer">Developer</option>
              <option value="Researcher">Researcher</option>
              <option value="Designer">Designer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Skill Input with Proficiency */}
          <div className="col-span-2">
            <label className="block font-semibold">Skills</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white"
              />
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="p-3 rounded bg-gray-700 border border-gray-600 text-white"
              >
                <option value="">Proficiency Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <button
                onClick={() => {
                  if (newSkill.trim() && skillLevel) {
                    addItem("skills", { name: newSkill, level: skillLevel }, setNewSkill, setSkillLevel);
                  }
                }}
                className="bg-blue-500 px-4 py-2 rounded font-bold hover:bg-blue-600"
              >
                +
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {studentData.skills.map((skill, index) => (
                <span key={index} className="bg-gray-700 px-3 py-1 rounded flex items-center">
                  {skill.name} ({skill.level})
                  <FaTimes 
                    className="text-red-500 cursor-pointer ml-2" 
                    onClick={() => removeItem("skills", index)} 
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Projects Section */}
          <div className="col-span-2">
            <label className="block font-semibold">Projects</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add a project"
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white"
              />
              <button
                onClick={() => addItem("projects", newProject, setNewProject)}
                className="bg-blue-500 px-4 py-2 rounded font-bold hover:bg-blue-600"
              >
                +
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {studentData.projects.map((project, index) => (
                <span key={index} className="bg-gray-700 px-3 py-1 rounded flex items-center break-all max-w-full overflow-hidden text-ellipsis">
                  {typeof project === "string" ? project : project.name || "Unnamed Project"}
                  <FaTimes 
                    className="text-red-500 cursor-pointer ml-2" 
                    onClick={() => removeItem("projects", index)} 
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Certifications Section */}
          <div className="col-span-2">
            <label className="block font-semibold">Certifications</label>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Add a certification" 
                value={newCertification} 
                onChange={(e) => setNewCertification(e.target.value)}
                className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white"
              />
              <button 
                onClick={() => addItem("certifications", newCertification, setNewCertification)}
                className="bg-blue-500 px-4 py-2 rounded font-bold hover:bg-blue-600"
              >
                +
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {studentData.certifications.map((cert, index) => (
                <span 
                  key={index} 
                  className="bg-gray-700 px-3 py-1 rounded flex items-center break-all max-w-full overflow-hidden text-ellipsis"
                >
                  {cert} 
                  <FaTimes 
                    className="text-red-500 cursor-pointer ml-2" 
                    onClick={() => removeItem("certifications", index)}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Social Media Links */}
          <div className="col-span-2">
            <label className="block font-semibold">Social Media & Portfolio</label>
            <input 
              type="text" 
              name="linkedin" 
              placeholder="LinkedIn Profile URL" 
              value={studentData.linkedin} 
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white"
            />
            <input 
              type="text" 
              name="github" 
              placeholder="GitHub Profile URL" 
              value={studentData.github} 
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white mt-2"
            />
            <input 
              type="text" 
              name="portfolio" 
              placeholder="Portfolio Website URL" 
              value={studentData.portfolio} 
              onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white mt-2"
            />
          </div>

          <div className="col-span-2">
            <label className="block font-semibold">Competition Experience</label>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Competition Experience" 
                value={newExperience.competition} 
                onChange={(e) => setNewExperience({ ...newExperience, competition: e.target.value })}
                className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white mt-2"
              />
              <button 
                onClick={addExperience} 
                className="bg-blue-500 px-4 py-2.5 rounded font-bold hover:bg-blue-600"
              >
                +
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2 overflow-auto max-h-32">
              {studentData.experience.map((exp, index) => (
                <div key={index} className="bg-gray-700 px-3 py-1 rounded flex items-center whitespace-nowrap">
                  {exp.competition} 
                  <FaTimes 
                    className="text-red-500 cursor-pointer ml-2" 
                    onClick={() => removeItem("experience", index)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Auto-Generated Profile Summary */}
          <div className="col-span-2 bg-gray-800 p-4 rounded-lg mt-4">
            <h3 className="text-xl font-semibold text-teal-400">Profile Summary</h3>
            <p className="text-gray-300 mt-2">{studentData.bio}</p>
          </div>

          {/* Final Save Button */}
          <button 
            onClick={handleSave} 
            className="col-span-2 w-full bg-teal-500 px-4 py-3 rounded mt-6 font-bold hover:bg-teal-600"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;