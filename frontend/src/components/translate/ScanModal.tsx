import React, { useState } from 'react';
import { CameraCapture } from './CameraCapture';
import { ImageUploader } from './ImageUploader';
import { ImagePreview } from './ImagePreview';
import { OCRProcessing } from './OCRProcessing';
import { OCRResultEditor } from './OCRResultEditor';
import {
  scanHandwrittenImage,
  type OCRScanResult,
  type OCRScanMode,
} from '../../services/ocrService';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToTranslate: (text: string) => void;
}

type ModalStep = 'SELECT' | 'CAMERA' | 'PREVIEW' | 'PROCESSING' | 'RESULT';

export const ScanModal: React.FC<ScanModalProps> = ({
  isOpen,
  onClose,
  onSendToTranslate,
}) => {
  const [currentStep, setCurrentStep] = useState<ModalStep>('SELECT');
  const [scanMode, setScanMode] = useState<OCRScanMode>('auto');
  const [selectedImageDataUrl, setSelectedImageDataUrl] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<OCRScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setCurrentStep('SELECT');
    setSelectedImageDataUrl(null);
    setScanResult(null);
    setErrorMsg(null);
  };

  const handleImageReady = (dataUrl: string) => {
    setSelectedImageDataUrl(dataUrl);
    setCurrentStep('PREVIEW');
  };

  const handleStartOCR = async (dataUrl: string) => {
    setCurrentStep('PROCESSING');
    setErrorMsg(null);

    try {
      const result = await scanHandwrittenImage(dataUrl, 'en', scanMode);
      if (result.success) {
        setScanResult(result);
        setCurrentStep('RESULT');
      } else {
        setErrorMsg(result.error || 'Failed to extract text from image.');
        setCurrentStep('SELECT');
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMsg('An unexpected error occurred during OCR scanning.');
      setCurrentStep('SELECT');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-['Inter',sans-serif]">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#121824] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#2d3133] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header Bar (When not in Camera Mode) */}
        {currentStep !== 'CAMERA' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-[#2d3133] bg-slate-50/70 dark:bg-[#0d121d]/70 gap-2 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">document_scanner</span>
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                  Document & Prescription Scanner
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-[#828796]">
                  Scan handwritten notes, letters, applications & prescriptions into Indian Sign Language
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Document Mode Pills */}
              <div className="flex items-center bg-slate-200/80 dark:bg-black/40 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setScanMode('auto')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    scanMode === 'auto'
                      ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                  title="Automatically detect whether image is a general note or medical prescription"
                >
                  ⚡ Auto
                </button>
                <button
                  type="button"
                  onClick={() => setScanMode('general')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    scanMode === 'general'
                      ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                  title="For letters, notes, applications, essays, and forms"
                >
                  📝 Note / Letter
                </button>
                <button
                  type="button"
                  onClick={() => setScanMode('prescription')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    scanMode === 'prescription'
                      ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                  title="For medical prescriptions, dosages, and clinical notes"
                >
                  💊 Rx
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                className="w-7 h-7 rounded-full bg-slate-200/60 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-gray-700 dark:text-white flex items-center justify-center transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="m-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600">error</span>
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-[11px] font-bold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dynamic Step View */}
        <div className="flex-1 overflow-y-auto">
          {currentStep === 'SELECT' && (
            <ImageUploader
              onImageSelected={handleImageReady}
              onOpenCamera={() => setCurrentStep('CAMERA')}
            />
          )}

          {currentStep === 'CAMERA' && (
            <div className="h-[75vh] min-h-[420px]">
              <CameraCapture
                onCapture={handleImageReady}
                onCancel={() => setCurrentStep('SELECT')}
              />
            </div>
          )}

          {currentStep === 'PREVIEW' && selectedImageDataUrl && (
            <ImagePreview
              imageDataUrl={selectedImageDataUrl}
              onConfirm={handleStartOCR}
              onRetake={() => setCurrentStep('SELECT')}
            />
          )}

          {currentStep === 'PROCESSING' && <OCRProcessing />}

          {currentStep === 'RESULT' && scanResult && (
            <OCRResultEditor
              key={selectedImageDataUrl || String(Date.now())}
              result={scanResult}
              onSendToTranslate={onSendToTranslate}
              onScanAgain={handleReset}
              onClose={() => {
                handleReset();
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
