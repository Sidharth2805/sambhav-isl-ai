import api from './api';

export const profileService = {
  async getProfile() {
    const response = await api.get('/profile');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/profile', profileData);
    return response.data;
  },

  async getPreferences() {
    const response = await api.get('/profile/preferences');
    return response.data;
  },

  async updatePreferences(prefData) {
    const response = await api.put('/profile/preferences', prefData);
    return response.data;
  },

  async getEducation() {
    const response = await api.get('/profile/education');
    return response.data;
  },

  async addEducation(eduData) {
    const response = await api.post('/profile/education', eduData);
    return response.data;
  },

  async deleteEducation(id) {
    await api.delete(`/profile/education/${id}`);
  },

  async getSkills(params) {
    const response = await api.get('/skills', { params });
    return response.data;
  },

  async getUserSkills() {
    const response = await api.get('/skills/user');
    return response.data;
  },

  async addUserSkill(skillData) {
    const response = await api.post('/skills/user', skillData);
    return response.data;
  },

  async createCatalogSkill(skillData) {
    const response = await api.post('/skills', skillData);
    return response.data;
  },

  async deleteUserSkill(id) {
    await api.delete(`/skills/user/${id}`);
  },

  async getInterests(params) {
    const response = await api.get('/interests', { params });
    return response.data;
  },

  async getUserInterests() {
    const response = await api.get('/interests/user');
    return response.data;
  },

  async addUserInterest(interestData) {
    const response = await api.post('/interests/user', interestData);
    return response.data;
  },

  async createCatalogInterest(interestData) {
    const response = await api.post('/interests', interestData);
    return response.data;
  },

  async deleteUserInterest(id) {
    await api.delete(`/interests/user/${id}`);
  },

  async uploadResume(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/evidence/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async confirmResumeSkills(confirmPayload) {
    const response = await api.post('/evidence/resume/confirm', confirmPayload);
    return response.data;
  },

  async getEvidence() {
    const response = await api.get('/evidence');
    return response.data;
  },

  async addExternalEvidence(data) {
    const response = await api.post('/evidence/link', data);
    return response.data;
  },

  async downloadResume(evidenceId) {
    const response = await api.get(`/evidence/resume/${evidenceId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

