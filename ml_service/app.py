import os
import json
import base64
import tempfile
from datetime import datetime
import numpy as np
import cv2
import tensorflow as tf
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision
from typing import List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import hashlib

app = FastAPI(
    title='Sambhav ISL AI - Sign Language Recognition Service',
    description='Real-time BiLSTM neural network inference service for 169 Indian Sign Language gestures.',
    version='1.0.0'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')

# Attention Layer Implementation (registered for custom keras layer compatibility if present)
@tf.keras.utils.register_keras_serializable()
class AttentionLayer(tf.keras.layers.Layer):
    def __init__(self, units=96, **kwargs):
        super().__init__(**kwargs)
        self.units = units
        self.W = tf.keras.layers.Dense(units, activation="tanh", kernel_regularizer=tf.keras.regularizers.l2(1e-4))
        self.V = tf.keras.layers.Dense(1, kernel_regularizer=tf.keras.regularizers.l2(1e-4))

    def call(self, inputs):
        score = self.V(self.W(inputs))
        weights = tf.nn.softmax(score, axis=1)
        context = tf.reduce_sum(inputs * weights, axis=1)
        return context

    def get_config(self):
        config = super().get_config()
        config.update({"units": self.units})
        return config

MODEL_PATH = os.path.join(MODELS_DIR, 'saanket_bilstm.keras')
LABEL_PATH = os.path.join(MODELS_DIR, 'label_mapping.json')
MEAN_PATH = os.path.join(MODELS_DIR, 'mean.npy')
STD_PATH = os.path.join(MODELS_DIR, 'std.npy')
TASK_PATH = os.path.join(MODELS_DIR, 'hand_landmarker.task')

print(f'[Sambhav ML] Loading frozen model from: {MODEL_PATH}')

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f'Model file not found at: {MODEL_PATH}')

model = tf.keras.models.load_model(MODEL_PATH, custom_objects={'AttentionLayer': AttentionLayer}, compile=False)
print(f'[Sambhav ML] Model loaded successfully: input={model.input_shape}, output={model.output_shape}')

# Dynamically derive dimensions from model architecture
in_shape = model.input_shape
out_shape = model.output_shape

SEQUENCE_LENGTH = in_shape[1] if (in_shape and len(in_shape) >= 2 and in_shape[1] is not None) else 60
NUM_FEATURES = in_shape[2] if (in_shape and len(in_shape) >= 3 and in_shape[2] is not None) else 126
NUM_CLASSES = out_shape[-1] if (out_shape and len(out_shape) >= 2 and out_shape[-1] is not None) else 169

if os.path.exists(LABEL_PATH):
    with open(LABEL_PATH, 'r', encoding='utf-8') as f:
        raw_labels = json.load(f)
        if raw_labels:
            sample_k = next(iter(raw_labels.keys()))
            if not sample_k.isdigit():
                # Invert mapping if format is {"A": 0, "B": 1} -> {"0": "A", "1": "B"}
                LABEL_MAPPING = {str(v): str(k) for k, v in raw_labels.items()}
            else:
                LABEL_MAPPING = {str(k): str(v) for k, v in raw_labels.items()}
        else:
            LABEL_MAPPING = {}
else:
    LABEL_MAPPING = {str(i): f'CLASS_{i}' for i in range(NUM_CLASSES)}

print(f'[Sambhav ML] Loaded {len(LABEL_MAPPING)} label classes.')

if os.path.exists(MEAN_PATH) and os.path.exists(STD_PATH):
    mean_vec = np.squeeze(np.load(MEAN_PATH)).astype(np.float32)
    std_vec = np.squeeze(np.load(STD_PATH)).astype(np.float32)
    if mean_vec.size != NUM_FEATURES:
        mean_vec = np.zeros(NUM_FEATURES, dtype=np.float32)
        std_vec = np.ones(NUM_FEATURES, dtype=np.float32)
    else:
        mean_vec = mean_vec.reshape(NUM_FEATURES)
        std_vec = np.where(std_vec.reshape(NUM_FEATURES) < 1e-6, 1.0, std_vec.reshape(NUM_FEATURES))
    print(f'[Sambhav ML] Normalization parameters loaded (mean: {mean_vec.shape}, std: {std_vec.shape})')
