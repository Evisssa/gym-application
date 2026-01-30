import React from 'react';

const HomeScreen: React.FC = () => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center bg-gradient-to-br from-background to-surface">
      <h1 className="text-4xl font-bold text-text mb-4">Welcome to the Home Screen!</h1>
      <p className="text-lg text-text">You are successfully logged in.</p>
    </div>
  );
};

export default HomeScreen;
