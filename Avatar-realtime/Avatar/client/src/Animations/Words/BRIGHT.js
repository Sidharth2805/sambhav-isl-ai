export const BRIGHT = (ref) => {

    let animations = []

    // Phase 1: Move both hands straight upward first.
    // No outward arm swing is applied in this phase.
    animations.push(["mixamorigLeftArm", "rotation", "x", -Math.PI / 2, "-"]);
    animations.push(["mixamorigLeftForeArm", "rotation", "x", Math.PI / 4, "+"]);
    animations.push(["mixamorigLeftForeArm", "rotation", "y", 0, "+"]);
    animations.push(["mixamorigLeftForeArm", "rotation", "z", 0, "+"]);
    animations.push(["mixamorigLeftHand", "rotation", "x", 0, "+"]);
    animations.push(["mixamorigLeftHand", "rotation", "y", 0, "+"]);
    animations.push(["mixamorigLeftHand", "rotation", "z", 0, "+"]);

    animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 2, "-"]);
    animations.push(["mixamorigRightForeArm", "rotation", "x", Math.PI / 4, "+"]);
    animations.push(["mixamorigRightForeArm", "rotation", "y", 0, "-"]);
    animations.push(["mixamorigRightForeArm", "rotation", "z", 0, "-"]);
    animations.push(["mixamorigRightHand", "rotation", "x", 0, "+"]);
    animations.push(["mixamorigRightHand", "rotation", "y", 0, "+"]);
    animations.push(["mixamorigRightHand", "rotation", "z", 0, "+"]);

    ref.animations.push(animations);

    animations = []

    // Phase 2: Begin the quarter-circle: hands leave the top position,
    // moving down slightly before moving fully outward.
    animations.push(["mixamorigLeftArm", "rotation", "z", Math.PI / 4, "+"]);
    animations.push(["mixamorigLeftForeArm", "rotation", "y", -Math.PI / 3, "-"]);
    animations.push(["mixamorigRightArm", "rotation", "z", -Math.PI / 4, "-"]);
    animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 3, "+"]);

    ref.animations.push(animations);

    animations = []

    // Phase 3: Complete the quarter-circle downward and outward.
    animations.push(["mixamorigLeftArm", "rotation", "z", Math.PI / 4, "+"]);
    animations.push(["mixamorigLeftForeArm", "rotation", "x", -Math.PI / 4, "-"]);
    animations.push(["mixamorigLeftForeArm", "rotation", "y", -Math.PI / 3, "-"]);
    animations.push(["mixamorigRightArm", "rotation", "z", -Math.PI / 4, "-"]);
    animations.push(["mixamorigRightForeArm", "rotation", "x", -Math.PI / 4, "-"]);
    animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 3, "+"]);

    ref.animations.push(animations);

    animations = []

    // Phase 4: Return to the resting/default pose.
    animations.push(["mixamorigLeftArm", "rotation", "x", 0, "+"]);
    animations.push(["mixamorigLeftArm", "rotation", "z", -Math.PI / 2, "-"]);
    animations.push(["mixamorigLeftForeArm", "rotation", "x", 0, "-"]);
    animations.push(["mixamorigLeftForeArm", "rotation", "y", 0, "+"]);
    animations.push(["mixamorigLeftForeArm", "rotation", "z", 0, "+"]);
    animations.push(["mixamorigLeftHand", "rotation", "x", 0, "-"]);
    animations.push(["mixamorigLeftHand", "rotation", "y", 0, "-"]);
    animations.push(["mixamorigLeftHand", "rotation", "z", 0, "-"]);

    animations.push(["mixamorigRightArm", "rotation", "x", 0, "+"]);
    animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 2, "+"]);
    animations.push(["mixamorigRightForeArm", "rotation", "x", 0, "-"]);
    animations.push(["mixamorigRightForeArm", "rotation", "y", 0, "-"]);
    animations.push(["mixamorigRightForeArm", "rotation", "z", 0, "-"]);
    animations.push(["mixamorigRightHand", "rotation", "x", 0, "-"]);
    animations.push(["mixamorigRightHand", "rotation", "y", 0, "-"]);
    animations.push(["mixamorigRightHand", "rotation", "z", 0, "-"]);

    ref.animations.push(animations);

    if (ref.pending === false) {
        ref.pending = true;
        ref.animate();
    }

}
