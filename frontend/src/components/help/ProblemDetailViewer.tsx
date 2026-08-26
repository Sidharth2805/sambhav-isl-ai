import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SupportProblem } from '../../data/helpAssistantData';

interface ProblemDetailViewerProps {
  problem: SupportProblem;
  onBackToQuestions: () => void;
  onResetToCategories: () => void;
  onEscalate: () => void;
}

export const ProblemDetailViewer: React.FC<ProblemDetailViewerProps> = ({
  problem,
  onBackToQuestions,
  onResetToCategories,
  onEscalate,
}) => {
  const navigate = useNavigate();
  const [resolutionStatus, setResolutionStatus] = useState<'unresolved' | 'solved' | 'needs_help'>('unresolved');
  const [activeGuidedAnswers, setActiveGuidedAnswers] = useState<Record<number, { isPass: boolean; hint?: string }>>({});
  const [selectedOptionTab, setSelectedOptionTab] = useState<number>(0);

  const handleGuidedOptionClick = (stepNum: number, isPass: boolean, hint?: string) => {
    setActiveGuidedAnswers((prev) => ({
      ...prev,
      [stepNum]: { isPass, hint },
    }));
  };

  const handleActionClick = () => {
    if (problem.actionRoute) {
      navigate(problem.actionRoute);
    }
  };

  return (
    <div className="bg-white dark:bg-[#151c28] rounded-3xl border border-[#e0e3e5] dark:border-[#243044] p-6 sm:p-10 shadow-sm flex flex-col gap-8 animate-fadeIn font-['Inter',sans-serif]">
      
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-4 border-b border-[#e0e3e5] dark:border-[#243044] pb-5">
        <button
          onClick={onBackToQuestions}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f1f4f6] dark:bg-[#0c121e] hover:bg-[#fe9832]/15 border border-[#e0e3e5] dark:border-[#243044] hover:border-[#fe9832] text-xs font-bold text-[#030813] dark:text-white transition-all group"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform text-[#fe9832]">
            arrow_back
          </span>
          <span>Back to Questions</span>
        </button>

        <button
          onClick={onResetToCategories}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#45474c] dark:text-[#828796] hover:text-[#fe9832] transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">grid_view</span>
          <span>All Categories</span>
        </button>
      </div>

      {/* Problem Title & Summary */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#fe9832] bg-[#fe9832]/10 border border-[#fe9832]/20 px-3 py-1 rounded-full">
            Problem Troubleshooting
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-[#030813] dark:text-white tracking-tight leading-snug">
          {problem.title}
        </h2>
        <p className="text-xs sm:text-sm text-[#45474c] dark:text-[#c1c6d7] leading-relaxed font-medium">
          {problem.summary}
        </p>

        {/* Pipeline Stage Visualizer */}
        {problem.pipelineStage && (
          <div className="mt-2 p-4 bg-[#f8fafc] dark:bg-[#0c121e] border border-[#e0e3e5] dark:border-[#243044] rounded-2xl flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              Technical Pipeline Diagnostic
            </span>
            <p className="text-xs font-mono font-bold text-[#fe9832] truncate">
              {problem.pipelineStage}
            </p>
          </div>
        )}
      </div>

      {/* Guided Interactive Diagnostic Checks (Step-labels removed as per prompt) */}
      {problem.guidedSteps && problem.guidedSteps.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#030813] dark:text-white">
            <span className="material-symbols-outlined text-[#fe9832] text-[20px]">checklist</span>
            <span>Diagnostic Verification</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {problem.guidedSteps.map((step) => {
              const currentAnswer = activeGuidedAnswers[step.stepNumber];
              return (
                <div
                  key={step.stepNumber}
                  className="p-5 bg-[#f8fafc] dark:bg-[#0c121e] border border-[#e0e3e5] dark:border-[#243044] rounded-2xl flex flex-col justify-between gap-3.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#fe9832]">
                      Verification Check {step.stepNumber}
                    </span>
                    {currentAnswer && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          currentAnswer.isPass
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {currentAnswer.isPass ? '✓ Verified' : '⚠️ Action Needed'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-bold text-[#030813] dark:text-white leading-relaxed">
                    {step.question}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {step.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => handleGuidedOptionClick(step.stepNumber, opt.isPass, opt.actionHint)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          currentAnswer?.hint === opt.actionHint && currentAnswer?.isPass === opt.isPass
                            ? 'bg-[#fe9832] text-[#542900] border-[#fe9832] font-black shadow-sm scale-[1.02]'
                            : 'bg-white dark:bg-[#151c28] border-[#e0e3e5] dark:border-[#243044] text-[#45474c] dark:text-[#c1c6d7] hover:border-gray-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Immediate Hint */}
                  {currentAnswer?.hint && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2 animate-fadeIn">
                      <span className="material-symbols-outlined text-[18px] shrink-0">info</span>
                      <span className="leading-relaxed">{currentAnswer.hint}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Solutions / Options (Step-labels removed as per prompt) */}
      {problem.multipleOptions && problem.multipleOptions.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#030813] dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8dfc75] text-[20px]">build_circle</span>
              <span>Available Solution Options ({problem.multipleOptions.length} Methods)</span>
            </span>
            <span className="text-[11px] text-gray-400 font-semibold">User Solvable</span>
          </div>

          {/* Option Selector Tabs */}
          <div className="flex flex-wrap gap-2 p-2 bg-[#f8fafc] dark:bg-[#0c121e] border border-[#e0e3e5] dark:border-[#243044] rounded-2xl">
            {problem.multipleOptions.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOptionTab(idx)}
                className={`flex-1 min-w-[180px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-2.5 ${
                  selectedOptionTab === idx
                    ? 'bg-[#fe9832] text-[#542900] shadow-sm font-black'
                    : 'text-[#45474c] dark:text-[#c1c6d7] hover:text-[#030813] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span className="w-5 h-5 rounded-md bg-black/10 flex items-center justify-center text-[11px] font-black shrink-0">
                  {idx + 1}
                </span>
                <span className="truncate">{opt.title.split(':')[0]}</span>
              </button>
            ))}
          </div>

          {/* Selected Option Content Box */}
          <div className="p-6 bg-gradient-to-br from-[#f8fafc] to-[#f1f4f6] dark:from-[#0c121e] dark:to-[#151c28] border border-[#e0e3e5] dark:border-[#243044] rounded-2xl flex flex-col gap-4 shadow-xs">
            <div>
              <h3 className="text-sm font-black text-[#030813] dark:text-white">
                {problem.multipleOptions[selectedOptionTab].title}
              </h3>
              {problem.multipleOptions[selectedOptionTab].description && (
                <p className="text-xs text-[#45474c] dark:text-[#828796] mt-0.5">
                  {problem.multipleOptions[selectedOptionTab].description}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-1">
              {problem.multipleOptions[selectedOptionTab].steps.map((stepText, sIdx) => (
                <div key={sIdx} className="flex items-start gap-3.5 text-xs">
                  <span className="w-5 h-5 rounded-lg bg-white dark:bg-[#1a2332] border border-[#e0e3e5] dark:border-[#243044] text-[#fe9832] font-black text-[10px] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    {sIdx + 1}
                  </span>
                  <p className="text-[#030813] dark:text-[#f7fafc] leading-relaxed flex-1 font-medium">
                    {stepText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Fallback Single Solution List */
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#030813] dark:text-white">
            <span className="material-symbols-outlined text-[#8dfc75] text-[20px]">build</span>
            <span>Recommended Solutions</span>
          </div>

          <div className="bg-[#f8fafc] dark:bg-[#0c121e] border border-[#e0e3e5] dark:border-[#243044] rounded-2xl p-6 flex flex-col gap-3.5 shadow-xs">
            {problem.solution.map((stepText, idx) => (
              <div key={idx} className="flex items-start gap-3.5 text-xs">
                <span className="w-5 h-5 rounded-lg bg-white dark:bg-[#151c28] border border-[#e0e3e5] dark:border-[#243044] text-[#fe9832] font-black text-[10px] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-[#030813] dark:text-[#f7fafc] leading-relaxed flex-1 font-medium">
                  {stepText}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary Action Button */}
      {problem.actionLabel && problem.actionRoute && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-[#fe9832]/15 via-transparent to-[#8dfc75]/15 border border-[#fe9832]/30 rounded-2xl">
          <div>
            <span className="text-xs font-bold text-[#030813] dark:text-white block">
              Ready to test this fix?
            </span>
            <span className="text-[11px] text-[#45474c] dark:text-[#828796]">
              Navigate straight to the relevant feature workspace.
            </span>
          </div>

          <button
            onClick={handleActionClick}
            className="px-5 py-2.5 bg-gradient-to-r from-[#fe9832] to-[#e8872b] hover:brightness-110 active:scale-95 text-[#542900] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md shrink-0 group"
          >
            <span>{problem.actionLabel}</span>
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>
      )}

      {/* Problem Resolution Confirmation */}
      <div className="border-t border-[#e0e3e5] dark:border-[#243044] pt-6 flex flex-col gap-4">
        {resolutionStatus === 'unresolved' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#f8fafc] dark:bg-[#0c121e] border border-[#e0e3e5] dark:border-[#243044] rounded-2xl">
            <div>
              <span className="text-xs font-bold text-[#030813] dark:text-white block">
                Did this solve your problem?
              </span>
              <span className="text-[11px] text-gray-400">
                Let us know if you were able to resolve the issue.
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setResolutionStatus('solved')}
                className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-600 dark:text-[#8dfc75] transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>✓</span>
                <span>Yes, problem solved</span>
              </button>

              <button
                onClick={() => setResolutionStatus('needs_help')}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>✕</span>
                <span>No, I still need help</span>
              </button>
            </div>
          </div>
        )}

        {/* Resolved Success State */}
        {resolutionStatus === 'solved' && (
          <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3 text-emerald-700 dark:text-[#8dfc75]">
              <span className="material-symbols-outlined text-[28px]">verified</span>
              <div>
                <span className="text-xs font-bold block">Great! I&apos;m glad we could solve your problem.</span>
                <span className="text-[11px] opacity-80">You can return to your dashboard or explore other topics.</span>
              </div>
            </div>

            <button
              onClick={onResetToCategories}
              className="px-4 py-2 bg-white dark:bg-[#151c28] hover:bg-[#f1f4f6] dark:hover:bg-[#1f2a3c] border border-[#e0e3e5] dark:border-[#243044] text-[#030813] dark:text-white rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 shadow-xs"
            >
              Start New Help Request
            </button>
          </div>
        )}

        {/* Escalation Required State */}
        {resolutionStatus === 'needs_help' && (
          <div className="p-6 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl flex flex-col gap-4 animate-fadeIn">
            <div className="flex items-start gap-3 text-amber-800 dark:text-amber-300">
              <span className="material-symbols-outlined text-[24px] shrink-0">support_agent</span>
              <div>
                <span className="text-xs font-bold block">
                  This problem couldn&apos;t be resolved automatically.
                </span>
                <span className="text-[11px] text-[#45474c] dark:text-[#c1c6d7] mt-0.5 block leading-relaxed">
                  Our dedicated accessibility engineering and support team is ready to step in and assist you.
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={onEscalate}
                className="px-5 py-2.5 bg-gradient-to-r from-[#fe9832] to-[#e8872b] hover:brightness-110 active:scale-95 text-[#542900] rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">outgoing_mail</span>
                <span>Submit Priority Support Ticket</span>
              </button>

              <button
                onClick={onBackToQuestions}
                className="px-4 py-2.5 bg-white dark:bg-[#151c28] hover:bg-[#f1f4f6] dark:hover:bg-[#1f2a3c] border border-[#e0e3e5] dark:border-[#243044] text-[#45474c] dark:text-[#c1c6d7] rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                Try Another Question
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
