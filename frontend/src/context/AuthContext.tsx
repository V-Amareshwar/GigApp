import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebaseSetup';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  mockLogin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, mockLogin: () => {}, logout: () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Temporary mock function for development setup
  const mockLogin = () => {
    setUser({ uid: '11111111-1111-1111-1111-111111111111', phoneNumber: '+91 98765 43210' } as User);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.log('Error signing out', e);
    }
    setUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, mockLogin, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
