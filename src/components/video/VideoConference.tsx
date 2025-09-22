import React, { useEffect, useRef, useState } from 'react';
import { Users } from 'lucide-react';

interface VideoConferenceProps {
  roomName: string;
  userName: string;
  userRole: 'admin' | 'teacher' | 'student';
  onLeave?: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
    jitsiAPI: any;
  }
}

const VideoConference: React.FC<VideoConferenceProps> = ({ 
  roomName, 
  userName, 
  userRole,
  onLeave 
}) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  // Removed custom controls state since Jitsi has its own toolbar

  useEffect(() => {
    loadJitsiMeet();
    
    return () => {
      // Cleanup when component unmounts
      if (window.jitsiAPI) {
        window.jitsiAPI.dispose();
        window.jitsiAPI = null;
      }
    };
  }, []);

  const loadJitsiMeet = () => {
    // Check if script is already loaded
    if (window.JitsiMeetExternalAPI) {
      initializeJitsi();
      return;
    }

    const script = document.createElement('script');
    // Use your self-hosted Jitsi server
    script.src = 'https://sr-pacific.vn/external_api.js';
    script.async = true;
    script.onload = () => {
      initializeJitsi();
    };
    script.onerror = () => {
      console.error('Failed to load Jitsi Meet API');
      // Fallback to public server if your server fails
      const fallbackScript = document.createElement('script');
      fallbackScript.src = 'https://meet.jit.si/external_api.js';
      fallbackScript.async = true;
      fallbackScript.onload = () => {
        initializeJitsi('meet.jit.si');
      };
      document.head.appendChild(fallbackScript);
    };
    document.head.appendChild(script);
  };

  const initializeJitsi = (domain = 'sr-pacific.vn') => {
    if (!jitsiContainerRef.current) return;

    const options = {
      roomName: `online-study-${roomName}`,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      configOverwrite: {
        startWithAudioMuted: userRole === 'student', // Students start muted
        startWithVideoMuted: false,
        enableWelcomePage: false,
        enableClosePage: false,
        prejoinPageEnabled: false,
        disableModeratorIndicator: false,
        disableProfile: true,
        hideConferenceTimer: false,
        hideParticipantsStats: false,
        disableThirdPartyRequests: true,
        disableLocalVideoFlip: false,
        backgroundAlpha: 0.5,
        // Enable features based on role
        enableUserRolesBasedOnToken: true,
        enableInsecureRoomNameWarning: false,
        enableLipSync: false
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: userRole === 'student' ? [
          'microphone', 'camera', 'hangup', 'chat', 'raisehand'
        ] : [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
          'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
        ],
        SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        BRAND_WATERMARK_LINK: '',
        SHOW_POWERED_BY: false,
        SHOW_PROMOTIONAL_CLOSE_PAGE: false,
        SHOW_CHROME_EXTENSION_BANNER: false,
        MOBILE_APP_PROMO: false,
        NATIVE_APP_NAME: 'Online Study System',
        PROVIDER_NAME: 'Online Study',
        LANG_DETECTION: true,
        CONNECTION_INDICATOR_AUTO_HIDE_ENABLED: true,
        CONNECTION_INDICATOR_AUTO_HIDE_TIMEOUT: 5000,
        CONNECTION_INDICATOR_DISABLED: false,
        VIDEO_LAYOUT_FIT: 'both',
        filmStripOnly: false,
        VERTICAL_FILMSTRIP: true
      },
      userInfo: {
        displayName: userName,
        email: `${userName.toLowerCase().replace(/\s+/g, '')}@school.edu.vn`
      }
    };

    try {
      window.jitsiAPI = new window.JitsiMeetExternalAPI(domain, options);

      // Event listeners
      window.jitsiAPI.addEventListener('videoConferenceJoined', () => {
        console.log('Video conference joined');
        setIsJitsiLoaded(true);
        
        // Set moderator for admin/teacher
        if (userRole === 'admin' || userRole === 'teacher') {
          window.jitsiAPI.executeCommand('toggleLobby', false);
        }
      });

      window.jitsiAPI.addEventListener('participantJoined', (participant: any) => {
        console.log('Participant joined:', participant);
      });

      window.jitsiAPI.addEventListener('participantLeft', (participant: any) => {
        console.log('Participant left:', participant);
      });

      window.jitsiAPI.addEventListener('videoConferenceLeft', (data: any) => {
        setParticipantCount(data.participantCount || 1);
      });

      // Removed custom event listeners since we use Jitsi's built-in controls

      window.jitsiAPI.addEventListener('readyToClose', () => {
        console.log('Jitsi ready to close');
        if (onLeave) {
          onLeave();
        }
      });

    } catch (error) {
      console.error('Error initializing Jitsi:', error);
    }
  };

  // Removed custom control functions since Jitsi has built-in toolbar

  const getRoleColor = () => {
    switch (userRole) {
      case 'admin': return '#dc2626';
      case 'teacher': return '#2563eb';
      case 'student': return '#059669';
      default: return '#6b7280';
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin': return '👨‍💼';
      case 'teacher': return '👨‍🏫';
      case 'student': return '👨‍🎓';
      default: return '👤';
    }
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative',
      backgroundColor: '#1f2937',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: getRoleColor(),
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '500',
            color: 'white'
          }}>
            <span>{getRoleIcon()}</span>
            <span>{userName}</span>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'white',
            fontSize: '14px'
          }}>
            <Users size={16} />
            <span>{participantCount}</span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: 'white',
          fontSize: '12px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isJitsiLoaded ? '#10b981' : '#f59e0b'
          }} />
          <span>{isJitsiLoaded ? 'Đã kết nối' : 'Đang kết nối...'}</span>
        </div>
      </div>

      {/* Jitsi Container */}
      <div 
        ref={jitsiContainerRef}
        style={{ 
          width: '100%', 
          height: '100%',
          backgroundColor: '#1f2937'
        }}
      >
        {!isJitsiLoaded && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1f2937',
            color: 'white',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #374151',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                Đang tải Video Conference...
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                Kết nối đến máy chủ Jitsi Meet
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
{{ ... }}
        }
      `}</style>
    </div>
  );
};

export default VideoConference;
