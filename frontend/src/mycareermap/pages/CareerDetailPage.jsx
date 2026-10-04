import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Route,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
  Award,
  Layers,
  Building2,
  TrendingUp,
  Scale,
} from 'lucide-react';
import { careerService } from '../services/careerService';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function CareerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [career, setCareer] = useState(null);
  const [relationships, setRelationships] = useState([]);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [pathways, setPathways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [activeTab, setActiveTab] = useState('skills');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [careerData, rels, pws] = await Promise.all([
          careerService.getCareerDetails(id),
          careerService.getCareerRelationships(id).catch(() => []),
          careerService.getRecruitmentPathways({ career_id: id }).catch(() => []),
        ]);
        setCareer(careerData);
        setRelationships(rels);
        setPathways(pws);

        if (user) {
          const [gap, exp] = await Promise.all([
            careerService.getGapAnalysis(id).catch(() => null),
            careerService.getMatchExplanation(id).catch(() => null),
          ]);
          setGapAnalysis(gap);
          setExplanation(exp);
        }
      } catch (err) {
        console.error('Failed to load career details', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, user]);

  const handleGenerateRoadmap = async () => {
    try {
      setGeneratingRoadmap(true);
      await careerService.generateRoadmap(
        career.id,
        `Roadmap to ${career.title}`,
        'Personalized progression path based on your skill gaps'
      );
      navigate('/roadmap');
    } catch (err) {
      console.error('Failed to generate roadmap:', err);
      alert('Failed to generate roadmap. Please ensure your profile is setup.');
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading career intelligence..." />
      </div>
    );
  }

  if (!career) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Career Track Not Found</h2>
        <Link to="/careers" className="text-indigo-400 hover:underline text-sm font-semibold">
          &larr; Back to Career Explorer
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <Link to="/careers" className="hover:text-indigo-400 transition-colors">
          Career Explorer
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-medium">{career.title}</span>
      </div>

      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-1 bg-slate-950 text-indigo-400 border border-indigo-900/60 rounded-md font-bold">
                {career.code}
              </span>
              <Badge variant="indigo">{career.career_type?.name || 'General Career'}</Badge>
              <Badge variant={career.demand_level === 'High' ? 'green' : 'amber'}>
                {career.demand_level} Demand
              </Badge>
              {career.growth_rate && (
                <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-md">
                  {career.growth_rate}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {career.title}
            </h1>
            <p className="text-slate-400 max-w-3xl leading-relaxed text-xs sm:text-sm">
              {career.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3 shrink-0">
            <Button
              variant="outline"
              icon={Scale}
              onClick={() => navigate(`/compare?ids=${career.id}`)}
              className="border-slate-700 text-slate-200"
            >
              Compare Role
            </Button>
            {user && (
              <Button
                variant="primary"
                icon={Route}
                onClick={handleGenerateRoadmap}
                loading={generatingRoadmap}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              >
                Personalize Roadmap
              </Button>
            )}
          </div>
        </div>

        {/* Fast Key Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800 text-xs text-slate-400">
          <div>
            <span className="text-slate-500 block">Salary Range</span>
            <span className="font-bold text-slate-200 text-sm sm:text-base mt-0.5 block">
              ₹{((career.salary_range_min || 0) / 100000).toFixed(1)}L - ₹{((career.salary_range_max || 0) / 100000).toFixed(1)}L / yr
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Education Prerequisite</span>
            <span className="font-bold text-slate-200 text-sm sm:text-base mt-0.5 block">
              {career.required_education_level || 'Undergraduate'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Work Environment</span>
            <span className="font-bold text-slate-200 text-sm sm:text-base mt-0.5 block">
              {(career.work_environments || []).join(', ') || 'Office'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Taxonomy Source</span>
            <span className="font-semibold text-slate-300 text-xs truncate block mt-0.5" title={career.sources}>
              {career.sources || 'National Standard Taxonomy'}
            </span>
          </div>
        </div>
      </div>

      {/* Match Evaluation Score Card (If Authenticated) */}
      {explanation && (
        <div className="bg-gradient-to-br from-indigo-950/90 via-slate-900 to-teal-950/70 rounded-3xl p-6 sm:p-8 text-white border border-indigo-800/60 shadow-xl space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-widest text-indigo-400">
                  Deterministic Match Calculation
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-indigo-900/80 rounded text-indigo-300 border border-indigo-700">
                  100% Rule-Based
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                Your Match Score: <span className="text-emerald-400">{Math.round(explanation.overall_match_score)}%</span>
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                <span
                  className={`text-xs px-3 py-1 rounded-md font-semibold ${
                    explanation.eligibility_status === 'eligible'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  Eligibility: {explanation.eligibility_status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs px-3 py-1 rounded-md font-semibold bg-slate-900 text-blue-400 border border-slate-700">
                  Evidence Confidence: {Math.round(explanation.evidence_confidence_score)}%
                </span>
              </div>
            </div>

            {/* Sub-Score Fit Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
              {Object.entries(explanation.score_breakdown).map(([label, score]) => (
                <div key={label} className="bg-slate-950/60 backdrop-blur-sm rounded-xl p-3 border border-slate-800 text-center">
                  <div className="text-lg font-bold text-slate-100">{Math.round(score)}%</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{label.split(' ')[0]} Fit</div>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation Bullet Points */}
          <div className="pt-4 border-t border-slate-800/80">
            <h4 className="text-xs uppercase font-bold tracking-wider text-indigo-400 mb-2">
              Why this career matches your profile:
            </h4>
            <ul className="grid sm:grid-cols-2 gap-2 text-xs text-slate-300">
              {explanation.reasons.map((r, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Content Tabs Bar */}
      <div className="flex space-x-1 border-b border-slate-800 overflow-x-auto pb-1">
        {[
          { id: 'skills', label: 'Required Skills & Gap Analysis' },
          { id: 'pathways', label: 'Official Pathways & Education' },
          { id: 'relationships', label: 'Connected Career Transitions' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400 bg-indigo-950/40'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Skills & Gap Analysis */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          {gapAnalysis ? (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Strong Matches */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    Strong Matches ({gapAnalysis.strong_matches.length})
                  </h3>
                  <Badge variant="green" size="xs">Mastered</Badge>
                </div>
                {gapAnalysis.strong_matches.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No strong skill matches identified yet.</p>
                ) : (
                  <div className="space-y-2">
                    {gapAnalysis.strong_matches.map((s) => (
                      <div key={s.skill_id} className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl">
                        <div className="flex justify-between text-xs font-bold text-slate-200">
                          <span>{s.skill_name}</span>
                          <span className="text-emerald-400 uppercase text-[10px]">{s.current_proficiency}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">Required: {s.required_proficiency}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Partial Matches */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    Partial Matches ({gapAnalysis.partial_matches.length})
                  </h3>
                  <Badge variant="amber" size="xs">Level Up</Badge>
                </div>
                {gapAnalysis.partial_matches.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No partial skill matches.</p>
                ) : (
                  <div className="space-y-2">
                    {gapAnalysis.partial_matches.map((s) => (
                      <div key={s.skill_id} className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl">
                        <div className="flex justify-between text-xs font-bold text-slate-200">
                          <span>{s.skill_name}</span>
                          <span className="text-amber-400 uppercase text-[10px]">{s.current_proficiency}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Target: {s.required_proficiency} (Gap: {s.gap_delta})
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Skills */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                    Missing Skills ({gapAnalysis.missing_skills.length})
                  </h3>
                  <Badge variant="red" size="xs">To Learn</Badge>
                </div>
                {gapAnalysis.missing_skills.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No missing skills! You qualify completely.</p>
                ) : (
                  <div className="space-y-2">
                    {gapAnalysis.missing_skills.map((s) => (
                      <div key={s.skill_id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                        <div className="flex justify-between text-xs font-bold text-slate-200">
                          <span>{s.skill_name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            s.importance_label === 'Required' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-400'
                          }`}>{s.importance_label}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">Target Proficiency: {s.required_proficiency}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <h3 className="font-bold text-slate-100 mb-4 text-sm">Required Career Competencies</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(career.career_skills || []).map((cs) => (
                  <div key={cs.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                      <span>{cs.skill?.name}</span>
                      <span className="text-[10px] uppercase text-indigo-400 font-semibold px-2 py-0.5 bg-indigo-950 border border-indigo-900/60 rounded">
                        {cs.minimum_proficiency}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Weight: {cs.importance_weight >= 0.9 ? 'Required Core' : 'Preferred'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Pathways & Education */}
      {activeTab === 'pathways' && (
        <div className="space-y-6">
          {/* Education Prerequisites */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-slate-100 mb-4 text-sm">Educational Requirements</h3>
            <div className="space-y-3">
              {(career.career_educations || []).map((ce) => (
                <div key={ce.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{ce.field_of_study}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Minimum Degree Level: {ce.min_degree_level}</p>
                  </div>
                  <Badge variant={ce.is_mandatory ? 'red' : 'indigo'} size="xs">
                    {ce.is_mandatory ? 'Mandatory Field' : 'Preferred Field'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Official Recruitment Pathways */}
          {pathways.length > 0 && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="font-bold text-slate-100 text-sm">Official Recruitment Pathways</h3>
              <div className="space-y-4">
                {pathways.map((pw) => (
                  <div key={pw.id} className="p-5 border border-indigo-900/50 bg-indigo-950/20 rounded-2xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="font-bold text-slate-100 text-base">{pw.title}</h4>
                      <Badge variant="teal" size="xs">
                        {pw.conducting_body || 'Government Agency'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{pw.eligibility_description}</p>

                    {pw.selection_stages && pw.selection_stages.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block mb-1">
                          Selection Stages
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {pw.selection_stages.map((stg, i) => (
                            <span key={i} className="text-xs bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-200 font-medium">
                              {i + 1}. {stg}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {pw.source_url && (
                      <div className="pt-2">
                        <a
                          href={pw.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-teal-400 hover:text-teal-300 inline-flex items-center gap-1"
                        >
                          View Official Notification Portal <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Connected Transitions */}
      {activeTab === 'relationships' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <h3 className="font-bold text-slate-100 mb-4 text-sm">Connected Career Transitions</h3>
          {relationships.length === 0 ? (
            <p className="text-xs text-slate-500">No lateral or progression paths mapped for this role yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relationships.map((rel) => (
                <div key={rel.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-indigo-500/50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="indigo" size="xs">{rel.relationship_type}</Badge>
                    <span className="text-[10px] text-slate-400 capitalize">
                      Transition: {rel.transition_difficulty}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-200 text-sm">{rel.target_career?.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {rel.target_career?.summary || rel.target_career?.description}
                  </p>
                  <Link
                    to={`/careers/${rel.target_career_id}`}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-block mt-3"
                  >
                    Explore Role &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
