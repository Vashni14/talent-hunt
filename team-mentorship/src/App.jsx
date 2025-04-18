import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/StudentDashboard";
import MentorDashboard from "./pages/mentor/MentorDashboard";
import MentorProfile from "./pages/mentor/MentorProfie";
import MentorTeamsPage from "./pages/mentor/MentorTeamsPage";
import MentorStudents from "./pages/mentor/MentorStudents";
import AdminDashboard from "./pages/AdminDashboard";
import StudentLandingPage from "./pages/StudentLandingPage";
import AddGoals from "./pages/AddGoals";
import FindTeammatesPage from "./pages/FindTeammatesPage";
import { useAuth } from "./context/AuthContext"; // Correct import path
import FindTeammates from "./pages/FindTeammates";
import OpenTeams from "./pages/OpenTeams";
import Chat from "./pages/Chat";
import MyTeams from "./pages/MyTeams";
import SDGMapping from "./pages/SDGMapping";
import Competitions from "./pages/Competitions";
import MentorFindingPage from "./pages/MentorFindingPage";
import Dashboard from "./pages/admin/Dashboard";
import CompetitionsA from "./pages/admin/CompetitionsA";
import Mentors from "./pages/admin/Mentors";
import Reports from "./pages/admin/Reports";
import SDG from "./pages/admin/SDG";
import Students from "./pages/admin/Students";
import Teams from "./pages/admin/Teams";

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
          <Route path="competitions" element={<Competitions />} />
          <Route path="dashboard" element={<FindTeammates />} />
          <Route path="open-teams" element={<OpenTeams />} />
          <Route path="chats" element={<Chat />} />
          <Route path="my-teams" element={<MyTeams />} />
          <Route path="sdg" element={<SDGMapping />} />
          {/* 🎓 Student Landing Page */}
          <Route
            path="/student/dashboard"
            element={user ? <StudentLandingPage /> : <Navigate to="/student/dashboard" />}
          />

          {/* 🎓 Student Dashboard */}
          <Route
            path="/student-dashboard"
            element={
              user ? <StudentDashboard /> : <Navigate to="/student/dashboard" />
            }
          />


          {/* 🎯 Add Goals Page */}
          <Route
            path="/add-goals"
            element={user ? <AddGoals /> : <Navigate to="/student/dashboard" />}
          />

          {/* 👥 Find Teammates Page */}
          <Route
            path="/find-teammates"
            element={
              user ? (
                <FindTeammatesPage />
              ) : (
                <Navigate to="/student/dashboard" />
              )
            }
          />

          {/* 🚨 Default Redirect to Landing */}
          <Route path="*" element={<LandingPage />} />
          <Route path="mentorfind" element={<MentorFindingPage />} />

          {/* Mentor Routes */}
          <Route
            path="/mentor-dashboard"
            element={
              user ? <MentorDashboard /> : <Navigate to="/mentor-dashboard" />
            }
          />
          <Route path="mentor-profile" element={<MentorProfile />} />
          <Route path="mentored-teams" element={<MentorTeamsPage />} />
          <Route path="mentor-students" element={<MentorStudents />} />
          {/* Admin Routes */}
          <Route
  path="/admin-dashboard"
  element={user? <AdminDashboard /> : <Navigate to="/admin-dashboard" />}>
  <Route index element={<Dashboard />} />
  <Route path="competitions" element={<CompetitionsA />} />
  <Route path="teams" element={<Teams />} />
  <Route path="mentors" element={<Mentors />} />
  <Route path="reports" element={<Reports />} />
  <Route path="sdg" element={<SDG />} />
  <Route path="students" element={<Students />} />
</Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
