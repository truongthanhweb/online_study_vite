import AgoraRTC, { 
  type IAgoraRTCClient, 
  type ICameraVideoTrack, 
  type IMicrophoneAudioTrack,
  type IRemoteVideoTrack,
  type IRemoteAudioTrack,
  type UID
} from 'agora-rtc-sdk-ng';

// Agora configuration
const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID || 'your-agora-app-id';

export interface AgoraUser {
  uid: UID;
  videoTrack?: IRemoteVideoTrack;
  audioTrack?: IRemoteAudioTrack;
  hasVideo: boolean;
  hasAudio: boolean;
}

export class AgoraService {
  private client: IAgoraRTCClient;
  private localVideoTrack: ICameraVideoTrack | null = null;
  private localAudioTrack: IMicrophoneAudioTrack | null = null;
  private remoteUsers: Map<UID, AgoraUser> = new Map();
  private isJoined = false;

  // Event callbacks
  public onUserJoined?: (user: AgoraUser) => void;
  public onUserLeft?: (uid: UID) => void;
  public onUserPublished?: (user: AgoraUser, mediaType: 'video' | 'audio') => void;
  public onUserUnpublished?: (uid: UID, mediaType: 'video' | 'audio') => void;
  public onConnectionStateChanged?: (state: string) => void;
  public onError?: (error: any) => void;

  constructor() {
    // Create Agora client
    this.client = AgoraRTC.createClient({ 
      mode: 'rtc', 
      codec: 'vp8' 
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    // User joined
    this.client.on('user-joined', (user) => {
      console.log('User joined:', user.uid);
      const agoraUser: AgoraUser = {
        uid: user.uid,
        hasVideo: false,
        hasAudio: false
      };
      this.remoteUsers.set(user.uid, agoraUser);
      this.onUserJoined?.(agoraUser);
    });

    // User left
    this.client.on('user-left', (user) => {
      console.log('User left:', user.uid);
      this.remoteUsers.delete(user.uid);
      this.onUserLeft?.(user.uid);
    });

    // User published
    this.client.on('user-published', async (user, mediaType) => {
      console.log('User published:', user.uid, mediaType);
      
      // Subscribe to the remote user
      await this.client.subscribe(user, mediaType);
      
      const existingUser = this.remoteUsers.get(user.uid);
      if (existingUser) {
        if (mediaType === 'video') {
          existingUser.videoTrack = user.videoTrack;
          existingUser.hasVideo = true;
        } else if (mediaType === 'audio') {
          existingUser.audioTrack = user.audioTrack;
          existingUser.hasAudio = true;
          // Play audio track
          user.audioTrack?.play();
        }
        if (mediaType !== 'datachannel') {
          this.onUserPublished?.(existingUser, mediaType);
        }
      }
    });

    // User unpublished
    this.client.on('user-unpublished', (user, mediaType) => {
      console.log('User unpublished:', user.uid, mediaType);
      
      const existingUser = this.remoteUsers.get(user.uid);
      if (existingUser) {
        if (mediaType === 'video') {
          existingUser.videoTrack = undefined;
          existingUser.hasVideo = false;
        } else if (mediaType === 'audio') {
          existingUser.audioTrack = undefined;
          existingUser.hasAudio = false;
        }
        if (mediaType !== 'datachannel') {
          this.onUserUnpublished?.(user.uid, mediaType);
        }
      }
    });

    // Connection state changed
    this.client.on('connection-state-change', (state) => {
      console.log('Connection state changed:', state);
      this.onConnectionStateChanged?.(state);
    });

    // Error handling
    this.client.on('exception', (error) => {
      console.error('Agora exception:', error);
      this.onError?.(error);
    });
  }

  // Join channel
  async joinChannel(channelName: string, token: string | null, uid: UID): Promise<void> {
    try {
      if (this.isJoined) {
        throw new Error('Already joined a channel');
      }

      // Join the channel
      await this.client.join(AGORA_APP_ID, channelName, token, uid);
      this.isJoined = true;
      
      console.log('Successfully joined channel:', channelName);
    } catch (error) {
      console.error('Failed to join channel:', error);
      throw error;
    }
  }

  // Leave channel
  async leaveChannel(): Promise<void> {
    try {
      if (!this.isJoined) {
        return;
      }

      // Stop local tracks
      await this.stopLocalVideo();
      await this.stopLocalAudio();

      // Leave the channel
      await this.client.leave();
      this.isJoined = false;
      this.remoteUsers.clear();
      
      console.log('Successfully left channel');
    } catch (error) {
      console.error('Failed to leave channel:', error);
      throw error;
    }
  }

  // Start local video
  async startLocalVideo(): Promise<ICameraVideoTrack> {
    try {
      if (this.localVideoTrack) {
        return this.localVideoTrack;
      }

      this.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: {
          width: 1280,
          height: 720,
          frameRate: 30,
          bitrateMax: 1000,
          bitrateMin: 300
        }
      });

      // Publish video track if joined
      if (this.isJoined) {
        await this.client.publish(this.localVideoTrack);
      }

      return this.localVideoTrack;
    } catch (error) {
      console.error('Failed to start local video:', error);
      throw error;
    }
  }

