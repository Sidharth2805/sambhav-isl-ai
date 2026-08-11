import React, { useRef } from 'react';
import { VideoTrack } from '@livekit/components-react';
import { Track, ConnectionState as LkConnectionState } from 'livekit-client';
import DraggableSelfView from './DraggableSelfView';
import type { TranscriptEvent } from '../../types/transcript';
import { SignSequencePlayer } from '../accessibility/SignSequencePlayer';

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
  showMicDevices: boolean;
  setShowMicDevices: (val: boolean) => void;
  showCameraDevices: boolean;
  setShowCameraDevices: (val: boolean) => void;

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
}

export const DeafUserWorkspace: React.FC<DeafUserWorkspaceProps> = ({
  roomCode,
  isCreator,
  onEndCall,
  onLeaveCall,

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

  finalTranscripts,
  interimTranscripts,
  sttSupported,
  formatSpeakerLabel,
  captionsEndRef,

  controlsVisible,
  activeSequence,
  onSequenceComplete,
  recoveryState = 'READY',
}) => {
  const videoParentRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`h-[84vh] md:h-[86vh] flex flex-col gap-2 min-h-0 overflow-hidden select-none relative bg-white p-4 rounded-2xl border transition-all duration-300 ${
      screenShareState ? 'border-emerald-500 ring-4 ring-emerald-400/55 shadow-[0_0_25px_rgba(16,185,129,0.3)]' : 'border-[#00BCD4]'
    }`}>
      {screenShareState && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-lg z-50 flex items-center gap-1.5 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          SCREEN SHARING ACTIVE
        </div>
      )}

      {/* Call Header */}
      <header className="flex items-center justify-between border-b border-[#00BCD4] pb-1.5 flex-shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] text-[#1A237E] opacity-75 uppercase font-bold tracking-wider">Accessibility Console (Deaf/HOH Workspace)</span>
          <h1 className="text-sm font-bold font-mono tracking-wider text-[#1A237E] flex items-center gap-2 select-text">
            Room Code: <span className="select-all text-[#880E4F]">{roomCode}</span>
            <button
              onClick={handleCopyCode}
              className="px-1.5 py-0.5 rounded border border-[#00BCD4] bg-[#F5F5F5] text-[9px] text-[#1A237E] hover:bg-[#E1F5FE] transition-all font-sans font-bold"
              aria-label="Copy room code to clipboard"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full bg-[#4DD0E1] ${
              connectionState === LkConnectionState.Connected ? 'animate-pulse' : ''
            }`}
            aria-hidden="true"
          />
          <span className="text-[11px] font-bold text-[#1A237E]">{getConnectionStatusText()}</span>
        </div>
      </header>

      {/* Main content layouts */}
      <div className="flex-grow flex flex-col gap-2 min-h-0 overflow-hidden">
        
        {/* Top Section: Split on desktop (Left Avatar, Right Camera); Stacked on mobile (Top Avatar, Bottom Camera) */}
        <div className="flex-grow min-h-0 flex flex-col md:flex-row gap-2 overflow-hidden">
          
          {/* Avatar (Left half on desktop / Top half on mobile) */}
          <div className="h-[50%] md:h-full w-full md:w-[58%] flex-shrink-0 md:flex-shrink bg-[#1e1e24] border border-[#00BCD4] rounded-2xl flex flex-col relative overflow-hidden">
            <SignSequencePlayer sequence={activeSequence} onComplete={onSequenceComplete} />
            
            {/* Real-time History Sync/Recovery Status Indicator */}
            {recoveryState !== 'READY' && (
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-yellow-500/30 flex items-center gap-1.5 z-20 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping"></span>
                <span className="text-[10px] uppercase font-bold text-yellow-500 tracking-wide select-none">
                  {recoveryState === 'RECOVERING' ? 'Syncing History...' : 'Reconnecting...'}
                </span>
              </div>
            )}
          </div>

          {/* User A Camera (Right half on desktop / Bottom half on mobile) */}
          <div 
            ref={videoParentRef}
            className={`h-[50%] md:h-full w-full md:w-[42%] flex-grow min-h-0 relative overflow-hidden bg-[#F5F5F5] rounded-2xl border flex items-center justify-center transition-all duration-300 ${
              primaryRemoteTrack?.source === Track.Source.ScreenShare
                ? 'border-emerald-500 ring-4 ring-emerald-400/55 shadow-[0_0_25px_rgba(16,185,129,0.35)]'
                : 'border-[#00BCD4]'
            }`}
          >
            {primaryRemoteTrack ? (
              <VideoTrack trackRef={primaryRemoteTrack as any} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full text-center flex flex-col items-center justify-center gap-2 p-4 bg-[#212121] text-[#FFD700]">
                <span className="text-2xl animate-pulse">📷</span>
                <span className="text-xs font-bold uppercase tracking-wider">Camera Inactive</span>
                <span className="text-[9px] opacity-75">Waiting for User A...</span>
              </div>
            )}

            {primaryRemoteTrack?.source === Track.Source.ScreenShare && (
              <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow z-10 flex items-center gap-1.5 animate-pulse">
                <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                VIEWING SCREEN SHARE
              </div>
            )}

            {primaryRemoteTrack && (
              <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white z-10 select-none">
                {primaryRemoteTrack.source === Track.Source.ScreenShare
                  ? `${primaryRemoteTrack.participant.identity}'s Screen Share`
                  : `${primaryRemoteTrack.participant.identity}`}
              </div>
            )}

            {/* User B Local Self-camera draggable preview constrained strictly inside User A's camera container */}
            <DraggableSelfView 
              parentRef={videoParentRef}
              cameraState={cameraState}
              localTrack={localTrack}
            />

            {/* Controls Overlay Inside Camera Section */}
            <footer className={`absolute bottom-0 left-0 right-0 z-40 bg-[#F5F5F5] border-t border-[#00BCD4] p-2 rounded-b-2xl flex items-center justify-between transition-opacity duration-300 ${
              controlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}>
              <div className="flex items-center gap-2">
                {/* Mic split select button */}
                <div className="relative flex items-center">
                  <button
                    onClick={handleToggleMic}
                    className={`p-2 rounded-l-full border-y border-l transition-all ${
                      micState ? 'bg-[#E1F5FE] border-[#00BCD4] text-[#1A237E] hover:bg-[#E1F5FE]/80' : 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                    }`}
                    aria-label={micState ? 'Mute microphone' : 'Unmute microphone'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setShowMicDevices(!showMicDevices);
                      setShowCameraDevices(false);
                    }}
                    className="p-2 rounded-r-full border border-[#00BCD4] bg-white text-[#1A237E] hover:bg-[#F5F5F5]"
                    aria-label="Select microphone input device"
                  >
                    <svg className={`w-3 h-3 transition-transform duration-300 ${showMicDevices ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>

                  {showMicDevices && (
                    <div className="absolute bottom-14 left-0 bg-white border border-[#00BCD4] rounded-xl shadow-xl p-1.5 w-56 z-50 flex flex-col gap-0.5 max-h-40 overflow-y-auto">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-[#1A237E]/60 px-1.5 py-0.5">Microphone input</div>
                      {audioDevices.map((device) => (
                        <button
                          key={device.deviceId}
                          onClick={() => {
                            setActiveAudioDevice(device.deviceId);
                            setShowMicDevices(false);
                          }}
                          className={`text-left text-[11px] px-1.5 py-1 rounded transition-all flex items-center justify-between ${
                            activeAudioDeviceId === device.deviceId ? 'bg-[#E1F5FE] text-[#1A237E] font-bold' : 'hover:bg-[#F5F5F5] text-[#1A237E]/80'
                          }`}
                        >
                          <span className="truncate">{device.label || `Microphone ${device.deviceId.substring(0, 5)}`}</span>
                          {activeAudioDeviceId === device.deviceId && <span>✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Camera split select button */}
                <div className="relative flex items-center">
                  <button
                    onClick={handleToggleCamera}
                    className={`p-2 rounded-l-full border-y border-l transition-all ${
                      cameraState ? 'bg-[#E1F5FE] border-[#00BCD4] text-[#1A237E] hover:bg-[#E1F5FE]/80' : 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                    }`}
                    aria-label={cameraState ? 'Disable video camera' : 'Enable video camera'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setShowCameraDevices(!showCameraDevices);
                      setShowMicDevices(false);
                    }}
                    className="p-2 rounded-r-full border border-[#00BCD4] bg-white text-[#1A237E] hover:bg-[#F5F5F5]"
                    aria-label="Select video camera input device"
                  >
                    <svg className={`w-3 h-3 transition-transform duration-300 ${showCameraDevices ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>

                  {showCameraDevices && (
                    <div className="absolute bottom-14 left-0 bg-white border border-[#00BCD4] rounded-xl shadow-xl p-1.5 w-56 z-50 flex flex-col gap-0.5 max-h-40 overflow-y-auto">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-[#1A237E]/60 px-1.5 py-0.5">Camera input</div>
                      {videoDevices.map((device) => (
                        <button
                          key={device.deviceId}
                          onClick={() => {
                            setActiveVideoDevice(device.deviceId);
                            setShowCameraDevices(false);
                          }}
                          className={`text-left text-[11px] px-1.5 py-1 rounded transition-all flex items-center justify-between ${
                            activeVideoDeviceId === device.deviceId ? 'bg-[#E1F5FE] text-[#1A237E] font-bold' : 'hover:bg-[#F5F5F5] text-[#1A237E]/80'
                          }`}
                        >
                          <span className="truncate">{device.label || `Camera ${device.deviceId.substring(0, 5)}`}</span>
                          {activeVideoDeviceId === device.deviceId && <span>✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Screen share control */}
                <button
                  onClick={handleToggleScreen}
                  className={`p-2 rounded-full border transition-all ${
                    screenShareState ? 'bg-[#E1F5FE] border-[#00BCD4] text-[#1A237E]' : 'bg-white border border-[#00BCD4] text-[#1A237E] hover:bg-[#F5F5F5]'
                  }`}
                  aria-label={screenShareState ? 'Stop sharing screen' : 'Start sharing screen'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              {/* Leave/End Call buttons */}
              {isCreator ? (
                <button
                  onClick={onEndCall}
                  className="px-5 py-2 bg-[#800000] hover:bg-[#990000] text-white rounded-xl text-xs font-bold transition-all shadow-md font-sans"
                >
                  End Call
                </button>
              ) : (
                <button
                  onClick={onLeaveCall}
                  className="px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all border border-slate-600 font-sans"
                >
                  Leave Call
                </button>
              )}
            </footer>
          </div>

        </div>

        {/* Lower Section: Full Width Live Captions */}
        <div className="h-20 flex-shrink-0 bg-[#E1F5FE] border border-[#00BCD4] rounded-xl text-[#1A237E] font-sans flex flex-col min-h-0 overflow-hidden p-2.5 shadow-md" role="log" aria-live="polite">
          <h3 className="text-[9px] font-bold uppercase tracking-wider text-[#1A237E] mb-0.5 flex-shrink-0">Live Captions</h3>
          <div className="flex-grow overflow-y-auto flex flex-col gap-1.5 text-xs font-bold tracking-wide">
            {finalTranscripts.map((t) => (
              <div key={t.id} className="leading-relaxed border-b border-[#00BCD4]/10 pb-1">
                <span className="text-[#880E4F]">{formatSpeakerLabel(t.senderId, t.senderName)}:</span> {t.text}
              </div>
            ))}
            {Object.entries(interimTranscripts).map(([senderId, text]) => {
              const senderName = finalTranscripts.find((t) => t.senderId === senderId)?.senderName || 'Speaker';
              return (
                <div key={senderId} className="opacity-80 italic leading-relaxed">
                  <strong>{formatSpeakerLabel(senderId, senderName)}:</strong> {text}...
                </div>
              );
            })}
            {finalTranscripts.length === 0 && Object.keys(interimTranscripts).length === 0 && (
              <div className="text-[10px] opacity-60 italic text-center my-auto">Waiting for speech transcript translation...</div>
            )}
            <div ref={captionsEndRef} />
          </div>
        </div>
      </div>

      {/* STT Support Alert */}
      {!sttSupported && (
        <div className="p-2.5 bg-red-100 dark:bg-red-955/20 border border-red-200 dark:border-red-900 rounded-xl text-center text-xs text-red-700 dark:text-red-400 font-bold flex-shrink-0" role="alert">
          ⚠️ Live speech recognition is not supported in this browser.
        </div>
      )}
    </div>
  );
};
export default DeafUserWorkspace;
