
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import Button from './Button';

interface TopBarProps {
  onLoginClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onLoginClick }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Redirect to homepage on logout
    } catch (error) {
      console.error("Logout failed: ", error);
      // Optionally, show an error message to the user
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-primary shadow-md p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-white">Gym App</Link>
      <div>
        {currentUser ? (
          <Button onClick={handleLogout}>Logout</Button>
        ) : (
          <Button onClick={onLoginClick}>Login</Button>
        )}
      </div>
    </div>
  );
};

export default TopBar;
