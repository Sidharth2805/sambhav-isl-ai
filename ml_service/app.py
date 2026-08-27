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

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')

MODEL_PATH = os.path.join(MODELS_DIR, 'saanket_bilstm.keras')
LABEL_PATH = os.path.join(MODELS_DIR, 'label_mapping.json')
MEAN_PATH = os.path.join(MODELS_DIR, 'mean.npy')
STD_PATH = os.path.join(MODELS_DIR, 'std.npy')
TASK_PATH = os.path.join(MODELS_DIR, 'hand_landmarker.task')

SEQUENCE_LENGTH = 60
NUM_FEATURES = 126
MIN_CONFIDENCE_THRESHOLD = 0.40

print('[Sambhav ML] Loading model and assets...')

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f'Model file not found at: {MODEL_PATH}')

model = tf.keras.models.load_model(MODEL_PATH, compile=False)
print(f'[Sambhav ML] Model loaded successfully: input={model.input_shape}, output={model.output_shape}')

if os.path.exists(LABEL_PATH):
    with open(LABEL_PATH, 'r', encoding='utf-8') as f:
        LABEL_MAPPING = json.load(f)
else:
    LABEL_MAPPING = {}

print(f'[Sambhav ML] Loaded {len(LABEL_MAPPING)} label classes.')

if os.path.exists(MEAN_PATH) and os.path.exists(STD_PATH):
    mean_vec = np.squeeze(np.load(MEAN_PATH)).astype(np.float32)
    std_vec = np.squeeze(np.load(STD_PATH)).astype(np.float32)
    std_vec = np.where(std_vec < 1e-6, 1.0, std_vec)
    print(f'[Sambhav ML] Normalization parameters loaded (mean: {mean_vec.shape}, std: {std_vec.shape})')
else:
    mean_vec = np.zeros(NUM_FEATURES, dtype=np.float32)
    std_vec = np.ones(NUM_FEATURES, dtype=np.float32)
    print('[Sambhav ML] Using default normalization.')

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
    'hello': 'Hello! Welcome to Sambhav.',
    'thank you': 'Thank you very much!',
    'help': 'I need assistance or help.',
    'please': 'Please.',
    'good': 'That is good.',
    'bad': 'Not good.',
    'yes': 'Yes, I agree.',
    'no': 'No.',
    'name': 'My name is...',
    'doctor': 'I need a doctor.',
    'hospital': 'Hospital.',
    'school': 'School.',
    'home': 'Home.',
    'water': 'I need water.',
    'food': 'I need food.',
    'happy': 'I am feeling happy.',
    'sad': 'I am feeling sad.',
}

def normalize_sequence(sequence: np.ndarray) -> np.ndarray:
    norm = (sequence - mean_vec) / std_vec
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

def run_bilstm_inference(sequence_126: np.ndarray) -> dict:
    curr_len = len(sequence_126)
    if curr_len == 0:
        return {'gesture': 'UNKNOWN', 'label': 'No gesture', 'confidence': 0.0, 'phrase': '', 'top_3': []}

    if curr_len < SEQUENCE_LENGTH:
        last_frame = sequence_126[-1]
        padding = np.tile(last_frame, (SEQUENCE_LENGTH - curr_len, 1))
        padded_seq = np.vstack([sequence_126, padding])
    elif curr_len > SEQUENCE_LENGTH:
        padded_seq = sequence_126[-SEQUENCE_LENGTH:]
    else:
        padded_seq = sequence_126

    norm_seq = normalize_sequence(padded_seq)
    batch_input = np.expand_dims(norm_seq, axis=0)
    preds = model.predict(batch_input, verbose=0)[0]

    top_idx = int(np.argmax(preds))
    confidence = float(preds[top_idx])
    raw_label = LABEL_MAPPING.get(str(top_idx), f'CLASS_{top_idx}')

    top_3_indices = np.argsort(preds)[::-1][:3]
    top_3 = [
        {'class_id': int(i), 'label': LABEL_MAPPING.get(str(i), f'CLASS_{i}'), 'confidence': float(preds[i])}
        for i in top_3_indices
    ]

    phrase = FRIENDLY_PHRASES.get(raw_label.lower(), FRIENDLY_PHRASES.get(raw_label, raw_label))

    if confidence < MIN_CONFIDENCE_THRESHOLD:
        return {
            'gesture': 'UNKNOWN',
            'label': 'Analyzing gesture...',
            'raw_label': raw_label,
            'confidence': confidence,
            'phrase': '',
            'top_3': top_3,
        }

    return {
        'gesture': raw_label,
        'label': raw_label,
        'raw_label': raw_label,
        'confidence': confidence,
        'phrase': phrase,
        'top_3': top_3,
    }

class LandmarkSequenceRequest(BaseModel):
    sequence: List[List[float]]

class ImageFrameRequest(BaseModel):
    image_base64: str

@app.get('/health')
async def health_check():
    return {
        'status': 'healthy',
        'service': 'Sambhav ISL AI Recognition Service',
        'model': 'BiLSTM (saanket_bilstm.keras)',
        'num_classes': len(LABEL_MAPPING),
        'sequence_length': SEQUENCE_LENGTH,
        'num_features': NUM_FEATURES,
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
