import React, { useState } from 'react';
import { careerAssets } from '../data/careerDiscovery/careerAssets';
import { CareerDomainSelector } from '../components/career/CareerDomainSelector';
import { WorkingOnItView } from '../components/career/WorkingOnItView';
import { EngineeringAssessmentView } from '../components/career/EngineeringAssessmentView';
import { CareerResultsView } from '../components/career/CareerResultsView';
import { CareerRoadmapView } from '../components/career/CareerRoadmapView';
import type {
  CareerDomain,
  CareerAssessmentViewMode,
  TaskScoreReport,
  EngineeringTopicScore,
  JobPathwayDetailed,
} from '../types/careerDiscovery';
import { DETAILED_ENGINEERING_JOB_ROADMAPS } from '../data/careerDiscovery/engineeringJobRoadmaps';

export const CareerDiscoveryPage: React.FC = () => {
  // Master View Navigation State
  const [viewMode, setViewMode] = useState<CareerAssessmentViewMode>('LANDING');
  const [selectedDomain, setSelectedDomain] = useState<CareerDomain | null>(null);
  const [howItWorksOpen, setHowItWorksOpen] = useState<boolean>(false);

  // Assessment & Evaluation Results State
  const [completedReport, setCompletedReport] = useState<TaskScoreReport | null>(null);
  const [topicScores, setTopicScores] = useState<EngineeringTopicScore[]>([]);
  const [selectedJobRoadmap, setSelectedJobRoadmap] = useState<JobPathwayDetailed | null>(null);

  // 1. User Clicks "Start Assessment" on Landing Page
  const handleStartAssessment = () => {
    setViewMode('DOMAIN_SELECT');
  };

  // 2. User Selects a Career Domain from the 10 Options
  const handleSelectDomain = (domain: CareerDomain) => {
    setSelectedDomain(domain);
    if (domain.id === 'engineering') {
      setViewMode('ASSESSMENT');
    } else {
      setViewMode('WORKING_ON_IT');
    }
  };

  // 3. User Completes the 25-Question Diagnostic Assessment
  const handleAssessmentCompleted = (
    report: TaskScoreReport,
    scores: EngineeringTopicScore[]
  ) => {
    setCompletedReport(report);
    setTopicScores(scores);
    setViewMode('RESULTS');
  };

  // 4. User Selects a Specific Job Option to inspect the Roadmap
  const handleSelectJobRoadmap = (job: JobPathwayDetailed) => {
    setSelectedJobRoadmap(job);
    setViewMode('ROADMAP_VIEW');
  };

  // 5. Retake / Reset Handler
  const handleRetakeAssessment = () => {
    setViewMode('ASSESSMENT');
  };

  // ==========================================
  // RENDER: SCREEN 2 - DOMAIN SELECTOR (Grid View)
  // ==========================================
  if (viewMode === 'DOMAIN_SELECT') {
    return (
      <CareerDomainSelector
        onSelectDomain={handleSelectDomain}
        onBackToLanding={() => setViewMode('LANDING')}
      />
    );
  }

  // ==========================================
  // RENDER: SCREEN 2B - "WORKING ON IT" VIEW
  // ==========================================
  if (viewMode === 'WORKING_ON_IT' && selectedDomain) {
    return (
      <WorkingOnItView
        domain={selectedDomain}
        onBackToDomains={() => setViewMode('DOMAIN_SELECT')}
        onLaunchEngineering={() => setViewMode('ASSESSMENT')}
      />
    );
  }

  // ==========================================
  // RENDER: SCREEN 3 - 25-QUESTION ASSESSMENT
  // ==========================================
  if (viewMode === 'ASSESSMENT') {
    return (
      <EngineeringAssessmentView
        studentId="student-auth-user"
        onBackToDomains={() => setViewMode('DOMAIN_SELECT')}
        onCompleteAssessment={handleAssessmentCompleted}
      />
    );
  }

  // ==========================================
  // RENDER: SCREEN 4 - RESULTS & JOB MATCHES
  // ==========================================
  if (viewMode === 'RESULTS' && completedReport) {
    return (
      <CareerResultsView
        report={completedReport}
        topicScores={topicScores}
        onSelectJobRoadmap={handleSelectJobRoadmap}
        onRetakeAssessment={handleRetakeAssessment}
        onBackToDomains={() => setViewMode('DOMAIN_SELECT')}
      />
    );
  }

  // ==========================================
  // RENDER: SCREEN 5 - DETAILED CAREER ROADMAP
  // ==========================================
  if (viewMode === 'ROADMAP_VIEW') {
    const activeJob = selectedJobRoadmap || DETAILED_ENGINEERING_JOB_ROADMAPS[0];
    return (
      <CareerRoadmapView
        job={activeJob}
        onBackToResults={() => {
          if (completedReport) {
            setViewMode('RESULTS');
          } else {
            setViewMode('DOMAIN_SELECT');
          }
        }}
        onRetakeAssessment={handleRetakeAssessment}
      />
    );
  }

  // ==========================================
  // RENDER: SCREEN 1 - CAREER DISCOVERY LANDING
  // ==========================================
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-10 animate-fadeIn">
      
      {/* 1. Hero / Career Discovery Entry Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl p-6 sm:p-10 lg:p-12">
        <div className="absolute -right-16 -top-16 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30">
              <span className="material-symbols-outlined text-[15px]">explore</span>
              Experiential Career Discovery
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Don&apos;t Know What You Want to Become?{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                That&apos;s Okay.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              You don&apos;t have to choose a career first. Explore real-world tasks, discover your strengths, and find pathways worth exploring.
            </p>

            {/* Action Buttons: "Start Assessment" (Renamed) and "How It Works" */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleStartAssessment}
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all cursor-pointer flex items-center gap-2 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-xl">play_arrow</span>
                Start Assessment
              </button>

              <button
                type="button"
                onClick={() => setHowItWorksOpen(true)}
                className="px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white font-semibold text-sm sm:text-base border border-slate-700/80 transition-colors cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">help_outline</span>
                How It Works
              </button>
            </div>
          </div>

          {/* Right: Vocational Spotlight Banner */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-800/50 shadow-2xl p-2 group">
              <img
                src={careerAssets.student.measuring}
                alt="Vocational student measuring circuit voltage with digital multimeter"
                className="w-full h-auto rounded-xl object-cover"
                loading="eager"
              />
              <div className="absolute inset-x-4 bottom-4 p-3 rounded-xl bg-slate-950/85 backdrop-blur-xs border border-slate-700/80 text-white">
                <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  10 Domains • 25 Practical Scenarios
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Hands-on simulated instruments, trade aptitude diagnosis, and salary roadmaps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Fast Track Career Pathways Preview */}
      <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[16px]">alt_route</span>
              10 Career Tracks Available
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Explore Available Vocational Domains
            </h3>
          </div>

          <button
            type="button"
            onClick={handleStartAssessment}
            className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span>Choose Your Domain</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            onClick={handleStartAssessment}
            className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-white dark:from-slate-800/80 dark:to-slate-900 border border-indigo-200 dark:border-indigo-800/80 hover:border-indigo-400 transition cursor-pointer space-y-2 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">precision_manufacturing</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500 text-white">
                25 Scenarios Ready
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Engineering & Technology
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Electrical, Electronics, Mechanical, Civil, and Computer Science interactive testing.
            </p>
          </div>

          <div
            onClick={handleStartAssessment}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer space-y-2 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">stethoscope</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                In Development
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Doctor & Healthcare
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Clinical observation, pharmacology, biomedical analysis, and patient triaging.
            </p>
          </div>

          <div
            onClick={handleStartAssessment}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer space-y-2 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[20px]">account_balance</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                In Development
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Government & Civil Services
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Public administration, constitutional policy, resource allocation, and civic governance.
            </p>
          </div>
        </div>
      </section>

      {/* "How It Works" Informational Modal */}
      {howItWorksOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          onClick={() => setHowItWorksOpen(false)}
        >
          <div
            className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setHowItWorksOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close dialog"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                <span className="material-symbols-outlined text-2xl">lightbulb</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  How Experiential Assessment Works
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No questionnaires. No hypothetical quizzes. Real hands-on problem solving.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 my-6 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-slate-900 dark:text-white">Select Your Domain:</strong>
                  <p className="text-xs mt-0.5">Choose from 10 domains (e.g. Engineering, Medicine, Government, Business, Law).</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-slate-900 dark:text-white">25 Interactive Challenges:</strong>
                  <p className="text-xs mt-0.5">Solve 5 practical scenarios per trade using simulated tools (5 clicks allowed per question).</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-slate-900 dark:text-white">Aptitude-Ranked Career Roadmaps:</strong>
                  <p className="text-xs mt-0.5">Discover recommended college majors, required subjects, and salary tiers (LPA) from Entry to Pro.</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setHowItWorksOpen(false);
                handleStartAssessment();
              }}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition cursor-pointer"
            >
              Start Career Assessment Now
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
