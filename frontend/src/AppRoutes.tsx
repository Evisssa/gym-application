import React from 'react';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import HomeScreen from './screens/HomeScreen/Home';
import LoginScreen from './screens/LoginScreen/Login';
import AdminDashboard from './screens/AdminDashboard/AdminDashboard';
import UserManagement from './screens/AdminDashboard/pages/UserManagement';
import Scheduler from './screens/Scheduler/Scheduler';
import MemberHome from './screens/HomeScreen/MemberHome';
import CompleteProfile from './screens/CompleteProfileScreen/CompleteProfile';
import ClassManagement from './screens/AdminDashboard/pages/ClassManagement';
import AdminHome from './screens/AdminDashboard/pages/AdminHome';

const AppRoutes: React.FC = () => {
  const { currentUser, userRole, isProfileComplete, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }

  const userIsAdmin = userRole?.toLowerCase() === 'admin';
  const userIsMember = userRole?.toLowerCase() === 'member';

  return (
    <Routes>
      {currentUser ? (
        userIsAdmin ? (
          <Route path="/" element={<AdminDashboard />}>
            <Route index element={<AdminHome />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="classes" element={<ClassManagement />} />
            <Route path="scheduler" element={<Scheduler />} />
          </Route>
        ) : userIsMember ? (
          <Route path="/" element={ <MemberHome /> } />
           
        ) : (
          <Route path="/" element={ <HomeScreen />     } />
        )
      ) : (
        <Route path="/" element={<LoginScreen />} />
      )}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
