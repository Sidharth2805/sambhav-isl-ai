import os
import json
import numpy as np
import tensorflow as tf
import keras_tuner as kt

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.utils.class_weight import compute_class_weight

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Input, Bidirectional, LSTM, Dense, Dropout, BatchNormalization, GaussianNoise
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.regularizers import l2


# ============================================================
# SETTINGS
# ============================================================

DATA_DIR = r"C:\Users\LENOVO\Downloads\saanketfinal\processed_data"
MODEL_DIR = "../models"
TUNER_DIR = "../tuner_results"

X_FILE = os.path.join(DATA_DIR, "X.npy")
Y_FILE = os.path.join(DATA_DIR, "y.npy")

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(TUNER_DIR, exist_ok=True)


# ============================================================
# LOAD DATA
# ============================================================

print("\n==========================================")
print("SAANKET BiLSTM HYPERPARAMETER TUNING")
print("==========================================\n")

X = np.load(X_FILE)
y = np.load(Y_FILE, allow_pickle=True)

print("X shape:", X.shape)
print("y shape:", y.shape)


# ============================================================
# LABEL ENCODING
# ============================================================

label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)
class_names = label_encoder.classes_
num_classes = len(class_names)

print("Number of classes:", num_classes)

label_mapping = {str(i): str(c) for i, c in enumerate(class_names)}
with open(os.path.join(MODEL_DIR, "label_mapping.json"), "w", encoding="utf-8") as f:
    json.dump(label_mapping, f, indent=4, ensure_ascii=False)


# ============================================================
# TRAIN / VALIDATION / TEST SPLIT
# ============================================================

X_temp, X_test, y_temp, y_test = train_test_split(
    X, y_encoded, test_size=0.15, random_state=42, stratify=y_encoded
)

X_train, X_val, y_train, y_val = train_test_split(
    X_temp, y_temp, test_size=0.17647, random_state=42, stratify=y_temp
)

print(f"Train: {len(X_train)}  Val: {len(X_val)}  Test: {len(X_test)}")


# ============================================================
# NORMALIZATION
# ============================================================

mean = np.mean(X_train, axis=(0, 1), keepdims=True)
std = np.std(X_train, axis=(0, 1), keepdims=True)
std = np.where(std < 1e-6, 1.0, std)

X_train = (X_train - mean) / std
X_val   = (X_val   - mean) / std
X_test  = (X_test  - mean) / std

np.save(os.path.join(MODEL_DIR, "mean.npy"), mean)
np.save(os.path.join(MODEL_DIR, "std.npy"),  std)


# ============================================================
# CLASS WEIGHTS
# ============================================================

classes = np.unique(y_train)
weights = compute_class_weight(class_weight="balanced", classes=classes, y=y_train)
class_weights = {int(c): float(w) for c, w in zip(classes, weights)}


# ============================================================
# DATA AUGMENTATION — applied once upfront on training data
# ============================================================

def augment_data(X, noise_std=0.01, mask_prob=0.05, time_warp=True):
    # Gaussian noise
    noise = np.random.standard_normal(X.shape).astype(np.float32) * noise_std
    X_aug = X + noise
    # Time-step masking
    mask = (np.random.rand(X.shape[0], X.shape[1]) > mask_prob).astype(np.float32)
    X_aug = X_aug * mask[:, :, np.newaxis]
    # Random temporal scaling (speed variation)
    if time_warp:
        scale = np.random.uniform(0.9, 1.1)
        X_aug = X_aug * scale
    return X_aug

# 3x augmentation: original + 2 different augmented copies
X_train_aug = np.concatenate([
    X_train,
    augment_data(X_train, noise_std=0.01, mask_prob=0.05),
    augment_data(X_train, noise_std=0.02, mask_prob=0.10)
], axis=0).astype(np.float32)
y_train_aug = np.concatenate([y_train, y_train, y_train], axis=0)

print(f"Augmented train size: {len(X_train_aug)}")


# ============================================================
# MODEL BUILDER FOR KERAS TUNER
# ============================================================

