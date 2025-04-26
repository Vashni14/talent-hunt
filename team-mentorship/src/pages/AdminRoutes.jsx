// src/routes/AdminRoutes.js
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '../pages/AdminDashboard';
import CompetitionsA from '../pages/admin/CompetitionsA';
import Students from '../pages/admin/Students';
import Teams from '../pages/admin/Teams';
import Mentors from '../pages/admin/Mentors';
import Reports from '../pages/admin/Reports';
import SDG from '../pages/admin/SDG';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />}>
        <Route index element={<AdminHome />} />
        <Route path="competitions" element={<CompetitionsA />} />
        <Route path="students" element={<Students />} />
        <Route path="teams" element={<Teams />} />
        <Route path="mentors" element={<Mentors />} />
        <Route path="reports" element={<Reports />} />
        <Route path="sdg" element={<SDG />} />
      </Route>
    </Routes>
  );
};

const AdminHome = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add your admin dashboard widgets here */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
          <p>Total Users: 0</p>
          <p>Active Competitions: 0</p>
        </div>
      </div>
    </div>
  );
};

export default AdminRoutes;