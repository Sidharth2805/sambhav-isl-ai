export const WHAT = (ref) => {
  let animations = []

  // WHAT: the left hand is intentionally untouched and remains at the
  // defaultPose throughout. Only the right hand performs the sign.

  // Right hand starts palm-up with a slight wrist twist. Finger curvature
  // increases gradually from index to pinky.
  const fingerCurls = [
    ["Index", Math.PI / 18],
    ["Middle", Math.PI / 12],
    ["Ring", Math.PI / 9],
    ["Pinky", Math.PI / 7]
  ];
  for (const [finger, curl] of fingerCurls) {
    animations.push([`mixamorigRightHand${finger}1`, "rotation", "z", curl, "+"]);
    animations.push([`mixamorigRightHand${finger}2`, "rotation", "z", curl, "+"]);
    animations.push([`mixamorigRightHand${finger}3`, "rotation", "z", curl, "+"]);
  }
  animations.push(["mixamorigRightHandThumb1", "rotation", "x", 0, "+"]);
  animations.push(["mixamorigRightHandThumb1", "rotation", "y", 0, "+"]);
  animations.push(["mixamorigRightHandThumb2", "rotation", "y", 0, "+"]);
  animations.push(["mixamorigRightHandThumb3", "rotation", "y", 0, "+"]);

  // Right palm faces upward; only the right arm is positioned for WHAT.
  animations.push(["mixamorigRightHand", "rotation", "x", -Math.PI / 2, "-"]);
  animations.push(["mixamorigRightHand", "rotation", "y", 0, "+"]);
  animations.push(["mixamorigRightHand", "rotation", "z", Math.PI / 12, "+"]);
  animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 6, "-"]);
  animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 2.6, "+"]);
  animations.push(["mixamorigRightForeArm", "rotation", "x", 0, "-"]);
  animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 1.5, "+"]);
  animations.push(["mixamorigRightForeArm", "rotation", "z", 0, "-"]);
  ref.animations.push(animations);

  // Continuous visible shake of the right hand only. The targets are
  // deliberately separated enough for the controller to animate between
  // them, while the dense sequence prevents a sudden stop or jump.
  const smoothShakeTargets = [
    [Math.PI / 2.15, Math.PI / 36],
    [Math.PI / 1.95, -Math.PI / 42],
    [Math.PI / 2.25, Math.PI / 48],
    [Math.PI / 2.65, -Math.PI / 42],
    [Math.PI / 2.9, Math.PI / 48],
    [Math.PI / 2.55, -Math.PI / 42],
    [Math.PI / 2.2, Math.PI / 48],
    [Math.PI / 2.45, 0]
  ];
  for (const [armTarget, forearmTarget] of smoothShakeTargets) {
    animations = []
    animations.push(["mixamorigRightArm", "rotation", "z", armTarget, "+"]);
    animations.push(["mixamorigRightForeArm", "rotation", "x", forearmTarget, "+"]);
    ref.animations.push(animations);
  }

  // Smooth post-twist settling: small controlled corrections prevent an
  // abrupt stop while the left side remains untouched.
  animations = []
  animations.push(["mixamorigRightHand", "rotation", "x", -Math.PI / 2, "-"]);
  animations.push(["mixamorigRightHand", "rotation", "y", 0, "+"]);
  animations.push(["mixamorigRightHand", "rotation", "z", Math.PI / 18, "-"]);
  animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 2.55, "+"]);
  ref.animations.push(animations);

  animations = []
  animations.push(["mixamorigRightHand", "rotation", "z", Math.PI / 12, "+"]);
  animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 2.6, "-"]);
  ref.animations.push(animations);

  // Reset only the right side. The left side is never modified and therefore
  // stays at defaultPose from beginning to end.
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

export default WHAT;

