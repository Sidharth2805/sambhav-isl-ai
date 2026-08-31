import os
import json
import cv2
import base64
import asyncio
import numpy as np
import mediapipe as mp
import tensorflow as tf
import tempfile

from collections import deque, Counter
from datetime import datetime

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    WebSocket,
    WebSocketDisconnect
)

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# ============================================================
# PATHS
# ============================================================

MODEL_PATH = "../models/saanket_bilstm.keras"
LABEL_PATH = "../models/label_mapping.json"

MEAN_PATH = "../models/mean.npy"
STD_PATH = "../models/std.npy"


# ============================================================
# CONFIGURATION
# ============================================================

MAX_FRAMES = 60
FEATURES = 126

# ------------------------------------------------------------
# REAL-TIME SETTINGS
# ------------------------------------------------------------

# The trained BiLSTM expects exactly 60 frames.
REALTIME_MIN_FRAMES = 60

# ------------------------------------------------------------
# Minimum real-time recognition duration.
#
# The frontend normally sends approximately 20 FPS.
#
# 5 seconds × 20 FPS = approximately 100 frames.
#
# The model still receives only the latest 60 frames.
# ------------------------------------------------------------
REALTIME_MINIMUM_SECONDS = 5.0
REALTIME_MINIMUM_FRAMES = 100

# Only predict when at least this percentage of the
# 60-frame window contains an actual detected hand.
MIN_HAND_DETECTION_PERCENTAGE = 55.0

# Minimum model confidence.
MIN_CONFIDENCE_PERCENTAGE = 55.0

# Number of predictions required to confirm a sign.
PREDICTION_HISTORY_SIZE = 3
STABLE_PREDICTION_COUNT = 2

# Do not run the model on every single incoming frame.
# This prevents extremely fast / unstable output.
REALTIME_PREDICTION_INTERVAL = 8

# After a sign is emitted, the system waits until the
# hands disappear before allowing another sign.
HAND_RELEASE_REQUIRED_FRAMES = 8

# A small movement must exist in the window.
# This helps reject a completely static empty/no-hand window.
MIN_ACTIVE_HAND_FRAMES = 12


# ============================================================
# SESSION HISTORY FILE
# ============================================================

HISTORY_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "history.json"
)


# ============================================================
# INITIALIZE HISTORY FILE
# ============================================================

if not os.path.exists(HISTORY_PATH):

    with open(
        HISTORY_PATH,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            [],
            f,
            ensure_ascii=False,
            indent=2
        )


# ============================================================
# LOAD MODEL
# ============================================================

print("==============================================")
print("LOADING SAANKET MODEL")
print("==============================================")

model = tf.keras.models.load_model(
    MODEL_PATH
)

print("Model loaded successfully.")
print("Model input shape :", model.input_shape)
print("Model output shape:", model.output_shape)


# ============================================================
# VERIFY MODEL INPUT
# ============================================================

if len(model.input_shape) != 3:

    raise ValueError(
        f"Model must accept 3D input "
        f"(batch, {MAX_FRAMES}, {FEATURES}), "
        f"but got {model.input_shape}"
    )


if model.input_shape[1] != MAX_FRAMES:

    raise ValueError(
        f"Model expects {model.input_shape[1]} frames, "
        f"but backend uses {MAX_FRAMES}"
    )


if model.input_shape[2] != FEATURES:

    raise ValueError(
        f"Model expects {model.input_shape[2]} features, "
        f"but backend uses {FEATURES}"
    )


# ============================================================
# LOAD LABEL MAPPING
# ============================================================

with open(
    LABEL_PATH,
    "r",
    encoding="utf-8"
) as f:

    label_mapping = json.load(f)


label_mapping = {
    int(key): value
    for key, value in label_mapping.items()
}


print(
    "Number of labels:",
    len(label_mapping)
)


# ============================================================
# LOAD TRAINING NORMALIZATION
# ============================================================

print()
print("Loading normalization parameters...")


if not os.path.exists(MEAN_PATH):

    raise FileNotFoundError(
        f"mean.npy not found at: {MEAN_PATH}"
    )


if not os.path.exists(STD_PATH):

    raise FileNotFoundError(
        f"std.npy not found at: {STD_PATH}"
    )


mean = np.load(
    MEAN_PATH
)

std = np.load(
    STD_PATH
)


print(
    "Original mean shape:",
    mean.shape
)

print(
    "Original std shape:",
    std.shape
)


# ============================================================
# TRAINING NORMALIZATION SHAPE
# ============================================================

mean = np.asarray(
    mean
).reshape(FEATURES)


std = np.asarray(
    std
).reshape(FEATURES)


