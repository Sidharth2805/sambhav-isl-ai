import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface ISLMessageComposerProps {
  incomingCommittedSign?: { text: string; confidence: number; sequenceId: number } | null;
  incomingMLWord?: string | null;
  incomingConfidence?: number;
  isModelActive?: boolean;
  onSendMessage: (finalText: string) => void;
  onSpeakDraft?: (text: string) => void;
  onReadInSign?: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  initialText?: string;
}

interface DetectedToken {
  id: string;
  word: string;
  confidence: number;
  timestamp: number;
}

export const ISLMessageComposer: React.FC<ISLMessageComposerProps> = ({
  incomingCommittedSign,
  incomingMLWord,
  incomingConfidence = 0.0,
  isModelActive = true,
  onSendMessage,
  onSpeakDraft,
  onReadInSign,
  placeholder = '🤟 Show signs to camera to compose your message. Edit anytime, and click Send...',
  disabled = false,
  className = '',
  initialText = '',
}) => {
  // Current draft text being composed by user + ML
  const [draftText, setDraftText] = useState(initialText);
  
  // Visual history of recent ML detections for quick chips
  const [recentTokens, setRecentTokens] = useState<DetectedToken[]>([]);
  const [lastDetectedToken, setLastDetectedToken] = useState<{ word: string; confidence: number } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lastAppendedSequenceIdRef = useRef<number>(-1);

  // Dedicated Committed Sign Token Appender (Appends ONLY on genuine validated committedSign event)
  useEffect(() => {
    // If incomingCommittedSign is provided, use strict sequenceId latching
    if (incomingCommittedSign) {
      const { text, confidence, sequenceId } = incomingCommittedSign;
      if (!text || !text.trim() || sequenceId === lastAppendedSequenceIdRef.current) {
        return;
      }

      const rawWord = text.trim();
      if (
        rawWord.toUpperCase() === 'UNKNOWN' ||
        rawWord.toUpperCase() === 'G_UNKNOWN' ||
        rawWord.toUpperCase() === 'NO_HANDS' ||
        rawWord.toUpperCase() === 'NO_ACTIVE_SIGN' ||
        rawWord === 'Analyzing sign...' ||
        rawWord === 'No hands detected'
      ) {
        return;
      }

      lastAppendedSequenceIdRef.current = sequenceId;
      const cleanWord = rawWord;
      const now = Date.now();
      const conf = confidence > 0 ? confidence : 0.95;

      setLastDetectedToken({ word: cleanWord, confidence: conf });

      setRecentTokens((prev) => {
        const updated = [
          {
            id: `tok-${now}-${sequenceId}`,
            word: cleanWord,
            confidence: conf,
            timestamp: now,
          },
          ...prev.filter((t) => t.word.toLowerCase() !== cleanWord.toLowerCase()),
        ];
        return updated.slice(0, 8);
      });

      setDraftText((prev) => {
        if (!prev || !prev.trim()) {
          return cleanWord;
        }
        if (/\s$/.test(prev)) {
          return `${prev}${cleanWord}`;
        }
        return `${prev} ${cleanWord}`;
      });

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
      }, 50);
      return;
    }

    // Fallback path when incomingCommittedSign is not provided
    if (!incomingMLWord || !incomingMLWord.trim()) return;

    const rawWord = incomingMLWord.trim();
    if (
      rawWord.toUpperCase() === 'UNKNOWN' ||
      rawWord.toUpperCase() === 'G_UNKNOWN' ||
      rawWord.toUpperCase() === 'NO_HANDS' ||
      rawWord.toUpperCase() === 'NO_ACTIVE_SIGN'
    ) {
      return;
    }
  }, [incomingCommittedSign, incomingMLWord, incomingConfidence]);

  // Handle final submission (Send button / Enter key)
  const handleSend = useCallback(() => {
    const trimmed = draftText.trim();
    if (!trimmed || disabled) return;

    onSendMessage(trimmed);

    // Reset draft state
    setDraftText('');
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

  // Backspace last word/char helper
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

  // Add space helper
  const handleAddSpace = () => {
    setDraftText((prev) => `${prev} `);
    textareaRef.current?.focus();
  };

  // Clear all helper
  const handleClearDraft = () => {
    setDraftText('');
    setLastDetectedToken(null);
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
    <div className={`flex flex-col gap-1.5 bg-white dark:bg-[#1a202c] rounded-2xl p-2.5 sm:p-3 border border-[#e0e3e5] dark:border-[#2d3133] shadow-md transition-all ${className}`}>
      
      {/* Top Bar: ML Detection Status & Quick Action Buttons */}
      <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
        {/* ML Status Pill */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`w-2 h-2 rounded-full ${isModelActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
          {lastDetectedToken ? (
            <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700/60 px-2 py-0.5 rounded-md text-[11px] font-bold text-emerald-800 dark:text-emerald-300 animate-scaleUp">
              <span className="material-symbols-outlined text-[13px] text-emerald-600 dark:text-emerald-400">sign_language</span>
              <span>Captured:</span>
              <span className="uppercase font-black text-[#fe9832] dark:text-[#fe9832]">"{lastDetectedToken.word}"</span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-normal">({Math.round(lastDetectedToken.confidence * 100)}%)</span>
            </span>
          ) : (
            <span className="text-[11px] text-[#45474c] dark:text-[#828796] font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#fe9832]">sign_language</span>
              <span>{isModelActive ? 'Show signs to camera to write into draft...' : 'Model standby'}</span>
            </span>
          )}
        </div>

        {/* Quick Helper Actions */}
        <div className="flex items-center gap-1 shrink-0 ml-auto">
          {/* Add Space button */}
          <button
            type="button"
            onClick={handleAddSpace}
            className="px-2 py-0.5 bg-[#f1f4f6] dark:bg-[#0d121d] hover:bg-[#e0e3e5] text-[#030813] dark:text-white rounded-md text-[10px] font-bold border border-[#e0e3e5] dark:border-[#2d3133] transition flex items-center gap-1 cursor-pointer active:scale-95"
            title="Add Space"
          >
            <span className="material-symbols-outlined text-[12px]">space_bar</span>
            <span>Space</span>
          </button>

          {draftText.trim() && (
            <>
              {/* Backspace Word button */}
              <button
                type="button"
                onClick={handleBackspaceLastWord}
                className="px-2 py-0.5 bg-[#f1f4f6] dark:bg-[#0d121d] hover:bg-[#e0e3e5] text-[#030813] dark:text-white rounded-md text-[10px] font-bold border border-[#e0e3e5] dark:border-[#2d3133] transition flex items-center gap-1 cursor-pointer active:scale-95"
                title="Delete last word"
              >
                <span className="material-symbols-outlined text-[12px]">backspace</span>
                <span>Word</span>
              </button>

              {/* Clear Draft button */}
              <button
                type="button"
                onClick={handleClearDraft}
                className="px-2 py-0.5 bg-[#f1f4f6] dark:bg-[#0d121d] hover:bg-red-100 hover:text-red-700 text-gray-500 rounded-md text-[10px] font-bold border border-[#e0e3e5] dark:border-[#2d3133] transition flex items-center gap-1 cursor-pointer active:scale-95"
                title="Clear draft"
              >
                <span className="material-symbols-outlined text-[12px]">close</span>
                <span>Clear</span>
              </button>
            </>
          )}

          {/* Read in 3D Sign Preview */}
          {onReadInSign && draftText.trim() && (
            <button
              type="button"
              onClick={() => onReadInSign(draftText.trim())}
              className="px-2 py-0.5 bg-[#f1f4f6] dark:bg-[#0d121d] hover:bg-[#fe9832]/20 text-[#fe9832] rounded-md text-[10px] font-bold border border-[#e0e3e5] dark:border-[#2d3133] transition flex items-center gap-1 cursor-pointer active:scale-95"
              title="Preview in 3D ISL Sign Avatar"
              aria-label="Preview in Sign Avatar"
            >
              <span className="material-symbols-outlined text-[13px]">sign_language</span>
              <span className="hidden sm:inline">Avatar</span>
            </button>
          )}

          {/* Voice Preview */}
          {onSpeakDraft && draftText.trim() && (
            <button
              type="button"
              onClick={() => onSpeakDraft(draftText.trim())}
              className="px-2 py-0.5 bg-[#f1f4f6] dark:bg-[#0d121d] hover:bg-green-500/20 text-green-600 dark:text-green-400 rounded-md text-[10px] font-bold border border-[#e0e3e5] dark:border-[#2d3133] transition flex items-center gap-1 cursor-pointer active:scale-95"
              title="Preview Speech Audio"
              aria-label="Preview Speech"
            >
              <span className="material-symbols-outlined text-[13px]">volume_up</span>
              <span className="hidden sm:inline">Voice</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Composition Row */}
      <div className="flex items-end gap-2 bg-[#f7fafc] dark:bg-[#0d121d] rounded-xl p-1.5 sm:p-2 border border-[#e0e3e5] dark:border-[#2d3133] focus-within:border-[#fe9832] dark:focus-within:border-[#fe9832] focus-within:ring-2 focus-within:ring-[#fe9832]/20 transition-all">
        
        {/* Text Input / Editable Draft Area */}
        <textarea
          ref={textareaRef}
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={2}
          className="flex-1 bg-transparent border-0 resize-none text-xs sm:text-sm text-[#030813] dark:text-white placeholder-[#828796] focus:outline-none leading-relaxed p-1 min-h-[38px] max-h-[90px]"
        />

        {/* Saffron Round Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!draftText.trim() || disabled}
          className={`h-9 px-3 sm:px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-md font-bold text-xs ${
            draftText.trim() && !disabled
              ? 'bg-[#fe9832] hover:bg-[#e8872b] text-[#542900] active:scale-95 shadow-[#fe9832]/30 font-black'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-50'
          }`}
          title="Send Complete Message to Call (Enter)"
          aria-label="Send Message"
        >
          <span className="material-symbols-outlined text-[17px] font-bold">
            send
          </span>
          <span>Send</span>
        </button>
      </div>

      {/* Detected Token Chips Helper Bar */}
      {recentTokens.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 custom-scrollbar">
          <span className="text-[10px] text-[#828796] font-semibold shrink-0">Recent Signs:</span>
          {recentTokens.map((tok) => (
            <button
              key={tok.id}
              type="button"
              onClick={() => handleInsertToken(tok.word)}
              className="px-2 py-0.5 rounded-full bg-white dark:bg-[#1a202c] hover:bg-[#fe9832]/20 text-[#030813] dark:text-white border border-[#e0e3e5] dark:border-[#2d3133] text-[10px] font-bold transition shrink-0 flex items-center gap-1 cursor-pointer active:scale-95"
              title="Click to insert into draft"
            >
              <span className="text-[#fe9832]">+</span>
              <span>{tok.word}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

