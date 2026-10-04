import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  User,
  Sparkles,
  Route,
  Briefcase,
  BookOpen,
  Award,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  Plus,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';
import { careerService } from '../services/careerService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ResumeUploadModal from '../components/common/ResumeUploadModal';
import GuidedCareerFinderModal from '../components/common/GuidedCareerFinderModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [opportunities, setOpportunities] = useState([]);

  // Modals
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [matcherModalOpen, setMatcherModalOpen] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [profData, matchData, roadmapData, oppData] = await Promise.all([
        profileService.getProfile().catch(() => null),
        careerService.getMatches().catch(() => []),
        careerService.getRoadmaps().catch(() => []),
        careerService.getOpportunities({ limit: 4 }).catch(() => []),
      ]);

      setProfile(profData);
      setMatches(matchData);
      setRoadmaps(roadmapData);
      setOpportunities(oppData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRecalculateMatches = async () => {
    setRecalculating(true);
    try {
      await careerService.calculateMatches();
      const updatedMatches = await careerService.getMatches();
      setMatches(updatedMatches);
    } catch (err) {
      console.error('Recalculation error:', err);
    } finally {
      setRecalculating(false);
    }
  };

  const handleGenerateRoadmap = async (careerId, careerTitle) => {
    try {
      await careerService.generateRoadmap(
        careerId,
        `Roadmap to ${careerTitle}`,
        'Personalized progression path based on your skill gaps'
      );
      const updatedRoadmaps = await careerService.getRoadmaps();
      setRoadmaps(updatedRoadmaps);
      navigate('/roadmap');
    } catch (err) {
      console.error('Failed to create roadmap', err);
      navigate(`/careers/${careerId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading career workspace..." />
      </div>
    );
  }

  const skillCount = profile?.user_skills?.length || 0;
  const educationCount = profile?.educations?.length || 0;
  const interestCount = profile?.user_interests?.length || 0;
  const isProfileIncomplete = !profile?.headline || skillCount === 0 || educationCount === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Sambhav-inspired Welcome Hero Header */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/50 border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 border border-slate-700 text-xs font-semibold text-blue-400">
              <Compass className="w-3.5 h-3.5" /> Career Intelligence &amp; Matching Hub
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.full_name || 'Explorer'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              {profile?.headline ||
                'Setup your profile or upload your resume to generate deterministic match scores and actionable roadmaps.'}
            </p>
          </div>

          {/* Quick Action Triggers */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              icon={Sparkles}
              onClick={() => setMatcherModalOpen(true)}
              className="bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-bold shadow-md shadow-indigo-500/20"
            >
              Interactive Career Finder
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={UploadCloud}
              onClick={() => setResumeModalOpen(true)}
              className="border-slate-700 hover:border-teal-500 text-slate-200"
            >
              Upload / Update CV
            </Button>

            <Button
              variant="ghost"
              size="sm"
              icon={RefreshCw}
              onClick={handleRecalculateMatches}
              loading={recalculating}
              title="Recalculate Matches"
            >
              Recalculate
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Incomplete Banner */}
      {isProfileIncomplete && (
        <div className="p-4 sm:p-5 rounded-xl bg-amber-950/40 border border-amber-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-900/60 border border-amber-700/60 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 sm:mt-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="leading-relaxed">
              <span className="font-bold text-amber-200">Profile Incomplete: </span>
              <span className="text-amber-300/90">
                You have {skillCount} skills and {educationCount} education records. Add more verified skills or upload your resume to unlock accurate matching scores.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
            <Button
              variant="outline"
              size="sm"
              icon={UploadCloud}
              onClick={() => setResumeModalOpen(true)}
              className="border-amber-700/80 text-amber-200 hover:bg-amber-900/50 hover:border-amber-500"
            >
              Upload Resume
            </Button>
            <Link to="/profile">
              <Button
                variant="primary"
                size="sm"
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-sm"
              >
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Metric Counters Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center justify-between p-5 border-slate-800">
          <div>
            <p className="text-xs font-semibold text-slate-400">Mapped Skills</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1">{skillCount}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
        </Card>

        <Card className="flex items-center justify-between p-5 border-slate-800">
          <div>
            <p className="text-xs font-semibold text-slate-400">Education Records</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1">{educationCount}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-950/60 border border-teal-800/40 flex items-center justify-center text-teal-400">
            <BookOpen className="w-5 h-5" />
          </div>
        </Card>

        <Card className="flex items-center justify-between p-5 border-slate-800">
          <div>
            <p className="text-xs font-semibold text-slate-400">Top Matches</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">{matches.length}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>

        <Card className="flex items-center justify-between p-5 border-slate-800">
          <div>
            <p className="text-xs font-semibold text-slate-400">Active Roadmaps</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-1">{roadmaps.length}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400">
            <Route className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Main Grid: Matches & Roadmaps vs Profile & Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Career Matches & Action Roadmaps */}
        <div className="lg:col-span-2 space-y-8">
          {/* Top Career Matches Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Your Top Career Matches
                </h2>
                <p className="text-xs text-slate-400">
                  Calculated deterministically via multi-factor weighting (Skills, Education, Preferences)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Compass}
                  onClick={() => setMatcherModalOpen(true)}
                >
                  Custom Match
                </Button>
                <Link to="/careers" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
                  View All Tracks &rarr;
                </Link>
              </div>
            </div>

            {matches.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No Career Matches Computed Yet"
                description="Click 'Interactive Career Finder' or upload your resume to immediately compute matching scores across 152+ industry tracks."
                actionLabel="Launch Career Finder"
                onAction={() => setMatcherModalOpen(true)}
              />
            ) : (
              <div className="space-y-3">
                {matches.slice(0, 5).map((match) => (
                  <Card key={match.id} hoverEffect className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-800">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-100 text-base">{match.career?.title}</h4>
                        <Badge variant="indigo" size="xs">
                          {match.career?.career_type?.name || 'Track'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{match.career?.summary}</p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <span>Skills: <strong className="text-slate-200">{Math.round(match.skill_score)}%</strong></span>
                        <span>&middot;</span>
                        <span>Interests: <strong className="text-slate-200">{Math.round(match.interest_score)}%</strong></span>
                        <span>&middot;</span>
                        <span>Education: <strong className="text-slate-200">{Math.round(match.education_score)}%</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      <div className="text-right">
                        <div className="text-xl font-extrabold text-emerald-400">
                          {Math.round(match.match_score)}%
                        </div>
                        <Badge variant="green" size="xs">Deterministic</Badge>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Link to={`/careers/${match.career?.id}`}>
                          <Button variant="outline" size="xs" className="w-full">
                            Gap Analysis
                          </Button>
                        </Link>
                        <Button
                          variant="primary"
                          size="xs"
                          icon={Route}
                          onClick={() => handleGenerateRoadmap(match.career?.id, match.career?.title)}
                        >
                          Roadmap
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Active Roadmaps Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Route className="w-4 h-4 text-blue-400" />
                  Active Progression Roadmaps
                </h2>
                <p className="text-xs text-slate-400">
                  Targeted milestones to bridge your missing competencies and land your goal role
                </p>
              </div>
              <Link to="/roadmap" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                Manage Roadmaps &rarr;
              </Link>
            </div>

            {roadmaps.length === 0 ? (
              <EmptyState
                icon={Route}
                title="No Active Roadmaps"
                description="Pick any target career path to automatically generate a personalized 9-stage progression roadmap."
                actionLabel="Explore Career Paths"
                onAction={() => navigate('/careers')}
              />
            ) : (
              <div className="space-y-3">
                {roadmaps.map((rm) => (
                  <Card key={rm.id} hoverEffect className="p-4 flex items-center justify-between border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-200 text-sm">{rm.title}</h4>
                        <Badge variant="teal" size="xs">{rm.status}</Badge>
                      </div>
                      <p className="text-xs text-slate-400">{rm.description}</p>
                    </div>
                    <Link to="/roadmap">
                      <Button variant="outline" size="xs">
                        View Steps &rarr;
                      </Button>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right 1 Col: Profile Snapshot & Opportunities */}
        <div className="space-y-8">
          {/* Profile Overview Card */}
          <Card className="p-5 space-y-4 border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-400" /> Profile Summary
              </h3>
              <Link to="/profile" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                Edit
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-500 block">Experience Level:</span>
                <span className="text-slate-200 font-medium capitalize">
                  {profile?.experience_level?.replace('_', ' ') || 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Work Preference:</span>
                <span className="text-slate-200 font-medium capitalize">
                  {profile?.preferences?.preferred_work_environment || 'Hybrid'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">My Skills ({skillCount})</span>
                <button
                  onClick={() => setResumeModalOpen(true)}
                  className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1"
                >
                  <UploadCloud className="w-3 h-3" /> + From CV
                </button>
              </div>

              {profile?.user_skills?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile.user_skills.slice(0, 8).map((us) => (
                    <Badge key={us.id} variant="primary" size="xs">
                      {us.skill?.name || 'Skill'}
                    </Badge>
                  ))}
                  {profile.user_skills.length > 8 && (
                    <span className="text-[10px] text-slate-500 self-center">
                      +{profile.user_skills.length - 8} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No skills added yet.</p>
              )}
            </div>
          </Card>

          {/* Opportunities Preview Card */}
          <Card className="p-5 space-y-4 border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-teal-400" /> Verified Opportunities
              </h3>
              <Link to="/opportunities" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                View All
              </Link>
            </div>

            {opportunities.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No active opportunities loaded.</p>
            ) : (
              <div className="space-y-3">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="text-xs border-b border-slate-800/60 last:border-0 pb-2.5 last:pb-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-200">{opp.title}</p>
                      <Badge variant={opp.is_demo ? 'amber' : 'green'} size="xs">
                        {opp.is_demo ? 'Demo' : 'Official'}
                      </Badge>
                    </div>
                    <p className="text-slate-400 mt-0.5">{opp.organization_name}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Global Modals */}
      <ResumeUploadModal
        isOpen={resumeModalOpen}
        onClose={() => setResumeModalOpen(false)}
        onUploadSuccess={() => loadDashboardData()}
      />

      <GuidedCareerFinderModal
        isOpen={matcherModalOpen}
        onClose={() => setMatcherModalOpen(false)}
        onOpenResumeUpload={() => setResumeModalOpen(true)}
      />
    </div>
  );
}
