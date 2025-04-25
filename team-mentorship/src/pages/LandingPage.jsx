import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsersCog, FaUserTie, FaLaptopCode, FaTasks, FaChartBar, FaNetworkWired, FaUserFriends, FaLightbulb } from "react-icons/fa";

function LandingPage() {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  const handleStart = () => {
    setFadeOut(true);
    setTimeout(() => navigate("/auth"), 800); // Wait for animation to complete
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Floating Icons Related to the Project Features */}
      <div className="absolute top-14 left-10 transition-transform duration-300 hover:scale-110">
        <FaUsersCog size={70} className="text-blue-400 animate-spin-slow" />
      </div>
      <div className="absolute top-14 right-10 transition-transform duration-300 hover:scale-110">
        <FaUserFriends size={70} className="text-purple-300 animate-wiggle" />
      </div>
      <div className="absolute bottom-16 left-10 transition-transform duration-300 hover:scale-110">
        <FaChartBar size={70} className="text-green-400 animate-pulse" />
      </div>
      <div className="absolute bottom-16 right-10 transition-transform duration-300 hover:scale-110">
        <FaLaptopCode size={70} className="text-yellow-400 animate-pulse" />
      </div>

      {/* 🚀 Title with Futuristic Effect */}
      <h1 className="text-6xl font-extrabold text-teal-400 drop-shadow-lg tracking-wide">
        Welcome to <span className="text-yellow-400">TeamSphere</span>
      </h1>

      {/* 💡 Enhanced Description - Structured with Proper Features */}
      <p className="text-lg text-gray-300 text-center mt-4 px-8 max-w-3xl leading-relaxed">
        <span className="text-blue-400 font-semibold">AI-Powered Team Formation</span>,  
        <span className="text-green-400 font-semibold"> Smart Mentor Matching</span>,  
        <span className="text-yellow-400 font-semibold"> Competition & Project Tracking</span> – all in one platform!
      </p>

      {/* 🔬 Key Features - Only Features Related to TeamSphere */}
      <div className="mt-10 grid grid-cols-3 gap-6">
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 flex flex-col items-center">
          <FaUsersCog size={50} className="text-blue-400" />
          <p className="mt-2 text-center text-sm">AI-Based Team Matching</p>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 flex flex-col items-center">
          <FaUserTie size={50} className="text-purple-400" />
          <p className="mt-2 text-center text-sm">Mentor Allocation</p>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 flex flex-col items-center">
          <FaTasks size={50} className="text-green-400" />
          <p className="mt-2 text-center text-sm">Project & Task Tracking</p>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 flex flex-col items-center">
          <FaChartBar size={50} className="text-yellow-400" />
          <p className="mt-2 text-center text-sm">Competition Progress Analytics</p>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 flex flex-col items-center">
          <FaNetworkWired size={50} className="text-red-400" />
          <p className="mt-2 text-center text-sm">Find Project Partners</p>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 flex flex-col items-center">
          <FaLightbulb size={50} className="text-teal-400" />
          <p className="mt-2 text-center text-sm">Post Research & Innovations</p>
        </div>
      </div>

      {/* 🚀 Get Started Button - Now with Smooth Fade Out */}
      <button
        onClick={handleStart}
        className="mt-8 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 transition px-8 py-3 rounded-lg font-bold shadow-lg transform hover:scale-110"
      >
        Get Started
      </button>
    </div>
  );
}

export default LandingPage;
