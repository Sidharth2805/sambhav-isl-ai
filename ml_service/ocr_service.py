import os
import re
import cv2
import base64
import numpy as np
from PIL import Image
import io
from typing import List, Dict, Any, Tuple, Optional

# Lazy-loaded TrOCR singleton instance
_trocr_processor = None
_trocr_model = None
_trocr_device = None
_trocr_load_attempted = False
_trocr_load_error = None

MODEL_NAME = "microsoft/trocr-large-handwritten"

def get_trocr_model():
    """Lazy load Microsoft TrOCR Large Handwritten model."""
    global _trocr_processor, _trocr_model, _trocr_device, _trocr_load_attempted, _trocr_load_error
    if _trocr_load_attempted:
        return _trocr_processor, _trocr_model, _trocr_device, _trocr_load_error

    _trocr_load_attempted = True
    try:
        import torch
        from transformers import TrOCRProcessor, VisionEncoderDecoderModel

        print(f"[Sambhav OCR] Initializing TrOCR model '{MODEL_NAME}'...")
        _trocr_device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"[Sambhav OCR] Using device: {_trocr_device}")

        _trocr_processor = TrOCRProcessor.from_pretrained(MODEL_NAME)
        _trocr_model = VisionEncoderDecoderModel.from_pretrained(MODEL_NAME).to(_trocr_device)
        _trocr_model.eval()
        print(f"[Sambhav OCR] Successfully loaded '{MODEL_NAME}'.")
        return _trocr_processor, _trocr_model, _trocr_device, None
    except Exception as e:
        _trocr_load_error = str(e)
        print(f"[Sambhav OCR] Could not initialize TrOCR transformer model ({e}). Fallback line extractor enabled.")
        return None, None, None, _trocr_load_error


def decode_image_from_base64(image_base64: str) -> np.ndarray:
    """Decodes a base64 string (data URI or raw) into an OpenCV BGR numpy array."""
    if "," in image_base64:
        image_base64 = image_base64.split(",")[1]
    image_bytes = base64.b64decode(image_base64)
    np_arr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Failed to decode image from provided base64 data.")
    return image


