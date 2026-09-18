export const BEAUTIFUL = (ref) => {
    let animations = []

    // Convert.js treats the fourth value as an absolute target rotation.
    // This initial pose follows the working PERSON.js orientation: the hand
    // starts in front of the torso rather than using a large arm-Y rotation.

    // Index finger points inward toward the avatar's own face. All three
    // segments use the same half-turn so the finger stays aligned.
    animations.push(["mixamorigRightHandIndex1", "rotation", "z", Math.PI, "+"]);
    animations.push(["mixamorigRightHandIndex2", "rotation", "z", Math.PI, "+"]);
    animations.push(["mixamorigRightHandIndex3", "rotation", "z", Math.PI, "+"]);

    // Other fingers remain folded.
    animations.push(["mixamorigRightHandMiddle1", "rotation", "z", Math.PI / 2, "+"]);
    animations.push(["mixamorigRightHandMiddle2", "rotation", "z", Math.PI / 2, "+"]);
    animations.push(["mixamorigRightHandMiddle3", "rotation", "z", Math.PI / 2, "+"]);
    animations.push(["mixamorigRightHandRing1", "rotation", "z", Math.PI / 2, "+"]);
    animations.push(["mixamorigRightHandRing2", "rotation", "z", Math.PI / 2, "+"]);
    animations.push(["mixamorigRightHandRing3", "rotation", "z", Math.PI / 2, "+"]);
    animations.push(["mixamorigRightHandPinky1", "rotation", "z", Math.PI / 2, "+"]);
    animations.push(["mixamorigRightHandPinky2", "rotation", "z", Math.PI / 2, "+"]);
    animations.push(["mixamorigRightHandPinky3", "rotation", "z", Math.PI / 2, "+"]);

    // Thumb stays folded until the pinch.
    animations.push(["mixamorigRightHandThumb1", "rotation", "x", Math.PI / 3, "+"]);
    animations.push(["mixamorigRightHandThumb1", "rotation", "y", Math.PI / 3, "+"]);
    animations.push(["mixamorigRightHandThumb2", "rotation", "y", -Math.PI / 6, "-"]);
    animations.push(["mixamorigRightHandThumb3", "rotation", "y", -Math.PI / 10, "-"]);

    // Start directly in the bent, face-level pose. The palm is turned inward
    // toward the avatar's own face before the circular motion begins.
    animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 2, "-"]);
    animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 2.2, "+"]);
    animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 1.5, "+"]);
    animations.push(["mixamorigRightForeArm", "rotation", "z", 0, "-"]);
    animations.push(["mixamorigRightHand", "rotation", "x", 0, "-"]);
    animations.push(["mixamorigRightHand", "rotation", "z", 0, "-"]);
    animations.push(["mixamorigRightHand", "rotation", "y", 0, "+"]);
    ref.animations.push(animations);

    // Move the extended index around the front of the face. Every value is an
    // absolute target, so the hand remains in the front-facing orientation.

    // The old sequential arc is retained below for reference but disabled;
    // it produced a side-parallel motion. The controller-driven circle below
    // is the actual pointing movement.
    if (false) {
        // 1. Upper-left and slightly forward.
        animations = []
        animations.push(["mixamorigRightHandIndex1", "rotation", "z", Math.PI, "+"]);
        animations.push(["mixamorigRightHandIndex2", "rotation", "z", Math.PI, "+"]);
        animations.push(["mixamorigRightHandIndex3", "rotation", "z", Math.PI, "+"]);
        animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 2, "-"]);
        animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 1.3, "+"]);
        animations.push(["mixamorigRightForeArm", "rotation", "x", -Math.PI / 6, "-"]);
        animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 1.5, "+"]);
        animations.push(["mixamorigRightHand", "rotation", "x", 0, "-"]);
        animations.push(["mixamorigRightHand", "rotation", "y", 0, "+"]);
        animations.push(["mixamorigRightHand", "rotation", "z", 0, "-"]);
        ref.animations.push(animations);

        // 2. Upper-center, closer to the face.
        animations = []
        animations.push(["mixamorigRightHandIndex1", "rotation", "z", Math.PI, "+"]);
        animations.push(["mixamorigRightHandIndex2", "rotation", "z", Math.PI, "+"]);
        animations.push(["mixamorigRightHandIndex3", "rotation", "z", Math.PI, "+"]);
        animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 1.7, "+"]);
        animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 1.7, "+"]);
        animations.push(["mixamorigRightForeArm", "rotation", "x", -Math.PI / 10, "+"]);
        animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 1.5, "+"]);
        animations.push(["mixamorigRightHand", "rotation", "x", 0, "-"]);
        animations.push(["mixamorigRightHand", "rotation", "y", 0, "+"]);
        animations.push(["mixamorigRightHand", "rotation", "z", 0, "-"]);
        ref.animations.push(animations);

        // 3. Upper-right across the front of the face.
        animations = []
        animations.push(["mixamorigRightHandIndex1", "rotation", "z", Math.PI, "+"]);
        animations.push(["mixamorigRightHandIndex2", "rotation", "z", Math.PI, "+"]);
        animations.push(["mixamorigRightHandIndex3", "rotation", "z", Math.PI, "+"]);
        animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 2.2, "-"]);
        animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 2.1, "+"]);
        animations.push(["mixamorigRightForeArm", "rotation", "x", Math.PI / 10, "+"]);
        animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 1.5, "+"]);
        animations.push(["mixamorigRightHand", "rotation", "x", 0, "-"]);
        animations.push(["mixamorigRightHand", "rotation", "y", 0, "+"]);
        animations.push(["mixamorigRightHand", "rotation", "z", 0, "-"]);
        ref.animations.push(animations);

        // 4. Lower-right near the cheek and mouth.
        animations = []
        animations.push(["mixamorigRightHandIndex1", "rotation", "z", Math.PI, "+"]);
        animations.push(["mixamorigRightHandIndex2", "rotation", "z", Math.PI, "+"]);
        animations.push(["mixamorigRightHandIndex3", "rotation", "z", Math.PI, "+"]);
        animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 3, "+"]);
        animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 2.5, "+"]);
        animations.push(["mixamorigRightForeArm", "rotation", "x", Math.PI / 6, "+"]);
        animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 1.5, "+"]);
        animations.push(["mixamorigRightHand", "rotation", "x", 0, "-"]);
        animations.push(["mixamorigRightHand", "rotation", "y", 0, "+"]);
        animations.push(["mixamorigRightHand", "rotation", "z", 0, "-"]);
        ref.animations.push(animations);

        // 5. Lower-center, pulled slightly toward the avatar.
        animations = []
        animations.push(["mixamorigRightHandIndex1", "rotation", "z", Math.PI, "+"]);
        animations.push(["mixamorigRightHandIndex2", "rotation", "z", Math.PI, "+"]);
        animations.push(["mixamorigRightHandIndex3", "rotation", "z", Math.PI, "+"]);
        animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 4, "+"]);
        animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 1.8, "-"]);
        animations.push(["mixamorigRightForeArm", "rotation", "x", Math.PI / 10, "-"]);
        animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 1.5, "+"]);
        animations.push(["mixamorigRightHand", "rotation", "x", 0, "-"]);
        animations.push(["mixamorigRightHand", "rotation", "y", 0, "+"]);
        animations.push(["mixamorigRightHand", "rotation", "z", 0, "-"]);
        ref.animations.push(animations);

        // 6. Return to the upper-left point to complete the loop.
        animations = []
        animations.push(["mixamorigRightHandIndex1", "rotation", "z", Math.PI, "+"]);
        animations.push(["mixamorigRightHandIndex2", "rotation", "z", Math.PI, "+"]);
        animations.push(["mixamorigRightHandIndex3", "rotation", "z", Math.PI, "+"]);
        animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 2, "-"]);
        animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 1.3, "+"]);
        animations.push(["mixamorigRightForeArm", "rotation", "x", -Math.PI / 6, "-"]);
        animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 1.5, "+"]);
        animations.push(["mixamorigRightHand", "rotation", "x", 0, "-"]);
        animations.push(["mixamorigRightHand", "rotation", "y", 0, "+"]);
        animations.push(["mixamorigRightHand", "rotation", "z", 0, "-"]);
        ref.animations.push(animations);
    }

    // True circular pointing path. Convert.js updates the arm rotation on
    // every frame, including depth, so the extended index loops in front of
    // the avatar's face instead of moving only beside it.
    // Runtime-safe front-facing pointing phase. Convert.js supports normal
    // bone/action/axis/target entries, so no custom queue token is used.
    animations = []
    animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 2, "-"]);
    animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 2.2, "+"]);
    animations.push(["mixamorigRightForeArm", "rotation", "x", 0, "-"]);
    animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 1.5, "+"]);
    animations.push(["mixamorigRightForeArm", "rotation", "z", 0, "-"]);
    animations.push(["mixamorigRightHand", "rotation", "x", 0, "-"]);
    animations.push(["mixamorigRightHand", "rotation", "y", 0, "+"]);
    animations.push(["mixamorigRightHand", "rotation", "z", 0, "-"]);
    ref.animations.push(animations);

    // Pinch after the finger has completed its front-of-face movement.
    // Use a moderate index curl and the forward thumb shape from PERSON.js;
    // the previous +PI/2 thumb targets rotated the thumb backward.
    animations = []
    animations.push(["mixamorigRightHandIndex1", "rotation", "z", Math.PI / 9, "+"]);
    animations.push(["mixamorigRightHandIndex2", "rotation", "z", Math.PI / 4.5, "+"]);
    animations.push(["mixamorigRightHandIndex3", "rotation", "z", Math.PI / 8, "+"]);
    animations.push(["mixamorigRightHandThumb1", "rotation", "x", Math.PI / 3, "+"]);
    animations.push(["mixamorigRightHandThumb1", "rotation", "y", Math.PI / 3, "+"]);
    animations.push(["mixamorigRightHandThumb2", "rotation", "y", -Math.PI / 6, "-"]);
    animations.push(["mixamorigRightHandThumb3", "rotation", "y", -Math.PI / 10, "-"]);
    // Natural pinch orientation from PERSON.js: the palm faces forward,
    // the thumb curls toward the index, and the arm remains at face level.
    animations.push(["mixamorigRightHand", "rotation", "x", 0, "-"]);
    animations.push(["mixamorigRightHand", "rotation", "y", -Math.PI / 3, "-"]);
    animations.push(["mixamorigRightHand", "rotation", "z", -Math.PI / 4, "-"]);
    animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 5, "-"]);
    animations.push(["mixamorigRightArm", "rotation", "z", Math.PI / 2.2, "+"]);
    animations.push(["mixamorigRightForeArm", "rotation", "y", Math.PI / 1.5, "+"]);
    animations.push(["mixamorigRightForeArm", "rotation", "z", 0, "-"]);
    ref.animations.push(animations);

    // Exact final reset. Convert.js moves each axis to the fourth value;
    // therefore every axis changed above must be listed here explicitly.
    animations = []
    animations.push(["mixamorigRightShoulder", "rotation", "x", 0, "+"]);
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
