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
 * Vocabulary dictionary representing all 262 trained ISL classes from the Parquet BiLSTM dataset.
 */
export const ISL_VOCABULARY: Record<string, string> = {
  'actor': 'Actor', 'adult': 'Adult', 'afternoon': 'Afternoon', 'alive': 'Alive', 'alright': 'Alright',
  'animal': 'Animal', 'artist': 'Artist', 'attack': 'Attack', 'author': 'Author', 'baby': 'Baby',
  'bad': 'Bad', 'bag': 'Bag', 'ball': 'Ball', 'bank': 'Bank', 'bathroom': 'Bathroom',
  'beautiful': 'Beautiful', 'bed': 'Bed', 'bedroom': 'Bedroom', 'bicycle': 'Bicycle', 'biglarge': 'Big / Large',
  'bill': 'Bill', 'bird': 'Bird', 'black': 'Black', 'blind': 'Blind', 'blue': 'Blue',
  'boat': 'Boat', 'book': 'Book', 'box': 'Box', 'boy': 'Boy', 'brother': 'Brother',
  'brown': 'Brown', 'bus': 'Bus', 'camera': 'Camera', 'car': 'Car', 'card': 'Card',
  'cat': 'Cat', 'cellphone': 'Cellphone', 'chair': 'Chair', 'cheap': 'Cheap', 'child': 'Child',
  'city': 'City', 'clean': 'Clean', 'clock': 'Clock', 'clothing': 'Clothing', 'cold': 'Cold',
  'colour': 'Colour', 'computer': 'Computer', 'cool': 'Cool', 'court': 'Court', 'cow': 'Cow',
  'crowd': 'Crowd', 'curved': 'Curved', 'daughter': 'Daughter', 'dead': 'Dead', 'deaf': 'Deaf',
  'death': 'Death', 'deep': 'Deep', 'dirty': 'Dirty', 'doctor': 'Doctor', 'dog': 'Dog',
  'door': 'Door', 'dream': 'Dream', 'dress': 'Dress', 'dry': 'Dry', 'election': 'Election',
  'energy': 'Energy', 'evening': 'Evening', 'exercise': 'Exercise', 'exmonsoon': 'Monsoon', 'expensive': 'Expensive',
  'fall': 'Fall', 'family': 'Family', 'famous': 'Famous', 'fan': 'Fan', 'fast': 'Fast',
  'father': 'Father', 'female': 'Female', 'fish': 'Fish', 'flat': 'Flat', 'friday': 'Friday',
  'friend': 'Friend', 'gift': 'Gift', 'girl': 'Girl', 'god': 'God', 'good': 'Good',
  'goodafternoon': 'Good Afternoon', 'goodevening': 'Good Evening', 'goodmorning': 'Good Morning', 'goodnight': 'Good Night',
  'grandfather': 'Grandfather', 'grandmother': 'Grandmother', 'green': 'Green', 'grey': 'Grey', 'ground': 'Ground',
  'gun': 'Gun', 'happy': 'Happy', 'hard': 'Hard', 'hat': 'Hat', 'he': 'He',
  'healthy': 'Healthy', 'heavy': 'Heavy', 'hello': 'Hello', 'high': 'High', 'horse': 'Horse',
  'hospital': 'Hospital', 'hot': 'Hot', 'hour': 'Hour', 'house': 'House', 'howareyou': 'How Are You',
  'husband': 'Husband', 'i': 'I', 'india': 'India', 'it': 'It', 'job': 'Job',
  'key': 'Key', 'king': 'King', 'kitchen': 'Kitchen', 'lamp': 'Lamp', 'laptop': 'Laptop',
  'lawyer': 'Lawyer', 'letter': 'Letter', 'library': 'Library', 'light': 'Light', 'location': 'Location',
  'lock': 'Lock', 'long': 'Long', 'loose': 'Loose', 'loud': 'Loud', 'low': 'Low',
  'male': 'Male', 'man': 'Man', 'manager': 'Manager', 'market': 'Market', 'marriage': 'Marriage',
  'mean': 'Mean', 'medicine': 'Medicine', 'minute': 'Minute', 'monday': 'Monday', 'money': 'Money',
  'month': 'Month', 'morning': 'Morning', 'mother': 'Mother', 'mouse': 'Mouse', 'narrow': 'Narrow',
  'neighbour': 'Neighbour', 'new': 'New', 'newspaper': 'Newspaper', 'nice': 'Nice', 'night': 'Night',
  'office': 'Office', 'old': 'Old', 'orange': 'Orange', 'page': 'Page', 'paint': 'Paint',
  'pant': 'Pant', 'paper': 'Paper', 'parent': 'Parent', 'park': 'Park', 'patient': 'Patient',
  'peace': 'Peace', 'pen': 'Pen', 'pencil': 'Pencil', 'photograph': 'Photograph', 'pink': 'Pink',
  'plane': 'Plane', 'player': 'Player', 'pleased': 'Pleased', 'pocket': 'Pocket', 'police': 'Police',
  'poor': 'Poor', 'president': 'President', 'price': 'Price', 'priest': 'Priest', 'queen': 'Queen',
  'quiet': 'Quiet', 'raceethnicity': 'Race / Ethnicity', 'radio': 'Radio', 'red': 'Red', 'religion': 'Religion',
  'reporter': 'Reporter', 'restaurant': 'Restaurant', 'rich': 'Rich', 'ring': 'Ring', 'sad': 'Sad',
  'saturday': 'Saturday', 'school': 'School', 'science': 'Science', 'screen': 'Screen', 'season': 'Season',
  'second': 'Second', 'secretary': 'Secretary', 'shallow': 'Shallow', 'she': 'She', 'shirt': 'Shirt',
  'shoes': 'Shoes', 'short': 'Short', 'sick': 'Sick', 'sign': 'Sign', 'sister': 'Sister',
  'skirt': 'Skirt', 'slow': 'Slow', 'smalllittle': 'Small', 'soap': 'Soap', 'soft': 'Soft',
  'soldier': 'Soldier', 'son': 'Son', 'sport': 'Sport', 'spring': 'Spring', 'storeorshop': 'Store / Shop',
  'streetorroad': 'Street / Road', 'strong': 'Strong', 'student': 'Student', 'suit': 'Suit', 'summer': 'Summer',
  'sunday': 'Sunday', 'table': 'Table', 'tall': 'Tall', 'teacher': 'Teacher', 'team': 'Team',
  'technology': 'Technology', 'telephone': 'Telephone', 'television': 'Television', 'temple': 'Temple', 'thankyou': 'Thank You',
  'they': 'They', 'thick': 'Thick', 'thin': 'Thin', 'thursday': 'Thursday', 'tight': 'Tight',
  'time': 'Time', 'today': 'Today', 'tomorrow': 'Tomorrow', 'tool': 'Tool', 'train': 'Train',
  'trainstation': 'Train Station', 'trainticket': 'Train Ticket', 'transportation': 'Transportation', 'truck': 'Truck', 'tshirt': 'T-Shirt',
  'tuesday': 'Tuesday', 'ugly': 'Ugly', 'university': 'University', 'waiter': 'Waiter', 'war': 'War',
  'warm': 'Warm', 'we': 'We', 'weak': 'Weak', 'wednesday': 'Wednesday', 'week': 'Week',
  'wet': 'Wet', 'white': 'White', 'wide': 'Wide', 'wife': 'Wife', 'window': 'Window',
  'winter': 'Winter', 'woman': 'Woman', 'year': 'Year', 'yellow': 'Yellow', 'yesterday': 'Yesterday',
  'you': 'You', 'young': 'Young', 'youplural': 'You (Plural)'
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
  public name = 'Saanket BiLSTM Neural Network (171 ISL Classes)';
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
          console.log(`[Sambhav ML] Connected to ML service at ${url} (${this.lastPingMs}ms):`, data);
          return;
        }
      } catch {
        // Try next candidate
      }
    }
    this.isOnline = false;
    console.warn('[Sambhav ML] No ML inference service reachable. ML service offline.');
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

    const activeSpan = firstActive !== -1 && lastActive !== -1 ? lastActive - firstActive + 1 : 0;
    const evalWindow = Math.min(bufLen, 60);
    const activeFrameRatio = evalWindow > 0 ? Math.min(1.0, activeFrameCount / evalWindow) : 0.0;
    const motionFrameRatio = activeSpan > 1 ? motionFrameCount / (activeSpan - 1) : (evalWindow > 1 ? motionFrameCount / (evalWindow - 1) : 0.0);
    const averageMotion = bufLen > 1 ? totalDisplacement / (bufLen - 1) : 0.0;
    const currentHandCount = (hasLeftHand ? 1 : 0) + (hasRightHand ? 1 : 0);

    // Active gesture gating:
    // Requires activeFrameRatio >= 0.20 AND (motionFrameRatio >= 0.04 OR maxDisplacement >= 0.015 OR static pose held with activeSpan >= 15 frames)
    // AND requires a genuine gesture window (activeSpan >= 15 frames, ~0.5s at 30 FPS).
    const isStaticPoseHeld = activeFrameRatio >= 0.20 && currentHandCount >= 1 && activeSpan >= 15;
    const isDynamicStroke = activeFrameRatio >= 0.20 && activeSpan >= 15 && (
      motionFrameRatio >= 0.04 ||
      maxDisplacement >= 0.015
    );
    const gatePassed = isStaticPoseHeld || isDynamicStroke;

    const telemetry: ISLActivityTelemetry = {
      activeFrameRatio,
      motionFrameRatio,
      averageMotion,
      maxMotion: maxDisplacement,
      handCount: currentHandCount,
      gatePassed,
      rejectionReason: !gatePassed ? 'INSUFFICIENT_ACTIVITY' : undefined
    };

    if (!gatePassed || activeSpan < 15) {
      if (reqId !== undefined) {
        console.log(`[Recognition] cycle=${cycleId} req=${reqId} gate=FAIL reason=INSUFFICIENT_ACTIVITY activeRatio=${activeFrameRatio.toFixed(2)} activeSpan=${activeSpan} motionRatio=${motionFrameRatio.toFixed(2)} maxDisp=${maxDisplacement.toFixed(3)} request=NO committed=NO`);
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

    // 3. Resample the genuine active signing stroke into exactly 60 frames matching model training
    let sequenceToSend: number[][];
    if (activeSpan >= 15 && firstActive !== -1 && lastActive !== -1) {
      const activeSlice = this.landmarkBuffer.slice(firstActive, lastActive + 1);
      sequenceToSend = resampleSequence(activeSlice, 60);
    } else {
      sequenceToSend = resampleSequence(this.landmarkBuffer, 60);
    }

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
          if (result.gesture && result.gesture !== 'UNKNOWN' && result.gesture !== 'NO_HANDS') {
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
              frameCount: this.landmarkBuffer.length,
              activityTelemetry: telemetry,
              requestId: reqId,
              gestureCycleId: cycleId,
              top_3: result.top_3
            };
          }
        }
      } catch {
        // Try next candidate URL
      }
    }

    this.isOnline = false;
    return {
      gesture: '',
      confidence: 0.0,
      label: '',
      phrase: '',
      isRealModel: false,
      frameCount: this.landmarkBuffer.length,
      activityTelemetry: telemetry,
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

