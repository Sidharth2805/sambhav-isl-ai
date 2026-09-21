// NAME sign reconstructed from WIN_20260814_10_47_04_Pro.mp4.
// Both hands form an H-like handshape. The left hand is the base and the
// right hand makes two small downward taps before both hands reset.
export const NAME = (ref) => {
  let animations = [];

  const addCHandshape = () => {
    // C shape: all four fingers are gently curved and the thumb opens away
    // from the fingers to form the visible C gap.
    for (const finger of ["Index", "Middle", "Ring", "Pinky"]) {
      for (const segment of [1, 2, 3]) {
        animations.push([`mixamorigRightHand${finger}${segment}`, "rotation", "z", Math.PI / 4.5, "+"]);
      }
    }
    animations.push(["mixamorigRightHandThumb1", "rotation", "x", Math.PI / 3, "+"]);
    animations.push(["mixamorigRightHandThumb1", "rotation", "y", Math.PI / 3, "+"]);
    animations.push(["mixamorigRightHandThumb2", "rotation", "y", -Math.PI / 6, "-"]);
    animations.push(["mixamorigRightHandThumb3", "rotation", "y", -Math.PI / 7, "-"]);

    // Keep the C opening visible to the user.
    animations.push(["mixamorigRightHand", "rotation", "z", -Math.PI / 10, "-"]);
    animations.push(["mixamorigRightHand", "rotation", "y", Math.PI / 4, "+"]);
    animations.push(["mixamorigRightForeArm", "rotation", "z", Math.PI / 9, "+"]);
    animations.push(["mixamorigRightForeArm", "rotation", "x", Math.PI / 18, "+"]);
    animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 1.5, "+"]);
    animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 6.5, "-"]);
  };

  // Preparation: bring the C hand to the avatar's right side, in front of
  // the chest so the horizontal slide remains visible and body-safe.
  animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 2.5, "+"]);
  animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 6.5, "-"]);
  animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 1.5, "+"]);
  animations.push(["mixamorigRightForeArm", "rotation", "z", Math.PI / 9, "+"]);
  animations.push(["mixamorigRightHand", "rotation", "x", 0, "+"]);
  animations.push(["mixamorigRightHand", "rotation", "y", Math.PI / 4, "+"]);
  animations.push(["mixamorigRightHand", "rotation", "z", -Math.PI / 10, "-"]);
  addCHandshape();
  ref.animations.push(animations);

  // Hold briefly so the C shape is visible before sliding.
  animations = [];
  animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 2.5, "+"]);
  ref.animations.push(animations);

  // Smooth right-to-left sweep across one continuous front-of-body path.
  // The right-arm Z target decreases from the avatar's right side toward
  // the center/left, while intermediate targets avoid a sudden jump.
  for (const armZ of [Math.PI / 2.8, Math.PI / 3, Math.PI / 4, Math.PI / 8, -Math.PI / 10]) {
    animations = [];
    animations.push(["mixamorigRightArm", "rotation", "z", armZ, "+"]);
    animations.push(["mixamorigRightHand", "rotation", "z", -Math.PI / 10, "+"]);
    animations.push(["mixamorigRightForeArm", "rotation", "z", Math.PI / 9, "+"]);
    ref.animations.push(animations);
  }

  // Brief hold at the left-side endpoint.
  animations = [];
  animations.push(["mixamorigRightArm", "rotation", "z", -Math.PI / 10, "-"]);
  ref.animations.push(animations);

  // Return the complete right hand and arm to the project neutral pose.
  animations = [];
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
  animations.push(["mixamorigRightHand", "rotation", "y", 0, "-"]);
  animations.push(["mixamorigRightHand", "rotation", "z", 0, "+"]);
  animations.push(["mixamorigRightArm", "rotation", "x", 0, "+"]);
  animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 3, "-"]);
  animations.push(["mixamorigRightForeArm", "rotation", "x", 0, "-"]);
  animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 1.5, "+"]);
  animations.push(["mixamorigRightForeArm", "rotation", "z", 0, "-"]);
  ref.animations.push(animations);

  if (ref.pending === false) {
    ref.pending = true;
    ref.animate();
  }
};

export default NAME;
