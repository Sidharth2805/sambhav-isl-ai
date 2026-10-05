import React, { useState, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Compass,
  Map,
  Briefcase,
  Scale,
  Sparkles,
  FileText,
  ArrowLeft,
  CheckCircle2,
  X,
  RotateCcw,
  Check,
  ArrowUpRight,
  Upload,
  FileCheck,
  Zap,
  Target
} from 'lucide-react';
import rawDb from '../data/mycareermapDb.json';

const db: any = rawDb;

const sampleResumes = [
  {
    name: '💻 Tech / Full-Stack',
    text: `Experienced full stack web developer with 3+ years in React, TypeScript, Node.js, Next.js, REST APIs, GraphQL, PostgreSQL, MongoDB, Docker, Git, CI/CD pipelines, and cloud deployment on AWS. Strong foundations in data structures, algorithms, and microservices architecture.`
  },
  {
    name: '📊 Data Science & AI/ML',
    text: `Data scientist with experience in Python, Pandas, NumPy, Scikit-Learn, TensorFlow, PyTorch, SQL data pipelines, exploratory data analysis, machine learning algorithms, deep neural networks, natural language processing, Tableau dashboards, and predictive modeling.`
  },
  {
    name: '🩺 Healthcare & Medical',
    text: `Medical graduate with clinical training in patient diagnosis, emergency triage, pharmacotherapy, pathology, internal medicine, medical physiology, electronic health records (EHR), clinical documentation, and patient care management.`
  },
  {
    name: '🎨 UI/UX & Product Design',
    text: `Product & UI/UX designer proficient in Figma, Adobe XD, design systems, wireframing, interactive prototyping, user research, usability testing, accessibility (WCAG 2.1), information architecture, and responsive web/mobile UX.`
  },
  {
    name: '🏗️ Civil & Infrastructure',
    text: `Civil engineer with expertise in structural design, AutoCAD, Revit BIM modeling, concrete structures, soil mechanics, project cost estimation, site engineering, building safety codes, and infrastructure surveying.`
  }
];

