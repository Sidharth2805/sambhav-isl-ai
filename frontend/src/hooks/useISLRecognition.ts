import { useState, useEffect, useRef, useCallback } from 'react';
import { SaanketBiLSTMClassifier, ISL_VOCABULARY } from '../utils/islModel';
import type { ISLClassifier, ISLLandmarks, ISLLandmark } from '../utils/islModel';

// Dynamic loader for MediaPipe Hands script
async function loadMediaPipeHands(): Promise<any> {
  if (typeof window === 'undefined') return null;
  if ((window as any).Hands) return (window as any).Hands;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
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

export function useISLRecognition(classifier: ISLClassifier = new SaanketBiLSTMClassifier()) {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [translatedText, setTranslatedText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isModelOnline, setIsModelOnline] = useState<boolean>(false);

  const streamRef = useRef<MediaStream | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const handsInstanceRef = useRef<any | null>(null);
  const lastProcessedTimeRef = useRef<number>(0);

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

  // Stop recognition and release camera tracks & MediaPipe
  const stopRecognition = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    if (handsInstanceRef.current) {
      try {
        handsInstanceRef.current.close();
      } catch {
        // Ignore close error
      }
      handsInstanceRef.current = null;
    }

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

  const startRecognition = useCallback(async (videoElement: HTMLVideoElement | null) => {
    if (!videoElement) {
      setError('Video element reference is null.');
      return;
    }

    setError(null);
    videoElementRef.current = videoElement;

    try {
      // 1. Initialize classifier
      await classifier.initialize();

      // 2. Attach or request camera stream
      if (videoElement.srcObject) {
        streamRef.current = videoElement.srcObject as MediaStream;
        if (videoElement.paused) {
          await videoElement.play().catch(() => {});
        }
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        });

        streamRef.current = stream;
        videoElement.srcObject = stream;
        await videoElement.play().catch(() => {});
      }

      setIsRecognizing(true);
      setIsPaused(false);

      // 3. Load & Initialize MediaPipe Hands
      const HandsClass = await loadMediaPipeHands();
      let hands: any = null;

      if (HandsClass) {
        hands = new HandsClass({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        // 4. Handle MediaPipe landmark results
        hands.onResults(async (results: any) => {
          if (isPaused) return;

          // Target specific camera overlay canvas rather than Three.js avatar canvas
          const vid = videoElementRef.current;
          const canvas = vid?.parentElement?.querySelector('canvas') || document.querySelector('canvas[data-gesture-canvas="true"]');
          let ctx: CanvasRenderingContext2D | null = null;
          if (canvas) {
            ctx = (canvas as HTMLCanvasElement).getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, (canvas as HTMLCanvasElement).width, (canvas as HTMLCanvasElement).height);
            }
          }

          const landmarksPayload: ISLLandmarks = {
            rightHand: [],
            leftHand: []
          };

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            results.multiHandLandmarks.forEach((lms: any[], idx: number) => {
              const handedness = results.multiHandedness?.[idx]?.label || (idx === 0 ? 'Right' : 'Left');
              const handPoints: ISLLandmark[] = lms.map(p => ({ x: p.x, y: p.y, z: p.z }));

              if (handedness === 'Right' || idx === 0) {
                landmarksPayload.rightHand = handPoints;
                if (ctx && canvas) {
                  drawHandSkeleton(ctx, handPoints, (canvas as HTMLCanvasElement).width, (canvas as HTMLCanvasElement).height, '#fe9832');
                }
              } else {
                landmarksPayload.leftHand = handPoints;
                if (ctx && canvas) {
                  drawHandSkeleton(ctx, handPoints, (canvas as HTMLCanvasElement).width, (canvas as HTMLCanvasElement).height, '#059669');
                }
              }
            });
          }

          // Throttle inference: classify ~10 FPS (every 100ms)
          const now = performance.now();
          if (now - lastProcessedTimeRef.current >= 100) {
            lastProcessedTimeRef.current = now;

            try {
              const inference = await classifier.classify(landmarksPayload);
              setIsModelOnline(!!inference.isRealModel);

              if (inference.gesture && inference.confidence >= 0.40 && inference.gesture !== 'G_UNKNOWN' && inference.gesture !== 'NO_HANDS') {
                setCurrentGesture(inference.label || inference.gesture);
                setConfidence(inference.confidence);
                const phrase = inference.phrase || ISL_VOCABULARY[inference.gesture] || inference.gesture;
                setTranslatedText(phrase);
              } else {
                setCurrentGesture(null);
                setConfidence(0);
                setTranslatedText('');
              }
            } catch (classifyErr) {
              console.error('[Sambhav ML] Inference error:', classifyErr);
            }
          }
        });

        handsInstanceRef.current = hands;
      }

      // 5. Continuous frame processing loop with frame-in-flight guard to prevent browser freezing
      let isProcessingFrame = false;

      const processLoop = async () => {
        if (!videoElementRef.current) return;

        const vid = videoElementRef.current;
        if (!isPaused && handsInstanceRef.current && vid.videoWidth > 0 && vid.videoHeight > 0 && !isProcessingFrame) {
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

  return {
    isRecognizing,
    isPaused,
    currentGesture,
    confidence,
    translatedText,
    error,
    isModelOnline,
    startRecognition,
    pauseRecognition,
    resumeRecognition,
    stopRecognition,
  };
}


