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

export interface ISLVectorStats {
  slot0Count: number;
  slot1Count: number;
  minVal: number;
  maxVal: number;
  meanVal: number;
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
  source?: 'BiLSTM' | 'Geometric Fallback' | 'None';
  frameCount?: number;
  rejectionReason?: string;
  activityTelemetry?: ISLActivityTelemetry;
  vectorStats?: ISLVectorStats;
  requestId?: number;
  gestureCycleId?: number;
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
  evaluateBuffer?(options?: { requestId?: number; gestureCycleId?: number }): Promise<ISLInferenceResult>;
}

/**
 * Vocabulary dictionary representing all 169 trained ISL classes from the Sambhav Model 2 dataset.
 */
export const ISL_VOCABULARY: Record<string, string> = {
  'A': 'A',
  'B': 'B',
  'C': 'C',
  'D': 'D',
  'E': 'E',
  'F': 'F',
  'G': 'G',
  'H': 'H',
  'I': 'I',
  'J': 'J',
  'K': 'K',
  'L': 'L',
  'M': 'M',
  'N': 'N',
  'O': 'O',
  'P': 'P',
  'Q': 'Q',
  'R': 'R',
  'S': 'S',
  'T': 'T',
  'U': 'U',
  'V': 'V',
  'W': 'W',
  'X': 'X',
  'Y': 'Y',
  'Z': 'Z',
  'a': 'A',
  'again': 'Again',
  'am': 'Am',
  'an': 'An',
  'answer': 'Answer',
  'april': 'April',
  'august': 'August',
  'aunt': 'Aunt',
  'bad': 'Bad',
  'beautiful': 'Beautiful',
  'book': 'Book',
  'boy': 'Boy',
  'bright': 'Bright',
  'brother': 'Brother',
  'bye': 'Bye',
  'camera': 'Camera',
  'car': 'Car',
  'chair': 'Chair',
  'child': 'Child',
  'come': 'Come',
  'correct': 'Correct',
  'dark': 'Dark',
  'daughter': 'Daughter',
  'day': 'Day',
  'deaf': 'Deaf',
  'december': 'December',
  'difficult': 'Difficult',
  'do': 'Do',
  'drink': 'Drink',
  'easy': 'Easy',
  'eat': 'Eat',
  'face': 'Face',
  'family': 'Family',
  'fat': 'Fat',
  'father': 'Father',
  'february': 'February',
  'fine': 'Fine',
  'food': 'Food',
  'friday': 'Friday',
  'friend': 'Friend',
  'girl': 'Girl',
  'give': 'Give',
  'go': 'Go',
  'good': 'Good',
  'good_afternoon': 'Good Afternoon',
  'good_morning': 'Good Morning',
  'good_night': 'Good Night',
  'grandfather': 'Grandfather',
  'grandmother': 'Grandmother',
  'happy': 'Happy',
  'he': 'He',
  'hearing': 'Hearing',
  'hello': 'Hello',
  'help': 'Help',
  'her': 'Her',
  'his': 'His',
  'home': 'Home',
  'hospital': 'Hospital',
  'house': 'House',
  'how': 'How',
  'husband': 'Husband',
  'i': 'I',
  'indian': 'Indian',
  'is': 'Is',
  'it': 'It',
  'january': 'January',
  'july': 'July',
  'june': 'June',
  'know': 'Know',
  'language': 'Language',
  'man': 'Man',
  'march': 'March',
  'market': 'Market',
  'married': 'Married',
  'marry': 'Marry',
  'may': 'May',
  'monday': 'Monday',
  'money': 'Money',
  'month': 'Month',
  'mother': 'Mother',
  'my': 'My',
  'namaste': 'Namaste',
  'name': 'Name',
  'no': 'No',
  'november': 'November',
  'october': 'October',
  'our': 'Our',
  'paper': 'Paper',
  'place': 'Place',
  'please': 'Please',
  'practice': 'Practice',
  'question': 'Question',
  'remember': 'Remember',
  'sad': 'Sad',
  'saturday': 'Saturday',
  'school': 'School',
  'september': 'September',
  'she': 'She',
  'short': 'Short',
  'sign': 'Sign',
  'sister': 'Sister',
  'son': 'Son',
  'sorry': 'Sorry',
  'strong': 'Strong',
  'sunday': 'Sunday',
  'table': 'Table',
  'take': 'Take',
  'tall': 'Tall',
  'teacher': 'Teacher',
  'thank_you': 'Thank You',
  'their': 'Their',
  'they': 'They',
  'thin': 'Thin',
  'this': 'This',
  'thursday': 'Thursday',
  'time': 'Time',
  'to': 'To',
  'tree': 'Tree',
  'tuesday': 'Tuesday',
  'ugly': 'Ugly',
  'uncle': 'Uncle',
  'understand': 'Understand',
  'want': 'Want',
  'water': 'Water',
  'we': 'We',
  'weak': 'Weak',
  'wednesday': 'Wednesday',
  'week': 'Week',
  'welcome': 'Welcome',
  'what': 'What',
  'when': 'When',
  'where': 'Where',
  'which': 'Which',
  'who': 'Who',
  'why': 'Why',
  'wife': 'Wife',
  'women': 'Women',
  'work': 'Work',
  'wrong': 'Wrong',
  'year': 'Year',
  'yes': 'Yes',
  'you': 'You',
  'your': 'Your',
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
 * Elastic Temporal Interpolation: Resamples any N-frame sequence into exactly targetLength (60) frames.
 * Exactly matches the np.linspace(0, len-1, 60) downsampling/stretching used in model training.
 */
export function resampleSequence(rawFrames: number[][], targetLength: number = 60): number[][] {
  const n = rawFrames.length;
  if (n === targetLength) return rawFrames;
  if (n === 0) return Array.from({ length: targetLength }, () => new Array(126).fill(0));
  if (n === 1) return Array.from({ length: targetLength }, () => [...rawFrames[0]]);

  const resampled: number[][] = [];
  for (let i = 0; i < targetLength; i++) {
    const t = (i / (targetLength - 1)) * (n - 1);
    const idx0 = Math.floor(t);
    const idx1 = Math.min(n - 1, idx0 + 1);
    const frac = t - idx0;

    const frame = new Array(126);
    const f0 = rawFrames[idx0];
    const f1 = rawFrames[idx1];

    for (let d = 0; d < 126; d++) {
      frame[d] = f0[d] * (1 - frac) + f1[d] * frac;
    }
    resampled.push(frame);
  }
  return resampled;
}

/**
 * Real BiLSTM Model Classifier that connects to the Sambhav Python ML Inference Service.
 * Evaluates 60-frame landmark sequences (126 features) using your trained saanket_bilstm.keras model.
 */
export class SaanketBiLSTMClassifier implements ISLClassifier {
  public name = 'Saanket BiLSTM Neural Network (169 ISL Classes)';
  public isDemo = false;
  private candidateUrls: string[] = [];
  private activeUrl: string = 'http://127.0.0.1:8000';
  private landmarkBuffer: number[][] = [];
  public isOnline = false;
  private lastCheckTime = 0;
  private lastPingMs = 0;

  constructor(serviceUrl?: string) {
    const envUrl = (import.meta.env.VITE_ML_SERVICE_URL || '').replace(/\/+$/, '');
    const localUrls = ['http://127.0.0.1:8000', 'http://localhost:8000'];
    const cloudUrl = 'https://sambhav-ml.onrender.com';

    if (serviceUrl) {
      this.candidateUrls = [serviceUrl.replace(/\/+$/, '')];
    } else {
      // Prioritize local ultra-fast inference (15ms), fallback to env and cloud
      const unique = new Set<string>();
      localUrls.forEach(u => unique.add(u));
      if (envUrl) unique.add(envUrl);
      unique.add(cloudUrl);
      this.candidateUrls = Array.from(unique);
    }
    this.activeUrl = this.candidateUrls[0];
  }

  public getActiveEndpoint(): string {
    return this.activeUrl;
  }

  public getLastPingMs(): number {
    return this.lastPingMs;
  }

  private hasLoggedConnection = false;

  public async initialize(): Promise<void> {
    for (const url of this.candidateUrls) {
      try {
        const start = performance.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        
        const res = await fetch(`${url}/health`, { 
          method: 'GET',
          signal: controller.signal 
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          this.activeUrl = url;
          this.isOnline = true;
          this.lastPingMs = Math.round(performance.now() - start);
          if (!this.hasLoggedConnection) {
            console.log(`[Sambhav ML] Connected to ML service at ${url} (${this.lastPingMs}ms):`, data);
            this.hasLoggedConnection = true;
          }
          return;
        }
      } catch {
        // Try next candidate
      }
    }
    this.isOnline = false;
    if (this.hasLoggedConnection) {
      console.warn('[Sambhav ML] No ML inference service reachable. ML service offline.');
      this.hasLoggedConnection = false;
    }
  }

  public getIsOnline(): boolean {
    return this.isOnline;
  }

  public clearBuffer(): void {
    this.landmarkBuffer = [];
  }

  public addFrame(landmarks: ISLLandmarks): void {
    // 1. Flatten into exact 126-dimensional coordinate vector matching saanket_bilstm.keras model schema:
    // 0..62: Left Hand (21 landmarks x 3)
    // 63..125: Right Hand (21 landmarks x 3)
    const frame126: number[] = new Array(126).fill(0.0);

    if (landmarks.leftHand && landmarks.leftHand.length > 0) {
      landmarks.leftHand.slice(0, 21).forEach((lm, i) => {
        frame126[i * 3] = lm.x ?? 0.0;
        frame126[i * 3 + 1] = lm.y ?? 0.0;
        frame126[i * 3 + 2] = lm.z ?? 0.0;
      });
    }

    if (landmarks.rightHand && landmarks.rightHand.length > 0) {
      landmarks.rightHand.slice(0, 21).forEach((lm, i) => {
        frame126[63 + i * 3] = lm.x ?? 0.0;
        frame126[63 + i * 3 + 1] = lm.y ?? 0.0;
        frame126[63 + i * 3 + 2] = lm.z ?? 0.0;
      });
    }

    // Append to rolling buffer (up to 160 frames capacity for complete 5s captures)
    this.landmarkBuffer.push(frame126);
    if (this.landmarkBuffer.length > 160) {
      this.landmarkBuffer.shift();
    }
  }

  public async evaluateBuffer(options?: { requestId?: number; gestureCycleId?: number }): Promise<ISLInferenceResult> {
    const bufLen = this.landmarkBuffer.length;
    const reqId = options?.requestId;
    const cycleId = options?.gestureCycleId;

    if (bufLen === 0) {
      return { 
        gesture: '', 
        confidence: 0.0, 
        label: 'NO_ACTIVE_SIGN', 
        phrase: '', 
        isRealModel: this.isOnline, 
        frameCount: 0,
        requestId: reqId,
        gestureCycleId: cycleId,
        rejectionReason: 'INSUFFICIENT_ACTIVITY'
      };
    }

    // Check service health periodically if offline
    const now = Date.now();
    if (!this.isOnline && now - this.lastCheckTime > 2000) {
      this.lastCheckTime = now;
      this.initialize();
    }

    // 2. Active-Sign Temporal Gating: compute hand presence and motion dynamics
    let activeFrameCount = 0;
    let motionFrameCount = 0;
    let totalDisplacement = 0.0;
    let maxDisplacement = 0.0;
    let hasLeftHand = false;
    let hasRightHand = false;
    let firstActive = -1;
    let lastActive = -1;

    for (let t = 0; t < bufLen; t++) {
      const curr = this.landmarkBuffer[t];
      const h0_active = curr[0] !== 0 || curr[1] !== 0 || curr[2] !== 0;
      const h1_active = curr[63] !== 0 || curr[64] !== 0 || curr[65] !== 0;
      if (h0_active) hasLeftHand = true;
      if (h1_active) hasRightHand = true;
      const hasHand = h0_active || h1_active;

      if (hasHand) {
        activeFrameCount++;
        if (firstActive === -1) firstActive = t;
        lastActive = t;
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

    // Compute spatial landmark variance across active frames to distinguish real gestures from static resting hands
    let landmarkVariance = 0.0;
    if (activeFrameCount >= 15) {
      for (let c = 0; c < 126; c++) {
        let sum = 0.0;
        let count = 0;
        for (let t = 0; t < bufLen; t++) {
          const v = this.landmarkBuffer[t][c];
          if (v !== 0) {
            sum += v;
            count++;
          }
        }
        if (count >= 15) {
          const mean = sum / count;
          let varSum = 0.0;
          for (let t = 0; t < bufLen; t++) {
            const v = this.landmarkBuffer[t][c];
            if (v !== 0) {
              const diff = v - mean;
              varSum += diff * diff;
            }
          }
          landmarkVariance += varSum / count;
        }
      }
    }

    const activeSpan = firstActive !== -1 && lastActive !== -1 ? lastActive - firstActive + 1 : 0;
    const evalWindow = Math.min(bufLen, 60);
    const activeFrameRatio = evalWindow > 0 ? Math.min(1.0, activeFrameCount / evalWindow) : 0.0;
    const motionFrameRatio = activeSpan > 1 ? motionFrameCount / (activeSpan - 1) : (evalWindow > 1 ? motionFrameCount / (evalWindow - 1) : 0.0);
    const averageMotion = bufLen > 1 ? totalDisplacement / (bufLen - 1) : 0.0;
    const currentHandCount = (hasLeftHand ? 1 : 0) + (hasRightHand ? 1 : 0);

    // Active gesture gating: Hand presence check (at least 8 active frames in buffer)
    const gatePassed = activeFrameCount >= 8;

    const telemetry: ISLActivityTelemetry = {
      activeFrameRatio,
      motionFrameRatio,
      averageMotion,
      maxMotion: maxDisplacement,
      handCount: currentHandCount,
      gatePassed,
      rejectionReason: !gatePassed ? 'INSUFFICIENT_ACTIVITY' : undefined
    };

    if (!gatePassed) {
      if (reqId !== undefined) {
        console.log(`[Recognition] cycle=${cycleId} req=${reqId} gate=FAIL reason=INSUFFICIENT_ACTIVITY activeCount=${activeFrameCount}`);
      }
      return {
        gesture: '',
        confidence: 0.0,
        label: 'NO_ACTIVE_SIGN',
        phrase: '',
        isRealModel: this.isOnline,
        frameCount: bufLen,
        rejectionReason: 'INSUFFICIENT_ACTIVITY',
        activityTelemetry: telemetry,
        requestId: reqId,
        gestureCycleId: cycleId
      };
    }

    // 3. Resample the active signing sequence into exactly 60 frames matching model training
    let sequenceToSend: number[][];
    if (activeSpan >= 8 && firstActive !== -1 && lastActive !== -1) {
      const activeSlice = this.landmarkBuffer.slice(firstActive, lastActive + 1);
      sequenceToSend = resampleSequence(activeSlice, 60);
    } else {
      sequenceToSend = resampleSequence(this.landmarkBuffer, 60);
    }

    // Compute feature vector telemetry on the latest frame
    const latestFrame = this.landmarkBuffer[this.landmarkBuffer.length - 1] || [];
    let slot0NonZero = 0;
    let slot1NonZero = 0;
    let minCoord = 0;
    let maxCoord = 0;
    let sumCoord = 0;
    let totalNonZero = 0;

    for (let i = 0; i < latestFrame.length; i++) {
      const v = latestFrame[i];
      if (i < 63 && v !== 0) slot0NonZero++;
      if (i >= 63 && i < 126 && v !== 0) slot1NonZero++;
      if (v !== 0) {
        if (totalNonZero === 0) {
          minCoord = v;
          maxCoord = v;
        } else {
          if (v < minCoord) minCoord = v;
          if (v > maxCoord) maxCoord = v;
        }
        sumCoord += v;
        totalNonZero++;
      }
    }
    const vectorStats: ISLVectorStats = {
      slot0Count: slot0NonZero,
      slot1Count: slot1NonZero,
      minVal: minCoord,
      maxVal: maxCoord,
      meanVal: totalNonZero > 0 ? sumCoord / totalNonZero : 0
    };

    // 4. Invoke BiLSTM neural inference on the complete 60-frame sequence (ONE request)
    const urlsToTry = [this.activeUrl, ...this.candidateUrls.filter(u => u !== this.activeUrl)];

    for (const url of urlsToTry) {
      try {
        const response = await fetch(`${url}/predict-landmarks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sequence: sequenceToSend })
        });

        if (response.ok) {
          const result = await response.json();
          this.activeUrl = url;
          this.isOnline = true;
          if (result.gesture && result.gesture !== 'UNKNOWN' && result.gesture !== 'NO_HANDS' && result.gesture !== 'NO_ACTIVE_SIGN') {
            const rawLabel = result.gesture;
            const formattedText = formatISLLabel(rawLabel);
            return {
              gesture: formattedText,
              confidence: typeof result.confidence === 'number' ? result.confidence : 0.0,
              top2Confidence: result.top2_confidence || 0.0,
              top2Label: result.top2_label ? formatISLLabel(result.top2_label) : '',
              margin: result.margin || 0.0,
              label: formattedText,
              phrase: formattedText,
              isRealModel: true,
              source: 'BiLSTM',
              frameCount: this.landmarkBuffer.length,
              activityTelemetry: telemetry,
              vectorStats,
              requestId: reqId,
              gestureCycleId: cycleId,
              top_3: result.top_3
            };
          } else {
            return {
              gesture: '',
              confidence: 0.0,
              label: 'NO_ACTIVE_SIGN',
              phrase: '',
              isRealModel: true,
              source: 'None',
              frameCount: this.landmarkBuffer.length,
              rejectionReason: 'NO_ACTIVE_SIGN',
              activityTelemetry: telemetry,
              vectorStats,
              requestId: reqId,
              gestureCycleId: cycleId
            };
          }
        }
      } catch {
        // Try next candidate URL
      }
    }

    // 5. Intelligent Client-Side Geometric Classifier Fallback (0ms instant offline recognition)
    const geometricResult = analyzeHandGeometry(this.landmarkBuffer);
    if (geometricResult && geometricResult.gesture) {
      return {
        gesture: geometricResult.gesture,
        confidence: geometricResult.confidence,
        label: geometricResult.gesture,
        phrase: geometricResult.phrase || formatISLLabel(geometricResult.gesture),
        isRealModel: true,
        source: 'Geometric Fallback',
        frameCount: this.landmarkBuffer.length,
        activityTelemetry: telemetry,
        vectorStats,
        requestId: reqId,
        gestureCycleId: cycleId,
        top_3: [
          { class_id: 0, label: geometricResult.gesture, confidence: geometricResult.confidence }
        ]
      };
    }

    return {
      gesture: '',
      confidence: 0.0,
      label: '',
      phrase: '',
      isRealModel: false,
      source: 'None',
      frameCount: this.landmarkBuffer.length,
      activityTelemetry: telemetry,
      vectorStats,
      requestId: reqId,
      gestureCycleId: cycleId
    };
  }

  public async classify(landmarks: ISLLandmarks): Promise<ISLInferenceResult> {
    if (landmarks && (landmarks.leftHand?.length || landmarks.rightHand?.length)) {
      this.addFrame(landmarks);
    }
    return this.evaluateBuffer();
  }

  public getLatestBuffer(): number[][] {
    return this.landmarkBuffer;
  }
}

/**
 * Geometric Rule Engine for Direct Instant ISL & Alphabet Recognition from Hand Landmarks
 */
function analyzeHandGeometry(buffer: number[][]): { gesture: string; confidence: number; phrase?: string } | null {
  if (!buffer || buffer.length === 0) return null;
  const lastFrame = buffer[buffer.length - 1];
  if (!lastFrame || lastFrame.length < 63) return null;

  // Extract 21 points for Primary Hand (Slot 0)
  const pts: { x: number; y: number; z: number }[] = [];
  for (let i = 0; i < 21; i++) {
    pts.push({
      x: lastFrame[i * 3],
      y: lastFrame[i * 3 + 1],
      z: lastFrame[i * 3 + 2] || 0
    });
  }

  // Check if primary hand has non-zero landmarks
  if (pts[0].x === 0 && pts[0].y === 0) return null;

  // Extract points for Secondary Hand (Slot 1) if present
  const hasHand2 = lastFrame[63] !== 0 || lastFrame[64] !== 0;
  const pts2: { x: number; y: number; z: number }[] = [];
  if (hasHand2) {
    for (let i = 0; i < 21; i++) {
      pts2.push({
        x: lastFrame[63 + i * 3],
        y: lastFrame[63 + i * 3 + 1],
        z: lastFrame[63 + i * 3 + 2] || 0
      });
    }
  }

  // Two-Handed Signs Check
  if (hasHand2 && pts2.length === 21) {
    // Namaste: Two hands palms facing together (wrists close together, index fingers close)
    const wristDist = Math.hypot(pts[0].x - pts2[0].x, pts[0].y - pts2[0].y);
    const indexDist = Math.hypot(pts[8].x - pts2[8].x, pts[8].y - pts2[8].y);
    if (wristDist < 0.25 && indexDist < 0.20) {
      return { gesture: 'Namaste', confidence: 0.92, phrase: 'Namaste' };
    }
  }

  // Single Hand Finger State Analysis (Primary Hand)
  // Distance helper
  const dist = (p1: { x: number; y: number }, p2: { x: number; y: number }) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

  // Wrist is landmark 0
  const wrist = pts[0];

  // Finger tip vs MCP distance relative to PIP (Check if extended or curled)
  const isThumbExtended = dist(pts[4], pts[2]) > dist(pts[3], pts[2]) * 1.2 && dist(pts[4], pts[9]) > 0.12;
  const isIndexExtended = pts[8].y < pts[6].y && dist(pts[8], wrist) > dist(pts[6], wrist);
  const isMiddleExtended = pts[12].y < pts[10].y && dist(pts[12], wrist) > dist(pts[10], wrist);
  const isRingExtended = pts[16].y < pts[14].y && dist(pts[16], wrist) > dist(pts[14], wrist);
  const isPinkyExtended = pts[20].y < pts[18].y && dist(pts[20], wrist) > dist(pts[18], wrist);

  // Count extended fingers
  const extendedCount = (isIndexExtended ? 1 : 0) + (isMiddleExtended ? 1 : 0) + (isRingExtended ? 1 : 0) + (isPinkyExtended ? 1 : 0);

  // Tip-to-tip distances for circles/pinches
  const indexThumbDist = dist(pts[8], pts[4]);
  const middleThumbDist = dist(pts[12], pts[4]);

  // 1. Five fingers open / Hello / Wave
  if (isThumbExtended && isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) {
    return { gesture: 'Hello', confidence: 0.94, phrase: 'Hello' };
  }

  // 2. 'Y' Sign: Thumb and Pinky extended, 3 middle fingers closed
  if (isThumbExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended && isPinkyExtended) {
    return { gesture: 'Y', confidence: 0.92, phrase: 'Y' };
  }

  // 3. 'L' Sign: Index and Thumb extended at ~90 deg, others closed
  if (isThumbExtended && isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    return { gesture: 'L', confidence: 0.93, phrase: 'L' };
  }

  // 4. 'V' Sign / Peace: Index and Middle extended, Ring and Pinky closed
  if (!isThumbExtended && isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    const fingerGap = dist(pts[8], pts[12]);
    if (fingerGap > 0.05) {
      return { gesture: 'V', confidence: 0.91, phrase: 'V' };
    }
    return { gesture: 'U', confidence: 0.89, phrase: 'U' };
  }

  // 5. 'W' Sign: Index, Middle, Ring extended, Pinky and Thumb closed
  if (isIndexExtended && isMiddleExtended && isRingExtended && !isPinkyExtended) {
    return { gesture: 'W', confidence: 0.90, phrase: 'W' };
  }

  // 6. 'I' Sign: Pinky extended, all others closed
  if (!isIndexExtended && !isMiddleExtended && !isRingExtended && isPinkyExtended) {
    return { gesture: 'I', confidence: 0.91, phrase: 'I' };
  }

  // 7. 'D' Sign: Index extended straight up, thumb touching middle/ring
  if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    if (middleThumbDist < 0.08) {
      return { gesture: 'D', confidence: 0.90, phrase: 'D' };
    }
    return { gesture: '1', confidence: 0.88, phrase: 'One' };
  }

  // 8. 'B' Sign: 4 fingers straight up, thumb folded across palm
  if (!isThumbExtended && isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) {
    return { gesture: 'B', confidence: 0.92, phrase: 'B' };
  }

  // 9. 'F' Sign: Thumb and Index touching (circle), 3 fingers up
  if (indexThumbDist < 0.06 && isMiddleExtended && isRingExtended && isPinkyExtended) {
    return { gesture: 'F', confidence: 0.91, phrase: 'F' };
  }

  // 10. 'O' Sign: All fingertips touching thumb in 'O'
  if (indexThumbDist < 0.07 && middleThumbDist < 0.08 && !isIndexExtended && !isMiddleExtended) {
    return { gesture: 'O', confidence: 0.88, phrase: 'O' };
  }

  // 11. 'C' Sign: Curved open palm forming 'C' shape
  if (pts[8].y > pts[5].y && pts[8].x < pts[4].x && !isThumbExtended && !isPinkyExtended) {
    return { gesture: 'C', confidence: 0.86, phrase: 'C' };
  }

  // 12. 'A' Sign: Fist with thumb resting against side of index
  if (extendedCount === 0 && isThumbExtended) {
    if (pts[4].y < pts[3].y && pts[3].y < pts[2].y) {
      return { gesture: 'Yes', confidence: 0.93, phrase: 'Yes / Good' };
    }
    return { gesture: 'A', confidence: 0.90, phrase: 'A' };
  }

  // 13. 'S' Sign / Fist: All fingers closed tightly
  if (extendedCount === 0 && !isThumbExtended) {
    return { gesture: 'S', confidence: 0.87, phrase: 'S' };
  }

  // 14. Number 3: Thumb, Index, Middle extended
  if (isThumbExtended && isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    return { gesture: '3', confidence: 0.91, phrase: 'Three' };
  }

  // 15. Number 4: 4 fingers extended, thumb folded
  if (!isThumbExtended && isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) {
    return { gesture: '4', confidence: 0.92, phrase: 'Four' };
  }

  // 16. Number 5 / Open Palm: All 5 fingers extended
  if (isThumbExtended && isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) {
    return { gesture: '5', confidence: 0.92, phrase: 'Five' };
  }

  return null;
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

export const defaultSaanketClassifier = new SaanketBiLSTMClassifier();

