import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAccessibility } from '../../hooks/useAccessibility';

export interface GalleryItem {
  id: string;
  title: string;
  category: 'technology' | 'community' | 'healthcare' | 'workshops';
  categoryLabel: string;
  description: string;
  image: string;
  badge: string;
  icon: string;
  highlight?: boolean;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gallery-1',
    title: 'ISL Real-Time Classroom & AI Demonstration',
    category: 'workshops',
    categoryLabel: 'Workshops & Education',
    description: 'Empowering students and educators with real-time Indian Sign Language neural translation in academic environments.',
    image: '/images/gallery/gallery-1.jpg',
    badge: 'Education & Learning',
    icon: 'school',
    highlight: true,
  },
  {
    id: 'gallery-2',
    title: 'Two-Way Sign-to-Speech Accessibility Lab',
    category: 'technology',
    categoryLabel: 'AI & Technology',
    description: 'Hands-on validation of 126-dimensional MediaPipe landmark extraction coupled with SAMBHAV BiLSTM inference.',
    image: '/images/gallery/gallery-2.jpg',
    badge: 'Neural AI Research',
    icon: 'neurology',
    highlight: false,
  },
  {
    id: 'gallery-3',
    title: 'Community Outreach & Inclusive Dialogue Circle',
    category: 'community',
    categoryLabel: 'Community & Culture',
    description: 'Engaging Deaf community leaders and hearing peers to bridge communication barriers through intuitive assistive tech.',
    image: '/images/gallery/gallery-3.jpg',
    badge: 'Community Voices',
    icon: 'groups',
    highlight: false,
  },
  {
    id: 'gallery-4',
    title: 'SAMBHAV Multi-Hand Landmark Tracking',
    category: 'technology',
    categoryLabel: 'AI & Technology',
    description: 'High-speed 60fps tracking analyzing two-hand joint angles, palm orientation, and dynamic velocity for 169 ISL classes.',
    image: '/images/gallery/gallery-4.jpg',
    badge: 'Computer Vision',
    icon: 'visibility',
    highlight: true,
  },
  {
    id: 'gallery-5',
    title: 'Doctor & Patient Clinical Consultation Trial',
    category: 'healthcare',
    categoryLabel: 'Healthcare & Assistive',
    description: 'Real-time two-way translation facilitating seamless medical history intake between doctors and Deaf patients.',
    image: '/images/gallery/gallery-5.jpg',
    badge: 'Clinical Care',
    icon: 'local_hospital',
    highlight: false,
  },
  {
    id: 'gallery-6',
    title: 'Interactive 3D Avatar Translation Workshop',
    category: 'workshops',
    categoryLabel: 'Workshops & Education',
    description: 'Demonstrating seamless text-to-ISL and speech-to-ISL animated translation with our cultural 3D avatar engine.',
    image: '/images/gallery/gallery-6.jpg',
    badge: '3D Sign Avatar',
    icon: 'accessibility_new',
    highlight: false,
  },
  {
    id: 'gallery-7',
    title: 'Team HacKNomads Development Sprint',
    category: 'workshops',
    categoryLabel: 'Workshops & Education',
    description: 'Our passionate engineering team refining real-time WebRTC calling, neural models, and accessibility overlays.',
    image: '/images/gallery/gallery-7.jpg',
    badge: 'Hackathon Innovation',
    icon: 'code',
    highlight: true,
  },
  {
    id: 'gallery-8',
    title: 'Public Services & Citizen Helpdesk Prototype',
    category: 'community',
    categoryLabel: 'Community & Culture',
    description: 'Making civic centers, banking desks, and public utility counters fully accessible to Indian Sign Language users.',
    image: '/images/gallery/gallery-8.jpg',
    badge: 'Civic Inclusion',
    icon: 'account_balance',
    highlight: false,
  },
  {
    id: 'gallery-9',
    title: 'Everyday Conversations & Peer Signing Circle',
    category: 'community',
    categoryLabel: 'Community & Culture',
    description: 'Fostering natural conversations between family members, elders, and youth using instantaneous ISL translation.',
    image: '/images/gallery/gallery-9.jpg',
    badge: 'Everyday Life',
    icon: 'forum',
    highlight: false,
  },
  {
    id: 'gallery-10',
    title: 'Expressive Cultural Anthem Signing Showcase',
    category: 'community',
    categoryLabel: 'Community & Culture',
    description: 'Celebrating Indian heritage with synchronized ISL performances of the National Anthem and cultural pledges.',
    image: '/images/gallery/gallery-10.jpg',
    badge: 'Cultural Pride',
    icon: 'flag',
    highlight: true,
  },
  {
    id: 'gallery-11',
    title: 'Multi-Platform WebRTC Video Calling Testing',
    category: 'technology',
    categoryLabel: 'AI & Technology',
    description: 'Testing peer-to-peer WebRTC video channels with synchronized live captions and automated sign recognition.',
    image: '/images/gallery/gallery-11.jpg',
    badge: 'WebRTC P2P',
    icon: 'videocam',
    highlight: false,
  },
  {
    id: 'gallery-12',
    title: 'Accessible Healthcare & Prescription Scanner',
    category: 'healthcare',
    categoryLabel: 'Healthcare & Assistive',
    description: 'AI document scanning converting doctor handwriting and prescriptions into accessible ISL signed explanations.',
    image: '/images/gallery/gallery-12.jpg',
    badge: 'Smart Assistive',
    icon: 'document_scanner',
    highlight: false,
  },
  {
    id: 'gallery-13',
    title: 'Deaf Community Empowerment & Feedback Forum',
    category: 'community',
    categoryLabel: 'Community & Culture',
    description: 'Continuous feedback loops with native ISL signers to ensure accuracy, dignity, and authentic cultural nuances.',
    image: '/images/gallery/gallery-13.jpg',
    badge: 'Empowerment',
    icon: 'diversity_3',
    highlight: true,
  },
];

