import axios from 'axios';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'student';
  is_active: boolean;
  created_at: string;
}

export interface Class {
  id: number;
  class_name: string;
  class_code: string;
  description?: string;
  teacher_id: number;
  teacher_name?: string;
  academic_year: string;
  semester: number;
  student_count: number;
  document_count: number;
  is_active: boolean;
  created_at: string;
}

export interface Document {
  id: number;
  title: string;
  description?: string;
  file_path: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  class_id: number;
  class_name?: string;
  lesson_date: string;
  lesson_topic?: string;
  uploaded_by: number;
  uploader_name?: string;
  status: 'processing' | 'completed' | 'failed';
  total_pages: number;
  view_count: number;
  download_count: number;
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('isAuthenticated');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Đã xảy ra lỗi không xác định';
};

// Helper function to download files
export const downloadFile = (data: any, filename: string) => {
  const blob = new Blob([data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Documents API
export const documentsApi = {
  getAll: async (params?: any) => {
    const response = await api.get('/documents', { params });
    return response.data;
  },
  
  getByClass: async (classId: number, params?: any) => {
    const response = await api.get(`/documents/class/${classId}`, { params });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },
  
  upload: async (formData: FormData) => {
    const response = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  download: async (id: number) => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob'
    });
    return response;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  }
};

// Classes API
export const classesApi = {
  getAll: async () => {
    const response = await api.get('/classes');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  },
  
  create: async (classData: any) => {
    const response = await api.post('/classes', classData);
    return response.data;
  },
  
  update: async (id: number, classData: any) => {
    const response = await api.put(`/classes/${id}`, classData);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  },
  
  getStudents: async (id: number) => {
    const response = await api.get(`/classes/${id}/students`);
    return response.data;
  },
  
  addStudent: async (classId: number, studentId: number) => {
    const response = await api.post(`/classes/${classId}/students`, { student_id: studentId });
    return response.data;
  },
  
  removeStudent: async (classId: number, studentId: number) => {
    const response = await api.delete(`/classes/${classId}/students/${studentId}`);
    return response.data;
  }
};

// Users API
export const usersApi = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  create: async (userData: any) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  
  update: async (id: number, userData: any) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  
  toggleActive: async (id: number) => {
    const response = await api.patch(`/users/${id}/toggle-active`);
    return response.data;
  }
};

// Test API connection
export const testApi = async () => {
  try {
    const response = await axios.get('http://localhost:5000/health');
    return response.data;
  } catch (error) {
    console.error('API test failed:', error);
    throw error;
  }
};

export default api;
