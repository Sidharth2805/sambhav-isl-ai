import React, { useState } from 'react';

interface ImagePreviewProps {
  imageDataUrl: string;
  onConfirm: (processedDataUrl: string) => void;
  onRetake: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageDataUrl,
  onConfirm,
  onRetake,
}) => {
  const [rotation, setRotation] = useState<number>(0);

  const rotateClockwise = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleProcess = () => {
    if (rotation === 0) {
      onConfirm(imageDataUrl);
      return;
    }

    // Apply rotation on canvas before proceeding
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        onConfirm(imageDataUrl);
        return;
      }

      if (rotation === 90 || rotation === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const rotatedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      onConfirm(rotatedDataUrl);
    };
    img.src = imageDataUrl;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-black/60 backdrop-blur-md">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-lg">preview</span>
          Confirm Image
        </span>

        <button
          type="button"
          onClick={rotateClockwise}
          className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
          title="Rotate 90 degrees"
        >
          <span className="material-symbols-outlined text-[16px]">rotate_right</span>
          <span>Rotate</span>
        </button>
      </div>

      {/* Image Viewport */}
      <div className="flex-1 min-h-[300px] flex items-center justify-center p-4 bg-slate-950 overflow-hidden relative">
        <img
          src={imageDataUrl}
          alt="Prescription preview"
          style={{ transform: `rotate(${rotation}deg)` }}
          className="max-h-[360px] max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-200"
        />
      </div>

      {/* Action Footer */}
      <div className="p-3.5 bg-black/80 backdrop-blur-md flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onRetake}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          <span>Retake / Choose Another</span>
        </button>

        <button
          type="button"
          onClick={handleProcess}
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition flex items-center gap-2 cursor-pointer"
        >
          <span>Extract Text (TrOCR)</span>
          <span className="material-symbols-outlined text-[18px]">document_scanner</span>
        </button>
      </div>
    </div>
  );
};
