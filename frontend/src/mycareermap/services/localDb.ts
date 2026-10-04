import rawData from '../data/mycareermapDb.json';

const db: any = rawData;

// In-memory runtime storage for generated roadmaps & updated step statuses
let runtimeRoadmaps = [...(db.roadmaps || [])];
let runtimeSteps = [...(db.roadmap_steps || [])];

export const localDb = {
  getHealth() {
    return { status: 'healthy', database: 'connected', version: '2.0.0-embedded' };
  },

  getCareerTypes() {
    return db.career_types || [];
  },

  getCareers(params: any = {}) {
    let list = [...(db.careers || [])];
    
    // Attach career_type info
    const typeMap = new Map((db.career_types || []).map((t: any) => [t.id, t]));
    list = list.map((c) => ({
      ...c,
      career_type: typeMap.get(c.career_type_id) || null,
      skills_count: (db.career_skills || []).filter((cs: any) => cs.career_id === c.id).length,
      opportunities_count: (db.career_opportunities || []).filter((co: any) => co.career_id === c.id).length,
    }));

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((c) => 
        c.title?.toLowerCase().includes(q) || 
        c.description?.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q)
      );
    }

    if (params.type_id) {
      list = list.filter((c) => c.career_type_id === Number(params.type_id));
    }

    if (params.demand_level) {
      list = list.filter((c) => c.demand_level === params.demand_level);
    }

    if (params.limit) {
      list = list.slice(0, Number(params.limit));
    }

    return list;
  },

  getCareerDetails(id: number | string) {
    const cid = Number(id);
    const career = (db.careers || []).find((c: any) => c.id === cid);
    if (!career) return null;

    const careerType = (db.career_types || []).find((t: any) => t.id === career.career_type_id);
    const skillMap = new Map((db.skills || []).map((s: any) => [s.id, s]));
    
    // Skills
    const required_skills = (db.career_skills || [])
      .filter((cs: any) => cs.career_id === cid)
      .map((cs: any) => ({
        ...cs,
        skill: skillMap.get(cs.skill_id) || { name: 'Specialized Skill', category: 'Technical' },
      }));

    // Education
    const education_requirements = (db.career_education || [])
      .filter((ce: any) => ce.career_id === cid);

    // Interests
    const interestMap = new Map((db.interests || []).map((i: any) => [i.id, i]));
    const interests = (db.career_interests || [])
      .filter((ci: any) => ci.career_id === cid)
      .map((ci: any) => ({
        ...ci,
        interest: interestMap.get(ci.interest_id) || { name: 'Industry Practice' },
      }));

    // Linked Opportunities
    const oppIds = new Set(
      (db.career_opportunities || [])
        .filter((co: any) => co.career_id === cid)
        .map((co: any) => co.opportunity_id)
    );
    const opportunities = (db.opportunities || []).filter((o: any) => oppIds.has(o.id));

    // Relationships
    const relationships = this.getCareerRelationships(cid);

    return {
      ...career,
      career_type: careerType,
      required_skills,
      education_requirements,
      interests,
      opportunities,
      relationships,
    };
  },

  getCareerRelationships(id: number | string) {
    const cid = Number(id);
    const rels = (db.career_relationships || []).filter((r: any) => r.source_career_id === cid);
    const careerMap = new Map((db.careers || []).map((c: any) => [c.id, c]));

    return rels.map((r: any) => ({
      ...r,
      target_career: careerMap.get(r.target_career_id) || null,
    }));
  },

  compareCareers(careerIds: (number | string)[]) {
    const numericIds = careerIds.map((id) => Number(id));
    const items = numericIds.map((id) => this.getCareerDetails(id)).filter(Boolean);
    return {
      careers: items,
      comparison_matrix: {
        salary_range: items.map((c) => ({ id: c?.id, title: c?.title, min: c?.salary_entry_inr, max: c?.salary_experienced_inr })),
        demand_level: items.map((c) => ({ id: c?.id, title: c?.title, demand: c?.demand_level })),
        required_skills: items.map((c) => ({ id: c?.id, title: c?.title, skills: c?.required_skills })),
        education: items.map((c) => ({ id: c?.id, title: c?.title, education: c?.education_requirements })),
      },
    };
  },

  getMatches(params: any = {}) {
    // Generate deterministic match scores for all careers
    const careers = this.getCareers(params);
    return careers.map((c, idx) => {
      // Mock deterministic score
      const match_score = Math.max(65, 98 - (idx * 2) % 35);
      return {
        career_id: c.id,
        career: c,
        match_score,
        skill_match_score: Math.min(100, match_score + 4),
        education_match_score: Math.min(100, match_score + 2),
        interest_match_score: match_score,
        preference_match_score: Math.min(100, match_score - 2),
        missing_skills_count: Math.floor((100 - match_score) / 10),
        strengths: ['Analytical Aptitude', 'Technical Foundations', 'Domain Alignment'],
        gap_areas: ['Advanced Industry Tooling', 'Certifications'],
      };
    });
  },

  getGapAnalysis(careerId: number | string) {
    const career = this.getCareerDetails(careerId);
    if (!career) return null;
    return {
      career_id: Number(careerId),
      career_title: career.title,
      overall_match: 84,
      acquired_skills: (career.required_skills || []).slice(0, 3),
      missing_skills: (career.required_skills || []).slice(3),
      recommended_certifications: [
        'National Skill Certification Council Level 4',
        'Industry Foundation Practitioner Badge',
      ],
    };
  },

  getMatchExplanation(careerId: number | string) {
    const career = this.getCareerDetails(careerId);
    return {
      career_id: Number(careerId),
      career_title: career?.title || 'Career Path',
      explanation: `High synergy match (88%) based on technical reasoning, problem-solving interests, and foundational education profile.`,
      key_drivers: [
        'Strong overlap in required analytical and trade tools',
        'High market demand and compensation growth',
        'Structured apprenticeship and placement pathways available',
      ],
    };
  },

  getRoadmaps() {
    const careerMap = new Map((db.careers || []).map((c: any) => [c.id, c]));
    return runtimeRoadmaps.map((r: any) => {
      const steps = runtimeSteps.filter((s: any) => s.roadmap_id === r.id);
      const completedSteps = steps.filter((s: any) => s.status === 'COMPLETED' || s.status === 'completed');
      const progress = steps.length > 0 ? Math.round((completedSteps.length / steps.length) * 100) : 0;
      return {
        ...r,
        target_career: careerMap.get(r.target_career_id) || { title: r.title },
        steps_count: steps.length,
        progress_percentage: progress,
        steps: steps.sort((a: any, b: any) => (a.step_order || 0) - (b.step_order || 0)),
      };
    });
  },

  getRoadmapDetails(id: number | string) {
    const rid = Number(id);
    const roadmap = runtimeRoadmaps.find((r: any) => r.id === rid);
    if (!roadmap) return null;

    const career = this.getCareerDetails(roadmap.target_career_id);
    const steps = runtimeSteps
      .filter((s: any) => s.roadmap_id === rid)
      .sort((a: any, b: any) => (a.step_order || 0) - (b.step_order || 0));

    return {
      ...roadmap,
      target_career: career,
      steps,
    };
  },

  generateRoadmap(targetCareerId: number | string, title?: string, description?: string) {
    const cid = Number(targetCareerId);
    const career = (db.careers || []).find((c: any) => c.id === cid);
    const newId = Date.now();
    const newTitle = title || `${career?.title || 'Career'} Professional Roadmap`;
    const newDesc = description || `Step-by-step milestone execution roadmap for ${career?.title || 'this career'}.`;

    const newRoadmap = {
      id: newId,
      user_id: 1,
      target_career_id: cid,
      title: newTitle,
      description: newDesc,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    };

    const newSteps = [
      {
        id: newId * 10 + 1,
        roadmap_id: newId,
        step_order: 1,
        title: 'Foundational Knowledge & Core Principles',
        description: 'Master core concepts, terminology, and foundational frameworks.',
        step_type: 'SKILL',
        estimated_hours: 40,
        status: 'IN_PROGRESS',
      },
      {
        id: newId * 10 + 2,
        roadmap_id: newId,
        step_order: 2,
        title: 'Hands-on Practical Project Implementation',
        description: 'Build portfolio artifacts demonstrating real-world problem-solving.',
        step_type: 'PROJECT',
        estimated_hours: 60,
        status: 'PENDING',
      },
      {
        id: newId * 10 + 3,
        roadmap_id: newId,
        step_order: 3,
        title: 'Industry Certification & Credentials',
        description: 'Acquire accredited benchmark certifications.',
        step_type: 'CERTIFICATION',
        estimated_hours: 30,
        status: 'PENDING',
      },
      {
        id: newId * 10 + 4,
        roadmap_id: newId,
        step_order: 4,
        title: 'Internship, Mentorship & Entry Placement',
        description: 'Apply to verified openings and recruitment cycles.',
        step_type: 'OPPORTUNITY',
        estimated_hours: 80,
        status: 'PENDING',
      },
    ];

    runtimeRoadmaps.unshift(newRoadmap);
    runtimeSteps.push(...newSteps);

    return {
      ...newRoadmap,
      target_career: career,
      steps: newSteps,
    };
  },

  updateRoadmapStepStatus(stepId: number | string, status: string) {
    const sid = Number(stepId);
    runtimeSteps = runtimeSteps.map((s: any) => (s.id === sid ? { ...s, status } : s));
    return { success: true, step_id: sid, status };
  },

  deleteRoadmap(id: number | string) {
    const rid = Number(id);
    runtimeRoadmaps = runtimeRoadmaps.filter((r: any) => r.id !== rid);
    runtimeSteps = runtimeSteps.filter((s: any) => s.roadmap_id !== rid);
    return { success: true, id: rid };
  },

  getOpportunities(params: any = {}) {
    let list = [...(db.opportunities || [])];
    if (params.type) {
      list = list.filter((o: any) => o.opportunity_type?.toLowerCase() === params.type.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((o: any) => 
        o.title?.toLowerCase().includes(q) || 
        o.organization_name?.toLowerCase().includes(q) ||
        o.location?.toLowerCase().includes(q)
      );
    }
    return list;
  },

  getOpportunityTypes() {
    const types = new Set((db.opportunities || []).map((o: any) => o.opportunity_type));
    return Array.from(types).filter(Boolean);
  },

  getRecruitmentPathways(_params: any = {}) {
    return db.recruitment_pathways || [];
  },
};
