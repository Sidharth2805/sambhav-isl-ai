import type { SambhavModel2Prediction } from '../types/recognition';
import { formatSambhavLabel } from './labels';

const PRIMARY_RENDER_ML_URL = 'https://sambhav-ml.onrender.com';

export function getMlServiceUrl(): string {
  if (import.meta.env.VITE_ML_SERVICE_URL) {
    return import.meta.env.VITE_ML_SERVICE_URL;
  }
  if (import.meta.env.VITE_ML_API_URL) {
    return import.meta.env.VITE_ML_API_URL;
  }
  if (import.meta.env.VITE_AI_URL) {
    return import.meta.env.VITE_AI_URL;
  }
  return PRIMARY_RENDER_ML_URL;
}

export class SambhavModel2InferenceEngine {
  private endpoint: string;

  constructor() {
    this.endpoint = getMlServiceUrl();
  }

  public async predictSequence(sequence60x126: number[][]): Promise<SambhavModel2Prediction> {
    const candidateEndpoints = [
      this.endpoint,
      PRIMARY_RENDER_ML_URL,
      'http://localhost:8000',
      'http://127.0.0.1:8000',
    ];
    const uniqueCandidates = Array.from(new Set(candidateEndpoints.filter(Boolean)));

    for (const ep of uniqueCandidates) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      try {
        const response = await fetch(`${ep}/predict-landmarks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sequence: sequence60x126 }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const rawLabel = data.gesture || data.label || 'NO_ACTIVE_SIGN';
        const confidence = typeof data.confidence === 'number' ? data.confidence : 0;
        const margin = typeof data.margin === 'number' ? data.margin : 0;
        const isReliable = confidence >= 0.25 && margin >= 0.08 && rawLabel !== 'NO_ACTIVE_SIGN';
        this.endpoint = ep;

        if (import.meta.env.DEV) {
          console.log(`[WEBRTC] [RECOGNITION] [SAMBHAV MODEL 2] Input: (${sequence60x126.length}x${sequence60x126[0]?.length || 0}) -> Pred: ${rawLabel} (${(confidence * 100).toFixed(1)}%) [via ${ep}]`);
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
      } catch {
        clearTimeout(timeoutId);
        // Try next candidate endpoint
      }
    }

    return {
      label: 'NO_ACTIVE_SIGN',
      phrase: '',
      confidence: 0,
      isReliable: false,
    };
  }

  public getEndpoint(): string {
    return this.endpoint;
  }

  public async checkHealth(): Promise<{ ok: boolean; latencyMs: number }> {
    const candidates = [
      this.endpoint,
      PRIMARY_RENDER_ML_URL,
      'http://localhost:8000',
      'http://127.0.0.1:8000',
    ];
    const uniqueCandidates = Array.from(new Set(candidates.filter(Boolean)));

    for (const url of uniqueCandidates) {
      const start = performance.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      try {
        const res = await fetch(`${url}/health`, { method: 'GET', signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const latencyMs = Math.max(1, Math.round(performance.now() - start));
          this.endpoint = url;
          return { ok: true, latencyMs };
        }
      } catch {
        clearTimeout(timeoutId);
        // Try next candidate
      }
    }

    return { ok: false, latencyMs: 0 };
  }
}

export const sambhavModel2Engine = new SambhavModel2InferenceEngine();
