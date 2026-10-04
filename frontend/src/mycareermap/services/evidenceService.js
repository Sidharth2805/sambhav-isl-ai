import api from './api';

export const evidenceService = {
  // Get all user evidence records
  async getEvidence() {
    const response = await api.get('/evidence');
    return response.data;
  },

  // Save external evidence (GitHub, Portfolio, Certificate, etc.)
  async addExternalEvidence(evidenceData) {
    const response = await api.post('/evidence/link', evidenceData);
    return response.data;
  },

  // Scan public GitHub profile or repo
  async scanGitHubProfile(username) {
    const cleanUser = username.replace('https://github.com/', '').replace('/', '').trim();
    if (!cleanUser) throw new Error('Invalid GitHub username');

    try {
      // 1. Fetch user profile
      const userRes = await fetch(`https://api.github.com/users/${cleanUser}`);
      if (!userRes.ok) throw new Error(`GitHub user '${cleanUser}' not found.`);
      const userData = await userRes.json();

      // 2. Fetch public repos
      const reposRes = await fetch(`https://api.github.com/users/${cleanUser}/repos?sort=updated&per_page=12`);
      const repos = reposRes.ok ? await reposRes.json() : [];

      // 3. Extract languages and technologies
      const languageMap = {};
      const detectedTopics = new Set();
      let totalStars = 0;

      repos.forEach((repo) => {
        totalStars += repo.stargazers_count || 0;
        if (repo.language) {
          languageMap[repo.language] = (languageMap[repo.language] || 0) + 1;
        }
        if (Array.isArray(repo.topics)) {
          repo.topics.forEach((t) => detectedTopics.add(t));
        }
      });

      // Map to standardized skills
      const extractedSkills = [];
      Object.entries(languageMap).forEach(([lang, count]) => {
        extractedSkills.push({
          name: lang,
          category: 'Technology',
          repoCount: count,
          proficiency: count >= 4 ? 'advanced' : count >= 2 ? 'intermediate' : 'beginner',
          verified: true,
        });
      });

      Array.from(detectedTopics).slice(0, 10).forEach((topic) => {
        const formatted = topic.charAt(0).toUpperCase() + topic.slice(1);
        if (!extractedSkills.some((s) => s.name.toLowerCase() === formatted.toLowerCase())) {
          extractedSkills.push({
            name: formatted,
            category: 'Technical Knowledge',
            repoCount: 1,
            proficiency: 'intermediate',
            verified: true,
          });
        }
      });

      return {
        username: userData.login,
        name: userData.name || userData.login,
        avatar_url: userData.avatar_url,
        bio: userData.bio || '',
        public_repos: userData.public_repos,
        followers: userData.followers,
        total_stars: totalStars,
        top_languages: Object.keys(languageMap).slice(0, 5),
        extracted_skills: extractedSkills,
        repos: repos.slice(0, 6).map((r) => ({
          name: r.name,
          description: r.description || 'Public GitHub project',
          language: r.language,
          stars: r.stargazers_count,
          url: r.html_url,
          updated_at: r.updated_at,
        })),
      };
    } catch (err) {
      console.error('GitHub scan failed:', err);
      throw err;
    }
  },
};
