import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebaseConfig';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

type Role = 'admin' | 'user' | null;

interface AuthContextType {
  role: Role;
  email: string | null;
  authError: string | null;
  isAuthReady: boolean;
  login: (email: string, forcedRole?: Role) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [role, setRole] = useState<Role>(() => {
    const saved = localStorage.getItem('census_role');
    return (saved as Role) || null;
  });

  const [email, setEmail] = useState<string | null>(() => {
    return localStorage.getItem('census_email');
  });

  useEffect(() => {
    if (!auth) {
      setAuthError('auth-provider-disabled');
      setIsAuthReady(true);
      return;
    }
    
    // Ensure the user is authenticated with Firebase to satisfy security rules
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth).then(() => {
          setIsAuthReady(true);
          setAuthError(null);
        }).catch(err => {
          console.error("Firebase Anonymous Auth failed:", err);
          // Handle both standard and admin-restricted error codes for disabled providers
          if (err.code === 'auth/configuration-not-found' || err.code === 'auth/admin-restricted-operation') {
            setAuthError('auth-provider-disabled');
          } else {
            setAuthError(err.message);
          }
          setIsAuthReady(true);
        });
      } else {
        setAuthError(null);
        setIsAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (userEmail: string, forcedRole?: Role) => {
    const isExplicitAdmin = userEmail.toLowerCase().includes('admin') || userEmail === 'lsamy2752@gmail.com';
    const newRole: Role = forcedRole || (isExplicitAdmin ? 'admin' : 'user');
    
    // Sync to Firestore if authenticated
    if (auth?.currentUser && db) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          email: userEmail,
          role: newRole,
          uid: auth.currentUser.uid
        }, { merge: true });
      } catch (err) {
        console.error("Failed to sync user role to Firestore:", err);
      }
    }

    setRole(newRole);
    setEmail(userEmail);
    localStorage.setItem('census_role', newRole);
    localStorage.setItem('census_email', userEmail);
  };

  const logout = () => {
    setRole(null);
    setEmail(null);
    localStorage.removeItem('census_role');
    localStorage.removeItem('census_email');
  };

  return (
    <AuthContext.Provider value={{ role, email, authError, isAuthReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
