export const BRIGHT = (ref) => {

    let animations = []

    // Phase 1: Cross forearms in front of chest.
    animations.push(["mixamorigLeftArm", "rotation", "x", -Math.PI / 4, "-"]);
    animations.push(["mixamorigLeftForeArm", "rotation", "y", -Math.PI / 2, "-"]);
    animations.push(["mixamorigLeftForeArm", "rotation", "z", -Math.PI / 4, "-"]);
    animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 4, "-"]);
    animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 2, "+"]);
    animations.push(["mixamorigRightForeArm", "rotation", "z", Math.PI / 4, "+"]);

    ref.animations.push(animations);

    animations = []

    // Phase 2: Raise arms straight up using x only.
    animations.push(["mixamorigLeftArm", "rotation", "x", -Math.PI / 2, "-"]);
    animations.push(["mixamorigLeftForeArm", "rotation", "y", 0, "+"]);
    animations.push(["mixamorigLeftForeArm", "rotation", "z", 0, "+"]);
    animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 2, "-"]);
    animations.push(["mixamorigRightForeArm", "rotation", "y", 0, "-"]);
    animations.push(["mixamorigRightForeArm", "rotation", "z", 0, "-"]);

    ref.animations.push(animations);

    animations = []

    // Phase 3: Sweep arms outward by resetting x and spreading z.
    animations.push(["mixamorigLeftArm", "rotation", "x", 0, "+"]);
    animations.push(["mixamorigLeftArm", "rotation", "z", -Math.PI / 2.5, "-"]);
    animations.push(["mixamorigRightArm", "rotation", "x", 0, "+"]);
    animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 2.5, "+"]);

    ref.animations.push(animations);

    if (ref.pending === false) {
        ref.pending = true;
        ref.animate();
    }

}
