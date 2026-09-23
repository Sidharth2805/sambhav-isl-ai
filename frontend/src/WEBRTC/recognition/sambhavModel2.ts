import type { SambhavModel2Prediction } from '../types/recognition';
import { formatSambhavLabel } from './labels';

export function getMlServiceUrl(): string {
  if (import.meta.env.VITE_ML_API_URL) {
    return import.meta.env.VITE_ML_API_URL;
  }
  if (import.meta.env.VITE_AI_URL) {
    return import.meta.env.VITE_AI_URL;
  }
  const isDev = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isDev) {
    return 'http://localhost:8000';
  }
  return 'https://sambhav-isl-ml.onrender.com';
}

export class SambhavModel2InferenceEngine {
  private endpoint: string;

  constructor() {
    this.endpoint = getMlServiceUrl();
  }

  public async predictSequence(sequence60x126: number[][]): Promise<SambhavModel2Prediction> {
    try {
      const response = await fetch(`${this.endpoint}/predict-landmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequence: sequence60x126 }),
      });

      if (!response.ok) {
        throw new Error(`ML prediction HTTP ${response.status}`);
      }

      const data = await response.json();
      const rawLabel = data.gesture || data.label || 'NO_ACTIVE_SIGN';
      const confidence = typeof data.confidence === 'number' ? data.confidence : 0;
      const isReliable = confidence >= 0.35 && rawLabel !== 'NO_ACTIVE_SIGN';

      if (import.meta.env.DEV) {
        console.log(`[WEBRTC] [RECOGNITION] [SAMBHAV MODEL 2] Input: (${sequence60x126.length}x${sequence60x126[0]?.length || 0}) -> Pred: ${rawLabel} (${(confidence * 100).toFixed(1)}%)`);
      }

      return {
        label: rawLabel,
        phrase: formatSambhavLabel(rawLabel),
        confidence,
        top2_label: data.top2_label || '',
        top2_confidence: data.top2_confidence || 0,
        margin: data.margin || 0,
        top_3: data.top_3 || [],
        isReliable,
      };
    } catch (err) {
      console.warn('[WEBRTC Sambhav Model 2] Inference note:', err);
      return {
        label: 'NO_ACTIVE_SIGN',
        phrase: '',
        confidence: 0,
        isReliable: false,
      };
    }
  }

  public getEndpoint(): string {
    return this.endpoint;
  }

  public async checkHealth(): Promise<{ ok: boolean; latencyMs: number }> {
    const candidates = [
      this.endpoint,
      'http://127.0.0.1:8000',
      'http://localhost:8000',
      'https://sambhav-ml.onrender.com',
      'https://sambhav-isl-ml.onrender.com',
    ];
    const uniqueCandidates = Array.from(new Set(candidates));

    for (const url of uniqueCandidates) {
      const start = performance.now();
      try {
        const res = await fetch(`${url}/health`, { method: 'GET' });
        if (res.ok) {
          const latencyMs = Math.max(1, Math.round(performance.now() - start));
          this.endpoint = url;
          return { ok: true, latencyMs };
        }
      } catch {
        // Try next candidate
      }
    }

    return { ok: false, latencyMs: 0 };
  }
}

export const sambhavModel2Engine = new SambhavModel2InferenceEngine();
