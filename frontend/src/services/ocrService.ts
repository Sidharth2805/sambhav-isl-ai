/**
 * Sambhav OCR Service
 * Integrates with Microsoft TrOCR Large Handwritten backend on http://127.0.0.1:8000
 * With robust Client-Side Tesseract.js real-image OCR and adaptive mode formatting
 * for both General Notes / Application Letters and Medical Prescriptions.
 *
 * Enhanced preprocessing pipeline (v2):
 *   • Canvas-based greyscale conversion (luminance-weighted)
 *   • Linear contrast stretching (histogram normalisation)
 *   • Unsharp mask sharpening (radius 1, amount 1.8) — critical for cursive strokes
 *   • Adaptive local thresholding (binarisation) with luminance-aware bias
 *   • Multi-pass Tesseract: PSM 6 → PSM 4 → PSM 3 (original image) based on confidence
 *   • Real per-line confidence averaged from Tesseract word-level data
 */

import Tesseract from 'tesseract.js';

export type OCRScanMode = 'auto' | 'general' | 'prescription';

export interface OCRLine {
  line_idx: number;
  bbox: [number, number, number, number];
  text: string;
  confidence: number;
}

export interface OCRScanResult {
  success: boolean;
  text: string;
  line_count: number;
  lines: OCRLine[];
  document_type: 'general' | 'prescription';
  language: string;
  model?: string;
  disclaimer?: string;
  error?: string;
}

const OCR_BACKEND_URLS = [
  'http://127.0.0.1:8000/api/ocr/handwriting',
  'http://localhost:8000/api/ocr/handwriting',
];

// ---------------------------------------------------------------------------
// TEXT DETECTION & FORMATTING
// ---------------------------------------------------------------------------

/**
 * Detects whether the text is a medical prescription or a general letter / application.
 */
export function isPrescriptionContent(text: string): boolean {
  if (!text) return false;
  const medicalPatterns = [
    /\b\d+\s*(?:mg|mcg|gm|ml|units|IU)\b/i,
    /\b(?:tab\.|cap\.|syp\.|inj\.|ointment|rx|dosage|tablet|capsule|syrup)\b/i,
    /\b\d\s*-\s*\d\s*-\s*\d\b/,
    /\b(?:OD|BD|TDS|QID|SOS|HS|PRN|bbf|pc|ac)\b/i,
    /\b(?:paracetamol|amoxicillin|ibuprofen|cetirizine|azithromycin|metformin|pantoprazole|ciprofloxacin|aspirin|omeprazole)\b/i,
    /\b(?:dr\.|doctor|clinic|hospital|patient|prescription)\b/i,
  ];

  let matches = 0;
  for (const pattern of medicalPatterns) {
    if (pattern.test(text)) matches++;
  }
  return matches >= 2;
}

/**
 * Flexible text formatting for General Notes / Applications or Prescriptions.
 */
export function formatExtractedText(
  rawText: string,
  mode: OCRScanMode | 'general' | 'prescription' = 'auto'
): { formatted: string; detectedType: 'general' | 'prescription' } {
  if (!rawText) return { formatted: '', detectedType: 'general' };

  let text = rawText.trim().replace(/[ \t]+/g, ' ');

  const detectedType: 'general' | 'prescription' =
    mode === 'prescription'
      ? 'prescription'
      : mode === 'general'
      ? 'general'
      : isPrescriptionContent(text)
      ? 'prescription'
      : 'general';

  if (detectedType === 'prescription') {
    // Fix dosage spacing
    text = text.replace(/(\d+)\s*(mg|MG|Mg|mcg|MCG|gm|GM|g|G|ml|ML|Ml|units|IU)\b/g, '$1 $2');
    text = text.replace(/(\d)\s*[-\u2013\u2014/]\s*(\d)\s*[-\u2013\u2014/]\s*(\d)/g, '$1-$2-$3');
    text = text.replace(/(\d)\s*[-\u2013\u2014/]\s*(\d)/g, '$1-$2');

    // Prescription terms
    text = text.replace(/\b(tab|tab\.|Tab\.|TAB)\b/gi, 'Tab.');
    text = text.replace(/\b(cap|cap\.|Cap\.|CAP)\b/gi, 'Cap.');
    text = text.replace(/\b(syp|syp\.|syr|Syp\.|SYP)\b/gi, 'Syp.');
    text = text.replace(/\b(inj|inj\.|Inj\.|INJ)\b/gi, 'Inj.');
    text = text.replace(/\b(oint|oint\.|Oint\.|OINT)\b/gi, 'Oint.');

    // Timing abbreviations
    text = text.replace(/\b(o\.?d\.?|od)\b/gi, 'OD (Once Daily)');
    text = text.replace(/\b(b\.?d\.?|bid)\b/gi, 'BD (Twice Daily)');
    text = text.replace(/\b(t\.?d\.?s\.?|tid)\b/gi, 'TDS (Thrice Daily)');
    text = text.replace(/\b(q\.?i\.?d\.?|qid)\b/gi, 'QID (4 Times Daily)');
    text = text.replace(/\b(s\.?o\.?s\.?|sos)\b/gi, 'SOS (As Needed)');
    text = text.replace(/\b(h\.?s\.?|hs)\b/gi, 'HS (At Bedtime)');
  } else {
    // General Note / Application cleanup
    text = text.replace(/\s+([,.:;!?])/g, '$1');
    text = text.replace(/([,.:;!?])([A-Za-z])/g, '$1 $2');
  }

  return { formatted: text.trim(), detectedType };
}

