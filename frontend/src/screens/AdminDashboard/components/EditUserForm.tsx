
import React, { useState, useEffect } from 'react';
import Button from '../../../components/shared/Button';
import Input from '../../../components/shared/Input';
import Select from '../../../components/shared/Select';

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
}

interface EditUserFormProps {
  user: User | null;
  onUserUpdated: (updatedUser: Partial<User>) => void;
  onCancel: () => void;
  onDelete: () => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ user, onUserUpdated, onCancel, onDelete }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            const nameParts = (user.name || '').split(' ');
            setFirstName(nameParts[0] || '');
            setLastName(nameParts.slice(1).join(' ') || '');
            setRole(user.role);
        }
    }, [user]);

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        setError("Cannot update user: data is missing.");
        return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/updateUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              uid: user.id,
              firstName,
              lastName,
              role
          }),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update user');
      }

      const updatedUser = await response.json();
      console.log('User updated successfully!');
      onUserUpdated(updatedUser);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-8">Loading user data...</div>;
  }

  return (
    <form onSubmit={handleUpdateUser} className="flex flex-col bg-surface p-8 rounded-lg min-w-[400px]">
      <h2 className="text-2xl font-bold mb-4 text-text">Edit User</h2>
      <Input label="First Name" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" required />
      <Input label="Last Name" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" required />
      <Input label="Email" type="email" value={user.email} placeholder="Email" readOnly />
      <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)} options={[{ value: 'user', label: 'User' }, { value: 'admin', label: 'Admin' }]} />
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <div className="flex justify-end items-center mt-6 gap-4">
        <button type="button" onClick={onCancel} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                Cancel
            </button>
            <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              {loading ? 'Updating...' : 'Update'}
            </button>
        </div>
    </form>
  );
};

export default EditUserForm;
