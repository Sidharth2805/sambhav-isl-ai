import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  BookOpen,
  Award,
  Heart,
  Briefcase,
  Sliders,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  UploadCloud,
} from 'lucide-react';
import { profileService } from '../services/profileService';
import { careerService } from '../services/careerService';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ResumeUploadModal from '../components/common/ResumeUploadModal';

const EDUCATION_LEVELS = [
  'Class 10',
  'Class 12',
  'Diploma',
  'Undergraduate',
  'Postgraduate',
  'ITI',
  'Other',
];

const CAREER_TYPES_LIST = [
  'Government Jobs',
  'Private Jobs',
  'Startup',
  'Freelancing',
  'Business/Entrepreneurship',
  'Research',
  'Teaching',
  'Creative Career',
  'Remote Work',
  'Contract Work',
  'Gig Work',
  'NGO/Social Sector',
  'Defence/Uniformed Services',
  'Academia',
  'Self-employment',
];

const WORK_ENVIRONMENTS_LIST = [
  'Office',
  'Remote',
  'Hybrid',
  'Field Work',
  'Laboratory',
  'Classroom',
  'Studio',
  'Outdoor',
  'Travel-based',
  'Workshop',
  'Hospital',
  'Government Office',
  'Manufacturing Facility',
];

const CAREER_PRIORITIES_LIST = [
  'Stability',
  'Income',
  'Creativity',
  'Social Impact',
  'Work-life Balance',
  'Growth',
  'Government Benefits',
  'Flexibility',
  'Independence',
  'Remote Work',
  'Leadership',
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [error, setError] = useState('');

  // Catalogs from backend
  const [allSkills, setAllSkills] = useState([]);
  const [allInterests, setAllInterests] = useState([]);
  const [skillCategoryFilter, setSkillCategoryFilter] = useState('All');
  const [skillSearch, setSkillSearch] = useState('');

  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumeSuccess, setResumeSuccess] = useState('');

  // 1. Basic Profile Info
  const [profileData, setProfileData] = useState({
    headline: '',
    bio: '',
    location: '',
    target_role: '',
    experience_level: 'entry_level',
    current_education_level: 'Undergraduate',
    resume_url: '',
  });

  const handleResumeSuccess = async (extractedCount) => {
    setResumeSuccess(`Successfully parsed ${extractedCount} skills from your resume!`);
    try {
      const uSkills = await profileService.getUserSkills();
      if (uSkills && uSkills.length > 0) {
        const formatted = uSkills.map((us) => ({
          skill_id: us.skill_id,
          name: us.skill?.name || 'Skill',
          category: us.skill?.category || 'Technology',
          proficiency_level: us.proficiency_level || 'intermediate',
          years_of_experience: us.years_of_experience || 1,
        }));
        setSelectedSkills(formatted);
      }
    } catch (e) {
      console.error('Failed to sync user skills:', e);
    }
  };

  // 2. Education History
  const [educations, setEducations] = useState([
    {
      institution: '',
      degree: 'B.Tech / B.S.',
      qualification_level: 'Undergraduate',
      field_of_study: 'Computer Science & Engineering',
      start_year: 2022,
      end_year: 2026,
      grade_or_gpa: '8.5 CGPA / 85%',
      is_current: true,
    },
  ]);

  // 3. User Selected Skills
  const [selectedSkills, setSelectedSkills] = useState([]);

  // 4. User Selected Interests
  const [selectedInterests, setSelectedInterests] = useState([]);

  // 5. Work & Career Preferences
  const [preferencesData, setPreferencesData] = useState({
    preferred_career_types: ['Private Jobs', 'Remote Work'],
    preferred_work_environments: ['Office', 'Remote', 'Hybrid'],
    career_priorities: ['Growth', 'Income', 'Work-life Balance'],
    preferred_work_environment: 'Hybrid',
    salary_expectation_min: 600000,
    salary_expectation_max: 1800000,
    currency: 'INR',
    willingness_to_relocate: true,
  });

  useEffect(() => {
    async function loadCatalogs() {
      try {
        const [skillsData, interestsData] = await Promise.all([
          profileService.getSkills({ limit: 100 }).catch(() => []),
          profileService.getInterests({ limit: 100 }).catch(() => []),
        ]);
        setAllSkills(skillsData);
        setAllInterests(interestsData);
      } catch (err) {
        console.error('Failed to load catalogs', err);
      } finally {
        setCatalogLoading(false);
      }
    }
    loadCatalogs();
  }, []);

  const handleProfileChange = (e) => {
    setProfileData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddEducation = () => {
    setEducations((prev) => [
      ...prev,
      {
        institution: '',
        degree: '',
        qualification_level: 'Undergraduate',
        field_of_study: '',
        start_year: 2020,
        end_year: 2024,
        grade_or_gpa: '',
        is_current: false,
      },
    ]);
  };

  const handleRemoveEducation = (index) => {
    setEducations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEducationChange = (index, field, value) => {
    setEducations((prev) =>
      prev.map((edu, i) => (i === index ? { ...edu, [field]: value } : edu))
    );
  };

  const handleToggleSkill = (skill) => {
    const exists = selectedSkills.find((s) => s.skill_id === skill.id);
    if (exists) {
      setSelectedSkills((prev) => prev.filter((s) => s.skill_id !== skill.id));
    } else {
      setSelectedSkills((prev) => [
        ...prev,
        {
          skill_id: skill.id,
          name: skill.name,
          category: skill.category,
          proficiency_level: 'intermediate',
          years_of_experience: 1,
        },
      ]);
    }
  };

  const handleSkillProficiencyChange = (skillId, level) => {
    setSelectedSkills((prev) =>
      prev.map((s) => (s.skill_id === skillId ? { ...s, proficiency_level: level } : s))
    );
  };

  const handleToggleInterest = (interest) => {
    const exists = selectedInterests.find((i) => i.interest_id === interest.id);
    if (exists) {
      setSelectedInterests((prev) => prev.filter((i) => i.interest_id !== interest.id));
    } else {
      setSelectedInterests((prev) => [
        ...prev,
        {
          interest_id: interest.id,
          name: interest.name,
          category: interest.category,
          affinity_level: 'high',
        },
      ]);
    }
  };

  const handleToggleArrayItem = (field, item) => {
    setPreferencesData((prev) => {
      const arr = prev[field] || [];
      const updated = arr.includes(item)
        ? arr.filter((x) => x !== item)
        : [...arr, item];
      return { ...prev, [field]: updated };
    });
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Save Profile info
      await profileService.updateProfile({
        headline: profileData.headline || 'Career Explorer',
        bio: profileData.bio,
        location: profileData.location,
        target_role: profileData.target_role,
        experience_level: profileData.experience_level,
        current_education_level: profileData.current_education_level,
        resume_url: profileData.resume_url,
      });

      // 2. Save Educations
      for (const edu of educations) {
        if (edu.institution && edu.degree) {
          await profileService.addEducation({
            institution: edu.institution,
            degree: edu.degree,
            qualification_level: edu.qualification_level,
            field_of_study: edu.field_of_study || 'General Studies',
            start_year: Number(edu.start_year) || undefined,
            end_year: Number(edu.end_year) || undefined,
            grade_or_gpa: edu.grade_or_gpa,
            is_current: Boolean(edu.is_current),
          });
        }
      }

      // 3. Save Skills
      for (const s of selectedSkills) {
        await profileService.addUserSkill({
          skill_id: s.skill_id,
          proficiency_level: s.proficiency_level,
          years_of_experience: Number(s.years_of_experience) || 1,
        });
      }

      // 4. Save Interests
      for (const i of selectedInterests) {
        await profileService.addUserInterest({
          interest_id: i.interest_id,
          affinity_level: i.affinity_level,
        });
      }

      // 5. Save Preferences
      await profileService.updatePreferences({
        preferred_work_environment: preferencesData.preferred_work_environments[0] || 'Hybrid',
        preferred_work_environments: preferencesData.preferred_work_environments,
        career_priorities: preferencesData.career_priorities,
        preferred_career_types: preferencesData.preferred_career_types,
        salary_expectation_min: Number(preferencesData.salary_expectation_min) || 0,
        salary_expectation_max: Number(preferencesData.salary_expectation_max) || 0,
        currency: preferencesData.currency,
        willingness_to_relocate: Boolean(preferencesData.willingness_to_relocate),
      });

      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Failed to save complete onboarding profile. Please verify fields.'
      );
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { num: 1, label: 'Profile', icon: User },
    { num: 2, label: 'Education', icon: BookOpen },
    { num: 3, label: 'Skills', icon: Award },
    { num: 4, label: 'Interests', icon: Heart },
    { num: 5, label: 'Preferences', icon: Sliders },
    { num: 6, label: 'Review', icon: CheckCircle2 },
  ];

  const filteredSkills = allSkills.filter((s) => {
    const matchesCategory =
      skillCategoryFilter === 'All' || s.category === skillCategoryFilter;
    const matchesSearch =
      !skillSearch ||
      s.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(skillSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Step Indicator Header */}
        <div className="text-center space-y-2">
          <Badge variant="teal" size="sm">
            Step {step} of 6
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {step === 1 && 'Personal & Professional Summary'}
            {step === 2 && 'Educational Qualifications'}
            {step === 3 && 'Skill Inventory & Proficiency'}
            {step === 4 && 'Career & Domain Interests'}
            {step === 5 && 'Work Environments & Priorities'}
            {step === 6 && 'Review & Finalize Profile'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Build your precision profile to unlock deterministic career matching and actionable roadmaps.
          </p>

          <div className="flex items-center justify-center gap-2 pt-4 overflow-x-auto pb-2">
            {stepsList.map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap transition-colors ${
                  step === s.num
                    ? 'border-indigo-500 bg-indigo-950/70 text-indigo-300'
                    : step > s.num
                    ? 'border-teal-700/60 bg-teal-950/40 text-teal-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-500'
                }`}
              >
                {step > s.num ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                ) : (
                  <s.icon className="w-3.5 h-3.5" />
                )}
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-red-950/60 border border-red-800 flex items-start gap-3 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: PERSONAL & PROFESSIONAL PROFILE */}
        {step === 1 && (
          <Card className="p-6 sm:p-8 space-y-6">
            {/* Fast Track with Resume Option */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-teal-950/60 border border-indigo-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-900/60 border border-indigo-700/60 flex items-center justify-center text-indigo-400 shrink-0">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Have a Resume / CV?</h4>
                  <p className="text-xs text-slate-400">
                    Upload your PDF or DOCX to auto-extract skills, education, and headline.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="primary"
                size="xs"
                icon={UploadCloud}
                onClick={() => setResumeModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 font-semibold"
              >
                Fast Track via Resume
              </Button>
            </div>

            {resumeSuccess && (
              <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-800 text-xs text-teal-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>{resumeSuccess}</span>
              </div>
            )}

            <Input
              label="Professional Headline / Target Role"
              name="headline"
              placeholder="e.g. Computer Science Student | Aspiring AI Engineer &amp; Open Source Contributor"
              value={profileData.headline}
              onChange={handleProfileChange}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Bio / Career Summary
              </label>
              <textarea
                name="bio"
                rows={3}
                placeholder="Briefly describe your career background, aspirations, technical passion, and preferred direction..."
                value={profileData.bio}
                onChange={handleProfileChange}
                className="block w-full rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Current Location (City, Country)"
                name="location"
                placeholder="e.g. New Delhi, India"
                value={profileData.location}
                onChange={handleProfileChange}
                required
              />

              <Input
                label="Target Role or Industry"
                name="target_role"
                placeholder="e.g. Distributed Backend Systems / Civil Services"
                value={profileData.target_role}
                onChange={handleProfileChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Experience Level
                </label>
                <select
                  name="experience_level"
                  value={profileData.experience_level}
                  onChange={handleProfileChange}
                  className="block w-full rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm px-3 py-2"
                >
                  <option value="student">Student / Undergraduate</option>
                  <option value="entry_level">Entry Level (0-2 years)</option>
                  <option value="mid_level">Mid Level (3-5 years)</option>
                  <option value="senior">Senior (5+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Current Highest Education Status
                </label>
                <select
                  name="current_education_level"
                  value={profileData.current_education_level}
                  onChange={handleProfileChange}
                  className="block w-full rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm px-3 py-2"
                >
                  {EDUCATION_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Resume / Portfolio / LinkedIn URL (Optional)"
              name="resume_url"
              placeholder="https://linkedin.com/in/username or https://github.com/username"
              value={profileData.resume_url}
              onChange={handleProfileChange}
            />

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <Button onClick={() => setStep(2)} icon={ArrowRight}>
                Next: Education History
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 2: EDUCATION HISTORY */}
        {step === 2 && (
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Educational Qualifications</h3>
                <p className="text-xs text-slate-400">
                  Include Class 10, Class 12, Diplomas, Degrees, or ITI certifications.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddEducation} icon={Plus}>
                Add Qualification
              </Button>
            </div>

            <div className="space-y-4">
              {educations.map((edu, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4 relative"
                >
                  {educations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="absolute top-4 right-4 text-slate-500 hover:text-red-400"
                      title="Remove entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Qualification Level
                      </label>
                      <select
                        value={edu.qualification_level}
                        onChange={(e) =>
                          handleEducationChange(idx, 'qualification_level', e.target.value)
                        }
                        className="block w-full rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-sm px-3 py-2"
                      >
                        {EDUCATION_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Degree / Certificate Name"
                      placeholder="e.g. B.Tech / Senior Secondary (CBSE)"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Institution / Board / School"
                      placeholder="e.g. National Institute of Technology / St. Xavier's"
                      value={edu.institution}
                      onChange={(e) =>
                        handleEducationChange(idx, 'institution', e.target.value)
                      }
                      required
                    />

                    <Input
                      label="Field of Study / Stream"
                      placeholder="e.g. Computer Science / Science PCM / Commerce"
                      value={edu.field_of_study}
                      onChange={(e) =>
                        handleEducationChange(idx, 'field_of_study', e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Start Year"
                      type="number"
                      value={edu.start_year || ''}
                      onChange={(e) =>
                        handleEducationChange(idx, 'start_year', e.target.value)
                      }
                    />

                    <Input
                      label="Completion / Expected Year"
                      type="number"
                      value={edu.end_year || ''}
                      onChange={(e) => handleEducationChange(idx, 'end_year', e.target.value)}
                    />

                    <Input
                      label="Grade / Percentage / CGPA"
                      placeholder="e.g. 8.8 CGPA / 88%"
                      value={edu.grade_or_gpa || ''}
                      onChange={(e) =>
                        handleEducationChange(idx, 'grade_or_gpa', e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <Button variant="outline" onClick={() => setStep(1)} icon={ArrowLeft}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} icon={ArrowRight}>
                Next: Select Skills
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 3: SKILLS INVENTORY */}
        {step === 3 && (
          <Card className="p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Select Your Verified Skills</h3>
                <Badge variant="primary" size="sm">
                  {selectedSkills.length} Selected
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Choose from over 500 normalized skills. Filter by category or search by name.
              </p>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  icon={Search}
                  placeholder="Search skills (e.g., Python, Figma, Accounting, CNC, Welding)..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {['All', 'Technology', 'Business/Professional', 'Creative', 'Performing Arts & Media', 'Practical/Technical', 'Academic'].map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setSkillCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      skillCategoryFilter === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Skill Badges Selection Grid */}
            <div className="max-h-64 overflow-y-auto p-3 rounded-xl bg-slate-950 border border-slate-800">
              {catalogLoading ? (
                <LoadingSpinner size="md" label="Loading skills taxonomy..." />
              ) : filteredSkills.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  No skills matching filter.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filteredSkills.map((s) => {
                    const isSelected = selectedSkills.some((sel) => sel.skill_id === s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => handleToggleSkill(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Skills Proficiency Configuration */}
            {selectedSkills.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Configured Skills Proficiency
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto">
                  {selectedSkills.map((s) => (
                    <div
                      key={s.skill_id}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{s.name}</p>
                        <p className="text-[10px] text-slate-500">{s.category}</p>
                      </div>
                      <select
                        value={s.proficiency_level}
                        onChange={(e) =>
                          handleSkillProficiencyChange(s.skill_id, e.target.value)
                        }
                        className="rounded-md bg-slate-950 border border-slate-700 text-[11px] text-indigo-300 px-2 py-1"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <Button variant="outline" onClick={() => setStep(2)} icon={ArrowLeft}>
                Back
              </Button>
              <Button onClick={() => setStep(4)} icon={ArrowRight}>
                Next: Interests
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 4: CAREER & DOMAIN INTERESTS */}
        {step === 4 && (
          <Card className="p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Choose Your Domain Interests</h3>
                <Badge variant="teal" size="sm">
                  {selectedInterests.length} Selected
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Interests are evaluated separately from hard skills to determine career alignment.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {allInterests.map((interest) => {
                const isSelected = selectedInterests.some((i) => i.interest_id === interest.id);
                return (
                  <button
                    type="button"
                    key={interest.id}
                    onClick={() => handleToggleInterest(interest)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{interest.name}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {interest.category || 'Domain'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <Button variant="outline" onClick={() => setStep(3)} icon={ArrowLeft}>
                Back
              </Button>
              <Button onClick={() => setStep(5)} icon={ArrowRight}>
                Next: Preferences
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 5: WORK PREFERENCES & PRIORITIES */}
        {step === 5 && (
          <Card className="p-6 sm:p-8 space-y-6">
            {/* Preferred Career Types */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                Preferred Career Types (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {CAREER_TYPES_LIST.map((ct) => {
                  const isChecked = preferencesData.preferred_career_types.includes(ct);
                  return (
                    <button
                      type="button"
                      key={ct}
                      onClick={() => handleToggleArrayItem('preferred_career_types', ct)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-teal-600 border-teal-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                      {ct}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Work Environments */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                Preferred Work Environments
              </label>
              <div className="flex flex-wrap gap-2">
                {WORK_ENVIRONMENTS_LIST.map((env) => {
                  const isChecked = preferencesData.preferred_work_environments.includes(env);
                  return (
                    <button
                      type="button"
                      key={env}
                      onClick={() => handleToggleArrayItem('preferred_work_environments', env)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                      {env}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Career Priorities */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                Top Career Priorities
              </label>
              <div className="flex flex-wrap gap-2">
                {CAREER_PRIORITIES_LIST.map((pri) => {
                  const isChecked = preferencesData.career_priorities.includes(pri);
                  return (
                    <button
                      type="button"
                      key={pri}
                      onClick={() => handleToggleArrayItem('career_priorities', pri)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                      {pri}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Salary Expectation & Relocation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Input
                label="Target Annual Minimum (INR / USD)"
                type="number"
                value={preferencesData.salary_expectation_min}
                onChange={(e) =>
                  setPreferencesData({
                    ...preferencesData,
                    salary_expectation_min: Number(e.target.value),
                  })
                }
              />
              <Input
                label="Target Annual Maximum"
                type="number"
                value={preferencesData.salary_expectation_max}
                onChange={(e) =>
                  setPreferencesData({
                    ...preferencesData,
                    salary_expectation_max: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="relocate-pref"
                type="checkbox"
                checked={preferencesData.willingness_to_relocate}
                onChange={(e) =>
                  setPreferencesData({
                    ...preferencesData,
                    willingness_to_relocate: e.target.checked,
                  })
                }
                className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <label htmlFor="relocate-pref" className="text-xs text-slate-300">
                Willing to relocate for verified career opportunities
              </label>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <Button variant="outline" onClick={() => setStep(4)} icon={ArrowLeft}>
                Back
              </Button>
              <Button onClick={() => setStep(6)} icon={ArrowRight}>
                Review Profile
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 6: SUMMARY & FINALIZATION */}
        {step === 6 && (
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Profile Readiness Review</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify your complete data profile before generating career maps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-indigo-400 font-bold block uppercase">
                  Personal &amp; Target
                </span>
                <p>
                  <strong className="text-slate-300">Headline:</strong> {profileData.headline || 'Not specified'}
                </p>
                <p>
                  <strong className="text-slate-300">Location:</strong> {profileData.location || 'Not set'}
                </p>
                <p>
                  <strong className="text-slate-300">Target Role:</strong> {profileData.target_role || 'Not set'}
                </p>
                <p>
                  <strong className="text-slate-300">Experience:</strong> {profileData.experience_level}
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-teal-400 font-bold block uppercase">
                  Education ({educations.length})
                </span>
                {educations.map((edu, i) => (
                  <p key={i} className="border-b border-slate-800/80 last:border-0 pb-1">
                    {edu.degree} in {edu.field_of_study} ({edu.institution})
                  </p>
                ))}
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-blue-400 font-bold block uppercase">
                  Selected Skills ({selectedSkills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSkills.map((s) => (
                    <Badge key={s.skill_id} variant="primary" size="xs">
                      {s.name} ({s.proficiency_level})
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-emerald-400 font-bold block uppercase">
                  Interests &amp; Work Modes
                </span>
                <p>
                  <strong className="text-slate-300">Interests:</strong>{' '}
                  {selectedInterests.map((i) => i.name).join(', ') || 'None selected'}
                </p>
                <p>
                  <strong className="text-slate-300">Career Types:</strong>{' '}
                  {preferencesData.preferred_career_types.join(', ')}
                </p>
                <p>
                  <strong className="text-slate-300">Environments:</strong>{' '}
                  {preferencesData.preferred_work_environments.join(', ')}
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <Button variant="outline" onClick={() => setStep(5)} icon={ArrowLeft}>
                Edit Details
              </Button>
              <Button onClick={handleCompleteOnboarding} loading={loading} icon={CheckCircle2}>
                Save Profile &amp; Launch Platform
              </Button>
            </div>
          </Card>
        )}
      </div>

      <ResumeUploadModal
        isOpen={resumeModalOpen}
        onClose={() => setResumeModalOpen(false)}
        onUploadSuccess={(count) => handleResumeSuccess(count)}
      />
    </div>
  );
}
