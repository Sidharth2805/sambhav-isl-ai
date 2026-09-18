import React, { useState, useEffect } from 'react';
import { formatExtractedText, type OCRScanResult } from '../../services/ocrService';

interface OCRResultEditorProps {
  result: OCRScanResult;
  onSendToTranslate: (finalText: string) => void;
  onScanAgain: () => void;
  onClose: () => void;
}

export const OCRResultEditor: React.FC<OCRResultEditorProps> = ({
  result,
  onSendToTranslate,
  onScanAgain,
  onClose,
}) => {
  const [editedText, setEditedText] = useState(result.text);
  const [copied, setCopied] = useState(false);
  const [activeType, setActiveType] = useState<'general' | 'prescription'>(
    result.document_type || 'general'
  );

  useEffect(() => {
    setEditedText(result.text);
    setActiveType(result.document_type || 'general');
  }, [result.text, result.document_type]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy text:', e);
    }
  };

  const handleFormatToggle = (type: 'general' | 'prescription') => {
    setActiveType(type);
    const { formatted } = formatExtractedText(editedText, type);
    setEditedText(formatted);
  };

  const handleTranslate = () => {
    if (!editedText.trim()) return;
    onSendToTranslate(editedText.trim());
    onClose();
  };

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-5 max-h-[80vh] overflow-y-auto">
      {/* Top Header & Model Status */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-[#2d3133] pb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl">
            check_circle
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                Extracted Text
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeType === 'prescription'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                  : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300'
              }`}>
                {activeType === 'prescription' ? '💊 Medical Prescription' : '📝 General Note / Letter'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-gray-500 dark:text-[#828796]">
              {result.model || 'Microsoft TrOCR / Neural Engine'} ({result.lines?.length || 0} lines detected)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Format Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-black/30 p-0.5 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => handleFormatToggle('general')}
              className={`px-2 py-1 rounded transition cursor-pointer ${
                activeType === 'general'
                  ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs font-black'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Plain Text
            </button>
            <button
              type="button"
              onClick={() => handleFormatToggle('prescription')}
              className={`px-2 py-1 rounded transition cursor-pointer ${
                activeType === 'prescription'
                  ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs font-black'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Rx Format
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#2d3133] hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-bold text-gray-700 dark:text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-indigo-500">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-3 bg-slate-50 dark:bg-[#0d121d] border-l-4 border-emerald-500 dark:border-emerald-400 rounded-r-xl text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5 shadow-xs">
        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg shrink-0 mt-0.5">
          {activeType === 'prescription' ? 'verified_user' : 'rate_review'}
        </span>
        <div className="leading-relaxed">
          <strong className="font-bold">
            {activeType === 'prescription' ? 'Prescription Safety Notice: ' : 'Document Verification: '}
          </strong>
          {activeType === 'prescription'
            ? 'AI-transcribed text — please verify medicine names, numbers, dosage and instructions against the original prescription.'
            : 'AI-transcribed text — please review and correct any words or sentences before sending to translation.'}
        </div>
      </div>

      {/* Editable Text Area */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-[#828796] font-semibold">
          <label htmlFor="ocr-text-editor" className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">edit_note</span>
            <span>Review & Edit Extracted Content:</span>
          </label>
          <span>{editedText.length} Characters</span>
        </div>

        <textarea
          id="ocr-text-editor"
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          rows={7}
          className="w-full p-3.5 bg-slate-50 dark:bg-[#0d121d] border border-slate-300 dark:border-[#2d3133] rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white font-sans focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:focus:border-[#fe9832] outline-none leading-relaxed resize-y"
          placeholder="Extracted handwritten text, application, or prescription will appear here..."
        />
      </div>

      {/* Line-by-Line Breakdown if multiple lines detected */}
      {result.lines && result.lines.length > 1 && (
        <div className="border border-slate-200 dark:border-[#2d3133] rounded-xl p-3 bg-slate-50/50 dark:bg-[#0d121d]/50">
          <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-2">
            Segmented Lines:
          </span>
          <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
            {result.lines.map((line) => (
              <div
                key={line.line_idx}
                className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-white dark:bg-[#1a202c] border border-slate-200 dark:border-white/5"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono font-bold text-gray-700 dark:text-gray-300">
                    L{line.line_idx}
                  </span>
                  <span className="text-gray-900 dark:text-white truncate">{line.text}</span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                  {Math.round(line.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-[#2d3133]">
        <button
          type="button"
          onClick={onScanAgain}
          className="px-4 py-2.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-gray-800 dark:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          <span>Scan Another</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>

          {/* Primary Submit to Translate and Avatar */}
          <button
            type="button"
            disabled={!editedText.trim()}
            onClick={handleTranslate}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 hover:opacity-95 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[18px]">translate</span>
            <span>Translate & Sign on 3D Avatar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
