import { useState, useCallback, useRef, useEffect } from 'react';
import type { TranscriptEvent } from '../types/transcript';

export const useTranscript = (currentSessionId: string) => {
  const storageKey = `sambhav_call_transcripts_${currentSessionId}`;

  // Initialize from sessionStorage if rejoining active call
  const [finalTranscripts, setFinalTranscripts] = useState<TranscriptEvent[]>(() => {
    if (typeof window !== 'undefined' && currentSessionId) {
      try {
        const cached = sessionStorage.getItem(storageKey);
        return cached ? JSON.parse(cached) : [];
      } catch (err) {
        console.warn('Failed to parse cached transcripts:', err);
      }
    }
    return [];
  });

  const [interimTranscripts, setInterimTranscripts] = useState<Record<string, string>>({});
  const seenEventIds = useRef<Set<string>>(new Set());

  // Seed seen IDs on mount
  useEffect(() => {
    finalTranscripts.forEach((t) => {
      if (t?.id) seenEventIds.current.add(t.id);
    });
  }, []);

  // Sync to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && currentSessionId && finalTranscripts.length > 0) {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(finalTranscripts));
      } catch (err) {
        console.warn('Failed to persist call transcripts:', err);
      }
    }
  }, [finalTranscripts, currentSessionId, storageKey]);

  const addTranscriptEvent = useCallback((event: TranscriptEvent) => {
    if (
      !event ||
      typeof event.id !== 'string' ||
      typeof event.sessionId !== 'string' ||
      typeof event.senderId !== 'string' ||
      typeof event.senderName !== 'string' ||
      typeof event.senderType !== 'string' ||
      typeof event.text !== 'string' ||
      typeof event.isFinal !== 'boolean' ||
      typeof event.timestamp !== 'number'
    ) {
      return;
    }

    if (event.sessionId !== currentSessionId) {
      return;
    }

    if (seenEventIds.current.has(event.id)) {
      return;
    }

    if (event.isFinal) {
      seenEventIds.current.add(event.id);
      setFinalTranscripts((prev) => [...prev, event]);
      setInterimTranscripts((prev) => {
        const updated = { ...prev };
        delete updated[event.senderId];
        return updated;
      });
    } else {
      setInterimTranscripts((prev) => ({
        ...prev,
        [event.senderId]: event.text,
      }));
    }
  }, [currentSessionId]);

  const clearTranscript = useCallback(() => {
    setFinalTranscripts([]);
    setInterimTranscripts({});
    seenEventIds.current.clear();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  const removeOldTranscript = useCallback((ageMs: number = 60000) => {
    const cutoff = Date.now() - ageMs;
    setFinalTranscripts((prev) => prev.filter((t) => t.timestamp > cutoff));
  }, []);

  return {
    finalTranscripts,
    interimTranscripts,
    addTranscriptEvent,
    clearTranscript,
    removeOldTranscript,
  };
};

export default useTranscript;
