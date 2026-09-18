import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../hooks/useAccessibility';
import {
  createSession,
  getSessionByRoomCode,
  startSession,
  getSessions,
  type CommunicationSessionDto,
} from '../utils/communicationApi';
import {
  CommunicateUserManualModal,
  CommunicateUserManualCard,
  isCommunicateGuideEnabled,
} from '../components/communication/CommunicateUserManualModal';
import { isCommunicateIntroAnimationEnabled } from '../utils/animationPreferences';

export const CommunicatePage: React.FC = () => {
  const { t } = useAccessibility();
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Role Selection for WebRTC 2-way communication
  const isDeafUser = (user as any)?.disabilityType === 'DEAF' || (user as any)?.disabilityType === 'DEAF_MUTE' || (user as any)?.disabilityType === 'MUTE';
  const [userRole, setUserRole] = useState<'normal' | 'deaf'>(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'deaf' || roleParam === 'normal') return roleParam;
    return isDeafUser ? 'deaf' : 'normal';
  });

  // Unified Welcome Flow: 'manual' -> 'crossfading' -> 'session' -> 'settling' -> 'done'
  const isGuideDefault = isCommunicateGuideEnabled();
  const isIntroDefault = isCommunicateIntroAnimationEnabled();

  const [welcomeStage, setWelcomeStage] = useState<'manual' | 'crossfading' | 'session' | 'settling' | 'done'>(() => {
    if (isGuideDefault) return 'manual';
    if (isIntroDefault) return 'session';
    return 'done';
  });

  // Standalone User Manual modal state (when clicked from header button)
  const [manualHeaderModalOpen, setManualHeaderModalOpen] = useState<boolean>(false);
  const [isSettling, setIsSettling] = useState(false);

  // Advance from Manual to 1-on-1 session spotlight with a seamless crossfade
  const handleAdvanceFromManual = useCallback(() => {
    if (isCommunicateIntroAnimationEnabled()) {
      setWelcomeStage('crossfading');
      setTimeout(() => {
        setWelcomeStage('session');
      }, 250);
    } else {
      setWelcomeStage('settling');
      setIsSettling(true);
      setTimeout(() => {
        setWelcomeStage('done');
        setTimeout(() => setIsSettling(false), 600);
      }, 350);
    }
  }, []);

  // Advance from 1-on-1 session spotlight into in-place lobby workspace
  const handleAdvanceFromSession = useCallback(() => {
    setWelcomeStage('settling');
    setIsSettling(true);
    setTimeout(() => {
      setWelcomeStage('done');
      setTimeout(() => setIsSettling(false), 700);
    }, 400);
  }, []);

  // 1-on-1 Session auto-advance timer & Esc key handler
  useEffect(() => {
    if (welcomeStage !== 'session') return;

    const timer = setTimeout(() => {
      handleAdvanceFromSession();
    }, 2800);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleAdvanceFromSession();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [welcomeStage, handleAdvanceFromSession]);

  // Escape key handler for welcome manual stage
  useEffect(() => {
    if (welcomeStage !== 'manual') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleAdvanceFromManual();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [welcomeStage, handleAdvanceFromManual]);

  // Primary Section Tab: 'lobby' (1-on-1 Video Call) or 'history' (Call History)
  const initialSection = searchParams.get('tab') === 'history' ? 'history' : 'lobby';
  const [activeSection, setActiveSection] = useState<'lobby' | 'history'>(initialSection);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'history') {
      setActiveSection('history');
    } else if (tabParam === 'lobby' || tabParam === 'call') {
      setActiveSection('lobby');
    }
  }, [searchParams]);

  const handleSwitchSection = (section: 'lobby' | 'history') => {
    setActiveSection(section);
    setSearchParams(section === 'history' ? { tab: 'history' } : {});
  };

  // Lobby Mode Selection (Host vs Join)
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-call Hardware Preview
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [speakerActive, setSpeakerActive] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Calls History Data
  const [sessions, setSessions] = useState<CommunicationSessionDto[]>([]);
  const [callsLoading, setCallsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  // ============================================================
  // CAMERA / MICROPHONE PREVIEW
  // ============================================================

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    const startPreview = async () => {
      if (!cameraActive) {
        if (localStream) {
          localStream.getTracks().forEach((track) => track.stop());
          setLocalStream(null);
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: micActive,
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        setLocalStream(stream);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('[Communicate Lobby] Camera/mic preview unavailable:', err);
        setLocalStream(null);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setError('Camera or microphone permission was denied. You can still join the call.');
      }
    };

    startPreview();

    return () => {
      cancelled = true;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraActive, micActive]);

  // ============================================================
  // FETCH CALL HISTORY
  // ============================================================

  const fetchCallsHistory = useCallback(async () => {
    if (!accessToken) {
      setCallsLoading(false);
      return;
    }

    try {
      setCallsLoading(true);
      const data = await getSessions(accessToken);
      const onlineSessions = Array.isArray(data) ? data.filter((s) => s.mode === 'ONLINE' || !s.mode) : [];
      setSessions(onlineSessions);
    } catch (err: any) {
      console.warn('[Communicate History] Session fetch note:', err?.message || err);
    } finally {
      setCallsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchCallsHistory();
  }, [fetchCallsHistory]);

  const stopLocalPreview = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [localStream]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ============================================================
  // START CALL (HOST)
  // ============================================================

  const handleStartCall = async () => {
    try {
      setLoading(true);
      setError(null);
      stopLocalPreview();

      let targetId = `ROOM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      try {
        const newSession = await createSession('ONLINE', accessToken);
        if (newSession && (newSession.id || newSession.roomCode)) {
          targetId = newSession.roomCode || newSession.id;
        }
      } catch (backendErr) {
        console.warn('Backend session registration note (proceeding with local WebRTC room):', backendErr);
      }

      navigate(`/communicate/online/${targetId}?role=${userRole}`, {
        state: {
          initialVideo: cameraActive,
          initialAudio: micActive,
          initialSpeaker: speakerActive ? 80 : 0,
          userRole: userRole,
          roomCode: targetId,
          isHost: true,
        },
      });
    } catch (err: any) {
      console.error('Failed to start call:', err);
      setError(err?.message || 'Failed to initialize video call session. Please try again.');
      setLoading(false);
    }
  };

  // ============================================================
  // JOIN CALL WITH CODE
  // ============================================================

  const handleJoinCall = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = joinCode.trim().toUpperCase();

    if (!cleanCode) {
      setError('Please enter a valid room code.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      stopLocalPreview();

      let targetId = cleanCode;
      try {
        const session = await getSessionByRoomCode(cleanCode, accessToken);
        if (session) {
          targetId = session.roomCode || session.id;
          if (session.status === 'CREATED' || session.status === 'WAITING') {
            try {
              await startSession(session.id, accessToken);
            } catch (startErr) {
              console.warn('Session start note:', startErr);
            }
          }
        }
      } catch (lookupErr) {
        console.warn('Backend room lookup note (connecting directly via WebRTC code):', lookupErr);
      }

      navigate(`/communicate/online/${targetId}?role=${userRole}`, {
        state: {
          initialVideo: cameraActive,
          initialAudio: micActive,
          initialSpeaker: speakerActive ? 80 : 0,
          userRole: userRole,
          roomCode: targetId,
          isHost: false,
        },
      });
    } catch (err: any) {
      console.error('Failed to join call:', err);
      setError(err?.message || 'Room not found. Please verify the code and try again.');
      setLoading(false);
    }
  };

  // Filtered session history based on search query
  const filteredSessions = sessions.filter((s) => {
    if (!historySearchQuery.trim()) return true;
    const q = historySearchQuery.toLowerCase();
    const code = (s.roomCode || s.id).toLowerCase();
    const status = (s.status || '').toLowerCase();
    return code.includes(q) || status.includes(q);
  });

  return (
    <div className="relative min-h-[calc(100vh-5rem)] -mt-20 md:-mt-6 -mx-4 sm:-mx-8 px-4 sm:px-8 pt-20 md:pt-6 pb-12 font-['Inter',sans-serif]">
      
      {/* Dynamic Photographic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <img
          src="/images/communicate-bg.jpg"
          alt="Communicate Background"
          className="w-full h-full object-cover object-center scale-100 opacity-95 dark:opacity-85"
        />
        {/* Minimal Non-Blur Ambient Tint */}
        <div className="absolute inset-0 bg-transparent dark:bg-black/20 pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col gap-5 w-full max-w-6xl mx-auto animate-fadeIn pb-10">

        {/* ========================================================
            TOP HEADER WITH SECTION SWITCHER TABS
        ======================================================== */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/20 dark:bg-black/30 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/40 dark:border-white/10 shadow-lg shadow-black/5 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-100/90 text-sky-600 dark:bg-[#fe9832]/15 dark:text-[#fe9832] flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[24px]">
                {activeSection === 'lobby' ? 'videocam' : 'history'}
              </span>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white tracking-tight drop-shadow-2xs">
                {activeSection === 'lobby' ? '1-on-1 Video Call' : 'Communication History'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-[#c1c6d7] font-medium mt-0.5">
                {activeSection === 'lobby'
                  ? 'Real-time WebRTC video calling with live ISL 3D avatar & subtitles'
                  : 'Access, review, and rejoin your past 1-on-1 video call sessions'}
              </p>
            </div>
          </div>

          {/* Action Controls & Navigation Pills */}
          <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
            {/* Main Section Navigation Switcher */}
            <div className="flex items-center bg-white/30 dark:bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/40 dark:border-white/10 shadow-xs">
            <button
              type="button"
              onClick={() => handleSwitchSection('lobby')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSection === 'lobby'
                  ? 'bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#542900] shadow-sm font-black'
                  : 'text-slate-600 dark:text-[#c1c6d7] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">video_call</span>
              <span>{t('communicate.tab.newCall', 'New Call')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchSection('history')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative ${
                activeSection === 'history'
                  ? 'bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#542900] shadow-sm font-black'
                  : 'text-slate-600 dark:text-[#c1c6d7] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">history</span>
              <span>{t('communicate.tab.history', 'History')}</span>
              {sessions.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeSection === 'history'
                    ? 'bg-white/30 text-white dark:bg-[#542900] dark:text-[#fe9832]'
                    : 'bg-indigo-100 text-indigo-700 dark:bg-[#fe9832]/20 dark:text-[#fe9832]'
                }`}>
                  {sessions.length}
                </span>
              )}
            </button>
          </div>

          {/* User Manual Guide Button */}
          <button
            type="button"
            onClick={() => setManualHeaderModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-[#fe9832] bg-indigo-50 dark:bg-[#fe9832]/10 hover:bg-indigo-100 dark:hover:bg-[#fe9832]/20 px-3.5 py-2 rounded-xl border border-indigo-200/60 dark:border-[#fe9832]/30 transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Open Camera Setup & ISL Recognition Guide"
          >
            <span className="material-symbols-outlined text-[17px] text-indigo-600 dark:text-[#fe9832]">
              menu_book
            </span>
            <span className="hidden sm:inline">User Manual</span>
          </button>
        </div>
      </header>

      {/* Standalone User Manual Modal (When opened explicitly from header) */}
      <CommunicateUserManualModal
        isOpen={manualHeaderModalOpen}
        onClose={() => setManualHeaderModalOpen(false)}
      />

      {/* ========================================================
          UNIFIED WELCOME OVERLAY (Manual -> Seamless Crossfade -> 1-on-1 Spotlight -> Settling)
          ======================================================== */}
      {welcomeStage !== 'done' && (
        <div
          onClick={() => {
            if (welcomeStage === 'manual') handleAdvanceFromManual();
            else if (welcomeStage === 'session') handleAdvanceFromSession();
          }}
          className={`fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 font-['Inter',sans-serif] transition-all duration-400 ease-out cursor-pointer ${
            welcomeStage === 'settling'
              ? 'bg-transparent backdrop-blur-none opacity-0 pointer-events-none'
              : 'bg-slate-900/60 dark:bg-black/85 backdrop-blur-xl opacity-100'
          }`}
          role="dialog"
          aria-modal="true"
        >
          {/* Step 1: User Manual Card (Cross-fades directly without backdrop tearing) */}
          {(welcomeStage === 'manual' || welcomeStage === 'crossfading') && (
            <div
              className={`w-full max-w-5xl transition-all duration-300 ease-in-out cursor-pointer ${
                welcomeStage === 'manual'
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
              }`}
            >
              <CommunicateUserManualCard
                onDismiss={handleAdvanceFromManual}
              />
            </div>
          )}

          {/* Step 2: Instant 1-on-1 Session Spotlight Card */}
          {(welcomeStage === 'crossfading' || welcomeStage === 'session' || welcomeStage === 'settling') && (
            <div
              className={`w-full max-w-xl transition-all duration-400 ease-out cursor-pointer ${
                welcomeStage === 'session'
                  ? 'opacity-100 scale-100 translate-y-0'
                  : welcomeStage === 'crossfading'
                  ? 'opacity-0 scale-90 translate-y-6 pointer-events-none'
                  : 'opacity-0 scale-75 translate-y-24 pointer-events-none'
              }`}
            >
              <div
                onClick={handleAdvanceFromSession}
                className="w-full bg-white/95 dark:bg-gradient-to-br dark:from-[#0c1427] dark:via-[#101b33] dark:to-[#080d1a] border-2 border-indigo-200 dark:border-[#fe9832]/70 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-500/20 dark:shadow-[0_0_60px_rgba(254,152,50,0.25)] flex flex-col gap-6 text-slate-900 dark:text-white relative overflow-hidden cursor-pointer"
              >
                {/* Ambient Background Glows */}
                <div className="absolute -top-24 -right-24 w-52 h-52 bg-indigo-300/30 dark:bg-indigo-500/30 rounded-full blur-3xl pointer-events-none animate-pulse" />
                <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-sky-300/30 dark:bg-[#fe9832]/25 rounded-full blur-3xl pointer-events-none animate-pulse" />

                {/* Header / Skip */}
                <div className="flex items-center justify-between z-10">
                  <span className="px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-400/40 text-indigo-700 dark:text-[#fe9832] text-xs font-black flex items-center gap-2 uppercase tracking-wider shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                    <span>{t('communicate.liveSession', 'Live Video Session')}</span>
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdvanceFromSession();
                    }}
                    className="text-xs text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-white/15 px-3 py-1 rounded-xl transition-all font-bold cursor-pointer active:scale-95 flex items-center gap-1"
                    title="Skip intro animation"
                  >
                    <span>{t('communicate.skip', 'Skip')}</span>
                    <span className="text-[10px] text-slate-400 dark:text-white/50">(Esc)</span>
                  </button>
                </div>

                {/* Center Content */}
                <div className="z-10 flex flex-col gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 dark:from-[#fe9832] dark:to-[#ff7a00] flex items-center justify-center shadow-lg shadow-indigo-500/30 dark:shadow-[#fe9832]/30 shrink-0">
                      <span className="material-symbols-outlined text-white dark:text-[#3e1f00] text-[26px]">verified</span>
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-headline">
                        Instant 1-on-1 Session
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                        Private real-time video communication bridging Indian Sign Language and Speech.
                      </p>
                    </div>
                  </div>

                  {/* 3 Main Highlights (Pastel Cards with Hover Highlight) */}
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-3">
                    <div className="p-3 rounded-2xl bg-[#d2ece5] dark:bg-[#122822] border border-[#c1e6dc] dark:border-[#1d3d34] text-center flex flex-col items-center justify-center gap-1 hover:bg-[#bfe2d8] dark:hover:bg-[#17332b] shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                      <span className="material-symbols-outlined text-[#193a32] dark:text-[#4edebe] text-2xl">accessibility_new</span>
                      <span className="text-[11px] font-black text-[#193a32] dark:text-[#c4eee4]">3D ISL Avatar</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#fee5b6] dark:bg-[#2b2010] border border-[#fddc9b] dark:border-[#3e2e17] text-center flex flex-col items-center justify-center gap-1 hover:bg-[#fcd795] dark:hover:bg-[#382b16] shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                      <span className="material-symbols-outlined text-[#483309] dark:text-[#f8b84e] text-2xl">closed_caption</span>
                      <span className="text-[11px] font-black text-[#483309] dark:text-[#feebb7]">Live Speech CC</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#e4dbf7] dark:bg-[#1d162f] border border-[#dacdf3] dark:border-[#30244d] text-center flex flex-col items-center justify-center gap-1 hover:bg-[#d5c7f2] dark:hover:bg-[#271d3e] shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                      <span className="material-symbols-outlined text-[#301b50] dark:text-[#ab91ed] text-2xl">lock</span>
                      <span className="text-[11px] font-black text-[#301b50] dark:text-[#e5dcf8]">Encrypted WebRTC</span>
                    </div>
                  </div>
                </div>

                {/* Launch CTA & Timer notice */}
                <div className="z-10 pt-2 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartCall();
                    }}
                    disabled={loading}
                    className="w-full py-3.5 px-6 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#683700] rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/30 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">video_call</span>
                          <span>{t('communicate.launchNow', 'Launch Video Call Now')}</span>
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-[#fe9832] animate-ping" />
                    <span>{t('communicate.enterWorkspace', 'Click anywhere or press Esc to enter workspace')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          className="p-3.5 rounded-2xl bg-rose-50 dark:bg-red-950/40 border border-rose-200 dark:border-red-800 text-rose-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2 shadow-xs"
          role="alert"
        >
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-xs opacity-70 hover:opacity-100 cursor-pointer"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================
          VIEW 1: LOBBY & HARDWARE PREVIEW (When activeSection === 'lobby')
      ======================================================== */}
      {activeSection === 'lobby' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div className="w-full bg-white/20 dark:bg-black/30 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl shadow-black/10 transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

              {/* LEFT COLUMN: Video Preview */}
              <div className="lg:col-span-7 flex flex-col gap-2">
                {/* Video Preview */}
                <div className="relative aspect-video max-h-[290px] w-full rounded-2xl bg-black/30 dark:bg-black/50 border border-white/30 dark:border-white/10 overflow-hidden flex items-center justify-center shadow-inner group">
                  {cameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-gray-700 dark:text-[#828796]">
                      <span className="material-symbols-outlined text-[40px]">
                        videocam_off
                      </span>
                      <span className="text-xs font-semibold">
                        Camera is Turned Off
                      </span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white flex items-center gap-1.5 border border-white/10 shadow">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        cameraActive
                          ? 'bg-green-500 animate-pulse'
                          : 'bg-red-500'
                      }`}
                    />
                    <span>
                      {cameraActive
                        ? 'Self Camera Ready'
                        : 'Video Disabled'}
                    </span>
                  </div>
                </div>

                {/* Control Toggles */}
                <div className="flex items-center justify-center gap-8 py-2">
                  {/* Microphone */}
                  <div className="flex flex-col items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setMicActive((prev) => !prev)}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        micActive
                          ? 'bg-[#2d3133] hover:bg-[#3d4346] text-white focus:ring-gray-400'
                          : 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-400 shadow-[0_0_16px_rgba(220,38,38,0.4)]'
                      }`}
                      aria-label={
                        micActive
                          ? 'Mute microphone'
                          : 'Unmute microphone'
                      }
                      title={
                        micActive
                          ? 'Mute Microphone'
                          : 'Unmute Microphone'
                      }
                    >
                      <span className="material-symbols-outlined text-[22px]">
                        {micActive ? 'mic' : 'mic_off'}
                      </span>
                    </button>
                    <span className="text-[11px] font-bold text-gray-900 dark:text-[#c1c6d7] drop-shadow-2xs">
                      {micActive ? 'Mute' : 'Unmuted'}
                    </span>
                  </div>

                  {/* Camera */}
                  <div className="flex flex-col items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCameraActive((prev) => !prev)}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        cameraActive
                          ? 'bg-[#2d3133] hover:bg-[#3d4346] text-white focus:ring-gray-400'
                          : 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-400 shadow-[0_0_16px_rgba(220,38,38,0.4)]'
                      }`}
                      aria-label={
                        cameraActive
                          ? 'Turn off camera'
                          : 'Turn on camera'
                      }
                      title={
                        cameraActive
                          ? 'Turn off Camera'
                          : 'Turn on Camera'
                      }
                    >
                      <span className="material-symbols-outlined text-[22px]">
                        {cameraActive ? 'videocam' : 'videocam_off'}
                      </span>
                    </button>
                    <span className="text-[11px] font-bold text-gray-900 dark:text-[#c1c6d7] drop-shadow-2xs">
                      {cameraActive ? 'Camera' : 'Cam Off'}
                    </span>
                  </div>

                  {/* Speaker */}
                  <div className="flex flex-col items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSpeakerActive((prev) => !prev)}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        speakerActive
                          ? 'bg-[#2d3133] hover:bg-[#3d4346] text-white focus:ring-gray-400'
                          : 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-400 shadow-[0_0_16px_rgba(220,38,38,0.4)]'
                      }`}
                      aria-label={speakerActive ? 'Mute speaker' : 'Unmute speaker'}
                      title={speakerActive ? 'Speaker On' : 'Speaker Muted'}
                    >
                      <span className="material-symbols-outlined text-[22px]">
                        {speakerActive ? 'volume_up' : 'volume_off'}
                      </span>
                    </button>
                    <span className="text-[11px] font-bold text-gray-900 dark:text-[#c1c6d7] drop-shadow-2xs">
                      {speakerActive ? 'Speaker' : 'Muted'}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Host / Join Call Form */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-4 h-full">
                {/* Host vs Join Tabs */}
                <div className="flex bg-white/30 dark:bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/40 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('create');
                      setError(null);
                    }}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'create'
                        ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sm dark:bg-none dark:bg-[#1a202c] dark:text-white font-black'
                        : 'text-slate-700 dark:text-[#c1c6d7] hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">add_call</span>
                    <span>{t('communicate.hostCall', 'Host New Call')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('join');
                      setError(null);
                    }}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'join'
                        ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sm dark:bg-none dark:bg-[#1a202c] dark:text-white font-black'
                        : 'text-slate-700 dark:text-[#c1c6d7] hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">key</span>
                    <span>{t('communicate.joinCode', 'Join with Code')}</span>
                  </button>
                </div>

                {/* Host Call View */}
                {activeTab === 'create' ? (
                  <div className={`bg-white/25 dark:bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/40 dark:border-white/10 flex flex-col justify-between gap-5 flex-1 shadow-md transition-all duration-500 ${
                    isSettling ? 'ring-2 ring-indigo-500 dark:ring-[#fe9832] scale-[1.02] shadow-xl shadow-indigo-500/20' : ''
                  }`}>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-indigo-600 dark:text-[#fe9832] text-[20px]">
                          verified
                        </span>
                        <h2 className="text-base font-black text-gray-950 dark:text-white">
                          Instant 1-on-1 Session
                        </h2>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-[#c1c6d7] leading-relaxed font-medium">
                        Create a private video room instantly. Share your generated room code with any hearing or deaf participant to start.
                      </p>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <span className="px-2.5 py-1 rounded-xl bg-white/60 dark:bg-[#122822] text-[#193a32] dark:text-[#a0ded0] border border-white/60 dark:border-[#1e4037] text-[10px] font-black tracking-wide shadow-2xs cursor-default">
                          3D ISL Sign Avatar
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-white/60 dark:bg-[#2b2010] text-[#483309] dark:text-[#feebb7] border border-white/60 dark:border-[#3e2e17] text-[10px] font-black tracking-wide shadow-2xs cursor-default">
                          Live Speech CC
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-white/60 dark:bg-[#1d162f] text-[#301b50] dark:text-[#e5dcf8] border border-white/60 dark:border-[#30244d] text-[10px] font-black tracking-wide shadow-2xs cursor-default">
                          Encrypted WebRTC
                        </span>
                      </div>

                      {/* Role Selection for Host */}
                      <div className="flex flex-col gap-1.5 mt-4">
                        <label className="text-[11px] font-black text-gray-900 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-indigo-600 dark:text-[#fe9832]">badge</span>
                          <span>{t('communicate.roleLabel', 'Your Role:')}</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setUserRole('normal')}
                            className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                              userRole === 'normal'
                                ? 'bg-sky-500/20 border-sky-500 text-sky-950 dark:text-sky-200 ring-2 ring-sky-500/40'
                                : 'bg-white/40 dark:bg-black/30 border-white/40 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/60'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[20px] text-sky-600 dark:text-sky-400">hearing</span>
                            <div>
                              <div className="font-black text-[11px] leading-tight">Normal User</div>
                              <div className="text-[9px] font-medium opacity-80">Text & Voice</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setUserRole('deaf')}
                            className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                              userRole === 'deaf'
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/40'
                                : 'bg-white/40 dark:bg-black/30 border-white/40 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/60'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[20px] text-emerald-600 dark:text-emerald-400">sign_language</span>
                            <div>
                              <div className="font-black text-[11px] leading-tight">Deaf / Mute</div>
                              <div className="text-[9px] font-medium opacity-80">Sign AI Cam</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartCall}
                      disabled={loading}
                      className="w-full py-3 px-5 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#683700] rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-500/20 dark:shadow-none hover:opacity-95 flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                      {loading ? (
                        <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[22px]">video_call</span>
                          <span>{t('communicate.launchCall', 'Launch Video Call')}</span>
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  /* Join Call View */
                  <form
                    onSubmit={handleJoinCall}
                    className="bg-white/25 dark:bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/40 dark:border-white/10 flex flex-col justify-between gap-4 flex-1 shadow-md"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="material-symbols-outlined text-indigo-600 dark:text-[#fe9832] text-[20px]">
                          vpn_key
                        </span>
                        <h2 className="text-base font-black text-gray-950 dark:text-white">
                          Join Existing Call
                        </h2>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-[#c1c6d7] mb-3.5 leading-relaxed font-medium">
                        Enter the room code shared by your call host and select your role.
                      </p>

                      <input
                        type="text"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="e.g. ABC123"
                        maxLength={16}
                        className="w-full px-4 py-3 bg-white/60 dark:bg-black/60 backdrop-blur-sm border border-white/60 dark:border-white/20 rounded-xl font-mono text-center font-bold text-lg tracking-widest text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase shadow-inner"
                      />

                      {/* Role Selection for Join */}
                      <div className="flex flex-col gap-1.5 mt-3.5">
                        <label className="text-[11px] font-black text-gray-900 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-indigo-600 dark:text-[#fe9832]">badge</span>
                          <span>{t('communicate.roleLabel', 'Your Role:')}</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setUserRole('normal')}
                            className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                              userRole === 'normal'
                                ? 'bg-sky-500/20 border-sky-500 text-sky-950 dark:text-sky-200 ring-2 ring-sky-500/40'
                                : 'bg-white/40 dark:bg-black/30 border-white/40 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/60'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[20px] text-sky-600 dark:text-sky-400">hearing</span>
                            <div>
                              <div className="font-black text-[11px] leading-tight">Normal User</div>
                              <div className="text-[9px] font-medium opacity-80">Text & Voice</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setUserRole('deaf')}
                            className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                              userRole === 'deaf'
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/40'
                                : 'bg-white/40 dark:bg-black/30 border-white/40 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/60'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[20px] text-emerald-600 dark:text-emerald-400">sign_language</span>
                            <div>
                              <div className="font-black text-[11px] leading-tight">Deaf / Mute</div>
                              <div className="text-[9px] font-medium opacity-80">Sign AI Cam</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !joinCode.trim()}
                      className="w-full py-3 px-5 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#683700] rounded-xl font-bold text-sm transition-all shadow-md hover:opacity-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                      ) : (
                        <>
                          <span>{t('communicate.connectRoom', 'Connect to Room')}</span>
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Quick Snippet: Recent 1-on-1 Calls */}
          <section className="bg-white/20 dark:bg-black/30 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-3xl p-5 shadow-xl shadow-black/10">
            <div className="flex items-center justify-between border-b border-white/40 dark:border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 dark:text-[#fe9832] text-[20px]">history</span>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">{t('communicate.recentCalls', 'Recent Calls')}</h2>
              </div>
              <button
                type="button"
                onClick={() => handleSwitchSection('history')}
                className="text-xs font-bold text-indigo-600 dark:text-[#fe9832] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{t('communicate.viewFullHistory', 'View Full History')} ({sessions.length})</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            {callsLoading ? (
              <div className="py-4 text-center text-xs text-gray-500 dark:text-[#828796]">
                Loading recent calls...
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-4 text-center text-xs text-gray-500 dark:text-[#828796]">
                {t('communicate.noPreviousCalls', 'No previous video calls found. Start a new video call above!')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/30 dark:border-white/10 text-gray-600 dark:text-[#828796] font-bold">
                      <th className="pb-2">Room Code</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Created</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/20 dark:divide-white/10">
                    {sessions.slice(0, 3).map((call) => {
                      const isCallActive = call.status === 'ACTIVE' || call.status === 'WAITING' || call.status === 'CREATED';
                      return (
                        <tr key={call.id} className="hover:bg-white/30 dark:hover:bg-black/30">
                          <td className="py-2 font-mono font-bold text-gray-900 dark:text-white">
                            {call.roomCode || call.id.substring(0, 8)}
                          </td>
                          <td className="py-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isCallActive ? 'bg-emerald-100 dark:bg-green-950/40 text-emerald-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}>
                              {call.status}
                            </span>
                          </td>
                          <td className="py-2 text-gray-600 dark:text-[#828796]">
                            {new Date(call.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="py-2 text-right">
                            {isCallActive ? (
                              <button
                                type="button"
                                onClick={() => navigate(`/communicate/online/${call.id}`)}
                                className="px-2.5 py-1 bg-gradient-to-r from-sky-500 to-indigo-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#683700] rounded-lg font-bold text-[11px] shadow-sm cursor-pointer"
                              >
                                Rejoin
                              </button>
                            ) : (
                              <span className="text-gray-400 dark:text-[#828796] text-[11px]">Ended</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ========================================================
          VIEW 2: FULL CALL HISTORY (When activeSection === 'history')
      ======================================================== */}
      {activeSection === 'history' && (
        <div className="flex flex-col gap-5 animate-fadeIn">
          {/* History Search & Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/20 dark:bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/40 dark:border-white/10 shadow-xl shadow-black/10">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                placeholder="Search by room code or status..."
                className="w-full pl-9 pr-4 py-2 bg-white/50 dark:bg-black/50 backdrop-blur-sm border border-white/60 dark:border-white/20 rounded-xl text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={fetchCallsHistory}
                disabled={callsLoading}
                className="px-3.5 py-2 rounded-xl bg-white/50 hover:bg-white/70 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs border border-white/60 dark:border-white/15"
                title="Refresh Call History"
              >
                <span className={`material-symbols-outlined text-[16px] ${callsLoading ? 'animate-spin' : ''}`}>
                  refresh
                </span>
                <span>{t('communicate.refresh', 'Refresh')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchSection('lobby')}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#542900] text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">video_call</span>
                <span>{t('communicate.startNew', 'Start New Call')}</span>
              </button>
            </div>
          </div>

          {/* Sessions List */}
          {callsLoading ? (
            <div className="py-16 text-center text-xs text-gray-700 dark:text-[#828796] animate-pulse bg-white/35 dark:bg-black/40 backdrop-blur-md rounded-3xl border border-white/60 dark:border-white/15">
              Loading communication session logs...
            </div>
          ) : filteredSessions.length > 0 ? (
            <div className="space-y-3">
              {filteredSessions.map((call) => {
                const isCallActive =
                  call.status === 'ACTIVE' ||
                  call.status === 'WAITING' ||
                  call.status === 'CREATED';

                return (
                  <div
                    key={call.id}
                    className="bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-2xl p-5 border border-white/60 hover:border-indigo-400 dark:border-white/15 dark:hover:border-[#fe9832] shadow-md hover:shadow-xl transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-sky-100/90 text-sky-700 dark:bg-white/5 dark:text-[#fe9832] flex items-center justify-center shrink-0 shadow-2xs">
                        <span className="material-symbols-outlined text-[22px]">videocam</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                          <span className="font-bold text-sm text-gray-950 dark:text-white">
                            Room Code: <span className="font-mono text-indigo-600 dark:text-[#fe9832] font-black">{call.roomCode || call.id.substring(0, 8)}</span>
                          </span>
                          <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full ${
                            isCallActive
                              ? 'bg-emerald-100 dark:bg-green-950/40 text-emerald-700 dark:text-green-400 animate-pulse'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}>
                            {call.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-[#c1c6d7] font-medium">
                          Created on {new Date(call.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                      {call.roomCode && (
                        <button
                          type="button"
                          onClick={() => handleCopyText(call.roomCode || '', call.id)}
                          className="px-3 py-1.5 bg-white/60 hover:bg-white/80 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs border border-white/60 dark:border-white/15"
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            {copiedId === call.id ? 'check' : 'content_copy'}
                          </span>
                          <span>{copiedId === call.id ? 'Copied' : 'Copy Code'}</span>
                        </button>
                      )}

                      {isCallActive ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/communicate/online/${call.id}`)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#542900] rounded-xl font-bold text-xs shadow-sm hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>{t('communicate.rejoin', 'Rejoin Call')}</span>
                          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 rounded-xl bg-white/40 dark:bg-black/40 text-gray-600 dark:text-[#c1c6d7] text-xs font-medium border border-white/60 dark:border-white/15">
                          Session Ended
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center bg-white/35 dark:bg-black/40 backdrop-blur-md rounded-3xl border border-white/60 dark:border-white/15 p-6 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500">
                <span className="material-symbols-outlined text-[32px]">history_toggle_off</span>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">{t('communicate.noCallsFound', 'No calls found')}</h3>
              <p className="text-xs text-gray-500 dark:text-[#828796] max-w-sm">
                {historySearchQuery ? t('communicate.noCallsSearch', 'No calls matched your search filter.') : t('communicate.noCallsHosted', 'You have not hosted or joined any 1-on-1 video call sessions yet.')}
              </p>
              <button
                type="button"
                onClick={() => handleSwitchSection('lobby')}
                className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#542900] text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">video_call</span>
                <span>{t('communicate.firstCall', 'Launch Your First Call')}</span>
              </button>
            </div>
          )}
        </div>
      )}

      </div>
    </div>
  );
};

export default CommunicatePage;
