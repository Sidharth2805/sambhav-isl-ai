// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const xbot = "/models/xbot.glb";
const ybot = "/models/ybot.glb";

import * as words from "../../services/avatar/Animations/words";
import * as alphabets from "../../services/avatar/Animations/alphabets";

import { defaultPose } from "../../services/avatar/Animations/defaultPose";
import { getSentencePattern } from "../../services/avatar/Services/sentencePatterns";

export interface SignAvatarProps {
  avatar?: "ybot" | "xbot";
  speed?: number;
  pause?: number;
}

export interface SignAvatarRef {
  sign: (value: string) => void;
}

const SignAvatar = forwardRef<SignAvatarRef, SignAvatarProps>(function SignAvatar(
  {
    avatar = "ybot",
    speed = 0.16,
    pause = 120,
  },
  ref
) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const stateRef = useRef<any>({
    animations: [],
    characters: [],
    pending: false,
    flag: false,
    processedText: "",
    animationFrameId: null,
    animate: null,
    avatar: null,
    renderer: null,
    scene: null,
    camera: null,
    circleStep: undefined,
  });

useImperativeHandle(
    ref,
    () => ({
      sign: (value) => {
        signValue(
          value,
          stateRef.current,
          speed,
          pause
        );
      },
    }),
    [speed, pause]
  );

  useEffect(() => {
    const state = stateRef.current;
    const mount = mountRef.current;

    if (!mount) return;

    /*
     * Reset state.
     */
    state.animations = [];
    state.characters = [];
    state.pending = false;
    state.flag = false;
    state.processedText = "";
    state.circleStep = undefined;
    state.animationFrameId = null;

    /*
     * =====================================================
     * THREE.JS SCENE
     * =====================================================
     */

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0xeeeeee);

    /*
     * Camera
     */
    const camera = new THREE.PerspectiveCamera(
      30,
      Math.max(1, mount.clientWidth) /
        Math.max(1, mount.clientHeight),
      0.1,
      1000
    );

    camera.position.set(0, 1.4, 1.6);

    /*
     * Renderer
     */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 2)
    );

    renderer.setSize(
      Math.max(1, mount.clientWidth),
      Math.max(1, mount.clientHeight)
    );

    mount.innerHTML = "";
    mount.appendChild(renderer.domElement);

    /*
     * Lighting
     */
    const ambient = new THREE.AmbientLight(
      0xffffff,
      1.8
    );

    scene.add(ambient);

    const keyLight = new THREE.SpotLight(
      0xffffff,
      2
    );

    keyLight.position.set(0, 5, 5);

    scene.add(keyLight);

    /*
     * Save THREE objects in state.
     */
    state.scene = scene;
    state.camera = camera;
    state.renderer = renderer;

    /*
     * =====================================================
     * LOAD AVATAR
     * =====================================================
     */

    const loader = new GLTFLoader();

    const model =
      avatar === "xbot"
        ? xbot
        : ybot;

    loader.load(
      model,

      (gltf) => {
        if (!state.scene) return;

        gltf.scene.traverse((child) => {
          if (child.type === "SkinnedMesh") {
            child.frustumCulled = false;
          }
        });

        state.avatar = gltf.scene;

        state.scene.add(state.avatar);

        /*
         * Always start in default pose.
         */
        defaultPose(state);
      },

      undefined,

      (error) => {
        console.error(
          "Avatar load error:",
          error
        );
      }
    );

    /*
     * =====================================================
     * RESIZE
     * =====================================================
     */

    const resize = () => {
      if (
        !state.renderer ||
        !state.camera ||
        !mount
      ) {
        return;
      }

      const width = Math.max(
        1,
        mount.clientWidth
      );

      const height = Math.max(
        1,
        mount.clientHeight
      );

      state.camera.aspect =
        width / height;

      state.camera.updateProjectionMatrix();

      state.renderer.setSize(
        width,
        height
      );
    };

    const resizeObserver =
      new ResizeObserver(resize);

    resizeObserver.observe(mount);

    /*
     * =====================================================
     * MAIN ANIMATION LOOP
     * =====================================================
     *
     * IMPORTANT:
     *
     * This loop is NEVER cancelled when signValue()
     * is called.
     *
     * signValue() only changes state.animations.
     */

    const animate = () => {
      /*
       * If component has already been cleaned up,
       * stop safely.
       */
      if (
        !state.renderer ||
        !state.scene ||
        !state.camera
      ) {
        return;
      }

      /*
       * ===================================================
       * PROCESS ANIMATION QUEUE
       * ===================================================
       */

      if (
        state.avatar &&
        state.animations.length > 0
      ) {
        const currentAnimation =
          state.animations[0];

        /*
         * -------------------------------------------------
         * ARRAY ANIMATION
         * -------------------------------------------------
         */

        if (
          currentAnimation &&
          Array.isArray(currentAnimation)
        ) {
          /*
           * Only process when pause is finished.
           */
          if (!state.flag) {
            /*
             * ===============================================
             * ADD TEXT
             * ===============================================
             */

            if (
              currentAnimation[0] ===
              "add-text"
            ) {
              state.processedText +=
                currentAnimation[1];

              state.animations.shift();
            }

            /*
             * ===============================================
             * CIRCLE ANIMATION
             * ===============================================
             */

            else if (
              currentAnimation[0] ===
              "circle"
            ) {
              const [
                ,
                boneName,
                ,
                ,
                centerX,
                centerY,
                radiusX,
                radiusY,
                centerZ,
                radiusZ,
              ] = currentAnimation;

              if (
                state.circleStep ===
                undefined
              ) {
                state.circleStep = 0;
              }

              const totalSteps = 90;

              const bone =
                state.avatar.getObjectByName(
                  boneName
                );

              if (bone) {
                const angle =
                  (2 * Math.PI *
                    state.circleStep) /
                  totalSteps;

                bone.rotation.x =
                  centerX +
                  radiusX *
                    Math.sin(angle);

                bone.rotation.y =
                  centerY +
                  radiusY *
                    Math.cos(angle);

                bone.rotation.z =
                  (centerZ ??
                    Math.PI / 3) +
                  (radiusZ ?? 0) *
                    Math.sin(angle);
              }

              state.circleStep++;

              if (
                state.circleStep >=
                totalSteps
              ) {
                state.circleStep =
                  undefined;

                state.animations.shift();

                /*
                 * Return to default pose after
                 * circle animation.
                 */
                defaultPose(state);
              }
            }

            /*
             * ===============================================
             * BONE ANIMATION
             * ===============================================
             */

            else {
              /*
               * Process every bone movement belonging
               * to the current animation.
               */
              for (
                let i = 0;
                i <
                currentAnimation.length;
              ) {
                const [
                  boneName,
                  action,
                  axis,
                  limit,
                ] =
                  currentAnimation[i];

                const targetBone =
                  state.avatar.getObjectByName(
                    boneName
                  );

                /*
                 * If bone/action is invalid,
                 * remove it so the animation cannot
                 * get stuck.
                 */
                if (
                  !targetBone ||
                  !targetBone[action] ||
                  typeof targetBone[action][
                    axis
                  ] !== "number" ||
                  typeof limit !==
                    "number"
                ) {
                  currentAnimation.splice(
                    i,
                    1
                  );

                  continue;
                }

                const current =
                  targetBone[action][axis];

                /*
                 * Target reached.
                 */
                if (
                  Math.abs(
                    current - limit
                  ) < speed
                ) {
                  targetBone[action][axis] =
                    limit;

                  currentAnimation.splice(
                    i,
                    1
                  );
                }

                /*
                 * Move toward target.
                 */
                else {
                  targetBone[action][axis] +=
                    current < limit
                      ? speed
                      : -speed;

                  i++;
                }
              }

              /*
               * ===============================================
               * CURRENT SIGN FINISHED
               * ===============================================
               */

              if (
                currentAnimation.length ===
                0
              ) {
                /*
                 * Remove completed animation.
                 */
                state.animations.shift();

                /*
                 * Return avatar to default pose.
                 *
                 * This is important between letters.
                 */
                defaultPose(state);
              }
            }
          }
        }

        /*
         * -------------------------------------------------
         * PAUSE MARKER
         * -------------------------------------------------
         *
         * Some existing alphabet/word animations may
         * insert a non-array marker.
         */

        else {
          state.flag = true;

          window.setTimeout(() => {
            state.flag = false;
          }, pause);

          state.animations.shift();
        }
      }

      /*
       * ===================================================
       * QUEUE FINISHED
       * ===================================================
       */

      if (
        state.animations.length ===
        0
      ) {
        state.pending = false;
      }

      /*
       * ===================================================
       * RENDER
       * ===================================================
       */

      state.renderer.render(
        state.scene,
        state.camera
      );

      /*
       * ===================================================
       * KEEP LOOP RUNNING
       * ===================================================
       */

      state.animationFrameId =
        requestAnimationFrame(animate);
    };

    /*
     * defaultPose() expects state.animate().
     */
    state.animate = animate;

    /*
     * Start animation loop once.
     */
    state.animationFrameId =
      requestAnimationFrame(animate);

    /*
     * =====================================================
     * CLEANUP
     * =====================================================
     */

    return () => {
      if (
        state.animationFrameId
      ) {
        cancelAnimationFrame(
          state.animationFrameId
        );

        state.animationFrameId =
          null;
      }

      resizeObserver.disconnect();

      if (state.renderer) {
        state.renderer.dispose();

        if (
          state.renderer.domElement
            .parentNode === mount
        ) {
          mount.removeChild(
            state.renderer.domElement
          );
        }
      }

      state.avatar = null;
      state.renderer = null;
      state.scene = null;
      state.camera = null;
      state.animate = null;
    };
  }, [avatar, speed, pause]);

  return (
    <div
      ref={mountRef}
      className="sambhav-avatar-canvas"
    />
  );
});

