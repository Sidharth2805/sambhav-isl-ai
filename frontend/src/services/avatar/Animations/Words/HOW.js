export const HOW = (ref) => {
  let animations = []

  // Both hands start at chest height with curved fingers and thumbs tucked
  // against them, matching the starting pose in the reference video.
  const hands = [
    { side: "Right", sign: 1 },
    { side: "Left", sign: -1 }
  ];

  for (const { side, sign } of hands) {
    for (const finger of ["Index", "Middle", "Ring", "Pinky"]) {
      animations.push([`mixamorig${side}Hand${finger}1`, "rotation", "z", Math.PI / 2, "+"]);
      animations.push([`mixamorig${side}Hand${finger}2`, "rotation", "z", Math.PI / 2, "+"]);
      animations.push([`mixamorig${side}Hand${finger}3`, "rotation", "z", Math.PI / 2, "+"]);
    }

    // Mirrored tucked-thumb configuration.
    animations.push([`mixamorig${side}HandThumb1`, "rotation", "x", Math.PI / 6, "+"]);
    animations.push([`mixamorig${side}HandThumb1`, "rotation", "y", sign * Math.PI / 4, sign > 0 ? "+" : "-"]);
    animations.push([`mixamorig${side}HandThumb2`, "rotation", "y", -sign * Math.PI / 8, sign > 0 ? "-" : "+"]);
    animations.push([`mixamorig${side}HandThumb3`, "rotation", "y", -sign * Math.PI / 12, sign > 0 ? "-" : "+"]);

    // Palms face the body before the twist; arms remain at chest height.
    animations.push([`mixamorig${side}Hand`, "rotation", "z", -sign * Math.PI / 4, sign > 0 ? "-" : "+"]);
    animations.push([`mixamorig${side}Hand`, "rotation", "y", -sign * Math.PI / 3, sign > 0 ? "-" : "+"]);
    animations.push([`mixamorig${side}Arm`, "rotation", "x", -Math.PI / 8, "-"]);
    animations.push([`mixamorig${side}Arm`, "rotation", "z", sign * Math.PI / 2.2, sign > 0 ? "+" : "-"]);
    animations.push([`mixamorig${side}ForeArm`, "rotation", "x", 0, "-"]);
    animations.push([`mixamorig${side}ForeArm`, "rotation", "y", sign * Math.PI / 1.5, sign > 0 ? "+" : "-"]);
    animations.push([`mixamorig${side}ForeArm`, "rotation", "z", 0, "-"]);
  }
  ref.animations.push(animations);

  // One simultaneous outward-and-upward wrist twist. Both hands stay at
  // chest height because neither shoulder nor upper-arm height changes.
  animations = []
  animations.push(["mixamorigRightHand", "rotation", "x", -Math.PI / 2, "-"]);
  animations.push(["mixamorigRightHand", "rotation", "y", 0, "+"]);
  animations.push(["mixamorigRightHand", "rotation", "z", 0, "+"]);
  animations.push(["mixamorigLeftHand", "rotation", "x", -Math.PI / 2, "-"]);
  animations.push(["mixamorigLeftHand", "rotation", "y", 0, "+"]);
  animations.push(["mixamorigLeftHand", "rotation", "z", 0, "+"]);
  ref.animations.push(animations);

  // Reset both hands, fingers, thumbs, forearms, and arms.
  animations = []
  for (const side of ["Right", "Left"]) {
    for (const finger of ["Index", "Middle", "Ring", "Pinky"]) {
      for (const segment of [1, 2, 3]) {
        animations.push([`mixamorig${side}Hand${finger}${segment}`, "rotation", "z", 0, "-"]);
      }
    }
    animations.push([`mixamorig${side}HandThumb1`, "rotation", "x", 0, "-"]);
    animations.push([`mixamorig${side}HandThumb1`, "rotation", "y", 0, "-"]);
    animations.push([`mixamorig${side}HandThumb2`, "rotation", "y", 0, "+"]);
    animations.push([`mixamorig${side}HandThumb3`, "rotation", "y", 0, "+"]);
    animations.push([`mixamorig${side}Hand`, "rotation", "x", 0, "+"]);
    animations.push([`mixamorig${side}Hand`, "rotation", "y", 0, "+"]);
    animations.push([`mixamorig${side}Hand`, "rotation", "z", 0, "+"]);
    animations.push([`mixamorig${side}Arm`, "rotation", "x", 0, "-"]);
    animations.push([`mixamorig${side}Arm`, "rotation", "z", side === "Right" ? Math.PI / 3 : -Math.PI / 3, side === "Right" ? "+" : "-"]);
    animations.push([`mixamorig${side}ForeArm`, "rotation", "x", 0, "-"]);
    animations.push([`mixamorig${side}ForeArm`, "rotation", "y", side === "Right" ? Math.PI / 1.5 : -Math.PI / 1.5, side === "Right" ? "+" : "-"]);
    animations.push([`mixamorig${side}ForeArm`, "rotation", "z", 0, "-"]);
  }
  ref.animations.push(animations);

  if (ref.pending === false) {
    ref.pending = true;
    ref.animate();
  }
}

export default HOW;

