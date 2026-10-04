import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Search,
  BookOpen,
  Briefcase,
  Cpu,
  Heart,
  Palette,
  Shield,
  Wrench,
  TrendingUp,
  X,
  FileText,
  Route,
  Plus,
  Check,
} from 'lucide-react';
import { careerService } from '../../services/careerService';
import { profileService } from '../../services/profileService';
import Button from './Button';
import Badge from './Badge';
import Card from './Card';
import LoadingSpinner from './LoadingSpinner';

const CAREER_CATEGORIES = [
  {
    id: 'Healthcare',
    name: 'Healthcare and Life Sciences',
    icon: Heart,
    desc: 'General Physician, Surgeon, Pharmacist, Nursing, Radiologist, Biomedical, and Public Health',
  },
  {
    id: 'Creative',
    name: 'Creative Arts and Design',
    icon: Palette,
    desc: 'Drawing, UI/UX Design, Illustration, Animation, 3D Modeling, and Architectural Drafting',
  },
  {
    id: 'Technology',
    name: 'Technology and Software',
    icon: Cpu,
    desc: 'Software Engineering, Cloud Infrastructure, Cybersecurity, AI/ML, and Data Systems',
  },
  {
    id: 'Business/Professional',
    name: 'Banking, Finance and Business',
    icon: TrendingUp,
    desc: 'Chartered Accountancy, Investment Banking, Financial Analysis, Management Consulting, and Law',
  },
  {
    id: 'Government Jobs',
    name: 'Government and Public Services',
    icon: Shield,
    desc: 'Civil Services (IAS/IPS/IFS), Defence Forces, Public Sector Banks, and State Examinations',
  },
  {
    id: 'Practical/Technical',
    name: 'Engineering and Technical Trades',
    icon: Wrench,
    desc: 'Industrial Robotics, CNC Machining, EV Systems, Solar PV, PLC/SCADA, and Automation',
  },
  {
    id: 'Academic',
    name: 'Science and Academic Research',
    icon: BookOpen,
    desc: 'Scientific Research, Physics, Molecular Biology, Mathematics, and University Education',
  },
  {
    id: 'Startup',
    name: 'Startups and Venture Building',
    icon: TrendingUp,
    desc: 'Product Management, Startup Founders, Venture Operations, and Business Scaling',
  },
];

const WORK_STYLES = ['Hospital/Clinic', 'Office', 'Hybrid', 'Remote', 'Field Work', 'Laboratory'];
const EDUCATION_LEVELS = ['Class 10', 'Class 12', 'Diploma', 'Undergraduate', 'Postgraduate', 'ITI'];

const CATEGORY_TABS = [
  'All',
  'Healthcare',
  'Creative',
  'Technology',
  'Business/Professional',
  'Practical/Technical',
  'Academic',
  'Government Jobs',
];