std = np.where(
    std < 1e-6,
    1.0,
    std
)


print(
    "Final mean shape:",
    mean.shape
)

print(
    "Final std shape:",
    std.shape
)


# ============================================================
# MEDIAPIPE
# ============================================================

mp_hands = mp.solutions.hands


hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.55,
    min_tracking_confidence=0.55
)


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="SAANKET Backend",
    description="SAANKET Indian Sign Language Recognition Backend",
    version="3.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# ============================================================
# REQUEST MODEL
# ============================================================

class ConvertRequest(BaseModel):

    gloss: str


class SpeakRequest(BaseModel):

    text: str


# ============================================================
# HISTORY
# ============================================================

def load_history():

    try:

        if not os.path.exists(
            HISTORY_PATH
        ):

            return []


        with open(
            HISTORY_PATH,
            "r",
            encoding="utf-8"
        ) as f:

            data = json.load(f)


        if isinstance(
            data,
            list
        ):

            return data


        return []


    except Exception as e:

        print(
            "History loading error:",
            str(e)
        )

        return []


def save_history(
    gloss,
    english
):

    try:

        history = load_history()


        history.insert(
            0,
            {
                "gloss": str(gloss),
                "english": str(english),
                "created_at":
                    datetime.now().strftime(
                        "%Y-%m-%d %H:%M:%S"
                    )
            }
        )


        history = history[:100]


        with open(
            HISTORY_PATH,
            "w",
            encoding="utf-8"
        ) as f:

            json.dump(
                history,
                f,
                ensure_ascii=False,
                indent=2
            )


        return True


    except Exception as e:

        print(
            "History saving error:",
            str(e)
        )

        return False


@app.get("/history")
def get_history():

    return load_history()


# ============================================================
# ISL GLOSS → ENGLISH
# ============================================================