else:
    mean_vec = np.zeros(NUM_FEATURES, dtype=np.float32)
    std_vec = np.ones(NUM_FEATURES, dtype=np.float32)
    print('[Sambhav ML] Using default normalization.')

print(f'[Sambhav ML Config] Sequence Length: {SEQUENCE_LENGTH}, Num Features: {NUM_FEATURES}, Num Classes: {NUM_CLASSES}')

hand_detector = None
if os.path.exists(TASK_PATH):
    try:
        base_options = mp_python.BaseOptions(model_asset_path=TASK_PATH)
        options = mp_vision.HandLandmarkerOptions(base_options=base_options, num_hands=2)
        hand_detector = mp_vision.HandLandmarker.create_from_options(options)
        print('[Sambhav ML] MediaPipe HandLandmarker initialized.')
    except Exception as e:
        print('[Sambhav ML] MediaPipe detector warning:', e)

def format_class_name(label: str) -> str:
    if not label:
        return ""
    clean = label.replace('_', ' ').strip()
    if clean.lower() == 'howareyou':
        return 'How Are You'
    if clean.lower() == 'thankyou':
        return 'Thank You'
    if clean.lower() == 'goodmorning':
        return 'Good Morning'
    if clean.lower() == 'goodafternoon':
        return 'Good Afternoon'
    if clean.lower() == 'goodevening':
        return 'Good Evening'
    if clean.lower() == 'goodnight':
        return 'Good Night'
    if clean.lower() == 'smalllittle':
        return 'Small / Little'
    if clean.lower() == 'biglarge':
        return 'Big / Large'
    if clean.lower() == 'storeorshop':
        return 'Store / Shop'
    if clean.lower() == 'streetorroad':
        return 'Street / Road'
    if clean.lower() == 'youplural':
        return 'You (Plural)'
    return ' '.join(w.capitalize() for w in clean.split())

FRIENDLY_PHRASES = {
    v: format_class_name(v)
    for v in LABEL_MAPPING.values()
}

MIN_CONFIDENCE_THRESHOLD = 0.35

def normalize_sequence(sequence_126: np.ndarray) -> np.ndarray:
    seq = np.asarray(sequence_126, dtype=np.float32)
    if seq.shape != (SEQUENCE_LENGTH, NUM_FEATURES):
        raise ValueError(f"Expected ({SEQUENCE_LENGTH}, {NUM_FEATURES}), got {seq.shape}")
    mask = (seq != 0).any(axis=1, keepdims=True)
    m = mean_vec.reshape(NUM_FEATURES)
    s = std_vec.reshape(NUM_FEATURES)
    return np.where(mask, (seq - m) / s, 0.0).astype(np.float32)

def extract_landmarks_from_cv2_frame(frame: np.ndarray):
    landmarks = np.zeros((2, 21, 3), dtype=np.float32)
    has_hand = False

    if hand_detector is None:
        return landmarks.flatten(), False

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) if len(frame.shape) == 3 and frame.shape[2] == 3 else frame
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    detection_result = hand_detector.detect(mp_image)

    if detection_result.hand_landmarks:
        has_hand = True
        num_hands = len(detection_result.hand_landmarks)
        if num_hands >= 2:
            h0 = detection_result.hand_landmarks[0]
            h1 = detection_result.hand_landmarks[1]
            x0 = h0[0].x if len(h0) > 0 else 0.5
            x1 = h1[0].x if len(h1) > 0 else 0.5
            right_h = h0 if x0 <= x1 else h1
            left_h = h1 if x0 <= x1 else h0
            for lm_idx, lm in enumerate(left_h):
                landmarks[0, lm_idx, 0] = lm.x
                landmarks[0, lm_idx, 1] = lm.y
                landmarks[0, lm_idx, 2] = lm.z
            for lm_idx, lm in enumerate(right_h):
                landmarks[1, lm_idx, 0] = lm.x
                landmarks[1, lm_idx, 1] = lm.y
                landmarks[1, lm_idx, 2] = lm.z
        elif num_hands == 1:
            h = detection_result.hand_landmarks[0]
            wrist_x = h[0].x if len(h) > 0 else 0.5
            hand_idx = 1 if wrist_x < 0.45 else 0
            for lm_idx, lm in enumerate(h):
                landmarks[hand_idx, lm_idx, 0] = lm.x
                landmarks[hand_idx, lm_idx, 1] = lm.y
                landmarks[hand_idx, lm_idx, 2] = lm.z

    return landmarks.flatten(), has_hand

