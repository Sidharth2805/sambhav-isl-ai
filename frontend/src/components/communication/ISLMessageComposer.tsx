import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface ISLMessageComposerProps {
  incomingMLWord?: string | null;
  incomingConfidence?: number;
  isModelActive?: boolean;
  onSendMessage: (finalText: string) => void;
  onSpeakDraft?: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

interface DetectedToken {
  id: string;
  word: string;
  confidence: number;
  timestamp: number;
}

export const ISLMessageComposer: React.FC<ISLMessageComposerProps> = ({
  incomingMLWord,
  incomingConfidence = 0.0,
  isModelActive = true,
  onSendMessage,
  onSpeakDraft,
  placeholder = 'Signs appear here as you perform them. Edit or type before sending...',
  disabled = false,
  className = '',
}) => {
  // Current draft text being composed by user + ML
  const [draftText, setDraftText] = useState('');
  
  // Tracking last appended ML token to prevent repetitive jitter spam
  const lastAppendedTokenRef = useRef<string | null>(null);
  const lastAppendedTimeRef = useRef<number>(0);
  
  // Visual history of recent ML detections for quick chips
  const [recentTokens, setRecentTokens] = useState<DetectedToken[]>([]);
  const [lastDetectedToken, setLastDetectedToken] = useState<{ word: string; confidence: number } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Smart ML Token Appender
  useEffect(() => {
    if (!incomingMLWord || !incomingMLWord.trim()) return;

    const rawWord = incomingMLWord.trim();
    // Ignore placeholder / unknown tokens
    if (
      rawWord.toUpperCase() === 'UNKNOWN' ||
      rawWord.toUpperCase() === 'G_UNKNOWN' ||
      rawWord === 'Analyzing sign...' ||
      rawWord === 'No hands detected'
    ) {
      return;
    }

    const cleanWord = rawWord;
    const now = Date.now();

    // Prevent duplicated consecutive tokens within 1.4 seconds
    if (
      lastAppendedTokenRef.current &&
      lastAppendedTokenRef.current.toLowerCase() === cleanWord.toLowerCase() &&
      now - lastAppendedTimeRef.current < 1400
    ) {
      return;
    }

    lastAppendedTokenRef.current = cleanWord;
    lastAppendedTimeRef.current = now;

    // Update active badge
    setLastDetectedToken({ word: cleanWord, confidence: incomingConfidence });

    // Append to recent token chips (max 6)
    setRecentTokens((prev) => {
      const updated = [
        {
          id: `tok-${now}-${Math.random().toString(36).substr(2, 4)}`,
          word: cleanWord,
          confidence: incomingConfidence,
          timestamp: now,
        },
        ...prev.filter((t) => t.word.toLowerCase() !== cleanWord.toLowerCase()),
      ];
      return updated.slice(0, 6);
    });

    // Intelligently append to draft without wiping manual edits
    setDraftText((prev) => {
      if (!prev || !prev.trim()) {
        return cleanWord;
      }
      // If ends with a space or newline, just append
      if (/\s$/.test(prev)) {
        return `${prev}${cleanWord}`;
      }
      // Otherwise add a space before appending the new word
      return `${prev} ${cleanWord}`;
    });

    // Auto-focus and scroll textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
    }, 50);
  }, [incomingMLWord, incomingConfidence]);

  // Handle final submission (WhatsApp send button / Enter key)
  const handleSend = useCallback(() => {
    const trimmed = draftText.trim();
    if (!trimmed || disabled) return;

    onSendMessage(trimmed);

    // Reset draft state
    setDraftText('');
    lastAppendedTokenRef.current = null;
    lastAppendedTimeRef.current = 0;
    setLastDetectedToken(null);

    // Refocus input
    textareaRef.current?.focus();
  }, [draftText, disabled, onSendMessage]);

  // Keyboard shortcut: Enter to send (Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Backspace last word helper
  const handleBackspaceLastWord = () => {
    setDraftText((prev) => {
      const trimmed = prev.trimEnd();
      const lastSpaceIndex = trimmed.lastIndexOf(' ');
      if (lastSpaceIndex === -1) {
        return '';
      }
      return trimmed.substring(0, lastSpaceIndex) + ' ';
    });
    textareaRef.current?.focus();
  };

  // Clear all helper
  const handleClearDraft = () => {
    setDraftText('');
    lastAppendedTokenRef.current = null;
    textareaRef.current?.focus();
  };

  // Insert token chip directly into draft
  const handleInsertToken = (word: string) => {
    setDraftText((prev) => {
      if (!prev || !prev.trim()) return word;
      if (/\s$/.test(prev)) return `${prev}${word}`;
      return `${prev} ${word}`;
    });
    textareaRef.current?.focus();
  };

  return (
    <div className={`flex flex-col gap-2 bg-white dark:bg-[#1a202c] rounded-2xl p-3 border border-[#e0e3e5] dark:border-[#2d3133] shadow-md transition-all ${className}`}>
      
      {/* Top Bar: ML Detection Status & Quick Edit Actions */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {/* ML Status Pill */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`w-2 h-2 rounded-full ${isModelActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
          {lastDetectedToken ? (
            <span className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700/60 px-2 py-0.5 rounded-md text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
              <span>ML Detected:</span>
              <span className="uppercase font-black text-[#fe9832] dark:text-[#fe9832]">"{lastDetectedToken.word}"</span>
              <span className="text-[10px] font-mono opacity-80">({Math.round(lastDetectedToken.confidence * 100)}%)</span>
            </span>
          ) : (
            <span className="text-[11px] text-[#45474c] dark:text-[#828796] font-medium">
              {isModelActive ? 'Camera recognizing signs into draft...' : 'Model standby'}
            </span>
          )}
        </div>

        {/* Quick Helper Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {onSpeakDraft && draftText.trim() && (
            <button
              type="button"
              onClick={() => onSpeakDraft(draftText.trim())}
              className="p-1 hover:bg-[#fe9832]/20 text-[#fe9832] rounded-md transition cursor-pointer"
              title="Preview Speech Audio"
              aria-label="Preview Speech"
            >
              <span className="material-symbols-outlined text-[16px]">volume_up</span>
            </button>
          )}

          {draftText.trim() && (
            <>
              <button
                type="button"
                onClick={handleBackspaceLastWord}
                className="px-2 py-0.5 bg-[#f1f4f6] dark:bg-[#0d121d] hover:bg-[#e0e3e5] text-[#030813] dark:text-white rounded-md text-[10px] font-bold border border-[#e0e3e5] dark:border-[#2d3133] transition flex items-center gap-1 cursor-pointer"
                title="Delete last word"
              >
                <span className="material-symbols-outlined text-[13px]">backspace</span>
                <span>Word</span>
              </button>

              <button
                type="button"
                onClick={handleClearDraft}
                className="px-2 py-0.5 bg-[#f1f4f6] dark:bg-[#0d121d] hover:bg-red-100 hover:text-red-700 text-gray-500 rounded-md text-[10px] font-bold border border-[#e0e3e5] dark:border-[#2d3133] transition flex items-center gap-1 cursor-pointer"
                title="Clear draft"
              >
                <span className="material-symbols-outlined text-[13px]">close</span>
                <span>Clear</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main WhatsApp-Style Composition Row */}
      <div className="flex items-end gap-2 bg-[#f7fafc] dark:bg-[#0d121d] rounded-2xl p-2 border border-[#e0e3e5] dark:border-[#2d3133] focus-within:border-[#fe9832] dark:focus-within:border-[#fe9832] focus-within:ring-2 focus-within:ring-[#fe9832]/20 transition-all">
        
        {/* Text Input / Editable Draft Area */}
        <textarea
          ref={textareaRef}
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={2}
          className="flex-1 bg-transparent border-0 resize-none text-xs sm:text-sm text-[#030813] dark:text-white placeholder-[#828796] focus:outline-none leading-relaxed p-1 min-h-[44px] max-h-[120px]"
        />

        {/* WhatsApp-Style Saffron Round Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!draftText.trim() || disabled}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-md ${
            draftText.trim() && !disabled
              ? 'bg-[#fe9832] hover:bg-[#e8872b] text-[#542900] active:scale-95 shadow-[#fe9832]/30'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-50'
          }`}
          title="Send Complete Message (Enter)"
          aria-label="Send Message"
        >
          <span className="material-symbols-outlined text-[20px] font-bold transform -rotate-45 ml-0.5">
            send
          </span>
        </button>
      </div>

      {/* Detected Token Chips Helper Bar */}
      {recentTokens.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
          <span className="text-[10px] text-[#828796] font-semibold shrink-0">Recent:</span>
          {recentTokens.map((tok) => (
            <button
              key={tok.id}
              type="button"
              onClick={() => handleInsertToken(tok.word)}
              className="px-2 py-0.5 rounded-full bg-white dark:bg-[#1a202c] hover:bg-[#fe9832]/20 text-[#030813] dark:text-white border border-[#e0e3e5] dark:border-[#2d3133] text-[10px] font-bold transition shrink-0 flex items-center gap-1 cursor-pointer"
              title="Click to insert into draft"
            >
              <span>+ {tok.word}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
