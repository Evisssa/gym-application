import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { db, auth } from '../../../firebase';
import Modal from '../../../components/shared/Modal';
import AddUserForm from '../../../components/forms/AddUserForm';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import EditUserForm from '../components/EditUserForm';
//const userDoc = await getDocs(docs(db, 'users', currentUser.uid));
//const userRole = userDoc.exists() ? userDoc.data().role : null;

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

type SortKey = keyof User;

const UserManagement: React.FC = () => {
  // Existing state
  const [users, setUsers] = useState<User[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ NEW: Auth state management
  const [currentUser, setCurrentUser] = useState<{ uid: string; role?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // CHECK ADMIN STATUS
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      console.log('Auth state changed:', user?.email || 'No user');

      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult(true); // Force refresh
          const role = idTokenResult.claims?.role as string;
          console.log('User role:', role, 'UID:', user.uid);

          setCurrentUser({
            uid: user.uid,
            role: role
          });
        } catch (error) {
          console.error('Token error:', error);
          setCurrentUser({ uid: user.uid, role: undefined });
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // FETCH USERS (with better error handling)
  const fetchUsers = async () => {
    if (!currentUser?.role || currentUser.role !== 'admin') {
      console.log('Skipping fetch - not admin');
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching users...');
      const usersCol = collection(db, 'users');
      const userSnapshot = await getDocs(usersCol);

      console.log('DOCS FOUND:', userSnapshot.docs.length);
      if (userSnapshot.docs.length > 0) {
        console.log('First doc:', userSnapshot.docs[0]?.data());
      }

      const userList: User[] = userSnapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          email: data.email || '',
          role: data.role || 'member',
          firstName: data.firstName,
          lastName: data.lastName,
        };
      });

      setUsers(userList);
      console.log('Loaded users:', userList);
    } catch (error: any) {
      console.error('FIRESTORE ERROR:', error.message);
      if (error.code === 'permission-denied') {
        console.log('PERMISSION DENIED - Check rules or login as admin');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ FETCH ON MOUNT + ADMIN CONFIRMED
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [currentUser]);

  // SORTED USERS
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const aVal = (a[sortKey] as string) || '';
      const bVal = (b[sortKey] as string) || '';
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, sortKey, sortOrder]);

  // ADMIN CHECK - BLOCK ACCESS
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="p-8 text-center bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl max-w-2xl mx-auto mt-20">
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">Access Denied</span>
          </div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Admin Access Required</h1>
        </div>
        <div className="space-y-2 text-gray-700">
          <p><strong>Status:</strong> {currentUser ? `Logged in as ${currentUser.role}` : 'Not logged in'}</p>
          <p>Log in with an <strong>admin</strong> account to manage users.</p>
        </div>
      </div>
    );
  }

  // EVENT HANDLERS (unchanged)
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleAddUser = () => setAddUserModalOpen(true);
  const handleCloseAddUserModal = () => setAddUserModalOpen(false);

  const handleUserAdded = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    handleCloseAddUserModal();
  };

  const openEditModal = (user: User) => {
    setUserToEdit(user);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setUserToEdit(null);
    setEditModalOpen(false);
  };

  const handleUserUpdated = (updatedUser: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u));
    closeEditModal();
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setUserToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleDeleteFromEditForm = () => {
    if (userToEdit) {
      closeEditModal();
      openDeleteModal(userToEdit);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch('http://localhost:3001/deleteUser', { // ✅ Fixed URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: userToDelete.id }),
      });

      if (!response.ok) throw new Error('Failed to delete user');
      
      console.log('✅ User deleted:', userToDelete.id);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
    } catch (error) {
      console.error('❌ Delete error:', error);
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ✅ ADMIN HEADER */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-green-800">Admin Panel</h2>
            <p className="text-sm text-green-600">Logged in as: <strong>{currentUser?.uid.slice(0, 8)}...</strong></p>
          </div>
          <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
            {currentUser?.role}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={handleAddUser}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all"
          disabled={loading}
        >
          Add User
        </button>
      </div>

      {/* ✅ STATUS */}
      {loading && !users.length ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading users...</p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-xl text-gray-500 mb-2">No users found</p>
          <button onClick={fetchUsers} className="text-blue-600 hover:text-blue-800">
            Refresh
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-200">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th 
                  className="py-4 px-6 text-left font-semibold text-gray-800 cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => handleSort('name')}
                >
                  Name <span className="text-xs opacity-50">{sortKey === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</span>
                </th>
                <th 
                  className="py-4 px-6 text-left font-semibold text-gray-800 cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => handleSort('email')}
                >
                  Email <span className="text-xs opacity-50">{sortKey === 'email' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</span>
                </th>
                <th 
                  className="py-4 px-6 text-left font-semibold text-gray-800 cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => handleSort('role')}
                >
                  Role <span className="text-xs opacity-50">{sortKey === 'role' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}</span>
                </th>
                <th className="py-4 px-6 text-left font-semibold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50 border-b border-gray-100 transition">
                  <td className="py-4 px-6 font-medium">{user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()}</td>
                  <td className="py-4 px-6 text-gray-700">{user.email}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'trainer' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 hover:bg-blue-50 rounded transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 hover:bg-red-50 rounded transition"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODALS (unchanged) */}
      <Modal isOpen={isAddUserModalOpen} onClose={handleCloseAddUserModal}>
        <AddUserForm onUserAdded={handleUserAdded} onCancel={handleCloseAddUserModal} />
      </Modal>
      
      {userToEdit && (
        <Modal isOpen={isEditModalOpen} onClose={closeEditModal}>
          <EditUserForm 
            user={userToEdit} 
            onUserUpdated={handleUserUpdated} 
            onCancel={closeEditModal} 
            onDelete={handleDeleteFromEditForm}
          />
        </Modal>
      )}

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen} 
        onClose={closeDeleteModal} 
        onConfirm={handleDeleteUser} 
        userName={userToDelete?.name || userToDelete?.email || ''} 
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default UserManagement;
