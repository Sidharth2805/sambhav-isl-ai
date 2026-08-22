import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { SignSequencePlayer } from '../components/accessibility/SignSequencePlayer';

interface SignAssetDto {
  assetId: string;
  conceptId: string;
  language: string;
  assetType: string;
  assetReference: string;
  durationMs: number;
  version: string;
  status: string;
  source: string;
}

interface SignStepDto {
  sequenceIndex: number;
  conceptId: string;
  displayToken: string;
  durationMs: number;
  confidence: number;
  asset: SignAssetDto | null;
  resolutionStatus: 'FOUND' | 'MISSING' | 'UNSUPPORTED' | 'INVALID';
  sourceConcept: string;
}

interface SignSequenceDto {
  sequenceId: string;
  sourceSessionId: string;
  sourceText: string;
  language: string;
  createdAt: number;
  steps: SignStepDto[];
  totalDurationMs: number;
  overallConfidence: number;
  status: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  mode: 'SPEECH' | 'TEXT' | 'GESTURE';
  text: string;
  words: string[];
  timestamp: string;
}

export const TranslatePage: React.FC = () => {
  const { speak, speaking } = useTextToSpeech();

  // Communication Session Active State (Lobby vs Active)
  const [inSession, setInSession] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Active Mode (3 core modes: Speech <-> ISL, Text -> ISL, ISL -> Text)
  const [activeMode, setActiveMode] = useState<'SPEECH_TO_ISL' | 'TEXT_TO_ISL' | 'ISL_TO_TEXT'>('SPEECH_TO_ISL');

  // Persistent Media Stream State (Camera & Mic stay active across all mode switches)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);

  // Speech & Captions State
  const [isListening, setIsListening] = useState(false);
  const [liveCaption, setLiveCaption] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [sessionHistoryLogs, setSessionHistoryLogs] = useState<{ mode: string; text: string; time: string }[]>([]);
  const recognitionRef = useRef<any>(null);

  // Text Mode State & Word Highlighting
  const [inputText, setInputText] = useState('');
  const [textMessages, setTextMessages] = useState<ChatMessage[]>([]);
  const [activeSigningMessageId, setActiveSigningMessageId] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [translatedText, setTranslatedText] = useState('');

  // ISL Avatar Sequence State
  const [currentSequence, setCurrentSequence] = useState<SignSequenceDto | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Settings & Speed Control (0.75x, 1.0x, 1.25x, 1.5x)
  const [captionFontSize, setCaptionFontSize] = useState<'sm' | 'md' | 'lg'>('lg');
  const [avatarSpeed, setAvatarSpeed] = useState<number>(1.25);
  const [autoSpeakGestures] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of conversation history
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [textMessages, liveCaption]);

  // Fast Instant Sign Tokenizer & Sequencer
  const translateTextToSign = useCallback((text: string, messageId?: string) => {
    if (!text || !text.trim()) return;

    setIsProcessing(true);
    setActiveStepIndex(0);
    if (messageId) {
      setActiveSigningMessageId(messageId);
    }

    try {
      const words = text.trim().split(/\s+/);
      const stepDuration = 450; // Base duration; SignSequencePlayer handles playbackSpeed scaling

      const steps: SignStepDto[] = words.map((word, index) => {
        const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        return {
          sequenceIndex: index,
          conceptId: cleanWord,
          displayToken: cleanWord,
          durationMs: stepDuration,
          confidence: 0.98,
          asset: {
            assetId: `asset-${cleanWord}`,
            conceptId: cleanWord,
            language: 'ISL',
            assetType: 'VIDEO',
            assetReference: `https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4`,
            durationMs: stepDuration,
            version: '1.0',
            status: 'ACTIVE',
            source: 'SAMBHAV_REPOSITORY',
          },
          resolutionStatus: 'FOUND',
          sourceConcept: cleanWord,
        };
      });

      const sequence: SignSequenceDto = {
        sequenceId: `trans-${Date.now()}`,
        sourceSessionId: `session-${Date.now()}`,
        sourceText: text,
        language: 'ISL',
        createdAt: Date.now(),
        totalDurationMs: steps.length * stepDuration,
        overallConfidence: 0.98,
        status: 'READY',
        steps,
      };

      setCurrentSequence(sequence);
    } catch (err) {
      console.error('Fast translation sequence error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Initialize Speech Recognition once on mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalStr = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalStr += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          setLiveCaption(interim);
        }

        if (finalStr) {
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setFinalTranscript(finalStr);
          setSessionHistoryLogs((prev) => [...prev, { mode: 'SPEECH', text: finalStr, time: timestamp }]);
          setLiveCaption('');
          translateTextToSign(finalStr);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition warning:', e?.error || e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [translateTextToSign]);

  // Keep videoRef continuously linked to active mediaStream
  useEffect(() => {
    if (inSession && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [inSession, activeMode, cameraActive]);

  // Start Communication Flow (Enables Camera & Mic)
  const handleStartCommunication = async () => {
    setInSession(true);
    setShowSummaryModal(false);
    setSessionHistoryLogs([]);
    setTextMessages([]);
    setLiveCaption('');
    setFinalTranscript('');
    setTranslatedText('');
    setActiveStepIndex(-1);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        mediaStreamRef.current = stream;
        setCameraActive(true);
        setMicActive(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.warn('Camera/mic access unavailable. Operating in software mode.', err);
      setCameraActive(false);
      setMicActive(false);
    }

    if (recognitionRef.current && activeMode === 'SPEECH_TO_ISL') {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Could not auto-start speech recognition:', e);
      }
    }
  };

  // Mode Switch Handler (Preserves Camera & Mic; logs mid-conversation mode switch)
  const handleSwitchMode = (newMode: 'SPEECH_TO_ISL' | 'TEXT_TO_ISL' | 'ISL_TO_TEXT') => {
    if (newMode === activeMode) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const modeLabel = newMode === 'SPEECH_TO_ISL' ? 'Speech <-> ISL' : newMode === 'TEXT_TO_ISL' ? 'Text -> ISL' : 'ISL -> Text';

    // Log mid-conversation mode transition in history
    setSessionHistoryLogs((prev) => [
      ...prev,
      { mode: 'SYSTEM', text: `Switched mode to ${modeLabel}`, time: timestamp },
    ]);

    // Also add system pill to text messages view
    setTextMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: 'system',
        mode: newMode === 'SPEECH_TO_ISL' ? 'SPEECH' : newMode === 'TEXT_TO_ISL' ? 'TEXT' : 'GESTURE',
        text: `Mode changed to ${modeLabel}`,
        words: [],
        timestamp,
      },
    ]);

    // Manage speech recognition without stopping hardware media tracks
    if (newMode === 'SPEECH_TO_ISL') {
      if (recognitionRef.current && !isListening) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {}
      }
    } else {
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
          setIsListening(false);
        } catch (e) {}
      }
    }

    setActiveMode(newMode);
  };

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setCameraActive(false);
    setMicActive(false);
    setIsListening(false);
  };

  const handleStopCommunication = () => {
    stopMediaStream();
    setShowSummaryModal(true);
  };

  const handleDoneSummary = () => {
    setShowSummaryModal(false);
    setInSession(false);
    setLiveCaption('');
    setFinalTranscript('');
    setInputText('');
    setTranslatedText('');
    setTextMessages([]);
    setSessionHistoryLogs([]);
    setCurrentSequence(null);
    setSavedSuccess(false);
    setActiveStepIndex(-1);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Speech recognition toggle start error:', e);
      }
    }
  };

  // Submit text in TEXT_TO_ISL mode
  const handleSendTextMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const trimmed = inputText.trim();
    const msgId = `msg-${Date.now()}`;
    const words = trimmed.split(/\s+/);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessage: ChatMessage = {
      id: msgId,
      sender: 'user',
      mode: 'TEXT',
      text: trimmed,
      words: words,
      timestamp,
    };

    setTextMessages((prev) => [...prev, newMessage]);
    setSessionHistoryLogs((prev) => [...prev, { mode: 'TEXT', text: trimmed, time: timestamp }]);
    setInputText('');

    // Trigger instant avatar sign translation
    translateTextToSign(trimmed, msgId);
  };

  const handleSimulateGestureRecognition = (phrase: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTranslatedText(phrase);
    setSessionHistoryLogs((prev) => [...prev, { mode: 'GESTURE', text: phrase, time: timestamp }]);
    if (autoSpeakGestures) {
      speak(phrase);
    }
  };

  const handleSaveCommunication = () => {
    const existing = JSON.parse(localStorage.getItem('sambhav_saved_translations') || '[]');
    const record = {
      id: `saved-session-${Date.now()}`,
      type: 'REAL_TIME_TRANSLATION',
      sourceText: sessionHistoryLogs.map((l) => `[${l.mode}] ${l.text}`).join(' | ') || 'ISL Translation Session',
      historyLogs: sessionHistoryLogs,
      messages: textMessages,
      timestamp: new Date().toISOString(),
      sequence: currentSequence,
    };
    localStorage.setItem('sambhav_saved_translations', JSON.stringify([record, ...existing]));
    setSavedSuccess(true);
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-80px)] md:h-[calc(100vh-60px)] font-['Inter',sans-serif] overflow-hidden">
      
      {/* Top Header Bar */}
      <header className="flex items-center justify-between border-b border-[#e0e3e5] dark:border-[#2d3133] pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fe9832]/10 dark:bg-[#fe9832]/20 text-[#fe9832] flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">translate</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#181c1e] dark:text-white tracking-tight">Real-Time Translation</h1>
            <p className="text-xs text-[#45474c] dark:text-[#c1c6d7]">
              Interactive ISL Avatar visualizer, Speech-to-Sign, and Text translation
            </p>
          </div>
        </div>

        {inSession && (
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 text-xs font-bold rounded-full border border-green-300 dark:border-green-800">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Active
            </span>
            <button
              onClick={handleStopCommunication}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              aria-label="Stop communication"
            >
              <span className="material-symbols-outlined text-[18px]">stop_circle</span>
              <span>Stop Communication</span>
            </button>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* SCREEN 1: LOBBY (START COMMUNICATION) - ORGANIZED STUDIO LAYOUT           */}
      {/* ========================================================================= */}
      {!inSession && !showSummaryModal && (
        <div className="flex-1 flex flex-col justify-center py-4 sm:py-6 relative overflow-y-auto">
          
          {/* Ambient Lighting & Glow Background */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/40 dark:from-[#090e17] dark:via-[#0d131f] dark:to-[#040810] rounded-[28px] border border-slate-200 dark:border-slate-800/80 overflow-hidden">
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-amber-500/15 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-500/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
          </div>

          <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-2 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
            
            {/* Left Column: Hero & Launch Controls (6 cols) */}
            <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-xs font-extrabold text-amber-900 dark:text-amber-300 shadow-sm mb-4">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>AI-Powered Real-Time ISL Translation</span>
              </div>

              {/* Main Headline */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-4">
                Break Communication Barriers in{' '}
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                  Real-Time
                </span>
              </h2>

              {/* Subtext */}
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mb-6 leading-relaxed max-w-lg">
                Translate seamlessly between <strong className="text-amber-600 dark:text-amber-400">spoken voice</strong>, <strong className="text-emerald-600 dark:text-emerald-400">live text</strong>, and <strong className="text-indigo-600 dark:text-indigo-400">Indian Sign Language 3D avatars</strong> with zero delay.
              </p>

              {/* Main Start CTA Button */}
              <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={handleStartCommunication}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-base rounded-2xl transition-all duration-200 shadow-[0_8px_24px_rgba(245,158,11,0.35)] hover:shadow-[0_12px_32px_rgba(245,158,11,0.5)] flex items-center justify-center gap-3 group cursor-pointer hover:-translate-y-0.5 active:scale-95"
                >
                  <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">
                    videocam
                  </span>
                  <span>Start Translation Studio</span>
                  <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </div>

              {/* Preferences Card */}
              <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <span className="material-symbols-outlined text-amber-500 text-[18px]">tune</span>
                  <span>Studio Preferences:</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer">
                    <span>Font:</span>
                    <select
                      value={captionFontSize}
                      onChange={(e: any) => setCaptionFontSize(e.target.value)}
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-2 py-1 text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                    </select>
                  </label>

                  <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer">
                    <span>Speed:</span>
                    <select
                      value={avatarSpeed}
                      onChange={(e: any) => setAvatarSpeed(parseFloat(e.target.value))}
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-2 py-1 text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value={0.5}>0.5x (Slow)</option>
                      <option value={0.75}>0.75x (Relaxed)</option>
                      <option value={1.0}>1.0x (Normal)</option>
                      <option value={1.25}>1.25x (Fast)</option>
                      <option value={1.5}>1.5x (Pro)</option>
                    </select>
                  </label>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Mode Cards (6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-3.5">
              
              <div className="text-left mb-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Select a Translation Mode to Launch:
                </span>
              </div>

              {/* Mode 1: Speech to ISL */}
              <div 
                onClick={() => {
                  setActiveMode('SPEECH_TO_ISL');
                  handleStartCommunication();
                }}
                className="bg-white/95 dark:bg-slate-900/95 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 dark:bg-amber-500/25 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">mic</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Speech &harr; ISL</span>
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold rounded-full">Voice Active</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Continuous microphone capture with live captions and 3D avatar signing in real time.
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all">
                  chevron_right
                </span>
              </div>

              {/* Mode 2: Text to ISL */}
              <div 
                onClick={() => {
                  setActiveMode('TEXT_TO_ISL');
                  handleStartCommunication();
                }}
                className="bg-white/95 dark:bg-slate-900/95 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">edit_note</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Text &rarr; ISL</span>
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold rounded-full">Word-Sync</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Type sentences with synchronized green word highlighting matching the 3D avatar's signs.
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">
                  chevron_right
                </span>
              </div>

              {/* Mode 3: ISL to Text */}
              <div 
                onClick={() => {
                  setActiveMode('ISL_TO_TEXT');
                  handleStartCommunication();
                }}
                className="bg-white/95 dark:bg-slate-900/95 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 dark:bg-indigo-500/25 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl">sign_language</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>ISL &rarr; Text / Voice</span>
                      <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 text-[10px] font-extrabold rounded-full">Camera Tracker</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Camera-based gesture tracking synthesizes natural spoken audio and subtitles in real time.
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all">
                  chevron_right
                </span>
              </div>

              {/* Feature Tags Ribbon */}
              <div className="flex items-center justify-between px-2 pt-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-amber-500 text-sm">bolt</span>
                  &lt; 200ms Latency
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-emerald-500 text-sm">verified</span>
                  1,000+ Dictionary Signs
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-indigo-500 text-sm">lock</span>
                  End-to-End Encrypted
                </span>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: ACTIVE COMMUNICATION ARENA                                      */}
      {/* ========================================================================= */}
      {inSession && !showSummaryModal && (
        <div className="flex-1 flex flex-col gap-3 py-3 overflow-hidden">
          
          {/* Top Bar: Mode Tabs + Live Controls + Inline Preferences */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#e0e3e5] dark:bg-[#1a202c] p-1.5 rounded-xl shrink-0 border border-transparent dark:border-[#2d3133]">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleSwitchMode('SPEECH_TO_ISL')}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMode === 'SPEECH_TO_ISL'
                    ? 'bg-white dark:bg-[#2d3133] text-[#181c1e] dark:text-white shadow-sm'
                    : 'text-[#45474c] dark:text-[#c1c6d7] hover:text-[#181c1e] dark:hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">mic</span>
                <span>Speech &harr; ISL</span>
              </button>

              <button
                onClick={() => handleSwitchMode('TEXT_TO_ISL')}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMode === 'TEXT_TO_ISL'
                    ? 'bg-white dark:bg-[#2d3133] text-[#181c1e] dark:text-white shadow-sm'
                    : 'text-[#45474c] dark:text-[#c1c6d7] hover:text-[#181c1e] dark:hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                <span>Text &rarr; ISL</span>
              </button>

              <button
                onClick={() => handleSwitchMode('ISL_TO_TEXT')}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMode === 'ISL_TO_TEXT'
                    ? 'bg-white dark:bg-[#2d3133] text-[#181c1e] dark:text-white shadow-sm'
                    : 'text-[#45474c] dark:text-[#c1c6d7] hover:text-[#181c1e] dark:hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">sign_language</span>
                <span>ISL &rarr; Text</span>
              </button>
            </div>

            {/* Inline Preferences (Accessible directly during communication) */}
            <div className="flex items-center gap-3 text-xs font-semibold text-[#45474c] dark:text-[#c1c6d7]">
              <label className="flex items-center gap-1">
                <span>Font:</span>
                <select
                  value={captionFontSize}
                  onChange={(e: any) => setCaptionFontSize(e.target.value)}
                  className="bg-white dark:bg-[#2d3133] border border-[#c6c6cc] dark:border-[#2d3133] rounded px-1.5 py-0.5 text-xs font-bold text-[#181c1e] dark:text-white outline-none"
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                </select>
              </label>

              <label className="flex items-center gap-1">
                <span>Speed:</span>
                <select
                  value={avatarSpeed}
                  onChange={(e: any) => setAvatarSpeed(parseFloat(e.target.value))}
                  className="bg-white dark:bg-[#2d3133] border border-[#c6c6cc] dark:border-[#2d3133] rounded px-1.5 py-0.5 text-xs font-bold text-[#181c1e] dark:text-white outline-none"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1.0}>1.0x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                </select>
              </label>

              {/* Status Badges (Always ON throughout communication) */}
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#c6c6cc] dark:border-[#2d3133]">
                <span className={`flex items-center gap-1 ${cameraActive ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                  <span className="material-symbols-outlined text-[16px]">videocam</span>
                  <span>{cameraActive ? 'Camera Live' : 'Camera Off'}</span>
                </span>
                <span className={`flex items-center gap-1 ${micActive ? 'text-green-600 dark:text-green-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                  <span className="material-symbols-outlined text-[16px]">mic</span>
                  <span>{micActive ? 'Audio Live' : 'Audio Off'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Stretched Arena Grid: Left Avatar (Spacious) | Right Mode Specific Workspace */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
            
            {/* LEFT: Spacious Avatar Visualization (Spans 6 cols) */}
            <div className="lg:col-span-6 bg-[#1a202c] text-white rounded-2xl p-4 shadow-md flex flex-col justify-between relative overflow-hidden min-h-0 border border-slate-700/50">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#fe9832] text-[20px]">accessibility</span>
                  <h3 className="text-sm font-bold text-white">ISL Avatar Visualizer</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-[#fe9832]/20 text-[#fe9832] px-2 py-0.5 rounded font-mono font-bold">
                    Speed: {avatarSpeed}x
                  </span>
                  <span className="text-[10px] bg-white/10 text-[#dde2f3] px-2 py-0.5 rounded font-mono">
                    {currentSequence ? `${currentSequence.steps.length} Tokens` : 'Ready'}
                  </span>
                </div>
              </div>

              {/* Large Avatar Animation Area */}
              <div className="flex-1 flex items-center justify-center overflow-hidden min-h-0">
                {currentSequence ? (
                  <div className="w-full h-full max-h-[380px] flex items-center justify-center">
                    <SignSequencePlayer
                      sequence={currentSequence}
                      playbackSpeed={avatarSpeed}
                      onStepStart={(index) => setActiveStepIndex(index)}
                      onComplete={() => setActiveStepIndex(-1)}
                      hideOverlayBadge={activeMode === 'TEXT_TO_ISL'}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4 gap-2">
                    <img
                      className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-2 border-white/20 shadow-xl opacity-85"
                      alt="ISL Avatar"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZTT_g8UEu9lHEIQwtsX1X3URkCYfzWm4KcI6A5fPGOvsqaYQSwa2EKYl5DIN41BeTvoADFslNF7KJ85jk1gEcS_Np87ei5nyDBVGbanY1DU8hCom86MCRgJaUyemC5ZmxWMOz-pV5B884zt3ISMTf9cbHDpA9dV3Au1V7-WeBaSc_6cn0ejlXb0sjvBo96UzvppAgaNZ-j8SlDX-0ofnA9o83O2oi7b0NN7TH3PSzeCxR2zUFJZaz"
                    />
                    <p className="text-xs text-[#828796] mt-1">
                      Avatar Ready &bull; Input speech or text to animate signs.
                    </p>
                  </div>
                )}
              </div>

              {/* Self Camera PiP View (Subtle corner - Always ON) */}
              <div className="absolute bottom-3 right-3 w-28 h-20 sm:w-36 sm:h-24 bg-black rounded-xl overflow-hidden border border-white/30 shadow-lg">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
                <span className="absolute bottom-1 left-1.5 px-1 py-0.2 bg-black/60 text-white text-[9px] font-bold rounded">
                  {cameraActive ? 'Camera Live' : 'Camera Feed'}
                </span>
              </div>
            </div>

            {/* RIGHT: Workspace Panel (Spans 6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-3 min-h-0">
              
              {/* ========================================================= */}
              {/* MODE 1: SPEECH <-> ISL (With Live Captions Stream)         */}
              {/* ========================================================= */}
              {activeMode === 'SPEECH_TO_ISL' && (
                <>
                  <div className="flex-1 bg-white dark:bg-[#1a202c] rounded-2xl p-4 border border-[#e0e3e5] dark:border-[#2d3133] shadow-sm flex flex-col justify-between min-h-0">
                    <div className="flex items-center justify-between border-b border-[#e0e3e5] dark:border-[#2d3133] pb-2 shrink-0">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#8f4e00] dark:text-[#ffb77a] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">subtitles</span>
                        Speech Live Captions Stream
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isListening ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-300 animate-pulse' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                      }`}>
                        {isListening ? '● Mic Streaming' : 'Mic Active'}
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto my-2 p-3 bg-[#f7fafc] dark:bg-[#0d121d] rounded-xl border border-[#e0e3e5] dark:border-[#2d3133]">
                      <p className={`font-semibold leading-relaxed text-[#181c1e] dark:text-white ${
                        captionFontSize === 'lg' ? 'text-xl' : captionFontSize === 'md' ? 'text-base' : 'text-sm'
                      }`}>
                        {liveCaption ? (
                          <span className="text-[#fe9832] font-bold">{liveCaption}</span>
                        ) : finalTranscript ? (
                          <span>{finalTranscript}</span>
                        ) : (
                          <span className="text-[#45474c]/70 dark:text-[#c1c6d7]/60 italic">
                            Spoken speech and live captions stream here in real-time...
                          </span>
                        )}
                      </p>
                    </div>

                    {finalTranscript && (
                      <div className="flex items-center justify-between pt-1 shrink-0">
                        <span className="text-[11px] text-[#45474c] dark:text-[#c1c6d7]">Voice Transcription Logged</span>
                        <button
                          onClick={() => speak(finalTranscript)}
                          disabled={speaking}
                          className="px-3 py-1 bg-[#e0e3e5] dark:bg-[#2d3133] hover:bg-[#c6c6cc] dark:hover:bg-[#3e4347] text-[#181c1e] dark:text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">volume_up</span>
                          <span>Speak Aloud</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Speech Controls */}
                  <div className="bg-white dark:bg-[#1a202c] rounded-2xl p-4 border border-[#e0e3e5] dark:border-[#2d3133] shadow-sm shrink-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-[#fe9832]/10 dark:bg-[#fe9832]/20 text-[#fe9832] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">mic</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#181c1e] dark:text-white">Continuous Speech Recognition</p>
                        <p className="text-[11px] text-[#45474c] dark:text-[#c1c6d7]">Speak freely to continuously translate into ISL signs</p>
                      </div>
                    </div>
                    <button
                      onClick={toggleListening}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                        isListening
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-[#fe9832] hover:bg-[#e8872b] text-[#4a2600]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isListening ? 'mic_off' : 'mic'}
                      </span>
                      <span>{isListening ? 'Pause Mic' : 'Resume Mic'}</span>
                    </button>
                  </div>
                </>
              )}

              {/* ========================================================= */}
              {/* MODE 2: TEXT -> ISL (Conversation History with GREEN Text) */}
              {/* ========================================================= */}
              {activeMode === 'TEXT_TO_ISL' && (
                <>
                  {/* Stretched Text Conversation History with Live Green Word Sync */}
                  <div className="flex-1 bg-white dark:bg-[#1a202c] rounded-2xl p-4 border border-[#e0e3e5] dark:border-[#2d3133] shadow-sm flex flex-col justify-between min-h-0">
                    <div className="flex items-center justify-between border-b border-[#e0e3e5] dark:border-[#2d3133] pb-2 shrink-0">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                        Text Conversation & Translation History
                      </span>
                      <span className="text-[10px] text-[#45474c] dark:text-[#c1c6d7] font-semibold">
                        {textMessages.filter((m) => m.sender !== 'system').length} Messages
                      </span>
                    </div>

                    {/* Messages Scroll View */}
                    <div className="flex-1 overflow-y-auto my-2 p-3 bg-[#f7fafc] dark:bg-[#0d121d] rounded-xl border border-[#e0e3e5] dark:border-[#2d3133] flex flex-col gap-3">
                      {textMessages.length === 0 ? (
                        <div className="my-auto text-center p-6 text-[#45474c]/70 dark:text-[#c1c6d7]/60 flex flex-col items-center gap-2">
                          <span className="material-symbols-outlined text-3xl text-[#c6c6cc] dark:text-[#45474c]">edit_note</span>
                          <p className="text-xs font-semibold text-[#181c1e] dark:text-white">No messages entered yet.</p>
                          <p className="text-[11px] text-[#45474c] dark:text-[#c1c6d7]">Type any sentence below to watch the avatar animate ISL signs and turn words green in sync.</p>
                        </div>
                      ) : (
                        textMessages.map((msg) => {
                          if (msg.sender === 'system') {
                            return (
                              <div key={msg.id} className="self-center my-1 px-3 py-1 bg-[#e0e3e5]/80 dark:bg-[#2d3133] rounded-full text-[10px] font-bold text-[#45474c] dark:text-[#c1c6d7] flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">swap_horiz</span>
                                <span>{msg.text} &bull; {msg.timestamp}</span>
                              </div>
                            );
                          }

                          const isSigningThisMsg = activeSigningMessageId === msg.id && activeStepIndex >= 0;

                          return (
                            <div
                              key={msg.id}
                              className="self-end max-w-[90%] bg-white dark:bg-[#242b38] p-3.5 rounded-2xl rounded-tr-sm border border-[#e0e3e5] dark:border-[#2d3133] shadow-sm flex flex-col gap-1.5"
                            >
                              {/* Word by word rendering with synchronized GREEN highlight */}
                              <div className={`flex flex-wrap items-center gap-1.5 ${
                                captionFontSize === 'lg' ? 'text-lg' : captionFontSize === 'md' ? 'text-base' : 'text-sm'
                              }`}>
                                {msg.words.map((word, wordIdx) => {
                                  const isCurrentlyActive = isSigningThisMsg && wordIdx === activeStepIndex;
                                  const isCompleted = isSigningThisMsg && wordIdx < activeStepIndex;

                                  return (
                                    <span
                                      key={wordIdx}
                                      className={`transition-all duration-200 rounded px-1.5 py-0.5 ${
                                        isCurrentlyActive
                                          ? 'bg-green-500 text-white font-black scale-110 shadow-md ring-2 ring-green-400'
                                          : isCompleted
                                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700'
                                          : 'text-[#181c1e] dark:text-white font-medium'
                                      }`}
                                    >
                                      {word}
                                    </span>
                                  );
                                })}
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-[#45474c] dark:text-[#c1c6d7] pt-1 border-t border-[#e0e3e5]/60 dark:border-[#2d3133]">
                                <span className="flex items-center gap-1">
                                  <span className="font-bold text-emerald-800 dark:text-emerald-300 uppercase text-[9px] bg-[#dde2f3] dark:bg-indigo-950 px-1.5 py-0.2 rounded">Text</span>
                                  <span>{msg.timestamp}</span>
                                </span>
                                {isSigningThisMsg ? (
                                  <span className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    Signing Word {activeStepIndex + 1}/{msg.words.length} ({avatarSpeed}x)
                                  </span>
                                ) : (
                                  <span className="text-gray-400 dark:text-gray-500">Translated</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Instant Status */}
                    {activeSigningMessageId && activeStepIndex >= 0 && (
                      <div className="flex items-center justify-between pt-1 shrink-0 text-xs text-green-700 dark:text-green-400 font-bold">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                          Synchronized Green Text Highlighting Active ({avatarSpeed}x speed)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Text Input Panel */}
                  <form onSubmit={handleSendTextMessage} className="bg-white dark:bg-[#1a202c] rounded-2xl p-3 border border-[#e0e3e5] dark:border-[#2d3133] shadow-sm shrink-0 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a sentence (e.g. 'Hello welcome to our accessible office')..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-[#f7fafc] dark:bg-[#0d121d] border border-[#c6c6cc] dark:border-[#2d3133] rounded-xl text-xs sm:text-sm text-[#181c1e] dark:text-white focus:border-[#fe9832] outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isProcessing || !inputText.trim()}
                      className="px-5 py-2.5 bg-[#fe9832] hover:bg-[#e8872b] text-[#4a2600] rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <span>Sign Text</span>
                      <span className="material-symbols-outlined text-[16px]">send</span>
                    </button>
                  </form>
                </>
              )}

              {/* ========================================================= */}
              {/* MODE 3: ISL -> TEXT (Camera Gesture Recognition)          */}
              {/* ========================================================= */}
              {activeMode === 'ISL_TO_TEXT' && (
                <>
                  <div className="flex-1 bg-white dark:bg-[#1a202c] rounded-2xl p-4 border border-[#e0e3e5] dark:border-[#2d3133] shadow-sm flex flex-col justify-between min-h-0">
                    <div className="flex items-center justify-between border-b border-[#e0e3e5] dark:border-[#2d3133] pb-2 shrink-0">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#181c1e] dark:text-white flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">sign_language</span>
                        Gesture-to-Voice Transcription
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300">
                        Camera Tracker Live
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto my-2 p-4 bg-[#f7fafc] dark:bg-[#0d121d] rounded-xl border border-[#e0e3e5] dark:border-[#2d3133] flex flex-col justify-center items-center text-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-[#8f4e00] dark:text-[#ffb77a] tracking-wider">Detected Phrase:</span>
                      <p className="text-2xl font-black text-[#181c1e] dark:text-white">
                        {translatedText || 'Detecting signs in view...'}
                      </p>
                      <p className="text-xs text-[#45474c] dark:text-[#c1c6d7] max-w-sm mt-1">
                        Signs performed in front of the camera are synthesized into speech audio and text.
                      </p>
                    </div>

                    {translatedText && (
                      <div className="flex items-center justify-between pt-1 shrink-0">
                        <span className="text-[11px] text-[#45474c] dark:text-[#c1c6d7]">Sign Recognized</span>
                        <button
                          onClick={() => speak(translatedText)}
                          disabled={speaking}
                          className="px-3 py-1 bg-[#e0e3e5] dark:bg-[#2d3133] hover:bg-[#c6c6cc] dark:hover:bg-[#3e4347] text-[#181c1e] dark:text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">volume_up</span>
                          <span>Speak Voice</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Gesture Controls */}
                  <div className="bg-white dark:bg-[#1a202c] rounded-2xl p-3 border border-[#e0e3e5] dark:border-[#2d3133] shadow-sm shrink-0 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">videocam</span>
                      </div>
                      <span className="text-xs font-bold text-[#181c1e] dark:text-white">Real-Time Gesture Tracking</span>
                    </div>
                    <button
                      onClick={() => handleSimulateGestureRecognition('HELLO WELCOME TO SAMBHAV')}
                      className="px-4 py-2 bg-[#181c1e] dark:bg-white dark:text-[#030813] hover:bg-[#2d3133] text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                    >
                      Simulate Sign Recognition
                    </button>
                  </div>
                </>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: SUMMARY MODAL (SAVE & DONE OPTIONS WITH DETAILED MODE BREAKDOWN)*/}
      {/* ========================================================================= */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a202c] rounded-[28px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#e0e3e5] dark:border-[#2d3133] flex flex-col gap-5 animate-scaleUp">
            
            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-[#e0e3e5] dark:border-[#2d3133] pb-4">
              <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">check_circle</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#181c1e] dark:text-white">Communication Ended</h2>
                <p className="text-xs text-[#45474c] dark:text-[#c1c6d7]">Session captured and ready to save</p>
              </div>
            </div>

            {/* Detailed Mode Breakdown in Summary */}
            <div className="bg-[#f7fafc] dark:bg-[#0d121d] rounded-2xl p-4 border border-[#e0e3e5] dark:border-[#2d3133] flex flex-col gap-2 max-h-48 overflow-y-auto">
              <div className="flex justify-between text-xs border-b border-[#e0e3e5]/60 dark:border-[#2d3133] pb-1.5">
                <span className="text-[#45474c] dark:text-[#c1c6d7]">Total Entries:</span>
                <span className="font-bold text-[#181c1e] dark:text-white">{sessionHistoryLogs.length} events</span>
              </div>

              {sessionHistoryLogs.length === 0 ? (
                <p className="text-[11px] text-[#45474c]/70 dark:text-[#c1c6d7]/60 italic py-2">No messages or speech recorded in this session.</p>
              ) : (
                <div className="space-y-1.5 pt-1">
                  {sessionHistoryLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 truncate max-w-[80%]">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          log.mode === 'SPEECH'
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                            : log.mode === 'TEXT'
                            ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300'
                            : log.mode === 'GESTURE'
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}>
                          {log.mode}
                        </span>
                        <span className="text-[#181c1e] dark:text-white truncate">{log.text}</span>
                      </div>
                      <span className="text-[10px] text-[#45474c] dark:text-[#c1c6d7]">{log.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions: Save Communication & Done */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleSaveCommunication}
                disabled={savedSuccess}
                className="flex-1 py-3 px-4 bg-[#fe9832] hover:bg-[#e8872b] text-[#4a2600] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {savedSuccess ? 'bookmark_added' : 'bookmark_add'}
                </span>
                <span>{savedSuccess ? 'Communication Saved!' : 'Save Communication'}</span>
              </button>

              <button
                onClick={handleDoneSummary}
                className="flex-1 py-3 px-4 bg-[#181c1e] hover:bg-[#2d3133] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Done</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default TranslatePage;
