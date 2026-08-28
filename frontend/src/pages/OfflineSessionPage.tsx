import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { getSession, endSession } from '../utils/communicationApi';
import type { CommunicationSessionDto } from '../utils/communicationApi';
import { useISLRecognition } from '../hooks/useISLRecognition';
import { DemoISLClassifier } from '../utils/islModel';
import { ISLMessageComposer } from '../components/communication/ISLMessageComposer';

interface TranscriptMessage {
  id: string;
  sender: 'signer' | 'speaker';
  text: string;
  timestamp: string;
}

export const OfflineSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const { speak, stop: _stop, supported: ttsSupported } = useTextToSpeech();

  const [session, setSession] = useState<CommunicationSessionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // References to Video and Canvas Elements
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Pluggable Recognition Hook
  const {
    isRecognizing,
    isPaused,
    currentGesture: _currentGesture,
    confidence,
    translatedText,
    error: recognitionError,
    isModelOnline,
    startRecognition,
    pauseRecognition,
    resumeRecognition,
    stopRecognition,
  } = useISLRecognition();

  // Sync checkboxes with hook commands
  const [cameraActive, setCameraActive] = useState(true);
  const [recognitionActive, setRecognitionActive] = useState(true);
  const [inputText, setInputText] = useState('');
  const [recognizedText, setRecognizedText] = useState('');

  // Conversation Transcript list
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);

  // Simulation parameters for testing UI behavior
  const [mockSignIndex, setMockSignIndex] = useState(0);

  // Update local translation output state from model stream
  useEffect(() => {
    if (translatedText) {
      setRecognizedText(translatedText);
    }
  }, [translatedText]);

  // Synchronize Camera checkbox status
  useEffect(() => {
    let active = true;
    const syncCamera = async () => {
      if (cameraActive && videoRef.current && !isRecognizing && active) {
        await startRecognition(videoRef.current);
      } else if (!cameraActive && isRecognizing && active) {
        stopRecognition();
      }
    };
    syncCamera();
    return () => {
      active = false;
    };
  }, [cameraActive, isRecognizing, startRecognition, stopRecognition]);

  // Synchronize Sign Recognition toggle
  useEffect(() => {
    if (recognitionActive && isPaused) {
      resumeRecognition();
    } else if (!recognitionActive && !isPaused) {
      pauseRecognition();
    }
  }, [recognitionActive, isPaused, resumeRecognition, pauseRecognition]);

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;
      try {
        setLoading(true);
        const data = await getSession(sessionId, accessToken);
        setSession(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to retrieve offline workspace session.');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId, accessToken]);

  const handleEndSession = async () => {
    if (!session) return;
    const confirmLeave = window.confirm('Are you sure you want to end this translation session?');
    if (!confirmLeave) return;

    try {
      setLoading(true);
      await endSession(session.id, accessToken);
      stop();
      stopRecognition();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to terminate session.');
      setLoading(false);
    }
  };

  // Keyboard conversation send handler
  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: TranscriptMessage = {
      id: Math.random().toString(),
      sender: 'speaker',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    };

    setTranscript((prev) => [...prev, newMessage]);
    
    // Automatically read typed message out loud for the offline participant
    if (ttsSupported) {
      speak(inputText.trim(), user?.profile?.preferredLanguage || 'English');
    }
    
    setInputText('');
  };

  // Mock sign gesture trigger to showcase UI functionality
  const triggerMockSignGesture = () => {
    // Manually feeds coordinate landmarks directly into the model to test classification state changes
    const mockCoordinates = [
      { rHandY: 0.2, lHandY: 0.2 }, // Thank you
      { rHandY: 0.35, lHandY: 0.8 }, // Hello
      { rHandY: 0.8, lHandY: 0.35 }, // Help
      { rHandY: 0.6, lHandY: 0.6 } // Communicate
    ];
    
    const coord = mockCoordinates[mockSignIndex];
    setMockSignIndex((prev) => (prev + 1) % mockCoordinates.length);

    const demoClassifier = new DemoISLClassifier();
    demoClassifier.classify({
      rightHand: [{ x: 0.7, y: coord.rHandY }],
      leftHand: [{ x: 0.3, y: coord.lHandY }]
    }).then((result: any) => {
      const vocab: Record<string, string> = {
        'G_HELLO': 'Hello, my name is Sidharth.',
        'G_HELP': 'How can I help you today?',
        'G_COMMUNICATE': 'I use Indian Sign Language to communicate.',
        'G_THANKYOU': 'Thank you for using SAMBHAV!'
      };
      if (result.gesture !== 'G_UNKNOWN') {
        setRecognizedText(vocab[result.gesture]);
      }
    });
  };

  const handleAcceptTranslation = (textToSend?: string) => {
    const finalContent = typeof textToSend === 'string' ? textToSend.trim() : recognizedText.trim();
    if (!finalContent) return;

    const newMessage: TranscriptMessage = {
      id: Math.random().toString(),
      sender: 'signer',
      text: finalContent,
      timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    };

    setTranscript((prev) => [...prev, newMessage]);
    
    if (ttsSupported) {
      speak(finalContent, user?.profile?.preferredLanguage || 'English');
    }
    
    setRecognizedText('');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4" role="status">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <span className="font-bold">Loading offline translation interface...</span>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="card p-8 flex flex-col items-center text-center gap-4 max-w-md mx-auto" role="alert">
        <span className="text-3xl">⚠️</span>
        <h2 className="text-xl font-bold">Session Connection Issue</h2>
        <p className="text-sm opacity-75">{error || 'Session could not be initialized.'}</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary py-2 text-xs">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      
      {/* Top Header Bar */}
      <header className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <button onClick={handleEndSession} className="text-xs hover:underline font-bold text-red-500">
            ← End Session
          </button>
          <h1 className="text-xl font-bold">Offline Workspace</h1>
        </div>

        <div className="flex items-center gap-2" aria-label="Translation Status">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
          <span className="text-xs font-bold text-green-600">● Active</span>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Camera Feed & Recognition Preview */}
        <section className="card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Camera View</h2>
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${recognitionActive ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-bold opacity-75">
                {recognitionActive ? 'Listening for signs...' : 'Recognition paused'}
              </span>
            </div>
          </div>

          {/* Camera Frame Viewport */}
          <div className="relative aspect-video rounded-lg bg-black border border-border overflow-hidden flex items-center justify-center">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  width={640}
                  height={480}
                />
              </>
            ) : (
              <span className="text-slate-600 text-xs font-bold">Camera Feed Disabled</span>
            )}
            
            {/* Overlay indicators */}
            <div className="absolute top-3 left-3 bg-black/70 px-2.5 py-1 rounded-lg text-[10px] text-white flex items-center gap-1.5 z-10 font-bold border border-white/10 shadow-sm backdrop-blur-xs">
              <span className={`w-2 h-2 rounded-full ${isModelOnline ? 'bg-emerald-400 animate-ping' : 'bg-[#fe9832]'}`} />
              <span>{isModelOnline ? '169-Class BiLSTM ML Active' : 'ISL Vision Active'}</span>
            </div>

            {/* Error notifications overlay */}
            {recognitionError && (
              <div className="absolute inset-0 bg-red-950/90 text-red-200 text-xs p-4 flex flex-col items-center justify-center text-center gap-2 z-20 font-semibold">
                <span>⚠️ {recognitionError}</span>
              </div>
            )}
          </div>

          {/* Camera Control panel */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={cameraActive}
                  onChange={() => setCameraActive(!cameraActive)}
                  className="rounded text-[#fe9832] focus:ring-[#fe9832] w-4 h-4"
                />
                <span>Camera Stream</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={recognitionActive}
                  onChange={() => setRecognitionActive(!recognitionActive)}
                  className="rounded text-[#fe9832] focus:ring-[#fe9832] w-4 h-4"
                />
                <span>Sign Recognition</span>
              </label>
            </div>

            {/* Test Simulation trigger */}
            <button
              onClick={triggerMockSignGesture}
              className="text-xs px-3 py-1.5 bg-[#fe9832]/10 border border-[#fe9832]/30 rounded-lg text-[#8f4e00] dark:text-[#fe9832] font-bold hover:bg-[#fe9832] hover:text-[#683700] transition-all cursor-pointer"
            >
              Test Gesture Input
            </button>
          </div>
        </section>

        {/* Right Column: Live Translation controls */}
        <section className="card p-6 flex flex-col gap-4 justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#e0e3e5] dark:border-[#2d3133] pb-2 mb-4">
              <h2 className="text-lg font-bold">Translation Output</h2>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold tracking-wide uppercase ${
                isModelOnline
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  : 'bg-[#fe9832]/15 text-[#8f4e00] dark:text-[#fe9832] border border-[#fe9832]/30'
              }`}>
                {isModelOnline ? 'BiLSTM 169 ISL Signs' : 'BiLSTM Ready'}
              </span>
            </div>
            
            {/* Model Status Card */}
            <div className="p-3 bg-[#f1f4f6] dark:bg-[#1a202c] border border-[#e0e3e5] dark:border-[#2d3133] rounded-xl text-xs mb-4 font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#fe9832]">psychology</span>
                <span className="text-[#181c1e] dark:text-[#f7fafc]">
                  {isModelOnline ? 'Trained Saanket Neural Network Active' : 'BiLSTM Model Service (port 8000)'}
                </span>
              </div>
              <span className="text-[10px] opacity-75 font-mono">169 Classes</span>
            </div>

            {/* WhatsApp-Style Editable ISL Message Composition System */}
            <div className="flex flex-col gap-2">
              <ISLMessageComposer
                incomingMLWord={translatedText || recognizedText}
                incomingConfidence={confidence}
                isModelActive={recognitionActive && isModelOnline}
                onSendMessage={(msg) => handleAcceptTranslation(msg)}
                onSpeakDraft={(draft) => speak(draft, user?.profile?.preferredLanguage || 'English')}
                placeholder="Detected signs flow into this draft. Review, edit words, and press Send to log..."
              />
            </div>
          </div>
        </section>

      </div>

      {/* Conversation Transcript (Display History log + manual text typing panel) */}
      <section className="card p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold border-b border-border pb-2">Conversation Log</h2>
        
        {/* Transcript scrolling frame */}
        <div className="max-h-[200px] min-h-[120px] overflow-y-auto flex flex-col gap-2 p-3 bg-bg border border-border rounded-lg">
          {transcript.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center py-6 text-xs opacity-50">
              No messages logged yet. Use the camera or type below to begin.
            </div>
          ) : (
            transcript.map((msg) => (
              <div
                key={msg.id}
                className={`p-2.5 rounded-lg max-w-xl text-sm ${
                  msg.sender === 'signer'
                    ? 'bg-primary/10 text-primary self-start border border-primary/20'
                    : 'bg-accent/10 text-accent self-end border border-accent/20'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] opacity-75 font-semibold mb-1">
                  <span>{msg.sender === 'signer' ? '🤟 Signer (Camera Translation)' : '💬 Speaker (Typed Input)'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <p className="font-bold">{msg.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Keyboard Input Panel */}
        <form onSubmit={handleSendText} className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message to read out loud..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-grow min-h-[44px] px-3 rounded-lg border border-border bg-bg text-text"
            aria-label="Type message"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="btn-primary px-6 min-h-[44px] font-bold text-xs"
          >
            Send & Speak
          </button>
        </form>
      </section>

    </div>
  );
};
export default OfflineSessionPage;
