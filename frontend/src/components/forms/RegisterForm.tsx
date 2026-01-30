
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import Button from '../shared/Button';
import Input from '../shared/Input';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();
   const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(email, password, firstName, lastName);
      onRegisterSuccess();
      navigate('/'); // Redirect to home or another page after successful registration
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleRegister} className="flex flex-col bg-surface p-8 rounded-lg min-w-[400px]">
      <h2 className="text-2xl font-bold mb-4 text-text">Register</h2>
      <Input label="First Name" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" required />
      <Input label="Last Name" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" required />
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <Button type="submit">Register</Button>
      <p className="mt-4 text-center text-text">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin} className="text-primary hover:underline">
          Login
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;