// ---------------------------------------------------------------------------
// IMAGE PREPROCESSING PIPELINE
// ---------------------------------------------------------------------------

/**
 * Loads a src image into an off-screen canvas.
 * Downscales to max 2400px on longest side to prevent OOM while keeping detail.
 */
function loadImageToCanvas(
  src: string
): Promise<{ canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const MAX = 2400;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > MAX || h > MAX) {
        const ratio = Math.min(MAX / w, MAX / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve({ canvas, ctx, w, h });
    };
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Separable box blur on a greyscale flat Uint8ClampedArray.
 * Used for both unsharp masking and computing local mean for adaptive thresholding.
 */
function boxBlurGrey(
  src: Uint8ClampedArray,
  w: number,
  h: number,
  radius: number
): Uint8ClampedArray {
  const r2 = radius * 2 + 1;
  const tmp = new Uint8ClampedArray(src.length);
  const dst = new Uint8ClampedArray(src.length);

  // Horizontal pass
  for (let y = 0; y < h; y++) {
    let sum = 0;
    for (let x = -radius; x <= radius; x++) {
      sum += src[y * w + Math.max(0, Math.min(w - 1, x))];
    }
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = sum / r2;
      sum +=
        src[y * w + Math.min(w - 1, x + radius + 1)] -
        src[y * w + Math.max(0, x - radius)];
    }
  }

  // Vertical pass
  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let y = -radius; y <= radius; y++) {
      sum += tmp[Math.max(0, Math.min(h - 1, y)) * w + x];
    }
    for (let y = 0; y < h; y++) {
      dst[y * w + x] = sum / r2;
      sum +=
        tmp[Math.min(h - 1, y + radius + 1) * w + x] -
        tmp[Math.max(0, y - radius) * w + x];
    }
  }
  return dst;
}

/**
 * Full preprocessing pipeline for handwriting OCR.
 *
 * Steps:
 *  1. Greyscale (luminance-weighted)
 *  2. Linear contrast stretch (min-max normalisation)
 *  3. Unsharp mask sharpening (radius=1, amount=1.8)
 *  4. Adaptive local thresholding — binarises the image for Tesseract
 *
 * Returns a PNG data-URL of the enhanced binary image.
 */
