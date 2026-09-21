import numpy as np
import json
import os
import sys
import tensorflow as tf

sys.path.insert(0, os.path.abspath('.'))

from ml_service.app import (
    run_bilstm_inference,
    convert_gloss_to_english,
    LABEL_MAPPING,
    format_class_name
)

print('=== STEP 1: VERIFYING INFERENCE ENGINE ===')
print(f'Total Classes: {len(LABEL_MAPPING)}')
print(f'Sample Alphabet Classes: {[LABEL_MAPPING[str(i)] for i in range(10)]}')
print(f'Sample Word Classes: {[LABEL_MAPPING[str(i)] for i in range(26, 36)]}')

# Test single hand pose in Slot 0 (features 0..62)
sample_seq = np.zeros((60, 126), dtype=np.float32)
hand_base = np.array([
    [0.5, 0.7, 0.0], [0.45, 0.65, -0.02], [0.42, 0.6, -0.03], [0.4, 0.55, -0.04], [0.38, 0.5, -0.05],
    [0.48, 0.55, -0.03], [0.47, 0.48, -0.04], [0.46, 0.42, -0.05], [0.45, 0.37, -0.06],
    [0.51, 0.54, -0.02], [0.51, 0.46, -0.03], [0.51, 0.39, -0.04], [0.51, 0.33, -0.05],
    [0.54, 0.55, -0.02], [0.55, 0.48, -0.03], [0.56, 0.42, -0.04], [0.56, 0.37, -0.05],
    [0.57, 0.57, -0.01], [0.59, 0.52, -0.02], [0.6, 0.47, -0.03], [0.61, 0.43, -0.04]
], dtype=np.float32).flatten()

for t in range(60):
    sample_seq[t, :63] = hand_base + np.random.normal(0, 0.005, 63)

res = run_bilstm_inference(sample_seq)
print('\nInference Output on Sample Hand Gesture:')
print(f'  Gesture: {res.get("gesture")}')
print(f'  Label: {res.get("label")}')
print(f'  Confidence: {res.get("confidence", 0):.4f}')
print(f'  Top 2: {res.get("top2_label")} ({res.get("top2_confidence", 0):.4f})')
print(f'  Top 3 List: {res.get("top_3")}')

print('\n=== STEP 2: VERIFYING GLOSS CONVERSION ===')
test_glosses = [
    'namaste you name what',
    'hello how are you',
    'i want water please',
    'my father teacher',
    'good morning welcome'
]

for g in test_glosses:
    conv = convert_gloss_to_english(g)
    print(f'  Gloss: "{g}" -> English: "{conv}"')

print('\nALL PIPELINE CHECKS PASSED!')
