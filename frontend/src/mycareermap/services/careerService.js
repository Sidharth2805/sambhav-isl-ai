import api from './api';
import { localDb } from './localDb';

export const careerService = {
  async getHealth() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch {
      return localDb.getHealth();
    }
  },

  async getCareerTypes() {
    try {
      const response = await api.get('/careers/types');
      return response.data;
    } catch {
      return localDb.getCareerTypes();
    }
  },

  async getCareers(params = {}) {
    try {
      const response = await api.get('/careers', { params });
      return response.data;
    } catch {
      return localDb.getCareers(params);
    }
  },

  async getCareerDetails(id) {
    try {
      const response = await api.get(`/careers/${id}`);
      return response.data;
    } catch {
      return localDb.getCareerDetails(id);
    }
  },

  async getCareerRelationships(id) {
    try {
      const response = await api.get(`/careers/${id}/relationships`);
      return response.data;
    } catch {
      return localDb.getCareerRelationships(id);
    }
  },

  async compareCareers(careerIds) {
    try {
      const response = await api.post('/careers/compare', { career_ids: careerIds });
      return response.data;
    } catch {
      return localDb.compareCareers(careerIds);
    }
  },

  async getMatches(params = {}) {
    try {
      const response = await api.get('/matching', { params });
      return response.data;
    } catch {
      return localDb.getMatches(params);
    }
  },

  async calculateMatches() {
    try {
      const response = await api.post('/matching/calculate');
      return response.data;
    } catch {
      return localDb.getMatches();
    }
  },

  async getGapAnalysis(careerId) {
    try {
      const response = await api.get(`/matching/career/${careerId}/gap-analysis`);
      return response.data;
    } catch {
      return localDb.getGapAnalysis(careerId);
    }
  },

  async getMatchExplanation(careerId) {
    try {
      const response = await api.get(`/matching/career/${careerId}/explanation`);
      return response.data;
    } catch {
      return localDb.getMatchExplanation(careerId);
    }
  },

  async getRoadmaps() {
    try {
      const response = await api.get('/roadmaps');
      return response.data;
    } catch {
      return localDb.getRoadmaps();
    }
  },

  async generateRoadmap(targetCareerId, title, description) {
    try {
      const response = await api.post('/roadmaps/generate', {
        target_career_id: targetCareerId,
        title,
        description,
      });
      return response.data;
    } catch {
      return localDb.generateRoadmap(targetCareerId, title, description);
    }
  },

  async getRoadmapDetails(id) {
    try {
      const response = await api.get(`/roadmaps/${id}`);
      return response.data;
    } catch {
      return localDb.getRoadmapDetails(id);
    }
  },

  async updateRoadmapStepStatus(stepId, status) {
    try {
      const response = await api.patch(`/roadmaps/steps/${stepId}/status`, null, {
        params: { status_str: status },
      });
      return response.data;
    } catch {
      return localDb.updateRoadmapStepStatus(stepId, status);
    }
  },

  async deleteRoadmap(id) {
    try {
      const response = await api.delete(`/roadmaps/${id}`);
      return response.data;
    } catch {
      return localDb.deleteRoadmap(id);
    }
  },

  async getOpportunities(params = {}) {
    try {
      const response = await api.get('/opportunities', { params });
      return response.data;
    } catch {
      return localDb.getOpportunities(params);
    }
  },

  async getOpportunityTypes() {
    try {
      const response = await api.get('/opportunities/types');
      return response.data;
    } catch {
      return localDb.getOpportunityTypes();
    }
  },

  async getRecruitmentPathways(params = {}) {
    try {
      const response = await api.get('/opportunities/pathways', { params });
      return response.data;
    } catch {
      return localDb.getRecruitmentPathways(params);
    }
  },
};
