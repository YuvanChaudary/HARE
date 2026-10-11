import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, UserSession } from '../api/client';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  quickLogin: (role: 'SUPERVISOR' | 'SAFETY_MANAGER' | 'ADMIN') => Promise<void>;
  logout: () => void;
  selectedWorksiteId: string;
  setSelectedWorksiteId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_CREDENTIALS = {
  SUPERVISOR: {
    email: 'rahul@site.hare.local',
    password: 'HareSafety#2026',
    label: 'Rahul Kumar (Site Supervisor)',
    worksite: 'WS-BLR-NORTH-04',
  },
  SAFETY_MANAGER: {
    email: 'ananya@safety.hare.local',
    password: 'HareSafety#2026',
    label: 'Ananya Rao (Regional Safety Mgr)',
    worksite: 'ALL',
  },
  ADMIN: {
    email: 'vikram@admin.hare.local',
    password: 'HareSafety#2026',
    label: 'Vikram Singh (System Admin)',
    worksite: 'ALL',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedWorksiteId, setSelectedWorksiteId] = useState<string>('WS-BLR-NORTH-04');

  useEffect(() => {
    // Check if token exists in localStorage
    const savedUser = localStorage.getItem('hare_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        if (parsed.assigned_worksite_id && parsed.assigned_worksite_id !== 'ALL') {
          setSelectedWorksiteId(parsed.assigned_worksite_id);
        }
      } catch {
        api.setToken(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const session = await api.login(username, password);
    setUser(session);
    localStorage.setItem('hare_user', JSON.stringify(session));
    if (session.assigned_worksite_id && session.assigned_worksite_id !== 'ALL') {
      setSelectedWorksiteId(session.assigned_worksite_id);
    }
  };

  const quickLogin = async (role: 'SUPERVISOR' | 'SAFETY_MANAGER' | 'ADMIN') => {
    const cred = DEMO_CREDENTIALS[role];
    await login(cred.email, cred.password);
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    localStorage.removeItem('hare_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        quickLogin,
        logout,
        selectedWorksiteId,
        setSelectedWorksiteId,
      }}
    >
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