  // Stop local video
  async stopLocalVideo(): Promise<void> {
    try {
      if (this.localVideoTrack) {
        // Unpublish if joined
        if (this.isJoined) {
          await this.client.unpublish(this.localVideoTrack);
        }
        
        this.localVideoTrack.stop();
        this.localVideoTrack.close();
        this.localVideoTrack = null;
      }
    } catch (error) {
      console.error('Failed to stop local video:', error);
      throw error;
    }
  }

  // Start local audio
  async startLocalAudio(): Promise<IMicrophoneAudioTrack> {
    try {
      if (this.localAudioTrack) {
        return this.localAudioTrack;
      }

      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: {
          sampleRate: 48000,
          stereo: true,
          bitrate: 128
        }
      });

      // Publish audio track if joined
      if (this.isJoined) {
        await this.client.publish(this.localAudioTrack);
      }

      return this.localAudioTrack;
    } catch (error) {
      console.error('Failed to start local audio:', error);
      throw error;
    }
  }

  // Stop local audio
  async stopLocalAudio(): Promise<void> {
    try {
      if (this.localAudioTrack) {
        // Unpublish if joined
        if (this.isJoined) {
          await this.client.unpublish(this.localAudioTrack);
        }
        
        this.localAudioTrack.stop();
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }
    } catch (error) {
      console.error('Failed to stop local audio:', error);
      throw error;
    }
  }

  // Toggle local video
  async toggleLocalVideo(): Promise<boolean> {
    try {
      if (this.localVideoTrack) {
        await this.stopLocalVideo();
        return false;
      } else {
        await this.startLocalVideo();
        return true;
      }
    } catch (error) {
      console.error('Failed to toggle local video:', error);
      throw error;
    }
  }

  // Toggle local audio
  async toggleLocalAudio(): Promise<boolean> {
    try {
      if (this.localAudioTrack) {
        await this.stopLocalAudio();
        return false;
      } else {
        await this.startLocalAudio();
        return true;
      }
    } catch (error) {
      console.error('Failed to toggle local audio:', error);
      throw error;
    }
  }

  // Start screen sharing
  async startScreenShare(): Promise<void> {
    try {
      const screenTrack = await AgoraRTC.createScreenVideoTrack({
        encoderConfig: {
          width: 1920,
          height: 1080,
          frameRate: 15,
          bitrateMax: 2000,
          bitrateMin: 500
        }
      });

      // Replace video track with screen track
      if (this.localVideoTrack && this.isJoined) {
        await this.client.unpublish(this.localVideoTrack);
      }

      if (this.isJoined) {
        await this.client.publish(screenTrack);
      }

      // Handle screen share ended
      if (Array.isArray(screenTrack)) {
        screenTrack[0].on('track-ended', async () => {
          await this.stopScreenShare();
        });
      } else {
        screenTrack.on('track-ended', async () => {
          await this.stopScreenShare();
        });
      }

    } catch (error) {
      console.error('Failed to start screen share:', error);
      throw error;
    }
  }

  // Stop screen sharing
  async stopScreenShare(): Promise<void> {
    try {
      // Resume camera video
      if (!this.localVideoTrack) {
        await this.startLocalVideo();
      }
    } catch (error) {
      console.error('Failed to stop screen share:', error);
      throw error;
    }
  }

  // Get local tracks
  getLocalTracks() {
    return {
      videoTrack: this.localVideoTrack,
      audioTrack: this.localAudioTrack
    };
  }

  // Get remote users
  getRemoteUsers(): AgoraUser[] {
    return Array.from(this.remoteUsers.values());
  }

  // Get connection state
  getConnectionState() {
    return this.client.connectionState;
  }

  // Check if joined
  isChannelJoined(): boolean {
    return this.isJoined;
  }

  // Cleanup
  async cleanup(): Promise<void> {
    try {
      await this.leaveChannel();
      this.remoteUsers.clear();
    } catch (error) {
      console.error('Failed to cleanup Agora service:', error);
    }
  }
}

// Create singleton instance
export const agoraService = new AgoraService();