# Pre-compiled static computational graph for optimal CPU inference throughput
@tf.function(input_signature=[tf.TensorSpec(shape=[1, SEQUENCE_LENGTH, NUM_FEATURES], dtype=tf.float32)])
def _predict_compiled(batch_tensor: tf.Tensor) -> tf.Tensor:
    return model(batch_tensor, training=False)

# Warm up compiled graph at startup to eliminate first-request compilation latency
try:
    _warmup_input = np.zeros((1, SEQUENCE_LENGTH, NUM_FEATURES), dtype=np.float32)
    _predict_compiled(_warmup_input)
    print('[Sambhav ML] Compiled inference graph initialized and warmed up.')
except Exception as e:
    print('[Sambhav ML] Graph compilation warning:', e)

def run_bilstm_inference(sequence_input: np.ndarray) -> dict:
    seq_arr = np.asarray(sequence_input, dtype=np.float32)
    curr_len = len(seq_arr)
    if curr_len == 0:
        return {
            'gesture': 'NO_ACTIVE_SIGN',
            'label': 'NO_ACTIVE_SIGN',
            'raw_label': 'NO_ACTIVE_SIGN',
            'confidence': 0.0,
            'top2_confidence': 0.0,
            'top2_label': '',
            'margin': 0.0,
            'phrase': '',
            'top_3': []
        }

    # If sequence is not 60 frames, resample using linspace
    if curr_len != SEQUENCE_LENGTH and curr_len > 1:
        indices = np.linspace(0, curr_len - 1, SEQUENCE_LENGTH).astype(int)
        seq_arr = seq_arr[indices]
    elif curr_len == 1:
        seq_arr = np.repeat(seq_arr, SEQUENCE_LENGTH, axis=0)

    if seq_arr.shape != (SEQUENCE_LENGTH, NUM_FEATURES):
        raise ValueError(f'Expected ({SEQUENCE_LENGTH}, {NUM_FEATURES}), got {seq_arr.shape}')

    # Activity & Variance Gating: Reject zero or static resting sequences before softmax
    active_mask = (seq_arr != 0).any(axis=1)
    active_count = int(np.sum(active_mask))
    if active_count < 15:
        return {
            'gesture': 'NO_ACTIVE_SIGN',
            'label': 'NO_ACTIVE_SIGN',
            'raw_label': 'NO_ACTIVE_SIGN',
            'confidence': 0.0,
            'top2_confidence': 0.0,
            'top2_label': '',
            'margin': 0.0,
            'phrase': '',
            'top_3': []
        }

    active_frames = seq_arr[active_mask]
    var_sum = float(np.sum(np.var(active_frames, axis=0)))
    if var_sum < 0.0015:
        return {
            'gesture': 'NO_ACTIVE_SIGN',
            'label': 'NO_ACTIVE_SIGN',
            'raw_label': 'NO_ACTIVE_SIGN',
            'confidence': 0.0,
            'top2_confidence': 0.0,
            'top2_label': '',
            'margin': 0.0,
            'phrase': '',
            'top_3': []
        }

    norm_seq = normalize_sequence(seq_arr)
    if norm_seq.ndim == 2:
        batch_input = np.expand_dims(norm_seq, axis=0)
    else:
        batch_input = norm_seq.reshape(1, SEQUENCE_LENGTH, NUM_FEATURES)

    preds = _predict_compiled(batch_input).numpy()[0]

    top_indices = np.argsort(preds)[::-1][:5]
    top_3 = [
        {'class_id': int(i), 'label': LABEL_MAPPING.get(str(i), f'CLASS_{i}'), 'confidence': float(preds[i])}
        for i in top_indices
    ]

    top1_idx = int(top_indices[0])
    top2_idx = int(top_indices[1]) if len(top_indices) > 1 else top1_idx

    top1_confidence = float(preds[top1_idx])
    top2_confidence = float(preds[top2_idx])
    margin = top1_confidence - top2_confidence

    raw_label = LABEL_MAPPING.get(str(top1_idx), f'CLASS_{top1_idx}')
    top2_label = LABEL_MAPPING.get(str(top2_idx), f'CLASS_{top2_idx}')

    phrase = FRIENDLY_PHRASES.get(raw_label.lower(), FRIENDLY_PHRASES.get(raw_label, format_class_name(raw_label)))

    return {
        'gesture': raw_label,
        'label': raw_label,
        'raw_label': raw_label,
        'confidence': top1_confidence,
        'top2_confidence': top2_confidence,
        'top2_label': top2_label,
        'margin': margin,
        'phrase': phrase,
        'top_3': top_3,
    }

