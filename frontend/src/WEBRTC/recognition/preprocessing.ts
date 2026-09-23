/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FrameLandmarks126 } from '../types/recognition';

export const SAMBHAV_SEQUENCE_LENGTH = 60;
export const SAMBHAV_NUM_FEATURES = 126;

// Dynamic MediaPipe Hands loader with CDN fallback
export async function loadMediaPipeHands(): Promise<any> {
  if (typeof window === 'undefined') return null;
  if ((window as any).Hands) return (window as any).Hands;

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="mediapipe/hands"]');
    if (existing && (window as any).Hands) {
      return resolve((window as any).Hands);
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve((window as any).Hands);
    script.onerror = () => {
      const fallbackScript = document.createElement('script');
      fallbackScript.src = 'https://unpkg.com/@mediapipe/hands@0.4.1675469240/hands.js';
      fallbackScript.crossOrigin = 'anonymous';
      fallbackScript.onload = () => resolve((window as any).Hands);
      fallbackScript.onerror = () => reject(new Error('Failed to load MediaPipe Hands'));
      document.head.appendChild(fallbackScript);
    };
    document.head.appendChild(script);
  });
}

let sharedHandsInstance: any = null;
let sharedHandsPromise: Promise<any> | null = null;

export async function getSharedHandsInstance(): Promise<any> {
  if (sharedHandsInstance) return sharedHandsInstance;
  if (sharedHandsPromise) return sharedHandsPromise;

  sharedHandsPromise = (async () => {
    const HandsClass = await loadMediaPipeHands();
    if (!HandsClass) return null;

    const instance = new HandsClass({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
    });

    instance.setOptions({
      maxNumHands: 2,
      modelComplexity: 0,
      minDetectionConfidence: 0.4,
      minTrackingConfidence: 0.4,
    });

    await instance.initialize();
    sharedHandsInstance = instance;
    return instance;
  })();

  return sharedHandsPromise;
}

/**
 * Extracts 126-dimensional landmarks from MediaPipe results.
 * Left hand in index 0 (0..62), Right hand in index 1 (63..125).
 */
export function extract126Landmarks(results: any): { vector: FrameLandmarks126; hasHand: boolean } {
  const landmarks = new Array<number>(SAMBHAV_NUM_FEATURES).fill(0.0);
  let hasHand = false;

  if (results && results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    hasHand = true;
    const detected: Array<{ label: string; landmarks: any[] }> = [];

    for (let i = 0; i < results.multiHandLandmarks.length; i++) {
      const handLm = results.multiHandLandmarks[i];
      let label = 'Right';
      if (results.multiHandedness && results.multiHandedness[i]) {
        label = results.multiHandedness[i].label || 'Right';
      }
      detected.push({ label, landmarks: handLm });
    }

    // Sort so Left is index 0, Right is index 1
    detected.sort((a, b) => (a.label === 'Left' ? -1 : (b.label === 'Left' ? 1 : 0)));

    detected.slice(0, 2).forEach((hand, handIdx) => {
      const baseOffset = handIdx * 21 * 3;
      hand.landmarks.forEach((lm: any, lmIdx: number) => {
        const offset = baseOffset + lmIdx * 3;
        landmarks[offset] = lm.x;
        landmarks[offset + 1] = lm.y;
        landmarks[offset + 2] = lm.z;
      });
    });
  }

  return { vector: landmarks, hasHand };
}

/**
 * Resamples sequence of 126-dim frames to exactly 60 frames using linear temporal interpolation.
 */
export function resampleSequenceTo60(frames: FrameLandmarks126[]): number[][] {
  if (!frames || frames.length === 0) {
    return Array.from({ length: SAMBHAV_SEQUENCE_LENGTH }, () =>
      new Array(SAMBHAV_NUM_FEATURES).fill(0.0)
    );
  }

  if (frames.length === 1) {
    return Array.from({ length: SAMBHAV_SEQUENCE_LENGTH }, () => [...frames[0]]);
  }

  const indices: number[] = [];
  for (let i = 0; i < SAMBHAV_SEQUENCE_LENGTH; i++) {
    const idx = Math.round((i * (frames.length - 1)) / (SAMBHAV_SEQUENCE_LENGTH - 1));
    indices.push(idx);
  }
  return indices.map((idx) => frames[idx]);
}
