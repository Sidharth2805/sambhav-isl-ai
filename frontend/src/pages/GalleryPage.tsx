import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GallerySection } from '../components/landing/GallerySection';
import { useAccessibility } from '../hooks/useAccessibility';

export const GalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAccessibility();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#030813] dark:via-[#080d16] dark:to-[#030813] text-[#0f172a] dark:text-[#f7fafc] font-['Inter',sans-serif]">
      {/* Top Header Bar */}
      <div className="border-b border-slate-200 dark:border-[#222d42] bg-white/80 dark:bg-[#0c121e]/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-500 hover:text-white dark:hover:bg-[#fe9832] dark:hover:text-[#3d1e00] transition cursor-pointer flex items-center justify-center shadow-xs"
            title="Go Back"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-[#0f172a] dark:text-white tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 dark:text-[#fe9832] text-[22px]">
                photo_library
              </span>
              <span>{t('gallery.pageTitle', 'Visual Showcase & Community Gallery')}</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t('gallery.pageSubtitle', 'SAMBHAV Indian Sign Language in Action')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/translate')}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-[#fe9832]/10 text-indigo-700 dark:text-[#fe9832] border border-indigo-200 dark:border-[#fe9832]/30 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-[#fe9832]/20 transition flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">translate</span>
            <span className="hidden sm:inline">Try Translate</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/communicate')}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#3d1e00] text-xs font-bold shadow-xs hover:opacity-95 transition flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">videocam</span>
            <span className="hidden sm:inline">Start Call</span>
          </button>
        </div>
      </div>

      {/* Embedded Full Gallery Showcase */}
      <GallerySection />
    </div>
  );
};

export default GalleryPage;
