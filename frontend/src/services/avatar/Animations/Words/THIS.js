export const THIS = (ref) => {
  let animations = []

  // Keep the three index segments aligned using the proven PERSON shape.
  // The whole hand is then rotated downward, avoiding joint-by-joint twisting.
  animations.push(["mixamorigRightHandIndex1", "rotation", "z", 0, "+"]);
  animations.push(["mixamorigRightHandIndex2", "rotation", "z", 0, "+"]);
  animations.push(["mixamorigRightHandIndex3", "rotation", "z", 0, "+"]);

  // Middle, ring, and little fingers remain closed.
  animations.push(["mixamorigRightHandMiddle1", "rotation", "z", Math.PI / 2, "+"]);
  animations.push(["mixamorigRightHandMiddle2", "rotation", "z", Math.PI / 2, "+"]);
  animations.push(["mixamorigRightHandMiddle3", "rotation", "z", Math.PI / 2, "+"]);
  animations.push(["mixamorigRightHandRing1", "rotation", "z", Math.PI / 2, "+"]);
  animations.push(["mixamorigRightHandRing2", "rotation", "z", Math.PI / 2, "+"]);
  animations.push(["mixamorigRightHandRing3", "rotation", "z", Math.PI / 2, "+"]);
  animations.push(["mixamorigRightHandPinky1", "rotation", "z", Math.PI / 2, "+"]);
  animations.push(["mixamorigRightHandPinky2", "rotation", "z", Math.PI / 2, "+"]);
  animations.push(["mixamorigRightHandPinky3", "rotation", "z", Math.PI / 2, "+"]);

  // Thumb remains closed beneath the index finger.
  // Fold the thumb firmly beneath the palm so it is shorter than the index.
  animations.push(["mixamorigRightHandThumb1", "rotation", "x", Math.PI / 2, "+"]);
  animations.push(["mixamorigRightHandThumb1", "rotation", "y", Math.PI / 2, "+"]);
  animations.push(["mixamorigRightHandThumb2", "rotation", "y", -Math.PI / 3, "-"]);
  animations.push(["mixamorigRightHandThumb3", "rotation", "y", -Math.PI / 4, "-"]);

  // Face-level, front-facing arm position.
  animations.push(["mixamorigRightHand", "rotation", "x", -Math.PI / 2, "-"]);
  animations.push(["mixamorigRightHand", "rotation", "z", -Math.PI / 4, "-"]);
  animations.push(["mixamorigRightHand", "rotation", "y", -Math.PI / 3, "-"]);
  animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 2.2, "+"]);
  animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 5, "-"]);
  animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 1.5, "+"]);

  ref.animations.push(animations);

  // Brief natural hold.
  animations = []
  animations.push(["mixamorigRightArm", "rotation", "x", Math.PI / 90, "+"]);
  ref.animations.push(animations);

  // Return the complete right hand and arm to the project default pose.
  animations = []
  animations.push(["mixamorigRightHandIndex1", "rotation", "z", 0, "-"]);
  animations.push(["mixamorigRightHandIndex2", "rotation", "z", 0, "-"]);
  animations.push(["mixamorigRightHandIndex3", "rotation", "z", 0, "-"]);
  animations.push(["mixamorigRightHandMiddle1", "rotation", "z", 0, "-"]);
  animations.push(["mixamorigRightHandMiddle2", "rotation", "z", 0, "-"]);
  animations.push(["mixamorigRightHandMiddle3", "rotation", "z", 0, "-"]);
  animations.push(["mixamorigRightHandRing1", "rotation", "z", 0, "-"]);
  animations.push(["mixamorigRightHandRing2", "rotation", "z", 0, "-"]);
  animations.push(["mixamorigRightHandRing3", "rotation", "z", 0, "-"]);
  animations.push(["mixamorigRightHandPinky1", "rotation", "z", 0, "-"]);
  animations.push(["mixamorigRightHandPinky2", "rotation", "z", 0, "-"]);
  animations.push(["mixamorigRightHandPinky3", "rotation", "z", 0, "-"]);
  animations.push(["mixamorigRightHandThumb1", "rotation", "x", 0, "-"]);
  animations.push(["mixamorigRightHandThumb1", "rotation", "y", 0, "-"]);
  animations.push(["mixamorigRightHandThumb2", "rotation", "y", 0, "+"]);
  animations.push(["mixamorigRightHandThumb3", "rotation", "y", 0, "+"]);
  animations.push(["mixamorigRightHand", "rotation", "x", 0, "+"]);
  animations.push(["mixamorigRightHand", "rotation", "z", 0, "+"]);
  animations.push(["mixamorigRightHand", "rotation", "y", 0, "+"]);
  animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 3, "-"]);
  animations.push(["mixamorigRightArm", "rotation", "x", 0, "-"]);
  animations.push(["mixamorigRightForeArm", "rotation", "x", 0, "-"]);
  animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 1.5, "+"]);
  animations.push(["mixamorigRightForeArm", "rotation", "z", 0, "-"]);
  ref.animations.push(animations);

  if (ref.pending === false) {
    ref.pending = true;
    ref.animate();
  }
}

export default THIS;

