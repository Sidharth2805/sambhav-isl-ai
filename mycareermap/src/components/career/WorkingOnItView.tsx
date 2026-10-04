import React from 'react';
import type { CareerDomain } from '../../types/careerDiscovery';

interface WorkingOnItViewProps {
  domain: CareerDomain;
  onBackToDomains: () => void;
  onLaunchEngineering: () => void;
}

export const WorkingOnItView: React.FC<WorkingOnItViewProps> = ({
  domain,
  onBackToDomains,
  onLaunchEngineering,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Top Back Navigation */}
      <div>
        <button
          type="button"
          onClick={onBackToDomains}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Career Domains
        </button>
      </div>

      {/* Main Feature Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xl space-y-6">
        
        {/* Visual Badge & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[32px]">{domain.icon}</span>
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                In Active Curriculum Development
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                {domain.title}
              </h2>
            </div>
          </div>

          <span className="text-xs font-semibold text-slate-400">
            {domain.category}
          </span>
        </div>

        {/* Informative Body */}
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            The experiential diagnostic simulation module for <strong>{domain.title}</strong> is currently being authored and calibrated by our vocational curriculum specialists.
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Upcoming Hands-On Scenarios in this Track:
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {domain.highlightSkills.map((skill, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="material-symbols-outlined text-[15px] text-amber-500">pending</span>
                  <span>{skill} Simulation Lab</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3.5">
          <button
            type="button"
            onClick={onLaunchEngineering}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">precision_manufacturing</span>
            Try Engineering Assessment (25 Ready Scenarios)
          </button>

          <button
            type="button"
            onClick={onBackToDomains}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition cursor-pointer"
          >
            Browse Other Career Domains
          </button>
        </div>

      </div>

    </div>
  );
};
