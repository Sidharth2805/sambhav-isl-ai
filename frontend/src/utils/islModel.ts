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

export interface ISLActivityTelemetry {
  activeFrameRatio: number;
  motionFrameRatio: number;
  averageMotion: number;
  maxMotion: number;
  handCount: number;
  gatePassed: boolean;
  rejectionReason?: string;
  inferenceDurationMs?: number;
}

/**
 * Result returned by the classification engine.
 */
export interface ISLInferenceResult {
  gesture: string;
  confidence: number;
  top2Confidence?: number;
  top2Label?: string;
  margin?: number;
  label?: string;
  phrase?: string;
  isRealModel?: boolean;
  frameCount?: number;
  rejectionReason?: string;
  activityTelemetry?: ISLActivityTelemetry;
  top_3?: Array<{ class_id: number; label: string; confidence: number }>;
}

/**
 * Interface definition for a pluggable Indian Sign Language classifier.
 */
export interface ISLClassifier {
  name: string;
  isDemo: boolean;
  isOnline: boolean;
  getIsOnline(): boolean;
  clearBuffer?(): void;
  initialize(): Promise<void>;
  classify(landmarks: ISLLandmarks): Promise<ISLInferenceResult>;
}

/**
 * Vocabulary dictionary representing 169 ISL classes and exact English translations.
 */
/**
 * Vocabulary dictionary representing all 171 ISL classes (Letters A-Z, lowercase a, and 144 ISL words).
 */
export const ISL_VOCABULARY: Record<string, string> = {
  'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G',
  'H': 'H', 'I': 'I', 'J': 'J', 'K': 'K', 'L': 'L', 'M': 'M', 'N': 'N',
  'O': 'O', 'P': 'P', 'Q': 'Q', 'R': 'R', 'S': 'S', 'T': 'T', 'U': 'U',
  'V': 'V', 'W': 'W', 'X': 'X', 'Y': 'Y', 'Z': 'Z', 'a': 'A',
  'again': 'Again', 'am': 'Am', 'an': 'An', 'answer': 'Answer', 'april': 'April', 'august': 'August', 'aunt': 'Aunt',
  'bad': 'Bad', 'beautiful': 'Beautiful', 'book': 'Book', 'boy': 'Boy', 'bright': 'Bright', 'brother': 'Brother', 'bye': 'Bye',
  'camera': 'Camera', 'car': 'Car', 'chair': 'Chair', 'child': 'Child', 'come': 'Come', 'correct': 'Correct', 'dark': 'Dark',
  'daughter': 'Daughter', 'day': 'Day', 'deaf': 'Deaf', 'december': 'December', 'difficult': 'Difficult', 'do': 'Do', 'drink': 'Drink',
  'easy': 'Easy', 'eat': 'Eat', 'face': 'Face', 'family': 'Family', 'fat': 'Fat', 'father': 'Father', 'february': 'February',
  'fine': 'Fine', 'food': 'Food', 'friday': 'Friday', 'friend': 'Friend', 'girl': 'Girl', 'give': 'Give', 'go': 'Go',
  'good': 'Good', 'good_afternoon': 'Good Afternoon', 'good_morning': 'Good Morning', 'good_night': 'Good Night',
  'grandfather': 'Grandfather', 'grandmother': 'Grandmother', 'happy': 'Happy', 'he': 'He', 'hearing': 'Hearing',
  'hello': 'Hello', 'help': 'Help', 'her': 'Her', 'his': 'His', 'home': 'Home', 'hospital': 'Hospital', 'house': 'House',
  'how': 'How', 'husband': 'Husband', 'i': 'I', 'indian': 'Indian', 'is': 'Is', 'it': 'It', 'january': 'January',
  'july': 'July', 'june': 'June', 'know': 'Know', 'language': 'Language', 'man': 'Man', 'march': 'March', 'market': 'Market',
  'married': 'Married', 'marry': 'Marry', 'may': 'May', 'monday': 'Monday', 'money': 'Money', 'month': 'Month',
  'mother': 'Mother', 'my': 'My', 'namaste': 'Namaste', 'name': 'Name', 'no': 'No', 'november': 'November',
  'october': 'October', 'our': 'Our', 'paper': 'Paper', 'place': 'Place', 'please': 'Please', 'practice': 'Practice',
  'question': 'Question', 'remember': 'Remember', 'sad': 'Sad', 'saturday': 'Saturday', 'school': 'School',
  'september': 'September', 'she': 'She', 'short': 'Short', 'sign': 'Sign', 'sister': 'Sister', 'son': 'Son',
  'sorry': 'Sorry', 'strong': 'Strong', 'sunday': 'Sunday', 'table': 'Table', 'take': 'Take', 'tall': 'Tall',
  'teacher': 'Teacher', 'thank_you': 'Thank You', 'thank you': 'Thank You', 'their': 'Their', 'they': 'They',
  'thin': 'Thin', 'this': 'This', 'thursday': 'Thursday', 'time': 'Time', 'to': 'To', 'tree': 'Tree',
  'tuesday': 'Tuesday', 'ugly': 'Ugly', 'uncle': 'Uncle', 'understand': 'Understand', 'want': 'Want', 'water': 'Water',
  'we': 'We', 'weak': 'Weak', 'wednesday': 'Wednesday', 'week': 'Week', 'welcome': 'Welcome', 'what': 'What',
  'when': 'When', 'where': 'Where', 'which': 'Which', 'who': 'Who', 'why': 'Why', 'wife': 'Wife', 'women': 'Women',
  'work': 'Work', 'wrong': 'Wrong', 'year': 'Year', 'yes': 'Yes', 'you': 'You', 'your': 'Your'
};

