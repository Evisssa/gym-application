
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import {setDoc, doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';



interface AuthContextType {
  currentUser: User | null;
  userRole: string | null;
  isProfileComplete: boolean | null;
  loading: boolean;
  logout: () => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const unsubscribeSnapshot = onSnapshot(userDocRef, 
        (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            setUserRole(userData.role);
            const profileComplete = !!userData.firstName && !!userData.lastName && !!userData.age && !!userData.phone;
            setIsProfileComplete(profileComplete);
          } else {
            setUserRole(null);
            setIsProfileComplete(false);
          }
        },
        (error) => {
          console.error("AuthContext: Error listening to user profile changes. This is likely due to a network or security rule issue.", error);
          setIsProfileComplete(false);
          setUserRole(null);
        }
      );

      return () => unsubscribeSnapshot();
    } else {
      setUserRole(null);
      setIsProfileComplete(null);
    }
  }, [currentUser]);

  const logout = async () => {
    await signOut(auth);
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
  // Create user in Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  // Update display name
  await updateProfile(user, { displayName: `${firstName} ${lastName}` });
  // Add user profile to Firestore
  await setDoc(doc(db, 'users', user.uid), {
    firstName,
    lastName,
    email,
    role: 'member', // or whatever default role you want
    createdAt: new Date()
  });
};

  const value = {
    currentUser,
    userRole,
    isProfileComplete,
    loading,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