class LandmarkSequenceRequest(BaseModel):
    sequence: List[List[float]]

class ImageFrameRequest(BaseModel):
    image_base64: str

@app.get('/health')
async def health_check():
    md5_hash = ''
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, 'rb') as f:
            md5_hash = hashlib.md5(f.read()).hexdigest()
    return {
        'status': 'healthy',
        'service': 'Sambhav ISL AI Recognition Service',
        'model': 'SAANKET Frozen BiLSTM Recognition Model',
        'model_file': os.path.basename(MODEL_PATH),
        'model_md5': md5_hash,
        'num_classes': len(LABEL_MAPPING),
        'sequence_length': SEQUENCE_LENGTH,
        'num_features': NUM_FEATURES,
        'model_input_shape': str(model.input_shape),
        'model_output_shape': str(model.output_shape),
    }

@app.get('/labels')
async def get_labels():
    return {
        'total': len(LABEL_MAPPING),
        'labels': LABEL_MAPPING,
        'friendly_phrases': FRIENDLY_PHRASES,
    }

@app.post('/predict-landmarks')
async def predict_landmarks(req: LandmarkSequenceRequest):
    try:
        if not req.sequence or len(req.sequence) == 0:
            return {
                'gesture': 'NO_ACTIVE_SIGN',
                'label': 'NO_ACTIVE_SIGN',
                'raw_label': 'NO_ACTIVE_SIGN',
                'confidence': 0.0,
                'top2_confidence': 0.0,
                'top2_label': '',
                'margin': 0.0,
                'phrase': '',
                'top_3': []
            }

        seq_array = np.array(req.sequence, dtype=np.float32)
        if seq_array.ndim != 2 or seq_array.shape[1] != NUM_FEATURES:
            raise HTTPException(status_code=400, detail=f'Expected shape (N, {NUM_FEATURES}), got {seq_array.shape}')
        
        result = run_bilstm_inference(seq_array)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/predict-frame')
async def predict_frame(req: ImageFrameRequest):
    try:
        header_split = req.image_base64.split(',')
        base64_data = header_split[1] if len(header_split) > 1 else header_split[0]
        img_bytes = base64.b64decode(base64_data)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is None:
            raise HTTPException(status_code=400, detail='Invalid image data')

        landmarks_126, has_hand = extract_landmarks_from_cv2_frame(frame)
        if not has_hand:
            return {'gesture': 'NO_HANDS', 'label': 'No hands detected', 'confidence': 0.0, 'phrase': '', 'landmarks': []}

        sequence = np.tile(landmarks_126, (SEQUENCE_LENGTH, 1))
        result = run_bilstm_inference(sequence)
        result['landmarks'] = landmarks_126.tolist()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class OCRScanRequest(BaseModel):
    image_base64: str
    language: Optional[str] = "en"
    mode: Optional[str] = "handwriting" # "handwriting" | "prescription"

@app.get('/api/ocr/status')
async def ocr_status():
    from ocr_service import MODEL_NAME, _trocr_load_attempted, _trocr_load_error, _trocr_model
    return {
        "status": "online",
        "model": MODEL_NAME,
        "is_loaded": _trocr_model is not None,
        "load_attempted": _trocr_load_attempted,
        "load_error": _trocr_load_error
    }