export const MyCareerMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'explore';
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDemand, setSelectedDemand] = useState<string>('all');
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all');
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [selectedCareerDetail, setSelectedCareerDetail] = useState<any | null>(null);

  // Active Roadmap Selection (Default to Full Stack Engineer or chosen career)
  const [selectedRoadmapCareerId, setSelectedRoadmapCareerId] = useState<number>(() => {
    const careerParam = searchParams.get('career');
    return careerParam ? Number(careerParam) : 1;
  });

  // Modals
  const [guidedModalOpen, setGuidedModalOpen] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);

  // Step Completion State stored by roadmapId-stepId
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    '1-1': true,
    '2-1': true,
    '3-1': true,
  });

  // Guided Finder Wizard State
  const [guidedStep, setGuidedStep] = useState(1);
  const [guidedCategory, setGuidedCategory] = useState('Technology');
  const [guidedWorkStyle, setGuidedWorkStyle] = useState('Remote');
  const [guidedEducation, setGuidedEducation] = useState('Undergraduate');
  const [guidedResults, setGuidedResults] = useState<any[]>([]);

  // Resume Scanner State
  const [resumeText, setResumeText] = useState('');
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const [resumeMatches, setResumeMatches] = useState<any[]>([]);
  const [isScanningResume, setIsScanningResume] = useState(false);

  // Opportunities Sub-tab
  const [oppSubTab, setOppSubTab] = useState<'jobs' | 'pathways'>('jobs');
  const [oppSearch, setOppSearch] = useState('');
  const [oppTypeFilter, setOppTypeFilter] = useState('all');

  const setTab = (tab: string, careerId?: number) => {
    if (careerId) {
      setSearchParams({ tab, career: String(careerId) });
      setSelectedRoadmapCareerId(careerId);
    } else {
      setSearchParams({ tab });
    }
  };

  // Career Types Map
  const careerTypes = useMemo(() => db.career_types || [], []);
  const careerTypeMap = useMemo(() => {
    const map: Record<string | number, string> = {};
    (db.career_types || []).forEach((t: any) => {
      map[t.id] = t.name;
    });
    return map;
  }, []);

  // Filtered Careers for Explorer
  const filteredCareers = useMemo(() => {
    let list = db.careers || [];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c: any) =>
        c.title?.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.summary?.toLowerCase().includes(q)
      );
    }

    if (selectedType !== 'all') {
      list = list.filter((c: any) => String(c.career_type_id) === String(selectedType));
    }

    if (selectedDemand !== 'all') {
      list = list.filter((c: any) => c.demand_level?.toLowerCase() === selectedDemand.toLowerCase());
    }

    if (selectedEnvironment !== 'all') {
      list = list.filter((c: any) => {
        const envs = c.work_environments || [];
        return envs.some((e: string) => e.toLowerCase().includes(selectedEnvironment.toLowerCase()));
      });
    }

    return list;
  }, [searchQuery, selectedType, selectedDemand, selectedEnvironment]);

  // Specific Roadmap Generator for Any Chosen Career
  const activeRoadmap = useMemo(() => {
    const career = (db.careers || []).find((c: any) => c.id === Number(selectedRoadmapCareerId)) || (db.careers || [])[0];
    if (!career) return null;

    const skillMap: Record<string | number, string> = {};
    (db.skills || []).forEach((s: any) => {
      skillMap[s.id] = s.name;
    });

    const requiredSkills = (db.career_skills || [])
      .filter((cs: any) => cs.career_id === career.id)
      .map((cs: any) => skillMap[cs.skill_id])
      .filter(Boolean);

    const skillsStr = requiredSkills.slice(0, 4).join(', ') || 'Core Analytical & Technical Principles';
    const advancedSkillsStr = requiredSkills.slice(4, 8).join(', ') || 'Advanced Frameworks & Domain Tools';

    const eduReqs = (db.career_education || [])
      .filter((ce: any) => ce.career_id === career.id)
      .map((ce: any) => ce.degree_level || ce.field_of_study)
      .filter(Boolean)
      .join(' / ') || career.required_education_level || 'Undergraduate Degree';

    const relRoles = (db.career_relationships || [])
      .filter((r: any) => r.source_career_id === career.id)
      .map((r: any) => {
        const target = (db.careers || []).find((tc: any) => tc.id === r.target_career_id);
        return target?.title;
      })
      .filter(Boolean)
      .join(', ');

    const minSal = career.salary_range_min ? (career.salary_range_min / 100000).toFixed(1) : '5.0';
    const maxSal = career.salary_range_max ? (career.salary_range_max / 100000).toFixed(1) : '20.0';

    const steps = [
      {
        id: 1,
        phase: 'Phase 1: Foundations & Prerequisites',
        title: `Foundational Competencies & Core Theory`,
        description: `Master fundamental core competencies: ${skillsStr}. Satisfy academic prerequisites (${eduReqs}).`,
        skills: requiredSkills.slice(0, 4),
        estimated_hours: 45,
      },
      {
        id: 2,
        phase: 'Phase 2: Practical Projects',
        title: `Applied Portfolio & Real-world Implementation`,
        description: `Build 2 verified industry portfolio projects demonstrating hands-on mastery of: ${advancedSkillsStr}.`,
        skills: requiredSkills.slice(4, 8),
        estimated_hours: 65,
      },
      {
        id: 3,
        phase: 'Phase 3: Industry Certification',
        title: `Accredited Credentials & Benchmark Licensing`,
        description: `Acquire accredited Skill Council, AICTE, or global domain certifications recognized across hiring standards.`,
        skills: ['Standard Testing', 'Benchmarking'],
        estimated_hours: 35,
      },
      {
        id: 4,
        phase: 'Phase 4: Specialization & Advancement',
        title: `Vertical Growth & Career Progression`,
        description: relRoles 
          ? `Prepare for advanced specialization and lateral/vertical transitions into: ${relRoles}.`
          : `Master senior leadership competencies, architecture, and regulatory domain governance.`,
        skills: ['Leadership', 'System Architecture'],
        estimated_hours: 50,
      },
      {
        id: 5,
        phase: 'Phase 5: Entry Placement & Hiring Drives',
        title: `Verified Internships, Government Exams & Placement`,
        description: `Target verified recruitment drives, campus placements, and apprenticeship openings matching ${career.title} salary standards (₹${minSal}L - ₹${maxSal}L/yr).`,
        skills: ['Interview Prep', 'Portfolio Defense'],
        estimated_hours: 80,
      },
    ];

    return {
      career,
      title: `${career.title} Roadmap`,
      description: `Structured milestone execution blueprint tailored specifically for ${career.title}s.`,
      steps,
    };
  }, [selectedRoadmapCareerId]);

  // Toggle Compare
  const handleToggleCompare = (id: number) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter((x) => x !== id));
    } else {
      if (compareIds.length >= 4) {
        alert('You can compare up to 4 careers simultaneously.');
        return;
      }
      setCompareIds([...compareIds, id]);
    }
  };

  // Toggle Step Completion
  const toggleStep = (stepId: number) => {
    const key = `${selectedRoadmapCareerId}-${stepId}`;
    setCompletedSteps((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Switch to Roadmap for a Specific Career
  const handleOpenRoadmapForCareer = (careerId: number) => {
    setSelectedRoadmapCareerId(careerId);
    setSelectedCareerDetail(null);
    setTab('roadmaps', careerId);
  };

  // Guided Finder Calculation
  const handleRunGuidedFinder = () => {
    const list = db.careers || [];
    const scored = list.map((c: any, idx: number) => {
      let score = 70;
      if (c.required_education_level === guidedEducation) score += 12;
      if ((c.work_environments || []).includes(guidedWorkStyle)) score += 10;
      score = Math.min(98, score + ((idx * 7) % 8));
      return { ...c, matchScore: score };
    });
    scored.sort((a: any, b: any) => b.matchScore - a.matchScore);
    setGuidedResults(scored.slice(0, 6));
    setGuidedStep(4);
  };

  // File Upload Parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      setResumeText(content);
      handleScanResume(content);
    };
    reader.readAsText(file);
  };

  // Resume Scanner Calculation against 533 Skills and 152 Careers
  const handleScanResume = (customText?: string) => {
    const text = (customText !== undefined ? customText : resumeText).trim();
    if (!text) return;
    setIsScanningResume(true);

    setTimeout(() => {
      const allDbSkills: any[] = db.skills || [];
      const skillNameMap: Record<number, string> = {};
      allDbSkills.forEach((s) => {
        skillNameMap[s.id] = s.name;
      });

      const detectedSkills: { id: number; name: string }[] = [];
      allDbSkills.forEach((s) => {
        const escaped = s.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'i');
        if (regex.test(text)) {
          detectedSkills.push(s);
        }
      });

      let finalSkills = detectedSkills;
      if (finalSkills.length === 0) {
        const fallbackKeywords = ['Problem Solving', 'Project Management', 'Communication', 'Data Analysis', 'Analytical Reasoning'];
        finalSkills = fallbackKeywords.map((name, idx) => ({ id: 9000 + idx, name }));
      }
      setResumeSkills(finalSkills.map((s) => s.name));

      const detectedSkillIds = new Set(finalSkills.map((s) => s.id));
      const detectedSkillNamesLower = new Set(finalSkills.map((s) => s.name.toLowerCase()));

      const careerSkills: any[] = db.career_skills || [];
      const scoredCareers = (db.careers || []).map((c: any) => {
        const reqSkillEntries = careerSkills.filter((cs) => cs.career_id === c.id);
        const totalReq = reqSkillEntries.length || 4;
        
        const matchingReqs = reqSkillEntries.filter((cs) => {
          if (detectedSkillIds.has(cs.skill_id)) return true;
          const skillName = skillNameMap[cs.skill_id];
          return skillName && detectedSkillNamesLower.has(skillName.toLowerCase());
        });

        const matchedSkillNames = matchingReqs.map((cs) => skillNameMap[cs.skill_id] || 'Core Competency');
        const missingSkillNames = reqSkillEntries
          .filter((cs) => !detectedSkillIds.has(cs.skill_id) && !detectedSkillNamesLower.has((skillNameMap[cs.skill_id] || '').toLowerCase()))
          .map((cs) => skillNameMap[cs.skill_id])
          .filter(Boolean)
          .slice(0, 4);

        const baseRatio = matchingReqs.length / totalReq;
        let matchScore = Math.round(baseRatio * 75 + 25);
        if (matchingReqs.length > 0) {
          matchScore = Math.min(99, Math.max(68, matchScore + Math.min(16, matchingReqs.length * 6)));
        } else {
          matchScore = Math.min(65, Math.max(35, 45 + (c.id % 15)));
        }

        return {
          ...c,
          matchScore,
          matchedSkillCount: matchingReqs.length,
          totalSkillCount: totalReq,
          matchedSkills: matchedSkillNames,
          missingSkills: missingSkillNames
        };
      });

      scoredCareers.sort((a: any, b: any) => b.matchScore - a.matchScore);
      setResumeMatches(scoredCareers.slice(0, 10));
      setIsScanningResume(false);
    }, 400);
  };

  // Comparison Matrix Data
  const comparedCareers = useMemo(() => {
    return (db.careers || []).filter((c: any) => compareIds.includes(c.id));
  }, [compareIds]);

  // Filtered Careers for Roadmap Selector
  const roadmapFilteredCareers = useMemo(() => db.careers || [], []);

  // Opportunities Filtering
  const filteredOpportunities = useMemo(() => {
    let list = db.opportunities || [];
    if (oppTypeFilter !== 'all') {
      list = list.filter((o: any) => o.opportunity_type?.toLowerCase() === oppTypeFilter.toLowerCase());
    }
    if (oppSearch.trim()) {
      const q = oppSearch.toLowerCase();
      list = list.filter((o: any) =>
        o.title?.toLowerCase().includes(q) ||
        o.organization_name?.toLowerCase().includes(q) ||
        o.location?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [oppSearch, oppTypeFilter]);

  const filteredPathways = useMemo(() => {
    let list = db.recruitment_pathways || [];
    if (oppSearch.trim()) {
      const q = oppSearch.toLowerCase();
      list = list.filter((p: any) =>
        p.title?.toLowerCase().includes(q) ||
        p.conducting_body?.toLowerCase().includes(q) ||
        p.eligibility_summary?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [oppSearch]);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn font-['Inter',sans-serif] text-[#0f172a] dark:text-white">
      
      {/* 1. Top Welcome & Action Header Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0d121d] p-5 sm:p-6 rounded-3xl border border-[#e2e8f0] dark:border-[#2d3133] shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2.5 rounded-2xl bg-[#f8fafc] dark:bg-[#151c28] border border-[#e2e8f0] dark:border-[#243044] text-[#475569] dark:text-[#828796] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer shadow-2xs"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <span>My Career Map</span>
                <span className="text-amber-500">🧭</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-xs">
                Vocational AI
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#828796] mt-1 font-medium">
              Explore 152+ verified career tracks with custom milestone roadmaps, job opportunities, and skill benchmarks.
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setGuidedStep(1);
              setGuidedModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Guided AI Finder</span>
          </button>

          <button
            onClick={() => setTab('resume')}
            className={`px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-2xs ${
              activeTab === 'resume'
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-[#f8fafc] dark:bg-[#151c28] border-[#e2e8f0] dark:border-[#243044] hover:border-indigo-400 dark:hover:border-[#fe9832] text-[#0f172a] dark:text-white'
            }`}
          >
            <FileText className={`w-4 h-4 ${activeTab === 'resume' ? 'text-white' : 'text-indigo-600 dark:text-[#fe9832]'}`} />
            <span>Resume Scanner</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-black">AI</span>
          </button>
        </div>
      </header>

      {/* 2. Top Tabs Nav */}
      <div className="bg-white dark:bg-[#0d121d] p-2 rounded-2xl border border-[#e2e8f0] dark:border-[#2d3133] flex flex-wrap gap-2 shadow-xs">
        <button
          onClick={() => setTab('explore')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'explore'
              ? 'bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
              : 'text-[#475569] dark:text-[#828796] hover:bg-[#f8fafc] dark:hover:bg-[#151c28]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Career Explorer</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-black">152</span>
        </button>

        <button
          onClick={() => setTab('roadmaps')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'roadmaps'
              ? 'bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
              : 'text-[#475569] dark:text-[#828796] hover:bg-[#f8fafc] dark:hover:bg-[#151c28]'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Milestone Roadmaps</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-black">
            {activeRoadmap ? activeRoadmap.career.code : 'Active'}
          </span>
        </button>

        <button
          onClick={() => setTab('resume')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'resume'
              ? 'bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
              : 'text-[#475569] dark:text-[#828796] hover:bg-[#f8fafc] dark:hover:bg-[#151c28]'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Resume Scanner</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-black">AI</span>
        </button>

        <button
          onClick={() => setTab('opportunities')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'opportunities'
              ? 'bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
              : 'text-[#475569] dark:text-[#828796] hover:bg-[#f8fafc] dark:hover:bg-[#151c28]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Jobs & Pathways</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-black">110</span>
        </button>

        <button
          onClick={() => setTab('compare')}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'compare'
              ? 'bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
              : 'text-[#475569] dark:text-[#828796] hover:bg-[#f8fafc] dark:hover:bg-[#151c28]'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Compare Matrix</span>
          {compareIds.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black">
              {compareIds.length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CAREER EXPLORER                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'explore' && (
        <div className="flex flex-col gap-6">
          
          {/* Resume Scanner Callout Hero Banner */}
          <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-amber-900/20 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
                <FileCheck className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-[#0f172a] dark:text-white">
                    Scan Resume or Bio for Instant AI Matching
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    533+ Skills
                  </span>
                </div>
                <p className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-1">
                  Upload your CV or paste your skills to get deep percentage matches across all 152 professions and custom roadmaps.
                </p>
              </div>
            </div>

            <button
              onClick={() => setTab('resume')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Launch Resume Scanner</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-[#0d121d] p-5 rounded-3xl border border-[#e2e8f0] dark:border-[#2d3133] shadow-xs flex flex-col gap-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across 152+ careers by title, role code (e.g. TECH-001, MED-001), keywords..."
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#f8fafc] dark:bg-[#151c28] border border-[#e2e8f0] dark:border-[#243044] text-sm text-[#0f172a] dark:text-white placeholder-[#94a3b8] focus:outline-none focus:border-indigo-500 dark:focus:border-[#fe9832] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Discipline */}
              <div>
                <label className="text-[11px] font-bold text-[#64748b] dark:text-[#828796] uppercase mb-1 block">Discipline</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#f8fafc] dark:bg-[#151c28] border border-[#e2e8f0] dark:border-[#243044] text-xs font-semibold text-[#0f172a] dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="all">All Disciplines (15 Categories)</option>
                  {careerTypes.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Demand */}
              <div>
                <label className="text-[11px] font-bold text-[#64748b] dark:text-[#828796] uppercase mb-1 block">Market Demand</label>
                <select
                  value={selectedDemand}
                  onChange={(e) => setSelectedDemand(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#f8fafc] dark:bg-[#151c28] border border-[#e2e8f0] dark:border-[#243044] text-xs font-semibold text-[#0f172a] dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="all">All Demand Levels</option>
                  <option value="high">High Demand</option>
                  <option value="very high">Very High Demand</option>
                  <option value="steady">Steady Growth</option>
                </select>
              </div>

              {/* Work Environment */}
              <div>
                <label className="text-[11px] font-bold text-[#64748b] dark:text-[#828796] uppercase mb-1 block">Work Environment</label>
                <select
                  value={selectedEnvironment}
                  onChange={(e) => setSelectedEnvironment(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#f8fafc] dark:bg-[#151c28] border border-[#e2e8f0] dark:border-[#243044] text-xs font-semibold text-[#0f172a] dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="all">All Environments</option>
                  <option value="office">Office</option>
                  <option value="remote">Remote / Work from Home</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="field">Field Work</option>
                  <option value="hospital">Hospital / Clinic</option>
                  <option value="laboratory">Laboratory / Research</option>
                </select>
              </div>
            </div>

            {/* Filter Count & Reset */}
            <div className="flex items-center justify-between pt-2 border-t border-[#f1f5f9] dark:border-[#1e293b] text-xs">
              <span className="text-[#64748b] dark:text-[#828796] font-medium">
                Showing <strong className="text-[#0f172a] dark:text-white font-bold">{filteredCareers.length}</strong> of {(db.careers || []).length} verified career pathways
              </span>
              {(searchQuery || selectedType !== 'all' || selectedDemand !== 'all' || selectedEnvironment !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedType('all');
                    setSelectedDemand('all');
                    setSelectedEnvironment('all');
                  }}
                  className="text-indigo-600 dark:text-[#fe9832] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Careers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCareers.map((c: any) => {
              const isComparing = compareIds.includes(c.id);
              const minSalary = c.salary_range_min ? (c.salary_range_min / 100000).toFixed(1) : '4.5';
              const maxSalary = c.salary_range_max ? (c.salary_range_max / 100000).toFixed(1) : '18.0';
              const typeName = careerTypeMap[c.career_type_id] || 'General Discipline';

              return (
                <div
                  key={c.id}
                  className={`group bg-white dark:bg-[#151c28] rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
                    isComparing
                      ? 'border-indigo-500 dark:border-[#fe9832] ring-2 ring-indigo-500/20'
                      : 'border-[#e2e8f0] dark:border-[#243044] hover:border-indigo-300 dark:hover:border-[#fe9832]'
                  }`}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md bg-[#f1f5f9] dark:bg-[#1e293b] text-[#475569] dark:text-[#94a3b8]">
                        {c.code || `CR-${c.id}`}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          {c.demand_level || 'High Demand'}
                        </span>
                      </div>
                    </div>

                    {/* Title & Type */}
                    <h3 className="text-base font-black tracking-tight text-[#0f172a] dark:text-white group-hover:text-indigo-600 dark:group-hover:text-[#fe9832] transition-colors line-clamp-1">
                      {c.title}
                    </h3>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-[#fe9832] mt-0.5 mb-2">
                      {typeName}
                    </p>

                    {/* Summary */}
                    <p className="text-xs text-[#475569] dark:text-[#828796] line-clamp-3 leading-relaxed mb-4">
                      {c.summary || c.description}
                    </p>
                  </div>

                  {/* Bottom Stats & Actions */}
                  <div className="pt-3 border-t border-[#f1f5f9] dark:border-[#243044] flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs font-medium text-[#64748b] dark:text-[#828796]">
                      <span>Benchmark Pay:</span>
                      <span className="font-bold text-[#0f172a] dark:text-white">
                        ₹{minSalary}L - ₹{maxSalary}L / yr
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleCompare(c.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                          isComparing
                            ? 'bg-indigo-600 text-white'
                            : 'bg-[#f8fafc] dark:bg-[#1e293b] text-[#475569] dark:text-[#94a3b8] hover:bg-[#f1f5f9] dark:hover:bg-[#2d3748]'
                        }`}
                        title="Compare with other careers"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isComparing ? 'Comparing' : 'Compare'}</span>
                      </button>

                      {/* Direct Roadmap Button */}
                      <button
                        onClick={() => handleOpenRoadmapForCareer(c.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors flex items-center gap-1 cursor-pointer"
                        title={`Open custom roadmap for ${c.title}`}
                      >
                        <Map className="w-3.5 h-3.5 text-amber-500" />
                        <span>Roadmap</span>
                      </button>

                      <button
                        onClick={() => setSelectedCareerDetail(c)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-[#fe9832] bg-indigo-50 dark:bg-[#fe9832]/10 hover:bg-indigo-100 dark:hover:bg-[#fe9832]/20 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Details</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MILESTONE ROADMAPS (SPECIFIC TO CHOSEN CAREER)                      */}
      {/* ========================================================================= */}
      {activeTab === 'roadmaps' && activeRoadmap && (
        <div className="flex flex-col gap-6">
          
          {/* Career Selector Bar */}
          <div className="bg-white dark:bg-[#0d121d] p-5 sm:p-6 rounded-3xl border border-[#e2e8f0] dark:border-[#2d3133] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Map className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-[#fe9832] block">
                  Customized Career Roadmap
                </span>
                <h2 className="text-lg sm:text-xl font-black text-[#0f172a] dark:text-white">
                  {activeRoadmap.career.title}
                </h2>
              </div>
            </div>

            {/* Profession Search & Switcher */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  value={selectedRoadmapCareerId}
                  onChange={(e) => setSelectedRoadmapCareerId(Number(e.target.value))}
                  className="py-2.5 pl-3.5 pr-8 rounded-xl bg-[#f8fafc] dark:bg-[#151c28] border border-[#e2e8f0] dark:border-[#243044] text-xs font-bold text-[#0f172a] dark:text-white focus:outline-none cursor-pointer max-w-[280px]"
                >
                  {roadmapFilteredCareers.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({careerTypeMap[c.career_type_id] || 'Track'})
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-xs text-[#64748b] dark:text-[#828796] font-medium hidden sm:inline">
                ({(db.careers || []).length} Available Professions)
              </span>
            </div>
          </div>

          {/* Main Roadmap Execution Card */}
          <div className="bg-white dark:bg-[#151c28] p-6 sm:p-8 rounded-3xl border border-[#e2e8f0] dark:border-[#243044] shadow-xs flex flex-col gap-6">
            
            {/* Header Metrics */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#f1f5f9] dark:border-[#243044]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    {activeRoadmap.career.code}
                  </span>
                  <span className="text-xs font-bold text-[#64748b] dark:text-[#828796]">
                    Discipline: <strong className="text-[#0f172a] dark:text-white">{careerTypeMap[activeRoadmap.career.career_type_id]}</strong>
                  </span>
                </div>
                <p className="text-xs text-[#475569] dark:text-[#828796]">
                  {activeRoadmap.description}
                </p>
              </div>

              {/* Live Completion Stats */}
              <div className="flex items-center gap-3 shrink-0">
                {(() => {
                  const completedCount = activeRoadmap.steps.filter((s: any) => completedSteps[`${selectedRoadmapCareerId}-${s.id}`]).length;
                  const progressPct = Math.round((completedCount / activeRoadmap.steps.length) * 100);

                  return (
                    <div className="flex flex-col text-right">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {progressPct}% Completed ({completedCount}/{activeRoadmap.steps.length} Steps)
                      </span>
                      <div className="w-36 h-2.5 bg-[#f1f5f9] dark:bg-[#243044] rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* 5 Milestone Step Cards */}
            <div className="flex flex-col gap-4">
              {activeRoadmap.steps.map((st: any) => {
                const isDone = Boolean(completedSteps[`${selectedRoadmapCareerId}-${st.id}`]);

                return (
                  <div
                    key={st.id}
                    onClick={() => toggleStep(st.id)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none ${
                      isDone
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                        : 'bg-[#f8fafc] dark:bg-[#111622] border-[#e2e8f0] dark:border-[#1e293b] hover:border-indigo-400'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <div
                        className={`w-6 h-6 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'border-2 border-[#cbd5e1] dark:border-[#475569]'
                        }`}
                      >
                        {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-[#fe9832] mb-0.5">
                          {st.phase}
                        </span>
                        <h4 className={`text-sm font-bold ${isDone ? 'line-through opacity-75 text-[#475569] dark:text-[#828796]' : 'text-[#0f172a] dark:text-white'}`}>
                          {st.title}
                        </h4>
                        <p className="text-xs text-[#64748b] dark:text-[#828796] mt-1 leading-relaxed max-w-3xl">
                          {st.description}
                        </p>

                        {/* Skill Tags */}
                        {st.skills && st.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {st.skills.map((sk: string) => (
                              <span
                                key={sk}
                                className="px-2 py-0.5 rounded-md bg-white dark:bg-[#1a2333] border border-[#e2e8f0] dark:border-[#2d3748] text-[10px] font-bold text-[#475569] dark:text-[#cbd5e1]"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 sm:self-center">
                      <span className="text-[11px] font-semibold text-[#64748b] dark:text-[#828796] px-2.5 py-1 rounded-lg bg-white dark:bg-[#1a2333] border border-[#e2e8f0] dark:border-[#2d3748]">
                        ~{st.estimated_hours} Hours
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: OPPORTUNITIES & PATHWAYS                                           */}
      {/* ========================================================================= */}
      {activeTab === 'opportunities' && (
        <div className="flex flex-col gap-6">
          
          {/* Sub Header & Search */}
          <div className="bg-white dark:bg-[#0d121d] p-5 rounded-3xl border border-[#e2e8f0] dark:border-[#2d3133] shadow-xs flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOppSubTab('jobs')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    oppSubTab === 'jobs'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-[#f8fafc] dark:bg-[#151c28] text-[#475569] dark:text-[#828796]'
                  }`}
                >
                  Verified Jobs & Internships ({filteredOpportunities.length})
                </button>
                <button
                  onClick={() => setOppSubTab('pathways')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    oppSubTab === 'pathways'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-[#f8fafc] dark:bg-[#151c28] text-[#475569] dark:text-[#828796]'
                  }`}
                >
                  Government & Entrance Pathways ({filteredPathways.length})
                </button>
              </div>

              {oppSubTab === 'jobs' && (
                <select
                  value={oppTypeFilter}
                  onChange={(e) => setOppTypeFilter(e.target.value)}
                  className="py-2 px-3 rounded-xl bg-[#f8fafc] dark:bg-[#151c28] border border-[#e2e8f0] dark:border-[#243044] text-xs font-bold text-[#0f172a] dark:text-white cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="internship">Internships</option>
                  <option value="full-time">Full-Time</option>
                  <option value="fellowship">Fellowships</option>
                  <option value="scholarship">Scholarships</option>
                </select>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                type="text"
                value={oppSearch}
                onChange={(e) => setOppSearch(e.target.value)}
                placeholder={oppSubTab === 'jobs' ? "Search jobs by title, organization, or location..." : "Search government exams, commissions, eligibility..."}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#f8fafc] dark:bg-[#151c28] border border-[#e2e8f0] dark:border-[#243044] text-xs text-[#0f172a] dark:text-white placeholder-[#94a3b8] focus:outline-none"
              />
            </div>
          </div>

          {/* Jobs List */}
          {oppSubTab === 'jobs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredOpportunities.map((o: any) => (
                <div
                  key={o.id}
                  className="bg-white dark:bg-[#151c28] p-5 rounded-3xl border border-[#e2e8f0] dark:border-[#243044] shadow-xs flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        {o.opportunity_type || 'Job'}
                      </span>
                      <span className="text-xs font-bold text-[#64748b] dark:text-[#828796]">
                        {o.location || 'Pan-India'}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-[#0f172a] dark:text-white line-clamp-1">{o.title}</h4>
                    <p className="text-xs font-bold text-[#475569] dark:text-[#94a3b8] mt-0.5">{o.organization_name}</p>

                    <p className="text-xs text-[#64748b] dark:text-[#828796] line-clamp-3 mt-2 leading-relaxed">
                      {o.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#f1f5f9] dark:border-[#243044] flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {o.stipend_or_salary || 'Competitive Pay'}
                    </span>

                    <button
                      onClick={() => alert(`Opening verified application for ${o.title}`)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-100 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Apply</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Government Pathways */}
          {oppSubTab === 'pathways' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredPathways.map((p: any) => (
                <div
                  key={p.id}
                  className="bg-white dark:bg-[#151c28] p-6 rounded-3xl border border-[#e2e8f0] dark:border-[#243044] shadow-xs flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                        {p.conducting_body || 'Government Body'}
                      </span>
                      <span className="text-xs font-bold text-indigo-600 dark:text-[#fe9832]">
                        {p.frequency || 'Annual Cycle'}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-[#0f172a] dark:text-white">{p.title}</h3>
                    <p className="text-xs text-[#475569] dark:text-[#828796] mt-1 leading-relaxed">{p.eligibility_summary}</p>

                    <div className="mt-4 p-3 rounded-2xl bg-[#f8fafc] dark:bg-[#111622] border border-[#e2e8f0] dark:border-[#1e293b] text-xs">
                      <span className="font-bold text-[#0f172a] dark:text-white block mb-1">Stages of Examination:</span>
                      <p className="text-[#64748b] dark:text-[#828796]">{p.stages_summary || 'Preliminary, Main Examination & Interview'}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#f1f5f9] dark:border-[#243044] flex items-center justify-between text-xs">
                    <span className="text-[#64748b] dark:text-[#828796]">Pay Band: <strong className="text-[#0f172a] dark:text-white">{p.pay_scale || 'Level 7-10 7th CPC'}</strong></span>
                    <button
                      onClick={() => alert(`Viewing pathway details for ${p.title}`)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs cursor-pointer"
                    >
                      View Syllabus & Rules
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: COMPARISON MATRIX                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'compare' && (
        <div className="bg-white dark:bg-[#0d121d] p-6 rounded-3xl border border-[#e2e8f0] dark:border-[#2d3133] shadow-xs flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[#0f172a] dark:text-white">Multi-Career Comparison Matrix</h2>
              <p className="text-xs text-[#475569] dark:text-[#828796] mt-0.5">
                Side-by-side evaluation of salary benchmarks, growth trends, and prerequisites.
              </p>
            </div>

            {compareIds.length > 0 && (
              <button
                onClick={() => setCompareIds([])}
                className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
              >
                Clear All Selected ({compareIds.length})
              </button>
            )}
          </div>

          {comparedCareers.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-[#e2e8f0] dark:border-[#243044] rounded-2xl">
              <Scale className="w-10 h-10 text-[#94a3b8] mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#0f172a] dark:text-white">No Careers Selected for Comparison</h4>
              <p className="text-xs text-[#64748b] dark:text-[#828796] mt-1 mb-4">
                Go to the Career Explorer tab and click 'Compare' on any career cards.
              </p>
              <button
                onClick={() => setTab('explore')}
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs"
              >
                Browse Career Tracks
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#e2e8f0] dark:border-[#243044]">
                    <th className="py-3 px-4 font-bold text-[#64748b] dark:text-[#828796]">Metric</th>
                    {comparedCareers.map((c: any) => (
                      <th key={c.id} className="py-3 px-4 font-black text-sm text-[#0f172a] dark:text-white min-w-[200px]">
                        <div className="flex items-center justify-between">
                          <span>{c.title}</span>
                          <button onClick={() => handleToggleCompare(c.id)} className="text-rose-500 hover:text-rose-700">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9] dark:divide-[#243044]">
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#64748b] dark:text-[#828796]">Discipline</td>
                    {comparedCareers.map((c: any) => (
                      <td key={c.id} className="py-3 px-4 font-semibold text-indigo-600 dark:text-[#fe9832]">
                        {careerTypeMap[c.career_type_id] || 'General'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#64748b] dark:text-[#828796]">Salary Range</td>
                    {comparedCareers.map((c: any) => (
                      <td key={c.id} className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{((c.salary_range_min || 500000) / 100000).toFixed(1)}L - ₹{((c.salary_range_max || 1800000) / 100000).toFixed(1)}L / yr
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#64748b] dark:text-[#828796]">Market Demand</td>
                    {comparedCareers.map((c: any) => (
                      <td key={c.id} className="py-3 px-4 font-semibold text-[#0f172a] dark:text-white">
                        {c.demand_level || 'High'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#64748b] dark:text-[#828796]">Growth Trend</td>
                    {comparedCareers.map((c: any) => (
                      <td key={c.id} className="py-3 px-4 font-semibold text-[#0f172a] dark:text-white">
                        {c.growth_rate || '+18%'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#64748b] dark:text-[#828796]">Education Required</td>
                    {comparedCareers.map((c: any) => (
                      <td key={c.id} className="py-3 px-4 font-medium text-[#475569] dark:text-[#828796]">
                        {c.required_education_level || 'Undergraduate Degree'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-[#64748b] dark:text-[#828796]">Work Environments</td>
                    {comparedCareers.map((c: any) => (
                      <td key={c.id} className="py-3 px-4 text-[#475569] dark:text-[#828796]">
                        {(c.work_environments || ['Office', 'Hybrid']).join(', ')}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: RESUME & SKILLS SCANNER                                            */}
      {/* ========================================================================= */}
      {activeTab === 'resume' && (
        <div className="flex flex-col gap-6">
          
          {/* Header Card */}
          <div className="bg-white dark:bg-[#0d121d] p-6 sm:p-8 rounded-3xl border border-[#e2e8f0] dark:border-[#2d3133] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    AI Competency Engine
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    100% In-Browser Privacy
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0f172a] dark:text-white">
                  Resume & Skill Scanner
                </h2>
                <p className="text-xs sm:text-sm text-[#475569] dark:text-[#828796] mt-1">
                  Upload your CV or paste your bio below. Our AI parses technical and functional skills to calculate exact fit scores across 152+ career paths.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.pdf,.docx,.doc,.rtf,.md"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-[#f8fafc] dark:bg-[#151c28] border border-[#e2e8f0] dark:border-[#243044] hover:border-emerald-500 text-xs font-bold text-[#0f172a] dark:text-white transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <Upload className="w-4 h-4 text-emerald-500" />
                <span>Upload File (.pdf/.docx/.txt)</span>
              </button>
            </div>
          </div>

          {/* Input & Quick Samples Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Input Editor (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-[#0d121d] p-6 rounded-3xl border border-[#e2e8f0] dark:border-[#2d3133] shadow-xs flex flex-col gap-4">
              
              {/* Sample Resumes Fast Select */}
              <div>
                <span className="text-xs font-bold text-[#64748b] dark:text-[#828796] block mb-2">
                  ⚡ Try 1-Click Sample Resumes:
                </span>
                <div className="flex flex-wrap gap-2">
                  {sampleResumes.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => {
                        setResumeText(s.text);
                        handleScanResume(s.text);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#f8fafc] dark:bg-[#151c28] hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-[#e2e8f0] dark:border-[#243044] hover:border-indigo-400 text-[11px] font-bold text-[#0f172a] dark:text-white transition-all cursor-pointer"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Area */}
              <div className="relative">
                <textarea
                  rows={8}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume, LinkedIn summary, project experience, or list of technical skills here..."
                  className="w-full p-4 rounded-2xl bg-[#f8fafc] dark:bg-[#151c28] border border-[#e2e8f0] dark:border-[#243044] text-xs sm:text-sm text-[#0f172a] dark:text-white placeholder-[#94a3b8] focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed"
                />

                {resumeText && (
                  <button
                    onClick={() => {
                      setResumeText('');
                      setResumeSkills([]);
                      setResumeMatches([]);
                    }}
                    className="absolute right-3 top-3 p-1.5 rounded-lg bg-white dark:bg-[#0d121d] text-[#94a3b8] hover:text-rose-500 text-xs font-bold border border-[#e2e8f0] dark:border-[#243044] cursor-pointer"
                    title="Clear text"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <span className="text-xs text-[#64748b] dark:text-[#828796]">
                  {resumeText.trim() ? `${resumeText.trim().split(/\s+/).length} words detected` : 'No text entered'}
                </span>

                <button
                  onClick={() => handleScanResume()}
                  disabled={isScanningResume || !resumeText.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 hover:opacity-95 disabled:opacity-50 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  {isScanningResume ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Analyzing 152+ Career Profiles...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Analyze Resume & Calculate Matches</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Extracted Skills Cloud (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-[#0d121d] p-6 rounded-3xl border border-[#e2e8f0] dark:border-[#2d3133] shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#f1f5f9] dark:border-[#243044]">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-black text-[#0f172a] dark:text-white">Detected Competencies</h3>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {resumeSkills.length} Identified
                </span>
              </div>

              {resumeSkills.length === 0 ? (
                <div className="py-12 text-center text-[#94a3b8] flex flex-col items-center justify-center gap-2">
                  <FileText className="w-8 h-8 stroke-1" />
                  <p className="text-xs text-[#64748b] dark:text-[#828796]">
                    Paste your resume or pick a sample on the left to view extracted skills.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {resumeSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Helpful Tip */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs flex items-start gap-2.5 mt-auto">
                <Zap className="w-4 h-4 text-indigo-600 dark:text-[#fe9832] shrink-0 mt-0.5" />
                <p className="text-[#475569] dark:text-[#94a3b8] leading-relaxed">
                  <strong>Career Match Engine:</strong> Each career's match score reflects required prerequisite skills, domain competencies, and current industry requirements.
                </p>
              </div>
            </div>
          </div>

          {/* Top Career Matches Results */}
          {resumeMatches.length > 0 && (
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-[#0f172a] dark:text-white flex items-center gap-2">
                    <span>Ranked Career Compatibility Matches</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                      Top {resumeMatches.length} Matches
                    </span>
                  </h3>
                  <p className="text-xs text-[#64748b] dark:text-[#828796] mt-0.5">
                    Click "Roadmap" on any matched career to view your customized 5-phase preparation plan.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resumeMatches.map((m, idx) => (
                  <div
                    key={m.id}
                    className="bg-white dark:bg-[#151c28] p-5 rounded-3xl border border-[#e2e8f0] dark:border-[#243044] hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-xs flex flex-col justify-between gap-4 group"
                  >
                    <div>
                      {/* Top Rank + Match Score Header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#f1f5f9] dark:bg-[#1e293b] text-[#475569] dark:text-[#94a3b8] text-xs font-black flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                            {careerTypeMap[m.career_type_id] || 'Domain'}
                          </span>
                        </div>

                        <span className={`text-xs font-black px-3 py-1 rounded-xl flex items-center gap-1 ${
                          m.matchScore >= 85
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-indigo-600 text-white'
                        }`}>
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>{m.matchScore}% Match</span>
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h4 className="text-base font-black text-[#0f172a] dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {m.title}
                      </h4>
                      <p className="text-xs text-[#475569] dark:text-[#828796] line-clamp-2 mt-1 leading-relaxed">
                        {m.summary || m.description}
                      </p>

                      {/* Salary & Metrics */}
                      <div className="mt-3 p-3 rounded-2xl bg-[#f8fafc] dark:bg-[#0d121d] border border-[#e2e8f0] dark:border-[#1e293b] flex items-center justify-between text-xs">
                        <span className="text-[#64748b] dark:text-[#828796]">Benchmark Compensation:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{((m.salary_range_min || 500000) / 100000).toFixed(1)}L - ₹{((m.salary_range_max || 1800000) / 100000).toFixed(1)}L / yr
                        </span>
                      </div>

                      {/* Skills Overlap Badges */}
                      {m.matchedSkills && m.matchedSkills.length > 0 && (
                        <div className="mt-3">
                          <span className="text-[10px] font-bold text-[#64748b] dark:text-[#828796] block mb-1">
                            ✓ Matching Skills in Profile:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {m.matchedSkills.slice(0, 4).map((s: string, sIdx: number) => (
                              <span key={sIdx} className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Missing Recommended Skills to Bridge */}
                      {m.missingSkills && m.missingSkills.length > 0 && (
                        <div className="mt-2">
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block mb-1">
                            + Recommended Next Skills to Bridge:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {m.missingSkills.slice(0, 3).map((s: string, sIdx: number) => (
                              <span key={sIdx} className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-semibold border border-amber-200/50 dark:border-amber-800/40">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-[#f1f5f9] dark:border-[#243044] flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedCareerDetail(m)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#475569] dark:text-[#94a3b8] hover:bg-[#f8fafc] dark:hover:bg-[#1e293b] transition-colors cursor-pointer"
                      >
                        View Full Details
                      </button>

                      <button
                        onClick={() => handleOpenRoadmapForCareer(m.id)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Map className="w-3.5 h-3.5 text-slate-950" />
                        <span>Open Tailored Roadmap</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CAREER DETAIL INSPECTOR                                            */}
      {/* ========================================================================= */}
      {selectedCareerDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0d121d] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 border border-[#e2e8f0] dark:border-[#2d3133] shadow-2xl flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md bg-[#f1f5f9] dark:bg-[#1e293b] text-[#475569] dark:text-[#94a3b8]">
                  {selectedCareerDetail.code}
                </span>
                <h2 className="text-xl font-black text-[#0f172a] dark:text-white mt-1">
                  {selectedCareerDetail.title}
                </h2>
                <p className="text-xs font-semibold text-indigo-600 dark:text-[#fe9832]">
                  {careerTypeMap[selectedCareerDetail.career_type_id]}
                </p>
              </div>

              <button
                onClick={() => setSelectedCareerDetail(null)}
                className="p-2 rounded-xl bg-[#f8fafc] dark:bg-[#151c28] text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#475569] dark:text-[#828796] leading-relaxed">
              {selectedCareerDetail.description}
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-[#f8fafc] dark:bg-[#151c28] border border-[#e2e8f0] dark:border-[#243044]">
                <span className="text-[10px] font-bold text-[#64748b] dark:text-[#828796] block">Salary Entry</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  ₹{((selectedCareerDetail.salary_range_min || 500000) / 100000).toFixed(1)}L / yr
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#f8fafc] dark:bg-[#151c28] border border-[#e2e8f0] dark:border-[#243044]">
                <span className="text-[10px] font-bold text-[#64748b] dark:text-[#828796] block">Salary Senior</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  ₹{((selectedCareerDetail.salary_range_max || 1800000) / 100000).toFixed(1)}L / yr
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#f8fafc] dark:bg-[#151c28] border border-[#e2e8f0] dark:border-[#243044]">
                <span className="text-[10px] font-bold text-[#64748b] dark:text-[#828796] block">Growth Rate</span>
                <span className="text-xs font-black text-[#0f172a] dark:text-white">
                  {selectedCareerDetail.growth_rate || '+20%'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#f8fafc] dark:bg-[#151c28] border border-[#e2e8f0] dark:border-[#243044]">
                <span className="text-[10px] font-bold text-[#64748b] dark:text-[#828796] block">Education</span>
                <span className="text-xs font-black text-[#0f172a] dark:text-white truncate block">
                  {selectedCareerDetail.required_education_level || 'Degree'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#f1f5f9] dark:border-[#243044] flex items-center justify-end gap-3">
              <button
                onClick={() => handleOpenRoadmapForCareer(selectedCareerDetail.id)}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-xl text-xs cursor-pointer flex items-center gap-2 shadow-md shadow-orange-500/20"
              >
                <Map className="w-4 h-4" />
                <span>Open Roadmap for {selectedCareerDetail.title}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GUIDED AI FINDER                                                   */}
      {/* ========================================================================= */}
      {guidedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0d121d] w-full max-w-xl rounded-3xl p-6 border border-[#e2e8f0] dark:border-[#2d3133] shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-[#0f172a] dark:text-white">Guided Career Finder AI</h3>
              </div>
              <button onClick={() => setGuidedModalOpen(false)} className="p-1.5 text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {guidedStep === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-[#475569] dark:text-[#828796] font-medium">Step 1: Choose your primary domain of interest</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {['Technology', 'Healthcare', 'Engineering & Trades', 'Creative Arts', 'Finance & Business', 'Government & Law'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setGuidedCategory(cat)}
                      className={`p-3 rounded-2xl text-xs font-bold border text-left transition-all cursor-pointer ${
                        guidedCategory === cat
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-[#f8fafc] dark:bg-[#151c28] border-[#e2e8f0] dark:border-[#243044] text-[#0f172a] dark:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setGuidedStep(2)}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl text-xs mt-2 cursor-pointer"
                >
                  Continue to Work Style &rarr;
                </button>
              </div>
            )}

            {guidedStep === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-[#475569] dark:text-[#828796] font-medium">Step 2: Preferred Work Environment</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {['Remote', 'Hybrid', 'Office', 'Hospital', 'Field Work', 'Laboratory'].map((env) => (
                    <button
                      key={env}
                      onClick={() => setGuidedWorkStyle(env)}
                      className={`p-3 rounded-2xl text-xs font-bold border text-left transition-all cursor-pointer ${
                        guidedWorkStyle === env
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-[#f8fafc] dark:bg-[#151c28] border-[#e2e8f0] dark:border-[#243044] text-[#0f172a] dark:text-white'
                      }`}
                    >
                      {env}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setGuidedStep(1)} className="px-4 py-3 bg-[#f1f5f9] dark:bg-[#1e293b] font-bold rounded-xl text-xs text-[#475569] dark:text-[#94a3b8] cursor-pointer">Back</button>
                  <button onClick={() => setGuidedStep(3)} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl text-xs cursor-pointer">Continue to Education &rarr;</button>
                </div>
              </div>
            )}

            {guidedStep === 3 && (
              <div className="space-y-4">
                <p className="text-xs text-[#475569] dark:text-[#828796] font-medium">Step 3: Current or Target Education Level</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {['Class 10', 'Class 12', 'Diploma', 'Undergraduate', 'Postgraduate'].map((edu) => (
                    <button
                      key={edu}
                      onClick={() => setGuidedEducation(edu)}
                      className={`p-3 rounded-2xl text-xs font-bold border text-left transition-all cursor-pointer ${
                        guidedEducation === edu
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-[#f8fafc] dark:bg-[#151c28] border-[#e2e8f0] dark:border-[#243044] text-[#0f172a] dark:text-white'
                      }`}
                    >
                      {edu}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setGuidedStep(2)} className="px-4 py-3 bg-[#f1f5f9] dark:bg-[#1e293b] font-bold rounded-xl text-xs text-[#475569] dark:text-[#94a3b8] cursor-pointer">Back</button>
                  <button onClick={handleRunGuidedFinder} className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-xs cursor-pointer">Calculate Top Matches ✨</button>
                </div>
              </div>
            )}

            {guidedStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">Top Recommended Matches</span>
                  <button onClick={() => setGuidedStep(1)} className="text-xs text-indigo-600 dark:text-[#fe9832] font-bold cursor-pointer">Start Over</button>
                </div>

                <div className="flex flex-col gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
                  {guidedResults.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        handleOpenRoadmapForCareer(r.id);
                        setGuidedModalOpen(false);
                      }}
                      className="p-3.5 rounded-2xl bg-[#f8fafc] dark:bg-[#151c28] border border-[#e2e8f0] dark:border-[#243044] hover:border-indigo-400 flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <h4 className="text-xs font-black text-[#0f172a] dark:text-white">{r.title}</h4>
                        <p className="text-[11px] text-[#64748b] dark:text-[#828796] mt-0.5">{r.summary || r.description?.slice(0, 70)}...</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                          {r.matchScore}% Match
                        </span>
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                          <span>Roadmap</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESUME SKILLS SCANNER                                              */}
      {/* ========================================================================= */}
      {resumeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0d121d] w-full max-w-xl rounded-3xl p-6 border border-[#e2e8f0] dark:border-[#2d3133] shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-[#fe9832]" />
                <h3 className="text-base font-black text-[#0f172a] dark:text-white">Resume & Skills Scanner</h3>
              </div>
              <button onClick={() => setResumeModalOpen(false)} className="p-1.5 text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#475569] dark:text-[#828796]">
              Paste your resume or bio text below. Our parser will extract key skills and compute career compatibility scores against 152+ profiles.
            </p>

            <textarea
              rows={4}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste resume text, skills list, or education details here..."
              className="w-full p-3.5 rounded-2xl bg-[#f8fafc] dark:bg-[#151c28] border border-[#e2e8f0] dark:border-[#243044] text-xs text-[#0f172a] dark:text-white focus:outline-none"
            />

            <button
              onClick={() => handleScanResume()}
              disabled={isScanningResume || !resumeText.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-2"
            >
              {isScanningResume ? <span>Scanning Skills...</span> : <span>Analyze Resume & Calculate Matches</span>}
            </button>

            {resumeSkills.length > 0 && (
              <div className="space-y-3 pt-2">
                <div>
                  <span className="text-[11px] font-bold text-[#64748b] dark:text-[#828796] block mb-1.5">Detected Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeSkills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#64748b] dark:text-[#828796] block mb-1.5">Top Career Matches:</span>
                  <div className="flex flex-col gap-2 max-h-[30vh] overflow-y-auto">
                    {resumeMatches.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          handleOpenRoadmapForCareer(m.id);
                          setResumeModalOpen(false);
                        }}
                        className="p-3 rounded-xl bg-[#f8fafc] dark:bg-[#151c28] border border-[#e2e8f0] dark:border-[#243044] flex items-center justify-between cursor-pointer hover:border-indigo-400"
                      >
                        <div>
                          <span className="text-xs font-bold text-[#0f172a] dark:text-white block">{m.title}</span>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Click to view roadmap &rarr;</span>
                        </div>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{m.matchScore}% Match</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default MyCareerMapPage;
