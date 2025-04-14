import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
// Import your mentor components
// Use these exact imports:
// Use these exact imports:
import TeamProgress from "./mentor/components/TeamProgress";
import TeamSessions from "./mentor/components/TeamSessions";
import MentorProfile from "./mentor/pages/MentorProfile"; 
import MentorNavbar from "./mentor/components/MentorNavbar";
function MentorDashboard() {
  const navigate = useNavigate();

  const logout = async () => {
    await signOut(auth);
    alert("Logged out!");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      <div className="container mx-auto p-4">
        {/* Your dashboard content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Profile Section */}
          <div className="md:col-span-1">
            <MentorProfile />
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-4">
            <TeamProgress />
            <TeamSessions />
            {/* Add other components here */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MentorDashboard;