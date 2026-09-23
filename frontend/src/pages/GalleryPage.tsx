import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GALLERY_ITEMS } from '../components/landing/GallerySection';
import { useAccessibility } from '../hooks/useAccessibility';

export const GalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAccessibility();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  // Lightbox navigation
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsAutoPlaying(false);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setIsAutoPlaying(false);
  };

  const nextLightbox = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null ? (prev + 1) % GALLERY_ITEMS.length : 0));
  }, []);

  const prevLightbox = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null ? (prev - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length : 0));
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextLightbox();
      if (e.key === 'ArrowLeft') prevLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, nextLightbox, prevLightbox]);

  // Auto-play slideshow inside Lightbox
  useEffect(() => {
    let interval: any;
    if (isAutoPlaying && lightboxIndex !== null) {
      interval = setInterval(() => {
        nextLightbox();
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, lightboxIndex, nextLightbox]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#030813] dark:via-[#080d16] dark:to-[#030813] text-[#0f172a] dark:text-[#f7fafc] font-['Inter',sans-serif]">
      
      {/* Top Header Bar */}
      <div className="border-b border-slate-200 dark:border-[#222d42] bg-white/85 dark:bg-[#0c121e]/85 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-500 hover:text-white dark:hover:bg-[#fe9832] dark:hover:text-[#3d1e00] transition cursor-pointer flex items-center justify-center shadow-xs"
            title="Back to Home"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-[#0f172a] dark:text-white tracking-tight">
                {t('gallery.allPhotosTitle', 'SAMBHAV Photo Gallery')}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-[#fe9832]/15 text-indigo-700 dark:text-[#fe9832] text-xs font-black border border-indigo-200 dark:border-[#fe9832]/30">
                {GALLERY_ITEMS.length} Photos
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t('gallery.allPhotosDesc', 'Click any photo to view in high definition fullscreen mode')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/translate')}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-[#fe9832]/10 text-indigo-700 dark:text-[#fe9832] border border-indigo-200 dark:border-[#fe9832]/30 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-[#fe9832]/20 transition flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">translate</span>
            <span className="hidden sm:inline">Translate</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/communicate')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#3d1e00] text-xs font-bold shadow-xs hover:opacity-95 transition flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">videocam</span>
            <span className="hidden sm:inline">Connect</span>
          </button>
        </div>
      </div>

      {/* Main Grid View Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        
        {/* Clean Photos Grid (All 13 Photos) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 animate-fadeIn">
          {GALLERY_ITEMS.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => openLightbox(idx)}
              className="group relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 dark:border-[#222d42] shadow-sm hover:shadow-2xl hover:border-indigo-400 dark:hover:border-[#fe9832]/60 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
              {/* Clean Image with Smooth Zoom on Hover */}
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
              />

              {/* Dark Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Center Fullscreen Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-13 h-13 rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                  <span className="material-symbols-outlined text-[28px] text-white">
                    fullscreen
                  </span>
                </div>
              </div>

              {/* Top Right Floating Icon */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md pointer-events-none">
                <span className="material-symbols-outlined text-[18px]">
                  open_in_full
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* FULLSCREEN LIGHTBOX MODAL                                                */}
      {/* ========================================================================= */}
      {lightboxIndex !== null && GALLERY_ITEMS[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-fadeIn select-none">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono">
                {lightboxIndex + 1} / {GALLERY_ITEMS.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Slideshow Play/Pause Toggle */}
              <button
                type="button"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  isAutoPlaying
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/40'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isAutoPlaying ? 'pause_circle' : 'play_circle'}
                </span>
                <span className="hidden sm:inline">{isAutoPlaying ? 'Playing' : 'Auto-Play'}</span>
              </button>

              {/* Close Lightbox */}
              <button
                type="button"
                onClick={closeLightbox}
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
                title="Close (Esc)"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>
          </div>

          {/* Central High-Definition Image Area */}
          <div className="relative flex-1 flex items-center justify-center min-h-0 my-3">
            
            {/* Left Nav Button */}
            <button
              type="button"
              onClick={prevLightbox}
              className="absolute left-2 sm:left-4 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition hover:scale-110 cursor-pointer shadow-xl"
              title="Previous (Left Arrow)"
            >
              <span className="material-symbols-outlined text-[26px]">chevron_left</span>
            </button>

            {/* Main Active Image */}
            <div className="relative max-h-full max-w-full flex items-center justify-center animate-scaleUp">
              <img
                src={GALLERY_ITEMS[lightboxIndex].image}
                alt={GALLERY_ITEMS[lightboxIndex].title}
                className="max-h-[78vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl border border-white/10"
              />
            </div>

            {/* Right Nav Button */}
            <button
              type="button"
              onClick={nextLightbox}
              className="absolute right-2 sm:right-4 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition hover:scale-110 cursor-pointer shadow-xl"
              title="Next (Right Arrow)"
            >
              <span className="material-symbols-outlined text-[26px]">chevron_right</span>
            </button>
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="bg-black/70 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white flex items-center justify-center gap-2 max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {GALLERY_ITEMS.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className={`w-11 h-11 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                    lightboxIndex === idx ? 'border-[#fe9832] scale-110 shadow-md ring-2 ring-[#fe9832]/40' : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default GalleryPage;
