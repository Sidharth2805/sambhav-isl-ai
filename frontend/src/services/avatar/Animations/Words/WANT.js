export const WANT = (ref) => {
  let animations = [];

  const openHand = (side) => {
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

  // Left open palm: H-style arm position keeps the palm visible in front of
  // the avatar near waist level, facing upward.
  animations.push(["mixamorigLeftHand", "rotation", "x", -Math.PI / 1.5, "-"]);
  animations.push(["mixamorigLeftHand", "rotation", "y", 0, "+"]);
  animations.push(["mixamorigLeftHand", "rotation", "z", Math.PI / 4, "+"]);
  animations.push(["mixamorigLeftArm", "rotation", "x", -Math.PI / 30, "-"]);
  animations.push(["mixamorigLeftArm", "rotation", "z", -Math.PI / 2.6, "-"]);
  animations.push(["mixamorigLeftForeArm", "rotation", "x", 0, "+"]);
  animations.push(["mixamorigLeftForeArm", "rotation", "y", -Math.PI / 1.5, "-"]);
  animations.push(["mixamorigLeftForeArm", "rotation", "z", -Math.PI / 6, "-"]);
  openHand("Left");

  // Right open palm: keep the arm and forearm exactly at the chest-level
  // targets above. The wrist has no extra twist, so the palm stays aligned
  // with the direction of the right forearm.
  animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 6, "-"]);
  animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 2.2, "+"]);
  animations.push(["mixamorigRightForeArm", "rotation", "x", 0, "-"]);
  animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 1.5, "+"]);
  animations.push(["mixamorigRightForeArm", "rotation", "z", 0, "-"]);
  animations.push(["mixamorigRightHand", "rotation", "x", 0, "+"]);
  animations.push(["mixamorigRightHand", "rotation", "y", 0, "+"]);
  animations.push(["mixamorigRightHand", "rotation", "z", 0, "+"]);
  openHand("Right");
  ref.animations.push(animations);

  // Hold both palms together in the requested WANT pose.
  animations = [];
  animations.push(["mixamorigLeftHand", "rotation", "x", -Math.PI / 1.5, "-"]);
  animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 6, "-"]);
  ref.animations.push(animations);

  // Return every finger, hand, forearm, and arm to neutral.
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

export default WANT;
