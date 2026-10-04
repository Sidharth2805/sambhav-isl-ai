import React from 'react';
import type { TaskScoreReport, EngineeringTopicScore, JobPathwayDetailed } from '../types/careerDiscovery';
import { DETAILED_ENGINEERING_JOB_ROADMAPS } from '../data/engineeringJobRoadmaps';

interface CareerResultsViewProps {
  report: TaskScoreReport;
  topicScores: EngineeringTopicScore[];
  onSelectJobRoadmap: (job: JobPathwayDetailed) => void;
  onRetakeAssessment: () => void;
  onBackToDomains: () => void;
}

export const CareerResultsView: React.FC<CareerResultsViewProps> = ({
  report,
  topicScores,
  onSelectJobRoadmap,
  onRetakeAssessment,
  onBackToDomains,
}) => {
  const sortedTopics = [...topicScores].sort((a, b) => b.marksObtained - a.marksObtained);
  const bestTopic = sortedTopics[0] || topicScores[0];

  // Dynamic match percentage calculations based on trade performance
  const dynamicJobMatches: JobPathwayDetailed[] = DETAILED_ENGINEERING_JOB_ROADMAPS.map((job) => {
    const topicScoreObj = topicScores.find((ts) => ts.topicId === job.topicId);
    const topicMarks = topicScoreObj ? topicScoreObj.marksObtained : 60;
    const overallMarks = report.scoreBreakdown.totalMarks;

    let calculatedMatch = Math.round(topicMarks * 0.7 + overallMarks * 0.3);
    if (job.topicId === bestTopic?.topicId) {
      calculatedMatch = Math.min(99, Math.max(88, calculatedMatch + 8));
    } else {
      calculatedMatch = Math.min(88, Math.max(45, calculatedMatch - 5));
    }

    return {
      ...job,
      matchPercentage: calculatedMatch,
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);

  const topJob = dynamicJobMatches[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToDomains}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Domains
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Step 2: Aptitude Results
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Your Engineering Results & Matched Careers
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRetakeAssessment}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">restart_alt</span>
            Retake
          </button>
        </div>
      </div>

      {/* 1. Visual Hero Spotlight for #1 Match */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white border-2 border-amber-400/40 shadow-xl">
        <div className="relative aspect-[21/9] sm:aspect-[24/8] w-full overflow-hidden">
          <img
            src={topJob?.imageAssetKey || '/images/career councling/electrical.png'}
            alt={topJob?.title}
            className="w-full h-full object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Top Rank Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 flex items-center gap-1.5 shadow-md">
              <span className="material-symbols-outlined text-[16px]">emoji_events</span>
              #1 Highest Aptitude Match ({topJob?.matchPercentage}%)
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/80 text-amber-300 border border-amber-400/30 backdrop-blur-xs">
              {bestTopic?.topicName}
            </span>
          </div>

          {/* Bottom Card Content */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight drop-shadow-sm">
                {topJob?.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono pt-1">
                <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                  💰 {topJob?.salaryTiers[0].rangeLPA} → {topJob?.salaryTiers[2].rangeLPA}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
                  🎓 {topJob?.recommendedMajors[0]}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectJobRoadmap(topJob)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-orange-500/30 flex items-center gap-2 cursor-pointer shrink-0 transition-transform active:scale-95"
            >
              <span>View Career Roadmap</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Visual Performance by 5 Engineering Trades */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-indigo-500">analytics</span>
            Aptitude Marks Across 5 Trades
          </h3>
          <span className="text-xs font-mono font-bold text-slate-500">Total: {report.scoreBreakdown.totalMarks}/100</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {topicScores.map((ts, idx) => {
            const isBest = ts.topicId === bestTopic?.topicId;

            return (
              <div
                key={ts.topicId}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isBest
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-sm ring-2 ring-amber-400/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">#{idx + 1}</span>
                  <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded ${
                    isBest ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {ts.marksObtained} pts
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mb-2">
                  {ts.topicName}
                </h4>

                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isBest ? 'bg-amber-500' : 'bg-indigo-500'}`}
                    style={{ width: `${ts.marksObtained}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1.5 font-mono">
                  <span>{ts.questionsSolved}/5 Solved</span>
                  <span>{ts.avgDurationSec}s</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Visual Career Pathway Grid (Ranked with Image Previews) */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-indigo-500">work</span>
          All Matched Engineering Career Options (Click to View Roadmap)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dynamicJobMatches.map((job, rank) => {
            const isTop = rank === 0;

            return (
              <div
                key={job.id}
                onClick={() => onSelectJobRoadmap(job)}
                className={`group rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col justify-between cursor-pointer hover:scale-[1.01] ${
                  isTop
                    ? 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-700 shadow-md ring-2 ring-amber-400/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-400 shadow-xs'
                }`}
              >
                {/* Visual Thumbnail */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                  <img
                    src={job.imageAssetKey || '/images/career councling/electrical.png'}
                    alt={job.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                      {job.topicName}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black font-mono ${
                      isTop
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : 'bg-indigo-600 text-white'
                    }`}>
                      {job.matchPercentage}% Match
                    </span>
                  </div>

                  {/* Title Overlay */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <h4 className="text-sm font-bold text-white tracking-tight leading-snug drop-shadow-sm line-clamp-1">
                      {job.title}
                    </h4>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono">
                    <span className="material-symbols-outlined text-[15px] text-emerald-500">payments</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {job.salaryTiers[0].rangeLPA} (Entry) → {job.salaryTiers[2].rangeLPA} (Pro)
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`w-full py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 cursor-pointer ${
                      isTop
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span>View Roadmap</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
