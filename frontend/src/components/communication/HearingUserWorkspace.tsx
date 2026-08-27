import React, { useRef, useState, useEffect, useCallback } from 'react';
import { VideoTrack } from '@livekit/components-react';
import { ConnectionState as LkConnectionState } from 'livekit-client';
import DraggableSelfView from './DraggableSelfView';
import type { TranscriptEvent } from '../../types/transcript';
import { naturalSpeech } from '../../utils/naturalSpeech';

interface HearingUserWorkspaceProps {
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
  onSendMessage?: (text: string) => void;
}

export const HearingUserWorkspace: React.FC<HearingUserWorkspaceProps> = ({
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
  onSendMessage,
}) => {
  const [typedMessage, setTypedMessage] = useState('');
  const videoParentRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);

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

  // Text-To-Speech (TTS) for reading remote Deaf participant messages
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const spokenTranscriptIdsRef = useRef<Set<string>>(new Set());

  // Trigger Natural Human Speech synthesis ONLY for the hearing-issue / remote participant's messages
  useEffect(() => {
    if (!ttsEnabled || typeof window === 'undefined') {
      return;
    }

    finalTranscripts.forEach((transcript) => {
      // Check if not already spoken AND sender is NOT the current hearing user (remote deaf participant only)
      const isMe = transcript.senderId === user?.email || transcript.senderId === user?.id;
      if (!isMe && transcript.text && !spokenTranscriptIdsRef.current.has(transcript.id)) {
        spokenTranscriptIdsRef.current.add(transcript.id);
        
        try {
          naturalSpeech.speak(transcript.text, {
            rate: 0.96,
            pitch: 1.02,
          });
        } catch (ttsErr) {
          console.warn('[Natural Speech Error]:', ttsErr);
        }
      }
    });
  }, [finalTranscripts, ttsEnabled, user]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-[calc(100vh-140px)] md:h-[calc(100vh-115px)] flex flex-col gap-4 min-h-0 select-none font-['Inter',sans-serif] overflow-hidden">
      
      {/* Screen Sharing Alert Pill */}
      {screenShareState && (
        <div className="bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md z-50 flex items-center justify-center gap-2 animate-pulse mx-auto flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>Screen Sharing is Active</span>
        </div>
      )}

      {/* 2-Column Responsive Layout: Mobile: Video First (Top) & Chat Second (Bottom) | Desktop: Left Chat, Right Video */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-3.5 min-h-0 h-full overflow-hidden">
        
        {/* ========================================================= */}
        {/* VIDEO CAMERA ARENA (Mobile: ORDER-1 TOP | Desktop: RIGHT)  */}
        {/* ========================================================= */}
        <section className="order-1 lg:order-2 lg:col-span-6 flex flex-col gap-2.5 shrink-0 lg:shrink lg:h-full min-h-0">
          
          {/* Top Room Code & Connection Banner */}
          <div className="bg-white dark:bg-[#1a202c] px-4 py-2 rounded-2xl border border-[#e0e3e5] dark:border-[#2d3133] flex items-center justify-between shadow-sm flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#45474c] dark:text-[#828796]">
                Room Code
              </span>
              <span className="font-mono text-base font-black text-[#fe9832] tracking-widest">
                {roomCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-2.5 py-1 bg-[#f1f4f6] dark:bg-[#2d3133] hover:bg-[#e0e3e5] text-[#030813] dark:text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 active:scale-95"
                aria-label="Copy Room Code"
              >
                <span className="material-symbols-outlined text-[14px]">{copied ? 'check' : 'content_copy'}</span>
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Connection Indicator */}
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  connectionState === LkConnectionState.Connected
                    ? 'bg-green-500 animate-pulse'
                    : 'bg-amber-500'
                }`}
                aria-hidden="true"
              />
              <span className="text-xs font-bold text-[#030813] dark:text-white">
                {getConnectionStatusText()}
              </span>
            </div>
          </div>

          {/* Main Video View Container (Fixed/Sticky on mobile with portrait flexibility) */}
          <div
            ref={videoParentRef}
            onMouseMove={resetCameraControlsTimer}
            onMouseEnter={resetCameraControlsTimer}
            onTouchStart={resetCameraControlsTimer}
            className="flex-1 h-[220px] sm:h-[280px] lg:h-full bg-[#030813] rounded-[24px] border border-[#e0e3e5] dark:border-[#2d3133] shadow-sm flex flex-col relative overflow-hidden group min-h-0"
          >
            {primaryRemoteTrack ? (
              <VideoTrack trackRef={primaryRemoteTrack as any} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full text-center flex flex-col items-center justify-center gap-3 p-6 text-[#828796]">
                <span className="material-symbols-outlined text-[48px] text-[#fe9832] animate-pulse">videocam</span>
                <span className="text-xs font-bold uppercase tracking-wider text-white">Camera Inactive</span>
                <span className="text-[11px] text-[#828796]">Waiting for other participant to join...</span>
              </div>
            )}

            {/* Draggable Self View */}
            <DraggableSelfView
              parentRef={videoParentRef}
              cameraState={cameraState}
              localTrack={localTrack}
            />

            {/* Floating Action Controls */}
            <footer
              className={`absolute bottom-3 inset-x-3 z-40 bg-white/95 dark:bg-[#030813]/85 backdrop-blur-2xl border border-[#e0e3e5] dark:border-white/15 px-3 py-2 rounded-2xl flex items-center justify-between shadow-xl transition-all duration-300 transform ${
                internalControlsVisible
                  ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                  : 'opacity-0 translate-y-3 scale-95 pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-2">
                {/* Mic Capsule */}
                <div className="relative flex items-center bg-[#f1f4f6] dark:bg-white/10 hover:bg-[#e0e3e5] dark:hover:bg-white/15 rounded-2xl border border-[#e0e3e5] dark:border-white/10 transition-all shadow-sm">
                  <button
                    type="button"
                    onClick={handleToggleMic}
                    className={`h-9 sm:h-10 px-2.5 sm:px-3 rounded-l-2xl transition-all duration-200 flex items-center gap-1.5 active:scale-95 ${
                      micState
                        ? 'text-[#030813] dark:text-white hover:text-green-600 dark:hover:text-green-400'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {micState ? 'mic' : 'mic_off'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMicDevices(!showMicDevices);
                      setShowCameraDevices(false);
                    }}
                    className="h-9 sm:h-10 px-2 rounded-r-2xl border-l border-[#e0e3e5] dark:border-white/15 hover:bg-[#e0e3e5] dark:hover:bg-white/20 text-[#030813] dark:text-white transition-all active:scale-95"
                  >
                    <span className={`material-symbols-outlined text-[15px] ${showMicDevices ? 'rotate-180 text-[#fe9832]' : ''}`}>
                      expand_less
                    </span>
                  </button>

                  {showMicDevices && (
                    <div className="absolute bottom-12 left-0 bg-white dark:bg-[#1a202c] border border-[#e0e3e5] dark:border-white/15 rounded-2xl shadow-2xl p-2 w-64 z-50 flex flex-col gap-1 max-h-48 overflow-y-auto text-xs text-[#030813] dark:text-white animate-scaleUp">
                      <div className="text-[10px] font-bold text-[#828796] uppercase px-1.5 py-0.5">Microphones</div>
                      {audioDevices.map((d) => (
                        <button
                          key={d.deviceId}
                          onClick={() => {
                            setActiveAudioDevice(d.deviceId);
                            setShowMicDevices(false);
                          }}
                          title={d.label || 'Microphone'}
                          className={`text-left p-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 ${
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

                {/* Camera Capsule */}
                <div className="relative flex items-center bg-[#f1f4f6] dark:bg-white/10 hover:bg-[#e0e3e5] dark:hover:bg-white/15 rounded-2xl border border-[#e0e3e5] dark:border-white/10 transition-all shadow-sm">
                  <button
                    type="button"
                    onClick={handleToggleCamera}
                    className={`h-9 sm:h-10 px-2.5 sm:px-3 rounded-l-2xl transition-all duration-200 flex items-center gap-1.5 active:scale-95 ${
                      cameraState
                        ? 'text-[#030813] dark:text-white hover:text-green-600 dark:hover:text-green-400'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {cameraState ? 'videocam' : 'videocam_off'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCameraDevices(!showCameraDevices);
                      setShowMicDevices(false);
                    }}
                    className="h-9 sm:h-10 px-2 rounded-r-2xl border-l border-[#e0e3e5] dark:border-white/15 hover:bg-[#e0e3e5] dark:hover:bg-white/20 text-[#030813] dark:text-white transition-all active:scale-95"
                  >
                    <span className={`material-symbols-outlined text-[15px] ${showCameraDevices ? 'rotate-180 text-[#fe9832]' : ''}`}>
                      expand_less
                    </span>
                  </button>

                  {showCameraDevices && (
                    <div className="absolute bottom-12 left-0 bg-white dark:bg-[#1a202c] border border-[#e0e3e5] dark:border-white/15 rounded-2xl shadow-2xl p-2 w-64 z-50 flex flex-col gap-1 max-h-48 overflow-y-auto text-xs text-[#030813] dark:text-white animate-scaleUp">
                      <div className="text-[10px] font-bold text-[#828796] uppercase px-1.5 py-0.5">Cameras</div>
                      {videoDevices.map((d) => (
                        <button
                          key={d.deviceId}
                          onClick={() => {
                            setActiveVideoDevice(d.deviceId);
                            setShowCameraDevices(false);
                          }}
                          title={d.label || 'Camera'}
                          className={`text-left p-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 ${
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

                {/* Screen Share */}
                <button
                  type="button"
                  onClick={handleToggleScreen}
                  className={`h-9 sm:h-10 px-2.5 sm:px-3 rounded-2xl border transition-all duration-200 flex items-center justify-center active:scale-95 ${
                    screenShareState
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md font-bold border-transparent'
                      : 'bg-[#f1f4f6] dark:bg-white/10 hover:bg-[#e0e3e5] dark:hover:bg-white/20 text-[#030813] dark:text-white border-[#e0e3e5] dark:border-white/10'
                  }`}
                  title="Screen Share"
                >
                  <span className="material-symbols-outlined text-[18px]">present_to_all</span>
                </button>

                {/* Speaker / Output Audio Device Selector */}
                <div className="relative flex items-center bg-[#f1f4f6] dark:bg-white/10 hover:bg-[#e0e3e5] dark:hover:bg-white/15 rounded-2xl border border-[#e0e3e5] dark:border-white/10 transition-all shadow-sm">
                  <button
                    type="button"
                    onClick={() => {
                      if (setShowSpeakerDevices) {
                        setShowSpeakerDevices(!showSpeakerDevices);
                        setShowMicDevices(false);
                        setShowCameraDevices(false);
                      }
                    }}
                    className="h-9 sm:h-10 px-3 rounded-l-2xl transition-all duration-200 flex items-center gap-1 active:scale-95 text-[#030813] dark:text-white"
                    title="Audio Output (Speakers / Bluetooth Headphones)"
                  >
                    <span className="material-symbols-outlined text-[18px]">
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
                    className="h-9 sm:h-10 px-2 rounded-r-2xl border-l border-[#e0e3e5] dark:border-white/15 hover:bg-[#e0e3e5] dark:hover:bg-white/20 text-[#030813] dark:text-white transition-all active:scale-95"
                  >
                    <span className={`material-symbols-outlined text-[16px] ${showSpeakerDevices ? 'rotate-180 text-[#fe9832]' : ''}`}>
                      expand_less
                    </span>
                  </button>

                  {showSpeakerDevices && (
                    <div className="absolute bottom-12 left-0 bg-white dark:bg-[#1a202c] border border-[#e0e3e5] dark:border-white/15 rounded-2xl shadow-2xl p-3 w-64 z-50 flex flex-col gap-2 max-h-56 overflow-y-auto text-xs text-[#030813] dark:text-white animate-scaleUp">
                      <div className="text-[10px] font-bold text-[#828796] uppercase px-1">Audio Output Devices</div>
                      
                      {/* Volume Slider */}
                      <div className="p-2 bg-[#f8fafc] dark:bg-white/5 rounded-xl flex items-center gap-2 border border-[#e0e3e5] dark:border-white/10">
                        <span className="material-symbols-outlined text-[16px] text-[#fe9832]">volume_up</span>
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
                              className={`text-left p-2 rounded-xl text-xs truncate transition-colors flex items-center gap-2 ${
                                activeSpeakerDeviceId === d.deviceId ? 'bg-[#fe9832] text-[#683700] font-bold' : 'hover:bg-[#f1f4f6] dark:hover:bg-white/10'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">
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

              {/* End/Leave Button */}
              {isCreator ? (
                <button
                  type="button"
                  onClick={onEndCall}
                  className="h-9 sm:h-10 px-3 sm:px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">call_end</span>
                  <span>End</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onLeaveCall}
                  className="h-9 sm:h-10 px-3 sm:px-4 bg-[#f1f4f6] dark:bg-slate-700 hover:bg-[#e0e3e5] text-[#030813] dark:text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Leave</span>
                </button>
              )}
            </footer>
          </div>
        </section>

        {/* ========================================================= */}
        {/* LIVE CONVERSATION CHAT (Mobile: ORDER-2 BOTTOM | Desktop: LEFT) */}
        {/* ========================================================= */}
        <section className="order-2 lg:order-1 lg:col-span-6 bg-white dark:bg-[#151c28] rounded-[24px] border border-[#e0e3e5] dark:border-[#243044] shadow-sm flex flex-col flex-1 lg:h-full min-h-[280px] lg:min-h-0 overflow-hidden">
          
          {/* Header with TTS Speech Audio Controls */}
          <div className="p-3.5 sm:p-4 border-b border-[#e0e3e5] dark:border-[#243044] flex items-center justify-between bg-[#f8fafc] dark:bg-[#0c121e] flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#fe9832] text-[20px]">forum</span>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-[#030813] dark:text-white">Live Conversation</h2>
                <p className="text-[10px] text-[#45474c] dark:text-[#828796]">ISL Signs &amp; Spoken Transcripts</p>
              </div>
            </div>

            {/* Mute/Unmute Speech Synthesis */}
            <button
              type="button"
              onClick={() => {
                const nextVal = !ttsEnabled;
                setTtsEnabled(nextVal);
                if (!nextVal) {
                  naturalSpeech.stop();
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                ttsEnabled
                  ? 'bg-[#fe9832]/10 border-[#fe9832] text-[#8f4e00] dark:text-[#fe9832]'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {ttsEnabled ? 'volume_up' : 'volume_off'}
              </span>
              <span className="hidden sm:inline">{ttsEnabled ? 'Voice Output: ON' : 'Voice: MUTED'}</span>
            </button>
          </div>

          {/* Scrolling Conversation Stream (Movable & Clean UI) */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto flex flex-col gap-3 min-h-0 custom-scrollbar">
            {/* Empty State */}
            {finalTranscripts.length === 0 && Object.keys(interimTranscripts).length === 0 && (
              <div className="my-auto text-center flex flex-col items-center gap-2 py-6 text-[#828796]">
                <span className="material-symbols-outlined text-[32px] text-[#fe9832]/50 animate-pulse">chat</span>
                <p className="text-xs font-medium">Waiting for participants to speak or sign...</p>
              </div>
            )}

            {/* Final Transcripts with Distinct Sender Highlight */}
            {finalTranscripts.map((t) => {
              const isMe = t.senderId === user?.id || t.senderId === user?.email || (user?.email && t.senderId === user.email.toLowerCase()) || (user?.name && t.senderName === user.name && t.senderId !== 'remote');
              return (
                <div
                  key={t.id}
                  className={`flex flex-col max-w-[85%] ${
                    isMe ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <span className={`text-[10px] font-extrabold mb-1 px-1 flex items-center gap-1 ${isMe ? 'text-[#fe9832]' : 'text-emerald-500'}`}>
                    <span>{isMe ? 'You' : (t.senderName || 'Participant')}</span>
                    <span className="font-normal text-[9px] text-[#828796]">{isMe ? '(Voice)' : '(Sign & Text)'}</span>
                  </span>
                  
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-[#fe9832]/15 dark:bg-[#fe9832]/25 text-[#030813] dark:text-white rounded-tr-none border border-[#fe9832]/30 font-medium'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold rounded-tl-none shadow-xs'
                    }`}
                  >
                    {!isMe && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-700 dark:text-[#8dfc75] font-bold mb-1">
                        <span className="material-symbols-outlined text-[13px]">sign_language</span>
                        <span>ISL Sign Translated</span>
                      </div>
                    )}
                    <p>{t.text}</p>
                  </div>
                </div>
              );
            })}

            {/* Real-time Interim Live Stream */}
            {Object.entries(interimTranscripts).map(([senderId, text]) => {
              const isMe = senderId === user?.id || senderId === user?.email || senderId === 'me';
              return (
                <div
                  key={senderId}
                  className={`flex flex-col max-w-[85%] ${
                    isMe ? 'self-end items-end' : 'self-start items-start'
                  } opacity-90`}
                >
                  <span className="text-[10px] font-bold text-[#fe9832] mb-1 px-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fe9832] animate-ping" />
                    <span>{isMe ? 'You (Speaking...)' : 'Participant (Speaking/Signing...)'}</span>
                  </span>
                  <div
                    className={`p-3 rounded-2xl text-xs italic ${
                      isMe
                        ? 'bg-[#fe9832]/10 dark:bg-[#fe9832]/15 text-[#030813] dark:text-white rounded-tr-none border border-[#fe9832]/30'
                        : 'bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-tl-none'
                    }`}
                  >
                    {text}...
                  </div>
                </div>
              );
            })}

            <div ref={captionsEndRef} />
          </div>

          {/* Quick Text Input for Hearing User */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (typedMessage.trim() && onSendMessage) {
                onSendMessage(typedMessage.trim());
                setTypedMessage('');
              }
            }}
            className="p-2.5 bg-[#f8fafc] dark:bg-[#0c121e] border-t border-[#e0e3e5] dark:border-[#243044] flex items-center gap-2 flex-shrink-0"
          >
            <input
              type="text"
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              placeholder="Type a message to translate to sign..."
              className="flex-1 px-3.5 py-2 bg-white dark:bg-[#151c28] border border-[#e0e3e5] dark:border-[#243044] rounded-xl text-xs text-[#030813] dark:text-white placeholder-[#828796] focus:outline-none focus:border-[#fe9832]"
            />
            <button
              type="submit"
              disabled={!typedMessage.trim()}
              className="px-3.5 py-2 bg-[#fe9832] hover:bg-[#e8872b] text-[#542900] rounded-xl text-xs font-black transition-all disabled:opacity-40 flex items-center gap-1 shrink-0 active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </section>

      </div>
    </div>
  );
};

export default HearingUserWorkspace;
