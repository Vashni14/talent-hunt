import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/StudentDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StudentLandingPage from "./pages/StudentLandingPage";
import AddGoals from "./pages/AddGoals";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          {/* 🚀 Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* 🔐 Authentication Page */}
          <Route path="/auth" element={<Auth />} />

          <Route path="/student/dashboard" element={<StudentLandingPage />} />

          {/* 🎓 Student Dashboard */}
          <Route path="/student-dashboard" element={<StudentDashboard />} />

          {/* 👨‍🏫 Mentor Dashboard */}
          <Route path="/mentor-dashboard" element={<MentorDashboard />} />

          {/* 🏛️ Admin Dashboard */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          <Route path="/add-goals" element={<AddGoals />} />

          {/* 🚨 Default Redirect to Landing */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
