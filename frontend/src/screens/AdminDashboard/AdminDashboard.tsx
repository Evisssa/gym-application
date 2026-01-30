import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminHome from './pages/AdminHome';

const AdminDashboard: React.FC = () => {
  return (
    <div className="flex h-full">
      <AdminSidebar />
      <main className="flex-grow p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
