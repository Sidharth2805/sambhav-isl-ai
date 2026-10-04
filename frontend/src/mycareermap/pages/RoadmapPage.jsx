import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Route, CheckCircle2, Clock, Circle, Sparkles, BookOpen, ExternalLink, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { careerService } from '../services/careerService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function RoadmapPage() {
  const { id: routeRoadmapId } = useParams();
  const navigate = useNavigate();

  const [roadmaps, setRoadmaps] = useState([]);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [careers, setCareers] = useState([]);
  const [selectedCareerId, setSelectedCareerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedStepId, setExpandedStepId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [rms, crs] = await Promise.all([
          careerService.getRoadmaps(),
          careerService.getCareers({ limit: 100 }),
        ]);
        setRoadmaps(rms);
        setCareers(crs);

        if (rms.length > 0) {
          if (routeRoadmapId) {
            const found = rms.find((r) => r.id === Number(routeRoadmapId));
            setActiveRoadmap(found || rms[0]);
          } else {
            setActiveRoadmap(rms[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load roadmap data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [routeRoadmapId]);

  const handleGenerate = async () => {
    if (!selectedCareerId) return;
    try {
      setGenerating(true);
      const res = await careerService.generateRoadmap(Number(selectedCareerId));
      const updated = await careerService.getRoadmaps();
      setRoadmaps(updated);
      setActiveRoadmap(res);
      setSelectedCareerId('');
      navigate(`/roadmap/${res.id}`);
    } catch (err) {
      alert('Failed to generate roadmap. Please check your connection.');
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusToggle = async (stepId, currentStatus) => {
    const nextStatus =
      currentStatus === 'completed'
        ? 'in_progress'
        : currentStatus === 'in_progress'
        ? 'pending'
        : 'completed';

    try {
      await careerService.updateRoadmapStepStatus(stepId, nextStatus);
      const updated = await careerService.getRoadmaps();
      setRoadmaps(updated);
      const active = updated.find((r) => r.id === activeRoadmap.id);
      setActiveRoadmap(active || updated[0]);
    } catch (err) {
      console.error('Failed to update step status', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this career roadmap?')) return;
    try {
      await careerService.deleteRoadmap(id);
      const updated = await careerService.getRoadmaps();
      setRoadmaps(updated);
      setActiveRoadmap(updated[0] || null);
      if (updated.length > 0) {
        navigate(`/roadmap/${updated[0].id}`);
      }
    } catch (err) {
      console.error('Failed to delete roadmap', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">Personalized Career Roadmaps</h1>
          <p className="text-sm text-slate-400 mt-1">
            Deterministic 9-stage progression targeting your actual skill gaps and official recruitment routes.
          </p>
        </div>

        {/* Generate New Roadmap Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCareerId}
            onChange={(e) => setSelectedCareerId(e.target.value)}
            className="text-xs bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-medium text-slate-200 shadow-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="">Select Target Career...</option>
            {careers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerate}
            disabled={!selectedCareerId || generating}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-300" />
            {generating ? 'Building...' : 'Build Roadmap'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : roadmaps.length === 0 ? (
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-12 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 rounded-full flex items-center justify-center mx-auto">
            <Route className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">No Career Roadmaps Created Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Choose a target career from the dropdown above or explore the Career Explorer to generate your personalized 9-stage progression roadmap.
          </p>
          <Button variant="primary" onClick={() => navigate('/careers')}>
            Explore Career Pathways →
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Roadmap Selector Tabs */}
          {roadmaps.length > 1 && (
            <div className="flex space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
              {roadmaps.map((rm) => (
                <button
                  key={rm.id}
                  onClick={() => {
                    setActiveRoadmap(rm);
                    navigate(`/roadmap/${rm.id}`);
                  }}
                  className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
                    activeRoadmap?.id === rm.id
                      ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/40'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {rm.career?.title || rm.title} ({rm.completion_percentage}%)
                </button>
              ))}
            </div>
          )}

          {activeRoadmap && (
            <div className="space-y-6">
              {/* Active Roadmap Banner */}
              <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-slate-100">{activeRoadmap.title}</h2>
                      <Badge variant="primary">{activeRoadmap.career?.career_type?.name || 'Career Roadmap'}</Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">{activeRoadmap.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(activeRoadmap.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors"
                      title="Delete Roadmap"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Completion Progress Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Overall Milestone Completion</span>
                    <span className="text-indigo-400">{activeRoadmap.completion_percentage}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500 rounded-full"
                      style={{ width: `${activeRoadmap.completion_percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 9-Stage Step Progression List */}
              <div className="space-y-4">
                {activeRoadmap.steps?.map((step) => {
                  const isCompleted = step.status === 'completed';
                  const isInProgress = step.status === 'in_progress';
                  const isExpanded = expandedStepId === step.id;

                  return (
                    <div
                      key={step.id}
                      className={`rounded-2xl border transition-all ${
                        isCompleted
                          ? 'border-emerald-500/40 bg-emerald-950/20'
                          : isInProgress
                          ? 'border-indigo-500/50 bg-indigo-950/20 ring-1 ring-indigo-500/30'
                          : 'border-slate-800 bg-slate-900/60'
                      }`}
                    >
                      <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5 flex-1">
                          {/* Toggle Checkbox Button */}
                          <button
                            onClick={() => handleStatusToggle(step.id, step.status)}
                            className="mt-1 shrink-0 text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
                            title="Click to toggle status (Pending -> In Progress -> Completed)"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            ) : isInProgress ? (
                              <Clock className="w-6 h-6 text-indigo-400" />
                            ) : (
                              <Circle className="w-6 h-6 text-slate-600" />
                            )}
                          </button>

                          <div className="space-y-1 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {step.stage || `Stage ${step.step_order}`}
                              </span>
                              <span className={`text-sm font-bold ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                                {step.title}
                              </span>
                            </div>

                            <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>

                            {/* Skills involved badges */}
                            {step.skills_involved && step.skills_involved.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {step.skills_involved.map((sk, i) => (
                                  <span key={i} className="text-[10px] px-2 py-0.5 bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 font-semibold rounded-md">
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expand / Collapse Button */}
                        <button
                          onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Expandable Guidance & Resources Drawer */}
                      {isExpanded && (
                        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950/40 rounded-b-2xl space-y-4 text-xs">
                          {step.why_recommended && (
                            <div>
                              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-1">
                                Why this step is recommended
                              </span>
                              <p className="text-slate-400 leading-relaxed">{step.why_recommended}</p>
                            </div>
                          )}

                          {step.evidence_requirements && (
                            <div>
                              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-1">
                                Evidence & Proof of Competence
                              </span>
                              <p className="text-slate-400">{step.evidence_requirements}</p>
                            </div>
                          )}

                          {step.resources && step.resources.length > 0 && (
                            <div>
                              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-1">
                                Recommended Resources
                              </span>
                              <div className="space-y-1.5">
                                {step.resources.map((res, i) => (
                                  <a
                                    key={i}
                                    href={res.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1.5 font-medium"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    {res.title}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
