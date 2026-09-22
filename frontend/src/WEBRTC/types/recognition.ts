export interface HandLandmark3D {
  x: number;
  y: number;
  z: number;
}

export type FrameLandmarks126 = number[]; // 2 hands * 21 landmarks * 3 coords = 126 floats

export interface SambhavModel2Prediction {
  label: string;
  phrase: string;
  confidence: number;
  top2_label?: string;
  top2_confidence?: number;
  margin?: number;
  top_3?: Array<{ label: string; confidence: number }>;
  isReliable: boolean;
}

export type SambhavGestureState =
  | 'IDLE'
  | 'DETECTING'
  | 'SIGN_DETECTED'
  | 'COLLECTING'
  | 'VALIDATING'
  | 'INFERENCE'
  | 'COMMITTED'
  | 'WAIT_FOR_SIGN_END'
  | 'DISPLAY RESULT'
  | 'READY FOR NEXT GESTURE';

export interface SambhavCommittedEvent {
  text: string;
  confidence: number;
  sequenceId: number;
  timestamp: number;
  eventId: string;
}

export interface SambhavTelemetry {
  cameraActive: boolean;
  handsDetected: number;
  bufferedFrames: number;
  featureVectorDim: number;
  slot0Features: number;
  slot1Features: number;
  minVal: number;
  maxVal: number;
  meanVal: number;
  requestStatus: 'IDLE' | 'SENT' | 'RECEIVED' | 'REJECTED';
  lastLatencyMs: number;
  recognitionSource: 'BiLSTM' | 'Geometric Fallback' | 'None';
  top1Label: string;
  top1Confidence: number;
  top2Label: string;
  top2Confidence: number;
  margin: number;
}
