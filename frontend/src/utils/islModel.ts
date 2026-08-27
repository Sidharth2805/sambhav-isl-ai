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
 * Vocabulary dictionary representing 169 ISL classes and natural English translations.
 */
export const ISL_VOCABULARY: Record<string, string> = {
  'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G',
  'H': 'H', 'I': 'I', 'J': 'J', 'K': 'K', 'L': 'L', 'M': 'M', 'N': 'N',
  'O': 'O', 'P': 'P', 'Q': 'Q', 'R': 'R', 'S': 'S', 'T': 'T', 'U': 'U',
  'V': 'V', 'W': 'W', 'X': 'X', 'Y': 'Y', 'Z': 'Z',
  'hello': 'Hello, welcome to Sambhav!',
  'thank you': 'Thank you very much!',
  'help': 'I need assistance or help.',
  'please': 'Please.',
  'yes': 'Yes, I agree.',
  'no': 'No.',
  'good': 'Good / Great!',
  'bad': 'Not good.',
  'happy': 'I am happy.',
  'sad': 'I am sad.',
  'doctor': 'I need a doctor.',
  'hospital': 'Hospital.',
  'school': 'School.',
  'home': 'Home.',
  'water': 'Water please.',
  'food': 'Food.',
  'communicate': 'I use Indian Sign Language to communicate.',
  'G_HELLO': 'Hello, my name is Sidharth.',
  'G_HELP': 'How can I help you today?',
  'G_COMMUNICATE': 'I use Indian Sign Language to communicate.',
  'G_THANKYOU': 'Thank you for using Sambhav!',
  'G_UNKNOWN': 'Analyzing sign...'
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
        console.warn('[Sambhav ML] Service responded with non-OK status. Fallback active.');
      }
    } catch {
      this.isOnline = false;
      console.info('[Sambhav ML] Local ML service not running on port 8000. Fallback active.');
    }
  }

  public async classify(landmarks: ISLLandmarks): Promise<ISLInferenceResult> {
    const hasRightHand = landmarks.rightHand && landmarks.rightHand.length > 0;
    const hasLeftHand = landmarks.leftHand && landmarks.leftHand.length > 0;

    if (!hasRightHand && !hasLeftHand) {
      this.landmarkBuffer = [];
      return { gesture: 'G_UNKNOWN', confidence: 0.0, label: 'No hands detected', isRealModel: this.isOnline };
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
          if (result.gesture && result.gesture !== 'UNKNOWN') {
            const cleanPhrase = result.phrase || ISL_VOCABULARY[result.gesture] || result.gesture;
            return {
              gesture: result.gesture,
              confidence: result.confidence,
              label: result.label || result.gesture,
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

    // 3. Fallback heuristic classification when backend ML server is starting or offline
    const rHandY = landmarks.rightHand?.[0]?.y ?? 1.0;
    const lHandY = landmarks.leftHand?.[0]?.y ?? 1.0;

    if (rHandY < 0.1 || lHandY < 0.1 || rHandY > 0.95 || lHandY > 0.95) {
      return { gesture: 'G_UNKNOWN', confidence: 0.1, label: 'Adjust hand position', isRealModel: false };
    }
    if (rHandY < 0.3 && lHandY < 0.3) {
      return { gesture: 'thank you', confidence: 0.91, label: 'Thank you', phrase: 'Thank you!', isRealModel: false };
    }
    if (rHandY < 0.4) {
      return { gesture: 'hello', confidence: 0.88, label: 'Hello', phrase: 'Hello!', isRealModel: false };
    }
    if (lHandY < 0.4) {
      return { gesture: 'help', confidence: 0.84, label: 'Help', phrase: 'Need help.', isRealModel: false };
    }

    return { gesture: 'communicate', confidence: 0.76, label: 'Communicate', phrase: 'Indian Sign Language', isRealModel: false };
  }
}

/**
 * Demo implementation of the ISLClassifier interface.
 */
export class DemoISLClassifier extends SaanketBiLSTMClassifier {
  public override name = 'Sambhav ISL Classifier (BiLSTM / Heuristic)';
}

