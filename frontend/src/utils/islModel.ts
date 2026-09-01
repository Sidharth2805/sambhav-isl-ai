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

    // 1. Flatten into exact 126-dimensional coordinate vector matching saanket_bilstm.keras model schema:
    //    Index 0 (Features 0..62)   = Left Hand (21 landmarks * 3 coords)
    //    Index 1 (Features 63..125) = Right Hand (21 landmarks * 3 coords)
    const frame126: number[] = new Array(126).fill(0.0);

    if (hasLeftHand && landmarks.leftHand) {
      landmarks.leftHand.slice(0, 21).forEach((lm, i) => {
        frame126[i * 3] = lm.x ?? 0.0;
        frame126[i * 3 + 1] = lm.y ?? 0.0;
        frame126[i * 3 + 2] = lm.z ?? 0.0;
      });
    }

    if (hasRightHand && landmarks.rightHand) {
      landmarks.rightHand.slice(0, 21).forEach((lm, i) => {
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

    // Check service health periodically every 2 seconds if offline
    const now = Date.now();
    if (!this.isOnline && now - this.lastCheckTime > 2000) {
      this.lastCheckTime = now;
      this.initialize();
    }

    // 2. If ML service is online and landmark buffer has sufficient motion frames (>= 25), invoke BiLSTM neural inference
    if (this.isOnline && this.landmarkBuffer.length >= 25) {
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
            const formattedText = formatISLLabel(rawLabel);
            return {
              gesture: formattedText,
              confidence: result.confidence,
              label: formattedText,
              phrase: formattedText,
              isRealModel: true,
              top_3: result.top_3
            };
          }
        }
      } catch {
        this.isOnline = false;
      }
    }

    // 3. Clean neutral state when ML backend is starting/connecting (no hardcoded static heuristic overrides or false word guesses)
    return { gesture: '', confidence: 0.0, label: '', phrase: '', isRealModel: false };
  }
}

/**
 * Demo implementation of the ISLClassifier interface.
 */
export class DemoISLClassifier extends SaanketBiLSTMClassifier {
  public override name = 'Sambhav ISL Classifier (BiLSTM / Heuristic)';
}

