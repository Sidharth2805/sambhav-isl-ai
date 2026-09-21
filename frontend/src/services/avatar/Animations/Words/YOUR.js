export const YOUR = (ref) => {
  let animations = [];

  // Preparation and the YOU handshape: right hand moves beside the ear,
  // with the index extended and the other fingers folded.
  animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 1.9, "+"]);
  animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 5, "-"]);
  animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 1.45, "+"]);
  animations.push(["mixamorigRightHand", "rotation", "x", -Math.PI / 2.5, "-"]);
  animations.push(["mixamorigRightHand", "rotation", "y", -Math.PI / 5, "-"]);
  animations.push(["mixamorigRightHand", "rotation", "z", -Math.PI / 6, "-"]);

  // YOU: straight index; middle, ring, and pinky folded; thumb tucked.
  for (const segment of [1, 2, 3]) {
    animations.push([`mixamorigRightHandIndex${segment}`, "rotation", "z", 0, "-"]);
  }
  for (const finger of ["Middle", "Ring", "Pinky"]) {
    for (const segment of [1, 2, 3]) {
      animations.push([`mixamorigRightHand${finger}${segment}`, "rotation", "z", Math.PI / 2, "+"]);
    }
  }
  animations.push(["mixamorigRightHandThumb1", "rotation", "x", Math.PI / 2, "+"]);
  animations.push(["mixamorigRightHandThumb1", "rotation", "y", Math.PI / 2, "+"]);
  animations.push(["mixamorigRightHandThumb2", "rotation", "y", -Math.PI / 3, "-"]);
  animations.push(["mixamorigRightHandThumb3", "rotation", "y", -Math.PI / 4, "-"]);
  ref.animations.push(animations);

  // Point once toward one fixed place. There is only one target pose;
  // no repeated or multi-place pointing is queued.
  animations = [];
  animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 2.35, "-"]);
  animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 3.8, "-"]);
  animations.push(["mixamorigRightForeArm", "rotation", "x", -Math.PI / 12, "-"]);
  animations.push(["mixamorigRightHand", "rotation", "x", -Math.PI / 1.8, "-"]);
  animations.push(["mixamorigRightHand", "rotation", "y", -Math.PI / 3.5, "-"]);
  animations.push(["mixamorigRightHand", "rotation", "z", -Math.PI / 10, "+"]);
  ref.animations.push(animations);

  // Hold that one pointing position before beginning the fist closure.
  animations = [];
  animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 3.8, "-"]);
  ref.animations.push(animations);

  // Close the visible index gradually, joint by joint. Separate animation
  // groups make the closing motion readable instead of instantaneous.
  for (const [segment, target] of [[1, Math.PI / 5], [2, Math.PI / 3], [3, Math.PI / 2]]) {
    animations = [];
    animations.push([`mixamorigRightHandIndex${segment}`, "rotation", "z", target, "+"]);
    ref.animations.push(animations);
  }

  // Finish the fist visibly: reinforce the folded middle finger, then ring,
  // then pinky, with one phase per finger so each closure can be seen.
  for (const finger of ["Middle", "Ring", "Pinky"]) {
    animations = [];
    for (const segment of [1, 2, 3]) {
      animations.push([`mixamorigRightHand${finger}${segment}`, "rotation", "z", Math.PI / 2, "+"]);
    }
    ref.animations.push(animations);
  }

  // Final squeeze: complete the curl on every joint, including the first
  // and second index joints that were only partially closed during the
  // visible staged motion. This guarantees a fully closed fist.
  animations = [];
  for (const finger of ["Index", "Middle", "Ring", "Pinky"]) {
    for (const segment of [1, 2, 3]) {
      animations.push([`mixamorigRightHand${finger}${segment}`, "rotation", "z", Math.PI / 2, "+"]);
    }
  }
  ref.animations.push(animations);

  // Hold the completed fist.
  animations = [];
  animations.push(["mixamorigRightHandThumb1", "rotation", "x", Math.PI / 2, "+"]);
  animations.push(["mixamorigRightHandThumb2", "rotation", "y", -Math.PI / 3, "-"]);
  animations.push(["mixamorigRightHandThumb3", "rotation", "y", -Math.PI / 4, "-"]);
  ref.animations.push(animations);

  // Return every right-hand bone and arm to the neutral pose.
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
  animations.push(["mixamorigRightHand", "rotation", "y", 0, "+"]);
  animations.push(["mixamorigRightHand", "rotation", "z", 0, "+"]);
  animations.push(["mixamorigRightArm", "rotation", "x", 0, "+"]);
  animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 3, "+"]);
  animations.push(["mixamorigRightForeArm", "rotation", "x", 0, "+"]);
  animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 1.5, "+"]);
  animations.push(["mixamorigRightForeArm", "rotation", "z", 0, "+"]);
  ref.animations.push(animations);

  if (ref.pending === false) {
    ref.pending = true;
    ref.animate();
  }
};

export default YOUR;
