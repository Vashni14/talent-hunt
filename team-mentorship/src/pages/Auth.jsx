import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { 
  FaEye, FaEyeSlash, FaGoogle, FaUser, FaLock, FaEnvelope, 
  FaArrowLeft, FaUsers, FaRobot, FaCogs, FaLink
} from "react-icons/fa";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function Auth() {
  const [name, setName] = useState(""); // Name Field for Signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [dynamicText, setDynamicText] = useState("🔑 Secure Login");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = isLogin ? "Login - TeamSphere" : "Signup - TeamSphere";

    const textOptions = [
      "🚀 Join the Future of Team Collaboration",
      "🤝 AI-Powered Smart Team Matching",
      "📊 Track Progress & Achievements",
      "🔒 Secure & Seamless Login",
    ];
    let index = 0;
    const interval = setInterval(() => {
      setDynamicText(textOptions[index]);
      index = (index + 1) % textOptions.length;
    }, 2500);
    return () => clearInterval(interval);
  }, [isLogin]);

  const register = async () => {
    try {
      if (!isValidEmail(email)) {
        alert("❌ Invalid Email! Please enter a valid email address.");
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase(), password);
      await updateProfile(userCredential.user, { displayName: name }); // Store Name in Firebase
      alert(`✅ Signup successful! Welcome, ${name}!`);
      setIsLogin(true);
    } catch (error) {
      alert("❌ Error: " + error.message);
    }
  };

  const login = async () => {
    try {
      if (!isValidEmail(email)) {
        alert("❌ Invalid Email! Please enter a valid email address.");
        return;
      }
      const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
      const userName = userCredential.user.displayName || "User"; // Get Name from Firebase
      alert(`✅ Welcome, ${userName}!`);
      navigate(role === "student" ? "/student-dashboard" : role === "mentor" ? "/mentor-dashboard" : "/admin-dashboard");
    } catch (error) {
      alert("❌ Login Failed: " + error.message);
    }
  };

  const [showForgotPassword, setShowForgotPassword] = useState(false); // Toggle state for forgot password

const handleForgotPassword = async () => {
  try {
    if (!isValidEmail(email)) {
      alert("❌ Invalid Email! Please enter a valid email address.");
      return;
    }
    await sendPasswordResetEmail(auth, email.toLowerCase());
    alert("📩 Reset email sent! Check your inbox.");
    setShowForgotPassword(false); // Hide input after sending
  } catch (error) {
    alert("❌ Error: " + error.message);
  }
};


  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      alert(`✅ Welcome, ${result.user.displayName}!`);
      navigate("/student-dashboard");
    } catch (error) {
      alert("❌ Error: " + error.message);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* 🔙 Back Button */}
      <button
        className="absolute top-5 left-5 flex items-center text-gray-300 hover:text-white transition"
        onClick={() => navigate("/")}
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>

      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-95">
        <div className="absolute inset-0 bg-[url('/tech-network.png')] bg-cover opacity-10"></div>
      </div>

      {/* 🔥 Floating Icons */}
      <div className="absolute top-14 left-20 text-teal-400 opacity-90 hover:scale-110 transition-transform animate-pulse">
        <FaLink size={100} />
      </div>
      <div className="absolute top-14 right-20 text-yellow-400 opacity-90 hover:scale-110 transition-transform animate-pulse">
        <FaUsers size={100} />
      </div>
      <div className="absolute bottom-14 left-20 text-blue-400 opacity-90 hover:scale-110 transition-transform animate-pulse">
        <FaRobot size={100} />
      </div>
      <div className="absolute bottom-14 right-20 text-red-400 opacity-90 hover:scale-110 transition-transform animate-pulse">
        <FaCogs size={100} />
      </div>

      {/* 🔥 Auth Box */}
      <div className="bg-gray-800/90 backdrop-blur-md p-10 rounded-lg shadow-xl w-[520px] relative z-10 border border-gray-700">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-teal-400">TeamSphere</h1>

        {/* Dynamic Text */}
        <p className="text-center text-gray-300 text-lg mb-4 animate-fade-in">{dynamicText}</p>

    {/* Role Selection */}
    <div className="mb-4">
          <label className="block text-white font-semibold mb-1">
            <FaUser className="inline mr-2 text-teal-400" /> Select Role:
          </label>
          <select className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {/* Name Field (Only for Signup) */}
        {!isLogin && (
          <div className="mb-4">
            <label className="block text-white font-semibold mb-1">
              <FaUser className="inline mr-2 text-teal-400" /> Full Name:
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

    

        {/* Email & Password */}
        <div className="mb-4">
          <label className="block text-white font-semibold mb-1"><FaEnvelope className="inline mr-2 text-teal-400" /> Email:</label>
          <input type="email" placeholder="Enter email" className="w-full p-2 rounded border bg-gray-700 text-white" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="mb-4 relative">
          <label className="block text-white font-semibold mb-1"><FaLock className="inline mr-2 text-teal-400" /> Password:</label>
          <input type={showPassword ? "text" : "password"} placeholder="Enter password" className="w-full p-2 rounded border bg-gray-700 text-white" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {/* 🔥 Login Button (Only for Login Page) */}
{isLogin && (
  <button onClick={login} className="w-full bg-teal-500 px-4 py-2 rounded mb-2 font-bold">
    Login
  </button>
)}

{/* 🔥 Signup Button (Only for Signup Page) */}
{!isLogin && (
  <button onClick={register} className="w-full bg-green-500 px-4 py-2 rounded mb-2 font-bold">
    Signup
  </button>
)}


        {/* 🔥 Google Login */}
        <button onClick={signInWithGoogle} className="w-full bg-blue-600 px-4 py-2 rounded mb-2 flex items-center justify-center font-bold"><FaGoogle className="mr-2" /> Sign in with Google</button>
        
       {isLogin && !showForgotPassword && (
  <p className="text-center text-yellow-400 cursor-pointer mt-2 hover:text-yellow-500" 
     onClick={() => setShowForgotPassword(true)}>
    Forgot Password?
  </p>
)}

{/* Forgot Password Input & Button (Only shows when clicked) */}
{showForgotPassword && (
  <div className="mt-4">
    <label className="block text-white font-semibold mb-1">
      <FaEnvelope className="inline mr-2 text-teal-400" /> Enter Registered Email:
    </label>
    <input
      type="email"
      placeholder="Enter your email address"
      className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
    <button 
      onClick={handleForgotPassword} 
      className="w-full bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded font-bold mt-2 flex items-center justify-center">
      Send Reset Email
    </button>
    <p className="text-center text-gray-400 cursor-pointer mt-2 hover:text-white" 
       onClick={() => setShowForgotPassword(false)}>
      🔙 Back to Login
    </p>
  </div>
)}

        <p className="text-center text-blue-400 cursor-pointer mt-4" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}

export default Auth;
