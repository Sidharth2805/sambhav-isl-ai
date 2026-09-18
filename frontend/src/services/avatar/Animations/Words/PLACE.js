export const PLACE = (ref) => {
  let animations = [];

  // H-style setup: position the left palm and bring the right hand into
  // the H movement position, while the right fingers are still open.
  animations.push(["mixamorigRightHandThumb1", "rotation", "x", -Math.PI / 6, "-"]);
  animations.push(["mixamorigRightHandThumb1", "rotation", "z", -Math.PI / 15, "-"]);
  animations.push(["mixamorigRightForeArm", "rotation", "z", Math.PI / 6, "+"]);
  animations.push(["mixamorigRightForeArm", "rotation", "x", Math.PI / 18, "+"]);
  animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 60, "-"]);
  animations.push(["mixamorigLeftHandThumb1", "rotation", "z", Math.PI / 12, "+"]);
  animations.push(["mixamorigLeftHand", "rotation", "x", -Math.PI / 1.5, "-"]);
  animations.push(["mixamorigLeftHand", "rotation", "z", Math.PI / 4, "+"]);
  animations.push(["mixamorigLeftForeArm", "rotation", "z", -Math.PI / 6, "-"]);
  animations.push(["mixamorigLeftForeArm", "rotation", "y", -Math.PI / 1.5, "-"]);
  animations.push(["mixamorigLeftArm", "rotation", "x", -Math.PI / 30, "-"]);
  animations.push(["mixamorigLeftArm", "rotation", "z", -Math.PI / 2.6, "-"]);
  ref.animations.push(animations);

  // Close the right fingers BEFORE the right hand moves toward the left palm.
  // This is the same THIS configuration: index straight, all other fingers
  // and the thumb folded while the hands are still separated.
  animations = [];
  animations.push(["mixamorigRightHandIndex1", "rotation", "z", 0, "+"]);
  animations.push(["mixamorigRightHandIndex2", "rotation", "z", 0, "+"]);
  animations.push(["mixamorigRightHandIndex3", "rotation", "z", 0, "+"]);
  for (const finger of ["Middle", "Ring", "Pinky"]) {
    animations.push([`mixamorigRightHand${finger}1`, "rotation", "z", Math.PI / 2, "+"]);
    animations.push([`mixamorigRightHand${finger}2`, "rotation", "z", Math.PI / 2, "+"]);
    animations.push([`mixamorigRightHand${finger}3`, "rotation", "z", Math.PI / 2, "+"]);
  }
  animations.push(["mixamorigRightHandThumb1", "rotation", "x", Math.PI / 2, "+"]);
  animations.push(["mixamorigRightHandThumb1", "rotation", "y", Math.PI / 2, "+"]);
  animations.push(["mixamorigRightHandThumb2", "rotation", "y", -Math.PI / 3, "-"]);
  animations.push(["mixamorigRightHandThumb3", "rotation", "y", -Math.PI / 4, "-"]);
  ref.animations.push(animations);

  // Only after the fingers are closed, move the right index/hand toward the
  // left palm using the H contact direction.
  animations = [];
  animations.push(["mixamorigRightHand", "rotation", "x", -Math.PI / 2, "-"]);
  animations.push(["mixamorigRightHand", "rotation", "y", -Math.PI / 3, "-"]);
  animations.push(["mixamorigRightHand", "rotation", "z", -Math.PI / 4, "-"]);
  animations.push(["mixamorigRightForeArm", "rotation", "z", Math.PI / 6, "+"]);
  animations.push(["mixamorigRightForeArm", "rotation", "x", Math.PI / 18, "+"]);
  animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 60, "-"]);
  ref.animations.push(animations);

  // Brief contact hold.
  animations = [];
  animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 60, "-"]);
  ref.animations.push(animations);

  // Return both hands, fingers, arms, and forearms to defaultPose.
  animations = [];
  for (const side of ["Left", "Right"]) {
    for (const finger of ["Index", "Middle", "Ring", "Pinky"]) {
      for (const segment of [1, 2, 3]) {
        animations.push([`mixamorig${side}Hand${finger}${segment}`, "rotation", "z", 0, "-"]);
      }
    }
    animations.push([`mixamorig${side}HandThumb1`, "rotation", "x", 0, "-"]);
    animations.push([`mixamorig${side}HandThumb1`, "rotation", "y", 0, "-"]);
    animations.push([`mixamorig${side}HandThumb1`, "rotation", "z", 0, "-"]);
    animations.push([`mixamorig${side}HandThumb2`, "rotation", "y", 0, "+"]);
    animations.push([`mixamorig${side}HandThumb3`, "rotation", "y", 0, "+"]);
    animations.push([`mixamorig${side}Hand`, "rotation", "x", 0, "+"]);
    animations.push([`mixamorig${side}Hand`, "rotation", "y", 0, "+"]);
    animations.push([`mixamorig${side}Hand`, "rotation", "z", 0, "+"]);
  }

  animations.push(["mixamorigLeftArm", "rotation", "x", 0, "+"]);
  animations.push(["mixamorigLeftArm", "rotation", "z", -Math.PI / 3, "-"]);
  animations.push(["mixamorigLeftForeArm", "rotation", "x", 0, "+"]);
  animations.push(["mixamorigLeftForeArm", "rotation", "y", -Math.PI / 1.5, "-"]);
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

export default PLACE;
