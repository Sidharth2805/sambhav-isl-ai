import os
import json
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.utils.class_weight import compute_class_weight

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Input, Bidirectional, LSTM, Dense, Dropout, BatchNormalization, GaussianNoise
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.regularizers import l2


# ============================================================
# SETTINGS
# ============================================================

DATA_DIR  = r"C:\Users\LENOVO\Downloads\saanketfinal\processed_data"
MODEL_DIR = "../models"

os.makedirs(MODEL_DIR, exist_ok=True)

# Best hyperparameters from tuning
LSTM1_UNITS   = 128
LSTM2_UNITS   = 96
DENSE_UNITS   = 128
DROPOUT       = 0.4    # increased from 0.2 to reduce overfitting
LEARNING_RATE = 0.0001
L2_REG        = 0.001


# ============================================================
# LOAD & PREPARE DATA
# ============================================================

print("\n==========================================")
print("RETRAIN WITH REDUCED OVERFITTING")
print("==========================================\n")

X = np.load(os.path.join(DATA_DIR, "X.npy"))
y = np.load(os.path.join(DATA_DIR, "y.npy"), allow_pickle=True)

label_encoder = LabelEncoder()
y_encoded     = label_encoder.fit_transform(y)
class_names   = label_encoder.classes_
num_classes   = len(class_names)

print(f"Classes: {num_classes}, Samples: {len(X)}")

X_temp, X_test, y_temp, y_test = train_test_split(
    X, y_encoded, test_size=0.15, random_state=42, stratify=y_encoded
)
X_train, X_val, y_train, y_val = train_test_split(
    X_temp, y_temp, test_size=0.17647, random_state=42, stratify=y_temp
)

# Normalize
mean = np.load(os.path.join(MODEL_DIR, "mean.npy"))
std  = np.load(os.path.join(MODEL_DIR, "std.npy"))

X_train = (X_train - mean) / std
X_val   = (X_val   - mean) / std
X_test  = (X_test  - mean) / std

# Class weights
classes      = np.unique(y_train)
weights      = compute_class_weight(class_weight="balanced", classes=classes, y=y_train)
class_weights = {int(c): float(w) for c, w in zip(classes, weights)}


# ============================================================
# AUGMENTATION — 3x training data
# ============================================================

def augment_data(X, noise_std=0.01, mask_prob=0.05):
    noise = np.random.standard_normal(X.shape).astype(np.float32) * noise_std
    X_aug = (X + noise) * np.random.uniform(0.9, 1.1)
    mask  = (np.random.rand(X.shape[0], X.shape[1]) > mask_prob).astype(np.float32)
    return X_aug * mask[:, :, np.newaxis]

X_train_aug = np.concatenate([
    X_train,
    augment_data(X_train, noise_std=0.01, mask_prob=0.05),
    augment_data(X_train, noise_std=0.02, mask_prob=0.10)
], axis=0).astype(np.float32)
y_train_aug = np.concatenate([y_train, y_train, y_train], axis=0)

print(f"Train: {len(X_train_aug)}  Val: {len(X_val)}  Test: {len(X_test)}")


# ============================================================
# BUILD MODEL
# ============================================================

reg = l2(L2_REG)

model = Sequential([
    Input(shape=(X_train.shape[1], X_train.shape[2])),

    GaussianNoise(0.01),

    Bidirectional(LSTM(LSTM1_UNITS, return_sequences=True, kernel_regularizer=reg)),
    BatchNormalization(),
    Dropout(DROPOUT),

    Bidirectional(LSTM(LSTM2_UNITS, return_sequences=False, kernel_regularizer=reg)),
    BatchNormalization(),
    Dropout(DROPOUT),

    Dense(DENSE_UNITS, activation="relu", kernel_regularizer=reg),
    Dropout(DROPOUT),

    Dense(num_classes, activation="softmax")
])

model.compile(
    optimizer=Adam(learning_rate=LEARNING_RATE),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()


# ============================================================
# TRAIN
# ============================================================

print("\n==========================================")
print("TRAINING")
print("==========================================\n")

history = model.fit(
    X_train_aug, y_train_aug,
    validation_data=(X_val, y_val),
    epochs=80,
    batch_size=32,
    class_weight=class_weights,
    callbacks=[
        EarlyStopping(monitor="val_loss", patience=10, restore_best_weights=True),
        ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=4, min_lr=1e-7),
        ModelCheckpoint(
            os.path.join(MODEL_DIR, "saanket_bilstm.keras"),
            monitor="val_accuracy",
            save_best_only=True
        )
    ],
    verbose=1
)


# ============================================================
# EVALUATE
# ============================================================

train_loss, train_acc = model.evaluate(X_train, y_train, verbose=0)
val_loss,   val_acc   = model.evaluate(X_val,   y_val,   verbose=0)
test_loss,  test_acc  = model.evaluate(X_test,  y_test,  verbose=0)

print("\n==========================================")
print("FINAL RESULTS")
print("==========================================")
print(f"  Train accuracy : {train_acc * 100:.2f}%")
print(f"  Val accuracy   : {val_acc   * 100:.2f}%")
print(f"  Test accuracy  : {test_acc  * 100:.2f}%")
print(f"  Train/Val gap  : {(train_acc - val_acc) * 100:.2f}%")

history_data = {k: [float(v) for v in vals] for k, vals in history.history.items()}
with open(os.path.join(MODEL_DIR, "training_history.json"), "w") as f:
    json.dump(history_data, f, indent=4)

print("\nDone.")
