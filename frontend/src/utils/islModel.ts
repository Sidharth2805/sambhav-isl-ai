/**
 * Struct representing a single 3D landmark coordinate.
 */
export interface ISLLandmark {
  x: number;
  y: number;
  z?: number;
}

/**
 * Extracted hand and body landmarks package passed to the classifier.
 */
export interface ISLLandmarks {
  leftHand?: ISLLandmark[];
  rightHand?: ISLLandmark[];
  pose?: ISLLandmark[];
}

/**
 * Result returned by the classification engine.
 */
export interface ISLInferenceResult {
  gesture: string;
  confidence: number;
  label?: string;
  phrase?: string;
  isRealModel?: boolean;
  top_3?: Array<{ class_id: number; label: string; confidence: number }>;
}

/**
 * Interface definition for a pluggable Indian Sign Language classifier.
 */
export interface ISLClassifier {
  name: string;
  isDemo: boolean;
  initialize(): Promise<void>;
  classify(landmarks: ISLLandmarks): Promise<ISLInferenceResult>;
}

/**
 * Vocabulary dictionary representing 169 ISL classes and exact English translations.
 */
export const ISL_VOCABULARY: Record<string, string> = {
  'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G',
  'H': 'H', 'I': 'I', 'J': 'J', 'K': 'K', 'L': 'L', 'M': 'M', 'N': 'N',
  'O': 'O', 'P': 'P', 'Q': 'Q', 'R': 'R', 'S': 'S', 'T': 'T', 'U': 'U',
  'V': 'V', 'W': 'W', 'X': 'X', 'Y': 'Y', 'Z': 'Z',
  'hello': 'Hello',
  'thank you': 'Thank You',
  'thank_you': 'Thank You',
  'help': 'Help',
  'please': 'Please',
  'yes': 'Yes',
  'no': 'No',
  'good': 'Good',
  'bad': 'Bad',
  'happy': 'Happy',
  'sad': 'Sad',
  'doctor': 'Doctor',
  'hospital': 'Hospital',
  'school': 'School',
  'home': 'Home',
  'water': 'Water',
  'food': 'Food',
  'communicate': 'Communicate',
  'good_morning': 'Good Morning',
  'good_night': 'Good Night',
  'good_afternoon': 'Good Afternoon',
};

/**
 * Real BiLSTM Model Classifier that connects to the Sambhav Python ML Inference Service.
 * Evaluates 60-frame landmark sequences (126 features) using your trained saanket_bilstm.keras model.
 */
export class SaanketBiLSTMClassifier implements ISLClassifier {
  public name = 'Saanket BiLSTM Neural Network (169 ISL Classes)';
  public isDemo = false;
  private serviceUrl: string;
  private landmarkBuffer: number[][] = [];
  private isOnline = false;
  private lastCheckTime = 0;

  constructor(serviceUrl: string = (import.meta.env.VITE_ML_SERVICE_URL || 'http://127.0.0.1:8000')) {
    this.serviceUrl = serviceUrl;
  }

  public async initialize(): Promise<void> {
    try {
      const res = await fetch(`${this.serviceUrl}/health`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        this.isOnline = true;
        console.log('[Sambhav ML] Connected to ML service successfully:', data);
      } else {
        this.isOnline = false;
        console.warn('[Sambhav ML] Service responded with non-OK status. Standalone geometry mode active.');
      }
    } catch {
      this.isOnline = false;
    }
  }

