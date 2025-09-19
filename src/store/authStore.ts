import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { User, UserRole, AuthState } from '../types';

interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  initializeAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || userData.displayName,
          photoURL: firebaseUser.photoURL || userData.photoURL,
          role: userData.role,
          createdAt: userData.createdAt?.toDate() || new Date(),
          lastLoginAt: new Date()
        };
        
        // Update last login time
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...userData,
          lastLoginAt: new Date()
        }, { merge: true });
        
        set({ user, isLoading: false });
      } else {
        throw new Error('User data not found');
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  register: async (email: string, password: string, displayName: string, role: UserRole) => {
    try {
      set({ isLoading: true, error: null });
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update Firebase Auth profile
      await updateProfile(firebaseUser, { displayName });
      
      // Create user document in Firestore
      const userData: Omit<User, 'id'> = {
        email,
        displayName,
        role,
        createdAt: new Date(),
        lastLoginAt: new Date()
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      const user: User = {
        id: firebaseUser.uid,
        ...userData
      };
      
      set({ user, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await signOut(auth);
      set({ user: null, isLoading: false, error: null });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateUserProfile: async (data: Partial<User>) => {
    try {
      const { user } = get();
      if (!user) throw new Error('No user logged in');
      
      set({ isLoading: true, error: null });
      
      // Update Firestore
      await setDoc(doc(db, 'users', user.id), data, { merge: true });
      
      // Update Firebase Auth if needed
      if (data.displayName && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: data.displayName });
      }
      
      // Update local state
      set({ 
        user: { ...user, ...data },
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  initializeAuth: () => {
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const user: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || userData.displayName,
              photoURL: firebaseUser.photoURL || userData.photoURL,
              role: userData.role,
              createdAt: userData.createdAt?.toDate() || new Date(),
              lastLoginAt: userData.lastLoginAt?.toDate()
            };
            
            set({ user, isLoading: false, error: null });
          } else {
            set({ user: null, isLoading: false, error: null });
          }
        } catch (error: any) {
          set({ user: null, isLoading: false, error: error.message });
        }
      } else {
        set({ user: null, isLoading: false, error: null });
      }
    });
  },

  clearError: () => set({ error: null })
}));
