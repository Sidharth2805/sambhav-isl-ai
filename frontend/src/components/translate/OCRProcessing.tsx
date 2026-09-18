import React, { useState, useEffect } from 'react';

export const OCRProcessing: React.FC = () => {
  const steps = [
    'Greyscale → contrast stretch → unsharp masking...',
    'Adaptive local thresholding (binarisation)...',
    'Tesseract LSTM neural recognition (PSM 6)...',
    'Multi-pass confidence check & formatting...',
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 900);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center min-h-[350px] relative overflow-hidden">
      {/* Animated Scanner Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center relative">
          <span className="material-symbols-outlined text-4xl text-emerald-500 animate-pulse">
            document_scanner
          </span>
          {/* Laser scanning bar */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce" />
        </div>
        <div className="absolute -inset-2 rounded-3xl bg-emerald-500/20 blur-xl -z-10 animate-pulse" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
        Scanning Handwritten Note / Prescription
      </h3>
      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 font-mono">
        Enhanced Preprocessing + Tesseract LSTM Engine
      </p>

      {/* Progress Steps */}
      <div className="mt-6 flex flex-col gap-2 w-full max-w-xs text-left">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={step}
              className={`flex items-center gap-2.5 text-xs transition-all ${
                isDone
                  ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                  : isCurrent
                  ? 'text-gray-900 dark:text-white font-bold'
                  : 'text-gray-400 dark:text-gray-600'
              }`}
            >
              {isDone ? (
                <span className="material-symbols-outlined text-[16px] text-emerald-500">check_circle</span>
              ) : isCurrent ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-700 shrink-0" />
              )}
              <span className="truncate">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