async function preprocessImageForOCR(src: string): Promise<string> {
  try {
    const { ctx, w, h } = await loadImageToCanvas(src);
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const n = w * h;

    // Step 1 — Greyscale
    const grey = new Uint8ClampedArray(n);
    for (let i = 0; i < n; i++) {
      grey[i] = Math.round(
        0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]
      );
    }

    // Step 2 — Linear contrast stretch
    let lo = 255;
    let hi = 0;
    for (let i = 0; i < n; i++) {
      if (grey[i] < lo) lo = grey[i];
      if (grey[i] > hi) hi = grey[i];
    }
    const range = hi - lo || 1;
    const stretched = new Uint8ClampedArray(n);
    for (let i = 0; i < n; i++) {
      stretched[i] = Math.round(((grey[i] - lo) / range) * 255);
    }

    // Step 3 — Unsharp mask sharpening
    const blurred1 = boxBlurGrey(stretched, w, h, 1);
    const sharpened = new Uint8ClampedArray(n);
    const SHARP_AMOUNT = 1.8;
    for (let i = 0; i < n; i++) {
      sharpened[i] = Math.max(
        0,
        Math.min(255, Math.round(stretched[i] + SHARP_AMOUNT * (stretched[i] - blurred1[i])))
      );
    }

    // Step 4 — Adaptive local thresholding
    let sumL = 0;
    for (let i = 0; i < n; i++) sumL += sharpened[i];
    const meanL = sumL / n;

    const blurRadius = Math.max(5, Math.round(Math.min(w, h) / 20));
    const localMean = boxBlurGrey(sharpened, w, h, blurRadius);
    // Lighter documents → more aggressive bias to separate ink from paper
    const BIAS = meanL > 150 ? -8 : 10;

    const binary = new Uint8ClampedArray(n);
    for (let i = 0; i < n; i++) {
      binary[i] = sharpened[i] < localMean[i] + BIAS ? 0 : 255; // 0 = ink, 255 = paper
    }

    // Write binary RGBA
    const outData = new Uint8ClampedArray(n * 4);
    for (let i = 0; i < n; i++) {
      outData[i * 4] = binary[i];
      outData[i * 4 + 1] = binary[i];
      outData[i * 4 + 2] = binary[i];
      outData[i * 4 + 3] = 255;
    }

    const outCanvas = document.createElement('canvas');
    outCanvas.width = w;
    outCanvas.height = h;
    const outCtx = outCanvas.getContext('2d')!;
    outCtx.putImageData(new ImageData(outData, w, h), 0, 0);

    return outCanvas.toDataURL('image/png');
  } catch (e) {
    console.warn('[Sambhav OCR] Image preprocessing failed — using original image.', e);
    return src;
  }
}

// ---------------------------------------------------------------------------
// TESSERACT HELPERS
// ---------------------------------------------------------------------------

interface TesseractRunResult {
  text: string;
  confidence: number;
  lines: Tesseract.Line[];
}

/**
 * Extract all Tesseract.Line objects from the nested blocks → paragraphs → lines structure.
 * The Tesseract.js Page type does not expose a top-level `lines` array; lines live inside
 * Block.paragraphs[].lines[].
 */
function extractLinesFromPage(data: Tesseract.Page): Tesseract.Line[] {
  const lines: Tesseract.Line[] = [];
  if (!data.blocks) return lines;
  for (const block of data.blocks) {
    for (const para of block.paragraphs) {
      for (const line of para.lines) {
        lines.push(line);
      }
    }
  }
  return lines;
}

/**
 * Run Tesseract.js with a specific PSM mode and LSTM engine.
 *
 * PSM modes:
 *  6 = Assume a single uniform block of text  → best for dense handwritten notes
 *  4 = Assume single column of variable-size text → handwriting with varied line heights
 *  3 = Fully automatic page segmentation (fallback)
 */
async function runTesseract(imageSrc: string, psm: number): Promise<TesseractRunResult> {
  const result = await Tesseract.recognize(imageSrc, 'eng', {
    logger: () => {}, // suppress per-iteration console noise
    // @ts-ignore — Tesseract.js passes raw config strings to the WASM engine
    tessedit_pageseg_mode: psm,
    // OEM 1 = LSTM neural net only — best accuracy for handwriting
    // @ts-ignore
    tessedit_ocr_engine_mode: 1,
    // Preserve inter-word spacing so words don't merge
    // @ts-ignore
    preserve_interword_spaces: '1',
  });

  return {
    text: result.data.text || '',
    confidence: result.data.confidence || 0,
    lines: extractLinesFromPage(result.data),
  };
}

/**
 * Build OCRLine objects with real per-line confidence
 * averaged from Tesseract word-level confidence data.
 */
function buildOCRLines(tessLines: Tesseract.Line[]): OCRLine[] {
  const ocrLines: OCRLine[] = [];
  tessLines.forEach((line, idx) => {
    const text = (line.text || '').trim();
    if (!text) return;

    const words = line.words || [];
    const wordConfs = words.map((w) => (w.confidence ?? 0) / 100);
    const lineConf =
      wordConfs.length > 0
        ? wordConfs.reduce((a, b) => a + b, 0) / wordConfs.length
        : 0.75;

    const bbox = line.bbox;
    ocrLines.push({
      line_idx: idx + 1,
      bbox: bbox ? [bbox.x0, bbox.y0, bbox.x1, bbox.y1] : [0, idx * 30, 400, 25],
      text,
      confidence: Math.round(lineConf * 100) / 100,
    });
  });
  return ocrLines;
}

// ---------------------------------------------------------------------------
// MAIN ENTRY POINT
// ---------------------------------------------------------------------------

