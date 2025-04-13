import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/StudentDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StudentLandingPage from "./pages/StudentLandingPage";
import AddGoals from "./pages/AddGoals";
import FindTeammatesPage from "./pages/FindTeammatesPage";
import { useAuth } from "./context/AuthContext";
import FindTeammates from "./pages/FindTeammates";
import OpenTeams from "./pages/OpenTeams";
import Chat from "./pages/Chat";
import MyTeams from "./pages/MyTeams";
import SDGMapping from "./pages/SDGMapping";

// Mentor routes - imported components from your mentor-section
// Use these exact imports:
import MentorProfile from "./pages/mentor/pages/MentorProfile";
import TeamProgress from "./pages/mentor/components/TeamProgress";
import TeamSessions from "./pages/mentor/components/TeamSessions";

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          {/* 🚀 Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* 🔐 Authentication Page */}
          <Route path="/auth" element={<Auth />} />

          {/* 👨‍🏫 Mentor Routes */}
          
          {/* 👨‍🏫 Mentor Routes */}
<Route
  path="/mentor/dashboard"
  element={user ? <MentorDashboard /> : <Navigate to="/auth" />}
/>
<Route
  path="/mentor/profile"
  element={user ? <MentorProfile /> : <Navigate to="/auth" />}
/>
<Route
  path="/mentor/progress"
  element={user ? <TeamProgress /> : <Navigate to="/auth" />}
/>
<Route
  path="/mentor/sessions"
  element={user ? <TeamSessions /> : <Navigate to="/auth" />}
/>

          {/* Other routes */}
<Route path="/mentor/teams" element={user ? <Teams /> : <Navigate to="/auth" />} />
<Route path="/mentor/chat" element={user ? <Chat /> : <Navigate to="/auth" />} />

          {/* Other existing routes... */}
          <Route path="dashboard" element={<FindTeammates />} />
          <Route path="open-teams" element={<OpenTeams />} />
          <Route path="chats" element={<Chat />} />
          <Route path="my-teams" element={<MyTeams />} />
          <Route path="sdg" element={<SDGMapping />} />
          
          {/* 🎓 Student Routes */}
          <Route
            path="/student/dashboard"
            element={user ? <StudentLandingPage /> : <Navigate to="/auth" />}
          />
          <Route
            path="/student-dashboard"
            element={user ? <StudentDashboard /> : <Navigate to="/student/dashboard" />}
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