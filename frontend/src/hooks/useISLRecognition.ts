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
      minDetectionConfidence: 0.4,
      minTrackingConfidence: 0.4
    });

    await instance.initialize();
    sharedHandsInstance = instance;
    return instance;
  })();

  return sharedHandsPromise;
}

export type GestureCaptureState =
  | 'WAITING'
  | 'HAND DETECTED'
  | 'COLLECTING'
  | 'INFERENCE'
  | 'DISPLAY RESULT'
  | 'READY FOR NEXT GESTURE';

export function useISLRecognition(classifier: ISLClassifier = new SaanketBiLSTMClassifier()) {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [translatedText, setTranslatedText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isModelOnline, setIsModelOnline] = useState<boolean>(false);
  const [unrecognizedNotice, setUnrecognizedNotice] = useState<string | null>(null);

  const [frameCount, setFrameCount] = useState<number>(0);
  const [handsDetectedCount, setHandsDetectedCount] = useState<number>(0);
  const [gestureState, setGestureState] = useState<GestureCaptureState>('WAITING');
  const [isCapturingManual, setIsCapturingManual] = useState<boolean>(false);

  const streamRef = useRef<MediaStream | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const handsInstanceRef = useRef<any | null>(null);
  const lastSendTimeRef = useRef<number>(0);
  const lastProcessedTimeRef = useRef<number>(0);
  const isInferenceBusyRef = useRef<boolean>(false);
  const lastValidTimeRef = useRef<number>(0);
  const recentPredictionsRef = useRef<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handsDetectedCountRef = useRef<number>(0);
  const gestureStateRef = useRef<GestureCaptureState>('WAITING');

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
    setIsRecognizing(false);
    setIsPaused(false);
    setCurrentGesture(null);
    setConfidence(0);
    setTranslatedText('');
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
    });
  }, []);

  const isRecognizingRef = useRef<boolean>(false);

  const startRecognition = useCallback(async (targetVideo?: HTMLVideoElement | null) => {
    let videoElement = targetVideo || videoElementRef.current;
    if (!videoElement && typeof document !== 'undefined') {
      videoElement = document.querySelector('video');
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
      // 1. Initialize classifier
      await classifier.initialize();
      setIsModelOnline(classifier.getIsOnline());

      // 2. Attach or request camera stream
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

      // 3. Obtain shared MediaPipe Hands singleton instance (loads WASM/Data ONLY ONCE)
      const hands = await getSharedMediaPipeHands();

      if (hands) {
        // 4. Handle MediaPipe landmark results
        hands.onResults(async (results: any) => {
          if (isPaused) return;

          const detectedCount = results.multiHandLandmarks?.length || 0;

          if (handsDetectedCountRef.current !== detectedCount) {
            handsDetectedCountRef.current = detectedCount;
            setHandsDetectedCount(detectedCount);
          }

          const nextState = detectedCount === 0 ? 'WAITING' : frameCount < 60 ? 'COLLECTING' : 'INFERENCE';
          if (gestureStateRef.current !== nextState) {
            gestureStateRef.current = nextState;
            setGestureState(nextState);
          }

          // Target specific camera overlay canvas efficiently
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

          // Fast non-blocking asynchronous inference at 30 FPS (33ms) matching the 30 FPS model
          const now = performance.now();
          if (now - lastProcessedTimeRef.current >= 33 && !isInferenceBusyRef.current) {
            lastProcessedTimeRef.current = now;
            isInferenceBusyRef.current = true;

            classifier.classify(landmarksPayload).then((inference) => {
              setIsModelOnline(!!inference.isRealModel);
              if (typeof inference.frameCount === 'number') {
                setFrameCount(inference.frameCount);
              }

              const hasHandsInFrame = !!(landmarksPayload.leftHand?.length || landmarksPayload.rightHand?.length);
              const isConfidenceValid = inference.confidence >= 0.40;
              const isMarginValid = (inference.margin ?? 1.0) >= 0.08;
              const isGestureValid = inference.gesture && inference.gesture !== 'G_UNKNOWN' && inference.gesture !== 'NO_HANDS' && inference.gesture !== 'UNKNOWN';

              if (hasHandsInFrame && isGestureValid && isConfidenceValid && isMarginValid && inference.isRealModel) {
                lastValidTimeRef.current = now;
                setUnrecognizedNotice(null);

                // Temporal Majority Voting Filter (smoothing over last 3 predictions)
                const label = inference.label || inference.gesture;
                recentPredictionsRef.current.push(label);
                if (recentPredictionsRef.current.length > 3) {
                  recentPredictionsRef.current.shift();
                }

                // Select most frequent prediction from voting window
                const counts: Record<string, number> = {};
                recentPredictionsRef.current.forEach((l) => { counts[l] = (counts[l] || 0) + 1; });
                const smoothedLabel = Object.keys(counts).reduce((a, b) => (counts[a] >= counts[b] ? a : b), label);

                // Duplicate Hold Protection: prevent repeated emission while holding same sign
                setCurrentGesture(smoothedLabel);
                setConfidence(inference.confidence);
                const phrase = inference.phrase || ISL_VOCABULARY[smoothedLabel] || smoothedLabel;
                setTranslatedText(phrase);
                setGestureState('DISPLAY RESULT');
                setTimeout(() => setGestureState('READY FOR NEXT GESTURE'), 600);
              } else {
                if (!hasHandsInFrame) {
                  // Clear temporal voting buffer when no hands are in frame to prevent cross-gesture contamination
                  recentPredictionsRef.current = [];
                  setConfidence(0);
                }

                if (hasHandsInFrame && now - lastValidTimeRef.current > 1500) {
                  setUnrecognizedNotice('Sign not recognized — please try signing again smoothly');
                } else {
                  setUnrecognizedNotice(null);
                }

                // Preserve recognized sign text on screen for 3 seconds so the user can read and speak it
                if (now - lastValidTimeRef.current > 3000) {
                  setCurrentGesture(null);
                  setConfidence(0);
                  setTranslatedText('');
                }
              }
            }).catch((classifyErr) => {
              console.error('[Sambhav ML] Inference error:', classifyErr);
            }).finally(() => {
              isInferenceBusyRef.current = false;
            });
          }
        });

        handsInstanceRef.current = hands;
      }

      // 5. Continuous frame processing loop at native 30 FPS (33ms) matching the 30 FPS model
      let isProcessingFrame = false;

      const processLoop = async () => {
        if (!videoElementRef.current) return;

        const vid = videoElementRef.current;
        const now = performance.now();

        // Throttle MediaPipe inputs to exact 30 FPS (every 33ms) matching the 30 FPS model
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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecognition();
    };
  }, [stopRecognition]);

  const [captureCountdown, setCaptureCountdown] = useState<number | null>(null);
  const countdownTimerRef = useRef<any>(null);

  const start5sTestCapture = useCallback(() => {
    if (classifier && (classifier as any).clearBuffer) {
      (classifier as any).clearBuffer();
    }
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
        setIsCapturingManual(false);
        setGestureState('INFERENCE');
      } else {
        setCaptureCountdown(secondsLeft);
      }
    }, 1000);
  }, [classifier]);

  const startManualCapture = useCallback(() => {
    if (classifier && (classifier as any).clearBuffer) {
      (classifier as any).clearBuffer();
    }
    setIsCapturingManual(true);
    setGestureState('COLLECTING');
  }, [classifier]);

  const stopManualCapture = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCaptureCountdown(null);
    setIsCapturingManual(false);
    setGestureState('INFERENCE');
  }, []);

  return {
    isRecognizing,
    isPaused,
    currentGesture,
    confidence,
    translatedText,
    error,
    unrecognizedNotice,
    frameCount,
    onResultsCount: frameCount,
    handsDetectedCount,
    gestureState,
    isModelOnline,
    isCapturingManual,
    captureCountdown,
    start5sTestCapture,
    startManualCapture,
    stopManualCapture,
    startRecognition,
    pauseRecognition,
    resumeRecognition,
    stopRecognition,
  };
}


