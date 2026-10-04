import React from 'react';
import type { JobPathwayDetailed } from '../types/careerDiscovery';

interface CareerRoadmapViewProps {
  job: JobPathwayDetailed;
  onBackToResults: () => void;
  onRetakeAssessment: () => void;
}

export const CareerRoadmapView: React.FC<CareerRoadmapViewProps> = ({
  job,
  onBackToResults,
  onRetakeAssessment,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6 animate-fadeIn">
      
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToResults}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Matches
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Step 3: Roadmap & Salary Blueprint
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {job.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">print</span>
            Print PDF
          </button>

          <button
            type="button"
            onClick={onRetakeAssessment}
            className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">restart_alt</span>
            Retake
          </button>
        </div>
      </div>

      {/* 1. Visual Hero Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl">
        <div className="relative aspect-[21/8] sm:aspect-[24/7] w-full overflow-hidden">
          <img
            src={job.imageAssetKey || '/images/career councling/electrical.png'}
            alt={job.title}
            className="w-full h-full object-cover brightness-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3.5 left-4 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 backdrop-blur-xs">
              {job.topicName}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-xs">
              {job.category}
            </span>
          </div>

          <div className="absolute top-3.5 right-4">
            <span className="px-3.5 py-1 rounded-full text-xs font-black font-mono bg-emerald-500 text-white shadow-md">
              {job.matchPercentage}% Compatibility Match
            </span>
          </div>

          {/* Title & Overview on Bottom */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 space-y-1 max-w-3xl">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm">
              {job.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 line-clamp-2">
              {job.overview}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Visual Salary & Knowledge Tier Ladder (LPA Breakdown) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-emerald-500">payments</span>
            Salary Ladder by Knowledge Level (LPA)
          </h3>
          <span className="text-xs text-slate-500 font-mono">Market Compensation Range</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {job.salaryTiers.map((tier, idx) => {
            const isPro = idx === 2;
            const isMid = idx === 1;

            return (
              <div
                key={tier.level}
                className={`rounded-2xl border p-4 sm:p-5 space-y-3 transition-all ${
                  isPro
                    ? 'bg-gradient-to-b from-amber-500/15 to-white dark:to-slate-900 border-amber-300 dark:border-amber-700 shadow-md ring-2 ring-amber-400/20'
                    : isMid
                    ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800/80 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    isPro
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : isMid
                      ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {isPro ? '👑 Pro Specialist' : isMid ? '🚀 Proficient' : '🌱 Entry Level'}
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-slate-400">{tier.experienceYears}</span>
                </div>

                <div>
                  <div className="text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
                    {tier.rangeLPA}
                  </div>
                  <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">
                    {tier.typicalJobRole}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  {tier.keyCompetenciesExpected.map((comp, ci) => (
                    <div key={ci} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <span className={`material-symbols-outlined text-[14px] shrink-0 mt-0.5 ${
                        isPro ? 'text-amber-500' : isMid ? 'text-indigo-500' : 'text-emerald-500'
                      }`}>
                        check_circle
                      </span>
                      <span className="line-clamp-1">{comp}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Recommended College Majors & Core Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Recommended Majors */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-indigo-500">school</span>
            Target College Degrees
          </h3>

          <div className="space-y-2">
            {job.recommendedMajors.map((major, mi) => (
              <div
                key={mi}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2"
              >
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                  {mi + 1}
                </span>
                <span className="truncate">{major}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Core Subjects & Specializations */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-amber-500">auto_stories</span>
            Core Subjects to Master as Majors
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {job.coreSubjectsToMaster.map((subject, si) => (
              <div
                key={si}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5"
              >
                <span className="material-symbols-outlined text-[15px] text-amber-500 shrink-0 mt-0.5">
                  bookmark
                </span>
                <span className="line-clamp-2 leading-snug">{subject}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Visual Step-by-Step Phased Roadmap */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-indigo-500">timeline</span>
          Phased Career Trajectory
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {job.roadmapPhases.map((phase) => (
            <div
              key={phase.phaseNumber}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {phase.phaseNumber}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {phase.timeline}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {phase.phaseName}
              </h4>

              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                {phase.coreMilestones.slice(0, 2).map((m, mi) => (
                  <div key={mi} className="flex items-start gap-1">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span className="line-clamp-2">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Deaf & Visual Work Environment Advantages */}
      <div className="rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 p-4 sm:p-5 space-y-2.5">
        <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-emerald-600 dark:text-emerald-400">
            accessibility_new
          </span>
          Deaf & Visual Work Environment Advantages
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {job.deafAccessibilityAdvantages.map((adv, ai) => (
            <div
              key={ai}
              className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-emerald-200/80 dark:border-emerald-800/80 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px] text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                check
              </span>
              <span className="line-clamp-2">{adv}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
