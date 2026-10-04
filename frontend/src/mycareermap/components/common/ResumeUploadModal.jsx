import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Compass,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Award,
  BookOpen,
  Briefcase,
  Heart,
  Palette,
  Cpu,
  TrendingUp,
  Shield,
  Wrench,
  Plus,
  Route,
  Check,
} from 'lucide-react';
import { profileService } from '../../services/profileService';
import { careerService } from '../../services/careerService';
import { getCareerDomain } from './GuidedCareerFinderModal';
import Button from './Button';
import Badge from './Badge';
import Card from './Card';
import LoadingSpinner from './LoadingSpinner';

const CAREER_CATEGORIES = [
  {
    id: 'Healthcare',
    name: 'Healthcare and Life Sciences',
    icon: Heart,
    desc: 'General Physician, Surgeon, Pharmacist, Nursing, Radiologist, and Public Health',
  },
  {
    id: 'Creative',
    name: 'Creative Arts and Design',
    icon: Palette,
    desc: 'Drawing, UI/UX Design, Illustration, Animation, 3D Modeling, and Architecture',
  },
  {
    id: 'Technology',
    name: 'Technology and Software',
    icon: Cpu,
    desc: 'Software Engineering, Cloud Infrastructure, AI/ML, Cybersecurity, and Data Systems',
  },
  {
    id: 'Business/Professional',
    name: 'Banking, Finance and Business',
    icon: TrendingUp,
    desc: 'Chartered Accountancy, Investment Banking, Consulting, and Corporate Operations',
  },
  {
    id: 'Government Jobs',
    name: 'Government and Public Services',
    icon: Shield,
    desc: 'Civil Services (IAS/IPS/IFS), Defence Forces, Public Sector Units, and State Exams',
  },
  {
    id: 'Practical/Technical',
    name: 'Engineering and Technical Trades',
    icon: Wrench,
    desc: 'Industrial Robotics, CNC Machining, EV Systems, Solar PV, and Automation',
  },
  {
    id: 'Academic',
    name: 'Science and Academic Research',
    icon: BookOpen,
    desc: 'Scientific Research, Molecular Biology, Mathematics, and University Education',
  },
  {
    id: 'Startup',
    name: 'Startups and Venture Building',
    icon: TrendingUp,
    desc: 'Product Management, Venture Operations, Founder Track, and Business Growth',
  },
];

const WORK_STYLES = ['Hospital/Clinic', 'Office', 'Hybrid', 'Remote', 'Field Work', 'Laboratory'];
const EDUCATION_LEVELS = ['Class 10', 'Class 12', 'Diploma', 'Undergraduate', 'Postgraduate', 'ITI'];

