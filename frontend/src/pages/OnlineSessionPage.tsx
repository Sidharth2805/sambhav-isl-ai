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
import { useWebRTC, CallConnectionState } from '../WEBRTC';

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

  const isHostParam = searchParams.get('host') === 'true';
  const isCreator = Boolean(
    incomingSettings.isHost !== undefined
      ? incomingSettings.isHost
      : isHostParam || (session ? (session as any).creatorUserId === user?.id || (session as any).initiatorId === user?.id : false)
  );

  const isDeafWorkspace = userRole === 'deaf';

  // UI state
  const [speakerVolume, setSpeakerVolume] = useState<number>(
    incomingSettings.initialSpeaker !== undefined ? incomingSettings.initialSpeaker : 80
  );
  const [showMicDevices, setShowMicDevices] = useState(false);
  const [showCameraDevices, setShowCameraDevices] = useState(false);
  const [showSpeakerDevices, setShowSpeakerDevices] = useState(false);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);

  // Transcripts & Avatar triggers
  const [finalTranscripts, setFinalTranscripts] = useState<TranscriptEvent[]>([]);
  const [interimTranscripts, setInterimTranscripts] = useState<Record<string, string>>({});
  const [avatarTriggerText, setAvatarTriggerText] = useState<string>('');
  const captionsEndRef = useRef<HTMLDivElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
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

  // Handle incoming data channel messages from remote peer
  const handleDataChannelMessage = useCallback((payload: Record<string, any>) => {
    if (!payload) return;
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
          senderName: 'Hearing Participant',
          senderType: 'COMMON_USER',
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
  }, [sessionId]);

  // Hook into Native WebRTC client
  const {
    localStream,
    remoteStream,
    connectionState,
    micState,
    cameraState,
    screenShareState,
    remoteLeftNotice,
    audioDevices,
    videoDevices,
    speakerDevices,
    activeAudioDeviceId,
    activeVideoDeviceId,
    activeSpeakerDeviceId,
    toggleMic,
    toggleCamera,
    toggleScreen,
    switchAudioDevice,
    switchVideoDevice,
    switchSpeakerDevice,
    sendAppData,
    disconnect,
  } = useWebRTC({
    roomId: roomCode,
    role: userRole,
    isCreator,
    initialVideo: incomingSettings.initialVideo !== undefined ? incomingSettings.initialVideo : true,
    initialAudio: incomingSettings.initialAudio !== undefined ? incomingSettings.initialAudio : true,
    onDataMessage: handleDataChannelMessage,
    onRemoteLeave: () => {
      setInterimTranscripts({});
      setAvatarTriggerText('');
    },
  });

  // Attach remote stream to hidden audio playback element with robust autoplay handling
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      const playAudio = () => {
        if (remoteAudioRef.current && remoteAudioRef.current.paused) {
          remoteAudioRef.current.play().catch((err) => {
            console.log('[WEBRTC] Audio autoplay waiting for user interaction:', err);
          });
        }
      };
      playAudio();
      window.addEventListener('click', playAudio, { once: true });
      window.addEventListener('touchstart', playAudio, { once: true });
    }
  }, [remoteStream]);

  // Sync speaker volume across all audio elements
  useEffect(() => {
    document.querySelectorAll('audio').forEach((audio) => {
      audio.volume = speakerVolume / 100;
    });
  }, [speakerVolume]);

  // Auto-scroll captions
  useEffect(() => {
    captionsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [finalTranscripts, interimTranscripts]);

  // Live Microphone Audio Recognition (Web Speech STT)
  useEffect(() => {
    const stt = SpeechToTextService.getInstance();
    const mySenderId = user?.id || user?.email || 'me';
    const mySenderName = (user as any)?.fullName || (user as any)?.name || 'You';
    const mySenderType = isDeafWorkspace ? 'ACCESSIBILITY_USER' : 'COMMON_USER';

    if (micState) {
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

    if (isDeafWorkspace) {
      sendAppData({ type: 'ISL_SIGN', sign: clean, text: clean, eventId, timestamp: Date.now(), event });
    } else {
      sendAppData({ type: 'avatar-sign', text: clean, eventId, timestamp: Date.now(), event });
    }
  }, [isDeafWorkspace, sendAppData, sessionId, user]);

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case CallConnectionState.Connected:
        return 'Connected';
      case CallConnectionState.Connecting:
        return 'Connecting...';
      case CallConnectionState.Reconnecting:
        return 'Reconnecting...';
      case CallConnectionState.Disconnected:
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
    disconnect();

    if (sessionId && accessToken) {
      try {
        await endSession(sessionId, accessToken);
      } catch (e) {
        console.warn('End session note:', e);
      }
    }
    navigate('/communicate');
  };

  const workspaceProps = {
    sessionId: sessionId || roomCode,
    roomCode,
    isCreator,
    onEndCall: handleOpenEndModal,
    onLeaveCall: handleOpenEndModal,
    user,

    connectionState: connectionState as LkConnectionState,
    getConnectionStatusText,
    micState,
    cameraState,
    screenShareState,
    handleToggleMic: async () => {
      await toggleMic();
    },
    handleToggleCamera: async () => {
      await toggleCamera();
    },
    handleToggleScreen: async () => {
      await toggleScreen();
    },

    audioDevices,
    activeAudioDeviceId,
    setActiveAudioDevice: switchAudioDevice,
    videoDevices,
    activeVideoDeviceId,
    setActiveVideoDevice: switchVideoDevice,
    speakerDevices,
    activeSpeakerDeviceId,
    setActiveSpeakerDevice: switchSpeakerDevice,
    showMicDevices,
    setShowMicDevices,
    showCameraDevices,
    setShowCameraDevices,
    showSpeakerDevices,
    setShowSpeakerDevices,
    speakerVolume,
    setSpeakerVolume,

    localTrack: localStream,
    primaryRemoteTrack: remoteStream,

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
