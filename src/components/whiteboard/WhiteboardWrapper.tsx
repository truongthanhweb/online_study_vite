import React from 'react';
import { WhiteboardPage } from '../../pages/WhiteboardPage';
import { useAuthStore } from '../../store/authStore';

interface WhiteboardWrapperProps {
  userRole?: 'admin' | 'teacher' | 'student';
}

const WhiteboardWrapper: React.FC<WhiteboardWrapperProps> = ({ userRole }) => {
  const { user } = useAuthStore();
  
  // Use provided role or fallback to user's role
  const effectiveRole = userRole || user?.role || 'student';
  
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <WhiteboardPage />
    </div>
  );
};

export default WhiteboardWrapper;
