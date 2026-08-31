import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// @ts-ignore
import * as alphabets from '../../services/avatar/Animations/alphabets';
// @ts-ignore
import { defaultPose } from '../../services/avatar/Animations/defaultPose';

export interface ISLAvatarCanvasRef {
  playLetter: (letter: string, speedMultiplier?: number) => void;
  resetPose: () => void;
}

interface ISLAvatarCanvasProps {
  modelPath?: string;
  activeLetter?: string | null;
  speed?: number;
  className?: string;
}

/**
 * 3D ISL Avatar Canvas Renderer
 *
 * Uses Three.js & GLTFLoader to render the 3D Mixamo avatar mesh (YBot/XBot).
 * Translates English character inputs ('A'-'Z') into real-time ISL bone rotations.
 */
export const ISLAvatarCanvas = forwardRef<ISLAvatarCanvasRef, ISLAvatarCanvasProps>(({
  modelPath = '/models/ybot.glb',
  activeLetter = null,
  speed = 0.12,
  className = '',
}, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState<string | null>(null);

  // Mutable animation state container matching avatar-realtime structure
  const avatarRef = useRef<{
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    avatar?: THREE.Object3D;
    animations: any[];
    characters: string[];
    pending: boolean;
    flag: boolean;
    animate: () => void;
    currentAnimationReq?: number;
  }>({
    animations: [],
    characters: [],
    pending: false,
    flag: false,
    animate: () => {},
  });

  // Initialize Three.js Scene, Camera, Lighting & GLTF Avatar Mesh
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setIsLoading(true);
    setHasError(null);

    const state = avatarRef.current;
    state.flag = false;
    state.pending = false;
    state.animations = [];
    state.characters = [];

    // Scene & Camera
    const scene = new THREE.Scene();
    state.scene = scene;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;
    const aspect = width / height;

    const camera = new THREE.PerspectiveCamera(30, aspect, 0.1, 1000);
    camera.position.set(0, 1.35, 1.65);
    camera.lookAt(0, 1.1, 0);
    state.camera = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    state.renderer = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0xfe9832, 0.6);
    backLight.position.set(-2, 2, -2);
    scene.add(backLight);

    // Animation Loop Function
    state.animate = () => {
      if (state.animations.length === 0) {
        state.pending = false;
        if (state.renderer && state.scene && state.camera) {
          state.renderer.render(state.scene, state.camera);
        }
        return;
      }

      state.currentAnimationReq = requestAnimationFrame(state.animate);

      if (state.animations[0] && state.animations[0].length) {
        if (!state.flag) {
          if (state.animations[0][0] === 'add-text') {
            state.animations.shift();
          } else {
            for (let i = 0; i < state.animations[0].length; ) {
              const [boneName, action, axis, limit, sign] = state.animations[0][i];
              const bone = state.avatar?.getObjectByName(boneName);
              if (bone) {
                const step = speed;
                if (sign === '+' && (bone as any)[action][axis] < limit) {
                  (bone as any)[action][axis] += step;
                  (bone as any)[action][axis] = Math.min((bone as any)[action][axis], limit);
                  i++;
                } else if (sign === '-' && (bone as any)[action][axis] > limit) {
                  (bone as any)[action][axis] -= step;
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
        }
      } else {
        state.flag = true;
        setTimeout(() => {
          state.flag = false;
        }, 150);
        state.animations.shift();
      }

      if (state.renderer && state.scene && state.camera) {
        state.renderer.render(state.scene, state.camera);
      }
    };

    // Load GLTF Model
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        gltf.scene.traverse((child) => {
          if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
            child.frustumCulled = false;
          }
        });

        // Center avatar
        gltf.scene.position.set(0, 0, 0);
        state.avatar = gltf.scene;
        scene.add(gltf.scene);

        state.pending = false;
        defaultPose(state);
        setIsLoading(false);
      },
      undefined,
      (err) => {
        console.error('[ISLAvatarCanvas] Error loading GLTF model:', err);
        setHasError('The ISL avatar model is temporarily unavailable.');
        setIsLoading(false);
      }
    );

    // Resize Handler
    const handleResize = () => {
      if (!container || !state.renderer || !state.camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      state.camera.aspect = w / h;
      state.camera.updateProjectionMatrix();
      state.renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (state.currentAnimationReq) {
        cancelAnimationFrame(state.currentAnimationReq);
      }
      if (state.renderer && state.renderer.domElement) {
        state.renderer.dispose();
      }
    };
  }, [modelPath, speed]);

  // Imperative handle methods
  useImperativeHandle(ref, () => ({
    playLetter: (letter: string) => {
      const state = avatarRef.current;
      if (!state.avatar) return;

      const upper = letter.toUpperCase();
      state.animations = [];
      state.pending = false;

      if (upper && (alphabets as any)[upper]) {
        (alphabets as any)[upper](state);
      } else {
        defaultPose(state);
      }
    },
    resetPose: () => {
      const state = avatarRef.current;
      if (!state.avatar) return;
      state.animations = [];
      state.pending = false;
      defaultPose(state);
    },
  }));

  // Trigger animation when activeLetter prop updates
  useEffect(() => {
    const state = avatarRef.current;
    if (!state.avatar || isLoading) return;

    if (activeLetter) {
      const upper = activeLetter.toUpperCase();
      state.animations = [];
      state.pending = false;

      if ((alphabets as any)[upper]) {
        (alphabets as any)[upper](state);
      } else {
        defaultPose(state);
      }
    } else {
      defaultPose(state);
    }
  }, [activeLetter, isLoading]);

  return (
    <div className={`relative w-full h-full min-h-[260px] flex items-center justify-center ${className}`}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-[#050b16]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center gap-3 rounded-2xl">
          <div className="w-10 h-10 border-3 border-[#fe9832] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-white">Loading ISL Avatar Mesh (3D YBot)...</span>
        </div>
      )}

      {/* Error Overlay */}
      {hasError && (
        <div className="absolute inset-0 z-10 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center gap-2 text-red-200 rounded-2xl">
          <span className="material-symbols-outlined text-3xl">warning</span>
          <span className="text-xs font-bold">{hasError}</span>
        </div>
      )}

      {/* Three.js WebGL Container */}
      <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden" />
    </div>
  );
});

ISLAvatarCanvas.displayName = 'ISLAvatarCanvas';
export default ISLAvatarCanvas;