export async function scanHandwrittenImage(
  imageBase64: string,
  language: string = 'en',
  mode: OCRScanMode = 'auto'
): Promise<OCRScanResult> {
  // 1. Try connecting to Python FastAPI TrOCR Large backend first
  for (const url of OCR_BACKEND_URLS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: imageBase64, language, mode }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.success && data.text) {
          const docType =
            data.document_type ||
            (isPrescriptionContent(data.text) ? 'prescription' : 'general');
          return {
            success: true,
            text: data.text,
            line_count: data.line_count || (data.lines ? data.lines.length : 0),
            lines: data.lines || [],
            document_type: docType,
            language: data.language || language,
            model: data.model || 'microsoft/trocr-large-handwritten',
            disclaimer:
              data.disclaimer ||
              (docType === 'prescription'
                ? 'AI-transcribed text — please verify medicine names, numbers, dosage and instructions against the original prescription.'
                : 'AI-transcribed text — please review and verify the extracted text against the original document.'),
          };
        }
      }
    } catch (err) {
      console.warn(
        `[Sambhav OCR] Backend ${url} unreachable — falling back to client-side OCR.`,
        err
      );
    }
  }

  // 2. Client-Side Tesseract.js with enhanced preprocessing + multi-pass OCR
  try {
    console.info('[Sambhav OCR] Preprocessing image for handwriting enhancement...');
    const enhancedSrc = await preprocessImageForOCR(imageBase64);

    // Pass 1 — PSM 6: best for dense uniform handwritten blocks
    console.info('[Sambhav OCR] Pass 1 — PSM 6 (uniform block)...');
    const pass1 = await runTesseract(enhancedSrc, 6);
    let finalResult = pass1;

    // Pass 2 — PSM 4: single column, variable character sizes
    if (pass1.confidence < 55) {
      console.info(
        `[Sambhav OCR] Low confidence (${pass1.confidence.toFixed(1)}%), trying PSM 4 (single column)...`
      );
      const pass2 = await runTesseract(enhancedSrc, 4);
      if (pass2.confidence > finalResult.confidence) {
        finalResult = pass2;
        console.info(`[Sambhav OCR] PSM 4 improved → ${pass2.confidence.toFixed(1)}%`);
      }
    }

    // Pass 3 — fallback to unprocessed original image with PSM 3
    if (finalResult.confidence < 40) {
      console.info(
        `[Sambhav OCR] Still low (${finalResult.confidence.toFixed(1)}%), trying original + PSM 3...`
      );
      const pass3 = await runTesseract(imageBase64, 3);
      if (pass3.confidence > finalResult.confidence) {
        finalResult = pass3;
        console.info(`[Sambhav OCR] Original + PSM 3 → ${pass3.confidence.toFixed(1)}%`);
      }
    }

    const rawLines = finalResult.text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    const fullRaw = rawLines.join('\n');

    if (!fullRaw.trim()) {
      return {
        success: false,
        text: '',
        line_count: 0,
        lines: [],
        document_type: 'general',
        language,
        error:
          'No legible text detected. Please ensure the note is well-lit, in focus, and held flat.',
      };
    }

    // Determine document type from detected content
    const { detectedType } = formatExtractedText(fullRaw, mode);

    // Build per-line results with real word-level confidence
    const ocrLines = buildOCRLines(finalResult.lines).filter((l) => l.text.length > 0);
    const formattedLines: OCRLine[] = ocrLines.map((l) => {
      const { formatted } = formatExtractedText(l.text, detectedType);
      return { ...l, text: formatted };
    });

    // Format the complete extracted text
    const { formatted: formattedFullText } = formatExtractedText(fullRaw, detectedType);

    return {
      success: true,
      text: formattedFullText,
      line_count: formattedLines.length,
      lines: formattedLines,
      document_type: detectedType,
      language,
      model: 'Tesseract.js LSTM (Enhanced Preprocessing)',
      disclaimer:
        detectedType === 'prescription'
          ? 'AI-transcribed text — please verify medicine names, numbers, dosage and instructions against the original prescription.'
          : 'AI-transcribed text — please review and correct any words or sentences before sending to translation.',
    };
  } catch (ocrErr: any) {
    console.error('[Sambhav OCR] Client-side OCR error:', ocrErr);
    return {
      success: false,
      text: '',
      line_count: 0,
      lines: [],
      document_type: 'general',
      language,
      error: 'Failed to process the image. Please try uploading a clearer photo.',
    };
  }
}