type CategoryFilter = 'all' | 'technology' | 'community' | 'healthcare' | 'workshops';
type ViewLayout = 'grid' | 'reel' | 'spotlight';

export const GallerySection: React.FC = () => {
  const { t } = useAccessibility();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [activeLayout, setActiveLayout] = useState<ViewLayout>('grid');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);

  const filteredItems = selectedCategory === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === selectedCategory);

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
    if (isAutoPlaying && lightboxIndex !== null) {
      interval = setInterval(() => {
        nextLightbox();
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, lightboxIndex, nextLightbox]);

  // Infinite Marquee / Reel Ref
  const reelRef = useRef<HTMLDivElement | null>(null);
  const [isReelHovered, setIsReelHovered] = useState(false);

  useEffect(() => {
    if (activeLayout !== 'reel') return;
    const el = reelRef.current;
    if (!el) return;

    let animId: number;
    const speed = 0.75;

    const scroll = () => {
      if (!isReelHovered && el) {
        el.scrollLeft += speed;
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      animId = requestAnimationFrame(scroll);
    };

    animId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animId);
  }, [activeLayout, isReelHovered]);

  return (
    <section id="gallery-section" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#080d16] dark:via-[#0c121e] dark:to-[#080d16] border-t border-[#e2e8f0] dark:border-[#2d3133] transition-colors relative overflow-hidden">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-500/10 via-amber-500/10 to-purple-500/10 dark:from-[#fe9832]/10 dark:via-indigo-500/10 dark:to-teal-500/10 blur-[130px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute -bottom-20 right-10 w-96 h-96 bg-purple-500/10 dark:bg-[#fe9832]/5 blur-[120px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 dark:from-[#fe9832]/15 dark:to-indigo-500/15 border border-amber-500/20 dark:border-[#fe9832]/30 mb-4 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#fe9832] animate-ping" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-700 dark:text-[#fe9832]">
              {t('gallery.badge', 'Visual Showcase & Community Gallery')}
            </span>
          </div>

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

        {/* Controls Bar: Category Filters & Layout Switcher */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-4 border-b border-slate-200 dark:border-slate-800">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {[
              { key: 'all', label: t('gallery.filterAll', 'All Moments'), count: GALLERY_ITEMS.length, icon: 'auto_awesome' },
              { key: 'technology', label: t('gallery.filterTech', 'AI & Tech'), count: GALLERY_ITEMS.filter((i) => i.category === 'technology').length, icon: 'neurology' },
              { key: 'community', label: t('gallery.filterCommunity', 'Community & Culture'), count: GALLERY_ITEMS.filter((i) => i.category === 'community').length, icon: 'groups' },
              { key: 'healthcare', label: t('gallery.filterHealthcare', 'Healthcare'), count: GALLERY_ITEMS.filter((i) => i.category === 'healthcare').length, icon: 'local_hospital' },
              { key: 'workshops', label: t('gallery.filterWorkshops', 'Workshops'), count: GALLERY_ITEMS.filter((i) => i.category === 'workshops').length, icon: 'school' },
            ].map((tab) => {
              const isActive = selectedCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedCategory(tab.key as CategoryFilter)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#3d1e00] shadow-md shadow-indigo-500/20 scale-[1.02]'
                      : 'bg-white dark:bg-[#121824] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#243044] hover:border-indigo-400 dark:hover:border-[#fe9832]/50 hover:text-indigo-600 dark:hover:text-[#fe9832]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive ? 'bg-white/20 text-white dark:bg-black/20 dark:text-[#3d1e00]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Layout Switcher (Grid / Reel / Spotlight) */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#121824] p-1 rounded-xl border border-slate-200 dark:border-[#243044] shadow-xs">
            <button
              type="button"
              onClick={() => setActiveLayout('grid')}
              title={t('gallery.layoutGrid', 'Masonry Grid View')}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                activeLayout === 'grid'
                  ? 'bg-indigo-600 text-white dark:bg-[#fe9832] dark:text-[#3d1e00] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">grid_view</span>
              <span className="hidden sm:inline">{t('gallery.grid', 'Grid')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLayout('reel')}
              title={t('gallery.layoutReel', 'Continuous Flowing Reel')}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                activeLayout === 'reel'
                  ? 'bg-indigo-600 text-white dark:bg-[#fe9832] dark:text-[#3d1e00] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">view_carousel</span>
              <span className="hidden sm:inline">{t('gallery.reel', 'Reel')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLayout('spotlight')}
              title={t('gallery.layoutSpotlight', 'Spotlight Showcase')}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                activeLayout === 'spotlight'
                  ? 'bg-indigo-600 text-white dark:bg-[#fe9832] dark:text-[#3d1e00] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">center_focus_strong</span>
              <span className="hidden sm:inline">{t('gallery.spotlight', 'Spotlight')}</span>
            </button>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: DYNAMIC MASONRY / ANIMATED GRID VIEW                             */}
        {/* ========================================================================= */}
        {activeLayout === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 animate-fadeIn">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => openLightbox(idx)}
                className="group relative bg-white dark:bg-[#0f1726] rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-[#222d42] overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-400 dark:hover:border-[#fe9832]/60 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col"
              >
                {/* Image Container with Zoom Effect */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      (e.target as HTMLElement).style.opacity = '0.7';
                    }}
                  />

                  {/* Gradient Overlay for Contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Top Badge Pill */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold shadow-sm">
                    <span className="material-symbols-outlined text-[14px] text-[#fe9832]">{item.icon}</span>
                    <span>{item.badge}</span>
                  </div>

                  {/* Top Right Zoom Icon */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-75 transition-all duration-300 shadow-md">
                    <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                  </div>

                  {/* Title & Category on Image */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 dark:text-[#fe9832] block mb-0.5">
                      {item.categoryLabel}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1 group-hover:text-amber-200 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* Card Body Description */}
                <div className="p-4 flex-1 flex flex-col justify-between bg-white dark:bg-[#0f1726]">
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed font-medium">
                    {item.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-[#fe9832]">
                    <span className="flex items-center gap-1">
                      <span>View Fullscreen</span>
                      <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </span>
                    <span className="text-slate-400 font-normal">SAMBHAV AI</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CONTINUOUS FLOWING REEL / MARQUEE                                */}
        {/* ========================================================================= */}
        {activeLayout === 'reel' && (
          <div className="relative overflow-hidden py-4 animate-fadeIn">
            <div
              ref={reelRef}
              onMouseEnter={() => setIsReelHovered(true)}
              onMouseLeave={() => setIsReelHovered(false)}
              className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth py-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Double array for seamless loop */}
              {[...filteredItems, ...filteredItems].map((item, idx) => (
                <div
                  key={`${item.id}-reel-${idx}`}
                  onClick={() => openLightbox(idx % filteredItems.length)}
                  className="shrink-0 w-72 sm:w-80 bg-white dark:bg-[#0f1726] rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-[#222d42] overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-400 dark:hover:border-[#fe9832]/60 transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer group"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-[#fe9832]">{item.icon}</span>
                      <span>{item.badge}</span>
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <h4 className="text-sm font-bold text-white line-clamp-1">{item.title}</h4>
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#0f1726]">
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t('gallery.reelHint', 'Hover over images to pause • Click any photo to view in high definition')}
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: SPOTLIGHT FEATURED HERO SHOWCASE                                  */}
        {/* ========================================================================= */}
        {activeLayout === 'spotlight' && (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center bg-white dark:bg-[#0f1726] p-4 sm:p-8 rounded-3xl border border-slate-200 dark:border-[#222d42] shadow-xl animate-fadeIn">
            
            {/* Left Main Spotlight Image */}
            <div
              onClick={() => openLightbox(spotlightIndex)}
              className="w-full lg:w-3/5 relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900 shadow-lg cursor-pointer group"
            >
              <img
                src={filteredItems[spotlightIndex]?.image || GALLERY_ITEMS[0].image}
                alt={filteredItems[spotlightIndex]?.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                <span className="material-symbols-outlined text-[16px] text-[#fe9832]">
                  {filteredItems[spotlightIndex]?.icon}
                </span>
                <span>{filteredItems[spotlightIndex]?.badge}</span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300 dark:text-[#fe9832]">
                  {filteredItems[spotlightIndex]?.categoryLabel}
                </span>
                <h3 className="text-lg sm:text-2xl font-bold text-white mt-1">
                  {filteredItems[spotlightIndex]?.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 line-clamp-2 max-w-xl">
                  {filteredItems[spotlightIndex]?.description}
                </p>
              </div>

              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                <span className="material-symbols-outlined text-[22px]">fullscreen</span>
              </div>
            </div>

            {/* Right Thumbnails & Navigation */}
            <div className="w-full lg:w-2/5 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {t('gallery.spotlightSelect', 'Select Moment')} ({spotlightIndex + 1}/{filteredItems.length})
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSpotlightIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-500 hover:text-white dark:hover:bg-[#fe9832] dark:hover:text-[#3d1e00] transition cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSpotlightIndex((prev) => (prev + 1) % filteredItems.length)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-500 hover:text-white dark:hover:bg-[#fe9832] dark:hover:text-[#3d1e00] transition cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {filteredItems.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSpotlightIndex(idx)}
                      className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        spotlightIndex === idx
                          ? 'border-indigo-600 dark:border-[#fe9832] shadow-md scale-95 ring-2 ring-indigo-300 dark:ring-[#fe9832]/30'
                          : 'border-transparent opacity-70 hover:opacity-100 hover:border-slate-300'
                      }`}
                    >
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      {spotlightIndex === idx && (
                        <div className="absolute inset-0 bg-indigo-600/20 dark:bg-[#fe9832]/20" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => openLightbox(spotlightIndex)}
                className="w-full py-3 px-4 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#3d1e00] rounded-xl font-bold text-sm shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                <span>{t('gallery.viewSpotlightHD', 'View Full Definition Photo')}</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* FULLSCREEN ANIMATED LIGHTBOX MODAL                                       */}
      {/* ========================================================================= */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-fadeIn select-none">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-amber-300 dark:text-[#fe9832] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">{filteredItems[lightboxIndex].icon}</span>
                <span>{filteredItems[lightboxIndex].badge}</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {lightboxIndex + 1} / {filteredItems.length}
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
                <span className="hidden sm:inline">{isAutoPlaying ? 'Slideshow Playing' : 'Auto-Play'}</span>
              </button>

              {/* Close Lightbox */}
              <button
                type="button"
                onClick={closeLightbox}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
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
                src={filteredItems[lightboxIndex].image}
                alt={filteredItems[lightboxIndex].title}
                className="max-h-[75vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border border-white/10"
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

          {/* Bottom Caption & Thumbnail Strip */}
          <div className="bg-black/70 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-white flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl mx-auto w-full">
            <div className="text-left">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#fe9832]">
                {filteredItems[lightboxIndex].categoryLabel}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {filteredItems[lightboxIndex].title}
              </h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed mt-0.5">
                {filteredItems[lightboxIndex].description}
              </p>
            </div>

            {/* Mini Thumbnails */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs sm:max-w-md no-scrollbar py-1">
              {filteredItems.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                    lightboxIndex === idx ? 'border-[#fe9832] scale-110 shadow-md' : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

    </section>
  );
};
