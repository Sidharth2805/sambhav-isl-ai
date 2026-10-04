import React, { useEffect, useState } from 'react';
import {
  User,
  BookOpen,
  Award,
  Heart,
  Sliders,
  FileText,
  UploadCloud,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  Search,
  ExternalLink,
  Download,
  Check,
  X,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import { profileService } from '../services/profileService';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ResumeUploadModal from '../components/common/ResumeUploadModal';
import GitHubVerifierModal from '../components/common/GitHubVerifierModal';

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

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // State
  const [profile, setProfile] = useState(null);
  const [educations, setEducations] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);

  // Catalogs
  const [allSkills, setAllSkills] = useState([]);
  const [allInterests, setAllInterests] = useState([]);

  // Add form states
  const [newEdu, setNewEdu] = useState({
    institution: '',
    degree: '',
    qualification_level: 'Undergraduate',
    field_of_study: '',
    start_year: 2022,
    end_year: 2026,
    grade_or_gpa: '',
    is_current: true,
  });

  const [newSkill, setNewSkill] = useState({
    skill_id: '',
    custom_name: '',
    category: 'Technology',
    proficiency_level: 'intermediate',
    years_of_experience: 1,
  });

  const [newInterest, setNewInterest] = useState({
    interest_id: '',
    custom_name: '',
    affinity_level: 'high',
  });

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [prof, edus, uskills, uinterests, prefs, evs, skillsCat, intsCat] =
        await Promise.all([
          profileService.getProfile(),
          profileService.getEducation().catch(() => []),
          profileService.getUserSkills().catch(() => []),
          profileService.getUserInterests().catch(() => []),
          profileService.getPreferences().catch(() => null),
          profileService.getEvidence ? profileService.getEvidence().catch(() => []) : [],
          profileService.getSkills({ limit: 500 }).catch(() => []),
          profileService.getInterests({ limit: 50 }).catch(() => []),
        ]);

      setProfile(prof);
      setEducations(edus);
      setUserSkills(uskills);
      setUserInterests(uinterests);
      setPreferences(
        prefs || {
          preferred_career_types: [],
          preferred_work_environments: [],
          career_priorities: [],
          preferred_work_environment: 'Hybrid',
          willingness_to_relocate: false,
          salary_expectation_min: 0,
          salary_expectation_max: 0,
        }
      );
      setEvidenceList(evs);
      setAllSkills(skillsCat);
      setAllInterests(intsCat);
    } catch (err) {
      console.error('Failed to load profile data', err);
      setMessage({ type: 'error', text: 'Failed to load profile details.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await profileService.updateProfile({
        headline: profile.headline,
        bio: profile.bio,
        location: profile.location,
        target_role: profile.target_role,
        experience_level: profile.experience_level,
        current_education_level: profile.current_education_level,
        career_type_preference: profile.career_type_preference,
        resume_url: profile.resume_url,
      });
      setMessage({ type: 'success', text: 'Profile details saved successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await profileService.updatePreferences(preferences);
      setMessage({ type: 'success', text: 'Career and work preferences updated.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update preferences.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePrefArray = (field, item) => {
    setPreferences((prev) => {
      const arr = prev[field] || [];
      const updated = arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
      return { ...prev, [field]: updated };
    });
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    try {
      await profileService.addEducation({
        ...newEdu,
        start_year: Number(newEdu.start_year) || undefined,
        end_year: Number(newEdu.end_year) || undefined,
      });
      setNewEdu({
        institution: '',
        degree: '',
        qualification_level: 'Undergraduate',
        field_of_study: '',
        start_year: 2022,
        end_year: 2026,
        grade_or_gpa: '',
        is_current: true,
      });
      const updated = await profileService.getEducation();
      setEducations(updated);
      setMessage({ type: 'success', text: 'Education record added.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to add education record.' });
    }
  };

  const handleDeleteEducation = async (id) => {
    try {
      await profileService.deleteEducation(id);
      setEducations((prev) => prev.filter((item) => item.id !== id));
      setMessage({ type: 'success', text: 'Education record removed.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete education record.' });
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      let targetSkillId = Number(newSkill.skill_id);

      if (!targetSkillId && newSkill.custom_name.trim()) {
        const created = await profileService.createCatalogSkill({
          name: newSkill.custom_name.trim(),
          category: newSkill.category,
        });
        targetSkillId = created.id;
      }

      if (!targetSkillId) {
        setMessage({ type: 'error', text: 'Please select or type a skill name.' });
        return;
      }

      await profileService.addUserSkill({
        skill_id: targetSkillId,
        proficiency_level: newSkill.proficiency_level,
        years_of_experience: Number(newSkill.years_of_experience) || 1,
      });

      setNewSkill({
        skill_id: '',
        custom_name: '',
        category: 'Technology',
        proficiency_level: 'intermediate',
        years_of_experience: 1,
      });

      const updated = await profileService.getUserSkills();
      setUserSkills(updated);
      setMessage({ type: 'success', text: 'Skill mapped successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to add skill.' });
    }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await profileService.deleteUserSkill(id);
      setUserSkills((prev) => prev.filter((item) => item.id !== id));
      setMessage({ type: 'success', text: 'Skill removed.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete skill.' });
    }
  };

  const handleAddInterest = async (e) => {
    e.preventDefault();
    try {
      let targetInterestId = Number(newInterest.interest_id);

      if (!targetInterestId && newInterest.custom_name.trim()) {
        const created = await profileService.createCatalogInterest({
          name: newInterest.custom_name.trim(),
        });
        targetInterestId = created.id;
      }

      if (!targetInterestId) {
        setMessage({ type: 'error', text: 'Please select or type an interest.' });
        return;
      }

      await profileService.addUserInterest({
        interest_id: targetInterestId,
        affinity_level: newInterest.affinity_level,
      });

      setNewInterest({
        interest_id: '',
        custom_name: '',
        affinity_level: 'high',
      });

      const updated = await profileService.getUserInterests();
      setUserInterests(updated);
      setMessage({ type: 'success', text: 'Interest added.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to add interest.' });
    }
  };

  const handleDeleteInterest = async (id) => {
    try {
      await profileService.deleteUserInterest(id);
      setUserInterests((prev) => prev.filter((item) => item.id !== id));
      setMessage({ type: 'success', text: 'Interest removed.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete interest.' });
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" label="Loading candidate matrix..." />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Basic Profile', icon: User },
    { id: 'skills', label: 'My Skills', icon: Award, count: userSkills.length },
    { id: 'education', label: 'My Education', icon: BookOpen, count: educations.length },
    { id: 'interests', label: 'My Interests', icon: Heart, count: userInterests.length },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Candidate Profile &amp; Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your verified background, skill taxonomy, resume evidence, and work preferences.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={UploadCloud}
          onClick={() => setResumeModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-500 text-white font-bold"
        >
          Upload / Update CV
        </Button>
      </div>

      {/* Global alert feedback */}
      {message.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMessage({ type: '', text: '' });
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-950/40'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: BASIC PROFILE */}
      {activeTab === 'profile' && (
        <Card className="p-6 sm:p-8 space-y-6 border-slate-800">
          <form onSubmit={handleProfileSave} className="space-y-4">
            <Input
              label="Professional Headline"
              value={profile?.headline || ''}
              onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
              placeholder="e.g. Distributed Systems Engineer &amp; AI Practitioner"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Bio / Career Vision
              </label>
              <textarea
                rows={3}
                value={profile?.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Describe your background and career aspirations..."
                className="block w-full rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs sm:text-sm px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Location (City, Country)"
                value={profile?.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="e.g. Bengaluru, India"
              />

              <Input
                label="Target Role / Domain"
                value={profile?.target_role || ''}
                onChange={(e) => setProfile({ ...profile, target_role: e.target.value })}
                placeholder="e.g. Cloud Security Architect"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Experience Level
                </label>
                <select
                  value={profile?.experience_level || 'entry_level'}
                  onChange={(e) => setProfile({ ...profile, experience_level: e.target.value })}
                  className="block w-full rounded-xl border border-slate-700 text-slate-200 text-xs sm:text-sm px-3.5 py-2.5 bg-slate-950 focus:outline-none focus:border-indigo-500"
                >
                  <option value="student">Student / Undergraduate</option>
                  <option value="entry_level">Entry Level (0-2 years)</option>
                  <option value="mid_level">Mid Level (3-5 years)</option>
                  <option value="senior">Senior (5+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Highest Education Level
                </label>
                <select
                  value={profile?.current_education_level || 'Undergraduate'}
                  onChange={(e) =>
                    setProfile({ ...profile, current_education_level: e.target.value })
                  }
                  className="block w-full rounded-xl border border-slate-700 text-slate-200 text-xs sm:text-sm px-3.5 py-2.5 bg-slate-950 focus:outline-none focus:border-indigo-500"
                >
                  {EDUCATION_LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <Button type="submit" loading={saving} icon={Save}>
                Save Profile Details
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2: MY SKILLS */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4 border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-200">Map Skills from Normalized Taxonomy</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  icon={GitBranch}
                  onClick={() => setGithubModalOpen(true)}
                >
                  Verify via GitHub
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  icon={UploadCloud}
                  onClick={() => setResumeModalOpen(true)}
                >
                  Extract from Resume
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Select Skill from 500+ Taxonomy
                </label>
                <select
                  value={newSkill.skill_id}
                  onChange={(e) => setNewSkill({ ...newSkill, skill_id: e.target.value })}
                  className="block w-full rounded-xl border border-slate-700 text-slate-200 text-xs sm:text-sm px-3.5 py-2.5 bg-slate-950 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Skill from Catalog --</option>
                  {allSkills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Or Enter Custom Skill Name"
                placeholder="e.g. LLM Prompt Engineering"
                value={newSkill.custom_name}
                onChange={(e) => setNewSkill({ ...newSkill, custom_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                <select
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                  className="block w-full rounded-xl border border-slate-700 text-slate-200 text-xs sm:text-sm px-3.5 py-2.5 bg-slate-950 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Technology">Technology</option>
                  <option value="Business/Professional">Business/Professional</option>
                  <option value="Creative">Creative</option>
                  <option value="Practical/Technical">Practical/Technical</option>
                  <option value="Academic">Academic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Proficiency Level
                </label>
                <select
                  value={newSkill.proficiency_level}
                  onChange={(e) =>
                    setNewSkill({ ...newSkill, proficiency_level: e.target.value })
                  }
                  className="block w-full rounded-xl border border-slate-700 text-slate-200 text-xs sm:text-sm px-3.5 py-2.5 bg-slate-950 focus:outline-none focus:border-indigo-500 capitalize"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <Input
                label="Years of Experience"
                type="number"
                step="0.5"
                value={newSkill.years_of_experience}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, years_of_experience: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleAddSkill} size="sm" icon={Plus}>
                Map Skill to Profile
              </Button>
            </div>
          </Card>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200">
              My Mapped Skills ({userSkills.length})
            </h3>
            {userSkills.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No skills mapped yet. Add skills or upload a CV to start.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {userSkills.map((us) => (
                  <Card key={us.id} className="p-3.5 flex items-center justify-between border-slate-800">
                    <div>
                      <h4 className="font-semibold text-slate-100 text-sm">{us.skill?.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="teal" size="xs" className="capitalize">
                          {us.proficiency_level}
                        </Badge>
                        <span className="text-[11px] text-slate-400">
                          {us.years_of_experience} yrs &middot; {us.source}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSkill(us.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MY EDUCATION */}
      {activeTab === 'education' && (
        <div className="space-y-6">
          <Card className="p-6 border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-4">Add Education Entry</h3>
            <form onSubmit={handleAddEducation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Qualification Level
                  </label>
                  <select
                    value={newEdu.qualification_level}
                    onChange={(e) =>
                      setNewEdu({ ...newEdu, qualification_level: e.target.value })
                    }
                    className="block w-full rounded-xl border border-slate-700 text-slate-200 text-xs sm:text-sm px-3.5 py-2.5 bg-slate-950 focus:outline-none focus:border-indigo-500"
                  >
                    {EDUCATION_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Degree / Examination Name"
                  placeholder="e.g. B.Tech / Senior Secondary (Class 12)"
                  value={newEdu.degree}
                  onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Institution / Board Name"
                  placeholder="e.g. National Institute of Technology"
                  value={newEdu.institution}
                  onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                  required
                />

                <Input
                  label="Field of Study / Stream"
                  placeholder="e.g. Computer Science & Engineering"
                  value={newEdu.field_of_study}
                  onChange={(e) => setNewEdu({ ...newEdu, field_of_study: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Start Year"
                  type="number"
                  value={newEdu.start_year || ''}
                  onChange={(e) => setNewEdu({ ...newEdu, start_year: e.target.value })}
                />
                <Input
                  label="Completion Year"
                  type="number"
                  value={newEdu.end_year || ''}
                  onChange={(e) => setNewEdu({ ...newEdu, end_year: e.target.value })}
                />
                <Input
                  label="Grade / Percentage / CGPA"
                  placeholder="e.g. 8.5 CGPA"
                  value={newEdu.grade_or_gpa || ''}
                  onChange={(e) => setNewEdu({ ...newEdu, grade_or_gpa: e.target.value })}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" size="sm" icon={Plus}>
                  Add Qualification Record
                </Button>
              </div>
            </form>
          </Card>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200">
              Education History ({educations.length})
            </h3>
            {educations.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No education records added yet.</p>
            ) : (
              educations.map((edu) => (
                <Card key={edu.id} className="p-4 flex items-center justify-between border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="teal" size="xs">
                        {edu.qualification_level || 'Qualification'}
                      </Badge>
                      <h4 className="font-semibold text-slate-200">{edu.degree}</h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {edu.institution} &middot; {edu.field_of_study}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {edu.start_year || 'N/A'} - {edu.end_year || 'Present'} &middot;{' '}
                      {edu.grade_or_gpa || 'Score not specified'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteEducation(edu.id)}
                    className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MY INTERESTS */}
      {activeTab === 'interests' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4 border-slate-800">
            <h3 className="text-sm font-bold text-slate-200">Track Interests &amp; Passions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Select from 25+ Interest Domains
                </label>
                <select
                  value={newInterest.interest_id}
                  onChange={(e) =>
                    setNewInterest({ ...newInterest, interest_id: e.target.value })
                  }
                  className="block w-full rounded-xl border border-slate-700 text-slate-200 text-xs sm:text-sm px-3.5 py-2.5 bg-slate-950 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Interest Domain --</option>
                  {allInterests.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.category || 'Domain'})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Or Type Specific Interest"
                placeholder="e.g. Space Exploration"
                value={newInterest.custom_name}
                onChange={(e) =>
                  setNewInterest({ ...newInterest, custom_name: e.target.value })
                }
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-semibold">Affinity Level:</label>
                <select
                  value={newInterest.affinity_level}
                  onChange={(e) =>
                    setNewInterest({ ...newInterest, affinity_level: e.target.value })
                  }
                  className="rounded-lg border border-slate-700 text-xs text-slate-200 px-2.5 py-1 bg-slate-950 focus:outline-none focus:border-indigo-500"
                >
                  <option value="high">High Affinity</option>
                  <option value="medium">Medium Affinity</option>
                  <option value="low">Low Affinity</option>
                </select>
              </div>

              <Button onClick={handleAddInterest} size="sm" icon={Plus}>
                Add Interest
              </Button>
            </div>
          </Card>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200">
              Tracked Interests ({userInterests.length})
            </h3>
            {userInterests.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No interests selected yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {userInterests.map((ui) => (
                  <div
                    key={ui.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 shadow-sm"
                  >
                    <span>{ui.interest?.name}</span>
                    <Badge variant="primary" size="xs">
                      {ui.affinity_level}
                    </Badge>
                    <button
                      onClick={() => handleDeleteInterest(ui.id)}
                      className="text-slate-400 hover:text-red-400 ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: PREFERENCES */}
      {activeTab === 'preferences' && (
        <Card className="p-6 sm:p-8 space-y-6 border-slate-800">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Preferred Career Types
            </label>
            <div className="flex flex-wrap gap-2">
              {CAREER_TYPES_LIST.map((ct) => {
                const isChecked = (preferences?.preferred_career_types || []).includes(ct);
                return (
                  <button
                    type="button"
                    key={ct}
                    onClick={() => handleTogglePrefArray('preferred_career_types', ct)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                    {ct}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Preferred Work Environments
            </label>
            <div className="flex flex-wrap gap-2">
              {WORK_ENVIRONMENTS_LIST.map((env) => {
                const isChecked = (preferences?.preferred_work_environments || []).includes(env);
                return (
                  <button
                    type="button"
                    key={env}
                    onClick={() => handleTogglePrefArray('preferred_work_environments', env)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-teal-600 border-teal-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                    {env}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Career Priorities
            </label>
            <div className="flex flex-wrap gap-2">
              {CAREER_PRIORITIES_LIST.map((pri) => {
                const isChecked = (preferences?.career_priorities || []).includes(pri);
                return (
                  <button
                    type="button"
                    key={pri}
                    onClick={() => handleTogglePrefArray('career_priorities', pri)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                    {pri}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Salary Expectation Minimum (INR)"
              type="number"
              value={preferences?.salary_expectation_min || ''}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  salary_expectation_min: Number(e.target.value) || 0,
                })
              }
            />
            <Input
              label="Salary Expectation Maximum (INR)"
              type="number"
              value={preferences?.salary_expectation_max || ''}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  salary_expectation_max: Number(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="relocate-pref-tab"
              type="checkbox"
              checked={preferences?.willingness_to_relocate || false}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  willingness_to_relocate: e.target.checked,
                })
              }
              className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <label htmlFor="relocate-pref-tab" className="text-xs font-semibold text-slate-300">
              Willing to relocate for verified opportunities
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <Button onClick={handlePreferencesSave} loading={saving} icon={Save}>
              Save Preferences
            </Button>
          </div>
        </Card>
      )}

      {/* Resume Upload Modal */}
      <ResumeUploadModal
        isOpen={resumeModalOpen}
        onClose={() => setResumeModalOpen(false)}
        onUploadSuccess={() => loadProfileData()}
      />

      {/* GitHub Verifier Modal */}
      <GitHubVerifierModal
        isOpen={githubModalOpen}
        onClose={() => setGithubModalOpen(false)}
        onSkillsVerified={() => loadProfileData()}
      />
    </div>
  );
}
