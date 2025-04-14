import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import Competitions from './components/admin/Competitions';
import Teams from './components/admin/Teams';
import Mentors from './components/admin/Mentors';
import Reports from './components/admin/Reports';
import SDG from './components/admin/SDG';

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
