import { describe, it, expect } from 'vitest';
import { extract126Landmarks, resampleSequenceTo60 } from '../preprocessing';
import { formatSambhavLabel } from '../labels';
import { SambhavModel2InferenceEngine } from '../sambhavModel2';

describe('SAMBHAV Model 2 Real-Time Recognition Tests', () => {
  describe('extract126Landmarks', () => {
    it('returns 126 zeros and hasHand=false for empty results', () => {
      const { vector, hasHand } = extract126Landmarks(null);
      expect(hasHand).toBe(false);
      expect(vector.length).toBe(126);
      expect(vector.every((v) => v === 0)).toBe(true);
    });

    it('extracts left hand into slot 0 (0..62) and right hand into slot 1 (63..125)', () => {
      const mockResults = {
        multiHandLandmarks: [
          Array.from({ length: 21 }, (_, i) => ({ x: 0.1 * i, y: 0.2 * i, z: -0.05 })),
          Array.from({ length: 21 }, (_, i) => ({ x: 0.5 + 0.01 * i, y: 0.6 + 0.01 * i, z: 0.02 })),
        ],
        multiHandedness: [
          { label: 'Left', score: 0.99 },
          { label: 'Right', score: 0.98 },
        ],
      };

      const { vector, hasHand } = extract126Landmarks(mockResults);
      expect(hasHand).toBe(true);
      expect(vector.length).toBe(126);

      // Slot 0 (Left hand)
      expect(vector[0]).toBe(0); // landmark 0 x
      expect(vector[2]).toBe(-0.05); // landmark 0 z

      // Slot 1 (Right hand starts at index 63)
      expect(vector[63]).toBe(0.5); // right landmark 0 x
      expect(vector[65]).toBe(0.02); // right landmark 0 z
    });
  });

  describe('resampleSequenceTo60', () => {
    it('produces exactly 60 frames of 126 features', () => {
      const raw30 = Array.from({ length: 30 }, () => new Array<number>(126).fill(0.25));
      const resampled = resampleSequenceTo60(raw30);
      expect(resampled.length).toBe(60);
      expect(resampled[0].length).toBe(126);
      expect(resampled[59].length).toBe(126);
      expect(resampled[0][0]).toBe(0.25);
    });

    it('handles empty input gracefully', () => {
      const resampled = resampleSequenceTo60([]);
      expect(resampled.length).toBe(60);
      expect(resampled[0].every((v) => v === 0)).toBe(true);
    });
  });

  describe('formatSambhavLabel', () => {
    it('formats raw snake_case or single letters into clean readable title case', () => {
      expect(formatSambhavLabel('good_morning')).toBe('Good Morning');
      expect(formatSambhavLabel('thank_you')).toBe('Thank You');
      expect(formatSambhavLabel('good_afternoon')).toBe('Good Afternoon');
      expect(formatSambhavLabel('A')).toBe('A');
      expect(formatSambhavLabel('book')).toBe('Book');
    });
  });

  describe('SambhavModel2InferenceEngine Health & Prediction', () => {
    it('detects online endpoint when local ML service is running', async () => {
      const engine = new SambhavModel2InferenceEngine();
      const health = await engine.checkHealth();
      expect(health.ok).toBe(true);
      expect(health.latencyMs).toBeGreaterThan(0);
    });

    it('returns valid prediction from real BiLSTM model for active sequence', async () => {
      const engine = new SambhavModel2InferenceEngine();
      // Generate realistic 60x126 test sequence
      const sequence: number[][] = [];
      for (let i = 0; i < 60; i++) {
        const frame = new Array<number>(126).fill(0);
        for (let j = 0; j < 21; j++) {
          frame[63 + j * 3] = 0.5 + 0.05 * Math.sin(i * 0.1 + j * 0.2);
          frame[63 + j * 3 + 1] = 0.6 + 0.04 * Math.cos(i * 0.1 + j * 0.2);
          frame[63 + j * 3 + 2] = -0.02;
        }
        sequence.push(frame);
      }

      const prediction = await engine.predictSequence(sequence);
      expect(prediction.label).not.toBe('NO_ACTIVE_SIGN');
      expect(prediction.confidence).toBeGreaterThan(0);
      expect(prediction.phrase.length).toBeGreaterThan(0);
    });
  });
});
