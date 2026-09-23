/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from 'react';
import type { FrameLandmarks126, SambhavGestureState, SambhavCommittedEvent, SambhavTelemetry } from '../types/recognition';
import { getSharedHandsInstance, extract126Landmarks, resampleSequenceTo60 } from './preprocessing';
import { sambhavModel2Engine } from './sambhavModel2';

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],         // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],         // Index
  [5, 9], [9, 10], [10, 11], [11, 12],    // Middle
  [9, 13], [13, 14], [14, 15], [15, 16],  // Ring
  [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [0, 17], [0, 5]                         // Palm base
];

function drawSkeletonOnCanvas(results: any) {
  const canvas = document.querySelector('canvas[data-gesture-canvas="true"]') as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!results || !results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;

  results.multiHandLandmarks.forEach((landmarks: any[], handIdx: number) => {
    let isLeft = false;
    if (results.multiHandedness && results.multiHandedness[handIdx]) {
      isLeft = results.multiHandedness[handIdx].label === 'Left';
    }
    const strokeColor = isLeft ? '#fe9832' : '#10b981';
    const jointColor = '#ffffff';

    ctx.lineWidth = 3;
    ctx.strokeStyle = strokeColor;

    // Connections
    for (const [fromIdx, toIdx] of HAND_CONNECTIONS) {
      const from = landmarks[fromIdx];
      const to = landmarks[toIdx];
      if (from && to) {
        ctx.beginPath();
        ctx.moveTo(from.x * canvas.width, from.y * canvas.height);
        ctx.lineTo(to.x * canvas.width, to.y * canvas.height);
        ctx.stroke();
      }
    }

    // Joints
    for (const lm of landmarks) {
      ctx.beginPath();
      ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = jointColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  });
}

const defaultTelemetry: SambhavTelemetry = {
  cameraActive: false,
  handsDetected: 0,
  bufferedFrames: 0,
  featureVectorDim: 126,
  slot0Features: 0,
  slot1Features: 0,
  minVal: 0,
  maxVal: 0,
  meanVal: 0,
  requestStatus: 'IDLE',
  lastLatencyMs: 0,
  recognitionSource: 'BiLSTM',
  top1Label: '',
  top1Confidence: 0,
  top2Label: '',
  top2Confidence: 0,
  margin: 0,
};

export function useSambhavModel2() {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [translatedText, setTranslatedText] = useState<string>('');
  const [committedSign, setCommittedSign] = useState<SambhavCommittedEvent | null>(null);
  const [gestureState, setGestureState] = useState<SambhavGestureState>('IDLE');
  const [isModelOnline, setIsModelOnline] = useState<boolean>(true);
  const [activeEndpoint, setActiveEndpoint] = useState<string>(sambhavModel2Engine.getEndpoint());
  const [pingLatencyMs, setPingLatencyMs] = useState<number>(15);
  const [handsDetectedCount, setHandsDetectedCount] = useState<number>(0);
  const [isCapturingManual, setIsCapturingManual] = useState<boolean>(false);
  const [captureCountdown, setCaptureCountdown] = useState<number | null>(null);
  const [telemetry, setTelemetry] = useState<SambhavTelemetry>(defaultTelemetry);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const frameBufferRef = useRef<FrameLandmarks126[]>([]);
  const isProcessingRef = useRef<boolean>(false);
  const lastInferenceTimeRef = useRef<number>(0);
  const consecutivePredictionsRef = useRef<Map<string, number>>(new Map());
  const lastCommittedLabelRef = useRef<string>('');
  const lastCommitTimeRef = useRef<number>(0);
  const isCapturingManualRef = useRef<boolean>(false);
  const manualCaptureBufferRef = useRef<FrameLandmarks126[]>([]);

  // Check health & measure latency periodically
  useEffect(() => {
    setActiveEndpoint(sambhavModel2Engine.getEndpoint());
    const runHealthCheck = () => {
      sambhavModel2Engine.checkHealth().then(({ ok, latencyMs }) => {
        setIsModelOnline(ok);
        if (latencyMs > 0) setPingLatencyMs(latencyMs);
      }).catch(() => setIsModelOnline(false));
    };

    runHealthCheck();
    const interval = setInterval(runHealthCheck, 15000);
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
      } catch {
        // Frame send error
      } finally {
        isProcessingRef.current = false;
      }
    }

    animFrameIdRef.current = requestAnimationFrame(processFrame);
  }, []);

  const handleMediaPipeResults = useCallback(async (results: any) => {
    // 1. Draw hand skeletons on any detected canvas
    drawSkeletonOnCanvas(results);

    const handsDetected = results?.multiHandLandmarks?.length || 0;
    setHandsDetectedCount(handsDetected);

    // 2. Extract 126-dim vector (Left=0, Right=1)
    const { vector, hasHand } = extract126Landmarks(results);

    // Compute basic telemetry stats
    let nonZeroCount = 0;
    let minVal = 0;
    let maxVal = 0;
    let sumVal = 0;
    for (let i = 0; i < vector.length; i++) {
      const v = vector[i];
      if (v !== 0) {
        nonZeroCount++;
        if (minVal === 0 || v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
        sumVal += v;
      }
    }
    const meanVal = nonZeroCount > 0 ? sumVal / nonZeroCount : 0;

    let slot0HasData = 0;
    let slot1HasData = 0;
    for (let i = 0; i < 63; i++) {
      if (vector[i] !== 0) { slot0HasData = 63; break; }
    }
    for (let i = 63; i < 126; i++) {
      if (vector[i] !== 0) { slot1HasData = 63; break; }
    }

    if (isCapturingManualRef.current) {
      manualCaptureBufferRef.current.push(vector);
    }

    if (hasHand) {
      frameBufferRef.current.push(vector);
      if (frameBufferRef.current.length > 90) {
        frameBufferRef.current.shift();
      }
      if (frameBufferRef.current.length < 10) {
        setGestureState('COLLECTING');
      }
    } else {
      if (frameBufferRef.current.length > 0) {
        frameBufferRef.current.shift();
      }
      if (frameBufferRef.current.length === 0) {
        setGestureState('IDLE');
        setCurrentGesture(null);
        setConfidence(0);
        consecutivePredictionsRef.current.clear();
      }
    }

    const currentBufferedCount = frameBufferRef.current.length;

    // Update live telemetry
    setTelemetry((prev) => ({
      ...prev,
      cameraActive: true,
      handsDetected,
      bufferedFrames: currentBufferedCount,
      featureVectorDim: 126,
      slot0Features: slot0HasData,
      slot1Features: slot1HasData,
      minVal,
      maxVal,
      meanVal,
    }));

    const now = Date.now();
    // Run real-time sliding window inference every 100ms when at least 10 frames are collected
    if (frameBufferRef.current.length >= 10 && now - lastInferenceTimeRef.current > 100) {
      lastInferenceTimeRef.current = now;

      setTelemetry((prev) => ({ ...prev, requestStatus: 'SENT' }));
      const startReq = performance.now();

      const sequence60 = resampleSequenceTo60(frameBufferRef.current);
      const prediction = await sambhavModel2Engine.predictSequence(sequence60);
      const latencyMs = Math.round(performance.now() - startReq);

      setTelemetry((prev) => ({
        ...prev,
        requestStatus: prediction.isReliable ? 'RECEIVED' : 'REJECTED',
        lastLatencyMs: latencyMs,
        recognitionSource: 'BiLSTM',
        top1Label: prediction.label !== 'NO_ACTIVE_SIGN' ? prediction.phrase || prediction.label : '',
        top1Confidence: prediction.confidence,
        top2Label: prediction.top2_label || '',
        top2Confidence: prediction.top2_confidence || 0,
        margin: prediction.margin || 0,
      }));

      if (prediction.isReliable && prediction.label !== 'NO_ACTIVE_SIGN') {
        const displaySign = prediction.phrase || prediction.label;
        setCurrentGesture(displaySign);
        setConfidence(prediction.confidence);
        setTranslatedText(displaySign);

        // Count consecutive occurrences for commit stability
        const prevCount = consecutivePredictionsRef.current.get(prediction.label) || 0;
        const newCount = prevCount + 1;
        consecutivePredictionsRef.current.set(prediction.label, newCount);

        // Commit if sustained over 2 consecutive windows and not duplicate within 1.0s
        if (newCount >= 2) {
          const isSameAsLast = lastCommittedLabelRef.current === prediction.label;
          const timeSinceLastCommit = now - lastCommitTimeRef.current;

          if (!isSameAsLast || timeSinceLastCommit > 1000) {
            lastCommittedLabelRef.current = prediction.label;
            lastCommitTimeRef.current = now;

            const committed: SambhavCommittedEvent = {
              text: displaySign,
              confidence: prediction.confidence,
              sequenceId: now,
              timestamp: now,
              eventId: `sambhav-${now}-${Math.random().toString(36).substring(2, 6)}`,
            };
            setCommittedSign(committed);
            setGestureState('COMMITTED');
          } else {
            setGestureState('SIGN_DETECTED');
          }
        } else {
          setGestureState('SIGN_DETECTED');
        }
      } else {
        consecutivePredictionsRef.current.clear();
        if (frameBufferRef.current.length >= 10) {
          setGestureState('DETECTING');
        }
      }
    }
  }, []);

  const start5sCapture = useCallback(() => {
    if (isCapturingManualRef.current) return;
    isCapturingManualRef.current = true;
    setIsCapturingManual(true);
    setCaptureCountdown(5);

    manualCaptureBufferRef.current = [];

    let remaining = 5;
    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(interval);
        setCaptureCountdown(null);
        setIsCapturingManual(false);
        isCapturingManualRef.current = false;

        const captured = manualCaptureBufferRef.current.length > 0
          ? manualCaptureBufferRef.current
          : frameBufferRef.current;

        if (captured.length > 0) {
          const sequence60 = resampleSequenceTo60(captured);
          setGestureState('INFERENCE');
          sambhavModel2Engine.predictSequence(sequence60).then((prediction) => {
            if (prediction.label && prediction.label !== 'NO_ACTIVE_SIGN') {
              const displaySign = prediction.phrase || prediction.label;
              setCurrentGesture(displaySign);
              setConfidence(prediction.confidence);
              setTranslatedText(displaySign);

              const now = Date.now();
              const committed: SambhavCommittedEvent = {
                text: displaySign,
                confidence: prediction.confidence,
                sequenceId: now,
                timestamp: now,
                eventId: `sambhav-5s-${now}-${Math.random().toString(36).substring(2, 6)}`,
              };
              setCommittedSign(committed);
              setGestureState('COMMITTED');
            }
          });
        }
      } else {
        setCaptureCountdown(remaining);
      }
    }, 1000);
  }, []);

  const startRecognition = useCallback(
    async (videoElement: HTMLVideoElement | null) => {
      if (!videoElement) return;
      videoElementRef.current = videoElement;
      setIsRecognizing(true);
      frameBufferRef.current = [];
      setTelemetry((prev) => ({ ...prev, cameraActive: true }));

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
    setTelemetry((prev) => ({ ...prev, cameraActive: false, bufferedFrames: 0, handsDetected: 0 }));

    // Clear canvas
    const canvas = document.querySelector('canvas[data-gesture-canvas="true"]') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
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
    activeEndpoint,
    pingLatencyMs,
    handsDetectedCount,
    isCapturingManual,
    captureCountdown,
    telemetry,
    start5sCapture,
    startRecognition,
    stopRecognition,
  };
}
