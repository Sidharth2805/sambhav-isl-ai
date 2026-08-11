import { useState, useCallback, useEffect } from 'react';

export function useTextToSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
    }
  }, []);

  const speak = useCallback((text: string, language: string = 'English') => {
    if (!text || !('speechSynthesis' in window)) return;

    // Cancel current speech before commencing new
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map human-readable profile language selections to standard BCP 47 codes
    let langCode = 'en-US';
    const normalizedLang = language.toLowerCase();
    if (normalizedLang.includes('hindi')) {
      langCode = 'hi-IN';
    } else if (normalizedLang.includes('tamil')) {
      langCode = 'ta-IN';
    } else if (normalizedLang.includes('bengali')) {
      langCode = 'bn-IN';
    }
    
    utterance.lang = langCode;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, []);

  return { speak, stop, speaking, supported };
}