def build_model(hp):
    lstm1_units   = hp.Int("lstm1_units",  min_value=64,   max_value=256,  step=64)
    lstm2_units   = hp.Int("lstm2_units",  min_value=32,   max_value=128,  step=32)
    dense_units   = hp.Int("dense_units",  min_value=64,   max_value=256,  step=64)
    dropout_rate  = hp.Float("dropout",    min_value=0.2,  max_value=0.5,  step=0.1)
    learning_rate = hp.Choice("lr",        values=[1e-2, 1e-3, 5e-4, 1e-4])
    l2_reg        = hp.Choice("l2_reg",    values=[0.0, 1e-4, 1e-3, 1e-2])

    reg = l2(l2_reg) if l2_reg > 0 else None

    model = Sequential([
        Input(shape=(X_train.shape[1], X_train.shape[2])),

        GaussianNoise(0.01),

        Bidirectional(LSTM(lstm1_units, return_sequences=True, kernel_regularizer=reg)),
        BatchNormalization(),
        Dropout(dropout_rate),

        Bidirectional(LSTM(lstm2_units, return_sequences=False, kernel_regularizer=reg)),
        BatchNormalization(),
        Dropout(dropout_rate),

        Dense(dense_units, activation="relu", kernel_regularizer=reg),
        Dropout(dropout_rate),

        Dense(num_classes, activation="softmax")
    ])

    model.compile(
        optimizer=Adam(learning_rate=learning_rate),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    return model


# ============================================================
# KERAS TUNER — HYPERBAND
# ============================================================

tuner = kt.Hyperband(
    build_model,
    objective="val_accuracy",
    max_epochs=30,
    factor=3,
    directory=TUNER_DIR,
    project_name="bilstm_tuning",
    overwrite=False
)

tuner.search_space_summary()

search_callbacks = [
    EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True),
    ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=3, min_lr=1e-6)
]

print("\n==========================================")
print("STARTING HYPERPARAMETER SEARCH")
print("==========================================\n")

tuner.search(
    X_train_aug, y_train_aug,
    validation_data=(X_val, y_val),
    epochs=30,
    batch_size=32,
    class_weight=class_weights,
    callbacks=search_callbacks,
    verbose=1
)


# ============================================================
# BEST HYPERPARAMETERS
# ============================================================

best_hps = tuner.get_best_hyperparameters(num_trials=1)[0]

print("\n==========================================")
print("BEST HYPERPARAMETERS FOUND")
print("==========================================")
print(f"  lstm1_units  : {best_hps.get('lstm1_units')}")
print(f"  lstm2_units  : {best_hps.get('lstm2_units')}")
print(f"  dense_units  : {best_hps.get('dense_units')}")
print(f"  dropout      : {best_hps.get('dropout')}")
print(f"  learning_rate: {best_hps.get('lr')}")
print(f"  l2_reg       : {best_hps.get('l2_reg')}")

best_hps_dict = {
    "lstm1_units":   best_hps.get("lstm1_units"),
    "lstm2_units":   best_hps.get("lstm2_units"),
    "dense_units":   best_hps.get("dense_units"),
    "dropout":       best_hps.get("dropout"),
    "learning_rate": best_hps.get("lr"),
    "l2_reg":        best_hps.get("l2_reg")
}

with open(os.path.join(MODEL_DIR, "best_hyperparameters.json"), "w") as f:
    json.dump(best_hps_dict, f, indent=4)

print("\nBest hyperparameters saved to models/best_hyperparameters.json")


# ============================================================
# TRAIN FINAL MODEL WITH BEST HYPERPARAMETERS
# ============================================================

print("\n==========================================")
print("TRAINING FINAL MODEL WITH BEST HPs")
print("==========================================\n")

final_model = tuner.hypermodel.build(best_hps)

history = final_model.fit(
    X_train_aug, y_train_aug,
    validation_data=(X_val, y_val),
    epochs=50,
    batch_size=32,
    class_weight=class_weights,
    callbacks=[
        EarlyStopping(monitor="val_loss", patience=8, restore_best_weights=True),
        ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=3, min_lr=1e-6)
    ],
    verbose=1
)


# ============================================================
# EVALUATE AND SAVE
# ============================================================

test_loss, test_accuracy = final_model.evaluate(X_test, y_test, verbose=1)
print(f"\nTest Loss    : {test_loss:.4f}")
print(f"Test Accuracy: {test_accuracy * 100:.2f}%")

model_path = os.path.join(MODEL_DIR, "saanket_bilstm.keras")
final_model.save(model_path)
print(f"\nFinal model saved to: {model_path}")

history_data = {k: [float(v) for v in vals] for k, vals in history.history.items()}
with open(os.path.join(MODEL_DIR, "training_history.json"), "w") as f:
    json.dump(history_data, f, indent=4)

print("\n==========================================")
print("TUNING + TRAINING COMPLETE")
print("==========================================\n")