// Robust Domain Classifier for Career Tracks
export const getCareerDomain = (career) => {
  const code = (career.code || '').toUpperCase();
  const title = (career.title || '').toLowerCase();
  const desc = (career.description || '').toLowerCase();

  if (
    code.startsWith('MED-') ||
    title.includes('doctor') ||
    title.includes('physician') ||
    title.includes('surgeon') ||
    title.includes('pharmacist') ||
    title.includes('nursing') ||
    title.includes('radiologist') ||
    title.includes('dentist') ||
    title.includes('ayurvedic') ||
    title.includes('physiotherapist') ||
    title.includes('biomedical equipment') ||
    title.includes('epidemiologist') ||
    title.includes('dietitian') ||
    title.includes('psychiatrist') ||
    title.includes('medical') ||
    title.includes('hospital')
  ) {
    return 'Healthcare';
  }

  if (
    code.startsWith('CRE-') ||
    title.includes('designer') ||
    title.includes('artist') ||
    title.includes('drawing') ||
    title.includes('animation') ||
    title.includes('vfx') ||
    title.includes('cinematographer') ||
    title.includes('copywriter') ||
    title.includes('fashion') ||
    title.includes('music producer') ||
    title.includes('interior') ||
    title.includes('illustrator')
  ) {
    return 'Creative';
  }

  if (
    code.startsWith('TECH-') ||
    title.includes('software') ||
    title.includes('backend') ||
    title.includes('frontend') ||
    title.includes('devops') ||
    title.includes('cloud') ||
    title.includes('cyber security') ||
    title.includes('data platform') ||
    title.includes('machine learning') ||
    title.includes('ai research') ||
    title.includes('embedded systems')
  ) {
    return 'Technology';
  }

  if (
    code.startsWith('FIN-') ||
    (code.startsWith('BIZ-') && !code.startsWith('BIZ-001') && !code.startsWith('BIZ-002')) ||
    title.includes('accountant') ||
    title.includes('investment banking') ||
    title.includes('cfa') ||
    title.includes('actuary') ||
    title.includes('financial') ||
    title.includes('consultant') ||
    title.includes('venture capital') ||
    title.includes('supply chain') ||
    title.includes('legal counsel') ||
    title.includes('lawyer') ||
    title.includes('human resources')
  ) {
    return 'Business/Professional';
  }

  if (
    code.startsWith('GOV-') ||
    code.startsWith('DEF-') ||
    title.includes('ias') ||
    title.includes('ips') ||
    title.includes('ifs') ||
    title.includes('officer') ||
    title.includes('inspector') ||
    title.includes('isro') ||
    title.includes('drdo') ||
    title.includes('army') ||
    title.includes('navy') ||
    title.includes('air force') ||
    title.includes('police') ||
    title.includes('defence') ||
    title.includes('coast guard')
  ) {
    return 'Government Jobs';
  }

  if (
    code.startsWith('TRD-') ||
    title.includes('technician') ||
    title.includes('machinist') ||
    title.includes('welder') ||
    title.includes('powertrain') ||
    title.includes('solar') ||
    title.includes('plc') ||
    title.includes('scada') ||
    title.includes('aircraft maintenance') ||
    title.includes('drone pilot') ||
    title.includes('tool & die') ||
    title.includes('hvac') ||
    title.includes('mechatronics')
  ) {
    return 'Practical/Technical';
  }

  if (
    code.startsWith('SCI-') ||
    code.startsWith('EDU-') ||
    code.startsWith('AGR-') ||
    title.includes('scientist') ||
    title.includes('professor') ||
    title.includes('teacher') ||
    title.includes('astrophysicist') ||
    title.includes('mathematician') ||
    title.includes('biologist') ||
    title.includes('chemist') ||
    title.includes('geologist') ||
    title.includes('agronomist')
  ) {
    return 'Academic';
  }

  if (code.startsWith('BIZ-001') || code.startsWith('BIZ-002') || title.includes('startup') || title.includes('founder')) {
    return 'Startup';
  }

  return 'Technology';
};

