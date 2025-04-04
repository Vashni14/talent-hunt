import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../config/firebase";
import { FaTimes } from "react-icons/fa"; // ❌ Delete icon

function StudentDashboard() {
  const navigate = useNavigate();

  const [studentData, setStudentData] = useState({
    name: "",
    contact: "",
    domain: "",
    rolePreference: "",
    skills: [],
    projects: [],
    certifications: [],
    experience: [],
    linkedin: "",
    github: "",
    portfolio: "",
  });

  const [newProject, setNewProject] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const [newExperience, setNewExperience] = useState({ company: "", role: "", duration: "" });
  const [newSkill, setNewSkill] = useState("");
const [skillLevel, setSkillLevel] = useState(""); // ✅ Define skillLevel


  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      fetchStudentData();
    }
  }, [user]);

  // 🔹 Fetch student profile
  const fetchStudentData = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/student/profile/${user.uid}`);

      setStudentData({
        name: data.name || "",
        contact: data.contact || "",
        domain: data.domain || "",
        rolePreference: data.rolePreference || "",
        linkedin: data.linkedin || "",
        github: data.github || "",
        portfolio: data.portfolio || "",
        skills: Array.isArray(data.skills) ? data.skills : [], 
        projects: Array.isArray(data.projects) ? data.projects : [], 
        certifications: Array.isArray(data.certifications) ? data.certifications : [], 
        experience: Array.isArray(data.experience) ? data.experience : [], 
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // 🔹 Handle input changes
  const handleChange = (e) => {
    setStudentData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };
  
  const addItem = (type, value, setValue, setLevel = null) => {
    if (!value || (typeof value === "object" && !value.name.trim())) return; // Prevent empty items
  
    setStudentData((prevData) => ({
      ...prevData,
      [type]: [...prevData[type], value], // Add new item
    }));
  
    setValue(""); // Clear input field
    if (setLevel) setLevel(""); // Clear skill level dropdown (if applicable)
  };
  
  

  const addExperience = () => {
    if (newExperience.company.trim() && newExperience.role.trim() && newExperience.duration.trim()) {
      setStudentData({ ...studentData, experience: [...studentData.experience, newExperience] });
      setNewExperience({ company: "", role: "", duration: "" });
    }
  };

  // 🔹 Remove Items
  const removeItem = (type, index) => {
    setStudentData({ ...studentData, [type]: studentData[type].filter((_, i) => i !== index) });
  };

  // 🔹 Save profile
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
        rolePreference: studentData.rolePreference,
        linkedin: studentData.linkedin,
        github: studentData.github,
        portfolio: studentData.portfolio,
        skills: studentData.skills,
        projects: studentData.projects,
        certifications: studentData.certifications,
        experience: studentData.experience,
      };
  
      console.log("Sending Data:", payload); // Debugging Line
  
      await axios.post("http://localhost:5000/api/student/profile", payload);
      
      alert("✅ Profile updated successfully!");
      fetchStudentData(); // Refresh data to check if changes are saved
      navigate('/student/dashboard');
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("❌ Error saving profile.");
    }
  };
  

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0]; // Get the selected file
    if (!file) {
      console.error("No file selected.");
      return;
    }
  
    console.log("Selected File:", file); // Debugging line
  
    const formData = new FormData();
    formData.append("profilePicture", file);
    formData.append("uid", user.uid); // Attach user ID
  
    console.log("Form Data:", formData); // Debugging line
  
    try {
      const response = await axios.post("http://localhost:5000/api/student/uploadProfile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      console.log("Upload Response:", response.data); // Debugging line
  
      alert("✅ Profile picture uploaded successfully!");
      fetchStudentData(); // Refresh profile data after upload
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
            <input type="text" name="name" value={studentData.name} onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white"/>
          </div>

          <div>
            <label className="block font-semibold">Contact*</label>
            <input type="text" name="contact" value={studentData.contact} onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white"
              placeholder="Enter email or phone number"/>
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
    <img src={studentData.profilePicture} alt="Profile" 
      className="w-20 h-20 rounded-full mt-3 border border-teal-400"/>
  )}
</div>


          {/* Domain of Interest & Role Preference */}
          <div>
            <label className="block font-semibold">Domain of Interest</label>
            <input type="text" name="domain" value={studentData.domain} onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white"/>
          </div>

          <div>
            <label className="block font-semibold">Role Preference</label>
            <select name="rolePreference" value={studentData.rolePreference} onChange={handleChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white">
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
      onClick={() => addItem("skills", { name: newSkill, level: skillLevel }, setNewSkill, setSkillLevel)}
      className="bg-blue-500 px-4 py-2 rounded font-bold hover:bg-blue-600"
    >
      +
    </button>
  </div>

  <div className="flex flex-wrap gap-2 mt-2">
  {studentData.skills.map((skill, index) => (
    <span key={index} className="bg-gray-700 px-3 py-1 rounded flex items-center">
      {skill.name} ({skill.level})  
      <FaTimes className="text-red-500 cursor-pointer ml-2" onClick={() => removeItem("skills", index)} />
    </span>
  ))}
</div>

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

  {/* Display Added Projects */}
  <div className="flex flex-wrap gap-2 mt-2">
  {studentData.projects.map((project, index) => (
  <span key={index} className="bg-gray-700 px-3 py-1 rounded flex items-center break-all max-w-full overflow-hidden text-ellipsis">
    {typeof project === "string" ? project : project.name || "Unnamed Project"}
    <FaTimes className="text-red-500 cursor-pointer ml-2" onClick={() => removeItem("projects", index)} />
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
  
  {/* Display Added Certifications */}
  <div className="flex flex-wrap gap-2 mt-2">
    {studentData.certifications.map((cert, index) => (
      <span 
        key={index} 
        className="bg-gray-700 px-3 py-1 rounded flex items-center break-all max-w-full overflow-hidden text-ellipsis"
      >
        {cert} 
        <FaTimes className="text-red-500 cursor-pointer ml-2" onClick={() => removeItem("certifications", index)}/>
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
  <div className="flex gap-2">
    <input type="text" placeholder="Company" value={newExperience.company} 
      onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
      className="p-3 rounded bg-gray-700 border border-gray-600 text-white w-full max-w-xs"/>
    <input type="text" placeholder="Role" value={newExperience.role}
      onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })}
      className="p-3 rounded bg-gray-700 border border-gray-600 text-white w-full max-w-xs"/>
    <input type="text" placeholder="Duration" value={newExperience.duration}
      onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
      className="p-3 rounded bg-gray-700 border border-gray-600 text-white w-full max-w-xs"/>
    <button onClick={addExperience} className="bg-orange-500 px-4 py-2 rounded font-bold hover:bg-orange-600">+</button>
  </div>

  <div className="flex flex-wrap gap-2 mt-2 overflow-auto max-h-32">
    {studentData.experience.map((exp, index) => (
      <div key={index} className="bg-gray-700 px-3 py-1 rounded flex items-center whitespace-nowrap">
        {exp.company} - {exp.role} ({exp.duration})
        <FaTimes className="text-red-500 cursor-pointer ml-2" onClick={() => removeItem("experience", index)}/>
      </div>
    ))}
  </div>
</div>


{/* Auto-Generated Profile Summary */}
<div className="col-span-2 bg-gray-800 p-4 rounded-lg mt-4">
  <h3 className="text-xl font-semibold text-teal-400">Profile Summary</h3>
  <p className="text-gray-300 mt-2">
    {studentData.name} is an aspiring {studentData.rolePreference ? studentData.rolePreference : "individual"}{" "}
    with expertise in {studentData.skills.length > 0 
      ? studentData.skills.map(skill => skill.name).join(", ") 
      : "various technologies"}.
    They have worked on projects like {studentData.projects.length > 0 
      ? studentData.projects.map(project => project.name || project).join(", ") 
      : "multiple industry-relevant projects"}.
    {studentData.certifications.length > 0 ? ` Certified in ${studentData.certifications.join(", ")}.` : ""}
  </p>
</div>


        {/* Final Save Button (Unchanged) */}
        <button onClick={handleSave} className="w-full bg-teal-500 px-4 py-3 rounded mt-6 font-bold hover:bg-teal-600">
          Save Profile
        </button>
      </div>
      </div>
  );
}

export default StudentDashboard;