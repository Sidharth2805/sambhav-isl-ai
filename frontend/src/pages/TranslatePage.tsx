import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { ISLAvatarCanvas, type ISLAvatarCanvasRef } from '../components/cultural/ISLAvatarCanvas';
import { useISLRecognition } from '../hooks/useISLRecognition';
import { ISLMessageComposer } from '../components/communication/ISLMessageComposer';
import { useAccessibility } from '../hooks/useAccessibility';
import { ScanModal } from '../components/translate/ScanModal';
import { getSentencePattern } from '../services/avatar/Services/sentencePatterns';

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
  const { t } = useAccessibility();
  const { speak, speaking } = useTextToSpeech();

  // Communication Session Active State (Lobby vs Active)
  const [inSession, setInSession] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);

  // Active Mode (Unified Speech/Text <-> ISL and ISL <-> Text)
  const [activeMode, setActiveMode] = useState<'SPEECH_TEXT_TO_ISL' | 'ISL_TO_TEXT'>('SPEECH_TEXT_TO_ISL');

  // Persistent Media Stream State (Camera active only for ISL recognition)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const gestureVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Auto-open Scan Modal if requested via URL query params (?scan=true, ?notes=true, ?rx=true)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('scan') === 'true' || params.get('notes') === 'true' || params.get('rx') === 'true' || params.get('prescription') === 'true') {
        setShowScanModal(true);
      }
    }
  }, []);

  // Real-Time ISL Neural Model Recognition Hook
  const {
    isRecognizing: isISLRecognizing,
    currentGesture: recognizedSign,
    confidence: signConfidence,
    translatedText: recognizedSignPhrase,
    committedSign,
    isModelOnline,
    activeEndpoint,
    pingLatencyMs,
    handsDetectedCount,
    gestureState,
    isCapturingManual,
    captureCountdown,
    start5sCapture,
    startRecognition: startISLRecognition,
    stopRecognition: stopISLRecognition,
  } = useISLRecognition();

  const [showGuideModal, setShowGuideModal] = useState(false);

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

  // Sambhav Model 2 Video Recording & Gloss-to-English State
  const [glossWords, setGlossWords] = useState<string[]>([]);
  const [englishSentence, setEnglishSentence] = useState<string>('');
  const [isVideoRecording, setIsVideoRecording] = useState<boolean>(false);
  const [isVideoProcessing, setIsVideoProcessing] = useState<boolean>(false);
  const [recordingCountdown, setRecordingCountdown] = useState<number | null>(null);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  // ISL Avatar Sequence State
  const [_currentSequence, setCurrentSequence] = useState<SignSequenceDto | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Settings & Speed Control (0.75x, 1.0x, 1.25x, 1.5x, 2.0x, 2.5x, 3.0x)
  const [captionFontSize, setCaptionFontSize] = useState<'sm' | 'md' | 'lg'>('lg');
  const [avatarSpeed, setAvatarSpeed] = useState<number>(1.0);
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

  // Auto-scroll to bottom to always show the most recent message
  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [textMessages, liveCaption, activeSigningMessageId]);

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

  // Text Selection tracking for Read Selected Text
  const [selectedText, setSelectedText] = useState<string>('');

  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection()?.toString().trim();
      setSelectedText(sel || '');
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const handleSpeakSelectedText = useCallback(() => {
    if (selectedText) {
      speak(selectedText);
    }
  }, [selectedText, speak]);

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
        confidence: signConfidence > 0 ? signConfidence : 1.0,
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

  // 6-Second Video Sign Capture using Sambhav Model 2 BiLSTM (POST /predict-video)
  const captureSignVideo = useCallback(async () => {
    if (isVideoRecording || isVideoProcessing) return;
    const stream = mediaStreamRef.current || (gestureVideoRef.current?.srcObject as MediaStream);
    if (!stream) {
      alert('Camera stream not available. Please ensure camera is active.');
      return;
    }

    let mimeType = '';
    if (typeof MediaRecorder !== 'undefined') {
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) mimeType = 'video/webm;codecs=vp9';
      else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) mimeType = 'video/webm;codecs=vp8';
      else if (MediaRecorder.isTypeSupported('video/webm')) mimeType = 'video/webm';
      else if (MediaRecorder.isTypeSupported('video/mp4')) mimeType = 'video/mp4';
    }

    try {
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      videoRecorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        setIsVideoRecording(false);
        setRecordingCountdown(null);
        setIsVideoProcessing(true);

        try {
          if (chunks.length === 0) throw new Error('No video data was recorded.');
          const videoBlob = new Blob(chunks, { type: mimeType || 'video/webm' });
          const formData = new FormData();
          formData.append('file', videoBlob, 'sign.webm');

          const endpointsToTry = [
            activeEndpoint || 'http://127.0.0.1:8000',
            'http://localhost:8000',
            'https://sambhav-ml.onrender.com'
          ];

          let success = false;
          let resultData: any = null;

          for (const ep of endpointsToTry) {
            try {
              const res = await fetch(`${ep}/predict-video`, {
                method: 'POST',
                body: formData,
              });
              if (res.ok) {
                resultData = await res.json();
                success = true;
                break;
              }
            } catch {
              // Try next endpoint
            }
          }

          if (!success || !resultData) {
            throw new Error('ML inference service is not reachable on port 8000.');
          }

          if (resultData.word === 'No hand detected' || resultData.success === false) {
            alert('No hand detected during recording. Please make sure your hand is clearly visible in the camera frame.');
            return;
          }

          const predictedWord = resultData.word || resultData.label;
          const predictedConfidence = Number(resultData.confidence) || 0.95;

          if (predictedWord) {
            setGlossWords((prev) => [...prev, predictedWord]);
            setEnglishSentence('');

            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setSignedMessages((prev) => [
              ...prev,
              {
                id: `video-sign-${Date.now()}`,
                sign: predictedWord,
                phrase: predictedWord,
                confidence: predictedConfidence,
                timestamp,
              },
            ]);

            setSessionHistoryLogs((prev) => [
              ...prev,
              { mode: 'GESTURE', text: predictedWord, time: timestamp },
            ]);

            if (autoSpeakGestures) {
              speak(predictedWord);
            }
          }
        } catch (err: any) {
          console.error('[Sambhav Model 2] Video prediction error:', err);
          alert(`Video prediction note: ${err.message || 'Check ML service terminal.'}`);
        } finally {
          setIsVideoProcessing(false);
        }
      };

      setIsVideoRecording(true);
      setRecordingCountdown(6);
      recorder.start(250);

      let secs = 6;
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = setInterval(() => {
        secs -= 1;
        if (secs <= 0) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        } else {
          setRecordingCountdown(secs);
        }
      }, 1000);

      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = setTimeout(() => {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      }, 6000);
    } catch (err) {
      console.error('MediaRecorder start error:', err);
      setIsVideoRecording(false);
      setRecordingCountdown(null);
    }
  }, [activeEndpoint, autoSpeakGestures, isVideoProcessing, isVideoRecording, speak]);

  // Convert Accumulated ISL Gloss to English Grammar (POST /convert)
  const convertGlossToEnglish = useCallback(async () => {
    if (glossWords.length === 0) {
      alert('Please perform or record at least one ISL sign first.');
      return;
    }

    const glossText = glossWords.join(' ').trim();
    const endpointsToTry = [
      activeEndpoint || 'http://127.0.0.1:8000',
      'http://localhost:8000',
      'https://sambhav-ml.onrender.com'
    ];

    for (const ep of endpointsToTry) {
      try {
        const res = await fetch(`${ep}/convert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gloss: glossText }),
        });
        if (res.ok) {
          const data = await res.json();
          const sentence = data.english || data.sentence || glossText;
          setEnglishSentence(sentence);

          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setSignedMessages((prev) => [
            ...prev,
            {
              id: `english-conv-${Date.now()}`,
              sign: 'ENGLISH',
              phrase: sentence,
              confidence: 1.0,
              timestamp,
            },
          ]);

          if (autoSpeakGestures) {
            speak(sentence);
          }
          return;
        }
      } catch {
        // Try next endpoint
      }
    }

    // Client-side fallback rule engine
    const fallbackSentence = glossText.charAt(0).toUpperCase() + glossText.slice(1) + '.';
    setEnglishSentence(fallbackSentence);
    if (autoSpeakGestures) {
      speak(fallbackSentence);
    }
  }, [activeEndpoint, autoSpeakGestures, glossWords, speak]);

  const [copiedSentence, setCopiedSentence] = useState(false);

  const removeGlossWordAtIndex = useCallback((index: number) => {
    setGlossWords((prev) => prev.filter((_, i) => i !== index));
    setEnglishSentence('');
  }, []);

  const removeLastGlossWord = useCallback(() => {
    setGlossWords((prev) => prev.slice(0, -1));
    setEnglishSentence('');
  }, []);

  const clearGloss = useCallback(() => {
    setGlossWords([]);
    setEnglishSentence('');
  }, []);

  const handleCopyEnglishSentence = useCallback(() => {
    if (!englishSentence) return;
    navigator.clipboard.writeText(englishSentence);
    setCopiedSentence(true);
    setTimeout(() => setCopiedSentence(false), 2000);
  }, [englishSentence]);

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
      const stepDuration = Math.round(450 / avatarSpeed);

      const steps: SignStepDto[] = words.map((word, index) => {
        const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        return {
          sequenceIndex: index,
          conceptId: cleanWord,
          displayToken: cleanWord,
          durationMs: stepDuration,
          confidence: 1.0,
          asset: null,
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
        overallConfidence: 1.0,
        status: 'READY',
        steps,
      };

      setCurrentSequence(sequence);
    } catch (err) {
      console.error('Sign translation error:', err);
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
          setMicError('Microphone access was denied. Please allow microphone permission in browser settings.');
          shouldListenRef.current = false;
          setIsListening(false);
          return;
        }

        if (err === 'aborted' || err === 'no-speech') {
          // Normal transient pause; onend handler will manage single clean restart
          return;
        }

        // For network errors, schedule single clean restart
        if (shouldListenRef.current) {
          if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            if (shouldListenRef.current && !recognitionRef.current) {
              startContinuousListening();
            }
          }, 500);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;

        // Seamlessly restart once if user wants continuous listening
        if (shouldListenRef.current) {
          if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            if (shouldListenRef.current && !recognitionRef.current) {
              startContinuousListening();
            }
          }, 300);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('[SAMBHAV Speech] Start error:', err);
      recognitionRef.current = null;
      if (shouldListenRef.current) {
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          if (shouldListenRef.current && !recognitionRef.current) {
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

  // Start Communication Flow (Enables Camera for ISL mode, Mic for Speech mode)
  const handleStartCommunication = async () => {
    setInSession(true);
    setShowSummaryModal(false);
    setSessionHistoryLogs([]);
    setTextMessages([]);
    setLiveCaption('');
    setFinalTranscript('');
    setActiveStepIndex(-1);
    setMicError(null);

    if (activeMode === 'ISL_TO_TEXT') {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640, max: 640 },
              height: { ideal: 480, max: 480 },
              frameRate: { ideal: 30, max: 30 },
              facingMode: 'user'
            },
            audio: false,
          });

          if (stream) {
            mediaStreamRef.current = stream;
            setCameraActive(true);

            if (gestureVideoRef.current) {
              gestureVideoRef.current.srcObject = stream;
            }
          }
        }
      } catch (err) {
        console.warn('Camera hardware track access note:', err);
      }

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
    } else {
      // SPEECH_TEXT_TO_ISL mode: no camera needed
      setCameraActive(false);
      startContinuousListening();
    }
  };

  // Auto-trigger ISL Recognition and attach video stream when session is active in ISL_TO_TEXT mode
  useEffect(() => {
    if (inSession && activeMode === 'ISL_TO_TEXT') {
      const timer = setTimeout(async () => {
        if (!mediaStreamRef.current && navigator.mediaDevices?.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: { ideal: 640, max: 640 },
                height: { ideal: 480, max: 480 },
                frameRate: { ideal: 30, max: 30 },
                facingMode: 'user'
              },
              audio: false,
            });
            mediaStreamRef.current = stream;
            setCameraActive(true);
          } catch (e) {
            console.warn('Camera access error:', e);
          }
        }

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

  // Mode Switch Handler (Logs mid-conversation mode switch and manages camera/mic)
  const handleSwitchMode = async (newMode: 'SPEECH_TEXT_TO_ISL' | 'ISL_TO_TEXT') => {
    if (newMode === activeMode) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const modeLabel = newMode === 'SPEECH_TEXT_TO_ISL' ? 'Text/Speech → ISL' : 'ISL → Speech/Text';

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
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      setCameraActive(false);
      startContinuousListening();
    } else if (newMode === 'ISL_TO_TEXT') {
      stopContinuousListening();
      try {
        if (!mediaStreamRef.current && navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640, max: 640 },
              height: { ideal: 480, max: 480 },
              frameRate: { ideal: 30, max: 30 },
              facingMode: 'user'
            },
            audio: false,
          });
          mediaStreamRef.current = stream;
          setCameraActive(true);
        }
      } catch (err) {
        console.warn('Camera access on mode switch:', err);
      }

      setTimeout(() => {
        if (gestureVideoRef.current || videoRef.current) {
          const vid = gestureVideoRef.current || videoRef.current;
          if (vid && mediaStreamRef.current && vid.srcObject !== mediaStreamRef.current) {
            vid.srcObject = mediaStreamRef.current;
            vid.play().catch(() => {});
          }
          if (vid) startISLRecognition(vid);
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

  // Handle text extracted from Notes / Prescription OCR Scanner
  const handleScannedTextToTranslate = (scannedText: string) => {
    if (!scannedText || !scannedText.trim()) return;
    const trimmed = scannedText.trim();
    setShowScanModal(false);

    if (!inSession) {
      setInSession(true);
    }

    setActiveMode('SPEECH_TEXT_TO_ISL');
    setInputText(trimmed);

    const msgId = `msg-scan-${Date.now()}`;
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
    setSessionHistoryLogs((prev) => [...prev, { mode: 'TEXT', text: `[Scan] ${trimmed}`, time: timestamp }]);

    // Trigger instant avatar sign translation
    translateTextToSign(trimmed, msgId);

    if (autoReadOutChat) {
      speak(trimmed);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] -mt-20 md:-mt-6 -mx-4 sm:-mx-8 px-4 sm:px-8 pt-20 md:pt-6 pb-12 font-['Inter',sans-serif]">
      
      {/* Dynamic Photographic Background - Visible ONLY on Lobby Screen */}
      {!inSession && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
          <img
            src="/images/communicate-bg.jpg"
            alt="Translate Background"
            className="w-full h-full object-cover object-center scale-100 opacity-95 dark:opacity-85"
          />
          {/* Minimal Non-Blur Ambient Tint */}
          <div className="absolute inset-0 bg-transparent dark:bg-black/20 pointer-events-none" />
        </div>
      )}

      <div className="relative z-10 flex flex-col w-full h-[calc(100vh-80px)] md:h-[calc(100vh-60px)] font-['Inter',sans-serif] overflow-hidden">
        
        {/* Top Header Bar */}
        <header className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border shrink-0 mb-3 transition-all ${
          inSession
            ? 'bg-white dark:bg-[#181c1e] border-gray-200 dark:border-[#2d3133] shadow-sm'
            : 'bg-white/20 dark:bg-black/30 backdrop-blur-md border-white/40 dark:border-white/10 shadow-lg shadow-black/5'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100/90 text-emerald-600 dark:bg-[#fe9832]/10 dark:text-[#fe9832] flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[24px]">translate</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white tracking-tight drop-shadow-2xs">{t('translate.title', 'Real-Time Translation')}</h1>
              <p className="text-xs text-gray-700 dark:text-[#c1c6d7] font-medium">
                {t('translate.subtitle', 'Interactive ISL Avatar visualizer, Speech-to-Sign, and Text translation')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Scan Notes / Rx Button */}
            <button
              type="button"
              onClick={() => setShowScanModal(true)}
              className="px-3 py-1.5 bg-white/80 dark:bg-[#1a202c]/80 hover:bg-emerald-50 text-slate-800 dark:text-emerald-300 border border-slate-300 dark:border-emerald-800/60 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
              title="Scan handwritten notes, letters, or doctor prescriptions"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">document_scanner</span>
              <span className="hidden sm:inline">{t('translate.scanNotesPrescription', 'Scan Notes & Rx')}</span>
              <span className="sm:hidden">{t('translate.scanDoc', 'Scan')}</span>
            </button>

            {inSession && (
              <>
                <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-100/90 dark:bg-green-900/60 text-emerald-800 dark:text-green-300 text-xs font-black rounded-full border border-emerald-300 dark:border-green-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {t('translate.liveActive', 'Live Active')}
                </span>
                <button
                  onClick={handleStopCommunication}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  aria-label={t('translate.stopComm', 'Stop Communication')}
                >
                  <span className="material-symbols-outlined text-[18px]">stop_circle</span>
                  <span>{t('translate.stopComm', 'Stop Communication')}</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* ========================================================================= */}
        {/* SCREEN 1: LOBBY (START COMMUNICATION) WITH AMBIENT BACKGROUND             */}
        {/* ========================================================================= */}
        {!inSession && !showSummaryModal && (
          <div className="flex-1 flex flex-col justify-between py-6 px-5 sm:px-8 relative overflow-hidden bg-white/20 dark:bg-black/30 backdrop-blur-md rounded-3xl border border-white/40 dark:border-white/10 shadow-xl shadow-black/10">
            
            {/* Central Highlight CTA */}
            <div className="flex flex-col items-center justify-center text-center my-auto px-4 z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 dark:bg-black/50 border border-white/60 dark:border-white/20 text-xs font-bold text-emerald-800 dark:text-[#ffb77a] shadow-sm mb-4 backdrop-blur-sm">
                <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-[#fe9832]">bolt</span>
                <span>{t('translate.lobbyBadge', 'Hardware-Accelerated Real-Time Sign Synthesis')}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 dark:text-white tracking-tight leading-tight max-w-2xl drop-shadow-xs">
                {t('translate.lobbyHeadingPrefix', 'Break Barriers in')}{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 bg-clip-text text-transparent dark:text-[#fe9832]">
                  {t('translate.lobbyHeadingHighlight', 'Real-Time')}
                </span>
              </h2>
              <p className="text-sm sm:text-base text-gray-700 dark:text-[#c1c6d7] mt-3 max-w-xl leading-relaxed font-medium">
                {t('translate.lobbyDesc', 'Enable your camera and microphone for instant two-way translation between spoken voice, text, and Indian Sign Language.')}
              </p>

              {/* Main Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3.5">
                <button
                  onClick={handleStartCommunication}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 text-white dark:bg-none dark:bg-[#fe9832] dark:hover:bg-[#e8872b] dark:text-[#542900] hover:scale-105 active:scale-95 font-black text-base sm:text-lg rounded-2xl transition-all shadow-lg shadow-emerald-500/25 dark:shadow-[#fe9832]/30 flex items-center gap-3 group cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[28px] group-hover:rotate-12 transition-transform">
                    videocam
                  </span>
                  <span>{t('translate.startComm', 'Start Communication')}</span>
                  <span className="material-symbols-outlined text-[22px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowScanModal(true)}
                  className="px-7 py-4 bg-white/90 dark:bg-[#1a202c]/90 hover:bg-white dark:hover:bg-[#242b38] text-slate-900 dark:text-white border-2 border-slate-300/80 dark:border-[#2d3133] hover:border-emerald-500 dark:hover:border-[#fe9832] font-black text-base sm:text-lg rounded-2xl transition-all shadow-lg shadow-slate-900/5 hover:scale-105 active:scale-95 flex items-center gap-3 cursor-pointer backdrop-blur-md"
                >
                  <span className="material-symbols-outlined text-[26px] text-emerald-600 dark:text-[#fe9832]">
                    document_scanner
                  </span>
                  <span>{t('translate.scanNotesPrescription', 'Scan Notes & Rx')}</span>
                </button>
              </div>
            </div>

            {/* Bottom Overview of the 3 Modes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-w-5xl mx-auto w-full z-10 mb-4 sm:mb-6 mt-4">
              
              {/* Mode 1 */}
              <div className="bg-white/30 dark:bg-white/5 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/40 hover:border-sky-400 dark:border-white/10 shadow-sm flex items-start gap-3 transition-all">
                <div className="w-10 h-10 rounded-xl bg-sky-100/90 text-sky-700 dark:bg-[#fe9832]/15 dark:text-[#ffb77a] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">mic</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-950 dark:text-white">{t('translate.mode1Title', 'Text/Speech → ISL')}</h3>
                  <p className="text-xs text-gray-700 dark:text-[#c1c6d7] mt-0.5 leading-relaxed font-medium">
                    {t('translate.mode1Desc', 'Microphone capture or typed text with live captions and 3D avatar animation.')}
                  </p>
                </div>
              </div>

              {/* Mode 2: Click to directly start ISL Sign Recognition */}
              <div
                onClick={() => {
                  setActiveMode('ISL_TO_TEXT');
                  handleStartCommunication();
                }}
                className="bg-white/30 dark:bg-white/5 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/40 hover:border-emerald-400 dark:border-white/10 shadow-sm flex items-start gap-3 cursor-pointer hover:scale-[1.02] transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100/90 text-emerald-700 dark:bg-indigo-500/15 dark:text-indigo-300 flex items-center justify-center shrink-0 group-hover:bg-emerald-200 dark:group-hover:bg-[#fe9832]/20 dark:group-hover:text-[#fe9832] transition-colors">
                  <span className="material-symbols-outlined text-[22px]">sign_language</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-950 dark:text-white flex items-center gap-1.5">
                    <span>{t('translate.mode2Title', 'ISL → Speech/Text')}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 px-1.5 py-0.5 rounded font-black">{t('translate.startBadge', 'START')}</span>
                  </h3>
                  <p className="text-xs text-gray-700 dark:text-[#c1c6d7] mt-0.5 leading-relaxed font-medium">
                    {t('translate.mode2Desc', 'Camera-based gesture tracking synthesizes natural spoken audio in real time.')}
                  </p>
                </div>
              </div>

              {/* Mode 3: Notes & Prescription Scanner */}
              <div
                onClick={() => setShowScanModal(true)}
                className="bg-white/30 dark:bg-white/5 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/40 hover:border-teal-400 dark:border-white/10 shadow-sm flex items-start gap-3 cursor-pointer hover:scale-[1.02] transition-all group sm:col-span-2 lg:col-span-1"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-100/90 text-teal-800 dark:bg-[#fe9832]/15 dark:text-[#ffb77a] flex items-center justify-center shrink-0 group-hover:bg-teal-200 dark:group-hover:bg-[#fe9832]/20 dark:group-hover:text-[#fe9832] transition-colors">
                  <span className="material-symbols-outlined text-[22px]">document_scanner</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-950 dark:text-white flex items-center gap-1.5">
                    <span>{t('translate.scanNotesPrescription', 'Notes & Prescription')}</span>
                    <span className="text-[10px] bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-400 px-1.5 py-0.5 rounded font-black">SCAN</span>
                  </h3>
                  <p className="text-xs text-gray-700 dark:text-[#c1c6d7] mt-0.5 leading-relaxed font-medium">
                    Scan handwritten notes, letters, applications, and doctor prescriptions (Rx) into ISL.
                  </p>
                </div>
              </div>

            </div>

            {/* Quick Settings & Preferences Bar in Lobby */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/60 dark:border-white/15 text-xs text-gray-800 dark:text-[#c1c6d7] z-10">
              <div className="flex items-center gap-4">
                <span className="font-bold text-gray-950 dark:text-white flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  {t('translate.preferences', 'Preferences:')}
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <span>{t('translate.fontSize', 'Font Size:')}</span>
                  <select
                    value={captionFontSize}
                    onChange={(e: any) => setCaptionFontSize(e.target.value)}
                    className="bg-white/80 dark:bg-[#1a202c] border border-white/80 dark:border-[#2d3133] text-gray-900 dark:text-white rounded px-2 py-1 text-xs font-semibold outline-none cursor-pointer"
                  >
                    <option value="sm">{t('translate.size.small', 'Small')}</option>
                    <option value="md">{t('translate.size.medium', 'Medium')}</option>
                    <option value="lg">{t('translate.size.large', 'Large')}</option>
                  </select>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                  <span>{t('translate.avatarSpeed', 'Avatar Speed:')}</span>
                  <select
                    value={avatarSpeed}
                    onChange={(e: any) => setAvatarSpeed(parseFloat(e.target.value))}
                    className="bg-white/80 dark:bg-[#1a202c] border border-white/80 dark:border-[#2d3133] text-gray-900 dark:text-white rounded px-2 py-1 text-xs font-semibold outline-none cursor-pointer"
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
              </div>
            </div>

          </div>
        )}


      {/* ========================================================================= */}
      {/* SCREEN 2: ACTIVE COMMUNICATION ARENA                                      */}
      {/* ========================================================================= */}
      {inSession && !showSummaryModal && (
        <div className="flex-1 flex flex-col gap-3 py-1 overflow-hidden">
          
          {/* Top Bar: Mode Tabs + Live Controls + Inline Preferences */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-[#181c1e] border border-gray-200 dark:border-[#2d3133] p-1.5 rounded-2xl shrink-0 shadow-sm">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleSwitchMode('SPEECH_TEXT_TO_ISL')}
                className={`py-1.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMode === 'SPEECH_TEXT_TO_ISL'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm font-black dark:bg-none dark:bg-white dark:text-[#030813]'
                    : 'text-slate-700 dark:text-[#828796] hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">mic</span>
                <span>{t('translate.mode1Title', 'Text/Speech → ISL')}</span>
              </button>

              <button
                onClick={() => handleSwitchMode('ISL_TO_TEXT')}
                className={`py-1.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMode === 'ISL_TO_TEXT'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm font-black dark:bg-none dark:bg-white dark:text-[#030813]'
                    : 'text-slate-700 dark:text-[#828796] hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">sign_language</span>
                <span>{t('translate.mode2Title', 'ISL → Speech/Text')}</span>
              </button>
            </div>

            {/* Inline Preferences (Accessible directly during communication) */}
            <div className="flex items-center gap-3 text-xs font-semibold text-[#45474c]">
              <label className="flex items-center gap-1">
                <span className="text-gray-900 dark:text-gray-200 font-bold">{t('translate.fontLabel', 'Font:')}</span>
                <select
                  value={captionFontSize}
                  onChange={(e: any) => setCaptionFontSize(e.target.value)}
                  className="bg-gray-100 dark:bg-[#111315] border border-gray-300 dark:border-[#2d3133] rounded px-1.5 py-0.5 text-xs font-bold text-gray-950 dark:text-white outline-none cursor-pointer"
                >
                  <option value="sm">{t('translate.size.small', 'Small')}</option>
                  <option value="md">{t('translate.size.medium', 'Medium')}</option>
                  <option value="lg">{t('translate.size.large', 'Large')}</option>
                </select>
              </label>

              <label className="flex items-center gap-1">
                <span className="text-gray-900 dark:text-gray-200 font-bold">{t('translate.speedLabel', 'Speed:')}</span>
                <select
                  value={avatarSpeed}
                  onChange={(e: any) => setAvatarSpeed(parseFloat(e.target.value))}
                  className="bg-gray-100 dark:bg-[#111315] border border-gray-300 dark:border-[#2d3133] rounded px-1.5 py-0.5 text-xs font-bold text-gray-950 dark:text-white outline-none cursor-pointer"
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

              {/* Status Badges (Mode-specific) */}
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                {activeMode === 'ISL_TO_TEXT' ? (
                  <span className={`flex items-center gap-1 ${cameraActive ? 'text-emerald-700 dark:text-[#8dfc75] font-black' : 'text-gray-600 dark:text-[#828796]'}`}>
                    <span className="material-symbols-outlined text-[16px]">videocam</span>
                    <span>{cameraActive ? t('translate.cameraLive', 'Camera Live') : t('translate.cameraOff', 'Camera Off')}</span>
                  </span>
                ) : (
                  <span className={`flex items-center gap-1 ${isListening ? 'text-emerald-700 dark:text-[#8dfc75] font-black' : 'text-gray-600 dark:text-[#828796]'}`}>
                    <span className="material-symbols-outlined text-[16px]">mic</span>
                    <span>{isListening ? t('translate.micActive', 'Mic Active') : t('translate.micPaused', 'Mic Paused')}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stretched Arena Grid: Left (Avatar or Full Camera) | Right (Captions, Text Chat, or Signed Chat Feed) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
            
            {/* LEFT PANE: Full Recognition Camera in ISL_TO_TEXT mode, Avatar in other modes */}
            <div className="lg:col-span-6 bg-white dark:bg-[#181c1e] text-gray-900 dark:text-white rounded-3xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden min-h-0 border border-gray-200 dark:border-[#2d3133]">
              {activeMode === 'ISL_TO_TEXT' ? (
                <>
                  {/* Full Camera Viewport Header */}
                  <div className="flex flex-wrap items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2 mb-2 shrink-0 z-10 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#fe9832] text-[20px]">videocam</span>
                      <h3 className="text-sm font-bold text-gray-950 dark:text-white drop-shadow-xs">{t('translate.cameraTitle', 'Full Sign Recognition Camera')}</h3>
                      <button
                        type="button"
                        onClick={() => setShowGuideModal(true)}
                        className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 text-indigo-900 dark:text-indigo-300 border border-indigo-400/30 rounded-lg text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[14px]">menu_book</span>
                        <span>{t('translate.islGuide', 'ISL Guide')}</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Sambhav Model 2 6-Second Video Capture Button */}
                      <button
                        type="button"
                        onClick={captureSignVideo}
                        disabled={isVideoRecording || isVideoProcessing}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer border ${
                          isVideoRecording
                            ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                            : isVideoProcessing
                            ? 'bg-indigo-600 text-white border-indigo-400 animate-pulse'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400/50 hover:scale-[1.02] active:scale-95'
                        }`}
                        title="Record 6-second sign video clip and predict with Sambhav Model 2 BiLSTM"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isVideoRecording ? 'fiber_manual_record' : isVideoProcessing ? 'hourglass_top' : 'videocam'}
                        </span>
                        <span>
                          {isVideoRecording
                            ? `Recording (${recordingCountdown || 6}s)...`
                            : isVideoProcessing
                            ? 'AI Processing...'
                            : '🎥 Record Sign (6s)'}
                        </span>
                      </button>

                      {/* Convert Accumulated ISL Gloss to English Sentence Button */}
                      <button
                        type="button"
                        onClick={convertGlossToEnglish}
                        disabled={glossWords.length === 0 || isVideoRecording || isVideoProcessing}
                        className="px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer border bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-indigo-400/50 disabled:opacity-40 disabled:pointer-events-none hover:scale-[1.02] active:scale-95"
                        title="Convert accumulated ISL sign words into a grammatical English sentence"
                      >
                        <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
                        <span>Convert to English</span>
                      </button>

                      <button
                        type="button"
                        onClick={start5sCapture}
                        disabled={isCapturingManual || isVideoRecording}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer border ${
                          captureCountdown !== null
                            ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                            : 'bg-gradient-to-r from-amber-500 to-[#fe9832] hover:from-amber-600 hover:to-[#e08328] text-gray-950 border-amber-300/50 hover:scale-[1.02] active:scale-95'
                        }`}
                        title="Record hand movement for 5 seconds and recognize gesture immediately"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {captureCountdown !== null ? 'hourglass_top' : 'timer'}
                        </span>
                        <span>{captureCountdown !== null ? `Capturing (${captureCountdown}s)` : t('translate.test5sSign', 'Test 5s Sign')}</span>
                      </button>

                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                        isModelOnline
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-[#fe9832]/20 text-[#fe9832] border border-[#fe9832]/30'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isModelOnline ? 'bg-emerald-400 animate-ping' : 'bg-[#fe9832]'}`} />
                        <span>
                          {isModelOnline 
                            ? (activeEndpoint.includes('127.0.0.1') || activeEndpoint.includes('localhost') 
                                ? `Sambhav Model 2 (${pingLatencyMs || 15}ms)` 
                                : t('translate.cloudMLLive', 'Sambhav ML Live'))
                            : t('translate.mlReconnecting', 'ML Reconnecting...')}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Full Camera Viewport with Hand Skeleton Tracking Canvas */}
                  <div className="flex-1 relative rounded-xl overflow-hidden bg-black flex items-center justify-center min-h-0">
                    <video
                      ref={(el) => {
                        gestureVideoRef.current = el;
                        if (el) {
                          if (mediaStreamRef.current && el.srcObject !== mediaStreamRef.current) {
                            el.srcObject = mediaStreamRef.current;
                            el.play().catch(() => {});
                          }
                          startISLRecognition(el);
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
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                      <div className="bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white flex items-center gap-1.5 font-bold border border-white/10 shadow-sm">
                        <span className={`w-2 h-2 rounded-full ${isISLRecognizing ? 'bg-emerald-400 animate-pulse' : 'bg-[#fe9832]'}`} />
                        <span>
                          {handsDetectedCount === 2 
                            ? t('translate.hud2Hands', '2 Hands Detected (2-Handed ISL Active)') 
                            : handsDetectedCount === 1 
                            ? t('translate.hud1Hand', '1 Hand Detected') 
                            : t('translate.hudWaitingHands', 'Waiting for Hands in Camera Frame...')}
                        </span>
                      </div>
                      {isISLRecognizing && (
                        <div className="bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] text-gray-300 font-medium self-start flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          <span>Status: {gestureState}</span>
                        </div>
                      )}
                    </div>

                    {/* Live 6-Second Recording Central HUD Overlay */}
                    {isVideoRecording && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 z-20 animate-fadeIn">
                        <div className="relative flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full border-4 border-rose-500/30 border-t-rose-500 animate-spin" />
                          <div className="absolute text-2xl font-black text-white font-mono">
                            {recordingCountdown ?? 6}s
                          </div>
                        </div>
                        <div className="bg-rose-600/90 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg animate-pulse border border-rose-400">
                          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                          <span>Recording ISL Sign Clip...</span>
                        </div>
                        <p className="text-[11px] text-white/80 font-medium">Perform your gesture clearly inside the frame</p>
                      </div>
                    )}

                    {/* AI Inference Processing Overlay */}
                    {isVideoProcessing && (
                      <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 z-20 animate-fadeIn">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600/80 text-white flex items-center justify-center shadow-xl animate-bounce">
                          <span className="material-symbols-outlined text-[28px] animate-spin">psychology</span>
                        </div>
                        <div className="bg-indigo-600/90 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg border border-indigo-400">
                          <span>Analyzing with Sambhav Model 2...</span>
                        </div>
                      </div>
                    )}

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
                          <span>{t('translate.speak', 'Speak')}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Sambhav Model 2 Gloss & English Translation Display */}
                  {(glossWords.length > 0 || englishSentence) && (
                    <div className="my-2 p-3 bg-gray-50 dark:bg-black/60 rounded-xl border border-indigo-200 dark:border-indigo-900/60 flex flex-col gap-2 animate-fadeIn z-10 shrink-0">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-extrabold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px]">sign_language</span>
                          <span>ISL Sign Tokens ({glossWords.length}):</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={removeLastGlossWord}
                            className="px-2 py-0.5 text-[10px] text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/50 hover:bg-amber-200 dark:hover:bg-amber-900/60 rounded-md font-bold cursor-pointer transition border border-amber-300/50"
                          >
                            Remove Last
                          </button>
                          <button
                            type="button"
                            onClick={clearGloss}
                            className="px-2 py-0.5 text-[10px] text-rose-800 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-950/50 hover:bg-rose-200 dark:hover:bg-rose-900/60 rounded-md font-bold cursor-pointer transition border border-rose-300/50"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>

                      {glossWords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {glossWords.map((w, idx) => (
                            <span
                              key={idx}
                              className="group inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 text-xs font-black rounded-lg border border-indigo-300 dark:border-indigo-700 shadow-2xs"
                            >
                              <span>{w}</span>
                              <button
                                type="button"
                                onClick={() => removeGlossWordAtIndex(idx)}
                                className="text-indigo-400 hover:text-rose-500 rounded p-0.5 transition cursor-pointer"
                                title={`Remove "${w}"`}
                              >
                                <span className="material-symbols-outlined text-[12px]">close</span>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {englishSentence && (
                        <div className="mt-1 pt-2 border-t border-indigo-200 dark:border-indigo-900 flex items-center justify-between gap-2">
                          <div className="text-xs font-bold text-gray-950 dark:text-white flex items-center gap-1.5">
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                              English
                            </span>
                            <span>"{englishSentence}"</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={handleCopyEnglishSentence}
                              className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md cursor-pointer transition"
                              title="Copy English Sentence"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {copiedSentence ? 'check' : 'content_copy'}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => speak(englishSentence)}
                              className="p-1 text-indigo-600 dark:text-[#fe9832] hover:bg-indigo-50 dark:hover:bg-white/10 rounded-md cursor-pointer transition"
                              title="Speak English Sentence"
                            >
                              <span className="material-symbols-outlined text-[16px]">volume_up</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bottom Camera Toolbar */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-800 mt-2 shrink-0 z-10">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 font-medium">
                      <span className="material-symbols-outlined text-[16px] text-[#fe9832]">psychology</span>
                      <span>Sambhav Model 2 (Saanket BiLSTM 169 ISL Classes)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (gestureVideoRef.current) {
                            startISLRecognition(gestureVideoRef.current);
                          }
                        }}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-950 dark:text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer border border-gray-300 dark:border-transparent"
                      >
                        <span className="material-symbols-outlined text-[14px]">refresh</span>
                        <span>{t('translate.restartCamera', 'Restart Camera')}</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* 3D ISL Avatar Visualizer for Speech to ISL & Text to ISL modes */}
                  <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2 mb-2 shrink-0 z-10">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#fe9832] text-[20px]">accessibility</span>
                      <h3 className="text-sm font-bold text-gray-950 dark:text-white drop-shadow-xs">3D ISL Avatar (Letter-by-Letter)</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-gray-100 dark:bg-black/60 p-0.5 rounded-full border border-gray-300 dark:border-white/10 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setModelPath('/models/ybot.glb')}
                          className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                            modelPath.includes('ybot') ? 'bg-[#fe9832] text-[#542900]' : 'text-gray-800 dark:text-white/70'
                          }`}
                        >
                          YBot
                        </button>
                        <button
                          type="button"
                          onClick={() => setModelPath('/models/xbot.glb')}
                          className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                            modelPath.includes('xbot') ? 'bg-[#fe9832] text-[#542900]' : 'text-gray-800 dark:text-white/70'
                          }`}
                        >
                          XBot
                        </button>
                      </div>
                      
                      {/* Avatar Speed Selector Buttons */}
                      <div className="flex items-center gap-1 bg-gray-100 dark:bg-black/60 p-0.5 rounded-lg border border-gray-300 dark:border-white/10 text-[10px]">
                        {[0.75, 1.0, 1.25, 1.5].map((sp) => (
                          <button
                            key={sp}
                            type="button"
                            onClick={() => setAvatarSpeed(sp)}
                            className={`px-1.5 py-0.5 rounded font-mono font-bold transition-all cursor-pointer ${
                              avatarSpeed === sp
                                ? 'bg-[#fe9832] text-[#542900] shadow-2xs'
                                : 'text-gray-700 dark:text-gray-300 hover:text-[#fe9832]'
                            }`}
                          >
                            {sp}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3D Avatar Canvas Area */}
                  <div className="flex-1 w-full h-full min-h-[320px] flex items-center justify-center relative overflow-hidden bg-slate-900 dark:bg-black/60 rounded-2xl border border-gray-200 dark:border-[#2d3133]">
                    {/* Detected Structured Sentence Pattern Overlay */}
                    {(() => {
                      const activeText = (activeSigningMessageId ? textMessages.find(m => m.id === activeSigningMessageId)?.text : '') || liveCaption || inputText;
                      const pattern = getSentencePattern(activeText);
                      if (!pattern) return null;
                      return (
                        <div className="absolute top-3 left-3 right-3 z-20 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#fe9832]/60 text-white flex items-center justify-between shadow-xl animate-scaleUp">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="w-2 h-2 rounded-full bg-[#fe9832] animate-ping" />
                            <span className="text-[10px] font-black text-[#fe9832] uppercase tracking-wide">
                              ISL Structure:
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-300">
                              {pattern.join(' ')}
                            </span>
                          </div>
                          <span className="text-[9px] text-white/70 font-medium hidden sm:inline">
                            Reordered for Sign Avatar
                          </span>
                        </div>
                      );
                    })()}

                    <ISLAvatarCanvas
                      ref={avatarCanvasRef}
                      modelPath={modelPath}
                      speed={avatarSpeed}
                      pauseTimeMs={Math.round(400 / avatarSpeed)}
                      onProgressChar={(char: string) => setActiveAvatarChar(char)}
                      onProgressWord={(wordIdx: number) => setActiveStepIndex(wordIdx)}
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
                </>
              )}
            </div>

            {/* RIGHT: Workspace Panel (Spans 6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-3 min-h-0">
              
              {/* ========================================================= */}
              {/* UNIFIED MODE: SPEECH / TEXT ↔ ISL                         */}
              {/* ========================================================= */}
              {activeMode === 'SPEECH_TEXT_TO_ISL' && (
                <>
                  {/* Stretched Speech / Text Conversation History with Live Green Word Sync */}
                  <div className="relative flex-1 bg-white dark:bg-[#181c1e] rounded-2xl p-4 border border-gray-200 dark:border-[#2d3133] shadow-sm flex flex-col justify-between min-h-0">
                    {/* Header with Language Selector, Mic Status, & Auto-Read */}
                    <div className="flex flex-wrap items-center justify-between border-b border-gray-200 dark:border-[#2d3133] pb-2 shrink-0 gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-[#8dfc75] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                        {t('translate.feedTitle', 'Speech / Text ↔ ISL Conversation Feed')}
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
                          className="bg-gray-100 dark:bg-[#111315] border border-gray-300 dark:border-[#2d3133] text-[11px] font-bold text-gray-950 dark:text-white rounded-lg px-2 py-0.5 outline-none cursor-pointer"
                        >
                          <option value="en-IN">🇮🇳 English (India)</option>
                          <option value="en-US">🇺🇸 English (US)</option>
                          <option value="hi-IN">🇮🇳 Hindi (हिन्दी)</option>
                        </select>

                        {/* Auto-Read Out Toggle */}
                        <label className="flex items-center gap-1 cursor-pointer select-none bg-gray-100 dark:bg-[#111315] px-2 py-0.5 rounded-lg border border-gray-300 dark:border-[#2d3133]">
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
                            {t('translate.autoRead', 'Auto-Read')}
                          </span>
                        </label>

                        {/* Read Selected Text Button */}
                        {selectedText && (
                          <button
                            type="button"
                            onClick={handleSpeakSelectedText}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer flex items-center gap-1 animate-pulse"
                            title={`Read aloud selected text: "${selectedText.substring(0, 25)}..."`}
                          >
                            <span className="material-symbols-outlined text-[13px]">record_voice_over</span>
                            <span>Read Selected</span>
                          </button>
                        )}

                        {/* Mic Pause / Resume Button */}
                        <button
                          type="button"
                          onClick={toggleListening}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer ${
                            isListening
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#683700] hover:opacity-95'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {isListening ? 'mic_off' : 'mic'}
                          </span>
                          <span>{isListening ? t('translate.pauseMic', 'Pause Mic') : t('translate.resumeMic', 'Resume Mic')}</span>
                        </button>

                        <span className="text-[10px] text-gray-700 dark:text-[#828796] font-semibold hidden sm:inline">
                          {textMessages.filter((m) => m.sender !== 'system').length} {t('translate.msgsCount', 'Msgs')}
                        </span>
                      </div>
                    </div>

                    {/* Speech Error Banner if any */}
                    {(!isMicSupported || micError) && (
                      <div className="px-3 py-2 my-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-950 dark:text-amber-200 text-xs font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-amber-600">warning</span>
                        <span>{micError || t('translate.micUnsupported', 'Microphone recognition is not supported in this browser.')}</span>
                      </div>
                    )}
                    {/* Messages Scroll View */}
                    <div
                      ref={chatScrollContainerRef}
                      onScroll={handleChatScroll}
                      className="relative flex-1 overflow-y-auto my-2 p-2 sm:p-3 bg-gray-50 dark:bg-[#111315] rounded-xl border border-gray-200 dark:border-[#2d3133] flex flex-col gap-3"
                    >
                      {textMessages.length === 0 && !liveCaption ? (
                        <div className="my-auto text-center p-6 text-gray-700 dark:text-gray-300 flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-emerald-100/90 text-emerald-700 dark:bg-[#fe9832]/10 dark:text-[#fe9832] flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">mic</span>
                          </div>
                          <p className="text-sm font-black text-gray-950 dark:text-white">{t('translate.readyToTranscribeHeading', 'Ready to Transcribe & Sign')}</p>
                          <p className="text-xs max-w-xs text-center font-medium">
                            {t('translate.readyToTranscribeDesc', 'Speak into your microphone in English or Hindi, or type a sentence below. The 3D Avatar will instantly begin continuous gesture signing.')}
                          </p>
                        </div>
                      ) : (
                        textMessages.map((msg) => {
                          const isSigningThisMsg = activeSigningMessageId === msg.id;

                          if (msg.sender === 'system') {
                            return (
                              <div key={msg.id} className="self-center my-1 px-3 py-1 bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-gray-300 text-[10px] font-bold rounded-full border border-gray-300 dark:border-white/15">
                                {msg.text} • {msg.timestamp}
                              </div>
                            );
                          }

                          return (
                            <div
                              key={msg.id}
                              className={`self-start max-w-[95%] p-3 rounded-2xl rounded-tl-sm border transition-all ${
                                isSigningThisMsg
                                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-400 dark:border-emerald-500 shadow-md ring-2 ring-emerald-400/40'
                                  : 'bg-white dark:bg-[#1e2327] border-gray-200 dark:border-[#2d3133] shadow-xs'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3 text-[10px] text-gray-600 dark:text-[#828796] border-b border-gray-100 dark:border-gray-800 pb-1 mb-1.5">
                                <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[13px] text-emerald-600">
                                    {msg.mode === 'SPEECH' ? 'mic' : 'keyboard'}
                                  </span>
                                  {msg.mode === 'SPEECH' ? t('translate.voiceBadge', 'Voice') : t('translate.textBadge', 'Text')}
                                </span>
                                <span>{msg.timestamp}</span>
                              </div>

                              {/* Synchronized Word Highlighting Container */}
                              <div className={`leading-relaxed text-gray-950 dark:text-white font-medium flex flex-wrap gap-x-1.5 gap-y-1 ${
                                captionFontSize === 'sm' ? 'text-xs' : captionFontSize === 'lg' ? 'text-base sm:text-lg' : 'text-sm'
                              }`}>
                                {msg.words.map((word, wIdx) => {
                                  const isCurrentActiveWord = isSigningThisMsg && activeStepIndex === wIdx;

                                  return (
                                    <span
                                      key={wIdx}
                                      className={`transition-all duration-150 rounded px-1 ${
                                        isCurrentActiveWord
                                          ? 'bg-emerald-500 text-white font-black shadow-sm scale-105 inline-block'
                                          : 'text-gray-950 dark:text-white'
                                      }`}
                                    >
                                      {word}
                                    </span>
                                  );
                                })}
                              </div>

                              {/* Detected Structured Sentence Pattern Chip */}
                              {(() => {
                                const pattern = getSentencePattern(msg.text);
                                if (!pattern) return null;
                                return (
                                  <div className="mt-2 pt-1.5 border-t border-dashed border-gray-200 dark:border-gray-800 flex items-center gap-1.5 flex-wrap">
                                    <span className="px-1.5 py-0.5 rounded-md bg-[#fe9832]/20 text-[#8f4e00] dark:text-[#fe9832] border border-[#fe9832]/40 text-[9px] font-extrabold flex items-center gap-1">
                                      <span className="material-symbols-outlined text-[12px]">account_tree</span>
                                      <span>ISL Structure:</span>
                                    </span>
                                    <span className="font-mono text-[10px] font-bold text-emerald-800 dark:text-[#8dfc75] bg-emerald-100/70 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                                      {pattern.join(' ')}
                                    </span>
                                  </div>
                                );
                              })()}

                              {/* Action Bar per message */}
                              <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                                  {msg.words.length} {t('translate.wordsCount', 'words')}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => translateTextToSign(msg.text, msg.id)}
                                    className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-[#fe9832]/30 text-slate-800 dark:text-white rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border border-gray-200 dark:border-[#2d3133]"
                                  >
                                    <span className="material-symbols-outlined text-[13px] text-emerald-600 dark:text-[#fe9832]">replay</span>
                                    <span>{t('translate.replaySign', 'Replay Sign')}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => speak(msg.text)}
                                    disabled={speaking}
                                    className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-[#fe9832]/30 text-slate-800 dark:text-white rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border border-gray-200 dark:border-[#2d3133]"
                                  >
                                    <span className="material-symbols-outlined text-[13px] text-indigo-600 dark:text-[#fe9832]">volume_up</span>
                                    <span>{t('translate.readAloud', 'Read Aloud')}</span>
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
                        className="absolute bottom-20 right-8 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full shadow-xl flex items-center gap-1.5 transition-all animate-bounce cursor-pointer z-30"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                        <span>{t('translate.jumpLatest', 'Jump to Latest')}</span>
                      </button>
                    )}

                    {/* Live Input Sentence Pattern Detection Pill */}
                    {(() => {
                      const pattern = getSentencePattern(inputText);
                      if (!pattern) return null;
                      return (
                        <div className="px-3 py-1 bg-[#fe9832]/15 border border-[#fe9832]/30 rounded-xl text-[11px] flex items-center justify-between mb-1 animate-fadeIn shrink-0">
                          <span className="font-bold text-[#8f4e00] dark:text-[#fe9832] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">account_tree</span>
                            <span>Detected ISL Structure:</span>
                          </span>
                          <span className="font-mono font-bold text-emerald-800 dark:text-[#8dfc75] bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800">
                            {pattern.join(' ')}
                          </span>
                        </div>
                      );
                    })()}

                    {/* Instant Status */}
                    {activeSigningMessageId && activeStepIndex >= 0 && (
                      <div className="flex items-center justify-between pt-1 shrink-0 text-xs text-emerald-800 dark:text-green-400 font-bold">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                          {t('translate.syncActive', 'Synchronized Green Text Highlighting Active')} ({avatarSpeed}x {t('translate.speedSuffix', 'speed')})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Text & Speech Input Panel */}
                  <form onSubmit={handleSendTextMessage} className="bg-white dark:bg-[#181c1e] rounded-2xl p-3 border border-gray-200 dark:border-[#2d3133] shadow-sm shrink-0 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={t('translate.inputPlaceholder', "Type a sentence to sign & translate (e.g. 'Hello welcome to our accessible office')...")}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-[#111315] border border-gray-200 dark:border-[#2d3133] rounded-xl text-xs sm:text-sm text-gray-950 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-0 outline-none font-medium"
                    />

                    <button
                      type="button"
                      onClick={() => setAutoReadOutChat(!autoReadOutChat)}
                      title={autoReadOutChat ? 'Auto-Read Out is ON' : 'Auto-Read Out is OFF'}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                        autoReadOutChat
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-[#fe9832]/20 dark:text-[#fe9832] dark:border-[#fe9832]/40'
                          : 'bg-gray-100 dark:bg-gray-800 text-slate-500 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {autoReadOutChat ? 'volume_up' : 'volume_off'}
                      </span>
                    </button>

                    {/* Notes & Prescription OCR Quick Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setShowScanModal(true)}
                      title={t('translate.scanNotesPrescription', 'Scan Notes & Prescription (OCR)')}
                      className="p-2.5 rounded-xl border border-teal-200 dark:border-teal-700/50 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-all flex items-center justify-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        document_scanner
                      </span>
                    </button>

                    <button
                      type="submit"
                      disabled={isProcessing || !inputText.trim()}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#683700] hover:opacity-95 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-40"
                    >
                      <span>{t('translate.signText', 'Sign Text')}</span>
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
                  <div className="flex-1 bg-white dark:bg-[#181c1e] rounded-2xl p-4 border border-gray-200 dark:border-[#2d3133] shadow-sm flex flex-col justify-between min-h-0 gap-2">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#2d3133] pb-2 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-950 dark:text-white flex items-center gap-1.5 drop-shadow-xs">
                          <span className="material-symbols-outlined text-[18px] text-[#fe9832]">chat</span>
                          {t('translate.signedFeedTitle', 'Signed Conversation Feed')}
                        </span>
                        <span className="text-[10px] bg-[#fe9832]/20 text-[#8f4e00] dark:text-[#fe9832] px-2 py-0.5 rounded-full font-bold border border-[#fe9832]/30">
                          {signedMessages.length} {t('translate.sentCount', 'Sent')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {signedMessages.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSignedMessages([])}
                            className="text-[11px] text-gray-700 dark:text-gray-300 hover:text-red-500 font-bold transition flex items-center gap-1 cursor-pointer px-2 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40"
                          >
                            <span className="material-symbols-outlined text-[13px]">delete_sweep</span>
                            <span>{t('translate.clearFeed', 'Clear Feed')}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Sent Signed Messages Scroll View */}
                    <div className="relative flex-1 overflow-y-auto my-1 p-3 bg-gray-50 dark:bg-[#111315] rounded-xl border border-gray-200 dark:border-[#2d3133] flex flex-col gap-2.5">
                      {signedMessages.length === 0 ? (
                        <div className="my-auto text-center p-6 text-gray-700 dark:text-gray-300 flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-[#fe9832]/20 text-[#fe9832] flex items-center justify-center border border-[#fe9832]/30 shadow-sm">
                            <span className="material-symbols-outlined text-2xl">sign_language</span>
                          </div>
                          <p className="text-sm font-black text-gray-950 dark:text-white drop-shadow-xs">{t('translate.waitingForSignsHeading', 'Waiting for Signs')}</p>
                          <p className="text-xs max-w-xs text-center text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                            {t('translate.waitingForSignsDesc', 'Perform signs in front of the camera. Words will continuously accumulate in the editable message composition box below. Review, edit, and click Send!')}
                          </p>
                        </div>
                      ) : (
                        signedMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className="self-start max-w-[95%] bg-white dark:bg-[#1e2327] p-3 rounded-2xl rounded-tl-sm border border-gray-200 dark:border-[#2d3133] shadow-xs flex flex-col gap-1.5 animate-fadeIn"
                          >
                            <div className="flex items-center justify-between gap-3 text-[10px] text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-1">
                              <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-black uppercase text-[9px] border border-emerald-300/60">
                                  {t('translate.islMessageBadge', 'ISL Message')}
                                </span>
                                <span className="font-mono text-gray-500 font-medium">
                                  {msg.phrase.split(/\s+/).length} {t('translate.wordsCount', 'words')}
                                </span>
                              </div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">{msg.timestamp}</span>
                            </div>

                            <p className="text-base font-black text-gray-950 dark:text-white leading-relaxed">
                              "{msg.phrase}"
                            </p>

                            <div className="flex items-center justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => speak(msg.phrase)}
                                disabled={speaking}
                                className="px-2 py-0.5 bg-gray-100 dark:bg-black/50 hover:bg-[#fe9832]/30 text-gray-950 dark:text-white rounded-md text-[10px] font-bold transition flex items-center gap-1 border border-gray-200 dark:border-[#2d3133] shadow-xs cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[13px] text-[#fe9832]">volume_up</span>
                                <span>{t('translate.speakAloud', 'Speak Aloud')}</span>
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
                        incomingCommittedSign={committedSign}
                        incomingMLWord={recognizedSignPhrase || recognizedSign}
                        incomingConfidence={signConfidence}
                        isModelActive={isISLRecognizing}
                        onSendMessage={handleSendSignedMessage}
                        onSpeakDraft={(draft) => speak(draft)}
                        placeholder={t('translate.composerPlaceholder', 'Validated signs appear here. Edit or type before sending...')}
                      />
                    </div>
                  </div>
                </>
              )}
              {/* Close Right Pane */}
            </div>

            {/* Close Stretched Arena Grid */}
          </div>

          {/* Close Active Communication Arena */}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: SUMMARY MODAL (SAVE & DONE OPTIONS WITH DETAILED MODE BREAKDOWN)*/}
      {/* ========================================================================= */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151c28] rounded-[28px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-[#243044] flex flex-col gap-5 animate-scaleUp text-gray-900 dark:text-white">
            
            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-[#243044] pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-[#8dfc75] flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">check_circle</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('translate.summaryTitle', 'Communication Ended')}</h2>
                <p className="text-xs text-gray-500 dark:text-[#828796]">{t('translate.summarySubtitle', 'Session summary complete')}</p>
              </div>
            </div>

            {/* Detailed Mode Breakdown in Summary */}
            <div className="bg-slate-50 dark:bg-[#0c121e] rounded-2xl p-4 border border-slate-200 dark:border-[#243044] flex flex-col gap-2 max-h-48 overflow-y-auto">
              <div className="flex justify-between text-xs border-b border-slate-200 dark:border-[#243044] pb-1.5 font-bold">
                <span className="text-gray-600 dark:text-[#828796]">{t('translate.conversationLabel', 'Conversation:')}</span>
                <span className="font-bold text-gray-900 dark:text-white">{sessionHistoryLogs.length} {t('translate.eventsCount', 'events')}</span>
              </div>

              {sessionHistoryLogs.length === 0 ? (
                <p className="text-[11px] text-gray-500 dark:text-[#828796] italic py-2">{t('translate.noConversation', 'No conversation in this session.')}</p>
              ) : (
                <div className="space-y-1.5 pt-1">
                  {sessionHistoryLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 truncate max-w-[80%]">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          log.mode === 'SPEECH'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                            : log.mode === 'TEXT'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300'
                            : log.mode === 'GESTURE'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {log.mode}
                        </span>
                        <span className="text-gray-900 dark:text-white truncate">{log.text}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-[#828796]">{log.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions: Done */}
            <div className="flex pt-2">
              <button
                onClick={handleDoneSummary}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#683700] hover:opacity-95 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>{t('translate.doneCloseSession', 'Done (Close Session)')}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 4: ISL SIGNING GUIDE & RECOGNITION TIPS MODAL                     */}
      {/* ========================================================================= */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a202c] text-gray-900 dark:text-white rounded-[24px] max-w-2xl w-full p-6 shadow-2xl border border-[#e0e3e5] dark:border-[#2d3133] flex flex-col gap-4 max-h-[85vh] overflow-hidden animate-scaleUp">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#fe9832]/20 text-[#fe9832] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">school</span>
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight">{t('translate.guideModalTitle', 'Indian Sign Language (ISL) Recognition Guide')}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('translate.guideModalSubtitle', 'Tips for 90%+ recognition accuracy with Sambhav BiLSTM AI')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-white transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              
              {/* Tip 1: Whole-Word ISL Recognition */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3.5">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300 text-sm mb-1.5">
                  <span className="material-symbols-outlined text-[18px]">front_hand</span>
                  <span>1. {t('translate.guideTip1Title', '169 ISL Classes (Sambhav Model 2)')}</span>
                </div>
                <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
                  {t('translate.guideTip1Desc', 'The AI recognizes full 169 Indian Sign Language (ISL) concepts and letters (A–Z) from Sambhav Model 2. Both single-handed and two-handed gestures are supported:')}
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-amber-900 dark:text-amber-100 font-medium">
                  <li><strong>Single-Hand Signs & Letters:</strong> {t('translate.guideTip1A', 'Perform clearly with dominant hand in full camera view (e.g., A–Z, Hello, Good, Day).')}</li>
                  <li><strong>Two-Hand Signs:</strong> {t('translate.guideTip1B', 'Frame both hands in view with green (Right) and orange (Left) skeleton tracking active.')}</li>
                  <li><strong>Natural Transitions:</strong> {t('translate.guideTip1C', 'Lower hands to rest between signs to cleanly demarcate consecutive words.')}</li>
                </ul>
              </div>

              {/* Tip 2: Dynamic Signs & 2.0 - 3.0 Second Motion Window */}
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl p-3.5">
                <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300 text-sm mb-1.5">
                  <span className="material-symbols-outlined text-[18px]">motion_photos_on</span>
                  <span>2. {t('translate.guideTip2Title', 'Dynamic Gesture Timing (~0.6s – 2.0s Motion Window)')}</span>
                </div>
                <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                  {t('translate.guideTip2Desc', 'The BiLSTM neural model processes 60-frame continuous windows with instant geometric letter recognition. Maintain fluent sign motion while performing your gesture.')}
                </p>
                <p className="text-blue-800 dark:text-blue-200 mt-1">
                  {t('translate.guideTip2Footer', 'Start your sign clearly in front of the camera, perform the motion, and then drop hands to resting position to trigger instant recognition.')}
                </p>
              </div>

              {/* Tip 3: Lighting & Hand Placement */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3.5">
                <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-300 text-sm mb-1.5">
                  <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                  <span>3. {t('translate.guideTip3Title', 'Lighting & Camera Distance')}</span>
                </div>
                <p className="text-emerald-800 dark:text-emerald-200 leading-relaxed">
                  {t('translate.guideTip3Desc', 'Sit roughly 1.5 to 2.5 feet (0.5m – 0.8m) from your webcam so your torso and both hands are clearly framed. Ensure front-facing lighting so MediaPipe tracks all 21 joints on each hand without shadow distortion.')}
                </p>
              </div>

              {/* Supported Vocabulary Summary */}
              <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-750 rounded-xl p-3.5">
                <h4 className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#fe9832]">category</span>
                  <span>{t('translate.guideVocabTitle', 'Trained Vocabulary (169 ISL Classes)')}</span>
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-[11px] leading-relaxed">
                  {t('translate.guideVocabDesc', 'Trained on 169 Indian Sign Language classes from Sambhav Model 2, including Alphabets A-Z, Days of Week, Months, Family Relations, Common Actions, Emergency, Medical, and Daily Life Vocabulary.')}
                </p>
              </div>

            </div>

            {/* Close Button */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-800 shrink-0">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-full py-2.5 bg-[#fe9832] hover:bg-[#e8872b] text-[#683700] font-black text-xs rounded-xl transition cursor-pointer shadow-sm"
              >
                {t('translate.guideGotIt', "Got It, Let's Sign!")}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* OCR Notes & Prescription Scan Modal */}
      <ScanModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        onSendToTranslate={handleScannedTextToTranslate}
      />

      </div>
    </div>
  );
};

export default TranslatePage;
