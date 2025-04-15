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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(() => {
    // Initialize role from localStorage if available
    return localStorage.getItem('userRole') || "student";
  });
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [dynamicText, setDynamicText] = useState("🔑 Secure Login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
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

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    localStorage.setItem('userRole', selectedRole);
  };

  const register = async () => {
    try {
      if (!isValidEmail(email)) {
        alert("❌ Invalid Email! Please enter a valid email address.");
        return;
      }
      if (!name.trim()) {
        alert("❌ Please enter your name");
        return;
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase(), password);
      
      // Store both name and role in Firebase profile
      await updateProfile(userCredential.user, { 
        displayName: name,
        photoURL: role // Using photoURL to store role
      });
      
      // Create user document in your database (pseudo-code)
      // await createUserDocument(userCredential.user.uid, {
      //   name,
      //   email: userCredential.user.email,
      //   role,
      //   createdAt: new Date()
      // });
      
      alert(`✅ Signup successful! Welcome, ${name}!`);
      navigate(`/auth`); // Navigate based on selected role
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
      const user = userCredential.user;
      
      // Get role from Firebase profile (photoURL) or default to student
      const userRole = user.photoURL || "student";
      
      // Update local role state
      handleRoleChange(userRole);
      
      // Navigate based on role
      if (userRole === "mentor") {
        navigate("/mentor-dashboard");
      } else if (userRole === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/student/dashboard"); // Default to student dashboard
      }
    } catch (error) {
      alert("❌ Login Failed: " + error.message);
    }
  };

  const handleForgotPassword = async () => {
    try {
      if (!isValidEmail(email)) {
        alert("❌ Invalid Email! Please enter a valid email address.");
        return;
      }
      await sendPasswordResetEmail(auth, email.toLowerCase());
      alert("📩 Reset email sent! Check your inbox.");
      setShowForgotPassword(false);
    } catch (error) {
      alert("❌ Error: " + error.message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // For Google users, default to student role
      const userRole = user.photoURL || "student";
      
      // Update local role state
      handleRoleChange(userRole);
      
      // Navigate based on role
      if (userRole === "mentor") {
        navigate("/mentor-dashboard");
      } else if (userRole === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/student/dashboard"); // Default to student dashboard
      }
      
    } catch (error) {
      alert("❌ Error: " + error.message);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-900 text-white overflow-hidden">
      <button
        className="absolute top-5 left-5 flex items-center text-gray-300 hover:text-white transition"
        onClick={() => navigate("/")}
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>

      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-95">
        <div className="absolute inset-0 bg-[url('/tech-network.png')] bg-cover opacity-10"></div>
      </div>

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

      <div className="bg-gray-800/90 backdrop-blur-md p-10 rounded-lg shadow-xl w-[520px] relative z-10 border border-gray-700">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-teal-400">TeamSphere</h1>
        <p className="text-center text-gray-300 text-lg mb-4 animate-fade-in">{dynamicText}</p>

        {!isLogin && (
          <div className="mb-4">
            <label className="block text-white font-semibold mb-1">
              <FaUser className="inline mr-2 text-teal-400" /> Select Role:
            </label>
            <select 
              className="w-full p-2 rounded border border-gray-600 bg-gray-700 text-white" 
              value={role} 
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}

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

        <div className="mb-4">
          <label className="block text-white font-semibold mb-1"><FaEnvelope className="inline mr-2 text-teal-400" /> Email:</label>
          <input 
            type="email" 
            placeholder="Enter email" 
            className="w-full p-2 rounded border bg-gray-700 text-white" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>

        <div className="mb-4 relative">
          <label className="block text-white font-semibold mb-1"><FaLock className="inline mr-2 text-teal-400" /> Password:</label>
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Enter password" 
            className="w-full p-2 rounded border bg-gray-700 text-white" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button 
            className="absolute right-3 top-9 text-gray-400"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {isLogin && (
          <button onClick={login} className="w-full bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded mb-2 font-bold transition-colors">
            Login
          </button>
        )}

        {!isLogin && (
          <button onClick={register} className="w-full bg-green-500 hover:bg-green-600 px-4 py-2 rounded mb-2 font-bold transition-colors">
            Signup
          </button>
        )}

        <button 
          onClick={signInWithGoogle} 
          className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-2 flex items-center justify-center font-bold transition-colors"
        >
          <FaGoogle className="mr-2" /> Sign in with Google
        </button>
        
        {isLogin && !showForgotPassword && (
          <p 
            className="text-center text-yellow-400 cursor-pointer mt-2 hover:text-yellow-500 transition-colors" 
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot Password?
          </p>
        )}

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
              className="w-full bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded font-bold mt-2 flex items-center justify-center transition-colors"
            >
              Send Reset Email
            </button>
            <p 
              className="text-center text-gray-400 cursor-pointer mt-2 hover:text-white transition-colors" 
              onClick={() => setShowForgotPassword(false)}
            >
              🔙 Back to Login
            </p>
          </div>
        )}

        <p 
          className="text-center text-blue-400 cursor-pointer mt-4 hover:text-blue-300 transition-colors" 
          onClick={() => {
            setIsLogin(!isLogin);
            setShowForgotPassword(false);
          }}
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}

export default Auth;