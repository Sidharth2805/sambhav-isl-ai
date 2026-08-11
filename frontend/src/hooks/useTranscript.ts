import { useState, useCallback, useRef } from 'react';
import type { TranscriptEvent } from '../types/transcript';

export const useTranscript = (currentSessionId: string) => {
  const [finalTranscripts, setFinalTranscripts] = useState<TranscriptEvent[]>([]);
  const [interimTranscripts, setInterimTranscripts] = useState<Record<string, string>>({});
  const seenEventIds = useRef<Set<string>>(new Set());

  const addTranscriptEvent = useCallback((event: TranscriptEvent) => {
    // Validate TranscriptEvent properties
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
      if (import.meta.env.DEV) {
        console.warn('[SignBridge Debug] Invalid transcript ignored (malformed JSON properties):', event);
      }
      return;
    }

    // Session validation: ignore events belonging to another communication session
    if (event.sessionId !== currentSessionId) {
      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] Invalid transcript ignored (session mismatch):', event.sessionId);
      }
      return;
    }

    // Deduplication check
    if (seenEventIds.current.has(event.id)) {
      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] Duplicate transcript ignored:', event.id);
      }
      return;
    }

    if (event.isFinal) {
      seenEventIds.current.add(event.id);

      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] Final transcript received:', event.text);
      }

      setFinalTranscripts((prev) => [...prev, event]);
      setInterimTranscripts((prev) => {
        const updated = { ...prev };
        delete updated[event.senderId];
        return updated;
      });
    } else {
      if (import.meta.env.DEV) {
        console.log('[SignBridge Debug] Interim transcript received:', event.text);
      }

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
  }, []);

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
