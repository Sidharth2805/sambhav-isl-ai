import { describe, it, expect, beforeEach } from 'vitest';
import { SaanketBiLSTMClassifier, ISL_VOCABULARY, formatISLLabel, resampleSequence } from './islModel';
import type { ISLLandmarks } from './islModel';

describe('ISL AI Recognition Pipeline Unit Tests', () => {
  let classifier: SaanketBiLSTMClassifier;

  beforeEach(() => {
    classifier = new SaanketBiLSTMClassifier('http://127.0.0.1:8000');
  });

  describe('Gesture-to-Text Vocabulary Mapping', () => {
    it('should map ISL alphabet and words accurately in vocabulary', () => {
      expect(ISL_VOCABULARY['A']).toBe('A');
      expect(ISL_VOCABULARY['Z']).toBe('Z');
      expect(ISL_VOCABULARY['hello']).toBe('Hello');
      expect(ISL_VOCABULARY['thank_you']).toBe('Thank You');
      expect(ISL_VOCABULARY['help']).toBe('Help');
      expect(ISL_VOCABULARY['water']).toBe('Water');
    });

    it('should format raw labels into clean title-cased English', () => {
      expect(formatISLLabel('hello')).toBe('Hello');
      expect(formatISLLabel('good_morning')).toBe('Good Morning');
      expect(formatISLLabel('A')).toBe('A');
      expect(formatISLLabel('')).toBe('');
      expect(formatISLLabel('NO_HANDS')).toBe('');
    });
  });

  describe('Temporal Resampling (60 Frames Contract)', () => {
    it('should resample empty frames into 60 zero-padded frames', () => {
      const resampled = resampleSequence([], 60);
      expect(resampled.length).toBe(60);
      expect(resampled[0].length).toBe(126);
      expect(resampled[0].every((v) => v === 0)).toBe(true);
    });

    it('should resample a single frame across all 60 frames', () => {
      const singleFrame = [new Array(126).fill(0.5)];
      const resampled = resampleSequence(singleFrame, 60);
      expect(resampled.length).toBe(60);
      expect(resampled[0][0]).toBe(0.5);
      expect(resampled[59][0]).toBe(0.5);
    });

    it('should stretch a 30-frame sequence smoothly to exactly 60 frames', () => {
      const raw30 = Array.from({ length: 30 }, (_, i) => new Array(126).fill(i / 29));
      const resampled = resampleSequence(raw30, 60);
      expect(resampled.length).toBe(60);
      expect(resampled[0][0]).toBe(0);
      expect(resampled[59][0]).toBe(1);
    });
  });

  describe('SaanketBiLSTMClassifier Buffer & Idle Safety', () => {
    it('should return NO_ACTIVE_SIGN and 0 confidence when landmarks are empty or idle', async () => {
      const emptyLandmarks: ISLLandmarks = {};
      const result = await classifier.classify(emptyLandmarks);
      expect(result.label).toBe('NO_ACTIVE_SIGN');
      expect(result.confidence).toBe(0.0);
      expect(result.rejectionReason).toBe('INSUFFICIENT_ACTIVITY');
    });

    it('should clear buffer when clearBuffer is invoked', () => {
      classifier.addFrame({
        leftHand: Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5, z: 0 }))
      });
      expect(classifier.getLatestBuffer().length).toBeGreaterThan(0);
      classifier.clearBuffer();
      expect(classifier.getLatestBuffer().length).toBe(0);
    });
  });
});
