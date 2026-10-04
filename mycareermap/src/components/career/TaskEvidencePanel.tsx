import React, { useState } from 'react';
import type { TaskEvidence, CareerEvent } from '../../types/careerDiscovery';

interface TaskEvidencePanelProps {
  evidence: TaskEvidence;
  events: CareerEvent[];
  isCompleted: boolean;
}

export const TaskEvidencePanel: React.FC<TaskEvidencePanelProps> = ({
  evidence,
  events,
  isCompleted,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const durationSec = evidence.completionTime
    ? Math.round((evidence.completionTime - evidence.startTime) / 1000)
    : Math.round((Date.now() - evidence.startTime) / 1000);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[20px] text-indigo-600 dark:text-indigo-400">
            data_exploration
          </span>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Experiential Task Evidence & Telemetry
          </h4>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
            Session Local
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {events.length} real events recorded
          </span>
          <span className="material-symbols-outlined text-[18px] text-slate-400 transform transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            expand_more
          </span>
        </div>
      </div>

      {/* Summary Matrix Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white dark:bg-slate-900">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Attempts
          </p>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5 font-mono">
            {evidence.attempts}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Correct Actions
          </p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
            {evidence.correctActions}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Incorrect Tries
          </p>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5 font-mono">
            {evidence.incorrectActions}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Active Duration
          </p>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 font-mono">
            {durationSec}s
          </p>
        </div>
      </div>

      {/* Expanded Real Event Audit Log */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-800/80 animate-fadeIn">
          <div className="flex items-center justify-between my-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">timeline</span>
              Interaction Audit Trail (Deterministic Timestamp Log)
            </h5>
            <span className="text-[11px] font-mono text-slate-400">
              Session ID: {evidence.sessionId.substring(0, 18)}...
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
            {events.length === 0 ? (
              <p className="text-slate-400 italic py-2">No interaction events yet.</p>
            ) : (
              events.map((evt, idx) => (
                <div
                  key={`${evt.timestamp}-${idx}`}
                  className="flex items-start justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[10px]">#{idx + 1}</span>
                    <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                      evt.eventType === 'ACTION_CORRECT'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : evt.eventType === 'ACTION_INCORRECT'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : evt.eventType === 'OBJECT_INSPECTED'
                        ? 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                        : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                    }`}>
                      {evt.eventType}
                    </span>
                    <span className="font-sans font-medium text-slate-900 dark:text-white">
                      {evt.objectId || 'workspace'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>

          {isCompleted && (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span><strong>Task Completed:</strong> Task evidence verified locally and formatted for future student profile aggregation.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