def convert_gloss_to_english(gloss):

    if gloss is None:

        return ""


    gloss = str(
        gloss
    ).strip().lower()


    if not gloss:

        return ""


    words = gloss.split()


    # --------------------------------------------------------
    # Remove duplicate consecutive signs.
    # --------------------------------------------------------

    cleaned_words = []

    for word in words:

        if (
            not cleaned_words
            or
            word != cleaned_words[-1]
        ):

            cleaned_words.append(
                word
            )


    words = cleaned_words

    normalized = " ".join(words)


    # ========================================================
    # COMMON COMPLETE ISL EXPRESSIONS
    # ========================================================

    phrase_map = {

        "hello":
            "Hello.",

        "hi":
            "Hello.",

        "bye":
            "Goodbye.",

        "thank you":
            "Thank you.",

        "thanks":
            "Thank you.",

        "good morning":
            "Good morning.",

        "good night":
            "Good night.",

        "how are you":
            "How are you?",

        "what your name":
            "What is your name?",

        "what is your name":
            "What is your name?",

        "my name":
            "My name is ...",

        "i love you":
            "I love you.",

        "i am happy":
            "I am happy.",

        "i am sad":
            "I am sad.",

        "i am fine":
            "I am fine.",

        "i am good":
            "I am good.",

        "where you go":
            "Where are you going?",

        "where you live":
            "Where do you live?",

        "what you doing":
            "What are you doing?",

        "what doing":
            "What are you doing?",

        "you okay":
            "Are you okay?",

        "are you okay":
            "Are you okay?",

        "i want water":
            "I want water.",

        "i need water":
            "I need water.",

        "give me water":
            "Please give me water.",

        "i want food":
            "I want food.",

        "i need food":
            "I need food.",

        "i am hungry":
            "I am hungry.",

        "i am thirsty":
            "I am thirsty.",

        "go home":
            "I am going home.",

        "go school":
            "I am going to school.",

        "go college":
            "I am going to college.",

        "go market":
            "I am going to the market.",

        "market go":
            "I am going to the market.",

        "school go":
            "I am going to school.",

        "college go":
            "I am going to college.",

        "home go":
            "I am going home.",

        "today school":
            "I am going to school today.",

        "today college":
            "I am going to college today.",

        "tomorrow school":
            "I am going to school tomorrow.",

        "tomorrow college":
            "I am going to college tomorrow.",

        "yesterday school":
            "I went to school yesterday.",

        "yesterday college":
            "I went to college yesterday.",

        "i like":
            "I like it.",

        "i don't like":
            "I do not like it.",

        "help me":
            "Please help me.",

        "please help":
            "Please help me.",

        "sit down":
            "Please sit down.",

        "stand up":
            "Please stand up.",

        "open door":
            "Please open the door.",

        "close door":
            "Please close the door.",

        "turn on":
            "Please turn it on.",

        "turn off":
            "Please turn it off.",

        "yes":
            "Yes.",

        "no":
            "No.",

        "sorry":
            "I am sorry.",

        "welcome":
            "You are welcome.",

        "good":
            "Good.",

        "bad":
            "Bad.",

        "happy":
            "I am happy.",

        "sad":
            "I am sad.",

        "angry":
            "I am angry.",

        "tired":
            "I am tired.",

        "strong":
            "I am strong.",

        "weak":
            "I am weak.",

        "hungry":
            "I am hungry.",

        "thirsty":
            "I am thirsty.",

        "know":
            "I know.",

        "don't know":
            "I do not know.",

        "question":
            "I have a question.",

        "answer":
            "This is the answer.",

        "time":
            "What is the time?",

        "place":
            "What is the place?",

        "language":
            "What is the language?"

    }


    if normalized in phrase_map:

        return phrase_map[
            normalized
        ]


    # ========================================================
    # QUESTION PATTERNS
    # ========================================================

    question_words = {
        "what",
        "where",
        "when",
        "why",
        "who",
        "how"
    }


    if words[0] in question_words:

        # Specific ISL-style question transformations.

        if (
            words[0] == "where"
            and
            len(words) >= 2
        ):

            if "go" in words:

                return "Where are you going?"

            if "live" in words:

                return "Where do you live?"


        if (
            words[0] == "what"
            and
            "name" in words
        ):

            return "What is your name?"


        sentence = " ".join(
            words
        ).capitalize()


        return sentence + "?"


    # ========================================================
    # SUBJECT + OBJECT + VERB
    # ISL ORDER → ENGLISH ORDER
    #
    # Example:
    #
    # I WATER WANT
    #
    # becomes:
    #
    # I want water.
    # ========================================================

    if len(words) >= 3:

        subject_words = {
            "i",
            "you",
            "he",
            "she",
            "we",
            "they"
        }


        verb_words = {
            "want",
            "need",
            "like",
            "love",
            "know",
            "eat",
            "drink",
            "go",
            "see",
            "watch",
            "read",
            "write",
            "learn",
            "play",
            "help",
            "give",
            "take",
            "buy",
            "open",
            "close"
        }


        # ----------------------------------------------------
        # SUBJECT ... VERB
        # ----------------------------------------------------

        if words[0] in subject_words:

            verb_position = None


            for i in range(
                1,
                len(words)
            ):

                if words[i] in verb_words:

                    verb_position = i

                    break


            if verb_position is not None:

                subject = words[0]

                verb = words[verb_position]

                object_words = (
                    words[
                        1:verb_position
                    ]
                    +
                    words[
                        verb_position + 1:
                    ]
                )


                if object_words:

                    obj = " ".join(
                        object_words
                    )


                    # Basic tense / grammar conversion.

                    if verb == "go":

                        return (
                            f"{subject.capitalize()} "
                            f"am going to {obj}."
                            if subject == "i"
                            else
                            f"{subject.capitalize()} "
                            f"is going to {obj}."
                        )


                    if verb == "want":

                        return (
                            f"{subject.capitalize()} "
                            f"want {obj}."
                            if subject in {
                                "you",
                                "we",
                                "they"
                            }
                            else
                            f"{subject.capitalize()} "
                            f"want {obj}."
                        )


                    if verb == "need":

                        return (
                            f"{subject.capitalize()} "
                            f"need {obj}."
                        )


                    if verb == "like":

                        return (
                            f"{subject.capitalize()} "
                            f"like {obj}."
                        )


                    return (
                        f"{subject.capitalize()} "
                        f"{verb} {obj}."
                    )


    # ========================================================
    # VERB AT END
    #
    # Example:
    #
    # WATER WANT
    #
    # becomes:
    #
    # I want water.
    # ========================================================

    if len(words) >= 2:

        if words[-1] in {
            "want",
            "need"
        }:

            verb = words[-1]

            obj = " ".join(
                words[:-1]
            )


            return (
                f"I {verb} {obj}."
            )


        if words[-1] == "go":

            destination = " ".join(
                words[:-1]
            )


            if destination == "home":

                return "I am going home."


            return (
                f"I am going to "
                f"{destination}."
            )


    # ========================================================
    # SIMPLE "I ..." SENTENCE
    # ========================================================

    if words[0] == "i":

        sentence = " ".join(
            words
        )


        return (
            sentence[0].upper()
            +
            sentence[1:]
            +
            "."
        )


    # ========================================================
    # SINGLE WORD
    # ========================================================

    if len(words) == 1:

        word = words[0]


        simple_map = {

            "hello":
                "Hello.",

            "bye":
                "Goodbye.",

            "happy":
                "I am happy.",

            "sad":
                "I am sad.",

            "angry":
                "I am angry.",

            "tired":
                "I am tired.",

            "hungry":
                "I am hungry.",

            "thirsty":
                "I am thirsty.",

            "strong":
                "I am strong.",

            "weak":
                "I am weak.",

            "know":
                "I know."

        }


        if word in simple_map:

            return simple_map[word]


        return (
            word.capitalize()
            +
            "."
        )


    # ========================================================
    # FALLBACK
    # ========================================================

    sentence = " ".join(
        words
    )


    return (
        sentence[0].upper()
        +
        sentence[1:]
        +
        "."
    )


