// User Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date;
  lastLoginAt?: Date;
}

export type UserRole = 'admin' | 'teacher' | 'student';

// Class Types
export interface ClassRoom {
  id: string;
  name: string;
  description?: string;
  teacherId: string;
  studentIds: string[];
  schedule: ClassSchedule[];
  isActive: boolean;
  maxStudents: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassSchedule {
  id: string;
  classId: string;
  date: Date;
  startTime: string;
  endTime: string;
  topic?: string;
  materials: string[];
  isCompleted: boolean;
}

// Video Call Types
export interface VideoCallSession {
  id: string;
  classId: string;
  channelName: string;
  token: string;
  isActive: boolean;
  startedAt: Date;
  endedAt?: Date;
  participants: Participant[];
}

export interface Participant {
  userId: string;
  displayName: string;
  role: UserRole;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  joinedAt: Date;
  leftAt?: Date;
  isSpeaking?: boolean;
}

// Chat Types
export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'emoji' | 'system';
}

// Whiteboard Types
export interface WhiteboardState {
  id: string;
  sessionId: string;
  elements: WhiteboardElement[];
  lastUpdated: Date;
  updatedBy: string;
}

export interface WhiteboardElement {
  id: string;
  type: 'pen' | 'text' | 'shape' | 'eraser' | 'laser';
  data: any;
  position: { x: number; y: number };
  style: ElementStyle;
  createdAt: Date;
  createdBy: string;
}

export interface ElementStyle {
  color: string;
  strokeWidth: number;
  fontSize?: number;
  fontFamily?: string;
}

// File Management Types
export interface FileDocument {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'video' | 'presentation';
  url: string;
  size: number;
  classId: string;
  uploadedBy: string;
  uploadedAt: Date;
  isPublic: boolean;
}

// Interaction Types
export interface HandRaise {
  userId: string;
  userName: string;
  timestamp: Date;
  isActive: boolean;
}

export interface Gift {
  id: string;
  type: 'star' | 'trophy' | 'heart' | 'thumbsup';
  fromUserId: string;
  toUserId: string;
  sessionId: string;
  timestamp: Date;
}

export interface Feedback {
  id: string;
  sessionId: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
  timestamp: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Store Types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface ClassState {
  currentClass: ClassRoom | null;
  classes: ClassRoom[];
  isLoading: boolean;
  error: string | null;
}

export interface VideoCallState {
  session: VideoCallSession | null;
  participants: Participant[];
  localUser: Participant | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export interface WhiteboardTool {
  type: 'pen' | 'text' | 'eraser' | 'laser' | 'ruler' | 'compass';
  color: string;
  size: number;
  isActive: boolean;
}

// Component Props Types
export interface ClassCardProps {
  classroom: ClassRoom;
  onJoin: (classId: string) => void;
  onEdit?: (classId: string) => void;
  onDelete?: (classId: string) => void;
}

export interface VideoPlayerProps {
  participant: Participant;
  isLocal?: boolean;
  isSpeaking?: boolean;
  onToggleVideo?: () => void;
  onToggleAudio?: () => void;
}

export interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentUserId: string;
}

export interface WhiteboardProps {
  sessionId: string;
  canEdit: boolean;
  onToolChange: (tool: WhiteboardTool) => void;
}
