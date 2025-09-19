// Jitsi Meet Service - Hoàn toàn miễn phí
export interface JitsiMeetConfig {
  roomName: string;
  width?: string | number;
  height?: string | number;
  parentNode?: HTMLElement;
  configOverwrite?: any;
  interfaceConfigOverwrite?: any;
  userInfo?: {
    displayName?: string;
    email?: string;
  };
}

export interface JitsiMeetAPI {
  executeCommand: (command: string, ...args: any[]) => void;
  addEventListeners: (listeners: any) => void;
  removeEventListeners: (listeners: any) => void;
  dispose: () => void;
  getNumberOfParticipants: () => number;
  isAudioMuted: () => Promise<boolean>;
  isVideoMuted: () => Promise<boolean>;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleShareScreen: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

class JitsiService {
  private api: JitsiMeetAPI | null = null;
  private domain: string;
  private roomPrefix: string;

  // Event callbacks
  public onParticipantJoined?: (participant: any) => void;
  public onParticipantLeft?: (participant: any) => void;
  public onVideoConferenceJoined?: (participant: any) => void;
  public onVideoConferenceLeft?: () => void;
  public onAudioMuteStatusChanged?: (muted: boolean) => void;
  public onVideoMuteStatusChanged?: (muted: boolean) => void;

  constructor() {
    this.domain = import.meta.env.VITE_JITSI_DOMAIN || 'meet.jit.si';
    this.roomPrefix = import.meta.env.VITE_JITSI_ROOM_PREFIX || 'educonnect';
  }

  /**
   * Load Jitsi Meet External API script
   */
  private loadJitsiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.JitsiMeetExternalAPI) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://${this.domain}/external_api.js`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Jitsi Meet API'));
      document.head.appendChild(script);
    });
  }

  /**
   * Join a Jitsi Meet room
   */
  async joinRoom(config: JitsiMeetConfig): Promise<void> {
    try {
      await this.loadJitsiScript();

      const roomName = `${this.roomPrefix}-${config.roomName}`;
      
      const options = {
        roomName,
        width: config.width || '100%',
        height: config.height || '100%',
        parentNode: config.parentNode || document.querySelector('#jitsi-container'),
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          enableWelcomePage: false,
          enableClosePage: false,
          prejoinPageEnabled: false,
          disableInviteFunctions: true,
          doNotStoreRoom: true,
          ...config.configOverwrite,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone',
            'camera',
            'closedcaptions',
            'desktop',
            'fullscreen',
            'fodeviceselection',
            'hangup',
            'profile',
            'chat',
            'recording',
            'livestreaming',
            'etherpad',
            'sharedvideo',
            'settings',
            'raisehand',
            'videoquality',
            'filmstrip',
            'invite',
            'feedback',
            'stats',
            'shortcuts',
            'tileview',
            'videobackgroundblur',
            'download',
            'help',
            'mute-everyone',
            'security'
          ],
          SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          BRAND_WATERMARK_LINK: '',
          SHOW_POWERED_BY: false,
          ...config.interfaceConfigOverwrite,
        },
        userInfo: config.userInfo || {},
      };

      this.api = new window.JitsiMeetExternalAPI(this.domain, options);
      this.setupEventListeners();

    } catch (error) {
      console.error('Failed to join Jitsi room:', error);
      throw error;
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.api) return;

    const eventListeners = {
      participantJoined: (participant: any) => {
        console.log('Participant joined:', participant);
        this.onParticipantJoined?.(participant);
      },
      
      participantLeft: (participant: any) => {
        console.log('Participant left:', participant);
        this.onParticipantLeft?.(participant);
      },
      
      videoConferenceJoined: (participant: any) => {
        console.log('Local participant joined:', participant);
        this.onVideoConferenceJoined?.(participant);
      },
      
      videoConferenceLeft: () => {
        console.log('Local participant left');
        this.onVideoConferenceLeft?.();
      },
      
      audioMuteStatusChanged: (event: any) => {
        console.log('Audio mute status changed:', event.muted);
        this.onAudioMuteStatusChanged?.(event.muted);
      },
      
      videoMuteStatusChanged: (event: any) => {
        console.log('Video mute status changed:', event.muted);
        this.onVideoMuteStatusChanged?.(event.muted);
      },
    };

    this.api.addEventListeners(eventListeners);
  }

  /**
   * Toggle audio mute/unmute
   */
  async toggleAudio(): Promise<boolean> {
    if (!this.api) throw new Error('Jitsi API not initialized');
    
    const isMuted = await this.api.isAudioMuted();
    this.api.toggleAudio();
    return !isMuted;
  }

  /**
   * Toggle video mute/unmute
   */
  async toggleVideo(): Promise<boolean> {
    if (!this.api) throw new Error('Jitsi API not initialized');
    
    const isMuted = await this.api.isVideoMuted();
    this.api.toggleVideo();
    return !isMuted;
  }

  /**
   * Toggle screen sharing
   */
  toggleScreenShare(): void {
    if (!this.api) throw new Error('Jitsi API not initialized');
    this.api.toggleShareScreen();
  }

  /**
   * Send chat message
   */
  sendChatMessage(message: string): void {
    if (!this.api) throw new Error('Jitsi API not initialized');
    this.api.executeCommand('sendChatMessage', message);
  }

  /**
   * Set display name
   */
  setDisplayName(name: string): void {
    if (!this.api) throw new Error('Jitsi API not initialized');
    this.api.executeCommand('displayName', name);
  }

  /**
   * Raise/lower hand
   */
  toggleRaiseHand(): void {
    if (!this.api) throw new Error('Jitsi API not initialized');
    this.api.executeCommand('toggleRaiseHand');
  }

  /**
   * Get number of participants
   */
  getParticipantCount(): number {
    if (!this.api) return 0;
    return this.api.getNumberOfParticipants();
  }

  /**
   * Leave room and cleanup
   */
  leaveRoom(): void {
    if (this.api) {
      this.api.dispose();
      this.api = null;
    }
  }

  /**
   * Check if API is ready
   */
  isReady(): boolean {
    return this.api !== null;
  }
}

// Export singleton instance
export const jitsiService = new JitsiService();