# ============================================================
# EXTRACT LANDMARKS
# ============================================================

def extract_landmarks(frame):

    rgb = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2RGB
    )


    results = hands.process(
        rgb
    )


    landmarks = np.zeros(
        (2, 21, 3),
        dtype=np.float32
    )


    detected = False


    if results.multi_hand_landmarks:

        detected = True


        for (
            hand_index,
            hand_landmarks
        ) in enumerate(
            results.multi_hand_landmarks[:2]
        ):

            for (
                landmark_index,
                landmark
            ) in enumerate(
                hand_landmarks.landmark
            ):

                landmarks[
                    hand_index,
                    landmark_index,
                    0
                ] = landmark.x

                landmarks[
                    hand_index,
                    landmark_index,
                    1
                ] = landmark.y

                landmarks[
                    hand_index,
                    landmark_index,
                    2
                ] = landmark.z


    return (
        landmarks.flatten(),
        detected
    )


# ============================================================
# NORMALIZE SEQUENCE
# ============================================================

def normalize_sequence(sequence):

    sequence = np.asarray(
        sequence,
        dtype=np.float32
    )


    if sequence.shape != (
        MAX_FRAMES,
        FEATURES
    ):

        raise ValueError(
            f"Expected "
            f"({MAX_FRAMES}, {FEATURES}), "
            f"got {sequence.shape}"
        )


    normalized = (
        sequence - mean
    ) / std


    return normalized.astype(
        np.float32
    )


# ============================================================
# PREDICT
# ============================================================

def predict_sequence(sequence):

    if sequence is None:

        return None


    sequence = np.asarray(
        sequence,
        dtype=np.float32
    )


    if sequence.shape != (
        MAX_FRAMES,
        FEATURES
    ):

        raise ValueError(
            f"Invalid sequence shape: "
            f"{sequence.shape}"
        )


    normalized_sequence = (
        normalize_sequence(
            sequence
        )
    )


    input_data = np.expand_dims(
        normalized_sequence,
        axis=0
    )


    prediction = model.predict(
        input_data,
        verbose=0
    )[0]


    predicted_index = int(
        np.argmax(
            prediction
        )
    )


    predicted_label = label_mapping.get(
        predicted_index,
        "unknown"
    )


    confidence = float(
        prediction[
            predicted_index
        ]
    )


    confidence_percentage = (
        confidence * 100.0
    )


    top_indices = np.argsort(
        prediction
    )[-10:][::-1]


    top_predictions = []


    for index in top_indices:

        index = int(index)


        top_predictions.append(
            {
                "word":
                    label_mapping.get(
                        index,
                        "unknown"
                    ),

                "confidence":
                    round(
                        float(
                            prediction[index]
                        ),
                        4
                    ),

                "confidence_percent":
                    round(
                        float(
                            prediction[index]
                        ) * 100.0,
                        2
                    )
            }
        )


    reliable = (
        confidence_percentage
        >=
        MIN_CONFIDENCE_PERCENTAGE
    )


    return {

        "label":
            predicted_label,

        "index":
            predicted_index,

        "confidence":
            confidence,

        "confidence_percentage":
            confidence_percentage,

        "reliable":
            reliable,

        "top_predictions":
            top_predictions

    }


# ============================================================
# REAL-TIME WEBSOCKET
# ============================================================

