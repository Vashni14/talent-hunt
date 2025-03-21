import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const navigate = useNavigate();

  const logout = async () => {
    await signOut(auth);
    alert("Logged out!");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">🎓 Student Dashboard</h1>
      <button onClick={logout} className="bg-red-500 px-4 py-2 rounded">
        Logout
      </button>
    </div>
  );
}

export default StudentDashboard;
