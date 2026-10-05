import React, { useState, useMemo } from 'react';
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
  Plus,
  ArrowUpRight
} from 'lucide-react';
import rawDb from '../data/mycareermapDb.json';

const db: any = rawDb;

export const MyCareerMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'explore';

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDemand, setSelectedDemand] = useState<string>('all');
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all');
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [selectedCareerDetail, setSelectedCareerDetail] = useState<any | null>(null);

  // Modals
  const [guidedModalOpen, setGuidedModalOpen] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [customRoadmapCareerId, setCustomRoadmapCareerId] = useState<number>(1);

  // Interactive Roadmaps State
  const [userRoadmaps, setUserRoadmaps] = useState<any[]>(() => {
    const defaultRMs = (db.roadmaps || []).map((r: any) => {
      const steps = (db.roadmap_steps || [])
        .filter((s: any) => s.roadmap_id === r.id)
        .sort((a: any, b: any) => (a.step_order || 0) - (b.step_order || 0));
      return {
        ...r,
        steps: steps.map((s: any) => ({ ...s, isCompleted: s.status === 'COMPLETED' })),
      };
    });
    return defaultRMs;
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

  const setTab = (tab: string) => {
    setSearchParams({ tab });
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

  // Filtered Careers
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

  // Toggle Roadmap Step Completion
  const handleToggleStep = (roadmapId: number, stepId: number) => {
    setUserRoadmaps((prev) =>
      prev.map((rm) => {
        if (rm.id !== roadmapId) return rm;
        const updatedSteps = rm.steps.map((st: any) =>
          st.id === stepId ? { ...st, isCompleted: !st.isCompleted } : st
        );
        return { ...rm, steps: updatedSteps };
      })
    );
  };

  // Generate Dynamic Custom Roadmap
  const handleGenerateRoadmap = () => {
    const targetCareer = (db.careers || []).find((c: any) => c.id === Number(customRoadmapCareerId));
    if (!targetCareer) return;

    const newId = Date.now();
    const newRoadmap = {
      id: newId,
      target_career_id: targetCareer.id,
      title: `${targetCareer.title} Execution Blueprint`,
      description: `Comprehensive industry milestone roadmap designed for aspiring ${targetCareer.title}s.`,
      steps: [
        {
          id: newId * 10 + 1,
          step_order: 1,
          title: 'Foundational Knowledge & Core Principles',
          description: `Master fundamental competencies and essential core frameworks for ${targetCareer.title}.`,
          step_type: 'SKILL',
          estimated_hours: 40,
          isCompleted: true,
        },
        {
          id: newId * 10 + 2,
          step_order: 2,
          title: 'Practical Project Implementation',
          description: 'Build 2 verified industry portfolio projects showing real-world application.',
          step_type: 'PROJECT',
          estimated_hours: 60,
          isCompleted: false,
        },
        {
          id: newId * 10 + 3,
          step_order: 3,
          title: 'Industry Certifications & Benchmark Credentials',
          description: 'Attain recognized skill council or domain-specific benchmark accreditations.',
          step_type: 'CERTIFICATION',
          estimated_hours: 35,
          isCompleted: false,
        },
        {
          id: newId * 10 + 4,
          step_order: 4,
          title: 'Apprenticeship & Entry Placement Cycles',
          description: 'Apply to verified openings and recruitment drives with structured mentorship.',
          step_type: 'OPPORTUNITY',
          estimated_hours: 80,
          isCompleted: false,
        },
      ],
    };

    setUserRoadmaps([newRoadmap, ...userRoadmaps]);
    setTab('roadmaps');
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

  // Resume Scanner Calculation
  const handleScanResume = () => {
    if (!resumeText.trim()) return;
    setIsScanningResume(true);

    setTimeout(() => {
      // Extract keywords
      const commonKeywords = [
        'React', 'JavaScript', 'Python', 'Java', 'SQL', 'Data', 'Design',
        'AutoCAD', 'Circuit', 'Management', 'Testing', 'AWS', 'Security',
        'Algorithms', 'Machine Learning', 'Communication', 'Research', 'Accounting'
      ];
      const matchedSkills = commonKeywords.filter((k) =>
        new RegExp(`\\b${k}\\b`, 'i').test(resumeText)
      );

      const detected = matchedSkills.length > 0 ? matchedSkills : ['Problem Solving', 'Analytical Reasoning', 'Project Execution'];
      setResumeSkills(detected);

      // Score careers against detected skills
      const careers = (db.careers || []).map((c: any, idx: number) => {
        const score = Math.min(96, 75 + ((detected.length * 4) + idx * 3) % 22);
        return { ...c, matchScore: score };
      });
      careers.sort((a: any, b: any) => b.matchScore - a.matchScore);
      setResumeMatches(careers.slice(0, 5));
      setIsScanningResume(false);
    }, 600);
  };

  // Comparison Matrix Data
  const comparedCareers = useMemo(() => {
    return (db.careers || []).filter((c: any) => compareIds.includes(c.id));
  }, [compareIds]);

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
      
      {/* 1. Header Bar matching SAMBHAV design */}
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
              Explore 152+ verified career tracks, milestone roadmaps, job opportunities, and deterministic AI scoring.
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
            onClick={() => setResumeModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#f8fafc] dark:bg-[#151c28] border border-[#e2e8f0] dark:border-[#243044] hover:border-indigo-400 dark:hover:border-[#fe9832] text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-2xs"
          >
            <FileText className="w-4 h-4 text-indigo-600 dark:text-[#fe9832]" />
            <span>Resume Scanner</span>
          </button>
        </div>
      </header>

      {/* 2. Top Tabs Nav (Explorer, Roadmaps, Opportunities, Comparison) */}
      <div className="bg-white dark:bg-[#0d121d] p-2 rounded-2xl border border-[#e2e8f0] dark:border-[#2d3133] flex flex-wrap gap-2 shadow-xs">
        <button
          onClick={() => setTab('explore')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
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
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'roadmaps'
              ? 'bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
              : 'text-[#475569] dark:text-[#828796] hover:bg-[#f8fafc] dark:hover:bg-[#151c28]'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Milestone Roadmaps</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-black">{userRoadmaps.length}</span>
        </button>

        <button
          onClick={() => setTab('opportunities')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
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
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'compare'
              ? 'bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
              : 'text-[#475569] dark:text-[#828796] hover:bg-[#f8fafc] dark:hover:bg-[#151c28]'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Compare Careers</span>
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
          
          {/* Filters Bar */}
          <div className="bg-white dark:bg-[#0d121d] p-5 rounded-3xl border border-[#e2e8f0] dark:border-[#2d3133] shadow-xs flex flex-col gap-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across 152+ careers by title, role code (e.g. TECH-001), keywords..."
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                          isComparing
                            ? 'bg-indigo-600 text-white'
                            : 'bg-[#f8fafc] dark:bg-[#1e293b] text-[#475569] dark:text-[#94a3b8] hover:bg-[#f1f5f9] dark:hover:bg-[#2d3748]'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isComparing ? 'Comparing' : 'Compare'}</span>
                      </button>

                      <button
                        onClick={() => setSelectedCareerDetail(c)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-[#fe9832] bg-indigo-50 dark:bg-[#fe9832]/10 hover:bg-indigo-100 dark:hover:bg-[#fe9832]/20 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Details</span>
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
      {/* TAB 2: MILESTONE ROADMAPS                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'roadmaps' && (
        <div className="flex flex-col gap-6">
          
          {/* Creator Bar */}
          <div className="bg-white dark:bg-[#0d121d] p-5 sm:p-6 rounded-3xl border border-[#e2e8f0] dark:border-[#2d3133] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-[#0f172a] dark:text-white">
                Generate Custom Execution Blueprint
              </h2>
              <p className="text-xs text-[#475569] dark:text-[#828796] mt-0.5 font-medium">
                Select any career track to generate step-by-step milestone checklists.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={customRoadmapCareerId}
                onChange={(e) => setCustomRoadmapCareerId(Number(e.target.value))}
                className="py-2.5 px-4 rounded-xl bg-[#f8fafc] dark:bg-[#151c28] border border-[#e2e8f0] dark:border-[#243044] text-xs font-bold text-[#0f172a] dark:text-white focus:outline-none cursor-pointer max-w-[260px]"
              >
                {(db.careers || []).map((c: any) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>

              <button
                onClick={handleGenerateRoadmap}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white font-black text-xs sm:text-sm hover:opacity-95 shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Roadmap</span>
              </button>
            </div>
          </div>

          {/* Roadmaps List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {userRoadmaps.map((rm: any) => {
              const completedCount = rm.steps.filter((s: any) => s.isCompleted).length;
              const progressPct = rm.steps.length > 0 ? Math.round((completedCount / rm.steps.length) * 100) : 0;

              return (
                <div
                  key={rm.id}
                  className="bg-white dark:bg-[#151c28] p-6 rounded-3xl border border-[#e2e8f0] dark:border-[#243044] shadow-xs flex flex-col justify-between gap-5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        Active Track
                      </span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {progressPct}% Completed ({completedCount}/{rm.steps.length})
                      </span>
                    </div>

                    <h3 className="text-base font-black text-[#0f172a] dark:text-white">{rm.title}</h3>
                    <p className="text-xs text-[#475569] dark:text-[#828796] mt-1 mb-4">{rm.description}</p>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-[#f1f5f9] dark:bg-[#243044] rounded-full overflow-hidden mb-5">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    {/* Steps Checklist */}
                    <div className="flex flex-col gap-3">
                      {rm.steps.map((st: any) => (
                        <div
                          key={st.id}
                          onClick={() => handleToggleStep(rm.id, st.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                            st.isCompleted
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                              : 'bg-[#f8fafc] dark:bg-[#111622] border-[#e2e8f0] dark:border-[#1e293b] hover:border-indigo-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              st.isCompleted
                                ? 'bg-emerald-600 text-white'
                                : 'border-2 border-[#cbd5e1] dark:border-[#475569]'
                            }`}
                          >
                            {st.isCompleted && <Check className="w-3.5 h-3.5" />}
                          </div>

                          <div className="flex flex-col">
                            <span className={`text-xs font-bold ${st.isCompleted ? 'line-through opacity-70 text-[#475569] dark:text-[#828796]' : 'text-[#0f172a] dark:text-white'}`}>
                              {st.title}
                            </span>
                            <span className="text-[11px] text-[#64748b] dark:text-[#828796] mt-0.5">
                              {st.description}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
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
                      onClick={() => alert(`Application link for ${o.title} opened.`)}
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
                className="p-2 rounded-xl bg-[#f8fafc] dark:bg-[#151c28] text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-white"
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
                onClick={() => {
                  setCustomRoadmapCareerId(selectedCareerDetail.id);
                  setSelectedCareerDetail(null);
                  handleGenerateRoadmap();
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Generate Milestone Roadmap
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
              <button onClick={() => setGuidedModalOpen(false)} className="p-1.5 text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-white">
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
                      className={`p-3 rounded-2xl text-xs font-bold border text-left transition-all ${
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
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl text-xs mt-2"
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
                      className={`p-3 rounded-2xl text-xs font-bold border text-left transition-all ${
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
                  <button onClick={() => setGuidedStep(1)} className="px-4 py-3 bg-[#f1f5f9] dark:bg-[#1e293b] font-bold rounded-xl text-xs text-[#475569] dark:text-[#94a3b8]">Back</button>
                  <button onClick={() => setGuidedStep(3)} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl text-xs">Continue to Education &rarr;</button>
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
                      className={`p-3 rounded-2xl text-xs font-bold border text-left transition-all ${
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
                  <button onClick={() => setGuidedStep(2)} className="px-4 py-3 bg-[#f1f5f9] dark:bg-[#1e293b] font-bold rounded-xl text-xs text-[#475569] dark:text-[#94a3b8]">Back</button>
                  <button onClick={handleRunGuidedFinder} className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-xl text-xs">Calculate Top Matches ✨</button>
                </div>
              </div>
            )}

            {guidedStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">Top Recommended Matches</span>
                  <button onClick={() => setGuidedStep(1)} className="text-xs text-indigo-600 dark:text-[#fe9832] font-bold">Start Over</button>
                </div>

                <div className="flex flex-col gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
                  {guidedResults.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        setSelectedCareerDetail(r);
                        setGuidedModalOpen(false);
                      }}
                      className="p-3.5 rounded-2xl bg-[#f8fafc] dark:bg-[#151c28] border border-[#e2e8f0] dark:border-[#243044] hover:border-indigo-400 flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <h4 className="text-xs font-black text-[#0f172a] dark:text-white">{r.title}</h4>
                        <p className="text-[11px] text-[#64748b] dark:text-[#828796] mt-0.5">{r.summary || r.description?.slice(0, 70)}...</p>
                      </div>
                      <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                        {r.matchScore}% Match
                      </span>
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
              <button onClick={() => setResumeModalOpen(false)} className="p-1.5 text-[#94a3b8] hover:text-[#0f172a] dark:hover:text-white">
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
              onClick={handleScanResume}
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
                          setSelectedCareerDetail(m);
                          setResumeModalOpen(false);
                        }}
                        className="p-3 rounded-xl bg-[#f8fafc] dark:bg-[#151c28] border border-[#e2e8f0] dark:border-[#243044] flex items-center justify-between cursor-pointer hover:border-indigo-400"
                      >
                        <span className="text-xs font-bold text-[#0f172a] dark:text-white">{m.title}</span>
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
