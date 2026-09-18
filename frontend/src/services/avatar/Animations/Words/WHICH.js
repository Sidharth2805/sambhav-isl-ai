export const WHICH = (ref) => {
  let animations = []

  const queuePointingPose = (armZ, armX, handZ, handY) => {
    animations = []

    // Exact THIS-style right index: straight and aligned.
    animations.push(["mixamorigRightHandIndex1", "rotation", "z", 0, "+"]);
    animations.push(["mixamorigRightHandIndex2", "rotation", "z", 0, "+"]);
    animations.push(["mixamorigRightHandIndex3", "rotation", "z", 0, "+"]);

    // Middle, ring, and pinky remain closed.
    for (const finger of ["Middle", "Ring", "Pinky"]) {
      animations.push([`mixamorigRightHand${finger}1`, "rotation", "z", Math.PI / 2, "+"]);
      animations.push([`mixamorigRightHand${finger}2`, "rotation", "z", Math.PI / 2, "+"]);
      animations.push([`mixamorigRightHand${finger}3`, "rotation", "z", Math.PI / 2, "+"]);
    }

    // Thumb stays folded naturally beneath the pointing index.
    animations.push(["mixamorigRightHandThumb1", "rotation", "x", Math.PI / 2, "+"]);
    animations.push(["mixamorigRightHandThumb1", "rotation", "y", Math.PI / 2, "+"]);
    animations.push(["mixamorigRightHandThumb2", "rotation", "y", -Math.PI / 3, "-"]);
    animations.push(["mixamorigRightHandThumb3", "rotation", "y", -Math.PI / 4, "-"]);

    // The pointing hand uses the same orientation as THIS; only its
    // position is changed so it can point at multiple places.
    animations.push(["mixamorigRightHand", "rotation", "x", -Math.PI / 2, "-"]);
    animations.push(["mixamorigRightHand", "rotation", "z", handZ, "-"]);
    animations.push(["mixamorigRightHand", "rotation", "y", handY, "-"]);
    animations.push(["mixamorigRightArm", "rotation", "z", armZ, "+"]);
    animations.push(["mixamorigRightArm", "rotation", "x", armX, "-"]);
    animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 1.5, "+"]);
    ref.animations.push(animations);
  }

  // Point at the first place using the exact THIS pose.
  queuePointingPose(Math.PI / 2.2, -Math.PI / 5, -Math.PI / 4, -Math.PI / 3);

  // Move the same straight index to a second place.
  queuePointingPose(Math.PI / 2.05, -Math.PI / 5.5, -Math.PI / 5, -Math.PI / 3.2);

  // Move the same straight index to a third place.
  queuePointingPose(Math.PI / 2.38, -Math.PI / 4.6, -Math.PI / 3.3, -Math.PI / 3.8);

  // Transition from pointing into the complete WHAT-style right hand.
  // The index now curves too; all right-hand fingers move together while
  // the left hand receives no targets and remains at defaultPose.
  const whatFingerCurls = [
    ["Index", Math.PI / 8],
    ["Middle", Math.PI / 6],
    ["Ring", Math.PI / 5.5],
    ["Pinky", Math.PI / 5]
  ];
  animations = []
  for (const [finger, curl] of whatFingerCurls) {
    animations.push([`mixamorigRightHand${finger}1`, "rotation", "z", curl, "+"]);
    animations.push([`mixamorigRightHand${finger}2`, "rotation", "z", curl, "+"]);
    animations.push([`mixamorigRightHand${finger}3`, "rotation", "z", curl, "+"]);
  }
  animations.push(["mixamorigRightHandThumb1", "rotation", "x", Math.PI / 2, "+"]);
  animations.push(["mixamorigRightHandThumb1", "rotation", "y", Math.PI / 2, "+"]);
  animations.push(["mixamorigRightHandThumb2", "rotation", "y", -Math.PI / 3, "-"]);
  animations.push(["mixamorigRightHandThumb3", "rotation", "y", -Math.PI / 4, "-"]);
  animations.push(["mixamorigRightHand", "rotation", "x", -Math.PI / 2, "-"]);
  animations.push(["mixamorigRightHand", "rotation", "y", 0, "+"]);
  animations.push(["mixamorigRightHand", "rotation", "z", Math.PI / 12, "+"]);
  animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 1.5, "+"]);
  ref.animations.push(animations);

  // WHAT-style shake of the whole right hand: curved fingers, palm, arm,
  // and forearm are updated in every phase for a unified movement.
  const smoothShakeTargets = [
    [Math.PI / 2.15, Math.PI / 36, Math.PI / 18],
    [Math.PI / 1.95, -Math.PI / 42, -Math.PI / 16],
    [Math.PI / 2.25, Math.PI / 48, Math.PI / 20],
    [Math.PI / 2.65, -Math.PI / 42, -Math.PI / 18],
    [Math.PI / 2.9, Math.PI / 48, Math.PI / 22],
    [Math.PI / 2.55, -Math.PI / 42, -Math.PI / 20],
    [Math.PI / 2.2, Math.PI / 48, Math.PI / 18],
    [Math.PI / 2.45, 0, 0]
  ];
  for (const [armTarget, forearmTarget, palmTarget] of smoothShakeTargets) {
    animations = []
    animations.push(["mixamorigRightArm", "rotation", "z", armTarget, "+"]);
    animations.push(["mixamorigRightForeArm", "rotation", "x", forearmTarget, "+"]);
    animations.push(["mixamorigRightHand", "rotation", "x", -Math.PI / 2, "-"]);
    animations.push(["mixamorigRightHand", "rotation", "y", 0, "+"]);
    animations.push(["mixamorigRightHand", "rotation", "z", palmTarget, "+"]);
    for (const [finger, curl] of whatFingerCurls) {
      animations.push([`mixamorigRightHand${finger}1`, "rotation", "z", curl, "+"]);
      animations.push([`mixamorigRightHand${finger}2`, "rotation", "z", curl, "+"]);
      animations.push([`mixamorigRightHand${finger}3`, "rotation", "z", curl, "+"]);
    }
    ref.animations.push(animations);
  }

  // Reset only the right hand and arm. The left side stays at defaultPose.
  animations = []
  for (const finger of ["Index", "Middle", "Ring", "Pinky"]) {
    for (const segment of [1, 2, 3]) {
      animations.push([`mixamorigRightHand${finger}${segment}`, "rotation", "z", 0, "-"]);
    }
  }
  animations.push(["mixamorigRightHandThumb1", "rotation", "x", 0, "-"]);
  animations.push(["mixamorigRightHandThumb1", "rotation", "y", 0, "-"]);
  animations.push(["mixamorigRightHandThumb2", "rotation", "y", 0, "+"]);
  animations.push(["mixamorigRightHandThumb3", "rotation", "y", 0, "+"]);
  animations.push(["mixamorigRightHand", "rotation", "x", 0, "+"]);
  animations.push(["mixamorigRightHand", "rotation", "y", 0, "+"]);
  animations.push(["mixamorigRightHand", "rotation", "z", 0, "+"]);
  animations.push(["mixamorigRightArm", "rotation", "x", 0, "-"]);
  animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 3, "+"]);
  animations.push(["mixamorigRightForeArm", "rotation", "x", 0, "-"]);
  animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 1.5, "+"]);
  animations.push(["mixamorigRightForeArm", "rotation", "z", 0, "-"]);
  ref.animations.push(animations);

  if (ref.pending === false) {
    ref.pending = true;
    ref.animate();
  }
}

export default WHICH;
