/* eslint-disable @typescript-eslint/no-explicit-any */
import type { WebRTCSignalingClient } from './signaling';

export const DEFAULT_ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:global.stun.twilio.com:3478' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelay',
      credential: 'openrelay',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelay',
      credential: 'openrelay',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelay',
      credential: 'openrelay',
    },
    {
      urls: 'turns:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelay',
      credential: 'openrelay',
    },
    {
      urls: 'turns:openrelay.metered.ca:443',
      username: 'openrelay',
      credential: 'openrelay',
    },
  ],
  iceCandidatePoolSize: 10,
};

export interface PeerConnectionCallbacks {
  onRemoteStream: (stream: MediaStream) => void;
  onRemoteTrackUnmuted?: (track: MediaStreamTrack) => void;
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
  onDataChannelMessage: (data: any) => void;
  onRemoteLeave?: () => void;
}

export class WebRTCPeerConnectionManager {
  private pc: RTCPeerConnection | null = null;
  private signaling: WebRTCSignalingClient;
  private isPolite: boolean;
  private callbacks: PeerConnectionCallbacks;
  private dataChannel: RTCDataChannel | null = null;
  private pendingCandidates: RTCIceCandidateInit[] = [];
  private makingOffer: boolean = false;
  private remoteStream: MediaStream = new MediaStream();

  constructor(
    signaling: WebRTCSignalingClient,
    isCreator: boolean,
    callbacks: PeerConnectionCallbacks
  ) {
    this.signaling = signaling;
    this.isPolite = !isCreator; // Guest is polite, Host is impolite
    this.callbacks = callbacks;
  }