@app.websocket("/ws/realtime")
async def realtime_websocket(
    websocket: WebSocket
):

    await websocket.accept()


    print()
    print(
        "=============================================="
    )
    print(
        "REAL-TIME WEBSOCKET CONNECTED"
    )
    print(
        "=============================================="
    )


    # --------------------------------------------------------
    # SLIDING LANDMARK BUFFER
    # --------------------------------------------------------

    frame_buffer = deque(
        maxlen=MAX_FRAMES
    )


    # True/False for every frame in the buffer.
    detection_buffer = deque(
        maxlen=MAX_FRAMES
    )


    # Recent model predictions.
    prediction_history = deque(
        maxlen=PREDICTION_HISTORY_SIZE
    )


    # --------------------------------------------------------
    # STATE
    # --------------------------------------------------------

    frames_since_prediction = 0

    sign_locked = False

    consecutive_no_hand_frames = 0

    last_emitted_label = ""

    total_received_frames = 0

    # --------------------------------------------------------
    # NEW SIGN TIMING STATE
    #
    # This counter is reset for every new sign.
    # Therefore every sign gets approximately 5 seconds
    # before the backend is allowed to make its first
    # prediction.
    # --------------------------------------------------------

    realtime_sign_frames = 0


    try:

        await websocket.send_json(
            {
                "type":
                    "status",

                "frames":
                    0,

                "required":
                    REALTIME_MINIMUM_FRAMES,

                "latest_prediction":
                    "",

                "isl_gloss":
                    "",

                "english_sentence":
                    "",

                "message":
                    "Waiting for camera frames."
            }
        )


        # ====================================================
        # RECEIVE
        # ====================================================

        while True:

            message = await websocket.receive()


            if (
                message.get("type")
                ==
                "websocket.disconnect"
            ):

                break


            frame = None


            # =================================================
            # TEXT
            # =================================================

            text_data = message.get(
                "text"
            )


            if text_data is not None:

                # ---------------------------------------------
                # RESET
                # ---------------------------------------------

                try:

                    command = json.loads(
                        text_data
                    )

                except Exception:

                    command = None


                if (
                    isinstance(
                        command,
                        dict
                    )
                    and
                    command.get("action")
                    ==
                    "reset"
                ):

                    frame_buffer.clear()

                    detection_buffer.clear()

                    prediction_history.clear()

                    frames_since_prediction = 0

                    sign_locked = False

                    consecutive_no_hand_frames = 0

                    last_emitted_label = ""

                    total_received_frames = 0

                    realtime_sign_frames = 0


                    await websocket.send_json(
                        {
                            "type":
                                "reset",

                            "frames":
                                0,

                            "required":
                                REALTIME_MINIMUM_FRAMES,

                            "message":
                                "Realtime recognition reset."
                        }
                    )


                    continue


                # ---------------------------------------------
                # BASE64 DATA URL
                # ---------------------------------------------

                if not text_data.startswith(
                    "data:image"
                ):

                    continue


                try:

                    if "," not in text_data:

                        continue


                    _, encoded = (
                        text_data.split(
                            ",",
                            1
                        )
                    )


                    image_bytes = (
                        base64.b64decode(
                            encoded
                        )
                    )


                    image_array = np.frombuffer(
                        image_bytes,
                        dtype=np.uint8
                    )


                    frame = cv2.imdecode(
                        image_array,
                        cv2.IMREAD_COLOR
                    )


                except Exception as e:

                    print(
                        "Image decoding error:",
                        str(e)
                    )

                    continue


            # =================================================
            # BINARY IMAGE
            # =================================================

            binary_data = message.get(
                "bytes"
            )


            if (
                frame is None
                and
                binary_data
            ):

                try:

                    image_array = np.frombuffer(
                        binary_data,
                        dtype=np.uint8
                    )


                    frame = cv2.imdecode(
                        image_array,
                        cv2.IMREAD_COLOR
                    )


                except Exception as e:

                    print(
                        "Binary image error:",
                        str(e)
                    )

                    continue


            # =================================================
            # INVALID FRAME
            # =================================================

            if frame is None:

                continue


            # =================================================
            # LANDMARK EXTRACTION
            # =================================================

            try:

                landmarks, detected = (
                    extract_landmarks(
                        frame
                    )
                )

            except Exception as e:

                print(
                    "Landmark error:",
                    str(e)
                )

                continue


            # =================================================
            # ADD NEW FRAME
            # =================================================

            frame_buffer.append(
                landmarks
            )

            detection_buffer.append(
                detected
            )


            total_received_frames += 1

            # Count frames for the current sign.
            realtime_sign_frames += 1


            if detected:

                consecutive_no_hand_frames = 0

            else:

                consecutive_no_hand_frames += 1


            # =================================================
            # RE-ARM AFTER HAND RELEASE
            # =================================================

            if (
                sign_locked
                and
                consecutive_no_hand_frames
                >=
                HAND_RELEASE_REQUIRED_FRAMES
            ):

                sign_locked = False

                prediction_history.clear()

                last_emitted_label = ""

                frames_since_prediction = 0

                # ---------------------------------------------
                # IMPORTANT:
                # Start a completely new 5-second recognition
                # window for the next sign.
                # ---------------------------------------------

                realtime_sign_frames = 0


                print(
                    "Hand released. "
                    "Ready for next sign."
                )


            # =================================================
            # DO NOT PREDICT BEFORE 5 SECONDS
            # =================================================

            current_frames = len(
                frame_buffer
            )


            if (
                realtime_sign_frames
                <
                REALTIME_MINIMUM_FRAMES
            ):

                if realtime_sign_frames % 5 == 0:

                    await websocket.send_json(
                        {
                            "type":
                                "status",

                            "frames":
                                realtime_sign_frames,

                            "required":
                                REALTIME_MINIMUM_FRAMES,

                            "latest_prediction":
                                "",

                            "isl_gloss":
                                "",

                            "english_sentence":
                                "",

                            "message":
                                (
                                    "Collecting sign for minimum "
                                    f"5 seconds... "
                                    f"{realtime_sign_frames}/"
                                    f"{REALTIME_MINIMUM_FRAMES}"
                                )
                        }
                    )


                continue


            # =================================================
            # MODEL STILL REQUIRES EXACTLY 60 FRAMES
            # =================================================

            if current_frames < MAX_FRAMES:

                continue


            # =================================================
            # SLIDING WINDOW
            # =================================================

            frames_since_prediction += 1


            # First prediction after 5 seconds.
            # After that, only every N frames.
            if (
                frames_since_prediction
                <
                REALTIME_PREDICTION_INTERVAL
            ):

                continue


            frames_since_prediction = 0


            # =================================================
            # HAND DETECTION PERCENTAGE
            # =================================================

            hand_count = sum(
                1
                for detected_value
                in detection_buffer
                if detected_value
            )


            detection_percentage = (
                hand_count
                /
                MAX_FRAMES
            ) * 100.0


            # =================================================
            # NO SIGN / NOT ENOUGH HAND DATA
            # =================================================

            if (
                hand_count
                <
                MIN_ACTIVE_HAND_FRAMES
                or
                detection_percentage
                <
                MIN_HAND_DETECTION_PERCENTAGE
            ):

                prediction_history.clear()


                if not sign_locked:

                    await websocket.send_json(
                        {
                            "type":
                                "status",

                            "frames":
                                realtime_sign_frames,

                            "required":
                                REALTIME_MINIMUM_FRAMES,

                            "latest_prediction":
                                "",

                            "isl_gloss":
                                "",

                            "english_sentence":
                                "",

                            "message":
                                "No reliable sign detected. Show your hand sign clearly."
                        }
                    )


                continue


            # =================================================
            # IF CURRENT SIGN ALREADY EMITTED
            # =================================================

            if sign_locked:

                # Do NOT run predictions continuously for the
                # same held sign.

                continue


            # =================================================
            # COPY CURRENT SLIDING WINDOW
            # =================================================

            sequence = np.asarray(
                frame_buffer,
                dtype=np.float32
            )


            if sequence.shape != (
                MAX_FRAMES,
                FEATURES
            ):

                continue


            # =================================================
            # MODEL PREDICTION
            # =================================================

            try:

                result = await asyncio.to_thread(
                    predict_sequence,
                    sequence
                )

            except Exception as e:

                print(
                    "Realtime prediction error:",
                    str(e)
                )

                await websocket.send_json(
                    {
                        "type":
                            "error",

                        "error":
                            str(e)
                    }
                )

                continue


            if result is None:

                continue


            predicted_label = (
                result["label"]
            )


            confidence_percentage = (
                result[
                    "confidence_percentage"
                ]
            )


            reliable = (
                result[
                    "reliable"
                ]
            )


            # =================================================
            # LOW CONFIDENCE
            # =================================================

            if not reliable:

                prediction_history.clear()


                await websocket.send_json(
                    {
                        "type":
                            "status",

                        "frames":
                            realtime_sign_frames,

                        "required":
                            REALTIME_MINIMUM_FRAMES,

                        "latest_prediction":
                            "",

                        "isl_gloss":
                            "",

                        "english_sentence":
                            "",

                        "message":
                            "Sign detected, waiting for a clearer prediction."
                    }
                )


                continue


            # =================================================
            # STABILIZATION
            # =================================================

            prediction_history.append(
                predicted_label
            )


            counts = Counter(
                prediction_history
            )


            stable_label = ""


            if counts:

                candidate, count = (
                    counts.most_common(1)[0]
                )


                if (
                    count
                    >=
                    STABLE_PREDICTION_COUNT
                ):

                    stable_label = candidate


            print(
                "Realtime candidate:",
                predicted_label,
                f"{confidence_percentage:.2f}%"
            )


            # =================================================
            # NOT STABLE YET
            # =================================================

            if not stable_label:

                await websocket.send_json(
                    {
                        "type":
                            "status",

                        "frames":
                            realtime_sign_frames,

                        "required":
                            REALTIME_MINIMUM_FRAMES,

                        "latest_prediction":
                            "",

                        "isl_gloss":
                            "",

                        "english_sentence":
                            "",

                        "message":
                            "Confirming sign..."
                    }
                )


                continue


            # =================================================
            # PREVENT DUPLICATE EMISSION
            # =================================================

            if (
                stable_label
                ==
                last_emitted_label
            ):

                sign_locked = True

                continue


            # =================================================
            # FINAL SIGN
            # =================================================

            last_emitted_label = (
                stable_label
            )

            sign_locked = True


            prediction_history.clear()


            print()
            print(
                "=============================================="
            )

            print(
                "STABLE SIGN:",
                stable_label
            )

            print(
                "Confidence:",
                f"{confidence_percentage:.2f}%"
            )

            print(
                "Recognition time:",
                f"{REALTIME_MINIMUM_SECONDS:.1f} seconds"
            )

            print(
                "=============================================="
            )


            # =================================================
            # SEND FINAL SIGN
            # =================================================

            await websocket.send_json(
                {
                    "type":
                        "prediction",

                    "latest_prediction":
                        stable_label,

                    "raw_prediction":
                        predicted_label,

                    "isl_gloss":
                        stable_label,

                    "english_sentence":
                        "",

                    "reliable":
                        True,

                    "stable":
                        True,

                    "frames_used":
                        MAX_FRAMES,

                    "frames_remaining":
                        0,

                    "hand_detection_percentage":
                        round(
                            detection_percentage,
                            2
                        ),

                    "message":
                        (
                            f"Detected: "
                            f"{stable_label}. "
                            "Release/change your sign for the next prediction."
                        )
                }
            )


    except WebSocketDisconnect:

        print(
            "Real-time WebSocket disconnected."
        )


    except Exception as e:

        print(
            "=============================================="
        )

        print(
            "REAL-TIME WEBSOCKET ERROR"
        )

        print(
            str(e)
        )

        print(
            "=============================================="
        )


        try:

            await websocket.send_json(
                {
                    "type":
                        "error",

                    "error":
                        str(e)
                }
            )

        except Exception:

            pass


    finally:

        frame_buffer.clear()

        detection_buffer.clear()

        prediction_history.clear()

        print(
            "Realtime buffers cleared."
        )


