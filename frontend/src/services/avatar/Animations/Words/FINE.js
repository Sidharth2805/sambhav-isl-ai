export const FINE = (ref) => {
  let animations = [];

  const addOpenHand = (side) => {
    for (const finger of ["Index", "Middle", "Ring", "Pinky"]) {
      for (const segment of [1, 2, 3]) {
        animations.push([`mixamorig${side}Hand${finger}${segment}`, "rotation", "z", 0, "-"]);
      }
    }
    animations.push([`mixamorig${side}HandThumb1`, "rotation", "x", 0, "-"]);
    animations.push([`mixamorig${side}HandThumb1`, "rotation", "y", 0, "+"]);
    animations.push([`mixamorig${side}HandThumb1`, "rotation", "z", 0, "+"]);
    animations.push([`mixamorig${side}HandThumb2`, "rotation", "y", 0, "+"]);
    animations.push([`mixamorig${side}HandThumb3`, "rotation", "y", 0, "+"]);
  };

  const addPinch = (side) => {
    // Both hands use the B.js index movement. Mirror the Z direction on the
    // left so its index bends toward the thumb instead of backward.
    const indexZ = side === "Left" ? -Math.PI / 4.5 : Math.PI / 4.5;
    for (const segment of [1, 2, 3]) {
      animations.push([`mixamorig${side}HandIndex${segment}`, "rotation", "z", indexZ, side === "Left" ? "-" : "+"]);
    }
    for (const finger of ["Middle", "Ring", "Pinky"]) {
      for (const segment of [1, 2, 3]) {
        // Middle, ring, and pinky stay open on both hands.
        animations.push([`mixamorig${side}Hand${finger}${segment}`, "rotation", "z", 0, "-"]);
      }
    }
    // Both thumbs follow the B.js movement toward the B-style index.
    animations.push([`mixamorig${side}HandThumb1`, "rotation", "x", Math.PI / 6, "+"]);
    animations.push([`mixamorig${side}HandThumb1`, "rotation", "y", 0, "+"]);
    animations.push([`mixamorig${side}HandThumb2`, "rotation", "y", side === "Left" ? Math.PI / 6 : -Math.PI / 6, side === "Left" ? "+" : "-"]);
    animations.push([`mixamorig${side}HandThumb3`, "rotation", "y", 0, "+"]);
    // Keep both hands in their default wrist/hand orientation while
    // forming the pinch. Only the fingers/thumb should move.
    animations.push([`mixamorig${side}Hand`, "rotation", "x", 0, "+"]);
    animations.push([`mixamorig${side}Hand`, "rotation", "y", 0, "+"]);
    animations.push([`mixamorig${side}Hand`, "rotation", "z", 0, "+"]);
  };

  // Preparation: both open hands are brought to visible positions in front of
  // the torso, with enough outward spacing to avoid the body.
  // Mirror the right-hand front-of-body placement for the left hand.
  animations.push(["mixamorigLeftArm", "rotation", "x", -Math.PI / 6, "-"]);
  animations.push(["mixamorigLeftArm", "rotation", "z", -Math.PI / 2.2, "-"]);
  animations.push(["mixamorigLeftForeArm", "rotation", "x", 0, "+"]);
  animations.push(["mixamorigLeftForeArm", "rotation", "y", -Math.PI / 1.5, "-"]);
  animations.push(["mixamorigLeftForeArm", "rotation", "z", 0, "+"]);
  animations.push(["mixamorigLeftHand", "rotation", "x", 0, "+"]);
  animations.push(["mixamorigLeftHand", "rotation", "y", 0, "+"]);
  animations.push(["mixamorigLeftHand", "rotation", "z", 0, "+"]);
  addOpenHand("Left");

  animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 6, "-"]);
  animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 2.2, "+"]);
  animations.push(["mixamorigRightForeArm", "rotation", "x", 0, "-"]);
  animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 1.5, "+"]);
  animations.push(["mixamorigRightForeArm", "rotation", "z", 0, "-"]);
  animations.push(["mixamorigRightHand", "rotation", "x", 0, "+"]);
  animations.push(["mixamorigRightHand", "rotation", "y", 0, "+"]);
  animations.push(["mixamorigRightHand", "rotation", "z", 0, "-"]);
  addOpenHand("Right");
  ref.animations.push(animations);

  // Slide both open hands downward in synchronized, body-safe stages.
  // Increasing the arm-X targets lowers the hands while the outward Z targets
  // keep the wrists in front of, rather than inside, the torso.
  for (const [leftX, rightX] of [
    [-Math.PI / 10, -Math.PI / 10],
    [-Math.PI / 20, -Math.PI / 20],
    [0, 0],
  ]) {
    animations = [];
    animations.push(["mixamorigLeftArm", "rotation", "x", leftX, "+"]);
    animations.push(["mixamorigRightArm", "rotation", "x", rightX, "+"]);
    animations.push(["mixamorigLeftForeArm", "rotation", "x", Math.PI / 12, "+"]);
    animations.push(["mixamorigRightForeArm", "rotation", "x", Math.PI / 12, "+"]);
    ref.animations.push(animations);
  }

  // Form the pinch only after both hands reach the lower endpoint.
  animations = [];
  addPinch("Left");
  addPinch("Right");
  ref.animations.push(animations);

  // Hold both pinches briefly so the final handshape is clearly visible.
  animations = [];
  animations.push(["mixamorigLeftHand", "rotation", "x", 0, "+"]);
  animations.push(["mixamorigRightHand", "rotation", "x", 0, "+"]);
  ref.animations.push(animations);

  // Return every finger, hand, forearm, and arm to the neutral pose.
  animations = [];
  for (const side of ["Left", "Right"]) {
    for (const finger of ["Index", "Middle", "Ring", "Pinky"]) {
      for (const segment of [1, 2, 3]) {
        animations.push([`mixamorig${side}Hand${finger}${segment}`, "rotation", "z", 0, "-"]);
      }
    }
    animations.push([`mixamorig${side}HandThumb1`, "rotation", "x", 0, "-"]);
    animations.push([`mixamorig${side}HandThumb1`, "rotation", "y", 0, "+"]);
    animations.push([`mixamorig${side}HandThumb1`, "rotation", "z", 0, "+"]);
    animations.push([`mixamorig${side}HandThumb2`, "rotation", "y", 0, "+"]);
    animations.push([`mixamorig${side}HandThumb3`, "rotation", "y", 0, "+"]);
    animations.push([`mixamorig${side}Hand`, "rotation", "x", 0, "+"]);
    animations.push([`mixamorig${side}Hand`, "rotation", "y", 0, "+"]);
    animations.push([`mixamorig${side}Hand`, "rotation", "z", 0, "+"]);
  }
  animations.push(["mixamorigLeftArm", "rotation", "x", 0, "+"]);
  animations.push(["mixamorigLeftArm", "rotation", "z", -Math.PI / 3, "+"]);
  animations.push(["mixamorigLeftForeArm", "rotation", "x", 0, "+"]);
  animations.push(["mixamorigLeftForeArm", "rotation", "y", -Math.PI / 1.5, "+"]);
  animations.push(["mixamorigLeftForeArm", "rotation", "z", 0, "+"]);
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
};

export default FINE;
