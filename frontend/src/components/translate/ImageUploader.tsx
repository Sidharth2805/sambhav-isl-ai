import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
  onImageSelected: (imageDataUrl: string) => void;
  onOpenCamera: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  onOpenCamera,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 15MB limit. Please upload a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImageSelected(reader.result);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-4 p-2 sm:p-4">
      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Camera Option */}
        <button
          type="button"
          onClick={onOpenCamera}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 hover:from-emerald-500/20 hover:to-teal-500/15 dark:bg-[#1a202c] dark:hover:bg-[#242b3a] border-2 border-emerald-500/30 hover:border-emerald-500 text-left transition-all flex items-center gap-4 group cursor-pointer shadow-xs"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-2xl">photo_camera</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>Take a Photo</span>
              <span className="material-symbols-outlined text-emerald-500 text-[16px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </h4>
            <p className="text-xs text-gray-500 dark:text-[#828796] mt-0.5">
              Capture handwritten note, letter, or prescription
            </p>
          </div>
        </button>

        {/* Upload File Option */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 hover:from-indigo-500/20 hover:to-purple-500/15 dark:bg-[#1a202c] dark:hover:bg-[#242b3a] border-2 border-indigo-500/30 hover:border-indigo-500 text-left transition-all flex items-center gap-4 group cursor-pointer shadow-xs"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-2xl">upload_file</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>Upload Image</span>
              <span className="material-symbols-outlined text-indigo-500 text-[16px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </h4>
            <p className="text-xs text-gray-500 dark:text-[#828796] mt-0.5">
              Select JPG, PNG, WEBP from device
            </p>
          </div>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-7 text-center transition-all flex flex-col items-center justify-center gap-2.5 cursor-pointer ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
            : 'border-slate-300 dark:border-[#2d3133] hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-[#0d121d]/50'
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
          <span className="material-symbols-outlined text-xl">cloud_upload</span>
        </div>
        <div>
          <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white">
            Drag and drop any document, note, or prescription here
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
            <span className="px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-[10px] font-semibold">
              📝 Handwritten Notes
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-[10px] font-semibold">
              📄 Application Letters
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-[10px] font-semibold">
              📋 Forms & Reports
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-[10px] font-semibold">
              💊 Prescriptions & Dosages
            </span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-rose-600">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tips section */}
      <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-[11px] text-emerald-950 dark:text-emerald-200 flex items-start gap-2">
        <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
          auto_awesome
        </span>
        <span>
          <strong>Flexible Universal OCR:</strong> Supports both standard handwriting/applications and medical prescriptions. The system automatically optimizes line segmentation and character recognition for the best accuracy.
        </span>
      </div>
    </div>
  );
};
