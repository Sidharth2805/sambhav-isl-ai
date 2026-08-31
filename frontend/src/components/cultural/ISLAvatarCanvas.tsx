import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// @ts-ignore
import * as alphabets from '../../services/avatar/Animations/alphabets';
// @ts-ignore
import * as words from '../../services/avatar/Animations/words';
// @ts-ignore
import { defaultPose } from '../../services/avatar/Animations/defaultPose';

export interface ISLAvatarCanvasRef {
  signText: (text: string) => void;
  playLetter: (letter: string) => void;
  pauseAnimation: () => void;
  resumeAnimation: () => void;
  resetPose: () => void;
}

interface ISLAvatarCanvasProps {
  modelPath?: string;
  speed?: number;
  pauseTimeMs?: number;
  onProgressChar?: (char: string, processedText: string) => void;
  onFinish?: () => void;
  className?: string;
}

/**
 * 3D ISL Avatar Canvas Renderer (Avatar-Realtime Engine)
 *
 * Continuous 60fps WebGL render loop ensuring the avatar is 100% visible on screen at all times,
 * even when idle, paused, or transitioning speeds.
 */
export const ISLAvatarCanvas = forwardRef<ISLAvatarCanvasRef, ISLAvatarCanvasProps>(({
  modelPath = '/models/ybot.glb',
  speed = 1.0,
  pauseTimeMs = 400,
  onProgressChar,
  onFinish,
  className = '',
}, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState<string | null>(null);

  // Dynamic Refs for Speed & Pause Duration
  const speedMultiplierRef = useRef<number>(speed);
  const pauseTimeMsRef = useRef<number>(pauseTimeMs);
  const isPausedRef = useRef<boolean>(false);
  const pauseEndTimeRef = useRef<number>(0);

  useEffect(() => {
    speedMultiplierRef.current = speed;
    pauseTimeMsRef.current = pauseTimeMs;
    if (pauseEndTimeRef.current > performance.now()) {
      pauseEndTimeRef.current = performance.now() + pauseTimeMs;
    }
  }, [speed, pauseTimeMs]);

  // Mutable state container matching Avatar-realtime structure
  const avatarStateRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    avatar?: THREE.Object3D;
    animations: any[];
    characters: string[];
    pending: boolean;
    processedText: string;
    animate: () => void;
    currentAnimationReq?: number;
  }>({
    animations: [],
    characters: [],
    pending: false,
    processedText: '',
    animate: () => {},
  });

  // Initialize Three.js Scene, Camera, Lighting & Load GLTF Avatar Mesh (ONLY on modelPath change)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setIsLoading(true);
    setHasError(null);

    const state = avatarStateRef.current;
    state.pending = false;
    isPausedRef.current = false;
    pauseEndTimeRef.current = 0;
    state.animations = [];
    state.characters = [];
    state.processedText = '';

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    state.scene = scene;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;
    const aspect = width / height;

    const camera = new THREE.PerspectiveCamera(28, aspect, 0.1, 1000);
    camera.position.set(0, 1.1, 2.2);
    camera.lookAt(0, 0.85, 0);
    state.camera = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    state.renderer = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xfe9832, 0.8);
    rimLight.position.set(-2, 2, -2);
    scene.add(rimLight);

    // 4. Continuous 60fps Animation & Render Loop
    state.animate = () => {
      if (isPausedRef.current) {
        state.pending = false;
        return;
      }

      state.pending = true;
      state.currentAnimationReq = requestAnimationFrame(state.animate);

      // Process animation steps if queued
      if (state.animations.length > 0) {
        const now = performance.now();
        if (now >= pauseEndTimeRef.current) {
          if (state.animations[0] && state.animations[0].length) {
            if (state.animations[0][0] === 'add-text') {
              const addedChar = state.animations[0][1];
              state.processedText += addedChar;
              if (onProgressChar) {
                onProgressChar(addedChar.trim(), state.processedText);
              }
              state.animations.shift();
            } else {
              // Dynamic step speed based on current multiplier
              const stepSpeed = 0.08 * speedMultiplierRef.current;

              for (let i = 0; i < state.animations[0].length; ) {
                const [boneName, action, axis, limit, sign] = state.animations[0][i];
                const bone = state.avatar?.getObjectByName(boneName);
                if (bone) {
                  if (sign === '+' && (bone as any)[action][axis] < limit) {
                    (bone as any)[action][axis] += stepSpeed;
                    (bone as any)[action][axis] = Math.min((bone as any)[action][axis], limit);
                    i++;
                  } else if (sign === '-' && (bone as any)[action][axis] > limit) {
                    (bone as any)[action][axis] -= stepSpeed;
                    (bone as any)[action][axis] = Math.max((bone as any)[action][axis], limit);
                    i++;
                  } else {
                    state.animations[0].splice(i, 1);
                  }
                } else {
                  state.animations[0].splice(i, 1);
                }
              }
            }
          } else {
            // Current pose chunk completed. Schedule non-blocking timestamp pause.
            const delay = pauseTimeMsRef.current;
            pauseEndTimeRef.current = performance.now() + delay;
            state.animations.shift();
            if (state.animations.length === 0 && onFinish) {
              onFinish();
            }
          }
        }
      }

      // ALWAYS RENDER SCENE TO CANVAS
      if (state.renderer && state.scene && state.camera) {
        state.renderer.render(state.scene, state.camera);
      }
    };

    // 5. Load GLTF Avatar Model
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        gltf.scene.traverse((child) => {
          if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
            child.frustumCulled = false;
          }
        });

        gltf.scene.position.set(0, -0.4, 0);
        state.avatar = gltf.scene;
        scene.add(gltf.scene);

        defaultPose(state);
        setIsLoading(false);

        // Start continuous rendering loop
        if (!state.currentAnimationReq) {
          state.animate();
        }
      },
      undefined,
      (err) => {
        console.error('[ISLAvatarCanvas] Error loading GLTF model:', err);
        setHasError('The ISL avatar model is temporarily unavailable. Please try again.');
        setIsLoading(false);
      }
    );

    // 6. Resize Observer for Dynamic Layout Resizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && state.renderer && state.camera) {
          state.camera.aspect = width / height;
          state.camera.updateProjectionMatrix();
          state.renderer.setSize(width, height);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (state.currentAnimationReq) cancelAnimationFrame(state.currentAnimationReq);
      if (state.renderer && state.renderer.domElement) {
        state.renderer.dispose();
      }
    };
  }, [modelPath]); // ONLY modelPath triggers scene reload!

  // Queue text animations helper
  const queueTextAnimations = (textValue: string) => {
    const state = avatarStateRef.current;
    if (!state.avatar) return;

    const str = textValue.toUpperCase();
    const strWords = str.split(/\s+/).filter(Boolean);

    pauseEndTimeRef.current = 0;
    state.animations = [];
    state.processedText = '';

    for (const word of strWords) {
      if ((words as any)[word]) {
        state.animations.push(['add-text', word + ' ']);
        (words as any)[word](state);
      } else {
        for (const [index, ch] of word.split('').entries()) {
          if (index === word.length - 1) {
            state.animations.push(['add-text', ch + ' ']);
          } else {
            state.animations.push(['add-text', ch]);
          }

          if (typeof (alphabets as any)[ch] === 'function') {
            (alphabets as any)[ch](state);
          } else {
            defaultPose(state);
          }
        }
      }
    }

    if (isPausedRef.current) {
      isPausedRef.current = false;
    }

    if (!state.currentAnimationReq) {
      state.animate();
    }
  };

  // Expose Imperative Methods to Ref
  useImperativeHandle(ref, () => ({
    signText: (text: string) => {
      queueTextAnimations(text);
    },
    playLetter: (letter: string) => {
      const state = avatarStateRef.current;
      isPausedRef.current = false;
      pauseEndTimeRef.current = 0;
      state.animations = [];
      state.processedText = '';

      const upper = letter.toUpperCase().trim();
      if (upper && (alphabets as any)[upper]) {
        state.animations.push(['add-text', upper]);
        (alphabets as any)[upper](state);
      } else {
        defaultPose(state);
      }

      if (!state.currentAnimationReq) {
        state.animate();
      }
    },
    pauseAnimation: () => {
      isPausedRef.current = true;
      const state = avatarStateRef.current;
      if (state.currentAnimationReq) {
        cancelAnimationFrame(state.currentAnimationReq);
        state.currentAnimationReq = undefined;
      }
      state.pending = false;
    },
    resumeAnimation: () => {
      const state = avatarStateRef.current;
      isPausedRef.current = false;
      if (!state.currentAnimationReq) {
        state.animate();
      }
    },
    resetPose: () => {
      isPausedRef.current = false;
      pauseEndTimeRef.current = 0;
      const state = avatarStateRef.current;
      state.animations = [];
      state.processedText = '';
      if (state.avatar) defaultPose(state);
      if (!state.currentAnimationReq) {
        state.animate();
      }
    },
  }));

  return (
    <div className={`relative w-full h-full min-h-[300px] flex items-center justify-center ${className}`}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 bg-[#050b16]/95 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center gap-3 rounded-2xl">
          <div className="w-10 h-10 border-3 border-[#fe9832] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-white tracking-wide">Loading 3D ISL Avatar Mesh...</span>
        </div>
      )}

      {/* Error Overlay */}
      {hasError && (
        <div className="absolute inset-0 z-20 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center gap-2 text-red-200 rounded-2xl">
          <span className="material-symbols-outlined text-3xl">warning</span>
          <span className="text-xs font-bold">{hasError}</span>
        </div>
      )}

      {/* Three.js Render Target Canvas Container */}
      <div ref={containerRef} className="w-full h-full min-h-[300px] flex items-center justify-center overflow-hidden" />
    </div>
  );
});

ISLAvatarCanvas.displayName = 'ISLAvatarCanvas';
export default ISLAvatarCanvas;
