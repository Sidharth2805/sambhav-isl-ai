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

export const getSignalingUrl = (): string => {
  const envSignaling = (import.meta as any).env?.VITE_SIGNALING_URL;
  if (envSignaling) return envSignaling;

  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  if (isLocal) {
    return 'ws://localhost:8080/ws/webrtc';
  }

  const apiUrl = (import.meta as any).env?.VITE_API_URL;
  if (apiUrl) {
    try {
      const parsed = new URL(apiUrl);
      const protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${parsed.host}/ws/webrtc`;
    } catch {
      // fallback
    }
  }

  if (typeof window !== 'undefined') {
    return `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/webrtc`;
  }
  return 'ws://localhost:8080/ws/webrtc';
};

const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
];

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

  const [session, setSession] = useState<CommunicationSessionDto | null>(null);
  const [roomCode, setRoomCode] = useState<string>(
    incomingSettings.roomCode ? incomingSettings.roomCode.toUpperCase() : (sessionId?.toUpperCase() || 'SAMBHAV')
  );

  const isDeafDefault =
    (user as any)?.disabilityType === 'DEAF' ||
    (user as any)?.disabilityType === 'DEAF_MUTE' ||
    (user as any)?.disabilityType === 'MUTE' ||
    user?.accountType === 'ACCESSIBILITY_USER';

  const userRole = searchParams.get('role') || incomingSettings.userRole || (isDeafDefault ? 'deaf' : 'normal');
  const isDeafWorkspace = userRole === 'deaf' || user?.accountType === 'ACCESSIBILITY_USER';

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

  // WebRTC Native Streams & Connections
  const localStreamRef = useRef<MediaStream | null>(null);
  const [localTrackObj, setLocalTrackObj] = useState<any>(null);
  const [remoteTrackObj, setRemoteTrackObj] = useState<any>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const signalWsRef = useRef<WebSocket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);

  // Fetch Session details from API if available
  useEffect(() => {
    if (!sessionId) return;
    getSession(sessionId, accessToken)
      .then((data) => {
        if (data) {
          setSession(data);
          if (data.roomCode) {
            setRoomCode(data.roomCode.toUpperCase());
          }
          if (data.status === 'CREATED' || data.status === 'WAITING') {
            startSession(data.id || sessionId, accessToken).catch(() => {});
          }
        }
      })
      .catch((e) => {
        console.warn('Session API note (proceeding with native WebRTC session):', e);
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

  // Send Transcript / Message over WebRTC Signaling
  const handleSendTextMessage = useCallback((text: string) => {
    const clean = text.trim();
    if (!clean) return;

    const event: TranscriptEvent = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sessionId: sessionId || roomCode,
      senderId: user?.id || user?.email || 'self',
      senderName: (user as any)?.fullName || (user as any)?.name || 'You',
      senderType: isDeafWorkspace ? 'ACCESSIBILITY_USER' : 'COMMON_USER',
      text: clean,
      timestamp: Date.now(),
      isFinal: true,
      confidence: 1.0,
    };

    addTranscriptEvent(event);

    if (signalWsRef.current?.readyState === WebSocket.OPEN) {
      signalWsRef.current.send(
        JSON.stringify({
          type: 'app-message',
          roomId: roomCode,
          payload: {
            kind: 'transcript',
            event,
            text: clean,
            timestamp: Date.now(),
          },
        })
      );
    }
  }, [addTranscriptEvent, isDeafWorkspace, roomCode, sessionId, user]);

  // Live Microphone Audio Recognition (Web Speech STT)
  useEffect(() => {
    const stt = SpeechToTextService.getInstance();
    const mySenderId = user?.id || user?.email || 'me';
    const mySenderName = (user as any)?.fullName || (user as any)?.name || 'You';
    const mySenderType = isDeafWorkspace ? 'ACCESSIBILITY_USER' : 'COMMON_USER';

    if (micState && connectionState !== LkConnectionState.Disconnected) {
      stt.startRecording(
        sessionId || roomCode,
        mySenderId,
        mySenderName,
        mySenderType,
        (event: TranscriptEvent) => {
          addTranscriptEvent(event);
          if (signalWsRef.current?.readyState === WebSocket.OPEN) {
            signalWsRef.current.send(
              JSON.stringify({
                type: 'app-message',
                roomId: roomCode,
                fromRole: userRole,
                payload: {
                  kind: 'transcript',
                  event,
                },
              })
            );
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
  }, [micState, connectionState, sessionId, roomCode, user, isDeafWorkspace, userRole, addTranscriptEvent]);

  // Create WebRTC Peer Connection
  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) return peerConnectionRef.current;

    const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });
    peerConnectionRef.current = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && signalWsRef.current?.readyState === WebSocket.OPEN) {
        signalWsRef.current.send(
          JSON.stringify({
            type: 'signal',
            roomId: roomCode,
            data: {
              type: 'ice',
              candidate: event.candidate,
            },
          })
        );
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        setRemoteTrackObj(remoteStream);
      } else if (event.track) {
        const ms = new MediaStream([event.track]);
        setRemoteTrackObj(ms);
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === 'connected') {
        setConnectionState(LkConnectionState.Connected);
      } else if (state === 'connecting') {
        setConnectionState(LkConnectionState.Connecting);
      } else if (state === 'disconnected' || state === 'failed') {
        setConnectionState(LkConnectionState.Disconnected);
      }
    };

    return pc;
  }, [roomCode]);

  // Make SDP Offer
  const makeOffer = useCallback(async () => {
    try {
      const pc = createPeerConnection();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      signalWsRef.current?.send(
        JSON.stringify({
          type: 'signal',
          roomId: roomCode,
          data: {
            type: 'offer',
            sdp: offer,
          },
        })
      );
    } catch (err) {
      console.warn('Make offer error:', err);
    }
  }, [createPeerConnection, roomCode]);

  // Handle Signaling Messages
  const handleSignalMessage = useCallback(async (msg: any) => {
    if (msg.type === 'joined') {
      createPeerConnection();
      if (msg.initiator) {
        setConnectionState(LkConnectionState.Connecting);
      } else {
        setConnectionState(LkConnectionState.Connecting);
      }
      return;
    }

    if (msg.type === 'peer-joined') {
      if (msg.initiator) {
        await makeOffer();
      }
      return;
    }

    if (msg.type === 'peer-left') {
      setRemoteTrackObj(null);
      setRemoteLeftNotice(true);
      setShowEndModal(true);
      return;
    }

    if (msg.type === 'signal') {
      const data = msg.data;
      if (!data) return;

      const pc = createPeerConnection();

      if (data.type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        signalWsRef.current?.send(
          JSON.stringify({
            type: 'signal',
            roomId: roomCode,
            data: {
              type: 'answer',
              sdp: answer,
            },
          })
        );

        while (pendingIceRef.current.length > 0) {
          const c = pendingIceRef.current.shift();
          if (c) await pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.warn);
        }
      }

      if (data.type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        while (pendingIceRef.current.length > 0) {
          const c = pendingIceRef.current.shift();
          if (c) await pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.warn);
        }
      }

      if (data.type === 'ice') {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(console.warn);
        } else {
          pendingIceRef.current.push(data.candidate);
        }
      }
    }

    if (msg.type === 'app-message') {
      const payload = msg.payload || {};
      if (payload.kind === 'transcript' && payload.event) {
        addTranscriptEvent(payload.event);
      } else if (payload.kind === 'text' || payload.kind === 'speech') {
        const ev: TranscriptEvent = {
          id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sessionId: sessionId || roomCode,
          senderId: 'peer',
          senderName: msg.fromRole === 'deaf' ? 'Deaf Participant' : 'Hearing Participant',
          senderType: msg.fromRole === 'deaf' ? 'ACCESSIBILITY_USER' : 'COMMON_USER',
          text: payload.text,
          timestamp: Date.now(),
          isFinal: true,
          confidence: 1.0,
        };
        addTranscriptEvent(ev);
      } else if (payload.kind === 'sign-result') {
        const text = payload.english || payload.gloss || '';
        if (text) {
          const ev: TranscriptEvent = {
            id: `sign-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            sessionId: sessionId || roomCode,
            senderId: 'peer',
            senderName: 'ISL Sign',
            senderType: 'ACCESSIBILITY_USER',
            text: text,
            timestamp: Date.now(),
            isFinal: true,
            confidence: 0.98,
          };
          addTranscriptEvent(ev);
        }
      }
    }
  }, [addTranscriptEvent, createPeerConnection, makeOffer, roomCode]);

  // Initialize Media and Signaling
  useEffect(() => {
    let localStream: MediaStream | null = null;
    let ws: WebSocket | null = null;

    const startMedia = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = localStream;

        localStream.getAudioTracks().forEach((t) => (t.enabled = micState));
        localStream.getVideoTracks().forEach((t) => (t.enabled = cameraState));

                setLocalTrackObj(localStream);

        // Attach tracks to active PeerConnection if already created
        if (peerConnectionRef.current) {
          const pc = peerConnectionRef.current;
          const senders = pc.getSenders();
          localStream.getTracks().forEach((track) => {
            const hasSender = senders.some((s) => s.track?.id === track.id || s.track?.kind === track.kind);
            if (!hasSender) {
              pc.addTrack(track, localStream!);
            }
          });
        }

        const sigUrl = getSignalingUrl();
        ws = new WebSocket(sigUrl);
        signalWsRef.current = ws;

        ws.onopen = () => {
          ws?.send(
            JSON.stringify({
              type: 'join',
              roomId: roomCode,
              role: userRole,
            })
          );
        };

        ws.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            handleSignalMessage(data);
          } catch (err) {
            console.error('Signaling parse error:', err);
          }
        };

        ws.onerror = () => {
          console.warn('Signaling error on:', sigUrl);
        };

        ws.onclose = () => {
          setConnectionState(LkConnectionState.Disconnected);
        };
      } catch (mediaErr) {
        console.warn('Media capture error:', mediaErr);
        setConnectionState(LkConnectionState.Disconnected);
      }
    };

    startMedia();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
      if (ws) {
        ws.send(JSON.stringify({ type: 'leave', roomId: roomCode }));
        ws.close();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, [roomCode, userRole, handleSignalMessage]);

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