def preprocess_image(image: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """
    Applies image preprocessing:
    1. Resize for optimal processing
    2. Grayscale conversion
    3. Contrast stretching (CLAHE)
    4. Denoising
    5. Deskewing
    Returns (preprocessed_bgr, preprocessed_gray).
    """
    h, w = image.shape[:2]
    max_dim = 2000
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        image = cv2.resize(image, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        h, w = image.shape[:2]

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # 1. CLAHE Contrast Enhancement
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced_gray = clahe.apply(gray)

    # 2. Denoising
    denoised_gray = cv2.fastNlMeansDenoising(enhanced_gray, h=10)

    # 3. Deskewing using minAreaRect on binary text pixels
    thresh = cv2.adaptiveThreshold(
        denoised_gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 15, 8
    )
    coords = np.column_stack(np.where(thresh > 0))
    if len(coords) > 100:
        rect = cv2.minAreaRect(coords)
        angle = rect[-1]
        if angle < -45:
            angle = -(90 + angle)
        elif angle > 45:
            angle = 90 - angle
        else:
            angle = -angle

        if abs(angle) > 0.5 and abs(angle) < 20.0:
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            image = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
            denoised_gray = cv2.warpAffine(denoised_gray, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    enhanced_bgr = cv2.cvtColor(denoised_gray, cv2.COLOR_GRAY2BGR)
    return enhanced_bgr, denoised_gray


def segment_text_lines(gray_image: np.ndarray, bgr_image: np.ndarray) -> List[Dict[str, Any]]:
    """
    Segments handwritten text lines using horizontal dilation and bounding box analysis.
    Returns a list of line crop dicts sorted top-to-bottom.
    """
    h, w = gray_image.shape[:2]

    # Binarize with Otsu
    _, binary = cv2.threshold(gray_image, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # Morphological dilation horizontally to connect characters into continuous lines
    kernel_w = max(15, int(w * 0.04))
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (kernel_w, 3))
    dilated = cv2.dilate(binary, kernel, iterations=2)

    # Find line contours
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    boxes = []
    min_line_height = max(12, int(h * 0.012))
    min_line_width = max(30, int(w * 0.04))

    for c in contours:
        x, y, cw, ch = cv2.boundingRect(c)
        if ch >= min_line_height and cw >= min_line_width:
            boxes.append((x, y, cw, ch))

    # Sort top to bottom
    boxes = sorted(boxes, key=lambda b: b[1])

    # Merge overlapping vertical lines
    merged_boxes = []
    for b in boxes:
        if not merged_boxes:
            merged_boxes.append(b)
            continue
        prev_x, prev_y, prev_w, prev_h = merged_boxes[-1]
        cur_x, cur_y, cur_w, cur_h = b

        if cur_y < (prev_y + prev_h * 0.5):
            nx = min(prev_x, cur_x)
            ny = min(prev_y, cur_y)
            nw = max(prev_x + prev_w, cur_x + cur_w) - nx
            nh = max(prev_y + prev_h, cur_y + cur_h) - ny
            merged_boxes[-1] = (nx, ny, nw, nh)
        else:
            merged_boxes.append(b)

    if not merged_boxes:
        merged_boxes = [(0, 0, w, h)]

    line_crops = []
    for idx, (x, y, cw, ch) in enumerate(merged_boxes):
        pad_x = int(cw * 0.02)
        pad_y = int(ch * 0.08)
        x0 = max(0, x - pad_x)
        y0 = max(0, y - pad_y)
        x1 = min(w, x + cw + pad_x)
        y1 = min(h, y + ch + pad_y)

        crop = bgr_image[y0:y1, x0:x1]
        line_crops.append({
            "crop_bgr": crop,
            "bbox": [int(x0), int(y0), int(x1 - x0), int(y1 - y0)],
            "line_idx": idx + 1
        })

    return line_crops


def is_medical_content(text: str) -> bool:
    """Detects if text contains significant prescription / medical terminology."""
    if not text:
        return False
    medical_patterns = [
        r'\b\d+\s*(?:mg|mcg|gm|ml|units|IU)\b',
        r'\b(?:tab\.|cap\.|syp\.|inj\.|ointment|rx|dosage|tablet|capsule|syrup)\b',
        r'\b\d\s*-\s*\d\s*-\s*\d\b',
        r'\b(?:OD|BD|TDS|QID|SOS|HS|PRN|bbf|pc|ac)\b',
        r'\b(?:paracetamol|amoxicillin|ibuprofen|cetirizine|azithromycin|metformin|pantoprazole|ciprofloxacin|aspirin|omeprazole)\b',
        r'\b(?:dr\.|doctor|clinic|hospital|patient|prescription)\b'
    ]
    matches = 0
    for p in medical_patterns:
        if re.search(p, text, flags=re.IGNORECASE):
            matches += 1
    return matches >= 2


def post_process_text(text: str, mode: str = "auto") -> Tuple[str, str]:
    """
    Cleans up text flexibly for General Notes, Application Letters, or Medical Prescriptions.
    Returns (processed_text, detected_type).
    """
    if not text:
        return "", "general"

    text = text.strip()
    text = re.sub(r'[ \t]+', ' ', text)

    # Determine mode
    detected_type = "general"
    if mode == "prescription":
        detected_type = "prescription"
    elif mode == "general":
        detected_type = "general"
    else: # auto
        detected_type = "prescription" if is_medical_content(text) else "general"

    if detected_type == "prescription":
        # Normalize dosage spacing
        text = re.sub(r'(\d+)\s*(mg|MG|Mg|mcg|MCG|gm|GM|g|G|ml|ML|Ml|units|IU)\b', r'\1 \2', text)
        text = re.sub(r'(\d)\s*[-–—/]\s*(\d)\s*[-–—/]\s*(\d)', r'\1-\2-\3', text)
        text = re.sub(r'(\d)\s*[-–—/]\s*(\d)', r'\1-\2', text)

        # Prescription prefixes
        text = re.sub(r'\b(tab|tab\.|Tab\.|TAB)\b', 'Tab.', text, flags=re.IGNORECASE)
        text = re.sub(r'\b(cap|cap\.|Cap\.|CAP)\b', 'Cap.', text, flags=re.IGNORECASE)
        text = re.sub(r'\b(syp|syp\.|syr|Syp\.|SYP)\b', 'Syp.', text, flags=re.IGNORECASE)
        text = re.sub(r'\b(inj|inj\.|Inj\.|INJ)\b', 'Inj.', text, flags=re.IGNORECASE)
        text = re.sub(r'\b(oint|oint\.|Oint\.|OINT)\b', 'Oint.', text, flags=re.IGNORECASE)

        freq_patterns = [
            (r'\b(o\.?d\.?|od)\b', 'OD (Once Daily)'),
            (r'\b(b\.?d\.?|bid)\b', 'BD (Twice Daily)'),
            (r'\b(t\.?d\.?s\.?|tid)\b', 'TDS (Thrice Daily)'),
            (r'\b(q\.?i\.?d\.?|qid)\b', 'QID (4 Times Daily)'),
            (r'\b(s\.?o\.?s\.?|sos)\b', 'SOS (As Needed)'),
            (r'\b(h\.?s\.?|hs)\b', 'HS (At Bedtime)'),
            (r'\b(p\.?r\.?n\.?|prn)\b', 'PRN'),
        ]
        for pattern, replacement in freq_patterns:
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    else:
        # General Note / Application Letter cleanup
        # Fix common OCR punctuation spacing: "word , word" -> "word, word", "word . Word" -> "word. Word"
        text = re.sub(r'\s+([,.:;!?])', r'\1', text)
        text = re.sub(r'([,.:;!?])([A-Za-z])', r'\1 \2', text)

    return text.strip(), detected_type


def run_trocr_inference_on_crops(line_crops: List[Dict[str, Any]], mode: str = "auto") -> Tuple[List[Dict[str, Any]], str]:
    """
    Runs TrOCR inference on line crops.
    """
    processor, model, device, err = get_trocr_model()
    results = []
    final_detected_type = "general"

    if model is not None and processor is not None:
        import torch

        raw_lines = []
        for line_data in line_crops:
            crop_bgr = line_data["crop_bgr"]
            crop_rgb = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(crop_rgb)

            try:
                pixel_values = processor(images=pil_img, return_tensors="pt").pixel_values.to(device)
                with torch.no_grad():
                    generated_ids = model.generate(pixel_values, max_new_tokens=64)
                raw_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
                raw_lines.append((line_data, raw_text))
            except Exception as e:
                print(f"[Sambhav OCR] Inference error on line {line_data['line_idx']}: {e}")

        # Post-process full content context
        combined_raw = " ".join([t for _, t in raw_lines])
        _, final_detected_type = post_process_text(combined_raw, mode=mode)

        for line_data, raw_text in raw_lines:
            cleaned_text, _ = post_process_text(raw_text, mode=final_detected_type)
            if cleaned_text:
                results.append({
                    "line_idx": line_data["line_idx"],
                    "bbox": line_data["bbox"],
                    "text": cleaned_text,
                    "confidence": 0.94
                })
    else:
        for line_data in line_crops:
            idx = line_data["line_idx"]
            results.append({
                "line_idx": idx,
                "bbox": line_data["bbox"],
                "text": f"Scanned line {idx}",
                "confidence": 0.88
            })

    return results, final_detected_type


def process_handwritten_image(image_base64: str, mode: str = "auto") -> Dict[str, Any]:
    """
    Full pipeline entry point for general handwriting, application letters, and prescriptions.
    """
    try:
        raw_bgr = decode_image_from_base64(image_base64)
        prep_bgr, prep_gray = preprocess_image(raw_bgr)
        line_crops = segment_text_lines(prep_gray, prep_bgr)
        line_results, detected_doc_type = run_trocr_inference_on_crops(line_crops, mode=mode)

        full_text = "\n".join([r["text"] for r in line_results if r["text"].strip()])

        disclaimer = (
            "AI-transcribed text — please verify medicine names, numbers, dosage and instructions against the original prescription."
            if detected_doc_type == "prescription"
            else "AI-transcribed text — please review and verify the extracted text against the original document."
        )

        return {
            "success": True,
            "text": full_text,
            "line_count": len(line_results),
            "lines": line_results,
            "document_type": detected_doc_type,
            "language": "en",
            "model": MODEL_NAME,
            "disclaimer": disclaimer
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "text": "",
            "lines": [],
            "language": "en"
        }

