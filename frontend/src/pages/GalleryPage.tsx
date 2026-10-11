import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GALLERY_ITEMS } from '../data/galleryData';
import { useAccessibility } from '../hooks/useAccessibility';

export const GalleryPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAccessibility();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'image' | 'video'>('all');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const filteredItems = GALLERY_ITEMS.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'video') return item.type === 'video';
    return item.type !== 'video';
  });

  // Lightbox navigation
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsAutoPlaying(false);
  };

  const closeLightbox = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setLightboxIndex(null);
    setIsAutoPlaying(false);
  };

  const nextLightbox = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filteredItems.length : 0));
  }, [lightboxIndex, filteredItems.length]);

  const prevLightbox = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : 0));
  }, [lightboxIndex, filteredItems.length]);

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
    const currentItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;
    if (isAutoPlaying && lightboxIndex !== null && currentItem?.type !== 'video') {
      interval = setInterval(() => {
        nextLightbox();
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, lightboxIndex, nextLightbox, filteredItems]);

  const currentLightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  const videoCount = GALLERY_ITEMS.filter((i) => i.type === 'video').length;
  const imageCount = GALLERY_ITEMS.filter((i) => i.type !== 'video').length;

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
                {t('gallery.allPhotosTitle', 'SAMBHAV Showcase & Field Gallery')}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-[#fe9832]/15 text-indigo-700 dark:text-[#fe9832] text-xs font-black border border-indigo-200 dark:border-[#fe9832]/30">
                {GALLERY_ITEMS.length} Media Items
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t('gallery.allPhotosDesc', 'Photographs and video walkthroughs from Bipin Bihari Choudhury Vocational School & AI field sessions')}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Filter Pills */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setActiveFilter('all'); setLightboxIndex(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'all'
                  ? 'bg-indigo-600 text-white dark:bg-[#fe9832] dark:text-[#3d1e00] shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              <span>All ({GALLERY_ITEMS.length})</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveFilter('image'); setLightboxIndex(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'image'
                  ? 'bg-indigo-600 text-white dark:bg-[#fe9832] dark:text-[#3d1e00] shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">photo</span>
              <span>Photos ({imageCount})</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveFilter('video'); setLightboxIndex(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'video'
                  ? 'bg-indigo-600 text-white dark:bg-[#fe9832] dark:text-[#3d1e00] shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">play_circle</span>
              <span>Videos ({videoCount})</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing {filteredItems.length} of {GALLERY_ITEMS.length} items
          </span>
        </div>

        {/* Clean Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 animate-fadeIn">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => openLightbox(idx)}
              className="group relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 dark:border-[#222d42] shadow-sm hover:shadow-2xl hover:border-indigo-400 dark:hover:border-[#fe9832]/60 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
              {/* Image / Thumbnail */}
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
              />

              {/* Video Badge */}
              {item.type === 'video' && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-black flex items-center gap-1.5 shadow-md z-10">
                  <span className="material-symbols-outlined text-[15px] text-amber-400">play_circle</span>
                  <span>VIDEO</span>
                </div>
              )}

              {/* Dark Hover Overlay with Title */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-white text-xs font-bold line-clamp-2 mb-1">{item.title}</p>
                {item.location && (
                  <p className="text-slate-300 text-[10px] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] text-amber-400">location_on</span>
                    <span className="truncate">{item.location}</span>
                  </p>
                )}
              </div>

              {/* Center Fullscreen / Play Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-13 h-13 rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                  <span className="material-symbols-outlined text-[28px] text-white">
                    {item.type === 'video' ? 'play_arrow' : 'fullscreen'}
                  </span>
                </div>
              </div>

              {/* Top Right Floating Icon */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md pointer-events-none">
                <span className="material-symbols-outlined text-[18px]">
                  {item.type === 'video' ? 'smart_display' : 'open_in_full'}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* FULLSCREEN LIGHTBOX MODAL                                                */}
      {/* ========================================================================= */}
      {lightboxIndex !== null && currentLightboxItem && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-fadeIn select-none">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs text-slate-400 font-mono shrink-0">
                {lightboxIndex + 1} / {filteredItems.length}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate max-w-sm sm:max-w-xl">
                  {currentLightboxItem.title}
                </h3>
                {currentLightboxItem.location && (
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] text-amber-400">location_on</span>
                    <span>{currentLightboxItem.location}</span>
                    {currentLightboxItem.date && <span>• {currentLightboxItem.date}</span>}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Slideshow Play/Pause Toggle (Photos only) */}
              {currentLightboxItem.type !== 'video' && (
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
              )}

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

          {/* Central Media Area */}
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

            {/* Main Active Media */}
            <div className="relative max-h-full max-w-full flex items-center justify-center animate-scaleUp">
              {currentLightboxItem.type === 'video' ? (
                <div className="flex flex-col items-center max-h-[78vh] max-w-[92vw]">
                  <video
                    ref={videoRef}
                    src={currentLightboxItem.videoSrc}
                    poster={currentLightboxItem.image}
                    controls
                    playsInline
                    preload="metadata"
                    className="max-h-[74vh] max-w-[92vw] rounded-2xl shadow-2xl border border-white/10 bg-black"
                  >
                    Your browser does not support HTML5 video.
                  </video>
                  {currentLightboxItem.description && (
                    <p className="text-xs text-slate-300 mt-2 max-w-2xl text-center px-4">
                      {currentLightboxItem.description}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center max-h-[78vh] max-w-[92vw]">
                  <img
                    src={currentLightboxItem.image}
                    alt={currentLightboxItem.title}
                    className="max-h-[74vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl border border-white/10"
                  />
                  {currentLightboxItem.description && (
                    <p className="text-xs text-slate-300 mt-2 max-w-2xl text-center px-4 line-clamp-2">
                      {currentLightboxItem.description}
                    </p>
                  )}
                </div>
              )}
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
              {filteredItems.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className={`w-11 h-11 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer relative ${
                    lightboxIndex === idx ? 'border-[#fe9832] scale-110 shadow-md ring-2 ring-[#fe9832]/40' : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  {item.type === 'video' && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-amber-400">
                      <span className="material-symbols-outlined text-[16px]">play_circle</span>
                    </span>
                  )}
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
