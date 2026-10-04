import React from 'react';
import type { ToolDefinition } from '../types/careerDiscovery';
import { CompositeAssetView } from './CompositeAssetView';

interface ToolInspectorModalProps {
  tool: ToolDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: ToolDefinition) => void;
  isSelected?: boolean;
  disabled?: boolean;
}

export const ToolInspectorModal: React.FC<ToolInspectorModalProps> = ({
  tool,
  isOpen,
  onClose,
  onSelectTool,
  isSelected = false,
  disabled = false,
}) => {
  if (!isOpen || !tool) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tool-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close tool inspection dialog"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        {/* Header & Asset Display */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-inner">
            <CompositeAssetView tool={tool} size="lg" alt={tool.name} />
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 mb-2 uppercase tracking-wide">
              <span className="material-symbols-outlined text-[14px]">
                {tool.category === 'diagnostic' ? 'monitoring' : tool.category === 'wirework' ? 'cable' : 'handyman'}
              </span>
              {tool.category} instrument
            </div>
            <h3 id="tool-modal-title" className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {tool.name}
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {tool.technicalRole}
            </p>
          </div>
        </div>

        {/* Educational Content & Safety Notes */}
        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
              <span className="material-symbols-outlined text-[16px] text-indigo-600 dark:text-indigo-400">info</span>
              Diagnostic Application
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {tool.educationalDescription}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 text-amber-900 dark:text-amber-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-[16px] text-amber-600 dark:text-amber-400">shield</span>
              Safety Standard
            </h4>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
              {tool.safetyNotes}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-colors cursor-pointer"
          >
            Back to Workspace
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onSelectTool(tool);
              onClose();
            }}
            className={`w-full sm:flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all cursor-pointer ${
              isSelected
                ? 'bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/25 active:scale-[0.98]'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSelected ? 'check_circle' : 'touch_app'}
            </span>
            {isSelected ? 'Selected Tool' : 'Select This Tool for Task'}
          </button>
        </div>
      </div>
    </div>
  );
};
