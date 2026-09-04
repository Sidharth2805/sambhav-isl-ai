import React, { useRef, useState, useEffect, useCallback } from 'react';
import { VideoTrack } from '@livekit/components-react';
import { Track, ConnectionState as LkConnectionState } from 'livekit-client';
import DraggableSelfView from './DraggableSelfView';
import type { TranscriptEvent } from '../../types/transcript';
import { ISLAvatarCanvas, type ISLAvatarCanvasRef } from '../cultural/ISLAvatarCanvas';
import { useISLRecognition } from '../../hooks/useISLRecognition';
import { naturalSpeech } from '../../utils/naturalSpeech';
import { ISLMessageComposer } from './ISLMessageComposer';

interface DeafUserWorkspaceProps {
  sessionId: string;
  roomCode: string;
  isCreator: boolean;
  onEndCall: () => void;
  onLeaveCall: () => void;
  user: any;

  connectionState: LkConnectionState;
  getConnectionStatusText: () => string;
  micState: boolean;
  cameraState: boolean;
  screenShareState: boolean;
  handleToggleMic: () => Promise<void>;
  handleToggleCamera: () => Promise<void>;
  handleToggleScreen: () => Promise<void>;

  audioDevices: MediaDeviceInfo[];
  activeAudioDeviceId?: string;
  setActiveAudioDevice: (id: string) => void;
  videoDevices: MediaDeviceInfo[];
  activeVideoDeviceId?: string;
  setActiveVideoDevice: (id: string) => void;
  speakerDevices?: MediaDeviceInfo[];
  activeSpeakerDeviceId?: string;
  setActiveSpeakerDevice?: (id: string) => void;
  showMicDevices: boolean;
  setShowMicDevices: (val: boolean) => void;
  showCameraDevices: boolean;
  setShowCameraDevices: (val: boolean) => void;
  showSpeakerDevices?: boolean;
  setShowSpeakerDevices?: (val: boolean) => void;
  speakerVolume?: number;
  setSpeakerVolume?: (vol: number) => void;

  localTrack: any;
  primaryRemoteTrack: any;

  finalTranscripts: TranscriptEvent[];
  interimTranscripts: Record<string, string>;
  sttSupported: boolean;
  formatSpeakerLabel: (senderId: string, senderName: string) => string;
  captionsEndRef: React.RefObject<HTMLDivElement | null>;

  controlsVisible: boolean;
  activeSequence: any | null;
  onSequenceComplete: () => void;
  recoveryState?: 'CONNECTED' | 'RECONNECTING' | 'RECOVERING' | 'READY';
  onSendMessage?: (text: string) => void;
}

