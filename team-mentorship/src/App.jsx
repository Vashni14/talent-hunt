import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/StudentDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StudentLandingPage from "./pages/StudentLandingPage";
import AddGoals from "./pages/AddGoals";
import FindTeammatesPage from "./pages/FindTeammatesPage";
import { useAuth } from "./context/AuthContext"; // Correct import path

function App() {
  const { user } = useAuth(); // Get the authenticated user

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          {/* 🚀 Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* 🔐 Authentication Page */}
          <Route path="/auth" element={<Auth />} />

          {/* 🎓 Student Landing Page */}
          <Route
            path="/student/dashboard"
            element={user ? <StudentLandingPage /> : <Navigate to="/auth" />}
          />

          {/* 🎓 Student Dashboard */}
          <Route
            path="/student-dashboard"
            element={user ? <StudentDashboard /> : <Navigate to="/student/dashboard" />}
          />

          {/* 👨‍🏫 Mentor Dashboard */}
          <Route
            path="/mentor-dashboard"
            element={user ? <MentorDashboard /> : <Navigate to="/auth" />}
          />

          {/* 🏛️ Admin Dashboard */}
          <Route
            path="/admin-dashboard"
            element={user ? <AdminDashboard /> : <Navigate to="/auth" />}
          />

          {/* 🎯 Add Goals Page */}
          <Route
            path="/add-goals"
            element={user ? <AddGoals /> : <Navigate to="/student/dashboard" />}
          />

          {/* 👥 Find Teammates Page */}
          <Route
            path="/find-teammates"
            element={user ? <FindTeammatesPage /> : <Navigate to="/student/dashboard" />}
          />

          {/* 🚨 Default Redirect to Landing */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;