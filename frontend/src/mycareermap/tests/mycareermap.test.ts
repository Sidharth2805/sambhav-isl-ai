import { describe, it, expect } from 'vitest';
import { careerService } from '../services/careerService';

describe('MyCareerMap Unified Platform Integration Tests', () => {
  it('should load all 152 careers and 15 career types from embedded database', async () => {
    const careers = await careerService.getCareers();
    const types = await careerService.getCareerTypes();

    expect(careers.length).toBeGreaterThanOrEqual(150);
    expect(types.length).toBeGreaterThanOrEqual(15);
  });

  it('should filter careers by search query and career discipline', async () => {
    const softwareCareers = await careerService.getCareers({ search: 'Software' });
    expect(softwareCareers.length).toBeGreaterThan(0);
    expect(softwareCareers.some((c: any) => c.title.includes('Software'))).toBe(true);

    const type1Careers = await careerService.getCareers({ type_id: 1 });
    expect(type1Careers.length).toBeGreaterThan(0);
  });

  it('should fetch enriched career details with skills, education, and opportunities', async () => {
    const detail = await careerService.getCareerDetails(1);
    expect(detail).toBeDefined();
    expect(detail.id).toBe(1);
    expect(detail.required_skills).toBeDefined();
    expect(Array.isArray(detail.required_skills)).toBe(true);
    expect(detail.education_requirements).toBeDefined();
  });

  it('should compare multiple careers side-by-side', async () => {
    const comparison = await careerService.compareCareers([1, 2]);
    expect(comparison).toBeDefined();
    expect(comparison.careers.length).toBe(2);
    expect(comparison.comparison_matrix.salary_range.length).toBe(2);
  });

  it('should generate milestone progression roadmaps dynamically', async () => {
    const newRoadmap = await careerService.generateRoadmap(1, 'Test Path', 'Automated test roadmap');
    expect(newRoadmap).toBeDefined();
    expect(newRoadmap.steps.length).toBe(4);
    expect(newRoadmap.steps[0].status).toBe('IN_PROGRESS');

    const updateRes = await careerService.updateRoadmapStepStatus(newRoadmap.steps[0].id, 'COMPLETED');
    expect(updateRes.status).toBe('COMPLETED');
  });

  it('should provide verified job opportunities and recruitment pathways', async () => {
    const opps = await careerService.getOpportunities();
    const pathways = await careerService.getRecruitmentPathways();

    expect(opps.length).toBeGreaterThan(0);
    expect(pathways.length).toBeGreaterThan(0);
  });
});
