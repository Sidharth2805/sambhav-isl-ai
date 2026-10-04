import React from 'react';
import { CAREER_DOMAINS } from '../data/careerDomains';
import type { CareerDomain } from '../types/careerDiscovery';

interface CareerDomainSelectorProps {
  onSelectDomain: (domain: CareerDomain) => void;
  onBackToLanding: () => void;
}

export const CareerDomainSelector: React.FC<CareerDomainSelectorProps> = ({
  onSelectDomain,
  onBackToLanding,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6 animate-fadeIn">
      
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">explore</span>
              Step 1: Choose Career Track
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Select Your Career Pathway
          </h1>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 self-start sm:self-auto">
          10 Tracks Available
        </span>
      </div>

      {/* 10-Item Career Domain Grid (Visual-First, High Contrast) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {CAREER_DOMAINS.map((domain) => {
          const isReady = domain.isAvailable;

          return (
            <div
              key={domain.id}
              onClick={() => onSelectDomain(domain)}
              className={`group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer ${
                isReady
                  ? 'bg-white dark:bg-slate-900 border-indigo-300 dark:border-indigo-700 shadow-md ring-2 ring-indigo-500/20 hover:scale-[1.02]'
                  : 'bg-white/90 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.01]'
              }`}
            >
              {/* Visual Photo Banner */}
              <div className="relative aspect-[16/11] w-full overflow-hidden bg-slate-950">
                <img
                  src={domain.image}
                  alt={domain.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />

                {/* Status Badge */}
                <div className="absolute top-2.5 left-2.5">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black border shadow-xs ${
                      isReady
                        ? 'bg-emerald-500 text-white border-emerald-400'
                        : 'bg-slate-900/80 text-amber-300 border-amber-400/40 backdrop-blur-xs'
                    }`}
                  >
                    {isReady ? '⚡ 25 Scenarios Ready' : '⏳ In Development'}
                  </span>
                </div>

                {/* Bottom Overlay Title & Icon */}
                <div className="absolute bottom-2.5 left-3 right-3 text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-amber-300">{domain.icon}</span>
                  </span>
                  <h3 className="text-sm font-bold text-white tracking-tight leading-tight line-clamp-1">
                    {domain.title}
                  </h3>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="p-3 bg-white dark:bg-slate-900 flex-1 flex flex-col justify-between space-y-2">
                <div className="flex flex-wrap gap-1">
                  {domain.highlightSkills.slice(0, 2).map((skill, si) => (
                    <span
                      key={si}
                      className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 truncate"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  className={`w-full py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs ${
                    isReady
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{isReady ? 'Start' : 'Explore'}</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
