/* eslint-disable @typescript-eslint/no-explicit-any */
export type CallConnectionState = 'connected' | 'connecting' | 'reconnecting' | 'disconnected';

export const CallConnectionState = {
  Connected: 'connected' as const,
  Connecting: 'connecting' as const,
  Reconnecting: 'reconnecting' as const,
  Disconnected: 'disconnected' as const,
};

export type SignalingRole = 'normal' | 'deaf';

export interface WebRTCSignalingMessage {
  type: 'join' | 'joined' | 'peer-joined' | 'peer-left' | 'signal' | 'app-message' | 'ping' | 'pong' | 'leave' | 'room-full' | 'error';
  roomId?: string;
  role?: string;
  fromRole?: string;
  initiator?: boolean;
  peerCount?: number;
  data?: {
    type: 'offer' | 'answer' | 'candidate';
    sdp?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
  };
  payload?: Record<string, any>;
  timestamp?: number;
  error?: string;
}

export interface DataChannelPayload {
  type: 'avatar-sign' | 'ISL_SIGN' | 'transcript' | 'translation' | string;
  sign?: string;
  text?: string;
  english?: string;
  gloss?: string;
  eventId?: string;
  timestamp?: number;
  confidence?: number;
  event?: any;
}
