import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSession, endSession, cancelSession, getLiveKitToken, startSession, sendFinalTranscript, getTranslationHistory } from '../utils/communicationApi';
import type { CommunicationSessionDto, LiveKitTokenResponseDto } from '../utils/communicationApi';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useTracks,
  useLocalParticipant,
  useConnectionState,
  useRoomContext,
  useMediaDeviceSelect,
} from '@livekit/components-react';
import { Track, ConnectionState as LkConnectionState, RoomEvent, DisconnectReason, VideoPresets } from 'livekit-client';
import '@livekit/components-styles';
import type { TranscriptEvent } from '../types/transcript';
import { SpeechToTextService } from '../services/SpeechToTextService';
import { useTranscript } from '../hooks/useTranscript';
import { HearingUserWorkspace } from '../components/communication/HearingUserWorkspace';
import { DeafUserWorkspace } from '../components/communication/DeafUserWorkspace';

export const OnlineSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState<CommunicationSessionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // LiveKit Connection info state
  const [lkCredentials, setLkCredentials] = useState<LiveKitTokenResponseDto | null>(null);

  // Call Settings UI State
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [speakerVolume, setSpeakerVolume] = useState(80);
  const [showSettings, setShowSettings] = useState(false);

  // Clipboard Copied State
  const [copied, setCopied] = useState(false);

  // Connection control states
  const [isLeaving, setIsLeaving] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Sync volume with all audio elements dynamically
  useEffect(() => {
    const audios = document.querySelectorAll('audio');
    audios.forEach((audio) => {
      audio.volume = speakerVolume / 100;
    });
  }, [speakerVolume]);

  const getFriendlyErrorMessage = (errMsg: string) => {
    if (!errMsg) return 'Session could not be established.';
    const lower = errMsg.toLowerCase();
    
    if (lower.includes('permission denied') || 
        lower.includes('notallowederror') || 
        lower.includes('permission dismissed') || 
        lower.includes('user denied') || 
        lower.includes('notallowed') || 
        lower.includes('permission') ||
        lower.includes('client initiated disconnect')) {
      return 'Camera or microphone access was denied or blocked. Please verify that camera and microphone permissions are allowed in your browser settings, ensure your webcam is not in use by another app, and try again.';
    }
    if (lower.includes('network') || lower.includes('failed to fetch') || lower.includes('networkerror')) {
      return 'Network connection failure. Please verify your internet connection and check if the backend server is running.';
    }
    if (lower.includes('token') && (lower.includes('expired') || lower.includes('invalid') || lower.includes('unauthorized') || lower.includes('401'))) {
      return 'Unable to obtain token: Your authentication session is invalid or has expired. Please log in again.';
    }
    if (lower.includes('ended')) {
      return 'Session expired: This communication session has already been ended.';
    }
    if (lower.includes('cancelled')) {
      return 'Room unavailable: This communication session has been cancelled.';
    }
    if (lower.includes('not found') || lower.includes('404')) {
      return 'Room unavailable: The requested session could not be found.';
    }
    if (lower.includes('connection failed') || lower.includes('livekit')) {
      return `LiveKit connection failure: ${errMsg}`;
    }
    return errMsg;
  };

  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!sessionId) return;
      try {
        if (import.meta.env.DEV) {
          console.log('[SignBridge Debug] fetchSessionDetails started for sessionId:', sessionId);
        }
        setLoading(true);
        const data = await getSession(sessionId, accessToken);
        setSession(data);
        if (import.meta.env.DEV) {
          console.log('[SignBridge Debug] fetchSessionDetails completed successfully. Status:', data.status);
        }

        // If the call is already active, fetch LiveKit credentials automatically
        if (data.status === 'ACTIVE') {
          if (import.meta.env.DEV) {
            console.log('[SignBridge Debug] Session is ACTIVE. Requesting LiveKit credentials...');
            console.log('[SignBridge Debug] LiveKit token requested');
          }
          const credentials = await getLiveKitToken(sessionId, accessToken);
          setLkCredentials(credentials);
          if (import.meta.env.DEV) {
            console.log('[SignBridge Debug] LiveKit token retrieved successfully.');
          }
        }
      } catch (err: any) {
        console.error('[SignBridge Debug] fetchSessionDetails caught error:', err);
        setError(err?.message || 'Failed to retrieve online session details.');
      } finally {
        setLoading(false);
      }
    };
    fetchSessionDetails();
  }, [sessionId, accessToken]);

  useEffect(() => {
    if (!sessionId || !session) return;
    if (session.status === 'ACTIVE') return;

    const isCreator = session.creatorUserId === user?.id;
    if (isCreator) return;

    const interval = setInterval(async () => {
      try {
        const data = await getSession(sessionId, accessToken);
        if (data.status === 'ACTIVE') {
          setSession(data);
          if (import.meta.env.DEV) {
            console.log('[SignBridge Debug] Polled session status turned ACTIVE. Fetching credentials...');
            console.log('[SignBridge Debug] LiveKit token requested');
          }
          const credentials = await getLiveKitToken(sessionId, accessToken);
          setLkCredentials(credentials);
          clearInterval(interval);
        }
      } catch (err) {
        console.error('[SignBridge Debug] Polling session status failed:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId, session, user?.id, accessToken]);

  const handleStartCall = async () => {
    if (!session) return;
    if (import.meta.env.DEV) {
      console.log('[SignBridge Debug] handleStartCall triggered for session:', session.id);
    }
    try {
      setLoading(true);
      // Transition status to ACTIVE on the backend
      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] Transitioning session status to ACTIVE...');
      }
      const updatedSession = await startSession(session.id, accessToken);
      setSession(updatedSession);
      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] startSession transition completed successfully.');
        console.log('[SignBridge Debug] Session started');
      }

      // Fetch LiveKit credentials
      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] Requesting LiveKit token from backend...');
        console.log('[SignBridge Debug] LiveKit token requested');
      }
      const credentials = await getLiveKitToken(session.id, accessToken);
      setLkCredentials(credentials);
      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] LiveKit token generated and loaded successfully.');
      }
      setLoading(false);
    } catch (err: any) {
      console.error('[SignBridge Debug] handleStartCall caught error:', err);
      setError(err?.message || 'Failed to initialize call. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleEndCall = async () => {
    if (!session) return;
    const confirmEnd = window.confirm('Are you sure you want to end this online communication session?');
    if (!confirmEnd) return;

    if (import.meta.env.DEV) {
      console.log('[SignBridge Debug] handleEndCall triggered. Terminating session...');
    }
    try {
      setLoading(true);
      if (session.creatorUserId === user?.id) {
        // Creator explicitly ends the session in the database
        if (import.meta.env.DEV) {
          console.log('[SignBridge Debug] User is creator. Sending endSession request to backend...');
        }
        await endSession(session.id, accessToken);
        if (import.meta.env.DEV) {
          console.log('[SignBridge Debug] endSession request completed.');
        }
      }
      setIsLeaving(true);
      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] Navigating away from OnlineSessionPage');
        console.log('[SignBridge Debug] Navigation reason: Creator ended the call session');
        console.log('[SignBridge Debug] Current session id:', session.id);
        console.log('[SignBridge Debug] Current room code:', session.roomCode);
        console.log('[SignBridge Debug] Current LiveKit state:', lkCredentials ? 'Connecting/Connected' : 'Disconnected');
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error('[SignBridge Debug] handleEndCall caught error:', err);
      setError(err?.message || 'Failed to terminate session.');
      setLoading(false);
    }
  };

  const handleCancelCall = async () => {
    if (!session) return;
    if (import.meta.env.DEV) {
      console.log('[SignBridge Debug] handleCancelCall triggered. Cancelling session...');
    }
    try {
      setLoading(true);
      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] Sending cancelSession request to backend...');
      }
      await cancelSession(session.id, accessToken);
      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] cancelSession request completed.');
      }
      setIsLeaving(true);
      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] Navigating away from OnlineSessionPage');
        console.log('[SignBridge Debug] Navigation reason: Creator cancelled the call session');
        console.log('[SignBridge Debug] Current session id:', session.id);
        console.log('[SignBridge Debug] Current room code:', session.roomCode);
        console.log('[SignBridge Debug] Current LiveKit state:', lkCredentials ? 'Connecting/Connected' : 'Disconnected');
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error('[SignBridge Debug] handleCancelCall caught error:', err);
      setError(err?.message || 'Failed to cancel session.');
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (session?.roomCode) {
      navigator.clipboard.writeText(session.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4" role="status">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <span className="font-bold">Syncing call session status...</span>
      </div>
    );
  }

  const handleLeaveSession = () => {
    setIsLeaving(true);
    if (import.meta.env.DEV) {
      console.log('[SignBridge Debug] Navigating away from OnlineSessionPage');
      console.log('[SignBridge Debug] Navigation reason: User clicked Leave Session on connection error');
      console.log('[SignBridge Debug] Current session id:', session?.id);
      console.log('[SignBridge Debug] Current room code:', session?.roomCode);
      console.log('[SignBridge Debug] Current LiveKit state: Disconnected');
    }
    navigate('/communicate');
  };

  const handleRetryConnection = async () => {
    if (import.meta.env.DEV) {
      console.log('[SignBridge Debug] Retrying LiveKit connection...');
    }
    setConnectionError(null);
    setError(null);
    try {
      setLoading(true);
      // Fetch session details again
      const data = await getSession(sessionId!, accessToken);
      setSession(data);
      
      // If active, generate token
      if (data.status === 'ACTIVE') {
        if (import.meta.env.DEV) {
          console.log('[SignBridge Debug] LiveKit token requested');
        }
        const credentials = await getLiveKitToken(sessionId!, accessToken);
        setLkCredentials(credentials);
      } else {
        // Creator start flow
        if (data.creatorUserId === user?.id) {
          const updated = await startSession(sessionId!, accessToken);
          setSession(updated);
          if (import.meta.env.DEV) {
            console.log('[SignBridge Debug] LiveKit token requested');
          }
          const credentials = await getLiveKitToken(sessionId!, accessToken);
          setLkCredentials(credentials);
        }
      }
    } catch (err: any) {
      console.error('[SignBridge Debug] Retry connection caught error:', err);
      setConnectionError(`Unable to connect to the communication room. Details: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (connectionError) {
    return (
      <div className="card p-8 flex flex-col items-center text-center gap-4 max-w-md mx-auto" role="alert">
        <span className="text-3xl">⚠️</span>
        <h2 className="text-xl font-bold">Call Connection Issue</h2>
        <p className="text-sm opacity-75">{connectionError}</p>
        <div className="flex gap-4 w-full">
          <button onClick={handleRetryConnection} className="btn-primary flex-grow py-2 text-xs">
            Retry Connection
          </button>
          <button onClick={handleLeaveSession} className="btn-secondary flex-grow py-2 text-xs">
            Leave Session
          </button>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="card p-8 flex flex-col items-center text-center gap-4 max-w-md mx-auto" role="alert">
        <span className="text-3xl">⚠️</span>
        <h2 className="text-xl font-bold">Call Connection Issue</h2>
        <p className="text-sm opacity-75">{getFriendlyErrorMessage(error || 'Session could not be established.')}</p>
        <button 
          onClick={() => {
            setIsLeaving(true);
            if (import.meta.env.DEV) {
              console.log('[SignBridge Debug] Navigating away from OnlineSessionPage');
              console.log('[SignBridge Debug] Navigation reason: General page error back to dashboard');
              console.log('[SignBridge Debug] Current session id:', sessionId);
              console.log('[SignBridge Debug] Current room code:', session?.roomCode);
              console.log('[SignBridge Debug] Current LiveKit state: Disconnected');
            }
            navigate('/dashboard');
          }} 
          className="btn-primary py-2 text-xs"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isCreator = session.creatorUserId === user?.id;

  // Render PRE-CALL WAITING or SETUP state
  if (!lkCredentials && (session.status === 'CREATED' || session.status === 'WAITING')) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <button onClick={handleCancelCall} className="text-xs hover:underline font-bold text-red-500">
            ← Cancel Call
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wider opacity-85">Session Ready</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Device Setup / Camera Preview */}
          <div className="card p-6 flex flex-col gap-6">
            <h2 className="text-xl font-bold">Device Settings</h2>
            
            <div className="relative aspect-video rounded-lg bg-black border border-border overflow-hidden flex items-center justify-center">
              {cameraEnabled ? (
                <div className="text-white text-xs flex flex-col items-center gap-2">
                  <span className="text-3xl animate-pulse">📷</span>
                  <span>Self Camera Active (Hardware Preview)</span>
                </div>
              ) : (
                <span className="text-slate-500 text-xs">Camera is Disabled</span>
              )}
              <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white">
                You (Preview)
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setMicEnabled(!micEnabled)}
                className={`p-3 rounded-full border transition-all ${
                  micEnabled ? 'bg-primary/10 border-primary text-primary' : 'bg-red-50 border-red-200 text-red-500'
                }`}
                aria-label={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <button
                onClick={() => setCameraEnabled(!cameraEnabled)}
                className={`p-3 rounded-full border transition-all ${
                  cameraEnabled ? 'bg-primary/10 border-primary text-primary' : 'bg-red-50 border-red-200 text-red-500'
                }`}
                aria-label={cameraEnabled ? 'Disable camera' : 'Enable camera'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right: Code Sharing Info & Join actions */}
          <div className="card p-6 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold">Waiting for participant...</h2>
              <p className="text-xs opacity-75">
                Share this room code with the person you want to communicate with.
              </p>
              
              <div className="p-4 bg-bg border border-border rounded-lg text-center flex items-center justify-between gap-2">
                <span className="text-2xl font-mono font-black tracking-widest text-primary">
                  {session.roomCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="btn-secondary text-[10px] py-1.5 px-3 font-semibold"
                  aria-label="Copy room code to clipboard"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {isCreator ? (
                <button
                  onClick={handleStartCall}
                  className="btn-primary w-full min-h-[44px] flex items-center justify-center font-bold text-sm"
                >
                  Start call & Enter Room
                </button>
              ) : (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg text-center text-xs text-yellow-700 dark:text-yellow-400">
                  Waiting for host to begin...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render ACTIVE LiveKit Call view
  return (
    <div className="h-[calc(100vh-130px)] md:h-[calc(100vh-110px)] flex flex-col gap-4 max-w-5xl mx-auto relative">
      {lkCredentials && (
        <LiveKitRoom
          video={
            cameraEnabled
              ? {
                  resolution: VideoPresets.h720.resolution,
                }
              : false
          }
          audio={micEnabled}
          token={lkCredentials.token}
          serverUrl={lkCredentials.url}
          connect={true}
          options={{
            adaptiveStream: true,
            dynacast: true,
            publishDefaults: {
              videoCodec: 'vp8',
              simulcast: true,
            },
            videoCaptureDefaults: {
              resolution: VideoPresets.h720.resolution,
              frameRate: 30,
            },
          }}
  onDisconnected={() => {
    if (import.meta.env.DEV) {
      console.log('[SignBridge Debug] LiveKitRoom onDisconnected event fired.');
      console.log('[SignBridge Debug] LiveKit disconnected');
    }

    if (isLeaving) {
      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] Navigating away from OnlineSessionPage');
        console.log('[SignBridge Debug] Navigation reason: LiveKitRoom disconnected cleanly');
        console.log('[SignBridge Debug] Current session id:', session.id);
        console.log('[SignBridge Debug] Current room code:', session.roomCode);
        console.log('[SignBridge Debug] Current LiveKit state: Disconnected');
      }

      navigate('/dashboard');
    } else {
      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] Ignored auto-redirect on disconnect (not leaving)');
      }
    }
  }}
  onError={(err) => {
    console.error('[SignBridge Debug] LiveKitRoom connection error:', err);

    setConnectionError(
      `Unable to connect to the communication room. Details: ${err.message}`
    );

    setLkCredentials(null);
  }}
  className="flex-grow flex flex-col gap-4"
>
  {/* Required for rendering remote participant audio */}
  <RoomAudioRenderer />

  <ActiveCallWorkspace
    sessionId={session.id}
    roomCode={session.roomCode || ''}
    isCreator={isCreator}
    onEndCall={handleEndCall}
    onLeaveCall={() => {
      setIsLeaving(true);

      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] Navigating away from OnlineSessionPage');
        console.log('[SignBridge Debug] Navigation reason: User requested to leave the call');
        console.log('[SignBridge Debug] Current session id:', session.id);
        console.log('[SignBridge Debug] Current room code:', session.roomCode);
        console.log('[SignBridge Debug] Current LiveKit state: Connected');
      }

      navigate('/dashboard');
    }}
    showSettings={showSettings}
    setShowSettings={setShowSettings}
    speakerVolume={speakerVolume}
    setSpeakerVolume={setSpeakerVolume}
    user={user}
  />
</LiveKitRoom>
      )}
    </div>
  );
};

// Internal Sub-component to manage Room Context & render Video Conference Workspace
interface ActiveCallWorkspaceProps {
  sessionId: string;
  roomCode: string;
  isCreator: boolean;
  onEndCall: () => void;
  onLeaveCall: () => void;
  showSettings: boolean;
  setShowSettings: (val: boolean) => void;
  speakerVolume: number;
  setSpeakerVolume: (val: number) => void;
  user: any;
}

const ActiveCallWorkspace: React.FC<ActiveCallWorkspaceProps> = ({
  sessionId,
  roomCode,
  isCreator,
  onEndCall,
  onLeaveCall,
  showSettings,
  setShowSettings,
  speakerVolume,
  setSpeakerVolume,
  user,
}) => {
  const { localParticipant } = useLocalParticipant();
  const connectionState = useConnectionState();
  const room = useRoomContext();
  const { accessToken } = useAuth();

  const [sequenceQueue, setSequenceQueue] = useState<any[]>([]);
  const [processedSequenceIds] = useState(() => new Set<string>());
  const [recoveryState, setRecoveryState] = useState<'CONNECTED' | 'RECONNECTING' | 'RECOVERING' | 'READY'>('CONNECTED');
  const lastSeqNumRef = useRef<number>(0);

  const handleSequenceReceived = useCallback((sequence: any) => {
    if (!sequence || !sequence.sequenceId) return;
    if (processedSequenceIds.has(sequence.sequenceId)) {
      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] Ignored duplicate sequence:', sequence.sequenceId);
      }
      return;
    }
    processedSequenceIds.add(sequence.sequenceId);

    // Update last known sequence number
    if (sequence.sequenceNumber && sequence.sequenceNumber > lastSeqNumRef.current) {
      lastSeqNumRef.current = sequence.sequenceNumber;
    }

    if (import.meta.env.DEV) {
      console.log('[SignBridge Debug] Queueing new sequence:', sequence.sequenceId, 'sequenceNumber:', sequence.sequenceNumber);
    }
    
    setSequenceQueue((prev) => {
      const merged = [...prev, sequence];
      return merged.sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0));
    });
  }, [processedSequenceIds]);

  const handleSequenceComplete = useCallback(() => {
    setSequenceQueue((prev) => prev.slice(1));
  }, []);

  const recoverSessionHistory = useCallback(async () => {
    try {
      setRecoveryState('RECOVERING');
      if (import.meta.env.DEV) {
        console.log('[SignBridge Recovery] Recovering sequences after:', lastSeqNumRef.current);
      }

      const limit = 50;
      const history = await getTranslationHistory(sessionId, lastSeqNumRef.current, limit, accessToken);

      if (history && history.length > 0) {
        setSequenceQueue((prevQueue) => {
          const allItems = [...prevQueue, ...history];
          const uniqueMap = new Map<string, any>();
          
          allItems.forEach(item => {
            if (item && item.sequenceId) {
              uniqueMap.set(item.sequenceId, item);
            }
          });

          const sortedList = Array.from(uniqueMap.values()).sort(
            (a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0)
          );

          sortedList.forEach(item => processedSequenceIds.add(item.sequenceId));

          if (sortedList.length > 0) {
            const maxSeq = Math.max(...sortedList.map(item => item.sequenceNumber || 0));
            lastSeqNumRef.current = maxSeq;
          }

          return sortedList;
        });
      }

      setRecoveryState('READY');
      if (import.meta.env.DEV) {
        console.log('[SignBridge Recovery] Recovery complete. Status: READY');
      }
    } catch (err) {
      console.error('[SignBridge Recovery] Sequence history recovery failed:', err);
      setRecoveryState('READY');
    }
  }, [sessionId, accessToken, processedSequenceIds]);

  useEffect(() => {
    if (connectionState === LkConnectionState.Connected) {
      recoverSessionHistory();
    } else if (connectionState === LkConnectionState.Reconnecting) {
      setRecoveryState('RECONNECTING');
    }
  }, [connectionState, recoverSessionHistory]);

  const [micState, setMicState] = useState(localParticipant?.isMicrophoneEnabled ?? true);
  const [cameraState, setCameraState] = useState(localParticipant?.isCameraEnabled ?? true);
  const [screenShareState, setScreenShareState] = useState(localParticipant?.isScreenShareEnabled ?? false);

  // Media Input Device selectors
  const { devices: audioDevices, activeDeviceId: activeAudioDeviceId, setActiveMediaDevice: setActiveAudioDevice } = useMediaDeviceSelect({ kind: 'audioinput' });
  const { devices: videoDevices, activeDeviceId: activeVideoDeviceId, setActiveMediaDevice: setActiveVideoDevice } = useMediaDeviceSelect({ kind: 'videoinput' });
  const [showMicDevices, setShowMicDevices] = useState(false);
  const [showCameraDevices, setShowCameraDevices] = useState(false);

  // Auto-hiding Controls Visibility State
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimeoutRef = useRef<any>(null);

  const resetControlsTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    hideTimeoutRef.current = setTimeout(() => {
      // Don't hide if device selection menus are open
      if (showMicDevices || showCameraDevices) return;
      setControlsVisible(false);
    }, 3000);
  }, [showMicDevices, showCameraDevices]);

  useEffect(() => {
    window.addEventListener('mousemove', resetControlsTimer);
    window.addEventListener('mousedown', resetControlsTimer);
    window.addEventListener('touchstart', resetControlsTimer);

    resetControlsTimer();

    return () => {
      window.removeEventListener('mousemove', resetControlsTimer);
      window.removeEventListener('mousedown', resetControlsTimer);
      window.removeEventListener('touchstart', resetControlsTimer);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [resetControlsTimer]);

  // Transcript State Management
  const { finalTranscripts, interimTranscripts, addTranscriptEvent } = useTranscript(sessionId);
  const [sttSupported, setSttSupported] = useState(true);
  const captionsEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSttSupported(SpeechToTextService.getInstance().isSupported());
  }, []);

  useEffect(() => {
    if (captionsEndRef.current) {
      captionsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [finalTranscripts, interimTranscripts]);

  // Speech-to-Text connection lifecycle sync
  useEffect(() => {
    if (connectionState !== LkConnectionState.Connected || !localParticipant) {
      SpeechToTextService.getInstance().stopRecording();
      return;
    }

    const stt = SpeechToTextService.getInstance();

    if (micState && stt.isSupported()) {
      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] STT start requested');
      }
      stt.startRecording(
        sessionId,
        user.email || user.id,
        user.name || 'Anonymous',
        user.accountType === 'ACCESSIBILITY_USER' ? 'ACCESSIBILITY_USER' : 'COMMON_USER',
        (event) => {
          addTranscriptEvent(event);
          if (import.meta.env.DEV) {
            console.log('[SignBridge Debug] Transcript published:', event.text);
          }
          // Asynchronously dispatch finalized segments to the backend translation pipeline
          if (event.isFinal) {
            sendFinalTranscript(sessionId, event, accessToken)
              .then((sequence) => {
                if (import.meta.env.DEV) {
                  console.log('[SignBridge Debug] Collapsed SignSequence received (Local):', sequence);
                }
                if (sequence && sequence.sequenceId) {
                  try {
                    const envelope = {
                      type: "SIGN_SEQUENCE",
                      version: 1,
                      sequenceId: sequence.sequenceId,
                      sessionId: sessionId,
                      sourceTranscriptId: event.id,
                      senderId: localParticipant?.identity || user?.email,
                      sequence: sequence
                    };
                    const payload = new TextEncoder().encode(JSON.stringify(envelope));
                    room.localParticipant.publishData(payload, { reliable: true });
                    handleSequenceReceived(sequence);
                  } catch (broadcastErr) {
                    console.error('[SignBridge Debug] LiveKit SignSequence broadcasting failure:', broadcastErr);
                  }
                }
              })
              .catch((err) => {
                console.error('[SignBridge Debug] Collapsed translation processing error (Local):', err);
              });
          }
          // Publish transcript over LiveKit Room Data Channel
          try {
            const payload = new TextEncoder().encode(JSON.stringify(event));
            room.localParticipant.publishData(payload, { reliable: true });
          } catch (err) {
            console.error('[SignBridge Debug] LiveKit data publishing failure:', err);
          }
        }
      );
    } else {
      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] STT stop requested');
      }
      stt.stopRecording();
    }

    return () => {
      stt.stopRecording();
      setSequenceQueue([]);
    };
  }, [connectionState, localParticipant, micState, sessionId, user, addTranscriptEvent, room]);

  // Subscribe to remote transcript events
  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload: Uint8Array) => {
      try {
        const jsonStr = new TextDecoder().decode(payload);
        const data = JSON.parse(jsonStr);

        // Envelope validation
        if (data && data.type === 'SIGN_SEQUENCE') {
          if (import.meta.env.DEV) {
            console.log('[SignBridge Debug] Received SIGN_SEQUENCE envelope:', data.sequenceId);
          }
          handleSequenceReceived(data.sequence);
          return;
        }

        const event = data as TranscriptEvent;
        if (import.meta.env.DEV) {
          console.log('[SignBridge Debug] Transcript received:', event.text);
        }

        addTranscriptEvent(event);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn('[SignBridge Debug] Invalid data channel payload ignored:', err);
        }
      }
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);

    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, addTranscriptEvent]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[SignBridge Debug] LiveKit connection state changed:', connectionState);
      if (connectionState === LkConnectionState.Connected) {
        console.log('[SignBridge Debug] LiveKit connected');
      }
    }
  }, [connectionState]);

  useEffect(() => {
    if (!room) return;
    
    const onParticipantConnected = (participant: any) => {
      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] Participant connected:', participant.identity);
        console.log('[SignBridge Debug] Participant connected');
      }
    };
    
    const onParticipantDisconnected = (participant: any) => {
      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] Participant disconnected:', participant.identity);
        console.log('[SignBridge Debug] Participant disconnected');
      }
    };
    
    const onTrackPublished = (publication: any, participant: any) => {
      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] Track published:', publication.source, 'by participant:', participant.identity);
        if (participant.isLocal) {
          if (publication.source === Track.Source.Camera) {
            console.log('[SignBridge Debug] Local camera published');
          } else if (publication.source === Track.Source.Microphone) {
            console.log('[SignBridge Debug] Local microphone published');
          }
        }
      }
    };
    
    const onTrackSubscribed = (_track: any, publication: any, participant: any) => {
      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] Track subscribed:', publication.source, 'from participant:', participant.identity);
        if (!participant.isLocal) {
          console.log('[SignBridge Debug] Remote track subscribed');
        }
      }
    };
    
    const onDisconnected = (reason?: DisconnectReason) => {
      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] Room disconnected. Reason:', reason);
        console.log('[SignBridge Debug] LiveKit disconnected');
      }
    };

    room.on(RoomEvent.ParticipantConnected, onParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
    room.on(RoomEvent.TrackPublished, onTrackPublished);
    room.on(RoomEvent.TrackSubscribed, onTrackSubscribed);
    room.on(RoomEvent.Disconnected, onDisconnected);

    return () => {
      room.off(RoomEvent.ParticipantConnected, onParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
      room.off(RoomEvent.TrackPublished, onTrackPublished);
      room.off(RoomEvent.TrackSubscribed, onTrackSubscribed);
      room.off(RoomEvent.Disconnected, onDisconnected);
    };
  }, [room]);

  useEffect(() => {
    if (localParticipant) {
      setMicState(localParticipant.isMicrophoneEnabled);
    }
  }, [localParticipant?.isMicrophoneEnabled]);

  useEffect(() => {
    if (localParticipant) {
      setCameraState(localParticipant.isCameraEnabled);
    }
  }, [localParticipant?.isCameraEnabled]);

  useEffect(() => {
    if (localParticipant) {
      setScreenShareState(localParticipant.isScreenShareEnabled);
    }
  }, [localParticipant?.isScreenShareEnabled]);

  const handleToggleMic = async () => {
    const nextVal = !micState;
    if (localParticipant) {
      await localParticipant.setMicrophoneEnabled(nextVal);
      setMicState(nextVal);
    }
  };

  const handleToggleCamera = async () => {
    const nextVal = !cameraState;
    if (localParticipant) {
      await localParticipant.setCameraEnabled(nextVal);
      setCameraState(nextVal);
    }
  };

  const handleToggleScreen = async () => {
    const nextVal = !screenShareState;
    if (localParticipant) {
      await localParticipant.setScreenShareEnabled(nextVal);
      setScreenShareState(nextVal);
    }
  };

  // Find camera and screen tracks
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  // Separate remote tracks from local tracks
  const remoteTracks = tracks.filter((t) => !t.participant.isLocal);
  const localTrack = tracks.find((t) => t.participant.isLocal && t.source === Track.Source.Camera);

  // Identify screen share and camera tracks for remote participants
  const remoteScreenTrack = remoteTracks.find((t) => t.source === Track.Source.ScreenShare);
  const remoteCameraTrack = remoteTracks.find((t) => t.source === Track.Source.Camera);

  // The primary remote track to display in the main window
  const primaryRemoteTrack = remoteScreenTrack || remoteCameraTrack || remoteTracks[0];

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case LkConnectionState.Connecting:
        return 'Connecting to secure call...';
      case LkConnectionState.Connected:
        return 'Connected ●';
      case LkConnectionState.Reconnecting:
        return 'Connection interrupted. Reconnecting...';
      case LkConnectionState.Disconnected:
        return 'Disconnected';
      default:
        return 'Unknown connection state';
    }
  };

  const formatSpeakerLabel = (senderId: string, senderName: string) => {
    const isMe = senderId === user?.email || senderId === user?.id;
    return `${senderName} (${isMe ? 'Me' : 'You'})`;
  };

  const workspaceProps = {
    sessionId,
    roomCode,
    isCreator,
    onEndCall,
    onLeaveCall,
    showSettings,
    setShowSettings,
    speakerVolume,
    setSpeakerVolume,
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
    setActiveAudioDevice,
    videoDevices,
    activeVideoDeviceId,
    setActiveVideoDevice,
    showMicDevices,
    setShowMicDevices,
    showCameraDevices,
    setShowCameraDevices,

    localTrack,
    primaryRemoteTrack,
    remoteScreenTrack,
    remoteCameraTrack,

    finalTranscripts,
    interimTranscripts,
    sttSupported,
    formatSpeakerLabel,
    captionsEndRef,

    controlsVisible,
    activeSequence: sequenceQueue[0] || null,
    onSequenceComplete: handleSequenceComplete,
    recoveryState,
  };

  if (user?.accountType === 'ACCESSIBILITY_USER') {
    return <DeafUserWorkspace {...workspaceProps} />;
  }

  const { activeSequence, onSequenceComplete, recoveryState: _, ...hearingProps } = workspaceProps;
  return <HearingUserWorkspace {...hearingProps} />;
};

export default OnlineSessionPage;
