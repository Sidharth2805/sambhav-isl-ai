import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GALLERY_ITEMS, REEL_ITEMS } from '../../data/galleryData';
import type { GalleryItem } from '../../data/galleryData';
import { useAccessibility } from '../../hooks/useAccessibility';

export { GALLERY_ITEMS, REEL_ITEMS };
export type { GalleryItem };

export const GallerySection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAccessibility();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
    setLightboxIndex((prev) => (prev !== null ? (prev + 1) % REEL_ITEMS.length : 0));
  }, [lightboxIndex]);

  const prevLightbox = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null ? (prev - 1 + REEL_ITEMS.length) % REEL_ITEMS.length : 0));
  }, [lightboxIndex]);

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

  // Auto-play slideshow inside Lightbox (pause if current item is a video)
  useEffect(() => {
    let interval: any;
    const currentItem = lightboxIndex !== null ? REEL_ITEMS[lightboxIndex] : null;
    if (isAutoPlaying && lightboxIndex !== null && currentItem?.type !== 'video') {
      interval = setInterval(() => {
        nextLightbox();
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, lightboxIndex, nextLightbox]);

  // Horizontal Reel Scroll Controls
  const reelContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollReel = (direction: 'left' | 'right') => {
    if (reelContainerRef.current) {
      const scrollAmount = reelContainerRef.current.clientWidth * 0.75;
      reelContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const currentLightboxItem = lightboxIndex !== null ? REEL_ITEMS[lightboxIndex] : null;

  return (
    <section id="gallery-section" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#080d16] dark:via-[#0c121e] dark:to-[#080d16] border-t border-[#e2e8f0] dark:border-[#2d3133] transition-colors relative overflow-hidden">
      
      {/* Ambient Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-amber-500/10 via-indigo-500/10 to-purple-500/10 dark:from-[#fe9832]/10 dark:via-indigo-500/10 dark:to-teal-500/10 blur-[120px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0f172a] dark:text-white font-headline tracking-tight leading-tight">
            {t('gallery.title', 'Moments of Accessibility in')}{' '}
            <span className="bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 dark:from-[#fe9832] dark:via-amber-400 dark:to-teal-300 bg-clip-text text-transparent">
              {t('gallery.titleHighlight', 'Real Action')}
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg md:text-xl text-[#475569] dark:text-[#94a3b8] font-body-lg leading-relaxed">
            {t('gallery.subtitle', 'Explore authentic photographs, workshop moments, AI development breakthroughs, and community interactions driving Indian Sign Language inclusion.')}
          </p>
        </div>

        {/* Horizontal Reel Container with Nav Arrows */}
        <div className="relative group/reel my-4">
          
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => scrollReel('left')}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 dark:bg-[#151c28]/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-90 hover:opacity-100"
            title="Scroll Left"
            aria-label="Scroll Left"
          >
            <span className="material-symbols-outlined text-[24px]">chevron_left</span>
          </button>

          {/* Horizontal Scrollable Reel */}
          <div
            ref={reelContainerRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-3 px-1 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {REEL_ITEMS.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => openLightbox(idx)}
                className="shrink-0 w-[270px] sm:w-[320px] md:w-[350px] aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden relative group bg-slate-900 border border-slate-200/80 dark:border-[#222d42] shadow-md hover:shadow-2xl hover:border-indigo-400 dark:hover:border-[#fe9832]/60 transition-all duration-300 cursor-pointer snap-start"
              >
                {/* Image / Video Poster */}
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Video Badge if video */}
                {item.type === 'video' && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-[11px] font-black flex items-center gap-1.5 shadow-md z-10">
                    <span className="material-symbols-outlined text-[15px] text-amber-400">play_circle</span>
                    <span>VIDEO</span>
                  </div>
                )}

                {/* Subtle Hover Dark Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <p className="text-white text-xs font-bold line-clamp-2">{item.title}</p>
                </div>

                {/* Clean Fullscreen / Play Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-13 h-13 rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
                    <span className="material-symbols-outlined text-[28px] text-white">
                      {item.type === 'video' ? 'play_arrow' : 'fullscreen'}
                    </span>
                  </div>
                </div>

                {/* Floating Icon Top Right */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md pointer-events-none">
                  <span className="material-symbols-outlined text-[18px]">
                    {item.type === 'video' ? 'smart_display' : 'open_in_full'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => scrollReel('right')}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 dark:bg-[#151c28]/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-90 hover:opacity-100"
            title="Scroll Right"
            aria-label="Scroll Right"
          >
            <span className="material-symbols-outlined text-[24px]">chevron_right</span>
          </button>
        </div>

        {/* View More Option Button */}
        <div className="text-center mt-10 sm:mt-12">
          <button
            type="button"
            onClick={() => navigate('/gallery')}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#3d1e00] rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-indigo-500/25 dark:shadow-none hover:opacity-95 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer group"
          >
            <span>{t('gallery.viewMoreBtn', 'View Complete Showcase')}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 dark:bg-black/20 text-xs font-bold">
              {GALLERY_ITEMS.length} Media Items
            </span>
            <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 font-medium">
            {t('gallery.viewMoreHint', 'Open complete gallery with video playback and high-definition fullscreen preview')}
          </p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* FULLSCREEN LIGHTBOX MODAL                                                */}
      {/* ========================================================================= */}
      {lightboxIndex !== null && currentLightboxItem && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-fadeIn select-none">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono">
                {lightboxIndex + 1} / {REEL_ITEMS.length}
              </span>
              <span className="text-xs font-bold text-slate-300 truncate max-w-[200px] sm:max-w-md">
                {currentLightboxItem.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
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
                </div>
              ) : (
                <img
                  src={currentLightboxItem.image}
                  alt={currentLightboxItem.title}
                  className="max-h-[78vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl border border-white/10"
                />
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
          <div className="bg-black/70 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-white flex items-center justify-center gap-2 max-w-3xl mx-auto w-full">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {REEL_ITEMS.map((item, idx) => (
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

    </section>
  );
};