# ============================================================
# VIDEO PREDICTION
# ============================================================

def extract_video_sequence(
    video_path
):

    cap = cv2.VideoCapture(
        video_path
    )


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


        landmarks, detected = (
            extract_landmarks(
                frame
            )
        )


        if detected:

            detected_frames += 1


        frames.append(
            landmarks
        )


    cap.release()


    if len(frames) == 0:

        return None, total_frames, detected_frames


    frames = np.asarray(
        frames,
        dtype=np.float32
    )


    # ========================================================
    # EXACTLY 60 FRAMES
    # ========================================================

    if len(frames) >= MAX_FRAMES:

        indexes = np.linspace(
            0,
            len(frames) - 1,
            MAX_FRAMES
        ).astype(int)


        frames = frames[
            indexes
        ]

    else:

        padding = np.zeros(
            (
                MAX_FRAMES - len(frames),
                FEATURES
            ),
            dtype=np.float32
        )


        frames = np.vstack(
            [
                frames,
                padding
            ]
        )


    return (
        frames,
        total_frames,
        detected_frames
    )


@app.post("/predict-video")
async def predict_video(
    file: UploadFile = File(...)
):

    temp_path = None


    try:

        contents = await file.read()


        if not contents:

            return {
                "success":
                    False,

                "error":
                    "Empty video received"
            }


        suffix = ".mp4"


        if file.filename:

            filename = (
                file.filename.lower()
            )


            if filename.endswith(
                ".webm"
            ):

                suffix = ".webm"

            elif filename.endswith(
                ".avi"
            ):

                suffix = ".avi"

            elif filename.endswith(
                ".mov"
            ):

                suffix = ".mov"


        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:

            temp_file.write(
                contents
            )

            temp_path = (
                temp_file.name
            )


        (
            sequence,
            total_frames,
            detected_frames
        ) = extract_video_sequence(
            temp_path
        )


        if sequence is None:

            return {
                "success":
                    False,

                "error":
                    "Could not read video frames"
            }


        detection_percentage = (
            (
                detected_frames
                /
                total_frames
            )
            *
            100.0
            if total_frames > 0
            else 0.0
        )


        if (
            detection_percentage
            <
            MIN_HAND_DETECTION_PERCENTAGE
        ):

            return {

                "success":
                    False,

                "reliable":
                    False,

                "error":
                    "Insufficient hand detection.",

                "reason":
                    "low_hand_detection",

                "video_info":
                    {
                        "filename":
                            file.filename,

                        "total_frames":
                            total_frames,

                        "frames_with_hand_detected":
                            detected_frames,

                        "hand_detection_percentage":
                            round(
                                detection_percentage,
                                2
                            )
                    }
            }


        result = predict_sequence(
            sequence
        )


        if result is None:

            return {

                "success":
                    False,

                "error":
                    "Prediction failed."
            }


        return {

            "success":
                True,

            "reliable":
                result["reliable"],

            "word":
                result["label"],

            "confidence":
                round(
                    result["confidence"],
                    4
                ),

            "confidence_percent":
                round(
                    result[
                        "confidence_percentage"
                    ],
                    2
                ),

            "class_index":
                result["index"],

            "warning":
                None
                if result["reliable"]
                else
                "Low prediction confidence.",

            "top_predictions":
                result["top_predictions"],

            "video_info":
                {
                    "filename":
                        file.filename,

                    "total_frames":
                        total_frames,

                    "frames_with_hand_detected":
                        detected_frames,

                    "frames_without_hand":
                        (
                            total_frames
                            -
                            detected_frames
                        ),

                    "hand_detection_percentage":
                        round(
                            detection_percentage,
                            2
                        ),

                    "final_sequence_shape":
                        [
                            MAX_FRAMES,
                            FEATURES
                        ],

                    "model_input_shape":
                        [
                            1,
                            MAX_FRAMES,
                            FEATURES
                        ]
                }
        }


    except Exception as e:

        print(
            "VIDEO PREDICTION ERROR:",
            str(e)
        )


        return {

            "success":
                False,

            "reliable":
                False,

            "error":
                str(e)
        }


    finally:

        if (
            temp_path is not None
            and
            os.path.exists(
                temp_path
            )
        ):

            try:

                os.remove(
                    temp_path
                )

            except Exception:

                pass


