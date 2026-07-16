import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Recover session on load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('fms_token');
      if (token) {
        try {
          // Fetch complete profile details from server
          const response = await api.get('/auth/profile');
          // Format role structure from backend: backend returns UserRole join table items, we extract role name
          const roles = response.data.roles.map((ur: any) => ur.role.name);
          setUser({
            ...response.data,
            roles,
          });
        } catch (err) {
          console.error('Failed to restore session:', err);
          localStorage.removeItem('fms_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: loggedUser } = response.data;
      localStorage.setItem('fms_token', access_token);
      setUser(loggedUser);
    } catch (err: any) {
      localStorage.removeItem('fms_token');
      setUser(null);
      throw new Error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('fms_token');
    setUser(null);
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedUser });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