export default function ResumeUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload, 2: Review Skills, 3: Choose Domain/Preferences, 4: Career Matches
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [confirmedSkills, setConfirmedSkills] = useState([]);
  const [customSkillName, setCustomSkillName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Healthcare');
  const [workStyle, setWorkStyle] = useState('Hospital/Clinic');
  const [educationLevel, setEducationLevel] = useState('Undergraduate');
  const [saving, setSaving] = useState(false);
  const [matchingResults, setMatchingResults] = useState({ domainCareers: [], bestCVCareers: [] });
  const [resultsTab, setResultsTab] = useState('domain'); // 'domain' | 'global'
  const [matchedOpportunities, setMatchedOpportunities] = useState([]);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile) => {
    setError('');
    if (!selectedFile) return;

    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      setError('Please select a valid PDF (.pdf) or Word document (.docx).');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }

    setFile(selectedFile);
    // Automatically trigger extraction on valid file selection
    processUpload(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const processUpload = async (fileToUpload) => {
    setUploading(true);
    setError('');

    try {
      const response = await profileService.uploadResume(fileToUpload);
      setExtractedData(response);

      // Initialize confirmed skills list
      const initialConfirmed = (response.extracted_skills || []).map((s) => ({
        skill_id: s.skill_id,
        skill_name: s.skill_name,
        category: s.category || 'Technology',
        proficiency_level: s.suggested_proficiency || 'intermediate',
        years_of_experience: s.years_of_experience || 1.0,
        is_accepted: true,
      }));

      setConfirmedSkills(initialConfirmed);

      // Pre-select category based on extracted skill categories
      const categoriesCount = {};
      initialConfirmed.forEach((s) => {
        const cat = s.category || 'Technology';
        categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
      });

      let topCat = 'Healthcare';
      let maxCount = 0;
      Object.entries(categoriesCount).forEach(([cat, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topCat = cat;
        }
      });
      if (topCat && CAREER_CATEGORIES.some((c) => c.id === topCat)) {
        setSelectedCategory(topCat);
        if (topCat === 'Healthcare') setWorkStyle('Hospital/Clinic');
      }

      if (response.suggested_education_level) {
        setEducationLevel(response.suggested_education_level);
      }

      setStep(2); // Proceed to Review Skills
    } catch (err) {
      console.error('Resume parsing failed:', err);
      setError(
        err.response?.data?.detail ||
          'Failed to extract data from resume. Please verify the file contains selectable text and try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const toggleSkillAcceptance = (index) => {
    setConfirmedSkills((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, is_accepted: !s.is_accepted } : s))
    );
  };

  const updateSkillProficiency = (index, level) => {
    setConfirmedSkills((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, proficiency_level: level } : s))
    );
  };

  const handleAddCustomSkill = () => {
    if (!customSkillName.trim()) return;
    const trimmed = customSkillName.trim();
    setConfirmedSkills((prev) => [
      ...prev,
      {
        skill_id: Date.now(),
        skill_name: trimmed,
        category: selectedCategory,
        proficiency_level: 'intermediate',
        years_of_experience: 1.0,
        is_accepted: true,
      },
    ]);
    setCustomSkillName('');
  };

  const handleCalculateFinalMatches = async () => {
    setSaving(true);
    setError('');

    try {
      const activeSkills = confirmedSkills.filter((s) => s.is_accepted);

      // 1. Save confirmed skills to profile
      if (extractedData?.evidence_id) {
        await profileService.confirmResumeSkills({
          evidence_id: extractedData.evidence_id,
          confirmed_skills: activeSkills,
          headline: extractedData.suggested_headline || undefined,
          current_education_level: educationLevel || undefined,
        }).catch((err) => console.warn('Could not confirm via evidence endpoint:', err));
      }

      // 2. Fetch all careers and opportunities
      const [careersData, opportunitiesData] = await Promise.all([
        careerService.getCareers({ limit: 200 }),
        careerService.getOpportunities({ limit: 100 }),
      ]);

      const skillIds = new Set(activeSkills.map((s) => s.skill_id));
      const skillNames = activeSkills.map((s) => (s.skill_name || '').toLowerCase().trim()).filter(Boolean);

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

          // Check exact id or exact name match
          let isMatched = skillIds.has(sId) || skillNames.includes(sName);

          // Fuzzy/keyword overlap if not matched yet
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

        // 1. Skill Score (0 to 100)
        // If career has required skills, skillScore is pure earnedWeight / totalWeight * 100
        const skillScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : (activeSkills.length > 0 ? 20 : 40);

        // 2. Domain / Category Alignment Score (0 to 100)
        const domainScore = isTargetDomain ? 90 : 15;

        // 3. Education Score (0 to 100)
        const eduScore = career.required_education_level === educationLevel ? 100 : 70;

        // 4. Preference Score (0 to 100)
        const prefScore = (career.work_environments || []).includes(workStyle) ? 100 : 70;

        // 5. Deterministic Composite Score (55% Skills, 25% Domain, 10% Edu, 10% Pref)
        let compositeScore = Math.round(
          0.55 * skillScore + 0.25 * domainScore + 0.10 * eduScore + 0.10 * prefScore
        );

        // DETERMINISTIC REALITY GATING:
        // If candidate has ZERO matching skills for a career that requires skills,
        // the match score cannot be 70%+. It must reflect high skill gap (12% - 25%).
        if (totalWeight > 0 && matchedCount === 0) {
          compositeScore = Math.min(25, Math.max(10, Math.round(compositeScore * 0.32)));
        } else if (totalWeight > 0 && skillScore < 40) {
          // Low skill overlap (1 matched skill out of many)
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

      // Target Domain careers sorted by score
      const targetDomainCareers = scoredCareers
        .filter((c) => c.is_target_domain)
        .sort((a, b) => b.computed_match_score - a.computed_match_score);

      // Best overall matches across all sectors based on CV skills
      const globalBestCareers = [...scoredCareers]
        .sort((a, b) => b.computed_match_score - a.computed_match_score);

      setMatchingResults({
        domainCareers: targetDomainCareers.slice(0, 6),
        bestCVCareers: globalBestCareers.slice(0, 6),
      });

      // Filter matching opportunities
      const matchedOpps = (opportunitiesData || []).filter((opp) => {
        const oTitle = (opp.title || '').toLowerCase();
        const oOrg = (opp.organization_name || '').toLowerCase();

        if (selectedCategory === 'Healthcare') {
          return (
            oTitle.includes('health') ||
            oTitle.includes('medical') ||
            oTitle.includes('clinical') ||
            oTitle.includes('pharma') ||
            oTitle.includes('research') ||
            oOrg.includes('hospital') ||
            oOrg.includes('aiims') ||
            oOrg.includes('icmr')
          );
        }
        if (selectedCategory === 'Creative') {
          return oTitle.includes('design') || oTitle.includes('writer') || oTitle.includes('creative') || oTitle.includes('media');
        }
        if (selectedCategory === 'Government Jobs') {
          return oTitle.includes('upsc') || oTitle.includes('ssc') || oTitle.includes('isro') || oTitle.includes('drdo');
        }
        if (selectedCategory === 'Technology') {
          return oTitle.includes('developer') || oTitle.includes('software') || oTitle.includes('cloud') || oTitle.includes('data');
        }
        return true;
      });

      setMatchedOpportunities(matchedOpps.slice(0, 4));

      if (onUploadSuccess) {
        onUploadSuccess(activeSkills.length);
      }

      setStep(4); // Advance to results
    } catch (err) {
      console.error('Failed to calculate matches:', err);
      setError('Failed to compute career matches. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateRoadmapForCareer = async (careerId, careerTitle) => {
    const token = localStorage.getItem('token');
    if (!token) {
      handleClose();
      navigate('/login', { state: { message: 'Please create an account or sign in to save your personalized roadmap.' } });
      return;
    }

    try {
      await careerService.generateRoadmap(
        careerId,
        `Career Path: ${careerTitle}`,
        'Personalized progression roadmap generated from verified resume'
      );
      handleClose();
      navigate('/roadmap');
    } catch (err) {
      console.error('Failed to create roadmap', err);
      navigate(`/careers/${careerId}`);
      handleClose();
    }
  };

  const handleClose = () => {
    setFile(null);
    setStep(1);
    setExtractedData(null);
    setConfirmedSkills([]);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Resume Intelligence &amp; Career Discovery
                <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md">
                  Step {step} of 4
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {step === 1 && 'Step 1: Upload your PDF or DOCX Resume / CV'}
                {step === 2 && 'Step 2: Review and edit your extracted skills & qualifications'}
                {step === 3 && 'Step 3: Select your target career domain and work preferences'}
                {step === 4 && `Step 4: Top matching ${selectedCategory} career tracks and opportunities`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-800/60 flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: UPLOAD STATE */}
          {step === 1 && (
            <div className="space-y-5">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-blue-500 bg-blue-950/20'
                    : file
                    ? 'border-emerald-500/60 bg-emerald-950/10'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-950/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                />

                <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400">
                  {file ? <FileText className="w-7 h-7 text-emerald-400" /> : <UploadCloud className="w-7 h-7" />}
                </div>

                {file ? (
                  <div>
                    <p className="text-sm font-bold text-slate-100">{file.name}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB &middot; Ready for extraction
                    </p>
                    <p className="text-xs text-blue-400 font-medium mt-2">
                      Click or drag a different file to replace
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      Drag and drop your Resume / CV here, or <span className="text-blue-400 underline">browse</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports PDF and DOCX documents up to 10MB
                    </p>
                  </div>
                )}
              </div>

              {uploading && (
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-300 flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                      Analyzing resume and extracting skills (PyMuPDF NLP)...
                    </span>
                    <span className="text-blue-400 font-mono">Processing</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 animate-pulse rounded-full w-3/4" />
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Automated Skill &amp; Qualification Normalization
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Extracted competencies are normalized against 533+ industry standards. You will review the skills,
                  select your target industry domain, and receive instant deterministic career suggestions.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: REVIEW EXTRACTED SKILLS */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200">Extraction Complete</h4>
                    <p className="text-[11px] text-slate-400">
                      Identified {confirmedSkills.length} competencies from your document.
                    </p>
                  </div>
                </div>
                <Badge variant="primary" size="xs">
                  {confirmedSkills.filter((s) => s.is_accepted).length} Selected
                </Badge>
              </div>

              {/* Add Custom Skill Box */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add any additional skill not found in CV..."
                  value={customSkillName}
                  onChange={(e) => setCustomSkillName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSkill()}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="xs"
                  icon={Plus}
                  onClick={handleAddCustomSkill}
                >
                  Add Skill
                </Button>
              </div>

              {/* Extracted Skills List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {confirmedSkills.map((skill, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                      skill.is_accepted
                        ? 'bg-slate-950 border-slate-700'
                        : 'bg-slate-950/30 border-slate-800/50 opacity-50'
                    }`}
                  >
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={skill.is_accepted}
                        onChange={() => toggleSkillAcceptance(idx)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-700 bg-slate-900"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">{skill.skill_name}</span>
                        <span className="text-[10px] text-slate-500">{skill.category}</span>
                      </div>
                    </label>

                    {skill.is_accepted && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">Level:</span>
                        <select
                          value={skill.proficiency_level}
                          onChange={(e) => updateSkillProficiency(idx, e.target.value)}
                          className="text-xs bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-blue-400 focus:outline-none focus:border-blue-500 capitalize"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: SELECT TARGET DOMAIN & PREFERENCES */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-slate-200 mb-1">
                  Which career field or industry domain do you want to target?
                </h4>
                <p className="text-xs text-slate-400 mb-3">
                  We will evaluate your {confirmedSkills.filter((s) => s.is_accepted).length} skills specifically for this domain:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {CAREER_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          if (cat.id === 'Healthcare') setWorkStyle('Hospital/Clinic');
                          else if (cat.id === 'Government Jobs') setWorkStyle('Office');
                          else setWorkStyle('Hybrid');
                        }}
                        className={`p-3.5 rounded-lg border cursor-pointer transition-all text-left ${
                          isSelected
                            ? 'bg-slate-800 border-blue-500 shadow-sm ring-1 ring-blue-500'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-md bg-slate-900 border border-slate-700 flex items-center justify-center text-blue-400 mb-2">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h5 className="text-xs font-bold text-slate-100 flex items-center justify-between">
                          {cat.name}
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                        </h5>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                          {cat.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <h5 className="text-xs font-bold text-slate-300 mb-2">Preferred Work Environment:</h5>
                  <div className="grid grid-cols-3 gap-1.5">
                    {WORK_STYLES.map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setWorkStyle(style)}
                        className={`p-2 rounded-md border text-xs font-semibold text-center transition-colors ${
                          workStyle === style
                            ? 'bg-slate-800 border-blue-500 text-blue-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-slate-300 mb-2">Education Credential:</h5>
                  <div className="grid grid-cols-3 gap-1.5">
                    {EDUCATION_LEVELS.map((edu) => (
                      <button
                        key={edu}
                        type="button"
                        onClick={() => setEducationLevel(edu)}
                        className={`p-2 rounded-md border text-xs font-semibold text-center transition-colors ${
                          educationLevel === edu
                            ? 'bg-slate-800 border-blue-500 text-blue-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {edu}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: INSTANT MATCHES & OPPORTUNITIES */}
          {step === 4 && (
            <div className="space-y-5">
              {saving ? (
                <div className="py-12 flex items-center justify-center">
                  <LoadingSpinner size="lg" label={`Computing matches in ${selectedCategory}...`} />
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-800">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">
                        Deterministic Career Match Evaluation
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Evaluated directly from your verified CV skills, target domain, and work preferences.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                      <button
                        type="button"
                        onClick={() => setResultsTab('domain')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                          resultsTab === 'domain'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Target Field ({selectedCategory})
                      </button>
                      <button
                        type="button"
                        onClick={() => setResultsTab('global')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                          resultsTab === 'global'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Top CV Matches (All Sectors)
                      </button>
                    </div>
                  </div>

                  {/* Career Match Cards Grid */}
                  {(() => {
                    const displayList =
                      resultsTab === 'domain'
                        ? (matchingResults?.domainCareers || [])
                        : (matchingResults?.bestCVCareers || []);

                    if (displayList.length === 0) {
                      return (
                        <div className="p-8 text-center rounded-lg bg-slate-950 border border-slate-800">
                          <p className="text-sm text-slate-400">No career profiles found for this category.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {displayList.map((career) => {
                          const isHighMatch = career.computed_match_score >= 70 && career.matched_count > 0;
                          const isModMatch = career.computed_match_score >= 40 && career.matched_count > 0;
                          const isGap = !isHighMatch && !isModMatch;

                          const scoreColor = isHighMatch
                            ? 'text-emerald-400'
                            : isModMatch
                            ? 'text-blue-400'
                            : 'text-slate-400';

                          const badgeVariant = isHighMatch
                            ? 'green'
                            : isModMatch
                            ? 'primary'
                            : 'default';

                          const badgeLabel = isHighMatch
                            ? 'Strong Match'
                            : isModMatch
                            ? 'Moderate Match'
                            : 'High Skill Gap';

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
                                          Matched from CV ({career.matched_skills.length}):
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
                                        <span className="text-[10px] text-slate-500 italic">
                                          No required skills found on CV
                                        </span>
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
                                    handleClose();
                                    navigate(`/careers/${career.id}`);
                                  }}
                                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                                >
                                  View Blueprint &rarr;
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
                    );
                  })()}

                  {/* Matching Opportunities Section */}
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
                            handleClose();
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

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-10">
          {step > 1 && step < 4 ? (
            <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleClose}>
              {step === 4 ? 'Close' : 'Cancel'}
            </Button>
          )}

          {step === 1 && (
            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              onClick={() => file && processUpload(file)}
              disabled={!file || uploading}
              loading={uploading}
            >
              Analyze Resume &rarr;
            </Button>
          )}

          {step === 2 && (
            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              onClick={() => setStep(3)}
              disabled={confirmedSkills.filter((s) => s.is_accepted).length === 0}
            >
              Next: Select Target Domain &rarr;
            </Button>
          )}

          {step === 3 && (
            <Button
              variant="primary"
              size="sm"
              icon={Compass}
              onClick={handleCalculateFinalMatches}
              loading={saving}
            >
              Calculate Career Matches &rarr;
            </Button>
          )}

          {step === 4 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStep(1);
                setFile(null);
              }}
            >
              Analyze Another Resume
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