# ============================================================
# CONVERT
# ============================================================

@app.post("/convert")
async def convert_to_english(
    request: ConvertRequest
):

    try:

        gloss = request.gloss.strip()


        if not gloss:

            return {

                "success":
                    False,

                "english":
                    "",

                "english_sentence":
                    "",

                "error":
                    "Gloss is empty"
            }


        english_sentence = (
            convert_gloss_to_english(
                gloss
            )
        )


        history_saved = save_history(
            gloss,
            english_sentence
        )


        return {

            "success":
                True,

            "gloss":
                gloss,

            "english":
                english_sentence,

            "english_sentence":
                english_sentence,

            "history_saved":
                history_saved
        }


    except Exception as e:

        print(
            "ENGLISH CONVERSION ERROR:",
            str(e)
        )


        return {

            "success":
                False,

            "english":
                "",

            "english_sentence":
                "",

            "error":
                str(e)
        }


# ============================================================
# SPEAK
# ============================================================

@app.post("/speak")
async def speak_text(
    request: SpeakRequest
):

    try:

        text = request.text.strip()


        if not text:

            return {

                "success":
                    False,

                "error":
                    "Text is empty"
            }


        return {

            "success":
                True,

            "text":
                text,

            "message":
                "Speech request received."
        }


    except Exception as e:

        return {

            "success":
                False,

            "error":
                str(e)
        }


