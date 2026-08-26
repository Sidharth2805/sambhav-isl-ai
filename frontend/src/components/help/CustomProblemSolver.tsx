import React, { useState } from 'react';
import { searchSupportProblems, type SupportProblem } from '../../data/helpAssistantData';

interface CustomProblemSolverProps {
  onSelectProblem: (problem: SupportProblem) => void;
  onEscalate: () => void;
}

export const CustomProblemSolver: React.FC<CustomProblemSolverProps> = ({
  onSelectProblem,
  onEscalate,
}) => {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<SupportProblem[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const found = searchSupportProblems(query.trim());
    setResults(found);
    setHasSearched(true);
  };

  const handleReset = () => {
    setQuery('');
    setHasSearched(false);
    setResults([]);
  };

  return (
    <div className="bg-white dark:bg-[#151c28] rounded-3xl border border-[#e0e3e5] dark:border-[#243044] p-6 md:p-8 shadow-sm flex flex-col gap-5 animate-fadeIn font-['Inter',sans-serif]">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="material-symbols-outlined text-[#fe9832] text-[22px]">contact_support</span>
          <h2 className="text-lg md:text-xl font-black text-[#030813] dark:text-white tracking-tight">
            Can&apos;t find your problem?
          </h2>
        </div>
        <p className="text-xs text-[#45474c] dark:text-[#c1c6d7] leading-relaxed">
          Ask us about any issue related to Sambhav, ISL, accessibility, video calls, speech transcription, or the avatar.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative flex items-center">
        <div className="absolute left-4 text-gray-400 pointer-events-none flex items-center">
          <span className="material-symbols-outlined text-[20px]">search</span>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your issue (e.g., 'microphone stopped during video call', 'avatar screen is grey')..."
          className="w-full pl-11 pr-28 py-3.5 bg-[#f8fafc] dark:bg-[#0c121e] border border-[#e0e3e5] dark:border-[#243044] focus:border-[#fe9832] focus:ring-2 focus:ring-[#fe9832]/20 rounded-2xl text-xs text-[#030813] dark:text-white placeholder-[#45474c]/50 dark:placeholder-[#828796]/60 transition-all outline-none"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="absolute right-2 px-4 py-2 bg-gradient-to-r from-[#fe9832] to-[#e8872b] hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-[#542900] rounded-xl font-black text-xs transition-all shadow-sm flex items-center gap-1"
        >
          <span>Diagnose</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </form>

      {/* Search Results */}
      {hasSearched && (
        <div className="flex flex-col gap-3 pt-2">
          {results.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-[#8dfc75] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Found {results.length} matching solutions for &ldquo;{query}&rdquo;:</span>
              </span>

              <div className="flex flex-col gap-2">
                {results.slice(0, 5).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onSelectProblem(p)}
                    className="p-3.5 bg-[#f8fafc] dark:bg-[#0c121e] hover:bg-[#fe9832]/10 border border-[#e0e3e5] dark:border-[#243044] hover:border-[#fe9832] rounded-2xl text-left transition-all flex items-center justify-between gap-3 group"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#030813] dark:text-white group-hover:text-[#fe9832] transition-colors block">
                        {p.title}
                      </span>
                      <span className="text-[11px] text-[#45474c] dark:text-[#828796] block mt-0.5 truncate">
                        {p.summary}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-gray-400 group-hover:text-[#fe9832] transition-colors shrink-0">
                      chevron_right
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-5 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl flex flex-col gap-3 animate-fadeIn text-xs">
              <div className="flex items-start gap-2.5 text-amber-800 dark:text-amber-300">
                <span className="material-symbols-outlined text-[22px] shrink-0">help_center</span>
                <div>
                  <span className="text-xs font-bold block">
                    I couldn&apos;t find a reliable automated solution for &ldquo;{query}&rdquo;.
                  </span>
                  <span className="text-[11px] text-[#45474c] dark:text-[#c1c6d7] mt-0.5 block leading-relaxed">
                    Our team can review your custom case directly. You can submit a support inquiry or try searching with different keywords.
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={onEscalate}
                  className="px-4 py-2 bg-gradient-to-r from-[#fe9832] to-[#e8872b] hover:brightness-110 active:scale-95 text-[#542900] rounded-xl font-black text-xs transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">support_agent</span>
                  <span>Contact Support Team</span>
                </button>

                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-white dark:bg-[#151c28] hover:bg-[#f1f4f6] dark:hover:bg-[#1f2a3c] border border-[#e0e3e5] dark:border-[#243044] text-[#45474c] dark:text-[#c1c6d7] rounded-xl font-bold text-xs transition-all active:scale-95"
                >
                  Try Another Question
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
