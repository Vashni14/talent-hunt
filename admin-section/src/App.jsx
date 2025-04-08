import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/dashboard/Dashboard';
import Competitions from './components/admin/competitions/Competitions';
import Teams from './components/admin/teams/Teams';
import Mentors from './components/admin/mentors/Mentors';
import Reports from './components/admin/reports/Reports';
import SDG from './components/admin/sdg/SDG';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="competitions" element={<Competitions />} />
          <Route path="teams" element={<Teams />} />
          <Route path="mentors" element={<Mentors />} />
          <Route path="reports" element={<Reports />} />
          <Route path="sdg" element={<SDG />} />
          {/* Add other admin routes here */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