# ============================================================
# OLD IMAGE ENDPOINT
# ============================================================

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):

    return {

        "success":
            False,

        "error":
            (
                "This BiLSTM model requires a video. "
                "Use /predict-video."
            )
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def root():

    return {

        "message":
            "SAANKET BiLSTM backend is running",

        "model":
            "saanket_bilstm.keras",

        "classes":
            len(label_mapping),

        "input_shape":
            "(60, 126)",

        "normalization":
            "enabled",

        "realtime":
            "enabled",

        "realtime_buffer":
            "sliding",

        "realtime_minimum_frames":
            REALTIME_MINIMUM_FRAMES,

        "realtime_minimum_seconds":
            REALTIME_MINIMUM_SECONDS,

        "model_input_frames":
            REALTIME_MIN_FRAMES,

        "frame_reuse":
            "controlled_sliding_window",

        "minimum_hand_detection_percentage":
            MIN_HAND_DETECTION_PERCENTAGE,

        "minimum_confidence_percentage":
            MIN_CONFIDENCE_PERCENTAGE,

        "prediction_interval":
            REALTIME_PREDICTION_INTERVAL,

        "prediction_endpoint":
            "/predict-video",

        "realtime_endpoint":
            "/ws/realtime",

        "conversion_endpoint":
            "/convert",

        "history_endpoint":
            "/history",

        "speech_endpoint":
            "/speak"
    }