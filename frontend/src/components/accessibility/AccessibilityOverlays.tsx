import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../../hooks/useAccessibility';
import { naturalSpeech } from '../../utils/naturalSpeech';

export const AccessibilityOverlays: React.FC = () => {
  const { settings, resetAllSettings, toggleTheme } = useAccessibility();
  const navigate = useNavigate();

  // Mouse tracking state
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Text Magnifier state
  const [magnifiedText, setMagnifiedText] = useState<string>('');
  const [magnifierPos, setMagnifierPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Focus Mode state (bounds of hovered section/element)
  const [focusRect, setFocusRect] = useState<DOMRect | null>(null);

  // Screen Reader Speaking state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpokenText, setCurrentSpokenText] = useState<string>('');

  // Voice Navigation state
  const [voiceStatus, setVoiceStatus] = useState<string>('Listening for voice commands...');
  const [lastVoiceCommand, setLastVoiceCommand] = useState<string>('');
  const [isMicActive, setIsMicActive] = useState(false);

  // Global mousemove handler for Guideline, Focus Mode, Text Magnifier
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      setMousePos({ x: clientX, y: clientY });

      // 1. Text Magnifier logic
      if (settings.textMagnifier) {
        const elem = document.elementFromPoint(clientX, clientY);
        if (elem) {
          const text = (elem.textContent || '').trim();
          if (text && text.length > 0 && text.length < 300 && !elem.closest('.a11y-panel')) {
            setMagnifiedText(text);
            setMagnifierPos({ x: clientX, y: Math.max(10, clientY - 80) });
          } else {
            setMagnifiedText('');
          }
        }
      }

      // 2. Focus Mode Spotlight logic
      if (settings.focusMode) {
        const elem = document.elementFromPoint(clientX, clientY);
        if (elem && !elem.closest('.a11y-panel') && !elem.closest('.a11y-overlay')) {
          const target = (elem.closest('article, section, div.card, div.rounded-2xl, p, h1, h2, h3, h4, button, a') || elem) as HTMLElement;
          if (target) {
            setFocusRect(target.getBoundingClientRect());
          }
        }
      }
    };

    if (settings.readingGuideline || settings.textMagnifier || settings.focusMode) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [settings.readingGuideline, settings.textMagnifier, settings.focusMode]);

  // Screen Reader: Click-to-Speak Engine
  useEffect(() => {
    if (!settings.screenReader) {
      naturalSpeech.stop();
      setIsSpeaking(false);
      return;
    }

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target.closest('.a11y-panel') || target.closest('.a11y-stop-speech-btn')) return;

      const text = (target.innerText || target.textContent || target.getAttribute('aria-label') || target.getAttribute('title') || '').trim();
      if (text) {
        naturalSpeech.stop();
        setIsSpeaking(true);
        setCurrentSpokenText(text.slice(0, 75) + (text.length > 75 ? '...' : ''));
        naturalSpeech.speak(text, {
          onEnd: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      }
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      naturalSpeech.stop();
    };
  }, [settings.screenReader]);

  const stopSpeaking = () => {
    naturalSpeech.stop();
    setIsSpeaking(false);
    setCurrentSpokenText('');
  };

  // Voice Navigation Controller
  useEffect(() => {
    if (!settings.voiceSupport) {
      setIsMicActive(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setVoiceStatus('Speech recognition not supported in this browser.');
      return;
    }

    let recognition: any = null;
    let isMounted = true;

    try {
      recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        if (isMounted) {
          setIsMicActive(true);
          setVoiceStatus('Listening... (e.g. say "Dashboard", "Translate", "Scroll Down")');
        }
      };

      recognition.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript.trim().toLowerCase();
        setLastVoiceCommand(transcript);

        // Process Voice Commands
        if (transcript.includes('dashboard')) {
          navigate('/dashboard');
        } else if (transcript.includes('translate')) {
          navigate('/translate');
        } else if (transcript.includes('communicate') || transcript.includes('call') || transcript.includes('video')) {
          navigate('/communicate');
        } else if (transcript.includes('cultural') || transcript.includes('anthem') || transcript.includes('jana gana mana')) {
          navigate('/cultural-isl');
        } else if (transcript.includes('learn')) {
          navigate('/learn-isl');
        } else if (transcript.includes('news')) {
          navigate('/news');
        } else if (transcript.includes('history')) {
          navigate('/communicate?tab=history');
        } else if (transcript.includes('profile') || transcript.includes('settings')) {
          navigate('/profile');
        } else if (transcript.includes('help') || transcript.includes('support')) {
          navigate('/help');
        } else if (transcript.includes('home') || transcript.includes('landing')) {
          navigate('/');
        } else if (transcript.includes('scroll down') || transcript.includes('down')) {
          window.scrollBy({ top: 450, behavior: 'smooth' });
        } else if (transcript.includes('scroll up') || transcript.includes('up')) {
          window.scrollBy({ top: -450, behavior: 'smooth' });
        } else if (transcript.includes('dark mode') || transcript.includes('light mode') || transcript.includes('theme')) {
          toggleTheme();
        } else if (transcript.includes('reset') || transcript.includes('clear')) {
          resetAllSettings();
        } else if (transcript.includes('stop')) {
          naturalSpeech.stop();
          setIsSpeaking(false);
          setCurrentSpokenText('');
        }
      };

      recognition.onerror = (err: any) => {
        if (isMounted) {
          setVoiceStatus(`Voice Note: ${err.error || 'Mic standby'}`);
        }
      };

      recognition.onend = () => {
        if (isMounted && settings.voiceSupport) {
          try {
            recognition.start();
          } catch {
            // standby
          }
        }
      };

      recognition.start();
    } catch {
      setVoiceStatus('Mic access required for voice support');
    }

    return () => {
      isMounted = false;
      if (recognition) {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [settings.voiceSupport, navigate, toggleTheme, resetAllSettings]);

  return (
    <div className="a11y-overlay pointer-events-none select-none z-[9999]">
      {/* 1. Reading Guideline (High-Contrast Horizontal Line) */}
      {settings.readingGuideline && (
        <div
          className="fixed left-0 right-0 h-1 bg-[#fe9832] shadow-[0_0_12px_rgba(254,152,50,0.85)] z-[99990] transition-all duration-75 pointer-events-none flex items-center justify-between"
          style={{ top: `${mousePos.y}px` }}
        >
          <div className="w-4 h-4 rounded-full bg-[#fe9832] border-2 border-white dark:border-[#030813] -ml-2 shadow-md" />
          <div className="w-4 h-4 rounded-full bg-[#fe9832] border-2 border-white dark:border-[#030813] -mr-2 shadow-md" />
        </div>
      )}

      {/* 2. Focus Mode (Spotlight Target) */}
      {settings.focusMode && focusRect && (
        <div
          className="fixed border-4 border-[#fe9832] rounded-2xl shadow-[0_0_0_9999px_rgba(3,8,19,0.72)] transition-all duration-150 pointer-events-none z-[99980]"
          style={{
            top: `${focusRect.top - 6}px`,
            left: `${focusRect.left - 6}px`,
            width: `${focusRect.width + 12}px`,
            height: `${focusRect.height + 12}px`,
          }}
        />
      )}

      {/* 3. Text Magnifier Floating Tooltip */}
      {settings.textMagnifier && magnifiedText && (
        <div
          className="fixed px-4 py-3 bg-[#030813] text-white border-2 border-[#fe9832] rounded-2xl shadow-2xl max-w-xl text-lg font-black z-[99995] pointer-events-none transition-all duration-75 animate-fadeIn backdrop-blur-md"
          style={{
            top: `${magnifierPos.y}px`,
            left: `${Math.min(window.innerWidth - 380, Math.max(16, mousePos.x - 100))}px`,
          }}
        >
          <div className="flex items-center gap-1.5 text-[10px] text-[#fe9832] uppercase tracking-wider font-bold mb-1">
            <span className="material-symbols-outlined text-[14px]">zoom_in</span>
            <span>Magnified Text</span>
          </div>
          <p className="leading-relaxed">{magnifiedText}</p>
        </div>
      )}

      {/* 4. Screen Reader Floating Audio Controller */}
      {settings.screenReader && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-[#030813]/95 text-white border border-[#fe9832] px-4 py-2 rounded-full shadow-2xl z-[99999] pointer-events-auto flex items-center gap-3 animate-fadeIn text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="material-symbols-outlined text-[#fe9832] text-[18px]">volume_up</span>
            <span className="hidden sm:inline">Screen Reader Active: Click any text to hear</span>
          </div>

          {isSpeaking && (
            <span className="text-[#ffb77a] italic truncate max-w-[200px]">"{currentSpokenText}"</span>
          )}

          {isSpeaking && (
            <button
              type="button"
              onClick={stopSpeaking}
              className="a11y-stop-speech-btn px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-[11px] font-extrabold cursor-pointer transition-colors"
            >
              Stop
            </button>
          )}
        </div>
      )}

      {/* 5. Voice Support Floating HUD */}
      {settings.voiceSupport && (
        <div className="fixed bottom-6 right-24 bg-[#030813]/95 text-white border border-[#fe9832] px-4 py-3 rounded-2xl shadow-2xl z-[99999] pointer-events-auto flex items-center gap-3 animate-fadeIn max-w-sm">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isMicActive ? 'bg-[#fe9832] text-[#542900] animate-pulse' : 'bg-white/10 text-white'}`}>
            <span className="material-symbols-outlined text-[20px]">mic</span>
          </div>
          <div className="flex flex-col min-w-0 text-left">
            <span className="text-xs font-bold text-[#fe9832]">Voice Navigation Active</span>
            <span className="text-[11px] text-[#c1c6d7] truncate">{lastVoiceCommand ? `Heard: "${lastVoiceCommand}"` : voiceStatus}</span>
          </div>
        </div>
      )}
    </div>
  );
};
