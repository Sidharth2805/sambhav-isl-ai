/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSession, endSession, startSession } from '../utils/communicationApi';
import type { CommunicationSessionDto } from '../utils/communicationApi';
import type { TranscriptEvent } from '../types/transcript';
import { HearingUserWorkspace, LkConnectionState } from '../components/communication/HearingUserWorkspace';
import { DeafUserWorkspace } from '../components/communication/DeafUserWorkspace';
import { SpeechToTextService } from '../services/SpeechToTextService';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function getSignalingUrl(): string {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  if (import.meta.env.VITE_SIGNALING_URL) {
    return import.meta.env.VITE_SIGNALING_URL;
  }

  const backendHttpUrl =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? 'http://localhost:8080' : 'https://signbridge-backend-k4k5.onrender.com');

  try {
    const parsed = new URL(backendHttpUrl);
    const wsProto = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostWithPort = parsed.port ? `${parsed.hostname}:${parsed.port}` : parsed.host;
    return `${wsProto}//${hostWithPort}/ws/webrtc`;
  } catch {
    const isDev = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDev) {
      return `ws://${window.location.hostname || 'localhost'}:8080/ws/webrtc`;
    }
    return `wss://signbridge-backend-k4k5.onrender.com/ws/webrtc`;
  }
}

