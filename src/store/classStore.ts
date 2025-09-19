import { create } from 'zustand';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { ClassRoom, ClassSchedule, ClassState } from '../types';

interface ClassStore extends ClassState {
  // Actions
  createClass: (classData: Omit<ClassRoom, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateClass: (classId: string, updates: Partial<ClassRoom>) => Promise<void>;
  deleteClass: (classId: string) => Promise<void>;
  joinClass: (classId: string, userId: string) => Promise<void>;
  leaveClass: (classId: string, userId: string) => Promise<void>;
  getClassesByUser: (userId: string, role: string) => Promise<void>;
  getClassById: (classId: string) => Promise<void>;
  setCurrentClass: (classroom: ClassRoom | null) => void;
  subscribeToClasses: (userId: string, role: string) => () => void;
  clearError: () => void;
  
  // Schedule actions
  addSchedule: (classId: string, schedule: Omit<ClassSchedule, 'id' | 'classId'>) => Promise<string>;
  updateSchedule: (scheduleId: string, updates: Partial<ClassSchedule>) => Promise<void>;
  deleteSchedule: (scheduleId: string) => Promise<void>;
  getSchedulesByClass: (classId: string) => Promise<ClassSchedule[]>;
}

export const useClassStore = create<ClassStore>((set, get) => ({
  currentClass: null,
  classes: [],
  isLoading: false,
  error: null,

  createClass: async (classData) => {
    try {
      set({ isLoading: true, error: null });
      
      const newClass = {
        ...classData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'classes'), newClass);
      
      const createdClass: ClassRoom = {
        id: docRef.id,
        ...newClass
      };
      
      set(state => ({
        classes: [...state.classes, createdClass],
        isLoading: false
      }));
      
      return docRef.id;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateClass: async (classId, updates) => {
    try {
      set({ isLoading: true, error: null });
      
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await updateDoc(doc(db, 'classes', classId), updateData);
      
      set(state => ({
        classes: state.classes.map(cls => 
          cls.id === classId ? { ...cls, ...updateData } : cls
        ),
        currentClass: state.currentClass?.id === classId 
          ? { ...state.currentClass, ...updateData }
          : state.currentClass,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteClass: async (classId) => {
    try {
      set({ isLoading: true, error: null });
      
      await deleteDoc(doc(db, 'classes', classId));
      
      set(state => ({
        classes: state.classes.filter(cls => cls.id !== classId),
        currentClass: state.currentClass?.id === classId ? null : state.currentClass,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  joinClass: async (classId, userId) => {
    try {
      set({ isLoading: true, error: null });
      
      const classRef = doc(db, 'classes', classId);
      const classDoc = await getDoc(classRef);
      
      if (!classDoc.exists()) {
        throw new Error('Class not found');
      }
      
      const classData = classDoc.data() as ClassRoom;
      
      if (classData.studentIds.includes(userId)) {
        throw new Error('User already in class');
      }
      
      if (classData.studentIds.length >= classData.maxStudents) {
        throw new Error('Class is full');
      }
      
      const updatedStudentIds = [...classData.studentIds, userId];
      
      await updateDoc(classRef, {
        studentIds: updatedStudentIds,
        updatedAt: new Date()
      });
      
      set(state => ({
        classes: state.classes.map(cls => 
          cls.id === classId 
            ? { ...cls, studentIds: updatedStudentIds, updatedAt: new Date() }
            : cls
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  leaveClass: async (classId, userId) => {
    try {
      set({ isLoading: true, error: null });
      
      const classRef = doc(db, 'classes', classId);
      const classDoc = await getDoc(classRef);
      
      if (!classDoc.exists()) {
        throw new Error('Class not found');
      }
      
      const classData = classDoc.data() as ClassRoom;
      const updatedStudentIds = classData.studentIds.filter(id => id !== userId);
      
      await updateDoc(classRef, {
        studentIds: updatedStudentIds,
        updatedAt: new Date()
      });
      
      set(state => ({
        classes: state.classes.map(cls => 
          cls.id === classId 
            ? { ...cls, studentIds: updatedStudentIds, updatedAt: new Date() }
            : cls
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getClassesByUser: async (userId, role) => {
    try {
      set({ isLoading: true, error: null });
      
      let q;
      if (role === 'teacher') {
        q = query(
          collection(db, 'classes'),
          where('teacherId', '==', userId),
          orderBy('createdAt', 'desc')
        );
      } else if (role === 'student') {
        q = query(
          collection(db, 'classes'),
          where('studentIds', 'array-contains', userId),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Admin can see all classes
        q = query(
          collection(db, 'classes'),
          orderBy('createdAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const classes: ClassRoom[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        classes.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as ClassRoom);
      });
      
      set({ classes, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getClassById: async (classId) => {
    try {
      set({ isLoading: true, error: null });
      
      const classDoc = await getDoc(doc(db, 'classes', classId));
      
      if (!classDoc.exists()) {
        throw new Error('Class not found');
      }
      
      const data = classDoc.data();
      const classroom: ClassRoom = {
        id: classDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as ClassRoom;
      
      set({ currentClass: classroom, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setCurrentClass: (classroom) => {
    set({ currentClass: classroom });
  },

  subscribeToClasses: (userId, role) => {
    let q;
    if (role === 'teacher') {
      q = query(
        collection(db, 'classes'),
        where('teacherId', '==', userId),
        orderBy('createdAt', 'desc')
      );
    } else if (role === 'student') {
      q = query(
        collection(db, 'classes'),
        where('studentIds', 'array-contains', userId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'classes'),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const classes: ClassRoom[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        classes.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as ClassRoom);
      });
      
      set({ classes });
    });

    return unsubscribe;
  },

  clearError: () => set({ error: null }),

  // Schedule methods
  addSchedule: async (classId, schedule) => {
    try {
      const scheduleData = {
        ...schedule,
        classId,
        date: Timestamp.fromDate(schedule.date)
      };
      
      const docRef = await addDoc(collection(db, 'schedules'), scheduleData);
      return docRef.id;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateSchedule: async (scheduleId, updates) => {
    try {
      const updateData = {
        ...updates,
        ...(updates.date && { date: Timestamp.fromDate(updates.date) })
      };
      
      await updateDoc(doc(db, 'schedules', scheduleId), updateData);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteSchedule: async (scheduleId) => {
    try {
      await deleteDoc(doc(db, 'schedules', scheduleId));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  getSchedulesByClass: async (classId) => {
    try {
      const q = query(
        collection(db, 'schedules'),
        where('classId', '==', classId),
        orderBy('date', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const schedules: ClassSchedule[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        schedules.push({
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date()
        } as ClassSchedule);
      });
      
      return schedules;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  }
}));
