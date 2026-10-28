import { create } from 'zustand';
import { User, Role } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  isDemoMode: boolean;
  login: (email: string, role: Role) => void;
  logout: () => void;
  toggleDemoMode: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setAuth: (user: User, token: string, refreshToken: string) => void;
}

const DEFAULT_DEMO_USER: User = {
  id: 'usr_admin_01',
  name: 'Admin User',
  email: 'admin@contextos.local',
  role: 'ADMIN',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  title: 'System Administrator',
};

const getStoredToken = () => localStorage.getItem('token');
const getStoredRefreshToken = () => localStorage.getItem('refreshToken');
const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  isAuthenticated: !!getStoredToken(),
  token: getStoredToken(),
  refreshToken: getStoredRefreshToken(),
  isDemoMode: false,
  
  login: (email: string, role: Role) => {
    // This is the fallback demo login. The actual login should use setAuth
    const name = email.split('@')[0];
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    set({
      user: {
        id: `usr_${Date.now()}`,
        name: formattedName || (role === 'ADMIN' ? 'Admin User' : 'Participant User'),
        email,
        role,
        avatarUrl: role === 'ADMIN' 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        title: role === 'ADMIN' ? 'System Administrator' : 'Project Contributor',
      },
      isAuthenticated: true,
      token: 'mock_jwt_token_user_logged_in',
    });
  },
  
  setAuth: (user: User, token: string, refreshToken: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, refreshToken, isAuthenticated: true, isDemoMode: false });
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ token: accessToken, refreshToken });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false, token: null, refreshToken: null });
  },
  
  toggleDemoMode: () => {
    set((state) => ({ isDemoMode: !state.isDemoMode }));
  }
}));
