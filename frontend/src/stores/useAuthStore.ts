import { create } from 'zustand';
import { Role, UserProfile } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  role: Role;
  isAuthenticated: boolean;
  setUser: (user: UserProfile) => void;
  switchRole: (role: Role) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: 'stud_72',
    username: 'aarav.sharma',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@campusnotify.edu',
    role: 'STUDENT',
    department: 'Information Technology',
    rollNo: 'VU4F2526072',
    prn: 'PRN20269941',
    batch: 'B3',
    semester: 7,
  },
  token: localStorage.getItem('cnms_jwt_token') || 'simulated_jwt_token_valid',
  role: 'STUDENT',
  isAuthenticated: true,

  setUser: (user) => {
    set({ user, role: user.role, isAuthenticated: true });
  },

  switchRole: (role) => {
    set((state) => {
      const updatedUser = state.user
        ? {
            ...state.user,
            role,
            name:
              role === 'FACULTY' || role === 'HOD'
                ? 'Dr. Vivek Patil'
                : state.user.name,
            email:
              role === 'FACULTY' || role === 'HOD'
                ? 'v.patil@campusnotify.edu'
                : state.user.email,
          }
        : null;
      return { role, user: updatedUser };
    });
  },

  logout: () => {
    api.setToken(null);
    set({ user: null, token: null, role: 'ANONYMOUS', isAuthenticated: false });
  },
}));