@app.post('/api/ocr/handwriting')
@app.post('/api/ocr/prescription')
async def scan_handwriting_prescription(req: OCRScanRequest):
    try:
        from ocr_service import process_handwritten_image
        if not req.image_base64 or not req.image_base64.strip():
            raise HTTPException(status_code=400, detail="Missing image_base64 payload")
        
        result = process_handwritten_image(req.image_base64, mode=req.mode or "auto")
        if not result.get("success"):
            raise HTTPException(status_code=422, detail=result.get("error", "OCR processing failed"))
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

# ============================================================
# SESSION HISTORY & GRAMMAR CONVERSION FOR TRANSLATE FEATURE
# ============================================================

HISTORY_PATH = os.path.join(BASE_DIR, 'history.json')

if not os.path.exists(HISTORY_PATH):
    with open(HISTORY_PATH, 'w', encoding='utf-8') as f:
        json.dump([], f, ensure_ascii=False, indent=2)

def load_history():
    try:
        if not os.path.exists(HISTORY_PATH):
            return []
        with open(HISTORY_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data if isinstance(data, list) else []
    except Exception as e:
        print('[Sambhav ML] History loading error:', e)
        return []

def save_history(gloss, english):
    try:
        history = load_history()
        history_item = {
            'gloss': str(gloss),
            'english': str(english),
            'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        history.insert(0, history_item)
        history = history[:100]
        with open(HISTORY_PATH, 'w', encoding='utf-8') as f:
            json.dump(history, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print('[Sambhav ML] History saving error:', e)
        return False

class ConvertRequest(BaseModel):
    gloss: Optional[str] = ""
    gloss_words: Optional[List[str]] = None
    text: Optional[str] = None

class SpeakRequest(BaseModel):
    text: str

def convert_gloss_to_english(gloss: str) -> str:
    if not gloss:
        return ""
    words = gloss.strip().lower().split()
    if not words:
        return ""
    
    # Remove consecutive duplicates
    cleaned_words = []
    for w in words:
        if not cleaned_words or w != cleaned_words[-1]:
            cleaned_words.append(w)
    words = cleaned_words

    phrase_map = {
        "hello": "Hello.",
        "hi": "Hello.",
        "bye": "Goodbye.",
        "thank you": "Thank you.",
        "thankyou": "Thank you.",
        "thanks": "Thank you.",
        "good morning": "Good morning.",
        "goodmorning": "Good morning.",
        "good afternoon": "Good afternoon.",
        "goodafternoon": "Good afternoon.",
        "good evening": "Good evening.",
        "goodevening": "Good evening.",
        "good night": "Good night.",
        "goodnight": "Good night.",
        "how are you": "How are you?",
        "howareyou": "How are you?",
        "what your name": "What is your name?",
        "what is your name": "What is your name?",
        "my name": "My name is ...",
        "i love you": "I love you.",
        "i am happy": "I am happy.",
        "i am sad": "I am sad.",
        "i am fine": "I am fine.",
        "i am good": "I am good.",
        "where you go": "Where are you going?",
        "where you live": "Where do you live?",
        "what you doing": "What are you doing?",
        "what doing": "What are you doing?",
        "you okay": "Are you okay?",
        "are you okay": "Are you okay?",
        "i want water": "I want water.",
        "i need water": "I need water.",
        "give me water": "Please give me water.",
        "i want food": "I want food.",
        "i need food": "I need food.",
        "i am hungry": "I am hungry.",
        "i am thirsty": "I am thirsty.",
        "go home": "I am going home.",
        "go school": "I am going to school.",
        "go college": "I am going to college.",
        "go market": "I am going to the market.",
        "market go": "I am going to the market.",
        "school go": "I am going to school.",
        "college go": "I am going to college.",
        "home go": "I am going home.",
        "today school": "I am going to school today.",
        "today college": "I am going to college today.",
        "tomorrow school": "I am going to school tomorrow.",
        "tomorrow college": "I am going to college tomorrow.",
        "yesterday school": "I went to school yesterday.",
        "yesterday college": "I went to college yesterday.",
        "i like": "I like it.",
        "i don't like": "I do not like it.",
        "help me": "Please help me.",
        "please help": "Please help me.",
        "sit down": "Please sit down.",
        "stand up": "Please stand up.",
        "open door": "Please open the door.",
        "close door": "Please close the door.",
        "turn on": "Please turn it on.",
        "turn off": "Please turn it off.",
        "yes": "Yes.",
        "no": "No.",
        "sorry": "I am sorry.",
        "welcome": "You are welcome.",
        "good": "Good.",
        "bad": "Bad.",
        "happy": "I am happy.",
        "sad": "Sad.",
        "angry": "I am angry.",
        "tired": "I am tired.",
        "strong": "I am strong.",
        "weak": "I am weak.",
        "question": "I have a question.",
        "answer": "This is the answer.",
        "time": "What is the time?",
        "place": "What is the place?",
        "language": "What is the language?",
        "know": "I know.",
        "don't know": "I do not know."
    }

    normalized_gloss = " ".join(words)
    if normalized_gloss in phrase_map:
        return phrase_map[normalized_gloss]

    # Rule-based fallback
    if len(words) >= 2 and words[-1] == "go":
        destination = " ".join(words[:-1])
        return f"I am going to {destination}."

    if "want" in words:
        want_index = words.index("want")
        if want_index < len(words) - 1:
            obj = " ".join(words[want_index + 1:])
            return f"I want {obj}."

    if "need" in words:
        need_index = words.index("need")
        if need_index < len(words) - 1:
            obj = " ".join(words[need_index + 1:])
            return f"I need {obj}."

    if words[0] == "i" and len(words) >= 2:
        sentence = " ".join(words)
        return sentence[0].upper() + sentence[1:] + "."

    question_words = {"what", "where", "when", "why", "who", "how"}
    if words[0] in question_words:
        sentence = " ".join(words)
        return sentence[0].upper() + sentence[1:] + "?"

    if len(words) == 1:
        w = words[0]
        if w in phrase_map:
            return phrase_map[w]
        return w.capitalize() + "."

    sentence = " ".join(words)
    return sentence[0].upper() + sentence[1:] + "."

@app.post("/convert")
async def convert_gloss(req: ConvertRequest):
    try:
        gloss = req.gloss or ""
        if not gloss and req.gloss_words:
            gloss = " ".join(req.gloss_words)
        elif not gloss and req.text:
            gloss = req.text
        english = convert_gloss_to_english(gloss)
        if gloss.strip() and english.strip():
            save_history(gloss, english)
        return {
            "success": True,
            "gloss": gloss,
            "english": english,
            "sentence": english
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/history")
async def get_history():
    return load_history()

@app.post("/history/clear")
async def clear_history():
    try:
        with open(HISTORY_PATH, "w", encoding="utf-8") as f:
            json.dump([], f, ensure_ascii=False, indent=2)
        return {"success": True, "message": "History cleared"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def extract_video_sequence(video_path: str):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return None, 0, 0

    frames = []
    total_frames = 0
    detected_frames = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        total_frames += 1
        landmarks_126, has_hand = extract_landmarks_from_cv2_frame(frame)
        if has_hand:
            detected_frames += 1
        frames.append(landmarks_126)

    cap.release()

    if len(frames) == 0:
        return None, total_frames, detected_frames

    frames = np.asarray(frames, dtype=np.float32)

    # Downsample or pad to exactly SEQUENCE_LENGTH (60) frames
    if len(frames) >= SEQUENCE_LENGTH:
        indexes = np.linspace(0, len(frames) - 1, SEQUENCE_LENGTH).astype(int)
        frames = frames[indexes]
    else:
        padding = np.zeros((SEQUENCE_LENGTH - len(frames), NUM_FEATURES), dtype=np.float32)
        frames = np.vstack([frames, padding])

    return frames, total_frames, detected_frames

@app.post("/predict-video")
async def predict_video(file: UploadFile = File(...)):
    temp_path = None
    try:
        contents = await file.read()
        if not contents:
            return {"success": False, "error": "Empty video received"}

        suffix = ".webm" if file.filename and file.filename.lower().endswith(".webm") else ".mp4"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(contents)
            temp_path = temp_file.name

        sequence, total_frames, detected_frames = extract_video_sequence(temp_path)
        if sequence is None:
            return {"success": False, "error": "Could not read video frames"}

        hand_detection_pct = (detected_frames / total_frames * 100.0) if total_frames > 0 else 0.0
        if hand_detection_pct < 20.0 or detected_frames < 6:
            return {
                "success": True,
                "word": "No hand detected",
                "confidence": 0.0,
                "reason": "low_hand_detection",
                "video_info": {
                    "total_frames": total_frames,
                    "detected_frames": detected_frames,
                    "hand_detection_percentage": round(hand_detection_pct, 2)
                }
            }

        norm_seq = normalize_sequence(sequence)
        input_data = np.expand_dims(norm_seq, axis=0)

        preds = _predict_compiled(input_data).numpy()[0]
        top_indices = np.argsort(preds)[::-1]
        
        top1_idx = int(top_indices[0])
        top1_conf = float(preds[top1_idx])
        top1_raw = LABEL_MAPPING.get(str(top1_idx), f"CLASS_{top1_idx}")
        top1_formatted = format_class_name(top1_raw)

        top3 = []
        for rank in range(min(3, len(top_indices))):
            idx = int(top_indices[rank])
            conf = float(preds[idx])
            raw_lbl = LABEL_MAPPING.get(str(idx), f"CLASS_{idx}")
            top3.append({
                "class_id": idx,
                "label": format_class_name(raw_lbl),
                "confidence": round(conf, 4)
            })

        print(f"[Sambhav ML] /predict-video: word='{top1_formatted}' conf={top1_conf:.4f} (detected={detected_frames}/{total_frames} frames)")

        return {
            "success": True,
            "word": top1_formatted,
            "confidence": round(top1_conf, 4),
            "top3": top3,
            "video_info": {
                "total_frames": total_frames,
                "detected_frames": detected_frames,
                "hand_detection_percentage": round(hand_detection_pct, 2)
            }
        }
    except Exception as e:
        print("[Sambhav ML] /predict-video error:", e)
        return {"success": False, "error": str(e)}
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

@app.websocket('/ws/stream')
async def websocket_stream_endpoint(websocket: WebSocket):
    await websocket.accept()
    print('[Sambhav ML] WebSocket client connected for live sign recognition.')

    rolling_buffer = []

    try:
        while True:
            data = await websocket.receive_json()
            
            if 'landmarks' in data and isinstance(data['landmarks'], list):
                lm = np.array(data['landmarks'], dtype=np.float32)
                if len(lm) == NUM_FEATURES:
                    rolling_buffer.append(lm)
                    if len(rolling_buffer) > SEQUENCE_LENGTH:
                        rolling_buffer.pop(0)

                    if len(rolling_buffer) >= 10:
                        seq_arr = np.array(rolling_buffer, dtype=np.float32)
                        result = run_bilstm_inference(seq_arr)
                        await websocket.send_json(result)

            elif 'image' in data and isinstance(data['image'], str):
                header_split = data['image'].split(',')
                b64 = header_split[1] if len(header_split) > 1 else header_split[0]
                img_bytes = base64.b64decode(b64)
                np_arr = np.frombuffer(img_bytes, np.uint8)
                frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

                if frame is not None:
                    landmarks_126, has_hand = extract_landmarks_from_cv2_frame(frame)
                    if has_hand:
                        rolling_buffer.append(landmarks_126)
                        if len(rolling_buffer) > SEQUENCE_LENGTH:
                            rolling_buffer.pop(0)
                        
                        seq_arr = np.array(rolling_buffer, dtype=np.float32)
                        result = run_bilstm_inference(seq_arr)
                        result['has_hand'] = True
                        await websocket.send_json(result)
                    else:
                        await websocket.send_json({'gesture': 'NO_HANDS', 'label': 'Show hands to sign', 'confidence': 0.0})

    except WebSocketDisconnect:
        print('[Sambhav ML] WebSocket client disconnected.')
    except Exception as e:
        print(f'[Sambhav ML] WebSocket error: {e}')
        try:
            await websocket.close()
        except Exception:
            pass

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
