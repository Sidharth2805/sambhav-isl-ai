import os
import json
import base64
import numpy as np
import cv2
import tensorflow as tf
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision
from typing import List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title='Sambhav ISL AI - Sign Language Recognition Service',
    description='Real-time BiLSTM neural network inference service for 169 Indian Sign Language gestures.',
    version='1.0.0'
)

ALLOWED_ORIGINS = [
    "https://sambhav-isl.onrender.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')

# Support candidate model filenames
candidate_model_files = [
    os.path.join(MODELS_DIR, 'new_model.keras'),
    os.path.join(MODELS_DIR, 'isl_model.keras'),
    os.path.join(MODELS_DIR, 'model.keras'),
    os.path.join(MODELS_DIR, 'model.h5'),
    os.path.join(MODELS_DIR, 'saanket_bilstm.keras')
]

MODEL_PATH = next((p for p in candidate_model_files if os.path.exists(p)), candidate_model_files[-1])
LABEL_PATH = os.path.join(MODELS_DIR, 'label_mapping.json')
MEAN_PATH = os.path.join(MODELS_DIR, 'mean.npy')
STD_PATH = os.path.join(MODELS_DIR, 'std.npy')
TASK_PATH = os.path.join(MODELS_DIR, 'hand_landmarker.task')

print(f'[Sambhav ML] Loading model from: {MODEL_PATH}')

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f'Model file not found at: {MODEL_PATH}')

model = tf.keras.models.load_model(MODEL_PATH, compile=False)
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
    if mean_vec.shape[0] != NUM_FEATURES:
        mean_vec = np.zeros(NUM_FEATURES, dtype=np.float32)
        std_vec = np.ones(NUM_FEATURES, dtype=np.float32)
    else:
        std_vec = np.where(std_vec < 1e-6, 1.0, std_vec)
    print(f'[Sambhav ML] Normalization parameters loaded (mean: {mean_vec.shape}, std: {std_vec.shape})')
else:
    mean_vec = np.zeros(NUM_FEATURES, dtype=np.float32)
    std_vec = np.ones(NUM_FEATURES, dtype=np.float32)
    print('[Sambhav ML] Using default normalization.')

print(f'[Sambhav ML Dynamic Config] Sequence Length: {SEQUENCE_LENGTH}, Num Features: {NUM_FEATURES}, Num Classes: {NUM_CLASSES}')

hand_detector = None
if os.path.exists(TASK_PATH):
    try:
        base_options = mp_python.BaseOptions(model_asset_path=TASK_PATH)
        options = mp_vision.HandLandmarkerOptions(base_options=base_options, num_hands=2)
        hand_detector = mp_vision.HandLandmarker.create_from_options(options)
        print('[Sambhav ML] MediaPipe HandLandmarker initialized.')
    except Exception as e:
        print('[Sambhav ML] MediaPipe detector warning:', e)

FRIENDLY_PHRASES = {
    'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G',
    'H': 'H', 'I': 'I', 'J': 'J', 'K': 'K', 'L': 'L', 'M': 'M', 'N': 'N',
    'O': 'O', 'P': 'P', 'Q': 'Q', 'R': 'R', 'S': 'S', 'T': 'T', 'U': 'U',
    'V': 'V', 'W': 'W', 'X': 'X', 'Y': 'Y', 'Z': 'Z',
    'hello': 'Hello',
    'thank you': 'Thank You',
    'thank_you': 'Thank You',
    'help': 'Help',
    'please': 'Please',
    'good': 'Good',
    'bad': 'Bad',
    'yes': 'Yes',
    'no': 'No',
    'doctor': 'Doctor',
    'hospital': 'Hospital',
    'school': 'School',
    'home': 'Home',
    'water': 'Water',
    'food': 'Food',
    'happy': 'Happy',
    'sad': 'Sad',
}

MIN_CONFIDENCE_THRESHOLD = 0.15

def normalize_sequence(sequence: np.ndarray) -> np.ndarray:
    seq = np.asarray(sequence, dtype=np.float32)
    if seq.ndim == 3 and seq.shape[0] == 1:
        seq = seq[0]
    m = mean_vec.reshape(NUM_FEATURES)
    s = std_vec.reshape(NUM_FEATURES)
    norm = (seq - m) / s
    return norm.astype(np.float32)

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
        for hand_idx, hand_lms in enumerate(detection_result.hand_landmarks[:2]):
            for lm_idx, lm in enumerate(hand_lms):
                landmarks[hand_idx, lm_idx, 0] = lm.x
                landmarks[hand_idx, lm_idx, 1] = lm.y
                landmarks[hand_idx, lm_idx, 2] = lm.z

    return landmarks.flatten(), has_hand

import hashlib

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

def run_bilstm_inference(sequence_126: np.ndarray) -> dict:
    curr_len = len(sequence_126)
    if curr_len == 0:
        return {
            'gesture': 'UNKNOWN',
            'label': 'No gesture',
            'confidence': 0.0,
            'top2_confidence': 0.0,
            'margin': 0.0,
            'phrase': '',
            'top_3': []
        }

    if curr_len < SEQUENCE_LENGTH:
        # Replicate training-time zero-padding strategy
        padding = np.zeros((SEQUENCE_LENGTH - curr_len, NUM_FEATURES), dtype=np.float32)
        padded_seq = np.vstack([sequence_126, padding])
    elif curr_len > SEQUENCE_LENGTH:
        padded_seq = sequence_126[-SEQUENCE_LENGTH:]
    else:
        padded_seq = sequence_126

    norm_seq = normalize_sequence(padded_seq)
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

    phrase = FRIENDLY_PHRASES.get(raw_label.lower(), FRIENDLY_PHRASES.get(raw_label, raw_label))

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
        'model': 'Sambhav Model 2 (10-layer BiLSTM + GaussianNoise)',
        'model_file': os.path.basename(MODEL_PATH),
        'model_md5': md5_hash,
        'frozen_md5_valid': md5_hash == 'bc0bcda972796ec08526627e8c0c498a',
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
        seq_array = np.array(req.sequence, dtype=np.float32)
        if seq_array.ndim != 2 or seq_array.shape[1] != NUM_FEATURES:
            raise HTTPException(status_code=400, detail=f'Expected shape (N, {NUM_FEATURES}), got {seq_array.shape}')
        
        result = run_bilstm_inference(seq_array)
        return result
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
