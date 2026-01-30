import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import Scheduler from '../Scheduler/Scheduler';
import CompleteProfile from '../CompleteProfileScreen/CompleteProfile';

const MemberHome: React.FC = () => {
  const { currentUser, isProfileComplete } = useAuth();
  const [activeComponent, setActiveComponent] = useState<'home' | 'scheduler' | 'profile'>('home');

  // You may want to fetch more user data from Firestore if needed

  const handleProfileComplete = () => {
    setActiveComponent('home');
  };

  if (activeComponent === 'scheduler') {
    return <Scheduler onBack={() => setActiveComponent('home')} />;
  }

  if (activeComponent === 'profile') {
    return <CompleteProfile onProfileComplete={handleProfileComplete} onBack={() => setActiveComponent('home')} />;
  }

  return (
    <div className="flex-grow flex flex-col items-center justify-center bg-gradient-to-br from-background to-surface">
      <h1 className="text-4xl font-bold text-text mb-4">
        Welcome, {currentUser?.displayName || currentUser?.email || 'Member'}!
      </h1>
      <p className="text-lg text-text mb-2">Email: {currentUser?.email}</p>
      {/* Add more user data fields here if available */}
      {!isProfileComplete && (
        <button
          className="mt-4 px-4 py-2 bg-primary text-white rounded"
          onClick={() => setActiveComponent('profile')}
        >
          Complete Your Profile
        </button>
      )}
      {isProfileComplete && (
        <div className="mt-4 text-center">
          <p className="text-green-600 mb-4">Your profile is complete!</p>
          <div className="flex gap-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setActiveComponent('scheduler')}
            >
              Book Class
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => setActiveComponent('profile')}
            >
              Update Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberHome;