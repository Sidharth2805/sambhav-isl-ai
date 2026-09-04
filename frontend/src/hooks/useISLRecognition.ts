import { useState, useEffect, useRef, useCallback } from 'react';
import { SaanketBiLSTMClassifier, ISL_VOCABULARY } from '../utils/islModel';
import type { ISLClassifier, ISLLandmarks, ISLLandmark } from '../utils/islModel';

// Dynamic loader for MediaPipe Hands script
async function loadMediaPipeHands(): Promise<any> {
  if (typeof window === 'undefined') return null;
  if ((window as any).Hands) return (window as any).Hands;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      resolve((window as any).Hands);
    };
    script.onerror = () => {
      reject(new Error('Failed to load MediaPipe Hands from CDN'));
    };
    document.head.appendChild(script);
  });
}

// Singleton MediaPipe Hands instance cache to prevent repeated WASM/Data fetching and net::ERR_INSUFFICIENT_RESOURCES
let sharedHandsPromise: Promise<any> | null = null;
let sharedHandsInstance: any = null;

async function getSharedMediaPipeHands(): Promise<any> {
  if (sharedHandsInstance) return sharedHandsInstance;
  if (sharedHandsPromise) return sharedHandsPromise;

  sharedHandsPromise = (async () => {
    const HandsClass = await loadMediaPipeHands();
    if (!HandsClass) return null;

    const instance = new HandsClass({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
    });

    instance.setOptions({
      maxNumHands: 2,
      modelComplexity: 0,
      minDetectionConfidence: 0.35,
      minTrackingConfidence: 0.35
    });

    await instance.initialize();
    sharedHandsInstance = instance;
    return instance;
  })();

  return sharedHandsPromise;
}

export type GestureCaptureState =
  | 'IDLE'
  | 'SIGN_ACTIVE'
  | 'COLLECTING'
  | 'INFERENCE'
  | 'VALIDATED'
  | 'COMMITTED'
  | 'WAIT_FOR_SIGN_END'
  | 'DISPLAY RESULT'
  | 'READY FOR NEXT GESTURE';

export interface CommittedSignEvent {
  text: string;
  confidence: number;
  sequenceId: number;
  timestamp: number;
}

export function useISLRecognition(classifier: ISLClassifier = new SaanketBiLSTMClassifier()) {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [translatedText, setTranslatedText] = useState<string>('');
  const [committedSign, setCommittedSign] = useState<CommittedSignEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModelOnline, setIsModelOnline] = useState<boolean>(false);
  const [activeEndpoint, setActiveEndpoint] = useState<string>('');
  const [pingLatencyMs, setPingLatencyMs] = useState<number>(0);
  const [unrecognizedNotice, setUnrecognizedNotice] = useState<string | null>(null);

  const [frameCount, setFrameCount] = useState<number>(0);
  const [handsDetectedCount, setHandsDetectedCount] = useState<number>(0);
  const [gestureState, setGestureState] = useState<GestureCaptureState>('IDLE');
  const [isCapturingManual, setIsCapturingManual] = useState<boolean>(false);

  const streamRef = useRef<MediaStream | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const handsInstanceRef = useRef<any | null>(null);
  const lastSendTimeRef = useRef<number>(0);
  const lastValidTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handsDetectedCountRef = useRef<number>(0);

  // Deterministic State Machine & Fencing Refs
  const machineStateRef = useRef<GestureCaptureState>('IDLE');
  const gestureCycleIdRef = useRef<number>(0);
  const currentRequestIdRef = useRef<number>(0);
  const activeFramesAccumulatedRef = useRef<number>(0);
  const absenceFramesCountRef = useRef<number>(0);
  const recentPredictionsRef = useRef<string[]>([]);
  const isRecognizingRef = useRef<boolean>(false);

  // Draw hand skeleton connections onto the canvas
  const drawHandSkeleton = (ctx: CanvasRenderingContext2D, landmarks: ISLLandmark[], width: number, height: number, color = '#fe9832') => {
    if (!landmarks || landmarks.length < 21) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.fillStyle = '#ffffff';

    // Standard 21 MediaPipe hand connections
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17] // Palm
    ];

    // Draw connection lines
    ctx.beginPath();
    connections.forEach(([start, end]) => {
      const p1 = landmarks[start];
      const p2 = landmarks[end];
      if (p1 && p2) {
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
      }
    });
    ctx.stroke();

    // Draw landmark joint points
    landmarks.forEach((lm) => {
      ctx.beginPath();
      ctx.arc(lm.x * width, lm.y * height, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.stroke();
    });
  };

  // Stop recognition and release camera tracks
  const stopRecognition = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    handsInstanceRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoElementRef.current) {
      videoElementRef.current.srcObject = null;
      videoElementRef.current = null;
    }

    // Clear overlay canvas
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    isRecognizingRef.current = false;
    machineStateRef.current = 'IDLE';
    currentRequestIdRef.current += 1;
    activeFramesAccumulatedRef.current = 0;
    absenceFramesCountRef.current = 0;

    setIsRecognizing(false);
    setIsPaused(false);
    setCurrentGesture(null);
    setConfidence(0);
    setTranslatedText('');
    setCommittedSign(null);
    setGestureState('IDLE');
  }, []);

  const pauseRecognition = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeRecognition = useCallback(() => {
    setIsPaused(false);
  }, []);

  useEffect(() => {
    classifier.initialize().then(() => {
      setIsModelOnline(classifier.getIsOnline());
      if ((classifier as any).getActiveEndpoint) {
        setActiveEndpoint((classifier as any).getActiveEndpoint());
      }
      if ((classifier as any).getLastPingMs) {
        setPingLatencyMs((classifier as any).getLastPingMs());
      }
    });
  }, [classifier]);

  const startRecognition = useCallback(async (targetVideo?: HTMLVideoElement | null) => {
    let videoElement = targetVideo || videoElementRef.current;
    if (!videoElement && typeof document !== 'undefined') {
      videoElement = (document.querySelector('video[data-self-view="true"]') ||
                     document.querySelector('div[data-self-view="true"] video') ||
                     document.querySelector('video[data-isl-camera="true"]') ||
                     document.querySelector('video:not([data-remote="true"])') ||
                     document.querySelector('video')) as HTMLVideoElement;
    }

    if (!videoElement) {
      setError('Video element reference is null.');
      return;
    }

    if (isRecognizingRef.current && videoElementRef.current === videoElement) {
      return;
    }

    isRecognizingRef.current = true;
    setError(null);
    videoElementRef.current = videoElement;
    lastValidTimeRef.current = performance.now();

    try {
      await classifier.initialize();
      setIsModelOnline(classifier.getIsOnline());
      if ((classifier as any).getActiveEndpoint) {
        setActiveEndpoint((classifier as any).getActiveEndpoint());
      }
      if ((classifier as any).getLastPingMs) {
        setPingLatencyMs((classifier as any).getLastPingMs());
      }

      if (videoElement.srcObject) {
        streamRef.current = videoElement.srcObject as MediaStream;
        if (videoElement.paused) {
          await videoElement.play().catch(() => {});
        }
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640, max: 640 },
            height: { ideal: 480, max: 480 },
            frameRate: { ideal: 30, max: 30 },
            facingMode: 'user'
          },
          audio: false,
        });

        streamRef.current = stream;
        videoElement.srcObject = stream;
        await videoElement.play().catch(() => {});
      }

      setIsRecognizing(true);
      setIsPaused(false);

      const hands = await getSharedMediaPipeHands();

      if (hands) {
        hands.onResults(async (results: any) => {
          if (isPaused) return;

          const detectedCount = results.multiHandLandmarks?.length || 0;

          if (handsDetectedCountRef.current !== detectedCount) {
            handsDetectedCountRef.current = detectedCount;
            setHandsDetectedCount(detectedCount);
          }

          const vid = videoElementRef.current;
          let canvas = canvasRef.current;
          if (!canvas || !document.body.contains(canvas)) {
            canvas = (vid?.parentElement?.querySelector('canvas[data-gesture-canvas="true"]') || document.querySelector('canvas[data-gesture-canvas="true"]')) as HTMLCanvasElement;
            canvasRef.current = canvas;
          }
          
          let ctx: CanvasRenderingContext2D | null = null;
          if (canvas && canvas.getContext) {
            ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
          }

          const landmarksPayload: ISLLandmarks = {
            rightHand: [],
            leftHand: []
          };

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            for (let i = 0; i < Math.min(results.multiHandLandmarks.length, 2); i++) {
              const rawLandmarks = results.multiHandLandmarks[i];
              const handednessObj = results.multiHandedness && results.multiHandedness[i];
              const handLabel = handednessObj?.label || (i === 0 ? 'Left' : 'Right');

              const handPoints: ISLLandmark[] = rawLandmarks.map((p: any) => ({
                x: p.x,
                y: p.y,
                z: p.z
              }));

              if (handLabel === 'Left') {
                landmarksPayload.leftHand = handPoints;
                if (ctx && canvas) {
                  drawHandSkeleton(ctx, handPoints, (canvas as HTMLCanvasElement).width, (canvas as HTMLCanvasElement).height, '#fe9832');
                }
              } else {
                landmarksPayload.rightHand = handPoints;
                if (ctx && canvas) {
                  drawHandSkeleton(ctx, handPoints, (canvas as HTMLCanvasElement).width, (canvas as HTMLCanvasElement).height, '#059669');
                }
              }
            }
          }

          if ((classifier as any).addFrame) {
            (classifier as any).addFrame(landmarksPayload);
          }

          if (isCapturingManualRef.current) {
            frameCountRef.current += 1;
            setFrameCount(frameCountRef.current);
            return;
          }

          // Strict Recognition Lifecycle State Machine:
          // IDLE -> SIGN_ACTIVE -> COLLECTING -> INFERENCE -> VALIDATED -> COMMITTED -> WAIT_FOR_SIGN_END -> IDLE
          const hasHandsInFrame = !!(landmarksPayload.leftHand?.length || landmarksPayload.rightHand?.length);
          const currentState = machineStateRef.current;
          const now = performance.now();

          if (!hasHandsInFrame) {
            absenceFramesCountRef.current += 1;
            if (absenceFramesCountRef.current >= 12) {
              if (currentState !== 'IDLE') {
                machineStateRef.current = 'IDLE';
                setGestureState('IDLE');
                currentRequestIdRef.current += 1;
                activeFramesAccumulatedRef.current = 0;
              }
              if (now - lastValidTimeRef.current > 4000) {
                setCurrentGesture(null);
                setConfidence(0);
                setTranslatedText('');
              }
            }
            return;
          }

          // Hands are in frame: reset absence frame counter
          absenceFramesCountRef.current = 0;

          if (currentState === 'IDLE') {
            gestureCycleIdRef.current += 1;
            activeFramesAccumulatedRef.current = 1;
            machineStateRef.current = 'COLLECTING';
            setGestureState('COLLECTING');
            return;
          }

          if (currentState === 'COLLECTING') {
            activeFramesAccumulatedRef.current += 1;
            setFrameCount(activeFramesAccumulatedRef.current);

            // Collect genuine gesture window: ~45 frames (1.5 seconds at 30 FPS)
            if (activeFramesAccumulatedRef.current >= 45) {
              machineStateRef.current = 'INFERENCE';
              setGestureState('INFERENCE');

              const thisReqId = ++currentRequestIdRef.current;
              const thisCycleId = gestureCycleIdRef.current;

              if (classifier && (classifier as any).evaluateBuffer) {
                (classifier as any).evaluateBuffer({ requestId: thisReqId, gestureCycleId: thisCycleId })
                  .then((inf: any) => {
                    setIsModelOnline(!!inf?.isRealModel);

                    // Dual ID Fencing: Ignore response if user returned to IDLE or new cycle started
                    if (thisReqId !== currentRequestIdRef.current || thisCycleId !== gestureCycleIdRef.current) {
                      console.log(`[Recognition] Discarded stale response for req=${thisReqId} cycle=${thisCycleId} (current: req=${currentRequestIdRef.current}, cycle=${gestureCycleIdRef.current})`);
                      return;
                    }

                    const isConfidenceValid = (inf?.confidence || 0) >= 0.40;
                    const isMarginValid = (inf?.margin ?? 1.0) >= 0.08;
                    const isGestureValid = !!inf?.gesture &&
                      inf.gesture !== 'G_UNKNOWN' &&
                      inf.gesture !== 'NO_HANDS' &&
                      inf.gesture !== 'UNKNOWN' &&
                      inf.gesture !== 'NO_ACTIVE_SIGN' &&
                      inf.label !== 'NO_ACTIVE_SIGN';

                    if (isGestureValid && isConfidenceValid && isMarginValid && inf.isRealModel) {
                      lastValidTimeRef.current = performance.now();
                      setUnrecognizedNotice(null);

                      const label = inf.label || inf.gesture;
                      recentPredictionsRef.current.push(label);
                      if (recentPredictionsRef.current.length > 3) {
                        recentPredictionsRef.current.shift();
                      }

                      // Temporal majority vote
                      const counts: Record<string, number> = {};
                      recentPredictionsRef.current.forEach((l) => { counts[l] = (counts[l] || 0) + 1; });
                      const smoothedLabel = Object.keys(counts).reduce((a, b) => (counts[a] >= counts[b] ? a : b), label);
                      const phrase = inf.phrase || ISL_VOCABULARY[smoothedLabel] || smoothedLabel;

                      console.log(`[Recognition] cycle=${thisCycleId} req=${thisReqId} gate=PASS top1=${smoothedLabel} conf=${(inf.confidence || 0).toFixed(2)} top2=${inf.top2Label || ''} margin=${(inf.margin || 0).toFixed(2)} committed=YES`);

                      // Emit ONE committedSign event
                      setCommittedSign({
                        text: phrase,
                        confidence: inf.confidence || 0.95,
                        sequenceId: thisCycleId,
                        timestamp: Date.now()
                      });

                      setCurrentGesture(smoothedLabel);
                      setConfidence(inf.confidence || 0.95);
                      setTranslatedText(phrase);

                      machineStateRef.current = 'WAIT_FOR_SIGN_END';
                      setGestureState('COMMITTED');
                    } else {
                      console.log(`[Recognition] cycle=${thisCycleId} req=${thisReqId} rejected: conf=${(inf?.confidence || 0).toFixed(2)} margin=${(inf?.margin || 0).toFixed(2)} label=${inf?.label}`);
                      machineStateRef.current = 'IDLE';
                      setGestureState('IDLE');
                    }
                  })
                  .catch((err: any) => {
                    console.error('[Sambhav ML] Inference error:', err);
                    machineStateRef.current = 'IDLE';
                    setGestureState('IDLE');
                  });
              }
            }
            return;
          }

          if (currentState === 'WAIT_FOR_SIGN_END') {
            // Latch active: While the sign is held, DO NOT trigger new inferences or spam duplicate tokens
            return;
          }
        });

        handsInstanceRef.current = hands;
      }

      // 5. Continuous frame processing loop at native 30 FPS
      let isProcessingFrame = false;

      const processLoop = async () => {
        if (!videoElementRef.current) return;

        const vid = videoElementRef.current;
        const now = performance.now();

        if (!isPaused && handsInstanceRef.current && vid.videoWidth > 0 && vid.videoHeight > 0 && !isProcessingFrame && now - lastSendTimeRef.current >= 33) {
          lastSendTimeRef.current = now;
          isProcessingFrame = true;
          try {
            await handsInstanceRef.current.send({ image: vid });
          } catch {
            // Frame processing catch
          } finally {
            isProcessingFrame = false;
          }
        }

        animFrameIdRef.current = requestAnimationFrame(processLoop);
      };

      animFrameIdRef.current = requestAnimationFrame(processLoop);

    } catch (err: any) {
      console.error('[Sambhav ML] Camera capture error:', err);
      const friendlyErr = err?.name === 'NotAllowedError' || err?.message?.includes('Permission denied')
        ? 'Camera permission denied. Please allow camera access in browser settings.'
        : 'Failed to access camera. Please verify your camera device is available.';
      setError(friendlyErr);
      stopRecognition();
    }
  }, [classifier, isPaused, stopRecognition]);

  useEffect(() => {
    return () => {
      stopRecognition();
    };
  }, [stopRecognition]);

  const [captureCountdown, setCaptureCountdown] = useState<number | null>(null);
  const countdownTimerRef = useRef<any>(null);
  const isCapturingManualRef = useRef<boolean>(false);
  const frameCountRef = useRef<number>(0);

  const start5sCapture = useCallback(() => {
    if (classifier && (classifier as any).clearBuffer) {
      (classifier as any).clearBuffer();
    }
    frameCountRef.current = 0;
    setFrameCount(0);
    setCurrentGesture(null);
    setConfidence(0);
    setTranslatedText('');
    setUnrecognizedNotice(null);

    isCapturingManualRef.current = true;
    setIsCapturingManual(true);
    setGestureState('COLLECTING');
    setCaptureCountdown(5);

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    let secondsLeft = 5;
    countdownTimerRef.current = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
        setCaptureCountdown(null);
        isCapturingManualRef.current = false;
        setIsCapturingManual(false);
        setGestureState('INFERENCE');

        const testReqId = ++currentRequestIdRef.current;
        const testCycleId = ++gestureCycleIdRef.current;

        if (classifier && (classifier as any).evaluateBuffer) {
          (classifier as any).evaluateBuffer({ requestId: testReqId, gestureCycleId: testCycleId }).then((inf: any) => {
            if (inf && inf.gesture && inf.gesture !== 'NO_ACTIVE_SIGN' && inf.gesture !== 'NO_HANDS' && inf.gesture !== 'UNKNOWN') {
              const label = inf.label || inf.gesture;
              const phrase = inf.phrase || ISL_VOCABULARY[label] || label;
              setCurrentGesture(label);
              setConfidence(inf.confidence || 0.95);
              setTranslatedText(phrase);
              setCommittedSign({
                text: phrase,
                confidence: inf.confidence || 0.95,
                sequenceId: testCycleId,
                timestamp: Date.now()
              });
              setGestureState('DISPLAY RESULT');
              setUnrecognizedNotice(null);
              lastValidTimeRef.current = performance.now();
            } else {
              setUnrecognizedNotice('No sign recognized — please perform your sign clearly in camera view and test again.');
              setGestureState('READY FOR NEXT GESTURE');
            }
          }).catch((err: any) => {
            console.error('[Sambhav ML] Inference error on 5s capture:', err);
            setUnrecognizedNotice('ML service is unreachable. Please verify Python ML service is running on port 8000.');
            setGestureState('READY FOR NEXT GESTURE');
          });
        }
      } else {
        setCaptureCountdown(secondsLeft);
      }
    }, 1000);
  }, [classifier]);

  return {
    isRecognizing,
    isPaused,
    currentGesture,
    confidence,
    translatedText,
    committedSign,
    error,
    unrecognizedNotice,
    frameCount,
    onResultsCount: frameCount,
    handsDetectedCount,
    gestureState,
    isModelOnline,
    activeEndpoint,
    pingLatencyMs,
    isCapturingManual,
    captureCountdown,
    start5sCapture,
    start3sCapture: start5sCapture,
    start5sTestCapture: start5sCapture,
    startRecognition,
    pauseRecognition,
    resumeRecognition,
    stopRecognition,
  };
}


