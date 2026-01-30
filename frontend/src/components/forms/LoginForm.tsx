
import React, { useState } from 'react';
import Button from '../shared/Button';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase'; // Import the initialized Firebase app

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in successfully!');
      
      onLoginSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col bg-surface p-8 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-text">Login</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="bg-background border border-primary p-2 mb-4 rounded text-text"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="bg-background border border-primary p-2 mb-4 rounded text-text"
        required
      />
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </Button>
      <p className="mt-4 text-center text-text">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitchToRegister} className="text-primary hover:underline">
          Register
        </button>
      </p>
    </form>
  );
};

export default LoginForm;