/**
 * Format any raw ISL class label into clean, title-cased English text.
 */
export const formatISLLabel = (label: string): string => {
  if (!label || label === 'G_UNKNOWN' || label === 'NO_HANDS' || label === 'UNKNOWN') return '';
  if (ISL_VOCABULARY[label]) return ISL_VOCABULARY[label];
  if (ISL_VOCABULARY[label.toLowerCase()]) return ISL_VOCABULARY[label.toLowerCase()];
  
  const clean = label.replace(/_/g, ' ').trim();
  if (clean.length <= 1) return clean.toUpperCase();
  return clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

/**
 * Real BiLSTM Model Classifier that connects to the Sambhav Python ML Inference Service.
 * Evaluates 60-frame landmark sequences (126 features) using your trained saanket_bilstm.keras model.
 */
export class SaanketBiLSTMClassifier implements ISLClassifier {
  public name = 'Saanket BiLSTM Neural Network (171 ISL Classes)';
  public isDemo = false;
  private serviceUrl: string;
  private landmarkBuffer: number[][] = [];
  public isOnline = false;
  private lastCheckTime = 0;

  constructor(serviceUrl?: string) {
    const defaultUrl = import.meta.env.VITE_ML_SERVICE_URL || 'http://127.0.0.1:8000';
    let url = serviceUrl || defaultUrl;
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://127.0.0.1')) {
      console.warn('[Sambhav ML] Deployed on HTTPS but VITE_ML_SERVICE_URL is set to insecure HTTP (127.0.0.1). Set VITE_ML_SERVICE_URL to your HTTPS ML service on Render.');
    }
    this.serviceUrl = url.replace(/\/+$/, '');
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

  public getIsOnline(): boolean {
    return this.isOnline;
  }

  public clearBuffer(): void {
    this.landmarkBuffer = [];
  }

  public async classify(landmarks: ISLLandmarks): Promise<ISLInferenceResult> {
    const hasRightHand = landmarks.rightHand && landmarks.rightHand.length > 0;
    const hasLeftHand = landmarks.leftHand && landmarks.leftHand.length > 0;

    // 1. Flatten into exact 126-dimensional coordinate vector matching saanket_bilstm.keras model schema:
    //    Training extract_landmarks.py sorts detected hands:
    //      - Both hands: Slot 0 = Left (features 0..62), Slot 1 = Right (features 63..125)
    //      - Single hand (Left or Right): Slot 0 = Active Hand (features 0..62), Slot 1 = 63 zeros
    const frame126: number[] = new Array(126).fill(0.0);

    if (hasLeftHand && hasRightHand) {
      if (landmarks.leftHand) {
        landmarks.leftHand.slice(0, 21).forEach((lm, i) => {
          frame126[i * 3] = lm.x ?? 0.0;
          frame126[i * 3 + 1] = lm.y ?? 0.0;
          frame126[i * 3 + 2] = lm.z ?? 0.0;
        });
      }
      if (landmarks.rightHand) {
        landmarks.rightHand.slice(0, 21).forEach((lm, i) => {
          frame126[63 + i * 3] = lm.x ?? 0.0;
          frame126[63 + i * 3 + 1] = lm.y ?? 0.0;
          frame126[63 + i * 3 + 2] = lm.z ?? 0.0;
        });
      }
    } else if (hasLeftHand && landmarks.leftHand) {
      landmarks.leftHand.slice(0, 21).forEach((lm, i) => {
        frame126[i * 3] = lm.x ?? 0.0;
        frame126[i * 3 + 1] = lm.y ?? 0.0;
        frame126[i * 3 + 2] = lm.z ?? 0.0;
      });
    } else if (hasRightHand && landmarks.rightHand) {
      landmarks.rightHand.slice(0, 21).forEach((lm, i) => {
        frame126[i * 3] = lm.x ?? 0.0;
        frame126[i * 3 + 1] = lm.y ?? 0.0;
        frame126[i * 3 + 2] = lm.z ?? 0.0;
      });
    }

    // Append to rolling 60-frame buffer (prevent zero-frame contamination when valid hands enter frame)
    const isHandPresent = hasLeftHand || hasRightHand;
    const isBufferAllZeros = this.landmarkBuffer.length > 0 && this.landmarkBuffer.every(f => f[0] === 0 && f[63] === 0);

    if (isHandPresent && isBufferAllZeros) {
      // Replace raw zero padding with the first valid hand landmark frame to match training padding schema
      this.landmarkBuffer = Array.from({ length: 15 }, () => [...frame126]);
    } else {
      this.landmarkBuffer.push(frame126);
      if (this.landmarkBuffer.length > 60) {
        this.landmarkBuffer.shift();
      }
    }

    if (!hasRightHand && !hasLeftHand) {
      return { gesture: '', confidence: 0.0, label: '', phrase: '', isRealModel: this.isOnline, frameCount: this.landmarkBuffer.length };
    }

    // Check service health periodically every 2 seconds if offline
    const now = Date.now();
    if (!this.isOnline && now - this.lastCheckTime > 2000) {
      this.lastCheckTime = now;
      this.initialize();
    }

    // 2. Active-Sign Temporal Gating: compute hand presence and motion dynamics
    const bufLen = this.landmarkBuffer.length;
    let activeFrameCount = 0;
    let motionFrameCount = 0;
    let totalDisplacement = 0.0;
    let maxDisplacement = 0.0;

    for (let t = 0; t < bufLen; t++) {
      const curr = this.landmarkBuffer[t];
      const h0_active = curr[0] !== 0 || curr[1] !== 0 || curr[2] !== 0;
      const h1_active = curr[63] !== 0 || curr[64] !== 0 || curr[65] !== 0;
      const hasHand = h0_active || h1_active;

      if (hasHand) {
        activeFrameCount++;
      }

      if (t > 0) {
        const prev = this.landmarkBuffer[t - 1];
        const prev_h0 = prev[0] !== 0 || prev[1] !== 0 || prev[2] !== 0;
        const prev_h1 = prev[63] !== 0 || prev[64] !== 0 || prev[65] !== 0;

        let frameDisp = 0.0;
        let pointsCount = 0;

        if (h0_active && prev_h0) {
          for (let i = 0; i < 21; i++) {
            const dx = curr[i * 3] - prev[i * 3];
            const dy = curr[i * 3 + 1] - prev[i * 3 + 1];
            const dz = curr[i * 3 + 2] - prev[i * 3 + 2];
            frameDisp += Math.sqrt(dx * dx + dy * dy + dz * dz);
            pointsCount++;
          }
        }

        if (h1_active && prev_h1) {
          for (let i = 0; i < 21; i++) {
            const dx = curr[63 + i * 3] - prev[63 + i * 3];
            const dy = curr[63 + i * 3 + 1] - prev[63 + i * 3 + 1];
            const dz = curr[63 + i * 3 + 2] - prev[63 + i * 3 + 2];
            frameDisp += Math.sqrt(dx * dx + dy * dy + dz * dz);
            pointsCount++;
          }
        }

        const avgFrameDisp = pointsCount > 0 ? frameDisp / pointsCount : 0.0;
        totalDisplacement += avgFrameDisp;
        if (avgFrameDisp > maxDisplacement) {
          maxDisplacement = avgFrameDisp;
        }
        if (avgFrameDisp >= 0.005) {
          motionFrameCount++;
        }
      }
    }

    const activeFrameRatio = bufLen > 0 ? activeFrameCount / bufLen : 0.0;
    const motionFrameRatio = bufLen > 0 ? motionFrameCount / bufLen : 0.0;
    const averageMotion = bufLen > 1 ? totalDisplacement / (bufLen - 1) : 0.0;
    const currentHandCount = (hasLeftHand ? 1 : 0) + (hasRightHand ? 1 : 0);

    // Gate Criteria: must have at least 25% hand presence AND (motion >= 8% OR deliberate stroke maxDisplacement >= 0.025)
    const gatePassed = activeFrameRatio >= 0.25 && (
      motionFrameRatio >= 0.08 ||
      maxDisplacement >= 0.025
    );

    const telemetry: ISLActivityTelemetry = {
      activeFrameRatio,
      motionFrameRatio,
      averageMotion,
      maxMotion: maxDisplacement,
      handCount: currentHandCount,
      gatePassed,
      rejectionReason: !gatePassed ? 'INSUFFICIENT_ACTIVITY' : undefined
    };

    // If activity gate fails: do NOT call ML inference service. Return explicit NO_ACTIVE_SIGN.
    if (!gatePassed || bufLen < 10) {
      return {
        gesture: '',
        confidence: 0.0,
        label: 'NO_ACTIVE_SIGN',
        phrase: '',
        isRealModel: this.isOnline,
        frameCount: this.landmarkBuffer.length,
        rejectionReason: !gatePassed ? 'INSUFFICIENT_ACTIVITY' : 'BUFFER_PENDING',
        activityTelemetry: telemetry
      };
    }

    // 3. Invoke BiLSTM neural inference only when deliberate active motion or held sign is verified
    const inferenceStartTime = performance.now();
    try {
      const response = await fetch(`${this.serviceUrl}/predict-landmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequence: this.landmarkBuffer })
      });

      const inferenceDuration = performance.now() - inferenceStartTime;
      telemetry.inferenceDurationMs = inferenceDuration;

      if (response.ok) {
        const result = await response.json();
        this.isOnline = true;
        if (result.gesture && result.gesture !== 'UNKNOWN' && result.gesture !== 'NO_HANDS') {
          const rawLabel = result.gesture;
          const formattedText = formatISLLabel(rawLabel);
          return {
            gesture: formattedText,
            confidence: result.confidence,
            top2Confidence: result.top2_confidence || 0.0,
            top2Label: result.top2_label ? formatISLLabel(result.top2_label) : '',
            margin: result.margin || 0.0,
            label: formattedText,
            phrase: formattedText,
            isRealModel: true,
            frameCount: this.landmarkBuffer.length,
            activityTelemetry: telemetry,
            top_3: result.top_3
          };
        }
      }
    } catch {
      this.isOnline = false;
    }

    return {
      gesture: '',
      confidence: 0.0,
      label: '',
      phrase: '',
      isRealModel: false,
      frameCount: this.landmarkBuffer.length,
      activityTelemetry: telemetry
    };
  }

  public getLatestBuffer(): number[][] {
    return this.landmarkBuffer;
  }
}

/**
 * Demo implementation of the ISLClassifier interface.
 */
export class DemoISLClassifier extends SaanketBiLSTMClassifier {
  public override name = 'Sambhav ISL Classifier (BiLSTM / Heuristic)';
}

/**
 * Dedicated Sambhav Model 2 Classifier Adapter.
 */
export class SambhavModel2Classifier extends SaanketBiLSTMClassifier {
  public override name = 'Sambhav Model 2 Classifier (10-layer BiLSTM)';
}

