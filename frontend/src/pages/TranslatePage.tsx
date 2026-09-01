import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { ISLAvatarCanvas, type ISLAvatarCanvasRef } from '../components/cultural/ISLAvatarCanvas';
import { useISLRecognition } from '../hooks/useISLRecognition';
import { ISLMessageComposer } from '../components/communication/ISLMessageComposer';
import { DraggableCameraWindow } from '../components/communication/DraggableCameraWindow';

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

  // Active Mode (Unified Speech/Text <-> ISL and ISL <-> Text)
  const [activeMode, setActiveMode] = useState<'SPEECH_TEXT_TO_ISL' | 'ISL_TO_TEXT'>('SPEECH_TEXT_TO_ISL');

  // Persistent Media Stream State (Camera & Mic stay active across all mode switches)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const gestureVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);

  // Real-Time ISL Neural Model Recognition Hook
  const {
    isRecognizing: isISLRecognizing,
    currentGesture: recognizedSign,
    confidence: signConfidence,
    translatedText: recognizedSignPhrase,
    isModelOnline,
    startRecognition: startISLRecognition,
    stopRecognition: stopISLRecognition,
  } = useISLRecognition();

  // Speech & Captions State
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState('en-IN');
  const [micError, setMicError] = useState<string | null>(null);
  const [isMicSupported, setIsMicSupported] = useState(true);
  const [liveCaption, setLiveCaption] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [sessionHistoryLogs, setSessionHistoryLogs] = useState<{ mode: string; text: string; time: string }[]>([]);
  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);
  const restartTimeoutRef = useRef<any>(null);

  // Text Mode State & Word Highlighting
  const [inputText, setInputText] = useState('');
  const [textMessages, setTextMessages] = useState<ChatMessage[]>([]);
  const [activeSigningMessageId, setActiveSigningMessageId] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);

  // ISL to Text Signed Conversation Feed
  const [signedMessages, setSignedMessages] = useState<{ id: string; sign: string; phrase: string; confidence: number; timestamp: string }[]>([]);
  const signedMessagesEndRef = useRef<HTMLDivElement | null>(null);

  // ISL Avatar Sequence State
  const [_currentSequence, setCurrentSequence] = useState<SignSequenceDto | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Settings & Speed Control (0.75x, 1.0x, 1.25x, 1.5x, 2.0x, 2.5x, 3.0x)
  const [captionFontSize, setCaptionFontSize] = useState<'sm' | 'md' | 'lg'>('lg');
  const [avatarSpeed, setAvatarSpeed] = useState<number>(1.25);
  const [autoSpeakGestures] = useState(true);
  const [autoReadOutChat, setAutoReadOutChat] = useState(true);
  const [isChatScrolledUp, setIsChatScrolledUp] = useState(false);

  const avatarCanvasRef = useRef<ISLAvatarCanvasRef | null>(null);
  const [modelPath, setModelPath] = useState('/models/ybot.glb');
  const [activeAvatarChar, setActiveAvatarChar] = useState<string | null>(null);

  // Auto-trigger letter-by-letter 3D avatar signing when speech live caption or text changes
  useEffect(() => {
    if (activeMode === 'SPEECH_TEXT_TO_ISL') {
      const activeText = liveCaption;
      if (activeText.trim()) {
        avatarCanvasRef.current?.signText(activeText);
      }
    }
  }, [liveCaption, finalTranscript, activeMode]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom only if user hasn't scrolled up
  useEffect(() => {
    if (!isChatScrolledUp) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [textMessages, isChatScrolledUp]);

  useEffect(() => {
    signedMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [signedMessages]);

  // Handle user manual scroll in chat window
  const handleChatScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 60;
    setIsChatScrolledUp(!isNearBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    setIsChatScrolledUp(false);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Handle WhatsApp-Style Consolidated Message Dispatch
  const handleSendSignedMessage = useCallback((finalSentence: string) => {
    if (!finalSentence || !finalSentence.trim()) return;

    const trimmed = finalSentence.trim();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setSignedMessages((prev) => [
      ...prev,
      {
        id: `signed-${Date.now()}`,
        sign: 'SENTENCE',
        phrase: trimmed,
        confidence: 0.98,
        timestamp,
      },
    ]);

    setSessionHistoryLogs((prev) => [
      ...prev,
      { mode: 'GESTURE', text: trimmed, time: timestamp },
    ]);

    // Speak the complete consolidated sentence
    if (autoSpeakGestures) {
      speak(trimmed);
    }
  }, [autoSpeakGestures, speak]);

  // Fast Instant Sign Tokenizer & Sequencer
  const translateTextToSign = useCallback((text: string, messageId?: string) => {
    if (!text || !text.trim()) return;

    setIsProcessing(true);
    setActiveStepIndex(0);
    if (messageId) {
      setActiveSigningMessageId(messageId);
    }

    // Trigger 3D Avatar letter-by-letter signing
    avatarCanvasRef.current?.signText(text);

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
        sequenceId: `seq-${Date.now()}`,
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
  }, [avatarSpeed]);

  // Safe Continuous Speech Recognition Engine with Auto-Recovery
  const startContinuousListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsMicSupported(false);
      setMicError('Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.');
      return;
    }

    shouldListenRef.current = true;
    setMicError(null);

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang || 'en-IN';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
      };

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
          const cleanFinal = finalStr.trim();
          if (cleanFinal) {
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const msgId = `msg-speech-${Date.now()}`;
            const words = cleanFinal.split(/\s+/);

            setFinalTranscript(cleanFinal);
            setSessionHistoryLogs((prev) => [...prev, { mode: 'SPEECH', text: cleanFinal, time: timestamp }]);

            // Add speech message to persistent conversation history feed
            setTextMessages((prev) => [
              ...prev,
              {
                id: msgId,
                sender: 'user',
                mode: 'SPEECH',
                text: cleanFinal,
                words,
                timestamp,
              },
            ]);

            setLiveCaption('');
            translateTextToSign(cleanFinal, msgId);
          }
        }
      };

      recognition.onerror = (e: any) => {
        const err = e?.error;
        console.warn('[SAMBHAV Speech] Error event:', err);
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          setMicError('Microphone access was denied. Please allow microphone permission in your browser URL bar.');
          shouldListenRef.current = false;
          setIsListening(false);
          return;
        }

        // For transient errors like no-speech or network, auto-resume smoothly
        if (shouldListenRef.current) {
          if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            if (shouldListenRef.current) {
              startContinuousListening();
            }
          }, 400);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        // Seamlessly restart if user wants continuous listening
        if (shouldListenRef.current) {
          if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            if (shouldListenRef.current) {
              startContinuousListening();
            }
          }, 250);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('[SAMBHAV Speech] Start error:', err);
      if (shouldListenRef.current) {
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          if (shouldListenRef.current) {
            startContinuousListening();
          }
        }, 800);
      }
    }
  }, [speechLang, translateTextToSign]);

  const stopContinuousListening = useCallback(() => {
    shouldListenRef.current = false;
    setIsListening(false);

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopContinuousListening();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stopContinuousListening]);

  // Keep videoRef continuously linked to active mediaStream
  useEffect(() => {
    if (inSession && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [inSession, activeMode, cameraActive]);

  // Auto-start ISL gesture recognition whenever entering ISL_TO_TEXT mode in session
  useEffect(() => {
    if (inSession && activeMode === 'ISL_TO_TEXT') {
      const vid = gestureVideoRef.current || videoRef.current;
      if (vid) {
        startISLRecognition(vid);
      }
    }
  }, [inSession, activeMode, startISLRecognition]);

  // Start Communication Flow (Enables Camera & Mic)
  const handleStartCommunication = async () => {
    setInSession(true);
    setShowSummaryModal(false);
    setSessionHistoryLogs([]);
    setTextMessages([]);
    setLiveCaption('');
    setFinalTranscript('');
    setActiveStepIndex(-1);
    setMicError(null);

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
        if (gestureVideoRef.current) {
          gestureVideoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.warn('Camera/mic hardware track access note:', err);
    }

    if (activeMode === 'SPEECH_TEXT_TO_ISL') {
      startContinuousListening();
    } else if (activeMode === 'ISL_TO_TEXT') {
      setTimeout(() => {
        const vid = gestureVideoRef.current || videoRef.current;
        if (vid) {
          if (mediaStreamRef.current && vid.srcObject !== mediaStreamRef.current) {
            vid.srcObject = mediaStreamRef.current;
            vid.play().catch(() => {});
          }
          startISLRecognition(vid);
        }
      }, 200);
    }
  };

  // Auto-trigger ISL Recognition and attach video stream when session is active in ISL_TO_TEXT mode
  useEffect(() => {
    if (inSession && activeMode === 'ISL_TO_TEXT') {
      const timer = setTimeout(() => {
        const vid = gestureVideoRef.current || videoRef.current;
        if (vid) {
          if (mediaStreamRef.current && vid.srcObject !== mediaStreamRef.current) {
            vid.srcObject = mediaStreamRef.current;
            vid.play().catch(() => {});
          }
          if (!isISLRecognizing) {
            startISLRecognition(vid);
          }
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [inSession, activeMode, isISLRecognizing, startISLRecognition]);

  // Mode Switch Handler (Preserves Camera & Mic; logs mid-conversation mode switch)
  const handleSwitchMode = (newMode: 'SPEECH_TEXT_TO_ISL' | 'ISL_TO_TEXT') => {
    if (newMode === activeMode) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const modeLabel = newMode === 'SPEECH_TEXT_TO_ISL' ? 'Speech / Text ↔ ISL' : 'ISL ↔ Text';

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
        mode: newMode === 'SPEECH_TEXT_TO_ISL' ? 'SPEECH' : 'GESTURE',
        text: `Mode changed to ${modeLabel}`,
        words: [],
        timestamp,
      },
    ]);

    setActiveMode(newMode);

    // Manage continuous speech recognition and ISL gesture tracking
    if (newMode === 'SPEECH_TEXT_TO_ISL') {
      stopISLRecognition();
      startContinuousListening();
    } else if (newMode === 'ISL_TO_TEXT') {
      stopContinuousListening();
      setTimeout(() => {
        if (gestureVideoRef.current || videoRef.current) {
          startISLRecognition(gestureVideoRef.current || videoRef.current);
        }
      }, 100);
    }
  };

  const stopMediaStream = () => {
    stopContinuousListening();
    stopISLRecognition();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
    setMicActive(false);
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
    setTextMessages([]);
    setSessionHistoryLogs([]);
    setCurrentSequence(null);
    setActiveStepIndex(-1);
    setMicError(null);
  };

  const toggleListening = () => {
    if (isListening || shouldListenRef.current) {
      stopContinuousListening();
    } else {
      startContinuousListening();
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

    // Automatically read out the chat if enabled
    if (autoReadOutChat) {
      speak(trimmed);
    }
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-80px)] md:h-[calc(100vh-60px)] font-['Inter',sans-serif] overflow-hidden">
      
      {/* Top Header Bar */}
      <header className="flex items-center justify-between border-b border-[#e0e3e5] dark:border-[#2d3133] pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fe9832]/10 text-[#fe9832] flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">translate</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#030813] dark:text-white tracking-tight">Real-Time Translation</h1>
            <p className="text-xs text-[#45474c] dark:text-[#c1c6d7]">
              Interactive ISL Avatar visualizer, Speech-to-Sign, and Text translation
            </p>
          </div>
        </div>

        {inSession && (
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-300 text-xs font-bold rounded-full">
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
      {/* SCREEN 1: LOBBY (START COMMUNICATION) WITH AMBIENT BACKGROUND             */}
      {/* ========================================================================= */}
      {!inSession && !showSummaryModal && (
        <div className="flex-1 flex flex-col justify-between py-4 relative overflow-hidden">
          
          {/* Ambient Lighting & Glow Background */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#f1f4f6] via-[#f7fafc] to-[#ebeef0] dark:from-[#0d121d] dark:via-[#101726] dark:to-[#030813] rounded-[28px] border border-[#e0e3e5]/60 dark:border-[#2d3133] overflow-hidden">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#ffdcc2]/40 dark:bg-[#fe9832]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#8dfc75]/20 dark:bg-[#10b981]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#fe9832]/10 dark:bg-[#4f46e5]/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Central Highlight CTA */}
          <div className="flex flex-col items-center justify-center text-center my-auto px-4 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-[#1a202c]/90 border border-[#e0e3e5] dark:border-[#2d3133] text-xs font-bold text-[#8f4e00] dark:text-[#ffb77a] shadow-sm mb-4">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span>Hardware-Accelerated Real-Time Sign Synthesis</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#030813] dark:text-white tracking-tight leading-tight max-w-2xl">
              Break Barriers in <span className="text-[#fe9832]">Real-Time</span>
            </h2>
            <p className="text-sm sm:text-base text-[#45474c] dark:text-[#c1c6d7] mt-3 max-w-xl leading-relaxed">
              Enable your camera and microphone for instant two-way translation between spoken voice, text, and Indian Sign Language.
            </p>

            {/* Main Action Button */}
            <button
              onClick={handleStartCommunication}
              className="mt-6 px-8 py-4 bg-gradient-to-r from-[#fe9832] to-[#ffb77a] hover:scale-105 active:scale-95 text-[#683700] font-black text-base sm:text-lg rounded-2xl transition-all shadow-lg hover:shadow-[#fe9832]/30 flex items-center gap-3 group"
            >
              <span className="material-symbols-outlined text-[28px] group-hover:rotate-12 transition-transform">
                videocam
              </span>
              <span>Start Communication</span>
              <span className="material-symbols-outlined text-[22px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>

          {/* Bottom Overview of the 3 Modes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 z-10 mt-auto">
            
            {/* Mode 1 */}
            <div className="bg-white/90 dark:bg-[#1a202c]/90 backdrop-blur-sm p-4 rounded-2xl border border-[#e0e3e5] dark:border-[#2d3133] shadow-sm flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fe9832]/15 text-[#8f4e00] dark:text-[#ffb77a] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">mic</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#181c1e] dark:text-white">Speech &harr; ISL</h3>
                <p className="text-xs text-[#45474c] dark:text-[#c1c6d7] mt-0.5 leading-relaxed">
                  Real-time microphone capture with live captions and avatar animation.
                </p>
              </div>
            </div>

            {/* Mode 2 */}
            <div className="bg-white/90 dark:bg-[#1a202c]/90 backdrop-blur-sm p-4 rounded-2xl border border-[#e0e3e5] dark:border-[#2d3133] shadow-sm flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">edit_note</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#181c1e] dark:text-white">Text &rarr; ISL</h3>
                <p className="text-xs text-[#45474c] dark:text-[#c1c6d7] mt-0.5 leading-relaxed">
                  Conversation history with synchronized real-time green text highlighting as the avatar signs.
                </p>
              </div>
            </div>

            {/* Mode 3 */}
            <div className="bg-white/90 dark:bg-[#1a202c]/90 backdrop-blur-sm p-4 rounded-2xl border border-[#e0e3e5] dark:border-[#2d3133] shadow-sm flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">sign_language</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#181c1e] dark:text-white">ISL &rarr; Text / Voice</h3>
                <p className="text-xs text-[#45474c] dark:text-[#c1c6d7] mt-0.5 leading-relaxed">
                  Camera-based gesture tracking synthesizes natural spoken audio in real time.
                </p>
              </div>
            </div>

          </div>

          {/* Quick Settings & Preferences Bar in Lobby */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#e0e3e5]/60 dark:border-[#2d3133] text-xs text-[#45474c] dark:text-[#c1c6d7] z-10">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-[#030813] dark:text-white flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">tune</span>
                Preferences:
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span>Font Size:</span>
                <select
                  value={captionFontSize}
                  onChange={(e: any) => setCaptionFontSize(e.target.value)}
                  className="bg-white dark:bg-[#1a202c] border border-[#c6c6cc] dark:border-[#2d3133] text-[#181c1e] dark:text-white rounded px-2 py-1 text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                </select>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span>Avatar Speed:</span>
                <select
                  value={avatarSpeed}
                  onChange={(e: any) => setAvatarSpeed(parseFloat(e.target.value))}
                  className="bg-white dark:bg-[#1a202c] border border-[#c6c6cc] dark:border-[#2d3133] text-[#181c1e] dark:text-white rounded px-2 py-1 text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value={0.75}>0.75x (Relaxed)</option>
                  <option value={1.0}>1.0x (Normal)</option>
                  <option value={1.25}>1.25x (Fast)</option>
                  <option value={1.5}>1.5x (Pro)</option>
                  <option value={2.0}>2.0x (Hyper Fast)</option>
                  <option value={2.5}>2.5x (Ultra Fast)</option>
                  <option value={3.0}>3.0x (Extreme 3x)</option>
                </select>
              </label>
            </div>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Zero Latency Parallel Pipeline
            </span>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: ACTIVE COMMUNICATION ARENA                                      */}
      {/* ========================================================================= */}
      {inSession && !showSummaryModal && (
        <div className="flex-1 flex flex-col gap-3 py-3 overflow-hidden">
          
          {/* Top Bar: Mode Tabs + Live Controls + Inline Preferences */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#e0e3e5] p-1.5 rounded-xl shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleSwitchMode('SPEECH_TEXT_TO_ISL')}
                className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMode === 'SPEECH_TEXT_TO_ISL'
                    ? 'bg-white text-[#030813] shadow-sm font-black'
                    : 'text-[#45474c] hover:text-[#030813]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">mic</span>
                <span>Speech / Text &harr; ISL</span>
              </button>

              <button
                onClick={() => handleSwitchMode('ISL_TO_TEXT')}
                className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMode === 'ISL_TO_TEXT'
                    ? 'bg-white text-[#030813] shadow-sm font-black'
                    : 'text-[#45474c] hover:text-[#030813]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">sign_language</span>
                <span>ISL &rarr; Text</span>
              </button>
            </div>

            {/* Inline Preferences (Accessible directly during communication) */}
            <div className="flex items-center gap-3 text-xs font-semibold text-[#45474c]">
              <label className="flex items-center gap-1">
                <span>Font:</span>
                <select
                  value={captionFontSize}
                  onChange={(e: any) => setCaptionFontSize(e.target.value)}
                  className="bg-white border border-[#c6c6cc] rounded px-1.5 py-0.5 text-xs font-bold text-[#030813] outline-none"
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
                  className="bg-white border border-[#c6c6cc] rounded px-1.5 py-0.5 text-xs font-bold text-[#030813] outline-none"
                >
                  <option value={0.75}>0.75x</option>
                  <option value={1.0}>1.0x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2.0}>2.0x</option>
                  <option value={2.5}>2.5x</option>
                  <option value={3.0}>3.0x</option>
                </select>
              </label>

              {/* Status Badges (Always ON throughout communication) */}
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#c6c6cc]">
                <span className={`flex items-center gap-1 ${cameraActive ? 'text-green-700' : 'text-gray-500'}`}>
                  <span className="material-symbols-outlined text-[16px]">videocam</span>
                  <span>{cameraActive ? 'Camera Live' : 'Camera Off'}</span>
                </span>
                <span className={`flex items-center gap-1 ${micActive ? 'text-green-700' : 'text-gray-500'}`}>
                  <span className="material-symbols-outlined text-[16px]">mic</span>
                  <span>{micActive ? 'Audio Live' : 'Audio Off'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Stretched Arena Grid: Left (Avatar or Full Camera) | Right (Captions, Text Chat, or Signed Chat Feed) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
            
            {/* LEFT PANE: Full Recognition Camera in ISL_TO_TEXT mode, Avatar in other modes */}
            <div className="lg:col-span-6 bg-[#1a202c] text-white rounded-2xl p-4 shadow-md flex flex-col justify-between relative overflow-hidden min-h-0 border border-[#e0e3e5] dark:border-[#2d3133]">
              {activeMode === 'ISL_TO_TEXT' ? (
                <>
                  {/* Full Camera Viewport Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 shrink-0 z-10">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#fe9832] text-[20px]">videocam</span>
                      <h3 className="text-sm font-bold text-white">Full Sign Recognition Camera</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
                        isModelOnline
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-[#fe9832]/20 text-[#fe9832] border border-[#fe9832]/30'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isModelOnline ? 'bg-emerald-400 animate-ping' : 'bg-[#fe9832]'}`} />
                        <span>{isModelOnline ? '169-Class BiLSTM Neural Live' : 'ISL Vision Ready'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Full Camera Viewport with Hand Skeleton Tracking Canvas */}
                  <div className="flex-1 relative rounded-xl overflow-hidden bg-black flex items-center justify-center min-h-0">
                    <video
                      ref={(el) => {
                        gestureVideoRef.current = el;
                        if (el && mediaStreamRef.current && el.srcObject !== mediaStreamRef.current) {
                          el.srcObject = mediaStreamRef.current;
                          el.play().catch(() => {});
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                    <canvas
                      data-gesture-canvas="true"
                      className="absolute inset-0 w-full h-full pointer-events-none transform -scale-x-100"
                      width={640}
                      height={480}
                    />

                    {/* Top Left Live Tracking HUD */}
                    <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white flex items-center gap-1.5 z-10 font-bold border border-white/10 shadow-sm">
                      <span className={`w-2 h-2 rounded-full ${isISLRecognizing ? 'bg-emerald-400 animate-pulse' : 'bg-[#fe9832]'}`} />
                      <span>{isISLRecognizing ? 'Tracking Hand Joints (21 Keypoints / Hand)' : 'Connecting Camera...'}</span>
                    </div>

                    {/* Bottom Floating Detected Sign Gauge */}
                    {recognizedSign && (
                      <div className="absolute bottom-3 left-3 right-3 bg-black/85 backdrop-blur-md p-3 rounded-xl border border-white/15 text-white flex items-center justify-between z-10 animate-scaleUp">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#fe9832] text-[#683700] flex items-center justify-center font-black text-sm">
                            ISL
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-white uppercase tracking-wide">
                                Sign: {recognizedSign}
                              </span>
                              <span className="text-[11px] font-mono text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-500/30">
                                {Math.round(signConfidence * 100)}% Match
                              </span>
                            </div>
                            <p className="text-xs text-gray-300 font-medium truncate max-w-xs">
                              "{recognizedSignPhrase || recognizedSign}"
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => speak(recognizedSignPhrase || recognizedSign)}
                          disabled={speaking}
                          className="px-2.5 py-1 bg-[#fe9832] hover:bg-[#e8872b] text-[#683700] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[14px]">volume_up</span>
                          <span>Speak</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bottom Camera Toolbar */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-2 shrink-0 z-10">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="material-symbols-outlined text-[16px] text-[#fe9832]">psychology</span>
                      <span>BiLSTM Neural Network (port 8000)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (gestureVideoRef.current) {
                            startISLRecognition(gestureVideoRef.current);
                          }
                        }}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">refresh</span>
                        <span>Restart Camera</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* 3D ISL Avatar Visualizer for Speech to ISL & Text to ISL modes */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 shrink-0 z-10">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#fe9832] text-[20px]">accessibility</span>
                      <h3 className="text-sm font-bold text-white">3D ISL Avatar (Letter-by-Letter)</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-full border border-white/10 text-[10px]">
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
                      <span className="text-[10px] bg-[#fe9832]/20 text-[#fe9832] px-2 py-0.5 rounded font-mono font-bold">
                        {avatarSpeed}x Speed
                      </span>
                    </div>
                  </div>

                  {/* 3D Avatar Canvas Area */}
                  <div className="flex-1 w-full h-full min-h-[320px] flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#050b16] via-[#091325] to-[#040914] rounded-2xl border border-white/10">
                    <ISLAvatarCanvas
                      ref={avatarCanvasRef}
                      modelPath={modelPath}
                      speed={avatarSpeed}
                      pauseTimeMs={Math.round(400 / avatarSpeed)}
                      onProgressChar={(char) => setActiveAvatarChar(char)}
                      onProgressWord={(wordIdx) => setActiveStepIndex(wordIdx)}
                      onFinish={() => {
                        setActiveSigningMessageId(null);
                        setActiveStepIndex(-1);
                        setActiveAvatarChar(null);
                      }}
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

                  {/* Repositionable Draggable Presenter Camera Window */}
                  <DraggableCameraWindow
                    videoRef={videoRef}
                    cameraActive={cameraActive}
                  />
                </>
              )}
            </div>

            {/* RIGHT: Workspace Panel (Spans 6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-3 min-h-0">
              
              {/* ========================================================= */}
              {/* MODE 1: SPEECH <-> ISL (With Live Captions Stream)         */}
              {/* ========================================================= */}
              {/* ========================================================= */}
              {/* UNIFIED MODE: SPEECH / TEXT ↔ ISL                         */}
              {/* ========================================================= */}
              {activeMode === 'SPEECH_TEXT_TO_ISL' && (
                <>
                  {/* Stretched Speech / Text Conversation History with Live Green Word Sync */}
                  <div className="relative flex-1 bg-white dark:bg-[#1a202c] rounded-2xl p-4 border border-[#e0e3e5] dark:border-[#2d3133] shadow-sm flex flex-col justify-between min-h-0">
                    {/* Header with Language Selector, Mic Status, & Auto-Read */}
                    <div className="flex flex-wrap items-center justify-between border-b border-[#e0e3e5] dark:border-[#2d3133] pb-2 shrink-0 gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#012700] dark:text-[#8dfc75] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                        Speech / Text &harr; ISL Conversation Feed
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {/* Spoken Language Selector */}
                        <select
                          value={speechLang}
                          onChange={(e) => {
                            setSpeechLang(e.target.value);
                            if (isListening || shouldListenRef.current) {
                              setTimeout(() => startContinuousListening(), 50);
                            }
                          }}
                          className="bg-[#f1f4f6] dark:bg-[#0d121d] border border-[#e0e3e5] dark:border-[#2d3133] text-[11px] font-bold text-[#181c1e] dark:text-white rounded-lg px-2 py-0.5 outline-none cursor-pointer"
                        >
                          <option value="en-IN">🇮🇳 English (India)</option>
                          <option value="en-US">🇺🇸 English (US)</option>
                          <option value="hi-IN">🇮🇳 Hindi (हिन्दी)</option>
                        </select>

                        {/* Auto-Read Out Toggle */}
                        <label className="flex items-center gap-1 cursor-pointer select-none bg-[#f1f4f6] dark:bg-[#0d121d] px-2 py-0.5 rounded-lg border border-[#e0e3e5] dark:border-[#2d3133]">
                          <input
                            type="checkbox"
                            checked={autoReadOutChat}
                            onChange={(e) => setAutoReadOutChat(e.target.checked)}
                            className="w-3 h-3 accent-[#4046A8] rounded cursor-pointer"
                          />
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[#4046A8] dark:text-[#fe9832]">
                            <span className="material-symbols-outlined text-[13px]">
                              {autoReadOutChat ? 'volume_up' : 'volume_off'}
                            </span>
                            Auto-Read
                          </span>
                        </label>

                        {/* Mic Pause / Resume Button */}
                        <button
                          type="button"
                          onClick={toggleListening}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer ${
                            isListening
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-[#fe9832] hover:bg-[#e8872b] text-[#683700]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {isListening ? 'mic_off' : 'mic'}
                          </span>
                          <span>{isListening ? 'Pause Mic' : 'Resume Mic'}</span>
                        </button>

                        <span className="text-[10px] text-[#45474c] dark:text-[#828796] font-semibold hidden sm:inline">
                          {textMessages.filter((m) => m.sender !== 'system').length} Msgs
                        </span>
                      </div>
                    </div>

                    {/* Microphone Support / Permission Error Notice */}
                    {(micError || !isMicSupported) && (
                      <div className="my-1.5 p-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-amber-600 text-[16px]">warning</span>
                          <span className="text-[11px]">{micError || 'Speech recognition is not supported.'}</span>
                        </div>
                        {isMicSupported && (
                          <button
                            type="button"
                            onClick={() => startContinuousListening()}
                            className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold shrink-0 cursor-pointer"
                          >
                            Retry Mic
                          </button>
                        )}
                      </div>
                    )}

                    {/* Live Listening Caption Streaming Banner (active while speaking) */}
                    {liveCaption && (
                      <div className="my-1.5 p-2.5 bg-[#fe9832]/10 border border-[#fe9832]/30 rounded-xl text-xs font-bold text-[#fe9832] flex items-center gap-2 shrink-0 shadow-xs">
                        <span className="material-symbols-outlined text-[18px] animate-pulse text-[#fe9832]">graphic_eq</span>
                        <span className="text-[#181c1e] dark:text-white font-semibold">Speaking:</span>
                        <span className="italic">"{liveCaption}"</span>
                      </div>
                    )}

                    {/* Messages Scroll View (Displays ALL past chats throughout the conversation) */}
                    <div
                      ref={chatScrollContainerRef}
                      onScroll={handleChatScroll}
                      className="relative flex-1 overflow-y-auto my-2 p-3 bg-[#f7fafc] dark:bg-[#0d121d] rounded-xl border border-[#e0e3e5] dark:border-[#2d3133] flex flex-col gap-3"
                    >
                      {textMessages.length === 0 ? (
                        <div className="my-auto text-center p-6 text-[#45474c]/60 dark:text-[#828796] flex flex-col items-center gap-2">
                          <span className="material-symbols-outlined text-3xl text-[#fe9832]">graphic_eq</span>
                          <p className="text-xs font-bold text-[#181c1e] dark:text-white">Start Speaking or Type a Sentence</p>
                          <p className="text-[11px] max-w-xs">Speak into your mic or type text below. The 3D Avatar will sign each letter/word live with GREEN text highlighting!</p>
                        </div>
                      ) : (
                        textMessages.map((msg) => {
                          if (msg.sender === 'system') {
                            return (
                              <div key={msg.id} className="self-center my-1 px-3 py-1 bg-[#e0e3e5]/80 dark:bg-slate-800 rounded-full text-[10px] font-bold text-[#45474c] dark:text-[#828796] flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">swap_horiz</span>
                                <span>{msg.text} &bull; {msg.timestamp}</span>
                              </div>
                            );
                          }

                          const isSigningThisMsg = activeSigningMessageId === msg.id && activeStepIndex >= 0;

                          return (
                            <div
                              key={msg.id}
                              className="self-end max-w-[92%] bg-white dark:bg-[#1a202c] p-3.5 rounded-2xl rounded-tr-sm border border-[#e0e3e5] dark:border-[#2d3133] shadow-sm flex flex-col gap-2"
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
                                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700'
                                          : 'text-[#181c1e] dark:text-white font-medium'
                                      }`}
                                    >
                                      {word}
                                    </span>
                                  );
                                })}
                              </div>

                              {/* Message Footer with Timestamp, Sign on Avatar, and Read Aloud */}
                              <div className="flex items-center justify-between text-[10px] text-[#45474c] dark:text-[#828796] pt-1.5 border-t border-[#e0e3e5]/60 dark:border-[#2d3133]">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[#012700] dark:text-[#8dfc75] uppercase text-[9px] bg-[#dde2f3] dark:bg-slate-800 px-1.5 py-0.2 rounded">
                                    {msg.mode}
                                  </span>
                                  <span>{msg.timestamp}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {isSigningThisMsg ? (
                                    <span className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1 animate-pulse">
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                      Signing {activeStepIndex + 1}/{msg.words.length}
                                    </span>
                                  ) : null}

                                  {/* Dedicated Per-Message Sign on Avatar Button */}
                                  <button
                                    type="button"
                                    onClick={() => translateTextToSign(msg.text, msg.id)}
                                    title="Sign message again on 3D Avatar"
                                    className="px-2 py-0.5 bg-[#fe9832]/10 hover:bg-[#fe9832]/30 text-[#8f4e00] dark:text-[#fe9832] rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border border-[#fe9832]/30"
                                  >
                                    <span className="material-symbols-outlined text-[13px]">play_arrow</span>
                                    <span>Sign on Avatar</span>
                                  </button>

                                  {/* Dedicated Per-Message Speak / Read Aloud Button */}
                                  <button
                                    type="button"
                                    onClick={() => speak(msg.text)}
                                    title="Read message aloud"
                                    className="px-2 py-0.5 bg-[#f1f4f6] dark:bg-slate-800 hover:bg-[#fe9832]/20 dark:hover:bg-[#fe9832]/30 text-[#0C1322] dark:text-white rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border border-[#e0e3e5] dark:border-[#2d3133]"
                                  >
                                    <span className="material-symbols-outlined text-[13px] text-[#4046A8] dark:text-[#fe9832]">volume_up</span>
                                    <span>Read Aloud</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Floating Scroll to Bottom Button */}
                    {isChatScrolledUp && (
                      <button
                        type="button"
                        onClick={scrollToBottom}
                        className="absolute bottom-20 right-8 px-3 py-1.5 bg-[#4046A8] hover:bg-[#353A8F] text-white text-xs font-bold rounded-full shadow-xl flex items-center gap-1.5 transition-all animate-bounce cursor-pointer z-30"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                        <span>Jump to Latest</span>
                      </button>
                    )}

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

                  {/* Text & Speech Input Panel */}
                  <form onSubmit={handleSendTextMessage} className="bg-white dark:bg-[#1a202c] rounded-2xl p-3 border border-[#e0e3e5] dark:border-[#2d3133] shadow-sm shrink-0 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type a sentence to sign & translate (e.g. 'Hello welcome to our accessible office')..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-[#f7fafc] dark:bg-[#0d121d] border border-[#c6c6cc] dark:border-[#2d3133] rounded-xl text-xs sm:text-sm text-[#181c1e] dark:text-white focus:border-[#fe9832] outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => setAutoReadOutChat(!autoReadOutChat)}
                      title={autoReadOutChat ? 'Auto-Read Out is ON' : 'Auto-Read Out is OFF'}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                        autoReadOutChat
                          ? 'bg-[#4046A8]/10 text-[#4046A8] dark:bg-[#fe9832]/20 dark:text-[#fe9832] border-[#4046A8]/30 dark:border-[#fe9832]/40'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {autoReadOutChat ? 'volume_up' : 'volume_off'}
                      </span>
                    </button>

                    <button
                      type="submit"
                      disabled={isProcessing || !inputText.trim()}
                      className="px-5 py-2.5 bg-[#fe9832] hover:bg-[#e8872b] text-[#683700] rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-40"
                    >
                      <span>Sign Text</span>
                      <span className="material-symbols-outlined text-[16px]">send</span>
                    </button>
                  </form>
                </>
              )}

              {/* ========================================================= */}
              {/* MODE 3: ISL -> TEXT (Signed Chat & WhatsApp-Style Composer)*/}
              {/* ========================================================= */}
              {activeMode === 'ISL_TO_TEXT' && (
                <>
                  <div className="flex-1 bg-white dark:bg-[#1a202c] rounded-2xl p-4 border border-[#e0e3e5] dark:border-[#2d3133] shadow-sm flex flex-col justify-between min-h-0 gap-2">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#e0e3e5] dark:border-[#2d3133] pb-2 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#030813] dark:text-white flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px] text-[#fe9832]">chat</span>
                          Signed Conversation Feed
                        </span>
                        <span className="text-[10px] bg-[#fe9832]/10 text-[#8f4e00] dark:text-[#fe9832] px-2 py-0.5 rounded-full font-bold border border-[#fe9832]/20">
                          {signedMessages.length} Sent
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {signedMessages.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSignedMessages([])}
                            className="text-[11px] text-gray-500 hover:text-red-500 font-bold transition flex items-center gap-1 cursor-pointer px-2 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40"
                          >
                            <span className="material-symbols-outlined text-[13px]">delete_sweep</span>
                            <span>Clear Feed</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Sent Signed Messages Scroll View */}
                    <div className="relative flex-1 overflow-y-auto my-1 p-3 bg-[#f7fafc] dark:bg-[#0d121d] rounded-xl border border-[#e0e3e5] dark:border-[#2d3133] flex flex-col gap-2.5">
                      {signedMessages.length === 0 ? (
                        <div className="my-auto text-center p-6 text-[#45474c]/60 dark:text-[#828796] flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-[#fe9832]/10 text-[#fe9832] flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">sign_language</span>
                          </div>
                          <p className="text-sm font-bold text-[#181c1e] dark:text-white">Waiting for Signs</p>
                          <p className="text-xs max-w-xs text-center">
                            Perform signs in front of the camera. Words will continuously accumulate in the editable message composition box below. Review, edit, and click Send!
                          </p>
                        </div>
                      ) : (
                        signedMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className="self-start max-w-[95%] bg-white dark:bg-[#1a202c] p-3 rounded-2xl rounded-tl-sm border border-[#e0e3e5] dark:border-[#2d3133] shadow-xs flex flex-col gap-1.5 animate-fadeIn"
                          >
                            <div className="flex items-center justify-between gap-3 text-[10px] text-[#45474c] dark:text-[#828796] border-b border-[#e0e3e5]/60 dark:border-[#2d3133] pb-1">
                              <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold uppercase text-[9px] border border-emerald-300/40">
                                  ISL Message
                                </span>
                                <span className="font-mono text-gray-400">
                                  {msg.phrase.split(/\s+/).length} words
                                </span>
                              </div>
                              <span>{msg.timestamp}</span>
                            </div>

                            <p className="text-base font-bold text-[#030813] dark:text-white leading-relaxed">
                              "{msg.phrase}"
                            </p>

                            <div className="flex items-center justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => speak(msg.phrase)}
                                disabled={speaking}
                                className="px-2 py-0.5 bg-[#f1f4f6] dark:bg-[#0d121d] hover:bg-[#fe9832]/20 text-[#030813] dark:text-white rounded-md text-[10px] font-bold transition flex items-center gap-1 border border-[#e0e3e5] dark:border-[#2d3133] cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[13px] text-[#fe9832]">volume_up</span>
                                <span>Speak Aloud</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={signedMessagesEndRef} />
                    </div>

                    {/* WhatsApp-Style Message Composition Area (ML Words + Manual Edits + Send Button) */}
                    <div className="shrink-0">
                      <ISLMessageComposer
                        incomingMLWord={recognizedSignPhrase || recognizedSign}
                        incomingConfidence={signConfidence}
                        isModelActive={isISLRecognizing}
                        onSendMessage={handleSendSignedMessage}
                        onSpeakDraft={(draft) => speak(draft)}
                        placeholder="Signs continuously accumulate here. Edit or type before sending..."
                      />
                    </div>
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
          <div className="bg-white rounded-[28px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#e0e3e5] flex flex-col gap-5 animate-scaleUp">
            
            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-[#e0e3e5] pb-4">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">check_circle</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#030813]">Communication Ended</h2>
                <p className="text-xs text-[#45474c]">Session summary complete</p>
              </div>
            </div>

            {/* Detailed Mode Breakdown in Summary */}
            <div className="bg-[#f7fafc] rounded-2xl p-4 border border-[#e0e3e5] flex flex-col gap-2 max-h-48 overflow-y-auto">
              <div className="flex justify-between text-xs border-b border-[#e0e3e5]/60 pb-1.5 font-bold">
                <span className="text-[#45474c]">Conversation:</span>
                <span className="font-bold text-[#030813]">{sessionHistoryLogs.length} events</span>
              </div>

              {sessionHistoryLogs.length === 0 ? (
                <p className="text-[11px] text-[#45474c]/70 italic py-2">No conversation in this session.</p>
              ) : (
                <div className="space-y-1.5 pt-1">
                  {sessionHistoryLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 truncate max-w-[80%]">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          log.mode === 'SPEECH'
                            ? 'bg-amber-100 text-amber-800'
                            : log.mode === 'TEXT'
                            ? 'bg-blue-100 text-blue-800'
                            : log.mode === 'GESTURE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {log.mode}
                        </span>
                        <span className="text-[#181c1e] truncate">{log.text}</span>
                      </div>
                      <span className="text-[10px] text-[#45474c]">{log.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions: Done */}
            <div className="flex pt-2">
              <button
                onClick={handleDoneSummary}
                className="w-full py-3 px-4 bg-[#fe9832] hover:bg-[#e8872b] text-[#683700] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Done (Close Session)</span>
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