/*
 * =========================================================
 * SIGN VALUE
 * =========================================================
 *
 * IMPORTANT:
 *
 * DO NOT cancel requestAnimationFrame here.
 *
 * The main animation loop is already running.
 *
 * We only clear the old queue and create a new one.
 */

function signValue(value: string, state: any, speed?: number, pause?: number) {
  if (!state.avatar) {
    return;
  }

  /*
   * Clear previous queue.
   */
  state.animations = [];
  state.pending = false;
  state.flag = false;
  state.processedText = "";
  state.circleStep = undefined;

  /*
   * Get sentence pattern if one exists.
   */
  const sentencePattern =
    getSentencePattern(value);

  const tokens =
    sentencePattern
      ? sentencePattern
      : (value || "")
          .toUpperCase()
          .split(/\s+/)
          .filter(Boolean);

  /*
   * ========================================================
   * BUILD COMPLETE ANIMATION QUEUE
   * ========================================================
   */

  for (const rawWord of tokens) {
    const cleanWord = String(rawWord)
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase();

    if (!cleanWord) continue;

    /*
     * ===============================================
     * COMPLETE WORD EXISTS
     * ===============================================
     */

    if (words[cleanWord]) {
      /*
       * Display/process word.
       */
      state.animations.push([
        "add-text",
        cleanWord + " ",
      ]);

      /*
       * Add word animation.
       */
      words[cleanWord](state);

      /*
       * Return to default pose.
       */
      defaultPose(state);
    }

    /*
     * ===============================================
     * WORD NOT AVAILABLE
     * ===============================================
     *
     * Sign each letter individually.
     */

    else {
      for (
        const [index, ch] of cleanWord
          .split("")
          .entries()
      ) {
        /*
         * Add text marker.
         */
        state.animations.push([
          "add-text",
          index ===
          cleanWord.length - 1
            ? ch + " "
            : ch,
        ]);

        /*
         * Alphabet sign exists.
         */
        if (
          typeof alphabets[ch] ===
          "function"
        ) {
          alphabets[ch](state);
        }

        /*
         * Alphabet sign doesn't exist.
         * Just return to default pose.
         */
        else {
          defaultPose(state);
        }
      }
    }
  }

  /*
   * Tell the renderer that animation work
   * is available.
   */
  state.pending =
    state.animations.length > 0;
}

export default SignAvatar;

