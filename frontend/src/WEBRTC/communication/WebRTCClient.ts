/* eslint-disable @typescript-eslint/no-explicit-any */
import { WebRTCSignalingClient } from './signaling';
import { WebRTCPeerConnectionManager } from './peerConnection';
import { WebRTCMediaManager } from './mediaManager';
import { WebRTCScreenShareManager } from './screenShareManager';
import type { SignalingRole } from '../types/communication';
import { CallConnectionState } from '../types/communication';

export interface WebRTCClientEvents {
  onLocalStream: (stream: MediaStream) => void;
  onRemoteStream: (stream: MediaStream) => void;
  onConnectionStateChange: (state: CallConnectionState) => void;
  onDataMessage: (data: any) => void;
  onRemoteLeave: () => void;
  onScreenShareChange: (active: boolean) => void;
}

export class WebRTCClient {
  private signaling: WebRTCSignalingClient | null = null;
  private peerConnection: WebRTCPeerConnectionManager | null = null;
  private mediaManager: WebRTCMediaManager;
  private screenManager: WebRTCScreenShareManager;
  private events: WebRTCClientEvents;
  private micActive: boolean = true;
  private cameraActive: boolean = true;
  private isCreator: boolean = false;
  private roomId: string = '';

  constructor(events: WebRTCClientEvents) {
    this.events = events;
    this.mediaManager = new WebRTCMediaManager();
    this.screenManager = new WebRTCScreenShareManager();
  }

  public async start(
    roomId: string,
    role: SignalingRole,
    isCreator: boolean,
    initialVideo: boolean = true,
    initialAudio: boolean = true
  ): Promise<void> {
    this.roomId = roomId.trim().toUpperCase();
    this.isCreator = isCreator;
    this.cameraActive = initialVideo;
    this.micActive = initialAudio;

    this.events.onConnectionStateChange(CallConnectionState.Connecting);

    // 1. Capture local media
    const localStream = await this.mediaManager.initializeMedia(initialVideo, initialAudio);
    if (localStream) {
      this.events.onLocalStream(localStream);
    }

    // 2. Connect signaling
    this.signaling = new WebRTCSignalingClient(this.roomId, role);

    // 3. Create peer connection manager
    this.peerConnection = new WebRTCPeerConnectionManager(this.signaling, this.isCreator, {
      onRemoteStream: (stream) => {
        this.events.onRemoteStream(stream);
        this.events.onConnectionStateChange(CallConnectionState.Connected);
      },
      onConnectionStateChange: (state) => {
        if (state === 'connected') {
          this.events.onConnectionStateChange(CallConnectionState.Connected);
        } else if (state === 'connecting') {
          this.events.onConnectionStateChange(CallConnectionState.Connecting);
        } else if (state === 'disconnected' || state === 'failed') {
          this.events.onConnectionStateChange(CallConnectionState.Disconnected);
        }
      },
      onDataChannelMessage: (msg) => {
        this.events.onDataMessage(msg);
      },
    });

    this.peerConnection.initialize(localStream);

    // 4. Wire signaling message handlers
    this.signaling.onMessage(async (msg) => {
      if (msg.type === 'peer-joined') {
        console.log('[WEBRTC] Peer joined room. Initiator:', msg.initiator);
        if (msg.initiator && this.peerConnection) {
          await this.peerConnection.makeOffer();
        }
      } else if (msg.type === 'peer-left') {
        console.log('[WEBRTC] Remote peer left room');
        this.events.onRemoteLeave();
      } else if (msg.type === 'signal' && msg.data) {
        if (msg.data.type === 'offer' && msg.data.sdp && this.peerConnection) {
          await this.peerConnection.handleSignalOffer(msg.data.sdp);
        } else if (msg.data.type === 'answer' && msg.data.sdp && this.peerConnection) {
          await this.peerConnection.handleSignalAnswer(msg.data.sdp);
        } else if (msg.data.type === 'candidate' && msg.data.candidate && this.peerConnection) {
          await this.peerConnection.handleSignalCandidate(msg.data.candidate);
        }
      } else if (msg.type === 'app-message' && msg.payload) {
        this.events.onDataMessage(msg.payload);
      }
    });

    await this.signaling.connect();
  }

  public async toggleMic(): Promise<boolean> {
    this.micActive = !this.micActive;
    this.mediaManager.setAudioEnabled(this.micActive);
    return this.micActive;
  }

  public async toggleCamera(): Promise<boolean> {
    this.cameraActive = !this.cameraActive;
    this.mediaManager.setVideoEnabled(this.cameraActive);
    return this.cameraActive;
  }

  public async toggleScreenShare(): Promise<boolean> {
    if (!this.screenManager.isSharing) {
      const screen = await this.screenManager.startScreenShare(() => {
        // Callback when screen sharing is ended via browser UI
        this.events.onScreenShareChange(false);
        const cameraTrack = this.mediaManager.stream?.getVideoTracks()[0] || null;
        this.peerConnection?.replaceVideoTrack(cameraTrack);
      });

      if (screen) {
        await this.peerConnection?.replaceVideoTrack(screen.videoTrack);
        this.events.onScreenShareChange(true);
        return true;
      }
      return false;
    } else {
      this.screenManager.stopScreenShare();
      this.events.onScreenShareChange(false);
      const cameraTrack = this.mediaManager.stream?.getVideoTracks()[0] || null;
      await this.peerConnection?.replaceVideoTrack(cameraTrack);
      return false;
    }
  }

  public async switchAudioDevice(deviceId: string) {
    const newTrack = await this.mediaManager.switchAudioDevice(deviceId);
    if (newTrack) {
      await this.peerConnection?.replaceAudioTrack(newTrack);
    }
  }

  public async switchVideoDevice(deviceId: string) {
    const newTrack = await this.mediaManager.switchVideoDevice(deviceId);
    if (newTrack) {
      await this.peerConnection?.replaceVideoTrack(newTrack);
      if (this.mediaManager.stream) {
        this.events.onLocalStream(new MediaStream(this.mediaManager.stream.getTracks()));
      }
    }
  }

  public sendData(payload: Record<string, any>) {
    const sent = this.peerConnection?.sendData(payload);
    if (!sent && this.signaling) {
      this.signaling.sendAppMessage(payload);
    }
  }

  public getDevices() {
    return this.mediaManager.devices;
  }

  public close() {
    this.screenManager.stopScreenShare();
    this.mediaManager.stopAll();
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    if (this.signaling) {
      this.signaling.close();
      this.signaling = null;
    }
  }
}