  public initialize(localStream: MediaStream | null): RTCPeerConnection {
    if (this.pc) return this.pc;

    this.pc = new RTCPeerConnection(DEFAULT_ICE_SERVERS);

    // Attach local stream tracks or add transceivers
    if (localStream) {
      this.attachLocalTracks(localStream);
    } else {
      this.setupTransceivers();
    }

    // ICE Candidate generation
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.signaling.sendSignal({
          type: 'candidate',
          candidate: event.candidate.toJSON(),
        });
      }
    };

    // Robust Remote Track Handling
    this.pc.ontrack = (event) => {
      const track = event.track;
      console.log(`[WEBRTC] Remote track received: kind=${track.kind}, id=${track.id}, readyState=${track.readyState}, streams=${event.streams?.length || 0}`);

      // 1. Add all tracks from event.streams[0] if present
      if (event.streams && event.streams[0]) {
        event.streams[0].getTracks().forEach((t) => {
          if (!this.remoteStream.getTracks().some((existing) => existing.id === t.id)) {
            this.remoteStream.addTrack(t);
          }
        });
      }

      // 2. Add individual track if not already in remoteStream
      if (track && !this.remoteStream.getTracks().some((existing) => existing.id === track.id)) {
        this.remoteStream.addTrack(track);
      }

      // 3. Dispatch unified MediaStream
      this.callbacks.onRemoteStream(this.remoteStream);

      track.onunmute = () => {
        console.log(`[WEBRTC] Remote track onunmute: kind=${track.kind}, id=${track.id}`);
        this.callbacks.onRemoteStream(this.remoteStream);
        if (this.callbacks.onRemoteTrackUnmuted) {
          this.callbacks.onRemoteTrackUnmuted(track);
        }
      };

      track.onmute = () => {
        console.log(`[WEBRTC] Remote track onmute: kind=${track.kind}, id=${track.id}`);
        this.callbacks.onRemoteStream(this.remoteStream);
      };

      track.onended = () => {
        console.log(`[WEBRTC] Remote track onended: kind=${track.kind}, id=${track.id}`);
        this.remoteStream.removeTrack(track);
        this.callbacks.onRemoteStream(this.remoteStream);
      };
    };

    // Incoming DataChannel (guest side)
    this.pc.ondatachannel = (event) => {
      console.log('[WEBRTC] Inbound DataChannel established');
      this.dataChannel = event.channel;
      this.wireDataChannel(event.channel);
    };

    // Connection state listeners
    this.pc.onconnectionstatechange = () => {
      if (this.pc) {
        console.log('[WEBRTC] PeerConnection state:', this.pc.connectionState);
        this.callbacks.onConnectionStateChange(this.pc.connectionState);
      }
    };

    this.pc.oniceconnectionstatechange = () => {
      if (this.pc) {
        console.log('[WEBRTC] ICE connection state:', this.pc.iceConnectionState);
      }
    };

    // Negotiation needed handler
    this.pc.onnegotiationneeded = async () => {
      console.log('[WEBRTC] onnegotiationneeded triggered');
      if (this.signaling.isOpen && this.pc?.signalingState === 'stable') {
        await this.makeOffer();
      }
    };

    return this.pc;
  }

  public setupTransceivers() {
    if (!this.pc) return;
    try {
      const transceivers = this.pc.getTransceivers();
      const hasAudio = transceivers.some((t) => t.receiver.track.kind === 'audio');
      const hasVideo = transceivers.some((t) => t.receiver.track.kind === 'video');

      if (!hasAudio) {
        this.pc.addTransceiver('audio', { direction: 'sendrecv' });
      }
      if (!hasVideo) {
        this.pc.addTransceiver('video', { direction: 'sendrecv' });
      }
    } catch (e) {
      console.warn('[WEBRTC] Transceiver setup warning:', e);
    }
  }

  public attachLocalTracks(stream: MediaStream) {
    if (!this.pc) return;

    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];
    const senders = this.pc.getSenders();

    const audioSender = senders.find((s) => s.track?.kind === 'audio');
    const videoSender = senders.find((s) => s.track?.kind === 'video');

    if (audioTrack) {
      if (audioSender) {
        audioSender.replaceTrack(audioTrack).catch(console.warn);
      } else {
        try {
          this.pc.addTrack(audioTrack, stream);
        } catch {
          this.pc.addTransceiver(audioTrack, { direction: 'sendrecv', streams: [stream] });
        }
      }
    }

    if (videoTrack) {
      if (videoSender) {
        videoSender.replaceTrack(videoTrack).catch(console.warn);
      } else {
        try {
          this.pc.addTrack(videoTrack, stream);
        } catch {
          this.pc.addTransceiver(videoTrack, { direction: 'sendrecv', streams: [stream] });
        }
      }
    }

    this.setupTransceivers();
  }

  public async replaceVideoTrack(track: MediaStreamTrack | null) {
    if (!this.pc) return;
    const senders = this.pc.getSenders();
    const videoSender = senders.find((s) => s.track?.kind === 'video') ||
                        this.pc.getTransceivers().find((t) => t.receiver.track.kind === 'video')?.sender;
    if (videoSender) {
      await videoSender.replaceTrack(track);
    }
  }

  public async replaceAudioTrack(track: MediaStreamTrack | null) {
    if (!this.pc) return;
    const senders = this.pc.getSenders();
    const audioSender = senders.find((s) => s.track?.kind === 'audio') ||
                        this.pc.getTransceivers().find((t) => t.receiver.track.kind === 'audio')?.sender;
    if (audioSender) {
      await audioSender.replaceTrack(track);
    }
  }

  public async makeOffer() {
    if (!this.pc) return;
    try {
      this.makingOffer = true;

      // Create DataChannel if host and not already open
      if (!this.dataChannel || this.dataChannel.readyState === 'closed') {
        const dc = this.pc.createDataChannel('main');
        this.dataChannel = dc;
        this.wireDataChannel(dc);
      }

      const offer = await this.pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      if (this.pc.signalingState !== 'stable') return;
      await this.pc.setLocalDescription(offer);

      this.signaling.sendSignal({
        type: 'offer',
        sdp: offer,
      });
      console.log('[WEBRTC] Sent SDP offer');
    } catch (err) {
      console.error('[WEBRTC] Error making offer:', err);
    } finally {
      this.makingOffer = false;
    }
  }

  public async handleSignalOffer(sdp: RTCSessionDescriptionInit) {
    if (!this.pc) return;
    try {
      const offerCollision = this.makingOffer || this.pc.signalingState !== 'stable';
      if (offerCollision && !this.isPolite) {
        console.log('[WEBRTC] Impolite peer ignoring colliding offer');
        return;
      }
      if (offerCollision) {
        console.log('[WEBRTC] Polite peer rolling back colliding offer');
        await this.pc.setLocalDescription({ type: 'rollback' } as any).catch(console.warn);
      }

      await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
      await this.drainPendingCandidates();

      const answer = await this.pc.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await this.pc.setLocalDescription(answer);

      this.signaling.sendSignal({
        type: 'answer',
        sdp: answer,
      });
      console.log('[WEBRTC] Sent SDP answer');
    } catch (err) {
      console.error('[WEBRTC] Error handling offer:', err);
    }
  }

  public async handleSignalAnswer(sdp: RTCSessionDescriptionInit) {
    if (!this.pc) return;
    try {
      console.log('[WEBRTC] Received SDP answer');
      await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
      await this.drainPendingCandidates();
    } catch (err) {
      console.error('[WEBRTC] Error handling answer:', err);
    }
  }

  public async handleSignalCandidate(candidate: RTCIceCandidateInit) {
    if (!this.pc) return;
    try {
      if (this.pc.remoteDescription && this.pc.remoteDescription.type) {
        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        this.pendingCandidates.push(candidate);
      }
    } catch (err) {
      console.warn('[WEBRTC] Error adding ICE candidate:', err);
    }
  }

  private async drainPendingCandidates() {
    if (!this.pc) return;
    while (this.pendingCandidates.length > 0) {
      const c = this.pendingCandidates.shift();
      if (c) {
        try {
          await this.pc.addIceCandidate(new RTCIceCandidate(c));
        } catch (e) {
          console.warn('[WEBRTC] Error draining pending ICE candidate:', e);
        }
      }
    }
  }

  private wireDataChannel(dc: RTCDataChannel) {
    dc.onopen = () => console.log('[WEBRTC DataChannel] Open');
    dc.onclose = () => console.log('[WEBRTC DataChannel] Closed');
    dc.onerror = (err) => console.warn('[WEBRTC DataChannel] Error:', err);
    dc.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        this.callbacks.onDataChannelMessage(parsed);
      } catch (err) {
        console.error('[WEBRTC DataChannel] Message parse error:', err);
      }
    };
  }

  public sendData(payload: Record<string, any>): boolean {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      try {
        this.dataChannel.send(JSON.stringify(payload));
        return true;
      } catch (e) {
        console.warn('[WEBRTC DataChannel] Send failure:', e);
      }
    }
    return false;
  }

  public close() {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    this.remoteStream.getTracks().forEach((t) => t.stop());
    this.remoteStream = new MediaStream();
    this.pendingCandidates = [];
  }
}