export const OnlineSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const incomingSettings = (location.state || {}) as {
    initialVideo?: boolean;
    initialAudio?: boolean;
    initialSpeaker?: number;
    userRole?: 'normal' | 'deaf';
    roomCode?: string;
    isHost?: boolean;
  };

  const initialRoomCode = (
    (incomingSettings.roomCode || sessionId || 'SAMBHAV').trim().toUpperCase()
  );
  const [session, setSession] = useState<CommunicationSessionDto | null>(null);
  const [roomCode, setRoomCode] = useState<string>(initialRoomCode);
  const roomCodeRef = useRef<string>(initialRoomCode);
  roomCodeRef.current = roomCode;

  const isDeafDefault =
    (user as any)?.disabilityType === 'DEAF' ||
    (user as any)?.disabilityType === 'DEAF_MUTE' ||
    (user as any)?.disabilityType === 'MUTE' ||
    user?.accountType === 'ACCESSIBILITY_USER';

  const userRole = (searchParams.get('role') as 'normal' | 'deaf') || incomingSettings.userRole || (isDeafDefault ? 'deaf' : 'normal');
  const userRoleRef = useRef<string>(userRole);
  userRoleRef.current = userRole;

  const isDeafWorkspace = userRole === 'deaf';

  // Call Settings UI State
  const [micState, setMicState] = useState<boolean>(
    incomingSettings.initialAudio !== undefined ? incomingSettings.initialAudio : true
  );
  const [cameraState, setCameraState] = useState<boolean>(
    incomingSettings.initialVideo !== undefined ? incomingSettings.initialVideo : true
  );
  const [screenShareState, setScreenShareState] = useState<boolean>(false);
  const [speakerVolume, setSpeakerVolume] = useState<number>(
    incomingSettings.initialSpeaker !== undefined ? incomingSettings.initialSpeaker : 80
  );

  // Device selectors state
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [speakerDevices, setSpeakerDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeAudioDeviceId, setActiveAudioDeviceId] = useState<string>('');
  const [activeVideoDeviceId, setActiveVideoDeviceId] = useState<string>('');
  const [activeSpeakerDeviceId, setActiveSpeakerDeviceId] = useState<string>('');
  const [showMicDevices, setShowMicDevices] = useState(false);
  const [showCameraDevices, setShowCameraDevices] = useState(false);
  const [showSpeakerDevices, setShowSpeakerDevices] = useState(false);

  // Connection states
  const [connectionState, setConnectionState] = useState<LkConnectionState>(LkConnectionState.Connecting);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [remoteLeftNotice, setRemoteLeftNotice] = useState<boolean>(false);

  // Transcripts and Sequence logs
  const [finalTranscripts, setFinalTranscripts] = useState<TranscriptEvent[]>([]);
  const [interimTranscripts, setInterimTranscripts] = useState<Record<string, string>>({});
  const captionsEndRef = useRef<HTMLDivElement | null>(null);

  // WebRTC Refs & Streams
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteMediaStreamRef = useRef<MediaStream>(new MediaStream());
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const signalWsRef = useRef<WebSocket | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);

  const [localTrackObj, setLocalTrackObj] = useState<any>(null);
  const [remoteTrackObj, setRemoteTrackObj] = useState<any>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  // Avatar animation triggers
  const [avatarTriggerText, setAvatarTriggerText] = useState<string>('');
  const processedEventIdsRef = useRef<Set<string>>(new Set());

  // Fetch Session details from API if available
  useEffect(() => {
    if (!sessionId) return;
    getSession(sessionId, accessToken)
      .then((data) => {
        if (data) {
          setSession(data);
          if (data.roomCode) {
            const upperCode = data.roomCode.toUpperCase();
            setRoomCode(upperCode);
            roomCodeRef.current = upperCode;
          }
          if (data.status === 'CREATED' || data.status === 'WAITING') {
            startSession(data.id || sessionId, accessToken).catch(() => {});
          }
        }
      })
      .catch((e) => {
        console.warn('Session API note:', e);
      });
  }, [sessionId, accessToken]);

  // Enumerate Media Devices
  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices().then((devices) => {
      setAudioDevices(devices.filter((d) => d.kind === 'audioinput'));
      setVideoDevices(devices.filter((d) => d.kind === 'videoinput'));
      setSpeakerDevices(devices.filter((d) => d.kind === 'audiooutput'));
    }).catch(() => {});
  }, []);

  // Sync volume with audio elements
  useEffect(() => {
    document.querySelectorAll('audio').forEach((audio) => {
      audio.volume = speakerVolume / 100;
    });
  }, [speakerVolume]);

  // Attach remote stream to hidden audio element to ensure audio plays
  useEffect(() => {
    if (remoteAudioRef.current && remoteTrackObj) {
      remoteAudioRef.current.srcObject = remoteTrackObj;
      remoteAudioRef.current.play().catch(() => {});
    }
  }, [remoteTrackObj]);

  // Add Transcript Event Helper
  const addTranscriptEvent = useCallback((event: TranscriptEvent) => {
    if (!event || !event.text) return;
    const senderId = event.senderId || 'participant';

    if (event.isFinal) {
      setFinalTranscripts((prev) => {
        if (prev.some((e) => e.id === event.id)) return prev;
        return [...prev, event];
      });
      setInterimTranscripts((prev) => {
        const next = { ...prev };
        delete next[senderId];
        return next;
      });
    } else {
      setInterimTranscripts((prev) => ({
        ...prev,
        [senderId]: event.text,
      }));
    }
  }, []);

  const addTranscriptEventRef = useRef(addTranscriptEvent);
  addTranscriptEventRef.current = addTranscriptEvent;

  // Send Application Data over RTCDataChannel (with WebSocket signaling fallback)
  const sendAppData = useCallback((payload: Record<string, any>) => {
    const raw = JSON.stringify(payload);
    let sent = false;

    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      try {
        dataChannelRef.current.send(raw);
        sent = true;
      } catch (e) {
        console.warn('DataChannel send error:', e);
      }
    }

    // Fallback over WebSocket app-message if DataChannel is not open
    if (!sent && signalWsRef.current && signalWsRef.current.readyState === WebSocket.OPEN) {
      try {
        signalWsRef.current.send(
          JSON.stringify({
            type: 'app-message',
            roomId: roomCodeRef.current,
            fromRole: userRoleRef.current,
            payload: payload,
          })
        );
      } catch (e) {
        console.warn('WS app-message relay error:', e);
      }
    }
  }, []);

  // Send Transcript / Message
  const handleSendTextMessage = useCallback((text: string) => {
    const clean = text.trim();
    if (!clean) return;

    const eventId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const event: TranscriptEvent = {
      id: eventId,
      sessionId: sessionId || roomCodeRef.current,
      senderId: user?.id || user?.email || 'self',
      senderName: (user as any)?.fullName || (user as any)?.name || 'You',
      senderType: isDeafWorkspace ? 'ACCESSIBILITY_USER' : 'COMMON_USER',
      text: clean,
      timestamp: Date.now(),
      isFinal: true,
      confidence: 1.0,
    };

    addTranscriptEventRef.current(event);

    // Broadcast across DataChannel with explicit eventId
    if (isDeafWorkspace) {
      sendAppData({ type: 'ISL_SIGN', sign: clean, text: clean, eventId, timestamp: Date.now(), event });
    } else {
      sendAppData({ type: 'avatar-sign', text: clean, eventId, timestamp: Date.now(), event });
    }
  }, [isDeafWorkspace, sendAppData, sessionId, user]);

  // Live Microphone Audio Recognition (Web Speech STT)
  useEffect(() => {
    const stt = SpeechToTextService.getInstance();
    const mySenderId = user?.id || user?.email || 'me';
    const mySenderName = (user as any)?.fullName || (user as any)?.name || 'You';
    const mySenderType = isDeafWorkspace ? 'ACCESSIBILITY_USER' : 'COMMON_USER';

    if (micState && connectionState === LkConnectionState.Connected) {
      stt.startRecording(
        sessionId || roomCodeRef.current,
        mySenderId,
        mySenderName,
        mySenderType,
        (event: TranscriptEvent) => {
          addTranscriptEventRef.current(event);
          if (event.isFinal && event.text) {
            const eventId = event.id || `stt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
            sendAppData({
              type: isDeafWorkspace ? 'ISL_SIGN' : 'avatar-sign',
              sign: event.text,
              text: event.text,
              eventId,
              timestamp: Date.now(),
              event: event,
            });
          }
        },
        'en-IN'
      );
    } else {
      stt.stopRecording();
      setInterimTranscripts((prev) => {
        const next = { ...prev };
        delete next[mySenderId];
        return next;
      });
    }

    return () => {
      stt.stopRecording();
    };
  }, [micState, connectionState, sessionId, user, isDeafWorkspace, sendAppData]);

  // Wire DataChannel Event Listeners
  const wireDataChannel = useCallback((dc: RTCDataChannel) => {
    dc.onopen = () => {
      console.log('[WebRTC DataChannel] Open');
    };
    dc.onclose = () => {
      console.log('[WebRTC DataChannel] Closed');
    };
    dc.onerror = (err) => {
      console.warn('[WebRTC DataChannel] Error:', err);
    };
    dc.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        const eventId = msg.eventId || msg.event?.id;
        if (eventId) {
          if (processedEventIdsRef.current.has(eventId)) {
            return;
          }
          processedEventIdsRef.current.add(eventId);
          if (processedEventIdsRef.current.size > 200) {
            const firstEntries = Array.from(processedEventIdsRef.current).slice(0, 50);
            firstEntries.forEach((id) => processedEventIdsRef.current.delete(id));
          }
        }

        if (msg.type === 'avatar-sign') {
          if (msg.text) {
            setAvatarTriggerText(msg.text);
          }
          if (msg.event) {
            addTranscriptEventRef.current(msg.event);
          } else if (msg.text) {
            const ev: TranscriptEvent = {
              id: msg.eventId || `av-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              sessionId: sessionId || roomCodeRef.current,
              senderId: 'remote',
              senderName: 'Hearing Participant',
              senderType: 'COMMON_USER',
              text: msg.text,
              timestamp: msg.timestamp || Date.now(),
              isFinal: true,
              confidence: 1.0,
            };
            addTranscriptEventRef.current(ev);
          }
        } else if (msg.type === 'ISL_SIGN' || msg.type === 'translation') {
          const signText = msg.sign || msg.text || '';
          if (!signText.trim()) return;

          if (msg.event) {
            addTranscriptEventRef.current(msg.event);
          } else {
            const ev: TranscriptEvent = {
              id: msg.eventId || `isl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              sessionId: sessionId || roomCodeRef.current,
              senderId: 'remote',
              senderName: 'ISL Sign',
              senderType: 'ACCESSIBILITY_USER',
              text: signText.trim(),
              timestamp: msg.timestamp || Date.now(),
              isFinal: true,
              confidence: msg.confidence || 0.98,
            };
            addTranscriptEventRef.current(ev);
          }
        } else if (msg.type === 'transcript' && msg.event) {
          addTranscriptEventRef.current(msg.event);
        }
      } catch (err) {
        console.error('[WebRTC DataChannel] Parse error:', err);
      }
    };
  }, [sessionId]);

  // Create RTCPeerConnection Instance
  const createPeerConnection = useCallback((): RTCPeerConnection => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    // Send ICE candidates ONLY through WebSocket signaling
    pc.onicecandidate = (event) => {
      if (event.candidate && signalWsRef.current?.readyState === WebSocket.OPEN) {
        signalWsRef.current.send(
          JSON.stringify({
            type: 'signal',
            roomId: roomCodeRef.current,
            data: {
              type: 'candidate',
              candidate: event.candidate,
            },
          })
        );
      }
    };

    // Receive Remote Media Stream
    pc.ontrack = (event) => {
      console.log('[WebRTC] Remote track received:', event.track.kind);
      if (!remoteMediaStreamRef.current) {
        remoteMediaStreamRef.current = new MediaStream();
      }
      if (event.streams && event.streams[0]) {
        event.streams[0].getTracks().forEach((track) => {
          if (!remoteMediaStreamRef.current.getTracks().some((t) => t.id === track.id)) {
            remoteMediaStreamRef.current.addTrack(track);
          }
        });
      } else if (event.track) {
        if (!remoteMediaStreamRef.current.getTracks().some((t) => t.id === event.track.id)) {
          remoteMediaStreamRef.current.addTrack(event.track);
        }
      }
      setRemoteTrackObj(new MediaStream(remoteMediaStreamRef.current.getTracks()));
    };

    // Handle incoming DataChannel
    pc.ondatachannel = (event) => {
      console.log('[WebRTC] Inbound DataChannel received');
      dataChannelRef.current = event.channel;
      wireDataChannel(event.channel);
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log('[WebRTC] Connection state:', state);
      if (state === 'connected') {
        setConnectionState(LkConnectionState.Connected);
        setRemoteLeftNotice(false);
      } else if (state === 'connecting') {
        setConnectionState(LkConnectionState.Connecting);
      } else if (state === 'disconnected' || state === 'failed') {
        setConnectionState(LkConnectionState.Disconnected);
      } else if (state === 'closed') {
        setConnectionState(LkConnectionState.Disconnected);
      }
    };

    return pc;
  }, [wireDataChannel]);

  // Send SDP Offer via WebSocket Signaling
  const makeOffer = useCallback(async () => {
    const pc = createPeerConnection();
    try {
      // Create DataChannel on initiator side
      if (!dataChannelRef.current || dataChannelRef.current.readyState === 'closed') {
        const dc = pc.createDataChannel('main');
        dataChannelRef.current = dc;
        wireDataChannel(dc);
      }

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);

      if (signalWsRef.current?.readyState === WebSocket.OPEN) {
        signalWsRef.current.send(
          JSON.stringify({
            type: 'signal',
            roomId: roomCodeRef.current,
            data: {
              type: 'offer',
              sdp: offer,
            },
          })
        );
        console.log('[WebRTC Signaling] Dispatched SDP offer');
      }
    } catch (err) {
      console.error('[WebRTC] Error creating SDP offer:', err);
    }
  }, [createPeerConnection, wireDataChannel]);

  // Handle Signaling Messages from WebSocket
  const handleSignalMessage = useCallback(async (msg: any) => {
    if (!msg) return;

    if (msg.type === 'joined') {
      console.log(`[WebRTC Signaling] Joined room=${msg.roomId}, peers=${msg.peerCount}`);
      if (msg.peerCount > 1) {
        setConnectionState(LkConnectionState.Connecting);
      }
    }

    if (msg.type === 'peer-joined') {
      console.log(`[WebRTC Signaling] Peer joined. Initiator=${msg.initiator}`);
      setRemoteLeftNotice(false);
      setInterimTranscripts({});
      setAvatarTriggerText('');
      processedEventIdsRef.current.clear();
      if (msg.initiator) {
        await makeOffer();
      }
    }

    if (msg.type === 'peer-left') {
      console.log('[WebRTC Signaling] Remote peer left room');
      setRemoteLeftNotice(true);
      if (remoteMediaStreamRef.current) {
        remoteMediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      remoteMediaStreamRef.current = new MediaStream();
      setRemoteTrackObj(null);
      setInterimTranscripts({});
      setAvatarTriggerText('');
      processedEventIdsRef.current.clear();
    }

    if (msg.type === 'signal') {
      const data = msg.data || {};
      const pc = createPeerConnection();

      if (data.type === 'offer') {
        console.log('[WebRTC Signaling] Received SDP offer, creating answer');
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc.createAnswer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(answer);

        if (signalWsRef.current?.readyState === WebSocket.OPEN) {
          signalWsRef.current.send(
            JSON.stringify({
              type: 'signal',
              roomId: roomCodeRef.current,
              data: {
                type: 'answer',
                sdp: answer,
              },
            })
          );
        }

        while (pendingIceRef.current.length > 0) {
          const c = pendingIceRef.current.shift();
          if (c) await pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.warn);
        }
      }

      if (data.type === 'answer') {
        console.log('[WebRTC Signaling] Received SDP answer');
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        while (pendingIceRef.current.length > 0) {
          const c = pendingIceRef.current.shift();
          if (c) await pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.warn);
        }
      }

      if (data.type === 'candidate' && data.candidate) {
        if (pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(console.warn);
        } else {
          pendingIceRef.current.push(data.candidate);
        }
      }
    }

    if (msg.type === 'app-message') {
      const payload = msg.payload || {};
      const eventId = payload.eventId || payload.event?.id;
      if (eventId) {
        if (processedEventIdsRef.current.has(eventId)) {
          return;
        }
        processedEventIdsRef.current.add(eventId);
        if (processedEventIdsRef.current.size > 200) {
          const firstEntries = Array.from(processedEventIdsRef.current).slice(0, 50);
          firstEntries.forEach((id) => processedEventIdsRef.current.delete(id));
        }
      }

      if (payload.type === 'avatar-sign' || payload.kind === 'speech' || payload.kind === 'text') {
        const text = payload.text || '';
        if (text) setAvatarTriggerText(text);
        if (payload.event) {
          addTranscriptEventRef.current(payload.event);
        } else if (text) {
          const ev: TranscriptEvent = {
            id: payload.eventId || `av-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            sessionId: sessionId || roomCodeRef.current,
            senderId: 'remote',
            senderName: msg.fromRole === 'deaf' ? 'Deaf Participant' : 'Hearing Participant',
            senderType: msg.fromRole === 'deaf' ? 'ACCESSIBILITY_USER' : 'COMMON_USER',
            text: text,
            timestamp: payload.timestamp || Date.now(),
            isFinal: true,
            confidence: 1.0,
          };
          addTranscriptEventRef.current(ev);
        }
      } else if (payload.type === 'ISL_SIGN' || payload.type === 'translation' || payload.kind === 'sign-result') {
        const text = payload.sign || payload.text || payload.english || payload.gloss || '';
        if (!text.trim()) return;

        if (payload.event) {
          addTranscriptEventRef.current(payload.event);
        } else {
          const ev: TranscriptEvent = {
            id: payload.eventId || `isl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            sessionId: sessionId || roomCodeRef.current,
            senderId: 'remote',
            senderName: 'ISL Sign',
            senderType: 'ACCESSIBILITY_USER',
            text: text.trim(),
            timestamp: payload.timestamp || Date.now(),
            isFinal: true,
            confidence: payload.confidence || 0.98,
          };
          addTranscriptEventRef.current(ev);
        }
      } else if (payload.kind === 'transcript' && payload.event) {
        addTranscriptEventRef.current(payload.event);
      }
    }
  }, [createPeerConnection, makeOffer, sessionId]);

  const handleSignalMessageRef = useRef(handleSignalMessage);
  handleSignalMessageRef.current = handleSignalMessage;

  // Single Authoritative Media Capture and WebRTC Initialization
  useEffect(() => {
    let localStream: MediaStream | null = null;
    let ws: WebSocket | null = null;
    let isCleanedUp = false;

    const startCall = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (isCleanedUp) {
          localStream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = localStream;
        localStream.getAudioTracks().forEach((t) => (t.enabled = micState));
        localStream.getVideoTracks().forEach((t) => (t.enabled = cameraState));

        setLocalTrackObj(localStream);

        // Attach tracks to PeerConnection
        const pc = createPeerConnection();
        const senders = pc.getSenders();
        localStream.getTracks().forEach((track) => {
          const hasSender = senders.some((s) => s.track?.id === track.id || s.track?.kind === track.kind);
          if (!hasSender) {
            pc.addTrack(track, localStream!);
          }
        });

        // Connect WebSocket Signaling
        const sigUrl = getSignalingUrl();
        ws = new WebSocket(sigUrl);
        signalWsRef.current = ws;

        ws.onopen = () => {
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                type: 'join',
                roomId: roomCodeRef.current,
                role: userRoleRef.current,
              })
            );
          }
        };

        ws.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            handleSignalMessageRef.current(data);
          } catch (err) {
            console.error('Signaling message parse error:', err);
          }
        };

        ws.onerror = () => {
          console.warn('Signaling WebSocket error on:', sigUrl);
        };

        ws.onclose = () => {
          setConnectionState(LkConnectionState.Disconnected);
        };
      } catch (err) {
        console.warn('Media capture error:', err);
        setConnectionState(LkConnectionState.Disconnected);
      }
    };

    startCall();

    return () => {
      isCleanedUp = true;
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
      if (remoteMediaStreamRef.current) {
        remoteMediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      remoteMediaStreamRef.current = new MediaStream();
      if (ws) {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify({ type: 'leave', roomId: roomCodeRef.current }));
          } catch (_) {}
        }
        ws.close();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, [createPeerConnection]);

  // Toggle Controls Handlers
  const handleToggleMic = async () => {
    setMicState((prev) => {
      const next = !prev;
      localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = next));
      return next;
    });
  };

  const handleToggleCamera = async () => {
    setCameraState((prev) => {
      const next = !prev;
      localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = next));
      return next;
    });
  };

  // Device switching handlers that replace track on active peerConnection
  const handleSelectAudioDevice = async (deviceId: string) => {
    setActiveAudioDeviceId(deviceId);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
      });
      const newTrack = newStream.getAudioTracks()[0];
      if (newTrack && localStreamRef.current) {
        const oldTrack = localStreamRef.current.getAudioTracks()[0];
        if (oldTrack) {
          localStreamRef.current.removeTrack(oldTrack);
          oldTrack.stop();
        }
        localStreamRef.current.addTrack(newTrack);
        newTrack.enabled = micState;

        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === 'audio');
          if (sender) {
            await sender.replaceTrack(newTrack);
          }
        }
      }
    } catch (err) {
      console.warn('Error changing audio device:', err);
    }
  };

  const handleSelectVideoDevice = async (deviceId: string) => {
    setActiveVideoDeviceId(deviceId);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });
      const newTrack = newStream.getVideoTracks()[0];
      if (newTrack && localStreamRef.current) {
        const oldTrack = localStreamRef.current.getVideoTracks()[0];
        if (oldTrack) {
          localStreamRef.current.removeTrack(oldTrack);
          oldTrack.stop();
        }
        localStreamRef.current.addTrack(newTrack);
        newTrack.enabled = cameraState;
        setLocalTrackObj(new MediaStream(localStreamRef.current.getTracks()));

        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) {
            await sender.replaceTrack(newTrack);
          }
        }
      }
    } catch (err) {
      console.warn('Error changing video device:', err);
    }
  };

  const handleToggleScreen = async () => {
    try {
      if (!screenShareState) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        if (peerConnectionRef.current && screenTrack) {
          const senders = peerConnectionRef.current.getSenders();
          const videoSender = senders.find((s) => s.track?.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(screenTrack);
          }
        }
        screenTrack.onended = () => {
          setScreenShareState(false);
          const localVideo = localStreamRef.current?.getVideoTracks()[0];
          if (peerConnectionRef.current && localVideo) {
            const videoSender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === 'video');
            if (videoSender) videoSender.replaceTrack(localVideo);
          }
        };
        setScreenShareState(true);
      } else {
        setScreenShareState(false);
        const localVideo = localStreamRef.current?.getVideoTracks()[0];
        if (peerConnectionRef.current && localVideo) {
          const videoSender = peerConnectionRef.current.getSenders().find((s) => s.track?.kind === 'video');
          if (videoSender) videoSender.replaceTrack(localVideo);
        }
      }
    } catch (e) {
      console.warn('Screen share toggle note:', e);
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case LkConnectionState.Connected:
        return 'Connected';
      case LkConnectionState.Connecting:
        return 'Connecting...';
      case LkConnectionState.Reconnecting:
        return 'Reconnecting...';
      case LkConnectionState.Disconnected:
        return 'Disconnected';
      default:
        return 'Connected';
    }
  };

  const handleOpenEndModal = () => {
    setShowEndModal(true);
  };

  const handleConfirmEndCall = async () => {
    setFinalTranscripts([]);
    setInterimTranscripts({});
    setAvatarTriggerText('');
    processedEventIdsRef.current.clear();

    if (sessionId && accessToken) {
      try {
        await endSession(sessionId, accessToken);
      } catch (e) {
        console.warn('End session note:', e);
      }
    }
    navigate('/communicate');
  };

  const isCreator = Boolean(
    session?.creatorUserId === user?.id || incomingSettings.isHost
  );

  const workspaceProps = {
    sessionId: sessionId || roomCode,
    roomCode,
    isCreator,
    onEndCall: handleOpenEndModal,
    onLeaveCall: handleOpenEndModal,
    user,

    connectionState,
    getConnectionStatusText,
    micState,
    cameraState,
    screenShareState,
    handleToggleMic,
    handleToggleCamera,
    handleToggleScreen,

    audioDevices,
    activeAudioDeviceId,
    setActiveAudioDevice: handleSelectAudioDevice,
    videoDevices,
    activeVideoDeviceId,
    setActiveVideoDevice: handleSelectVideoDevice,
    speakerDevices,
    activeSpeakerDeviceId,
    setActiveSpeakerDevice: setActiveSpeakerDeviceId,
    showMicDevices,
    setShowMicDevices,
    showCameraDevices,
    setShowCameraDevices,
    showSpeakerDevices,
    setShowSpeakerDevices,
    speakerVolume,
    setSpeakerVolume,

    localTrack: localTrackObj,
    primaryRemoteTrack: remoteTrackObj,

    finalTranscripts,
    interimTranscripts,
    sttSupported: true,
    formatSpeakerLabel: (senderId: string, senderName: string) => {
      if (senderId === user?.id || senderId === user?.email || senderId === 'self') return 'You';
      return senderName || 'Peer';
    },
    captionsEndRef,

    controlsVisible: true,
    activeSequence: null,
    onSequenceComplete: () => {},
    recoveryState: 'READY' as const,
    onSendMessage: handleSendTextMessage,
    avatarTriggerText: avatarTriggerText,
    onSignRecognized: (signText: string) => {
      if (!signText || !signText.trim()) return;
      const cleanSign = signText.trim();
      const eventId = `sign-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const event: TranscriptEvent = {
        id: eventId,
        sessionId: sessionId || roomCodeRef.current,
        senderId: user?.id || user?.email || 'self',
        senderName: (user as any)?.fullName || (user as any)?.name || 'ISL Sign',
        senderType: 'ACCESSIBILITY_USER',
        text: cleanSign,
        timestamp: Date.now(),
        isFinal: true,
        confidence: 0.98,
      };
      addTranscriptEventRef.current(event);
      sendAppData({ type: 'ISL_SIGN', sign: cleanSign, text: cleanSign, eventId, timestamp: Date.now(), event });
    },
  };

  return (
    <div className="w-full h-full flex flex-col relative font-['Inter',sans-serif]">
      {/* Remote Audio Playback Element */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

      {/* Exact Native Workspaces Rendered based on User Role */}
      {isDeafWorkspace ? (
        <DeafUserWorkspace {...workspaceProps} />
      ) : (
        <HearingUserWorkspace {...workspaceProps} />
      )}

      {/* End Call Confirmation & Summary Breakdown Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a202c] rounded-[28px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#e0e3e5] dark:border-[#2d3133] flex flex-col gap-5 animate-scaleUp text-[#181c1e] dark:text-[#f7fafc]">
            
            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-[#e0e3e5] dark:border-[#2d3133] pb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">
                  {remoteLeftNotice ? 'person_off' : 'call_end'}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#030813] dark:text-white">
                  {remoteLeftNotice ? 'Call Ended (User Left)' : 'End Video Call?'}
                </h2>
                <p className="text-xs text-[#45474c] dark:text-[#828796]">
                  {remoteLeftNotice
                    ? 'The other participant has disconnected from the session.'
                    : `Room Code: ${roomCode || ''} • Confirm exit`}
                </p>
              </div>
            </div>

            {/* Conversation Log Summary Breakdown */}
            <div className="bg-[#f7fafc] dark:bg-[#030813] rounded-2xl p-4 border border-[#e0e3e5] dark:border-[#2d3133] flex flex-col gap-2 max-h-48 overflow-y-auto">
              <div className="flex justify-between text-xs border-b border-[#e0e3e5] dark:border-[#2d3133] pb-1.5 font-bold">
                <span className="text-[#45474c] dark:text-[#828796]">Conversation:</span>
                <span className="text-[#030813] dark:text-white">{finalTranscripts.length} entries</span>
              </div>

              {finalTranscripts.length === 0 ? (
                <p className="text-[11px] text-[#45474c] dark:text-[#828796] italic py-2 text-center">
                  No conversation recorded during this call.
                </p>
              ) : (
                <div className="space-y-2 pt-1">
                  {finalTranscripts.map((t) => {
                    const isMe = t.senderId === user?.email || t.senderId === user?.id || t.senderId === 'self';
                    return (
                      <div key={t.id} className="flex items-baseline justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 truncate max-w-[85%]">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            isMe ? 'bg-[#fe9832]/20 text-[#8f4e00] dark:text-[#fe9832]' : 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300'
                          }`}>
                            {isMe ? 'You' : t.senderName || 'Participant'}
                          </span>
                          <span className="text-[#030813] dark:text-white truncate">{t.text}</span>
                        </div>
                        <span className="text-[9px] text-[#828796]">
                          {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons: End & Leave, Cancel */}
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleConfirmEndCall}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>{remoteLeftNotice ? 'Exit to Communicate' : 'End & Leave Call'}</span>
              </button>

              {!remoteLeftNotice && (
                <button
                  type="button"
                  onClick={() => setShowEndModal(false)}
                  className="w-full py-2.5 text-xs font-bold text-[#45474c] dark:text-[#828796] hover:text-[#030813] dark:hover:text-white rounded-xl hover:bg-[#f1f4f6] dark:hover:bg-[#2d3133] transition-colors cursor-pointer"
                >
                  Cancel & Resume Call
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineSessionPage;
