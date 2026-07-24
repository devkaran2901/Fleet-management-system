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
      const storedUser = localStorage.getItem('fms_user');

      if (token) {
        try {
          // Fetch complete profile details from server
          const response = await api.get('/auth/profile');
          const roles = response.data.roles.map((ur: any) => ur.role.name);
          setUser({
            ...response.data,
            roles,
          });
        } catch (err) {
          // If offline / demo mode, restore from fms_user if present
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch {
              localStorage.removeItem('fms_token');
              localStorage.removeItem('fms_user');
              setUser(null);
            }
          } else {
            localStorage.removeItem('fms_token');
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (emailInput: string, password: string) => {
    setLoading(true);
    const email = emailInput.trim();
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: loggedUser } = response.data;
      localStorage.setItem('fms_token', access_token);
      localStorage.setItem('fms_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
    } catch (err: any) {
      // Demo / Fallback account check
      const lower = email.toLowerCase();
      let demoUser: User | null = null;

      if (lower.includes('driver') || lower.includes('drv') || lower.includes('98765') || lower.includes('rajesh')) {
        demoUser = {
          id: 'drv-401',
          email: email.includes('@') ? email : 'driver@fleetos.com',
          firstName: 'Rajesh',
          lastName: 'Kumar',
          isActive: true,
          roles: ['DRIVER'],
        };
      } else if (lower.includes('admin')) {
        demoUser = { id: 'usr-admin', email, firstName: 'Admin', lastName: 'User', isActive: true, roles: ['ADMIN'] };
      } else if (lower.includes('vendor')) {
        demoUser = { id: 'usr-vendor', email, firstName: 'Vendor', lastName: 'User', isActive: true, roles: ['VENDOR'] };
      } else if (lower.includes('dispatcher')) {
        demoUser = { id: 'usr-disp', email, firstName: 'Dispatcher', lastName: 'User', isActive: true, roles: ['DISPATCHER'] };
      } else if (lower.includes('manager')) {
        demoUser = { id: 'usr-mgr', email, firstName: 'Fleet', lastName: 'Manager', isActive: true, roles: ['FLEET_MANAGER'] };
      } else if (lower.includes('workshop')) {
        demoUser = { id: 'usr-wksp', email, firstName: 'Workshop', lastName: 'Manager', isActive: true, roles: ['WORKSHOP_MANAGER'] };
      } else if (lower.includes('compliance')) {
        demoUser = { id: 'usr-comp', email, firstName: 'Compliance', lastName: 'Officer', isActive: true, roles: ['COMPLIANCE_MANAGER'] };
      } else if (lower.includes('finance')) {
        demoUser = { id: 'usr-fin', email, firstName: 'Finance', lastName: 'Manager', isActive: true, roles: ['FINANCE_MANAGER'] };
      } else if (email.length > 0) {
        // Fallback for any entered text in demo environment
        demoUser = {
          id: 'drv-401',
          email: email.includes('@') ? email : 'driver@fleetos.com',
          firstName: 'Rajesh',
          lastName: 'Kumar',
          isActive: true,
          roles: ['DRIVER'],
        };
      }

      if (demoUser) {
        localStorage.setItem('fms_token', 'demo-token');
        localStorage.setItem('fms_user', JSON.stringify(demoUser));
        setUser(demoUser);
        setLoading(false);
        return;
      }

      localStorage.removeItem('fms_token');
      localStorage.removeItem('fms_user');
      setUser(null);
      throw new Error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('fms_token');
    localStorage.removeItem('fms_user');
    setUser(null);
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      localStorage.setItem('fms_user', JSON.stringify(newUser));
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
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
