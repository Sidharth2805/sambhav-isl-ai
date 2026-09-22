/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from 'react';
import type { FrameLandmarks126, SambhavGestureState, SambhavCommittedEvent } from '../types/recognition';
import { getSharedHandsInstance, extract126Landmarks, resampleSequenceTo60 } from './preprocessing';
import { sambhavModel2Engine } from './sambhavModel2';

export function useSambhavModel2() {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [translatedText, setTranslatedText] = useState<string>('');
  const [committedSign, setCommittedSign] = useState<SambhavCommittedEvent | null>(null);
  const [gestureState, setGestureState] = useState<SambhavGestureState>('IDLE');
  const [isModelOnline, setIsModelOnline] = useState<boolean>(true);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const frameBufferRef = useRef<FrameLandmarks126[]>([]);
  const isProcessingRef = useRef<boolean>(false);
  const lastInferenceTimeRef = useRef<number>(0);
  const consecutivePredictionsRef = useRef<Map<string, number>>(new Map());
  const lastCommittedLabelRef = useRef<string>('');
  const lastCommitTimeRef = useRef<number>(0);

  // Check health periodically
  useEffect(() => {
    sambhavModel2Engine.checkHealth().then(setIsModelOnline).catch(() => setIsModelOnline(false));
    const interval = setInterval(() => {
      sambhavModel2Engine.checkHealth().then(setIsModelOnline).catch(() => setIsModelOnline(false));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const processFrame = useCallback(async () => {
    if (!videoElementRef.current || videoElementRef.current.paused || videoElementRef.current.ended) {
      animFrameIdRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const video = videoElementRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      animFrameIdRef.current = requestAnimationFrame(processFrame);
      return;
    }

    if (!isProcessingRef.current) {
      isProcessingRef.current = true;
      try {
        const hands = await getSharedHandsInstance();
        if (hands) {
          await hands.send({ image: video });
        }
      } catch (err) {
        // MediaPipe processing frame error
      } finally {
        isProcessingRef.current = false;
      }
    }

    animFrameIdRef.current = requestAnimationFrame(processFrame);
  }, []);

  const handleMediaPipeResults = useCallback(async (results: any) => {
    const { vector, hasHand } = extract126Landmarks(results);

    if (hasHand) {
      frameBufferRef.current.push(vector);
      if (frameBufferRef.current.length > 90) {
        frameBufferRef.current.shift();
      }
      setGestureState('COLLECTING');
    } else {
      if (frameBufferRef.current.length > 0) {
        frameBufferRef.current.shift();
      }
      if (frameBufferRef.current.length === 0) {
        setGestureState('IDLE');
        consecutivePredictionsRef.current.clear();
      }
    }

    const now = Date.now();
    // Run inference every 120ms if at least 15 frames are collected
    if (frameBufferRef.current.length >= 15 && now - lastInferenceTimeRef.current > 120) {
      lastInferenceTimeRef.current = now;
      setGestureState('INFERENCE');

      const sequence60 = resampleSequenceTo60(frameBufferRef.current);
      const prediction = await sambhavModel2Engine.predictSequence(sequence60);

      if (prediction.isReliable && prediction.label !== 'NO_ACTIVE_SIGN') {
        setCurrentGesture(prediction.phrase || prediction.label);
        setConfidence(prediction.confidence);
        setTranslatedText(prediction.phrase || prediction.label);

        // Count consecutive occurrences for commit stability
        const prevCount = consecutivePredictionsRef.current.get(prediction.label) || 0;
        const newCount = prevCount + 1;
        consecutivePredictionsRef.current.set(prediction.label, newCount);

        // Commit if sustained over 2 consecutive windows and not duplicate within 1.2s
        if (newCount >= 2) {
          const isSameAsLast = lastCommittedLabelRef.current === prediction.label;
          const timeSinceLastCommit = now - lastCommitTimeRef.current;

          if (!isSameAsLast || timeSinceLastCommit > 1200) {
            lastCommittedLabelRef.current = prediction.label;
            lastCommitTimeRef.current = now;

            const committed: SambhavCommittedEvent = {
              text: prediction.phrase || prediction.label,
              confidence: prediction.confidence,
              sequenceId: now,
              timestamp: now,
              eventId: `sambhav-${now}-${Math.random().toString(36).substring(2, 6)}`,
            };
            setCommittedSign(committed);
            setGestureState('COMMITTED');
          }
        }
      } else {
        consecutivePredictionsRef.current.clear();
      }
    }
  }, []);

  const startRecognition = useCallback(
    async (videoElement: HTMLVideoElement | null) => {
      if (!videoElement) return;
      videoElementRef.current = videoElement;
      setIsRecognizing(true);
      frameBufferRef.current = [];

      try {
        const hands = await getSharedHandsInstance();
        if (hands) {
          hands.onResults(handleMediaPipeResults);
        }
        if (animFrameIdRef.current) {
          cancelAnimationFrame(animFrameIdRef.current);
        }
        animFrameIdRef.current = requestAnimationFrame(processFrame);
      } catch (e) {
        console.warn('[WEBRTC Sambhav Model 2] Start recognition warning:', e);
      }
    },
    [handleMediaPipeResults, processFrame]
  );

  const stopRecognition = useCallback((_reason?: string) => {
    setIsRecognizing(false);
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    frameBufferRef.current = [];
    setCurrentGesture(null);
    setConfidence(0);
    setGestureState('IDLE');
  }, []);

  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  return {
    isRecognizing,
    currentGesture,
    confidence,
    translatedText,
    committedSign,
    gestureState,
    isModelOnline,
    startRecognition,
    stopRecognition,
  };
}
