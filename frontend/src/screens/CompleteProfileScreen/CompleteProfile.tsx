
import React from 'react';
import UserInfoForm from '../../components/forms/UserInfoForm';

interface CompleteProfileProps {
  onProfileComplete: () => void;
  onBack?: () => void;
}

const CompleteProfile: React.FC<CompleteProfileProps> = ({ onProfileComplete, onBack }) => {
  return (
    <div className="container mx-auto">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
        >
          Back to Home
        </button>
      )}
      <h1 className="text-2xl font-bold text-center my-4">Complete Your Profile</h1>
      <UserInfoForm onProfileComplete={onProfileComplete} />
    </div>
  );
};

export default CompleteProfile;
