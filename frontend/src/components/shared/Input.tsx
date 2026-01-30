
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, ...props }) => {
  return (
    <div className="flex flex-col mb-4">
      <label className="text-text mb-1">{label}</label>
      <input
        {...props}
        className="bg-background border border-primary p-2 rounded text-text"
      />
    </div>
  );
};

export default Input;