export default function GuidedCareerFinderModal({ isOpen, onClose, onOpenResumeUpload }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Category, 2: Skills, 3: Work Style/Edu, 4: Matches
  const [selectedCategory, setSelectedCategory] = useState('Healthcare');
  const [activeCategoryTab, setActiveCategoryTab] = useState('Healthcare');
  const [allSkills, setAllSkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]); // [{ id, name, proficiency_level }]
  const [workStyle, setWorkStyle] = useState('Hospital/Clinic');
  const [educationLevel, setEducationLevel] = useState('Undergraduate');
  const [loading, setLoading] = useState(false);
  const [matchingResults, setMatchingResults] = useState([]);
  const [matchedOpportunities, setMatchedOpportunities] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadAllSkills();
    }
  }, [isOpen]);

  const loadAllSkills = async () => {
    try {
      const skills = await profileService.getSkills({ limit: 1000 });
      setAllSkills(skills || []);
    } catch (err) {
      console.error('Failed to load catalog skills:', err);
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setActiveCategoryTab(categoryId === 'Startup' ? 'All' : categoryId);
    if (categoryId === 'Healthcare') {
      setWorkStyle('Hospital/Clinic');
    } else if (categoryId === 'Creative' || categoryId === 'Technology') {
      setWorkStyle('Hybrid');
    } else if (categoryId === 'Government Jobs') {
      setWorkStyle('Office');
    }
  };

  const handleToggleSkill = (skill) => {
    const exists = selectedSkills.find(
      (s) => s.id === skill.id || s.name.toLowerCase() === skill.name.toLowerCase()
    );
    if (exists) {
      setSelectedSkills((prev) =>
        prev.filter(
          (s) => s.id !== skill.id && s.name.toLowerCase() !== skill.name.toLowerCase()
        )
      );
    } else {
      setSelectedSkills((prev) => [
        ...prev,
        { id: skill.id || Date.now(), name: skill.name, proficiency_level: 'intermediate' },
      ]);
    }
  };

  const handleAddCustomSkill = (customName) => {
    if (!customName.trim()) return;
    const trimmed = customName.trim();
    const exists = selectedSkills.find((s) => s.name.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      setSelectedSkills((prev) => [
        ...prev,
        { id: Date.now(), name: trimmed, proficiency_level: 'intermediate' },
      ]);
    }
    setSkillSearch('');
  };

  const handleUpdateSkillProficiency = (skillId, skillName, level) => {
    setSelectedSkills((prev) =>
      prev.map((s) =>
        s.id === skillId || s.name === skillName ? { ...s, proficiency_level: level } : s
      )
    );
  };

  // Filter skills by active tab and search query
  const filteredSkills = useMemo(() => {
    const query = skillSearch.trim().toLowerCase();
    return allSkills.filter((s) => {
      const matchesTab =
        activeCategoryTab === 'All' || s.category === activeCategoryTab;
      const matchesSearch =
        !query ||
        s.name.toLowerCase().includes(query) ||
        (s.category && s.category.toLowerCase().includes(query));
      return matchesTab && matchesSearch;
    });
  }, [allSkills, activeCategoryTab, skillSearch]);

  const handleCalculateMatches = async () => {
    setLoading(true);
    setStep(4);

    try {
      const careersData = await careerService.getCareers({ limit: 200 });
      const opportunitiesData = await careerService.getOpportunities({ limit: 100 });

      const skillIds = new Set(selectedSkills.map((s) => s.id));
      const skillNames = selectedSkills.map((s) => (s.name || '').toLowerCase().trim()).filter(Boolean);

      const scoredCareers = (careersData || []).map((career) => {
        const requiredSkills = career.career_skills || [];
        const domain = getCareerDomain(career);
        const isTargetDomain = domain === selectedCategory;

        let matchedCount = 0;
        let totalWeight = 0;
        let earnedWeight = 0;

        const strongMatches = [];
        const missingSkills = [];

        requiredSkills.forEach((cs) => {
          const weight = cs.importance_weight || 1.0;
          totalWeight += weight;
          const sName = (cs.skill?.name || '').toLowerCase().trim();
          const sId = cs.skill_id;

          let isMatched = skillIds.has(sId) || skillNames.includes(sName);

          if (!isMatched && sName) {
            isMatched = skillNames.some((uName) => {
              if (!uName) return false;
              if (uName === sName) return true;
              if (uName.length >= 4 && sName.includes(uName)) return true;
              if (sName.length >= 4 && uName.includes(sName)) return true;
              return false;
            });
          }

          if (isMatched) {
            matchedCount++;
            earnedWeight += weight;
            strongMatches.push(cs.skill?.name || 'Skill');
          } else {
            missingSkills.push(cs.skill?.name || 'Skill');
          }
        });

        const skillScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : (selectedSkills.length > 0 ? 20 : 40);
        const domainScore = isTargetDomain ? 90 : 15;
        const eduScore = career.required_education_level === educationLevel ? 100 : 70;
        const prefScore = (career.work_environments || []).includes(workStyle) ? 100 : 70;

        let compositeScore = Math.round(
          0.55 * skillScore + 0.25 * domainScore + 0.10 * eduScore + 0.10 * prefScore
        );

        // DETERMINISTIC ZERO-SKILL GATING
        if (totalWeight > 0 && matchedCount === 0) {
          compositeScore = Math.min(25, Math.max(10, Math.round(compositeScore * 0.32)));
        } else if (totalWeight > 0 && skillScore < 40) {
          compositeScore = Math.min(48, Math.max(26, Math.round(compositeScore * 0.65)));
        }

        return {
          ...career,
          domain_category: domain,
          is_target_domain: isTargetDomain,
          computed_match_score: compositeScore,
          skill_score: Math.round(skillScore),
          matched_skills: strongMatches,
          missing_skills: missingSkills,
          matched_count: matchedCount,
          total_required: requiredSkills.length,
        };
      });

      // Filter to prioritize the chosen category strictly
      const targetDomainCareers = scoredCareers.filter((c) => c.is_target_domain);
      const otherCareers = scoredCareers.filter((c) => !c.is_target_domain);

      targetDomainCareers.sort((a, b) => b.computed_match_score - a.computed_match_score);
      otherCareers.sort((a, b) => b.computed_match_score - a.computed_match_score);

      const finalRanked = [...targetDomainCareers, ...otherCareers];
      setMatchingResults(finalRanked.slice(0, 6));

      // Filter matching opportunities for the chosen category
      const matchedOpps = (opportunitiesData || []).filter((opp) => {
        const oType = (opp.opportunity_type || '').toLowerCase();
        const oTitle = (opp.title || '').toLowerCase();
        const oOrg = (opp.organization_name || '').toLowerCase();

        if (selectedCategory === 'Healthcare') {
          return (
            oTitle.includes('health') ||
            oTitle.includes('medical') ||
            oTitle.includes('clinical') ||
            oTitle.includes('pharma') ||
            oTitle.includes('research') ||
            oOrg.includes('health') ||
            oOrg.includes('hospital') ||
            oOrg.includes('aiims') ||
            oOrg.includes('icmr')
          );
        }
        if (selectedCategory === 'Creative') {
          return (
            oTitle.includes('design') ||
            oTitle.includes('writer') ||
            oTitle.includes('media') ||
            oTitle.includes('creative') ||
            oType.includes('freelance')
          );
        }
        if (selectedCategory === 'Government Jobs') {
          return (
            oType.includes('government') ||
            oTitle.includes('upsc') ||
            oTitle.includes('ssc') ||
            oTitle.includes('drdo') ||
            oTitle.includes('isro') ||
            oTitle.includes('bank')
          );
        }
        if (selectedCategory === 'Technology') {
          return (
            oTitle.includes('developer') ||
            oTitle.includes('software') ||
            oTitle.includes('devops') ||
            oTitle.includes('data') ||
            oTitle.includes('google')
          );
        }
        if (selectedCategory === 'Business/Professional') {
          return (
            oTitle.includes('finance') ||
            oTitle.includes('bank') ||
            oTitle.includes('consulting') ||
            oTitle.includes('fellowship')
          );
        }
        return true;
      });

      setMatchedOpportunities(matchedOpps.slice(0, 4));
    } catch (err) {
      console.error('Failed to compute matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmapForCareer = async (careerId, careerTitle) => {
    const token = localStorage.getItem('token');
    if (!token) {
      onClose();
      navigate('/login', { state: { message: 'Please create an account or sign in to save your personalized roadmap.' } });
      return;
    }

    try {
      await careerService.generateRoadmap(
        careerId,
        `Career Path: ${careerTitle}`,
        'Personalized progression roadmap'
      );
      onClose();
      navigate('/roadmap');
    } catch (err) {
      console.error('Failed to create roadmap', err);
      navigate(`/careers/${careerId}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Guided Career &amp; Job Matcher
                <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md">
                  Step {step} of 4
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {step === 1 && 'Step 1: Choose your target industry sector or domain'}
                {step === 2 && `Step 2: Select your skills & proficiencies in ${selectedCategory}`}
                {step === 3 && 'Step 3: Define work environment and education credentials'}
                {step === 4 && `Step 4: Top matching ${selectedCategory} career tracks and pathways`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* STEP 1: CATEGORY SELECTION */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-200">
                  Select Target Career Category:
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenResumeUpload) onOpenResumeUpload();
                  }}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 p-1 rounded-md hover:bg-slate-800"
                >
                  <FileText className="w-3.5 h-3.5" /> Auto-fill via Resume / CV &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {CAREER_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all text-left ${
                        isSelected
                          ? 'bg-slate-800 border-blue-500 shadow-sm ring-1 ring-blue-500/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-md bg-slate-900 border border-slate-700 flex items-center justify-center text-blue-400 mb-2.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h5 className="text-xs font-bold text-slate-100 flex items-center justify-between">
                        {cat.name}
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                      </h5>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: SKILLS SELECTION */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-200">
                    Select Your Skills in {selectedCategory}:
                  </h4>
                  <p className="text-xs text-slate-400">
                    Selected: <span className="text-blue-400 font-bold">{selectedSkills.length}</span> skills
                  </p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={`Search ${selectedCategory} skills...`}
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
                {CATEGORY_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveCategoryTab(tab)}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                      activeCategoryTab === tab
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Selected Skills Chips with Proficiency Select */}
              {selectedSkills.length > 0 && (
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-300">Selected Skills:</div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {selectedSkills.map((s) => (
                      <div
                        key={s.id || s.name}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-xs text-slate-200"
                      >
                        <span className="font-medium">{s.name}</span>
                        <select
                          value={s.proficiency_level}
                          onChange={(e) =>
                            handleUpdateSkillProficiency(s.id, s.name, e.target.value)
                          }
                          className="text-[10px] bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-blue-400 capitalize"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleToggleSkill(s)}
                          className="text-slate-400 hover:text-red-400 ml-1"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Skill Option */}
              {skillSearch.trim() && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-950/40 border border-blue-900/60 text-xs text-blue-300">
                  <span>Looking for custom skill: <strong>"{skillSearch.trim()}"</strong></span>
                  <button
                    type="button"
                    onClick={() => handleAddCustomSkill(skillSearch)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add to My Skills
                  </button>
                </div>
              )}

              {/* Skills Grid */}
              <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/60 max-h-64 overflow-y-auto">
                {filteredSkills.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 space-y-2">
                    <p>No catalog skills found matching "{skillSearch}".</p>
                    <button
                      type="button"
                      onClick={() => handleAddCustomSkill(skillSearch)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add "{skillSearch}" as custom skill
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {filteredSkills.map((skill) => {
                      const isChecked = selectedSkills.some(
                        (s) => s.id === skill.id || s.name.toLowerCase() === skill.name.toLowerCase()
                      );
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => handleToggleSkill(skill)}
                          className={`text-xs px-2.5 py-1.5 rounded-md font-medium border transition-all text-left ${
                            isChecked
                              ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                          }`}
                        >
                          {isChecked ? '✓ ' : '+ '}
                          {skill.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: WORK ENVIRONMENT & EDUCATION */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-slate-200 mb-2.5">
                  Preferred Work Environment:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {WORK_STYLES.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setWorkStyle(style)}
                      className={`p-3 rounded-lg border text-xs font-semibold text-center transition-colors ${
                        workStyle === style
                          ? 'bg-slate-800 border-blue-500 text-blue-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-200 mb-2.5">
                  Highest / Current Education:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {EDUCATION_LEVELS.map((edu) => (
                    <button
                      key={edu}
                      type="button"
                      onClick={() => setEducationLevel(edu)}
                      className={`p-3 rounded-lg border text-xs font-semibold text-center transition-colors ${
                        educationLevel === edu
                          ? 'bg-slate-800 border-blue-500 text-blue-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      {edu}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Ready to evaluate {selectedCategory} career alignment</span>
                </div>
                <Badge variant="primary" size="xs">
                  {selectedSkills.length} Skills Selected
                </Badge>
              </div>
            </div>
          )}

          {/* STEP 4: RESULTS */}
          {step === 4 && (
            <div className="space-y-5">
              {loading ? (
                <div className="py-12 flex items-center justify-center">
                  <LoadingSpinner size="lg" label={`Computing matches in ${selectedCategory}...`} />
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">
                      Top Matched Careers in {selectedCategory}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Deterministic match results for {selectedCategory} based on {selectedSkills.length} skills and {workStyle} preference.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {matchingResults.map((career) => {
                      const isHighMatch = career.computed_match_score >= 70 && career.matched_count > 0;
                      const isModMatch = career.computed_match_score >= 40 && career.matched_count > 0;
                      const scoreColor = isHighMatch
                        ? 'text-emerald-400'
                        : isModMatch
                        ? 'text-blue-400'
                        : 'text-slate-400';

                      const badgeVariant = isHighMatch ? 'green' : isModMatch ? 'primary' : 'default';
                      const badgeLabel = isHighMatch ? 'Strong Match' : isModMatch ? 'Moderate Match' : 'High Skill Gap';

                      return (
                        <Card key={career.id} className="p-4 flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Badge variant={career.is_target_domain ? 'primary' : 'default'} size="xs">
                                    {career.domain_category || selectedCategory}
                                  </Badge>
                                  <span className="text-[10px] font-mono text-slate-500">{career.code}</span>
                                </div>
                                <h5 className="font-bold text-sm text-slate-100">{career.title}</h5>
                                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                  {career.summary || career.description}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className={`text-base font-bold ${scoreColor}`}>
                                  {career.computed_match_score}%
                                </span>
                                <Badge variant={badgeVariant} size="xs" className="block mt-0.5">
                                  {badgeLabel}
                                </Badge>
                              </div>
                            </div>

                            <div className="mt-3 space-y-2 text-xs">
                              <div>
                                <div className="flex items-center justify-between text-[11px] mb-1">
                                  <div className="flex items-center gap-1.5 text-emerald-400">
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                    <span className="font-semibold">
                                      Matched Skills ({career.matched_skills.length}):
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-500">
                                    Skill Score: {career.skill_score || 0}%
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {career.matched_skills.slice(0, 4).map((s, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                                    >
                                      {s}
                                    </span>
                                  ))}
                                  {career.matched_skills.length === 0 && (
                                    <span className="text-[10px] text-slate-500 italic">No direct skill overlap</span>
                                  )}
                                </div>
                              </div>

                              {career.missing_skills.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400 mb-1">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span className="font-semibold">
                                      Skill Gaps to Acquire ({career.missing_skills.length}):
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {career.missing_skills.slice(0, 4).map((s, i) => (
                                      <span
                                        key={i}
                                        className="text-[10px] px-2 py-0.5 rounded-md bg-amber-950/50 text-amber-300 border border-amber-800/50"
                                      >
                                        {s}
                                       </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                        <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              navigate(`/careers/${career.id}`);
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                          >
                            View Career Blueprint &rarr;
                          </button>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={Route}
                            onClick={() =>
                              handleGenerateRoadmapForCareer(career.id, career.title)
                            }
                          >
                            Build Roadmap
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                  {matchedOpportunities.length > 0 && (
                    <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-blue-400" />
                          <span>Related Verified Opportunities in {selectedCategory}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            navigate('/opportunities');
                          }}
                          className="text-[11px] text-blue-400 hover:text-blue-300"
                        >
                          Explore all &rarr;
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {matchedOpportunities.map((opp) => (
                          <div
                            key={opp.id}
                            className="p-2.5 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-between"
                          >
                            <div>
                              <p className="font-semibold text-slate-200">{opp.title}</p>
                              <p className="text-[11px] text-slate-400">{opp.organization_name}</p>
                            </div>
                            <Badge variant={opp.is_demo ? 'amber' : 'green'} size="xs">
                              {opp.is_demo ? 'Demo' : 'Official'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-10">
          {step > 1 && step < 4 ? (
            <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {step === 1 && (
            <Button variant="primary" size="sm" icon={ArrowRight} onClick={() => setStep(2)}>
              Next: Select Skills &rarr;
            </Button>
          )}

          {step === 2 && (
            <Button variant="primary" size="sm" icon={ArrowRight} onClick={() => setStep(3)}>
              Next: Work Preferences &rarr;
            </Button>
          )}

          {step === 3 && (
            <Button variant="primary" size="sm" onClick={handleCalculateMatches}>
              Calculate {selectedCategory} Matches
            </Button>
          )}

          {step === 4 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStep(1);
              }}
            >
              Start New Search
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