export const DeafUserWorkspace: React.FC<DeafUserWorkspaceProps> = ({
  roomCode,
  isCreator,
  onEndCall,
  onLeaveCall,
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
  speakerDevices = [],
  activeSpeakerDeviceId,
  setActiveSpeakerDevice,
  showMicDevices,
  setShowMicDevices,
  showCameraDevices,
  setShowCameraDevices,
  showSpeakerDevices = false,
  setShowSpeakerDevices,
  speakerVolume = 80,
  setSpeakerVolume,

  localTrack,
  primaryRemoteTrack,

  finalTranscripts,
  interimTranscripts,
  sttSupported: _sttSupported,
  formatSpeakerLabel: _formatSpeakerLabel,
  captionsEndRef,

  controlsVisible: _controlsVisible,
  activeSequence: _activeSequence,
  onSequenceComplete: _onSequenceComplete,
  recoveryState: _recoveryState = 'READY',
  onSendMessage,
}) => {
  const videoParentRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [avatarSpeed, setAvatarSpeed] = useState(1.0);

  // 3-Second Camera Inactivity Auto-Hide Controls
  const [internalControlsVisible, setInternalControlsVisible] = useState(true);
  const hideTimerRef = useRef<any>(null);

  const resetCameraControlsTimer = useCallback(() => {
    setInternalControlsVisible(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      if (!showMicDevices && !showCameraDevices) {
        setInternalControlsVisible(false);
      }
    }, 3000);
  }, [showMicDevices, showCameraDevices]);

  useEffect(() => {
    resetCameraControlsTimer();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [resetCameraControlsTimer]);

  // Keep controls open if device menus are active
  useEffect(() => {
    if (showMicDevices || showCameraDevices) {
      setInternalControlsVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    } else {
      resetCameraControlsTimer();
    }
  }, [showMicDevices, showCameraDevices, resetCameraControlsTimer]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const avatarCanvasRef = useRef<ISLAvatarCanvasRef | null>(null);
  const [modelPath, setModelPath] = useState('/models/ybot.glb');
  const [activeAvatarChar, setActiveAvatarChar] = useState<string | null>(null);

  const speedOptions = [0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0];
  const [activeReadingMessageId, setActiveReadingMessageId] = useState<string | null>(null);

  // Real-time Neural BiLSTM Sign Recognition Hook (171 ISL Classes for letters & words)
  const {
    currentGesture: recognizedSign,
    confidence: signConfidence,
    translatedText: recognizedSignPhrase,
    committedSign,
    isModelOnline,
    startRecognition,
    stopRecognition,
  } = useISLRecognition();

  // Auto-start ISL gesture recognition strictly on the local camera
  useEffect(() => {
    if (cameraState && localTrack) {
      const timer = setTimeout(() => {
        const localVid = (document.querySelector('video[data-self-view="true"]') ||
                         document.querySelector('div[data-self-view="true"] video')) as HTMLVideoElement;
        startRecognition(localVid);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      stopRecognition();
    }
  }, [cameraState, localTrack, startRecognition, stopRecognition]);

  // Helper to check if a sender is the local user
  const isSenderMe = useCallback((senderId: string, senderName?: string) => {
    if (!senderId) return false;
    if (senderId === 'me') return true;
    if (user?.id && senderId === user.id) return true;
    if (user?.email && (senderId === user.email || senderId.toLowerCase() === user.email.toLowerCase())) return true;
    if (user?.name && senderName && senderName === user.name && senderId !== 'remote') return true;
    return false;
  }, [user]);

  // Helper to convert any text into 3D ISL Avatar signing on demand (Manual signing)
  const handleReadMessageInSign = (text: string, msgId?: string) => {
    if (!text || !text.trim()) return;
    if (msgId) setActiveReadingMessageId(msgId);
    avatarCanvasRef.current?.signText(text);
  };

  const lastAutoSignedMsgIdRef = useRef<string | null>(null);

  // Auto-trigger 3D Avatar letter-by-letter signing ONLY for the OTHER person's incoming speech/text
  useEffect(() => {
    // 1. Check for active interim speech strictly from the OTHER person (remote participant)
    const remoteInterimEntries = Object.entries(interimTranscripts).filter(([senderId]) => !isSenderMe(senderId));
    if (remoteInterimEntries.length > 0) {
      const activeRemoteInterim = remoteInterimEntries.map(([, text]) => text).filter(Boolean).join(' ');
      if (activeRemoteInterim.trim()) {
        avatarCanvasRef.current?.signText(activeRemoteInterim);
        return;
      }
    }

    // 2. Check for final transcripts strictly from the OTHER person (remote participant)
    if (finalTranscripts.length > 0) {
      const lastMsg = finalTranscripts[finalTranscripts.length - 1];
      const isRemote = lastMsg && !isSenderMe(lastMsg.senderId, lastMsg.senderName);
      if (isRemote && lastMsg.text && lastMsg.id !== lastAutoSignedMsgIdRef.current) {
        lastAutoSignedMsgIdRef.current = lastMsg.id;
        avatarCanvasRef.current?.signText(lastMsg.text);
      }
    }
  }, [interimTranscripts, finalTranscripts, isSenderMe]);

  const handleSpeakMessageAloud = (text: string) => {
    if (!text || !text.trim()) return;
    naturalSpeech.speak(text);
  };

  // Caption Font Size Selector
  const [captionFontSize, setCaptionFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  const isRemoteSpeaking = Object.entries(interimTranscripts).some(([senderId]) => !isSenderMe(senderId));

  return (
    <div className="w-full h-[calc(100vh-90px)] md:h-[calc(100vh-75px)] flex flex-col justify-between gap-2 select-none font-['Inter',sans-serif] overflow-hidden">
      
      {/* Screen Sharing Notification */}
      {screenShareState && (
        <div className="bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md z-50 flex items-center justify-center gap-2 animate-pulse mx-auto flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>Screen Sharing is Active</span>
        </div>
      )}

      {/* Main 2-Column Calling Arena (Shifted to Very Top - Fits Screen Perfectly) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: 3D ISL Signing Avatar Screen                 */}
        {/* ========================================================= */}
        <section className="lg:col-span-6 bg-[#030813] rounded-2xl border border-[#e0e3e5] dark:border-[#2d3133] shadow-sm flex flex-col relative overflow-hidden h-full min-h-0">
          <div className="absolute top-2.5 left-3 z-20 flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-black/70 backdrop-blur-md border border-white/10 text-white rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow">
              <span className="w-2 h-2 rounded-full bg-[#fe9832] animate-pulse" />
              <span>ISL 3D Avatar (Letter-by-Letter)</span>
            </span>

            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-0.5 rounded-full border border-white/10 text-[10px]">
              <button
                type="button"
                onClick={() => setModelPath('/models/ybot.glb')}
                className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                  modelPath.includes('ybot') ? 'bg-[#fe9832] text-[#542900]' : 'text-white/70'
                }`}
              >
                YBot
              </button>
              <button
                type="button"
                onClick={() => setModelPath('/models/xbot.glb')}
                className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                  modelPath.includes('xbot') ? 'bg-[#fe9832] text-[#542900]' : 'text-white/70'
                }`}
              >
                XBot
              </button>
            </div>
          </div>

          <div className="flex-1 w-full h-full flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#050b16] via-[#091325] to-[#040914]">
            <ISLAvatarCanvas
              ref={avatarCanvasRef}
              modelPath={modelPath}
              speed={avatarSpeed}
              pauseTimeMs={Math.round(400 / avatarSpeed)}
              onProgressChar={(char) => setActiveAvatarChar(char)}
              className="w-full h-full"
            />

            {/* Target Letter Overlay Badge */}
            {activeAvatarChar && (
              <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-xs font-mono font-bold text-[#8dfc75] shadow-lg z-10 flex items-center gap-2">
                <span className="text-[10px] text-white/60 uppercase">Target Signal:</span>
                <span className="text-sm text-[#fe9832]">"{activeAvatarChar}"</span>
              </div>
            )}
          </div>

          {/* Speed Selector Footer */}
          <div className="bg-black/60 backdrop-blur-md border-t border-white/10 px-3 py-1.5 flex items-center justify-between text-xs text-white">
            <span className="text-[11px] font-bold text-white/70">Playback Speed:</span>
            <div className="flex items-center gap-1 overflow-x-auto">
              {[0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setAvatarSpeed(s)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    avatarSpeed === s ? 'bg-[#fe9832] text-[#542900]' : 'bg-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Video Camera Arena & Self View              */}
        {/* ========================================================= */}
        <section
          ref={videoParentRef}
          onMouseMove={resetCameraControlsTimer}
          onMouseEnter={resetCameraControlsTimer}
          onTouchStart={resetCameraControlsTimer}
          className="lg:col-span-6 bg-[#030813] rounded-2xl border border-[#e0e3e5] dark:border-[#2d3133] shadow-sm flex flex-col relative overflow-hidden h-full min-h-0 group"
        >

          {primaryRemoteTrack ? (
            <VideoTrack trackRef={primaryRemoteTrack as any} className="w-full h-full object-cover" data-remote="true" />
          ) : (
            <div className="w-full h-full text-center flex flex-col items-center justify-center gap-2 p-4 text-[#828796]">
              <span className="material-symbols-outlined text-[36px] sm:text-[44px] text-[#fe9832] animate-pulse">videocam</span>
              <span className="text-xs font-bold uppercase tracking-wider text-white">Remote Camera Inactive</span>
              <span className="text-[10px] text-[#828796]">Waiting for hearing participant to join...</span>
            </div>
          )}

          {/* Screen Share Tag */}
          {primaryRemoteTrack?.source === Track.Source.ScreenShare && (
            <div className="absolute top-2.5 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow z-10 flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>Viewing Screen Share</span>
            </div>
          )}

          {/* Live ISL Gesture Recognition HUD Overlay */}
          {cameraState && (
            <div className="absolute top-2.5 right-3 z-30 flex items-center gap-2">
              {recognizedSign ? (
                <div className="bg-black/85 backdrop-blur-md px-3 py-1 rounded-xl border border-emerald-500/50 text-white flex items-center gap-2 shadow-xl animate-scaleUp">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wide">
                    Sign: {recognizedSignPhrase || recognizedSign}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300 font-bold px-1.5 py-0.2 rounded bg-emerald-950/80">
                    {Math.round(signConfidence * 100)}%
                  </span>
                </div>
              ) : (
                <div className="bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15 text-white/80 text-[10px] font-bold flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isModelOnline ? 'bg-emerald-400 animate-ping' : 'bg-[#fe9832] animate-pulse'}`} />
                  <span>{isModelOnline ? '171-Class BiLSTM Neural Live' : 'AI Gesture Recognition Active (171 Classes)'}</span>
                </div>
              )}
            </div>
          )}

          {/* Draggable Self-View Camera */}
          <DraggableSelfView
            parentRef={videoParentRef}
            cameraState={cameraState}
            localTrack={localTrack}
          />

          {/* Floating Action Controls */}
          <footer
            className={`absolute bottom-2.5 inset-x-2.5 z-40 bg-white/95 dark:bg-[#030813]/85 backdrop-blur-2xl border border-[#e0e3e5] dark:border-white/15 px-2.5 py-1.5 rounded-2xl flex items-center justify-between shadow-xl transition-all duration-300 transform ${
              internalControlsVisible
                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                : 'opacity-0 translate-y-3 scale-95 pointer-events-none'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {/* Mic Toggle */}
              <div className="relative flex items-center bg-[#f1f4f6] dark:bg-white/10 hover:bg-[#e0e3e5] dark:hover:bg-white/15 rounded-xl border border-[#e0e3e5] dark:border-white/10 transition-all shadow-sm">
                <button
                  type="button"
                  onClick={handleToggleMic}
                  className={`h-8 sm:h-9 px-2.5 rounded-l-xl transition-all duration-200 flex items-center gap-1 active:scale-95 ${
                    micState
                      ? 'text-[#030813] dark:text-white hover:text-green-600 dark:hover:text-green-400'
                      : 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                  }`}
                  aria-label={micState ? 'Mute microphone' : 'Unmute microphone'}
                  title={micState ? 'Mute Microphone' : 'Unmute Microphone'}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {micState ? 'mic' : 'mic_off'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMicDevices(!showMicDevices);
                    setShowCameraDevices(false);
                  }}
                  className="h-8 sm:h-9 px-1.5 rounded-r-xl border-l border-[#e0e3e5] dark:border-white/15 hover:bg-[#e0e3e5] dark:hover:bg-white/20 text-[#030813] dark:text-white transition-all active:scale-95"
                >
                  <span className={`material-symbols-outlined text-[14px] ${showMicDevices ? 'rotate-180 text-[#fe9832]' : ''}`}>
                    expand_less
                  </span>
                </button>

                {showMicDevices && (
                  <div className="absolute bottom-11 left-0 bg-white dark:bg-[#1a202c] border border-[#e0e3e5] dark:border-white/15 rounded-2xl shadow-2xl p-2 w-64 z-50 flex flex-col gap-1 max-h-48 overflow-y-auto text-xs text-[#030813] dark:text-white animate-scaleUp">
                    <div className="text-[10px] font-bold text-[#828796] uppercase px-1.5 py-0.5">Microphones</div>
                    {audioDevices.map((d) => (
                      <button
                        key={d.deviceId}
                        onClick={() => {
                          setActiveAudioDevice(d.deviceId);
                          setShowMicDevices(false);
                        }}
                        title={d.label || 'Microphone'}
                        className={`text-left p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
                          activeAudioDeviceId === d.deviceId ? 'bg-[#fe9832] text-[#683700] font-bold' : 'hover:bg-[#f1f4f6] dark:hover:bg-white/10'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px] flex-shrink-0">mic</span>
                        <span className="truncate">{d.label || 'Microphone'}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Camera Toggle */}
              <div className="relative flex items-center bg-[#f1f4f6] dark:bg-white/10 hover:bg-[#e0e3e5] dark:hover:bg-white/15 rounded-xl border border-[#e0e3e5] dark:border-white/10 transition-all shadow-sm">
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className={`h-8 sm:h-9 px-2.5 rounded-l-xl transition-all duration-200 flex items-center gap-1 active:scale-95 ${
                    cameraState
                      ? 'text-[#030813] dark:text-white hover:text-green-600 dark:hover:text-green-400'
                      : 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                  }`}
                  aria-label={cameraState ? 'Turn off camera' : 'Turn on camera'}
                  title={cameraState ? 'Turn off camera' : 'Turn on camera'}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {cameraState ? 'videocam' : 'videocam_off'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowCameraDevices(!showCameraDevices);
                    setShowMicDevices(false);
                  }}
                  className="h-8 sm:h-9 px-1.5 rounded-r-xl border-l border-[#e0e3e5] dark:border-white/15 hover:bg-[#e0e3e5] dark:hover:bg-white/20 text-[#030813] dark:text-white transition-all active:scale-95"
                >
                  <span className={`material-symbols-outlined text-[14px] ${showCameraDevices ? 'rotate-180 text-[#fe9832]' : ''}`}>
                    expand_less
                  </span>
                </button>

                {showCameraDevices && (
                  <div className="absolute bottom-11 left-0 bg-white dark:bg-[#1a202c] border border-[#e0e3e5] dark:border-white/15 rounded-2xl shadow-2xl p-2 w-64 z-50 flex flex-col gap-1 max-h-48 overflow-y-auto text-xs text-[#030813] dark:text-white animate-scaleUp">
                    <div className="text-[10px] font-bold text-[#828796] uppercase px-1.5 py-0.5">Cameras</div>
                    {videoDevices.map((d) => (
                      <button
                        key={d.deviceId}
                        onClick={() => {
                          setActiveVideoDevice(d.deviceId);
                          setShowCameraDevices(false);
                        }}
                        title={d.label || 'Camera'}
                        className={`text-left p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
                          activeVideoDeviceId === d.deviceId ? 'bg-[#fe9832] text-[#683700] font-bold' : 'hover:bg-[#f1f4f6] dark:hover:bg-white/10'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px] flex-shrink-0">videocam</span>
                        <span className="truncate">{d.label || 'Camera'}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Screen Share Button */}
              <button
                type="button"
                onClick={handleToggleScreen}
                className={`h-8 sm:h-9 px-2.5 rounded-xl border transition-all duration-200 flex items-center justify-center active:scale-95 ${
                  screenShareState
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md font-bold border-transparent'
                    : 'bg-[#f1f4f6] dark:bg-white/10 hover:bg-[#e0e3e5] dark:hover:bg-white/20 text-[#030813] dark:text-white border-[#e0e3e5] dark:border-white/10'
                }`}
                title="Screen Share"
              >
                <span className="material-symbols-outlined text-[16px]">present_to_all</span>
              </button>

              {/* Speaker / Output Audio Device Selector */}
              <div className="relative flex items-center bg-[#f1f4f6] dark:bg-white/10 hover:bg-[#e0e3e5] dark:hover:bg-white/15 rounded-xl border border-[#e0e3e5] dark:border-white/10 transition-all shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    if (setShowSpeakerDevices) {
                      setShowSpeakerDevices(!showSpeakerDevices);
                      setShowMicDevices(false);
                      setShowCameraDevices(false);
                    }
                  }}
                  className="h-8 sm:h-9 px-2.5 rounded-l-xl transition-all duration-200 flex items-center gap-1 active:scale-95 text-[#030813] dark:text-white"
                  title="Audio Output (Speakers / Bluetooth Headphones)"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {speakerVolume === 0 ? 'volume_off' : speakerVolume > 50 ? 'volume_up' : 'volume_down'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (setShowSpeakerDevices) {
                      setShowSpeakerDevices(!showSpeakerDevices);
                      setShowMicDevices(false);
                      setShowCameraDevices(false);
                    }
                  }}
                  className="h-8 sm:h-9 px-1.5 rounded-r-xl border-l border-[#e0e3e5] dark:border-white/15 hover:bg-[#e0e3e5] dark:hover:bg-white/20 text-[#030813] dark:text-white transition-all active:scale-95"
                >
                  <span className={`material-symbols-outlined text-[14px] ${showSpeakerDevices ? 'rotate-180 text-[#fe9832]' : ''}`}>
                    expand_less
                  </span>
                </button>

                {showSpeakerDevices && (
                  <div className="absolute bottom-11 left-0 bg-white dark:bg-[#1a202c] border border-[#e0e3e5] dark:border-white/15 rounded-2xl shadow-2xl p-2.5 w-64 z-50 flex flex-col gap-2 max-h-56 overflow-y-auto text-xs text-[#030813] dark:text-white animate-scaleUp">
                    <div className="text-[10px] font-bold text-[#828796] uppercase px-1">Audio Output Devices</div>
                    
                    {/* Volume Slider */}
                    <div className="p-2 bg-[#f8fafc] dark:bg-white/5 rounded-xl flex items-center gap-2 border border-[#e0e3e5] dark:border-white/10">
                      <span className="material-symbols-outlined text-[15px] text-[#fe9832]">volume_up</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={speakerVolume}
                        onChange={(e) => setSpeakerVolume && setSpeakerVolume(Number(e.target.value))}
                        className="flex-1 accent-[#fe9832] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                      />
                      <span className="text-[10px] font-bold w-7 text-right">{speakerVolume}%</span>
                    </div>

                    {/* Output Hardware List */}
                    <div className="flex flex-col gap-1">
                      {speakerDevices.length > 0 ? (
                        speakerDevices.map((d) => (
                          <button
                            key={d.deviceId}
                            onClick={() => {
                              if (setActiveSpeakerDevice) setActiveSpeakerDevice(d.deviceId);
                              if (setShowSpeakerDevices) setShowSpeakerDevices(false);
                            }}
                            className={`text-left p-1.5 rounded-lg text-xs truncate transition-colors flex items-center gap-1.5 ${
                              activeSpeakerDeviceId === d.deviceId ? 'bg-[#fe9832] text-[#683700] font-bold' : 'hover:bg-[#f1f4f6] dark:hover:bg-white/10'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {d.label?.toLowerCase().includes('bluetooth') || d.label?.toLowerCase().includes('headphone') || d.label?.toLowerCase().includes('airpods') || d.label?.toLowerCase().includes('earbuds') ? 'headphones' : 'speaker'}
                            </span>
                            <span className="truncate">{d.label || 'Default Output Device'}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-1.5 text-[11px] text-[#828796] italic">
                          System default speaker active
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* End Call / Leave Button */}
            {isCreator ? (
              <button
                type="button"
                onClick={onEndCall}
                className="h-8 sm:h-9 px-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-1 active:scale-95"
              >
                <span className="material-symbols-outlined text-[15px]">call_end</span>
                <span>End</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onLeaveCall}
                className="h-8 sm:h-9 px-3 bg-[#f1f4f6] dark:bg-slate-700 hover:bg-[#e0e3e5] text-[#030813] dark:text-white rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 border border-[#e0e3e5] dark:border-white/10"
              >
                <span className="material-symbols-outlined text-[15px]">logout</span>
                <span>Leave</span>
              </button>
            )}
          </footer>
        </section>

      </div>

      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* MIDDLE SECTION: Live Subtitles & Captions Deck            */}
      {/* ========================================================= */}
      <section className="bg-white dark:bg-[#151c28] text-[#030813] dark:text-white rounded-2xl border border-[#e0e3e5] dark:border-[#243044] p-2.5 sm:p-3 shadow-sm flex flex-col gap-1.5 h-28 sm:h-32 md:h-36 max-h-[145px] flex-shrink-0 relative overflow-hidden">
        
        {/* Top Header Deck: Broadcast Live Pill + Font Size Controls */}
        <div className="flex items-center justify-between border-b border-[#e0e3e5] dark:border-white/10 pb-1 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#fe9832]/15 border border-[#fe9832]/30 text-[#8f4e00] dark:text-[#fe9832] rounded-full text-[9px] font-black tracking-wider uppercase flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isRemoteSpeaking ? 'bg-green-500 animate-ping' : 'bg-[#fe9832]'}`} />
              <span>LIVE CC</span>
            </span>

            {/* Live speech activity indicator */}
            <div className="flex items-end gap-0.5 h-3 px-1">
              <span className={`w-1 bg-[#fe9832] rounded-full transition-all duration-150 ${isRemoteSpeaking ? 'h-3 animate-pulse' : 'h-1 opacity-40'}`} />
              <span className={`w-1 bg-green-500 rounded-full transition-all duration-150 ${isRemoteSpeaking ? 'h-3.5 animate-pulse' : 'h-1.5 opacity-40'}`} />
            </div>

            <span className="text-[10px] font-semibold text-[#45474c] dark:text-[#828796] hidden sm:inline">
              Conversational Subtitles (Click 🤟 on any message to sign in 3D Avatar)
            </span>
          </div>

          {/* Subtitle Font Size Scaler */}
          <div className="flex items-center gap-0.5 bg-[#f1f4f6] dark:bg-white/10 p-0.5 rounded-lg border border-[#e0e3e5] dark:border-white/10">
            <span className="text-[9px] font-bold text-[#828796] pl-1 pr-0.5">Size:</span>
            {(['sm', 'base', 'lg'] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setCaptionFontSize(size)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${
                  captionFontSize === size
                    ? 'bg-[#fe9832] text-[#542900] shadow-xs font-black'
                    : 'text-[#45474c] dark:text-[#c1c6d7] hover:text-[#030813] dark:hover:text-white'
                }`}
              >
                {size === 'sm' ? 'A-' : size === 'base' ? 'A' : 'A+'}
              </button>
            ))}
          </div>
        </div>

        {/* Subtitle Messages Container */}
        <div className={`flex-1 overflow-y-auto flex flex-col gap-1.5 leading-relaxed pr-1.5 font-medium custom-scrollbar ${
          captionFontSize === 'sm' ? 'text-xs' : captionFontSize === 'lg' ? 'text-base font-semibold' : 'text-sm'
        }`}>
          {finalTranscripts.map((t) => {
            const isMe = isSenderMe(t.senderId, t.senderName);
            const isCurrentlyReading = activeReadingMessageId === t.id;

            return (
              <div
                key={t.id}
                className={`group flex items-start justify-between gap-2 p-1.5 sm:p-2 rounded-xl transition-all ${
                  isCurrentlyReading
                    ? 'bg-[#fe9832]/25 dark:bg-[#fe9832]/30 border border-[#fe9832] ring-2 ring-[#fe9832]/40 shadow-sm'
                    : isMe
                    ? 'bg-[#fe9832]/10 dark:bg-[#fe9832]/15 border border-[#fe9832]/25 self-end max-w-[88%]'
                    : 'bg-[#f7fafc] dark:bg-white/5 border border-[#e0e3e5] dark:border-white/15 self-start max-w-[92%]'
                }`}
              >
                <div className="flex items-start gap-1.5 flex-1 min-w-0">
                  <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${
                    isMe
                      ? 'bg-[#fe9832]/25 text-[#8f4e00] dark:text-[#fe9832]'
                      : 'bg-emerald-500/20 text-emerald-800 dark:text-[#8dfc75]'
                  }`}>
                    {isMe ? 'You' : (t.senderName || 'Participant')}
                  </span>
                  <span className="text-[#030813] dark:text-white tracking-wide break-words flex-1">{t.text}</span>
                </div>

                {/* Read Actions for this Message */}
                <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleReadMessageInSign(t.text, t.id)}
                    className="p-1 hover:bg-[#fe9832]/20 rounded-md text-[#fe9832] transition-all active:scale-95 cursor-pointer"
                    title="Read this message in 3D ISL Sign Avatar"
                    aria-label="Read in Sign Avatar"
                  >
                    <span className="material-symbols-outlined text-[14px]">sign_language</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSpeakMessageAloud(t.text)}
                    className="p-1 hover:bg-green-500/20 rounded-md text-green-600 dark:text-green-400 transition-all active:scale-95 cursor-pointer"
                    title="Read this message aloud (Voice Audio)"
                    aria-label="Read Aloud in Voice"
                  >
                    <span className="material-symbols-outlined text-[14px]">volume_up</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Live In-Progress Interim Speech Stream */}
          {Object.entries(interimTranscripts).map(([senderId, text]) => {
            const isMe = isSenderMe(senderId);
            const senderName = finalTranscripts.find((t) => t.senderId === senderId)?.senderName || 'Participant';
            return (
              <div
                key={senderId}
                className={`flex items-start gap-2 p-1.5 rounded-xl bg-amber-500/10 border border-amber-400/30 max-w-[90%] ${
                  isMe ? 'self-end' : 'self-start'
                }`}
              >
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400 text-black shrink-0 mt-0.5">
                  {isMe ? 'You' : senderName}
                </span>
                <span className="text-[#b45309] dark:text-[#fe9832] italic text-xs break-words">{text}...</span>
              </div>
            );
          })}

          {finalTranscripts.length === 0 && Object.keys(interimTranscripts).length === 0 && (
            <div className="flex items-center justify-center my-auto text-center text-[#828796] gap-1.5 text-xs py-1">
              <span className="material-symbols-outlined text-[16px] text-[#fe9832]/60 animate-pulse">hearing</span>
              <span>Subtitles will appear here in real-time. Click 🤟 on any message to sign in 3D.</span>
            </div>
          )}

          <div ref={captionsEndRef} />
        </div>
      </section>

      {/* ========================================================= */}
      {/* DEAF USER ISL RECOGNITION MESSAGE COMPOSER                */}
      {/* ========================================================= */}
      <section className="flex-shrink-0">
        <ISLMessageComposer
          incomingCommittedSign={committedSign}
          incomingMLWord={recognizedSignPhrase || recognizedSign}
          incomingConfidence={signConfidence}
          isModelActive={cameraState && isModelOnline}
          onSendMessage={(finalText) => {
            if (onSendMessage) {
              onSendMessage(finalText);
            }
          }}
          onSpeakDraft={(text) => handleSpeakMessageAloud(text)}
          onReadInSign={(text) => handleReadMessageInSign(text)}
          placeholder="🤟 Show signs to camera to compose your message. Captured letters and words write here until you send..."
        />
      </section>

      {/* ========================================================= */}
      {/* BOTTOM FOOTER BAR: Unique Room Code + Speed + Status     */}
      {/* ========================================================= */}
      <footer className="bg-white dark:bg-[#1a202c] px-3.5 py-1 rounded-xl border border-[#e0e3e5] dark:border-[#2d3133] flex items-center justify-between shadow-xs flex-shrink-0 text-xs h-8">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#45474c] dark:text-[#828796]">
            Room Code:
          </span>
          <span className="font-mono text-xs font-black text-[#fe9832] tracking-wider">
            {roomCode}
          </span>
          <button
            type="button"
            onClick={handleCopyCode}
            className="px-2 py-0.5 bg-[#f1f4f6] dark:bg-[#2d3133] hover:bg-[#e0e3e5] text-[#030813] dark:text-white rounded-md text-[10px] font-bold transition-all flex items-center gap-1 active:scale-95"
            aria-label="Copy Room Code"
          >
            <span className="material-symbols-outlined text-[13px]">{copied ? 'check' : 'content_copy'}</span>
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Speed Controls Selector */}
        <div className="flex items-center gap-1 bg-[#f1f4f6] dark:bg-[#030813] px-1.5 py-0.5 rounded-lg border border-[#e0e3e5] dark:border-[#2d3133]">
          <span className="text-[10px] font-bold text-[#45474c] dark:text-[#828796] pr-0.5">Speed:</span>
          {speedOptions.map((spd) => (
            <button
              key={spd}
              type="button"
              onClick={() => setAvatarSpeed(spd)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                avatarSpeed === spd
                  ? 'bg-[#fe9832] text-[#683700] font-black shadow-xs'
                  : 'text-[#45474c] dark:text-[#828796] hover:text-[#030813] dark:hover:text-white'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Connection Status Badge */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              connectionState === LkConnectionState.Connected
                ? 'bg-green-500 animate-pulse'
                : 'bg-amber-500'
            }`}
            aria-hidden="true"
          />
          <span className="text-[11px] font-bold text-[#030813] dark:text-white">
            {getConnectionStatusText()}
          </span>
        </div>
      </footer>

    </div>
  );
};

export default DeafUserWorkspace;
