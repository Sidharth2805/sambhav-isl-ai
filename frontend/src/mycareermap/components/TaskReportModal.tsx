import React from 'react';
import type { TaskScoreReport } from '../types/careerDiscovery';

interface TaskReportModalProps {
  isOpen: boolean;
  report: TaskScoreReport | null;
  onClose: () => void;
  onRetake?: () => void;
}

export const TaskReportModal: React.FC<TaskReportModalProps> = ({
  isOpen,
  report,
  onClose,
  onRetake,
}) => {
  if (!isOpen || !report) return null;

  const { scoreBreakdown, skillProfile, careerMatches, strengths, areasForGrowth, recommendations } = report;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">workspace_premium</span>
            </div>
            <div>
              <h3 id="report-modal-title" className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Vocational Experiential Evaluation Report
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Report ID: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{report.reportId}</span> • {new Date(report.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Print or Save Report as PDF"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span className="hidden sm:inline">Print Report</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
              aria-label="Close report modal"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Report Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* 1. Hero Marks & Grade Spotlight */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Left Column: Grade & Status */}
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Verified Practical Assessment
                </div>

                <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {scoreBreakdown.gradeTitle}
                </h4>

                <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
                  Mission: <strong>{report.taskTitle}</strong> in {report.environmentName}.
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-mono font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-amber-400">timer</span>
                    Duration: {report.durationSec}s ({scoreBreakdown.speedRating})
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-mono font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-emerald-400">ads_click</span>
                    Attempts: {report.attempts}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-mono font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-sky-400">search</span>
                    Tools Inspected: {report.inspectedToolsCount}
                  </span>
                </div>
              </div>

              {/* Right Column: Big Circular Marks Badge */}
              <div className="flex flex-col items-center justify-center shrink-0">
                <div className="relative flex items-center justify-center w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-slate-800/80 border-4 border-indigo-500/30 p-2 shadow-2xl">
                  {/* Glowing background ring */}
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-500/20 to-amber-500/20 blur-md" />
                  
                  <div className="relative text-center z-10">
                    <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-amber-400 drop-shadow-md">
                      {scoreBreakdown.totalMarks}
                      <span className="text-lg sm:text-xl font-bold text-slate-400">/100</span>
                    </div>
                    <div className="mt-1 inline-block px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r shadow-md border"
                      style={{
                        backgroundImage: scoreBreakdown.grade === 'A+' ? 'linear-gradient(to right, #fbbf24, #f59e0b)' : undefined,
                        color: scoreBreakdown.grade === 'A+' ? '#1e293b' : undefined
                      }}
                    >
                      Grade {scoreBreakdown.grade}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-400 mt-2">Overall Vocational Score</span>
              </div>
            </div>
          </div>

          {/* 2. Detailed 4-Metric Score Breakdown Matrix */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-indigo-500">pie_chart</span>
              Diagnostic Score Components (100 Marks Total)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              
              {/* Metric 1: Accuracy */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-emerald-500">check_circle</span>
                    Technical Accuracy
                  </span>
                  <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {scoreBreakdown.accuracyScore}/50 pts
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(scoreBreakdown.accuracyScore / 50) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {report.attempts === 1 ? 'Correct on 1st attempt' : `Solved in ${report.attempts} attempts`}
                </p>
              </div>

              {/* Metric 2: Time & Speed */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-amber-500">speed</span>
                    Decision Velocity
                  </span>
                  <span className="text-xs font-black font-mono text-amber-600 dark:text-amber-400">
                    {scoreBreakdown.speedScore}/25 pts
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${(scoreBreakdown.speedScore / 25) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {report.durationSec}s ({scoreBreakdown.speedRating})
                </p>
              </div>

              {/* Metric 3: Analytical Rigor */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-sky-500">manage_search</span>
                    Tool Exploration
                  </span>
                  <span className="text-xs font-black font-mono text-sky-600 dark:text-sky-400">
                    {scoreBreakdown.analyticalScore}/15 pts
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 transition-all duration-500"
                    style={{ width: `${(scoreBreakdown.analyticalScore / 15) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {report.inspectedToolsCount} instrument specs inspected
                </p>
              </div>

              {/* Metric 4: Resilience */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-indigo-500">security</span>
                    Safety & Resilience
                  </span>
                  <span className="text-xs font-black font-mono text-indigo-600 dark:text-indigo-400">
                    {scoreBreakdown.resilienceScore}/10 pts
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${(scoreBreakdown.resilienceScore / 10) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Reliable safety & error handling
                </p>
              </div>
            </div>
          </div>

          {/* 3. Skill Strengths Radar Profile */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-indigo-500">psychology</span>
              Vocational Competency Profile
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Diagnostic Reasoning</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{skillProfile.diagnosticReasoning}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" style={{ width: `${skillProfile.diagnosticReasoning}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Speed & Decision Velocity</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400">{skillProfile.speedEfficiency}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${skillProfile.speedEfficiency}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Safety & Protocol Discipline</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">{skillProfile.safetyProtocol}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${skillProfile.safetyProtocol}%` }} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Technical Tool Literacy</span>
                    <span className="font-mono text-sky-600 dark:text-sky-400">{skillProfile.toolLiteracy}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full" style={{ width: `${skillProfile.toolLiteracy}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Problem Solving Resilience</span>
                    <span className="font-mono text-purple-600 dark:text-purple-400">{skillProfile.problemResilience}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full" style={{ width: `${skillProfile.problemResilience}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Strengths & Growth Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                Demonstrated Strengths
              </h5>
              <ul className="space-y-2 text-xs text-emerald-800 dark:text-emerald-200">
                {strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[15px] text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">check</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Growth Areas & Recommendations */}
            <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-2.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                Areas for Growth & Next Steps
              </h5>
              <ul className="space-y-2 text-xs text-indigo-800 dark:text-indigo-200">
                {areasForGrowth.map((area, i) => (
                  <li key={`growth-${i}`} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[15px] text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">trending_up</span>
                    <span>{area}</span>
                  </li>
                ))}
                {recommendations.map((rec, i) => (
                  <li key={`rec-${i}`} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[15px] text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">arrow_forward</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 5. Question-by-Question Evaluation Breakdown (for Multi-Question Sessions) */}
          {report.questionResults && report.questionResults.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-indigo-500">format_list_numbered</span>
                Question Performance Breakdown ({report.questionResults.length} Challenges Attempted)
              </h4>

              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Q#</th>
                        <th className="px-4 py-3">Diagnostic Challenge</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-center">Clicks / Tries</th>
                        <th className="px-4 py-3 text-center">Time</th>
                        <th className="px-4 py-3 text-right">Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {report.questionResults.map((q, idx) => (
                        <tr key={q.taskId || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-slate-400">
                            #{q.questionNumber || idx + 1}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                            {q.taskTitle}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {q.isCorrect ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                <span className="material-symbols-outlined text-[12px]">check</span>
                                Solved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                <span className="material-symbols-outlined text-[12px]">schedule</span>
                                Explored
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-semibold text-slate-600 dark:text-slate-300">
                            {q.clicksUsed || q.attempts} / 5
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-slate-600 dark:text-slate-300">
                            {q.durationSec}s
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-black text-amber-600 dark:text-amber-400">
                            {q.marks}/100
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 6. Career Pathway Recommendations (Tailored Fit) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-indigo-500">work</span>
              High-Fit Vocational Career Pathways
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {careerMatches.map((match) => (
                <div
                  key={match.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {match.title}
                    </h5>
                    <span className="px-2 py-0.5 rounded-full text-xs font-black font-mono bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
                      {match.matchPercentage}% Fit
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {match.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {match.skillsGained.map((skill, si) => (
                      <span
                        key={si}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Validated by SAMBHAV Experiential Assessment System
          </div>

          <div className="flex items-center gap-3">
            {onRetake && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRetake();
                }}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                Retake Simulation
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 text-xs font-bold transition shadow-md shadow-orange-500/20 cursor-pointer"
            >
              Done & Continue
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