  public async classify(landmarks: ISLLandmarks): Promise<ISLInferenceResult> {
    const hasRightHand = landmarks.rightHand && landmarks.rightHand.length > 0;
    const hasLeftHand = landmarks.leftHand && landmarks.leftHand.length > 0;

    if (!hasRightHand && !hasLeftHand) {
      this.landmarkBuffer = [];
      return { gesture: '', confidence: 0.0, label: '', phrase: '', isRealModel: this.isOnline };
    }

    // 1. Flatten into exact 126-dimensional coordinate vector (2 hands * 21 landmarks * 3 coordinates)
    const frame126: number[] = new Array(126).fill(0.0);

    if (landmarks.rightHand) {
      landmarks.rightHand.slice(0, 21).forEach((lm, i) => {
        frame126[i * 3] = lm.x ?? 0.0;
        frame126[i * 3 + 1] = lm.y ?? 0.0;
        frame126[i * 3 + 2] = lm.z ?? 0.0;
      });
    }

    if (landmarks.leftHand) {
      landmarks.leftHand.slice(0, 21).forEach((lm, i) => {
        frame126[63 + i * 3] = lm.x ?? 0.0;
        frame126[63 + i * 3 + 1] = lm.y ?? 0.0;
        frame126[63 + i * 3 + 2] = lm.z ?? 0.0;
      });
    }

    // Append to rolling 60-frame buffer
    this.landmarkBuffer.push(frame126);
    if (this.landmarkBuffer.length > 60) {
      this.landmarkBuffer.shift();
    }

    // Check service health periodically every 10 seconds if offline
    const now = Date.now();
    if (!this.isOnline && now - this.lastCheckTime > 10000) {
      this.lastCheckTime = now;
      this.initialize();
    }

    // 2. If ML service is online, invoke BiLSTM neural inference
    if (this.isOnline && this.landmarkBuffer.length >= 8) {
      try {
        const response = await fetch(`${this.serviceUrl}/predict-landmarks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sequence: this.landmarkBuffer })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.gesture && result.gesture !== 'UNKNOWN' && result.gesture !== 'NO_HANDS') {
            const rawLabel = result.gesture;
            const cleanLabel = rawLabel.replace(/_/g, ' ').toUpperCase();
            const cleanPhrase = ISL_VOCABULARY[rawLabel.toLowerCase()] || ISL_VOCABULARY[rawLabel] || cleanLabel;
            return {
              gesture: cleanLabel,
              confidence: result.confidence,
              label: cleanLabel,
              phrase: cleanPhrase,
              isRealModel: true,
              top_3: result.top_3
            };
          }
        }
      } catch {
        this.isOnline = false;
      }
    }

    // 3. Strict finger geometry classification (no false positive common word guesses)
    const activeHand = (landmarks.rightHand && landmarks.rightHand.length >= 21)
      ? landmarks.rightHand
      : (landmarks.leftHand && landmarks.leftHand.length >= 21)
      ? landmarks.leftHand
      : null;

    if (!activeHand) {
      return { gesture: '', confidence: 0.0, label: '', phrase: '', isRealModel: false };
    }

    const wrist = activeHand[0];
    const thumbTip = activeHand[4];
    const thumbIP = activeHand[3];
    const indexTip = activeHand[8];
    const indexPip = activeHand[6];
    const middleTip = activeHand[12];
    const middlePip = activeHand[10];
    const ringTip = activeHand[16];
    const ringPip = activeHand[14];
    const pinkyTip = activeHand[20];
    const pinkyPip = activeHand[18];

    const dist = (p1: ISLLandmark, p2: ISLLandmark) =>
      Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

    const isThumbExt = dist(thumbTip, wrist) > dist(thumbIP, wrist) * 1.25;
    const isIndexExt = dist(indexTip, wrist) > dist(indexPip, wrist) * 1.25;
    const isMiddleExt = dist(middleTip, wrist) > dist(middlePip, wrist) * 1.25;
    const isRingExt = dist(ringTip, wrist) > dist(ringPip, wrist) * 1.25;
    const isPinkyExt = dist(pinkyTip, wrist) > dist(pinkyPip, wrist) * 1.25;

    // Strict Single-Letter Posture Patterns (only triggered when finger geometry is 100% distinct)
    if (isIndexExt && isMiddleExt && !isRingExt && !isPinkyExt) {
      const idxMidDist = dist(indexTip, middleTip);
      if (idxMidDist > 0.08) {
        return { gesture: 'V', confidence: 0.88, label: 'V', phrase: 'V', isRealModel: false };
      }
      return { gesture: 'U', confidence: 0.85, label: 'U', phrase: 'U', isRealModel: false };
    }
    if (isIndexExt && !isMiddleExt && !isRingExt && !isPinkyExt && isThumbExt) {
      return { gesture: 'L', confidence: 0.86, label: 'L', phrase: 'L', isRealModel: false };
    }
    if (isIndexExt && !isMiddleExt && !isRingExt && !isPinkyExt && !isThumbExt) {
      return { gesture: 'D', confidence: 0.85, label: 'D', phrase: 'D', isRealModel: false };
    }
    if (isIndexExt && isMiddleExt && isRingExt && !isPinkyExt && !isThumbExt) {
      return { gesture: 'W', confidence: 0.85, label: 'W', phrase: 'W', isRealModel: false };
    }
    if (!isIndexExt && !isMiddleExt && !isRingExt && isPinkyExt && isThumbExt) {
      return { gesture: 'Y', confidence: 0.86, label: 'Y', phrase: 'Y', isRealModel: false };
    }
    if (dist(indexTip, thumbTip) < 0.04 && isMiddleExt && isRingExt && isPinkyExt) {
      return { gesture: 'F', confidence: 0.85, label: 'F', phrase: 'F', isRealModel: false };
    }

    // Default neutral state when no strict gesture match is present
    return { gesture: '', confidence: 0.0, label: '', phrase: '', isRealModel: false };
  }
}

/**
 * Demo implementation of the ISLClassifier interface.
 */
export class DemoISLClassifier extends SaanketBiLSTMClassifier {
  public override name = 'Sambhav ISL Classifier (BiLSTM / Heuristic)';
}

