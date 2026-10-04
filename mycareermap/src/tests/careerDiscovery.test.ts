import { describe, it, expect } from 'vitest';
import { CAREER_DOMAINS } from '../data/careerDiscovery/careerDomains';
import {
  QUESTION_BANK_BY_TRADE,
  ENGINEERING_TOPICS,
  generateRandomizedEngineeringAssessment,
} from '../data/careerDiscovery/engineeringAssessmentData';
import { DETAILED_ENGINEERING_JOB_ROADMAPS } from '../data/careerDiscovery/engineeringJobRoadmaps';
import { careerAssets } from '../data/careerDiscovery/careerAssets';

describe('Career Discovery: 10 Career Domains Architecture', () => {
  it('should load all 10 distinct career domains', () => {
    expect(CAREER_DOMAINS).toHaveLength(10);
    const engineering = CAREER_DOMAINS.find((d) => d.id === 'engineering');
    expect(engineering).toBeDefined();
    expect(engineering?.isAvailable).toBe(true);

    const nonEngineering = CAREER_DOMAINS.filter((d) => d.id !== 'engineering');
    expect(nonEngineering).toHaveLength(9);
    for (const d of nonEngineering) {
      expect(d.isAvailable).toBe(false);
      expect(d.badgeText).toBe('In Development');
    }
  });
});

describe('Career Discovery: 75-Question Bank across 5 User Images / Trades', () => {
  it('should have 15 unique questions for each of the 5 trades (75 questions total)', () => {
    expect(ENGINEERING_TOPICS).toHaveLength(5);
    const trades = ['electrical', 'mechanical', 'civil', 'software', 'metallurgy'] as const;

    for (const trade of trades) {
      const bank = QUESTION_BANK_BY_TRADE[trade];
      expect(bank).toBeDefined();
      expect(bank).toHaveLength(15);

      // Verify each question has exactly 4 options with 1 correct answer
      for (const q of bank) {
        expect(q.options).toHaveLength(4);
        const correctOpt = q.options.find((o) => o.id === q.correctToolId);
        expect(correctOpt).toBeDefined();
      }
    }
  });

  it('should generate a randomized 25-question assessment with 4 shuffled options each', () => {
    const questions = generateRandomizedEngineeringAssessment();
    expect(questions).toHaveLength(25);

    const trades = ['electrical', 'mechanical', 'civil', 'software', 'metallurgy'] as const;
    for (const trade of trades) {
      const tradeQuestions = questions.filter((q) => q.topicId === trade);
      expect(tradeQuestions).toHaveLength(5);

      for (const q of tradeQuestions) {
        expect(q.availableTools).toHaveLength(4);
        expect(q.workspaceHotspots).toHaveLength(4);
        const correct = q.availableTools.filter((t) => t.isCorrect);
        expect(correct).toHaveLength(1);
        expect(correct[0].id).toBe(q.correctToolId);
      }
    }
  });

  it('should verify all 5 trade images are correctly referenced', () => {
    expect(careerAssets.trades.electrical).toContain('/images/career councling/electrical.png');
    expect(careerAssets.trades.mechanical).toContain('/images/career councling/mechnical.png');
    expect(careerAssets.trades.civil).toContain('/images/career councling/civil.png');
    expect(careerAssets.trades.computerScience).toContain('/images/career councling/computer science.png');
    expect(careerAssets.trades.metallurgy).toContain('/images/career councling/metullergy.png');
  });
});

describe('Career Discovery: Detailed Career Roadmaps & Salary Tiers (LPA)', () => {
  it('should load comprehensive roadmaps for all 5 engineering trades', () => {
    expect(DETAILED_ENGINEERING_JOB_ROADMAPS).toHaveLength(5);

    for (const job of DETAILED_ENGINEERING_JOB_ROADMAPS) {
      expect(job.salaryTiers).toHaveLength(3);
      expect(job.salaryTiers[0].rangeLPA).toBeDefined();
      expect(job.salaryTiers[1].rangeLPA).toBeDefined();
      expect(job.salaryTiers[2].rangeLPA).toBeDefined();
      expect(job.recommendedMajors.length).toBeGreaterThan(0);
      expect(job.coreSubjectsToMaster.length).toBeGreaterThan(0);
      expect(job.roadmapPhases).toHaveLength(3);
      expect(job.deafAccessibilityAdvantages.length).toBeGreaterThan(0);
    }
  });
});

describe('Career Discovery: Scoring & Vocational Assessment Engine', () => {
  it('should compute comprehensive cumulative report across multiple questions', async () => {
    const { calculateMultiTaskCareerScore } = await import('../utils/careerScoring');
    const questions = generateRandomizedEngineeringAssessment();

    const eval1 = {
      evidence: {
        studentId: 'student-multi-01',
        sessionId: 'session-multi-01',
        taskId: questions[0].id,
        phase: questions[0].phase,
        attempts: 1,
        clicksUsed: 1,
        correctActions: 1,
        incorrectActions: 0,
        hintsUsed: 0,
        guidanceCount: 0,
        errorsCorrected: 0,
        startTime: Date.now() - 12000,
        completionTime: Date.now(),
        independentCompletion: true,
      },
      task: questions[0],
      inspectedToolIds: new Set([questions[0].correctToolId]),
    };

    const eval2 = {
      evidence: {
        studentId: 'student-multi-01',
        sessionId: 'session-multi-01',
        taskId: questions[5].id,
        phase: questions[5].phase,
        attempts: 1,
        clicksUsed: 1,
        correctActions: 1,
        incorrectActions: 0,
        hintsUsed: 0,
        guidanceCount: 0,
        errorsCorrected: 0,
        startTime: Date.now() - 15000,
        completionTime: Date.now(),
        independentCompletion: true,
      },
      task: questions[5],
      inspectedToolIds: new Set([questions[5].correctToolId]),
    };

    const cumulativeReport = calculateMultiTaskCareerScore([eval1, eval2], 'student-multi-01', 'session-multi-01');

    expect(cumulativeReport.totalQuestionsAttempted).toBe(2);
    expect(cumulativeReport.totalQuestionsCorrect).toBe(2);
    expect(cumulativeReport.scoreBreakdown.totalMarks).toBeGreaterThanOrEqual(70);
    expect(cumulativeReport.skillProfile.diagnosticReasoning).toBeGreaterThan(70);
  });
});
