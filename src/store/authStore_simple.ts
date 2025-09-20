import { create } from 'zustand';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'student';
  is_active: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  token: null,
  
  login: (user: User, token: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  }
}));

// Initialize auth state from localStorage
const initializeAuth = () => {
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (token && userStr && isAuthenticated) {
    try {
      const user = JSON.parse(userStr);
      useAuthStore.setState({ user, token, isAuthenticated: true });
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      useAuthStore.getState().logout();
    }
  }
};

// Initialize on module load
initializeAuth();
