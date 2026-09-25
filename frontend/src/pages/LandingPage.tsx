import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../hooks/useAccessibility';
import { Chatbot } from '../components/chatbot/Chatbot';
import { AccessibilityModal } from '../components/accessibility/AccessibilityModal';
import { AccessibilityOverlays } from '../components/accessibility/AccessibilityOverlays';
import { GallerySection } from '../components/landing/GallerySection';

export const SAMBHAV_HERO_SLIDES = [
  {
    id: 'workplace',
    title: 'Workplace Meetings & Inclusive Teams',
    subtitle: 'Real-time ISL interpretation for collaborative meetings, team discussions, and accessible presentations.',
    image: '/images/hero/hero-workplace-meeting.jpg',
    tag: 'Workplace & Teams',
    badge: 'Meeting Collaboration',
    icon: 'groups'
  },
  {
    id: 'healthcare',
    title: 'Healthcare & Hospital Consultations',
    subtitle: 'Direct two-way communication between doctors, medical staff, and Deaf patients during clinical care.',
    image: '/images/hero/hero-hospital-doctor.jpg',
    tag: 'Healthcare & Clinics',
    badge: 'Doctor Consultations',
    icon: 'local_hospital'
  },
  {
    id: 'retail',
    title: 'Retail Shops & Local Kirana Stores',
    subtitle: 'Frictionless customer assistance, shopping inquiries, and payment interactions with merchant storekeepers.',
    image: '/images/hero/hero-kirana-store.jpg',
    tag: 'Retail & Commerce',
    badge: 'Daily Commerce',
    icon: 'storefront'
  },
  {
    id: 'transit',
    title: 'Transit Hubs & Railway Stations',
    subtitle: 'Real-time transit navigation, ticket counter queries, and station announcements for accessible travel.',
    image: '/images/hero/hero-railway-station.jpg',
    tag: 'Transit & Travel',
    badge: 'Public Transport',
    icon: 'train'
  },
  {
    id: 'community',
    title: 'Everyday Conversations & Community',
    subtitle: 'Natural, expressive conversations connecting family members, elders, and hearing peers in daily life.',
    image: '/images/hero/hero-park-elderly.jpg',
    tag: 'Everyday Life',
    badge: 'Family & Community',
    icon: 'forum'
  }
];

const SAMBHAV_USE_CASES = [
  {
    id: 'retail',
    title: 'Retail Shops',
    description: 'Empowering Retail and Store Associates to Communicate clearly with Deaf Shoppers During Customer Assistance and Billing.',
    image: '/images/hero/hero-kirana-store.jpg',
    fallback: '/images/retail-shops.jpg',
    tag: 'Retail & Stores',
    icon: 'storefront'
  },
  {
    id: 'travel',
    title: 'Travel Boarding',
    description: 'Assisting Deaf and Hard-of-Hearing Travelers with Transit Announcements, Ticket Counter Interactions, and Route Guidance',
    image: '/images/hero/hero-railway-station.jpg',
    fallback: '/images/travel-boarding.jpg',
    tag: 'Transit & Travel',
    icon: 'train'
  },
  {
    id: 'banking',
    title: 'Banking',
    description: 'Enabling Accessible Teller Counters, Customer Support, and Banking Services with Real-time Indian Sign Language Support',
    image: '/images/banking.jpg',
    fallback: '/images/landing/banks.jpg',
    tag: 'Banking & Finance',
    icon: 'account_balance'
  },
  {
    id: 'public',
    title: 'Public Services',
    description: 'Making Government Service Centers, Citizen Helpdesks, and Public Utility Offices Accessible to Indian Sign Language Users.',
    image: '/images/public-services.jpg',
    fallback: '/images/landing/public-services.jpg',
    tag: 'Government & Civic',
    icon: 'account_balance'
  },
  {
    id: 'healthcare',
    title: 'HealthCare',
    description: 'Improving Medical Consultations, Clinical intake, and Hospital Care Through Clear Sign-to-Text And Text-to-Sign Communication',
    image: '/images/hero/hero-hospital-doctor.jpg',
    fallback: '/images/healthcare.jpg',
    tag: 'Medical & Health',
    icon: 'local_hospital'
  },
  {
    id: 'everyday',
    title: 'Everyday Conversations',
    description: 'Facilitating Natural Two-Way Conversations Between Deaf Individuals, Family Members, and Hearing Peers at Home and in Public.',
    image: '/images/hero/hero-park-elderly.jpg',
    fallback: '/images/everyday-conversations.jpg',
    tag: 'Daily Communication',
    icon: 'forum'
  },
  {
    id: 'workplace',
    title: 'Workplace & Institutes',
    description: 'Fostering Inclusive Corporate and Team Environments with Accessible Meetings, Onboarding, and Daily Collaboration.',
    image: '/images/hero/hero-workplace-meeting.jpg',
    fallback: '/images/workplace.jpg',
    tag: 'Corporate & Teams',
    icon: 'domain'
  },
  {
    id: 'news',
    title: 'News',
    description: 'Delivering Accessible Media and Television Broadcasts with Synchronized Indian Sign Language Interpretation for Deaf Viewers.',
    image: '/images/news.jpg',
    fallback: '/images/landing/isl-hero-showcase.jpg',
    tag: 'Media & Broadcast',
    icon: 'live_tv'
  }
];

const EXTENDED_USE_CASES = [...SAMBHAV_USE_CASES, ...SAMBHAV_USE_CASES, ...SAMBHAV_USE_CASES];

// ---------------------------------------------------------------------------
// FAQ ACCORDION ITEM — self-contained open/close state
// ---------------------------------------------------------------------------
interface FAQItemProps {
  idx: number;
  question: string;
  answer: string;
}
const FAQItem: React.FC<FAQItemProps> = ({ idx, question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        open
          ? 'border-indigo-300 dark:border-[#fe9832]/50 bg-indigo-50/60 dark:bg-[#fe9832]/5 shadow-sm'
          : 'border-[#e2e8f0] dark:border-[#2d3133] bg-white dark:bg-[#0d121d] hover:border-indigo-200 dark:hover:border-[#fe9832]/30'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 cursor-pointer group"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span
            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border ${
              open
                ? 'bg-indigo-600 dark:bg-[#fe9832] text-white dark:text-[#3d1e00] border-transparent'
                : 'bg-indigo-50 dark:bg-[#fe9832]/10 text-indigo-600 dark:text-[#fe9832] border-indigo-200 dark:border-[#fe9832]/30'
            }`}
          >
            {String(idx + 1).padStart(2, '0')}
          </span>
          <span className="text-base sm:text-lg font-bold text-[#0f172a] dark:text-white leading-snug">
            {question}
          </span>
        </div>
        <span
          className={`material-symbols-outlined shrink-0 text-[22px] transition-transform duration-300 ${
            open
              ? 'rotate-45 text-indigo-600 dark:text-[#fe9832]'
              : 'text-[#94a3b8] group-hover:text-indigo-500 dark:group-hover:text-[#fe9832]'
          }`}
        >
          add
        </span>
      </button>

      {/* Animated answer panel */}
      <div
        className={`px-5 text-sm sm:text-base text-[#475569] dark:text-[#cbd5e1] leading-relaxed transition-all duration-300 ease-in-out overflow-hidden ${
          open ? 'max-h-52 pb-5 opacity-100' : 'max-h-0 pb-0 opacity-0'
        }`}
      >
        <div className="pl-11 border-l-2 border-indigo-200 dark:border-[#fe9832]/30">
          {answer}
        </div>
      </div>
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme, openModal, activeFeaturesCount, t } = useAccessibility();

  // Hero Slides Auto-play Carousel State (5 Authentic Indian Sign Language Scenes)
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  // Auto-play Hero Slides (every 2 seconds continuously)
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % SAMBHAV_HERO_SLIDES.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Use Cases Carousel State (Infinite seamless loop)
  const [useCaseIndex, setUseCaseIndex] = useState(SAMBHAV_USE_CASES.length);
  const [isUseCaseTransitioning, setIsUseCaseTransitioning] = useState(true);
  const [isUseCaseAutoPlaying, setIsUseCaseAutoPlaying] = useState(true);
  const [itemsPerSlide, setItemsPerSlide] = useState(3);

  // Contact Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Responsive Carousel Slides Calculation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerSlide(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerSlide(2);
      } else {
        setItemsPerSlide(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNextUseCase = () => {
    setUseCaseIndex((prev) => prev + 1);
  };

  const handlePrevUseCase = () => {
    setUseCaseIndex((prev) => prev - 1);
  };

  const handleUseCaseTransitionEnd = () => {
    if (useCaseIndex >= SAMBHAV_USE_CASES.length * 2) {
      setIsUseCaseTransitioning(false);
      setUseCaseIndex((prev) => prev - SAMBHAV_USE_CASES.length);
    } else if (useCaseIndex < SAMBHAV_USE_CASES.length) {
      setIsUseCaseTransitioning(false);
      setUseCaseIndex((prev) => prev + SAMBHAV_USE_CASES.length);
    }
  };

  // Re-enable smooth transitions seamlessly without snapping backward
  useEffect(() => {
    if (!isUseCaseTransitioning) {
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsUseCaseTransitioning(true);
        });
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [isUseCaseTransitioning]);

  // Auto-play Carousel Loop (every 1.5 seconds)
  useEffect(() => {
    let timer: any;
    if (isUseCaseAutoPlaying) {
      timer = setInterval(() => {
        handleNextUseCase();
      }, 1500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isUseCaseAutoPlaying]);

  // IntersectionObserver for animated gauges
  useEffect(() => {
    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            if (target.classList.contains('gauge-ring')) {
              const percent = parseFloat(target.getAttribute('data-percent') || '0');
              const circumference = 2 * Math.PI * 40;
              const offset = circumference - (percent / 100) * circumference;
              target.style.transition = 'stroke-dashoffset 1.2s ease-out';
              target.style.strokeDashoffset = offset.toString();
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    const statElements = document.querySelectorAll('.gauge-ring');
    statElements.forEach((el) => statObserver.observe(el));

    return () => {
      statObserver.disconnect();
    };
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;
    setFormSubmitted(true);
    setTimeout(() => {
      setFormName('');
      setFormEmail('');
      setFormMessage('');
      setFormSubmitted(false);
    }, 4000);
  };

  const scrollTo = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="page-bg text-[#181c1e] dark:text-[#f7fafc] antialiased min-h-screen font-['Inter',sans-serif] selection:bg-[#fe9832] selection:text-[#683700] transition-colors duration-200">
      
      {/* ========================================================================= */}
      {/* HEADER                                                                    */}
      {/* ========================================================================= */}
      <header className="fixed top-0 w-full bg-white/90 dark:bg-[#030813]/90 backdrop-blur-md z-50 border-b border-[#e2e8f0] dark:border-[#2d3133] left-0 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <button
                type="button"
                onClick={() => {
                  if (user) {
                    navigate('/dashboard');
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="flex items-center space-x-2.5 text-left cursor-pointer group"
                title={user ? 'Go to Dashboard' : 'SAMBHAV Home'}
              >
                <img
                  alt="Sambhav Logo"
                  className="h-9 w-9 rounded-full object-cover shadow-xs border border-[#e2e8f0] dark:border-[#2d3133] group-hover:scale-105 transition-transform"
                  src="/logo.png"
                />
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-headline">
                  SAM<span className="text-indigo-600 dark:text-[#fe9832] font-black">BHAV</span>
                </span>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-7 text-base font-medium">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-[#334155] dark:text-[#cbd5e1] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer font-bold"
              >
                {t('nav.home', 'Home')}
              </button>
              <button
                type="button"
                onClick={() => scrollTo('problem-section')}
                className="text-[#334155] dark:text-[#cbd5e1] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer font-bold"
              >
                {t('nav.problem', 'Problem')}
              </button>
              <button
                type="button"
                onClick={() => scrollTo('products-section')}
                className="text-[#334155] dark:text-[#cbd5e1] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer font-bold"
              >
                {t('nav.products', 'Products')}
              </button>
              <button
                type="button"
                onClick={() => scrollTo('features-section')}
                className="text-[#334155] dark:text-[#cbd5e1] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer font-bold"
              >
                {t('nav.features', 'Features')}
              </button>
              <button
                type="button"
                onClick={() => scrollTo('gallery-section')}
                className="text-[#334155] dark:text-[#cbd5e1] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer font-bold flex items-center gap-1.5 group"
              >
                <span>{t('nav.gallery', 'Gallery')}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#fe9832] group-hover:scale-125 transition-transform animate-pulse" />
              </button>
              <button
                type="button"
                onClick={() => scrollTo('faq-section')}
                className="text-[#334155] dark:text-[#cbd5e1] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer font-bold"
              >
                {t('nav.faq', 'FAQ')}
              </button>
              <button
                type="button"
                onClick={() => scrollTo('contact-section')}
                className="text-[#334155] dark:text-[#cbd5e1] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer font-bold"
              >
                {t('nav.contact', 'Contact Us')}
              </button>
            </nav>

            {/* Theme Toggle & CTA Buttons */}
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              
              {/* Accessibility Suite Button (UX4G Standard) */}
              <button
                type="button"
                onClick={openModal}
                className="p-2.5 rounded-xl border border-[#e2e8f0] dark:border-[#2d3133] bg-[#f8fafc] dark:bg-[#1a202c] text-[#0f172a] dark:text-[#fe9832] hover:text-indigo-600 dark:hover:text-[#fe9832] hover:border-indigo-300 dark:hover:border-[#fe9832] transition-all shadow-xs flex items-center justify-center cursor-pointer active:scale-95 relative"
                title={t('nav.accessibility', 'Accessibility & Assistive Options')}
                aria-label={t('nav.accessibility', 'Accessibility & Assistive Options')}
              >
                <span className="material-symbols-outlined text-[20px]">
                  accessibility_new
                </span>
                {activeFeaturesCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-[#fe9832] text-[#542900] text-[11px] font-black rounded-full shadow-xs">
                    {activeFeaturesCount}
                  </span>
                )}
              </button>

              {/* Dark / Light Mode Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2.5 rounded-xl border border-[#e2e8f0] dark:border-[#2d3133] bg-[#f8fafc] dark:bg-[#1a202c] text-[#0f172a] dark:text-[#fe9832] hover:text-indigo-600 dark:hover:text-[#fe9832] hover:border-indigo-300 dark:hover:border-[#fe9832] transition-all shadow-xs flex items-center justify-center cursor-pointer active:scale-95"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label={t('nav.themeToggle', 'Toggle Dark / Light Mode')}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
              </button>

              {user ? (
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#3d1e00] px-5 py-2.5 rounded-xl text-sm sm:text-base font-bold shadow-md shadow-indigo-500/25 dark:shadow-none hover:opacity-95 transition-all cursor-pointer"
                >
                  {t('nav.dashboard', 'Dashboard')}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-sm sm:text-base font-bold text-[#0f172a] dark:text-[#fe9832] hover:text-indigo-600 dark:hover:text-[#ffb77a] px-3.5 sm:px-4 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    {t('nav.login', 'Log In')}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#3d1e00] px-5 sm:px-6 py-2.5 rounded-xl text-sm sm:text-base font-bold shadow-md shadow-indigo-500/25 dark:shadow-none hover:opacity-95 transition-all cursor-pointer"
                  >
                    {t('nav.signup', 'Sign Up')}
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN CONTENT                                                              */}
      {/* ========================================================================= */}
      <main className="pt-16">
        
        {/* ------------------------------------------------------------------------- */}
        {/* 1. HERO SECTION WITH DYNAMIC FULL-BLEED BACKGROUND SLIDESHOW              */}
        {/* ------------------------------------------------------------------------- */}
        <section
          className="relative pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-14 lg:pb-24 overflow-hidden flex flex-col justify-center items-center min-h-[620px] sm:min-h-[680px] lg:min-h-[740px]"
        >
          {/* Dynamic Background Slideshow with Smooth Seamless Crossfade */}
          <div className="absolute inset-0 z-0">
            {SAMBHAV_HERO_SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out will-change-transform ${
                  idx === heroSlideIndex
                    ? 'opacity-100 z-1 scale-100'
                    : 'opacity-0 z-0 pointer-events-none scale-100'
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                />
              </div>
            ))}

            {/* Minimal transparent overlay allowing full photographic clarity of the hero slides */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/40 pointer-events-none" />

            {/* Radial Color Accents */}
            <div className="absolute top-[-80px] right-[-80px] w-[450px] h-[450px] bg-indigo-500/10 dark:bg-[#fe9832]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-60px] left-[10%] w-[400px] h-[400px] bg-purple-500/10 dark:bg-[#fe9832]/8 rounded-full blur-[110px] pointer-events-none" />
          </div>

          <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
            
            {/* Top Status Badge (Moved Upwards) */}
            <div className="inline-flex items-center justify-center gap-2.5 max-w-[94vw] w-fit px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white/95 dark:bg-[#030813]/90 border border-slate-300/80 dark:border-[#fe9832]/40 text-slate-950 dark:text-[#fe9832] text-xs sm:text-sm md:text-base font-extrabold mb-10 sm:mb-14 lg:mb-16 shadow-md backdrop-blur-md text-center transition-all -translate-y-2 sm:-translate-y-3">
              <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-[#fe9832] animate-ping" />
              <span className="font-extrabold tracking-tight truncate sm:whitespace-nowrap">{t('hero.badge', 'SAMBHAV — Indian Sign Language AI')}</span>
            </div>

            {/* Main Headline Container (Shifted Downwards with Clear Breathing Room) */}
            <div className="relative inline-block w-fit max-w-[94vw] sm:max-w-2xl md:max-w-3xl lg:max-w-3xl mb-7 sm:mb-9 px-5 sm:px-8 py-5 sm:py-7 rounded-2xl sm:rounded-[28px] bg-white/[0.08] dark:bg-black/25 backdrop-blur-[3px] border border-white/30 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/40 translate-y-1 sm:translate-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem] font-black tracking-tight text-slate-950 dark:text-white leading-[1.24] sm:leading-[1.2] font-headline drop-shadow-sm mx-auto">
                {t('hero.title.prefix', 'Transforming')}{' '}
                <span className="text-indigo-600 dark:text-[#fe9832] font-black">
                  {t('hero.title.highlight', 'Indian Sign Language')}
                </span>{' '}
                {t('hero.title.suffix', 'Into Meaningful Human Connection')}
              </h1>
            </div>

            {/* Action CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/communicate')}
                className="w-full sm:w-auto bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#3d1e00] px-8 sm:px-10 py-4 rounded-xl text-base sm:text-lg font-extrabold shadow-lg shadow-indigo-500/25 dark:shadow-[0_4px_20px_rgba(254,152,50,0.35)] hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 text-center cursor-pointer flex items-center justify-center gap-2.5"
              >
                <span className="material-symbols-outlined text-[22px]">videocam</span>
                <span>{t('hero.cta.try', 'Try Sambhav Now')}</span>
              </button>
              <button
                type="button"
                onClick={() => scrollTo('how-it-works-section')}
                className="w-full sm:w-auto bg-white/95 dark:bg-[#1a202c]/95 text-[#0f172a] dark:text-[#f7fafc] border border-slate-300 dark:border-[#2d3133] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 px-8 sm:px-10 py-4 rounded-xl text-base sm:text-lg font-bold hover:bg-slate-50 dark:hover:bg-[#2d3133] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2.5 shadow-xs hover:shadow-sm cursor-pointer backdrop-blur-sm"
              >
                <span className="material-symbols-outlined text-indigo-600 dark:text-[#fe9832] text-[22px]">info</span>
                <span>{t('hero.cta.how', 'How it Works')}</span>
              </button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-3.5 mt-8 pt-6 border-t border-slate-200/60 dark:border-[#2d3133]/80 text-xs sm:text-sm md:text-base font-bold text-[#1e293b] dark:text-[#cbd5e1] w-full max-w-4xl">
              <span className="flex items-center gap-2 px-4 py-2 bg-white/95 dark:bg-[#0d121d]/85 rounded-full border border-slate-200 dark:border-[#2d3133] shadow-xs backdrop-blur-sm text-slate-800 dark:text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 dark:bg-[#fe9832]" />
                {t('hero.pill.avatar', 'Real-time 3D ISL Avatar')}
              </span>
              <span className="flex items-center gap-2 px-4 py-2 bg-white/95 dark:bg-[#0d121d]/85 rounded-full border border-slate-200 dark:border-[#2d3133] shadow-xs backdrop-blur-sm text-slate-800 dark:text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-[#059669]" />
                {t('hero.pill.speech', 'Live Speech & Subtitles')}
              </span>
              <span className="flex items-center gap-2 px-4 py-2 bg-white/95 dark:bg-[#0d121d]/85 rounded-full border border-slate-200 dark:border-[#2d3133] shadow-xs backdrop-blur-sm text-slate-800 dark:text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 dark:bg-[#2563eb]" />
                {t('hero.pill.webrtc', 'End-to-End Encrypted WebRTC')}
              </span>
            </div>

          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 2. PROBLEM: COMMUNICATION CHALLENGES IN INDIA                             */}
        {/* ------------------------------------------------------------------------- */}
        <section id="problem-section" className="py-12 sm:py-16 lg:py-20 relative bg-white dark:bg-[#0d121d] rounded-[2rem] sm:rounded-[2.5rem] mx-3 sm:mx-6 lg:mx-8 border border-[#e2e8f0] dark:border-[#2d3133] shadow-sm my-8 sm:my-12 transition-colors">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-8 sm:mb-10">
              <span className="px-4 py-1.5 bg-indigo-50 dark:bg-[#fe9832]/10 border border-indigo-200 dark:border-[#fe9832]/30 text-indigo-700 dark:text-[#fe9832] text-sm font-bold rounded-full mb-3 inline-block">
                {t('problem.tag', 'The Accessibility Gap')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0f172a] dark:text-white mb-3 font-headline tracking-tight">
                {t('problem.title', 'Communication Challenges in India')}
              </h2>
              <p className="text-base sm:text-lg text-[#475569] dark:text-[#94a3b8] max-w-2xl mx-auto font-body-lg leading-relaxed">
                {t('problem.desc', 'The communication gap in India affects millions, with a critical shortage of resources leaving the Deaf and hard-of-hearing community with limited access to essential information and services.')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8 items-center max-w-2xl mx-auto">
              
              {/* 63M+ Stat Gauge */}
              <div className="flex flex-col items-center text-center space-y-3.5 bg-[#f8fafc] dark:bg-[#1a202c]/50 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#e2e8f0] dark:border-[#2d3133] shadow-xs">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" fill="none" r="40" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="8" />
                    <circle
                      className="gauge-ring"
                      cx="50"
                      cy="50"
                      data-percent="85"
                      fill="none"
                      r="40"
                      stroke="#4f46e5"
                      strokeDasharray="251.2"
                      strokeDashoffset="37.6991"
                      strokeLinecap="round"
                      strokeWidth="8"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[#0f172a] dark:text-white font-extrabold text-2xl sm:text-3xl font-headline">
                      {t('problem.stat1.number', '63M+')}
                    </span>
                  </div>
                </div>
                <h3 className="text-[#0f172a] dark:text-white font-bold text-base sm:text-lg font-headline">
                  {t('problem.stat1.title', 'Significant Hearing Loss')}
                </h3>
                <p className="text-[#64748b] dark:text-[#94a3b8] text-sm sm:text-base leading-relaxed">
                  {t('problem.stat1.desc', 'Individuals facing daily communication barriers.')}
                </p>
                <span className="text-xs font-bold text-indigo-700 dark:text-[#fe9832] bg-indigo-50 dark:bg-[#fe9832]/10 border border-indigo-200 dark:border-[#fe9832]/20 px-3 py-1 rounded-full">
                  {t('problem.stat1.source', 'Source: WHO')}
                </span>
              </div>

              {/* <1% Stat Gauge */}
              <div className="flex flex-col items-center text-center space-y-3.5 bg-[#f7fafc] dark:bg-[#1a202c]/50 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#e0e3e5] dark:border-[#2d3133] shadow-xs">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" fill="none" r="40" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="8" />
                    <circle
                      className="gauge-ring"
                      cx="50"
                      cy="50"
                      data-percent="1"
                      fill="none"
                      r="40"
                      stroke="#e11d48"
                      strokeDasharray="251.2"
                      strokeDashoffset="248.814"
                      strokeLinecap="round"
                      strokeWidth="8"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[#030813] dark:text-white font-extrabold text-2xl sm:text-3xl font-headline">
                      {t('problem.stat2.number', '<1%')}
                    </span>
                  </div>
                </div>
                <h3 className="text-[#030813] dark:text-white font-bold text-base sm:text-lg font-headline">
                  {t('problem.stat2.title', 'Access to ISL Education')}
                </h3>
                <p className="text-[#64748b] dark:text-[#94a3b8] text-sm sm:text-base leading-relaxed">
                  {t('problem.stat2.desc', 'Deaf individuals with access to formal ISL education.')}
                </p>
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-3 py-1 rounded-full">
                  {t('problem.stat2.source', 'Source: Census of India')}
                </span>
              </div>

            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* OUR PRODUCTS THROUGH SIGN LANGUAGE AI                                     */}
        {/* ------------------------------------------------------------------------- */}
        <section id="products-section" className="py-12 sm:py-16 lg:py-20 relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0f172a] dark:text-white mb-3 font-headline tracking-tight">
                {t('products.title', 'Our Products Through Sign Language AI')}
              </h2>
              <p className="text-base sm:text-lg text-[#475569] dark:text-[#94a3b8] font-medium max-w-xl mx-auto">
                {t('products.subtitle', 'Connecting People Beyond Words')}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
              
              {/* Card 1: SAMBHAV Translate */}
              <div className="group rounded-[28px] sm:rounded-[36px] bg-[#2d0e14] dark:bg-[#1f090d] text-white p-6 sm:p-8 flex flex-col justify-between border border-[#5c1c28]/70 shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
                <div className="relative z-10">
                  {/* Tags */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-4 py-1 bg-white/20 text-white backdrop-blur-md rounded-full text-xs sm:text-sm font-black border border-white/25">
                      On - Device
                    </span>
                    <span className="px-3.5 py-1 bg-white/10 text-white/80 rounded-full text-xs sm:text-sm font-medium">
                      Feature
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-3xl sm:text-4xl font-black text-white mb-3 font-headline tracking-tight">
                    SAMBHAV Translate
                  </h3>
                  <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                    Standalone translation for Indian Sign Language, speech, and text. Use the translator directly without entering a video call. Convert speech or text into Indian Sign Language, or convert Indian Sign Language into speech or text.
                  </p>
                </div>

                {/* Image & Action Button */}
                <div className="relative z-10 mt-auto">
                  <div className="rounded-2xl overflow-hidden border border-white/20 shadow-lg mb-5 bg-black/50">
                    <img
                      src="/images/products-translate.jpg"
                      alt="SAMBHAV Translate Interface"
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/translate')}
                    className="w-full py-3.5 px-6 rounded-xl bg-white text-[#2d0e14] hover:bg-[#fe9832] hover:text-[#542900] font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98"
                  >
                    <span>Try SAMBHAV Translate</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Card 2: SAMBHAV Connect */}
              <div className="group rounded-[28px] sm:rounded-[36px] bg-[#0c1424] dark:bg-[#070d18] text-white p-6 sm:p-8 flex flex-col justify-between border border-[#1e2e4a] shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
                <div className="relative z-10">
                  {/* Tags */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-4 py-1 bg-cyan-500/25 text-cyan-300 backdrop-blur-md rounded-full text-xs sm:text-sm font-black border border-cyan-400/30">
                      Remote
                    </span>
                    <span className="px-3.5 py-1 bg-white/10 text-white/80 rounded-full text-xs sm:text-sm font-medium">
                      Feature
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-3xl sm:text-4xl font-black text-white mb-3 font-headline tracking-tight">
                    SAMBHAV Connect
                  </h3>
                  <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                    Real-time communication through an accessible video call. Join a WebRTC conversation where two participants can communicate bidirectionally using Indian Sign Language, speech, and text with translation assistance.
                  </p>
                </div>

                {/* Image & Action Button */}
                <div className="relative z-10 mt-auto">
                  <div className="rounded-2xl overflow-hidden border border-white/20 shadow-lg mb-5 bg-black/50">
                    <img
                      src="/images/products-connect.jpg"
                      alt="SAMBHAV Connect WebRTC Video Call Interface"
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/communicate')}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98"
                  >
                    <span>Launch SAMBHAV Connect</span>
                    <span className="material-symbols-outlined text-[20px]">videocam</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 3. ABOUT ISL: UNDERSTANDING THE POWER OF ISL                             */}
        {/* ------------------------------------------------------------------------- */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="bg-white dark:bg-[#0d121d] rounded-[28px] sm:rounded-[36px] border border-[#e2e8f0] dark:border-[#2d3133] shadow-sm p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-14 transition-colors">
              
              {/* Text Content */}
              <div className="lg:w-1/2 flex flex-col items-start text-left">
                <div className="inline-flex items-center space-x-2 bg-indigo-50 dark:bg-[#fe9832]/10 border border-indigo-200 dark:border-[#fe9832]/30 text-indigo-700 dark:text-[#fe9832] px-4 py-1.5 rounded-full text-sm font-bold mb-4 shadow-xs">
                  <span className="material-symbols-outlined text-base">visibility</span>
                  <span>{t('about.tag', 'Visual Linguistic Expression')}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#0f172a] dark:text-white mb-4 leading-tight font-headline">
                  {t('about.title', 'Understanding the Power of ISL')}
                </h2>
                <ul className="space-y-4 text-base sm:text-lg text-[#475569] dark:text-[#94a3b8] font-body-lg">
                  <li className="flex items-start">
                    <span className="material-symbols-outlined text-indigo-600 dark:text-[#fe9832] mr-3 mt-1 text-xl">check_circle</span>
                    <span>{t('about.point1', 'ISL is a complete language with its own grammatical structure and spatial syntax.')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-symbols-outlined text-indigo-600 dark:text-[#fe9832] mr-3 mt-1 text-xl">check_circle</span>
                    <span>{t('about.point2', 'Sign language provides depth, emotion, and nuance that plain text captions cannot convey alone.')}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-symbols-outlined text-indigo-600 dark:text-[#fe9832] mr-3 mt-1 text-xl">check_circle</span>
                    <span>{t('about.point3', 'True accessibility means full linguistic inclusion in workplaces, schools, and hospitals.')}</span>
                  </li>
                </ul>
              </div>

              {/* Interactive Hub Grid */}
              <div className="lg:w-1/2 w-full grid grid-cols-2 gap-4 sm:gap-5 items-center">
                {/* Column 1 */}
                <div className="space-y-4 sm:space-y-5 transform translate-y-3 sm:translate-y-4">
                  <div className="group relative bg-[#f8fafc] dark:bg-[#1a202c] p-2.5 sm:p-3 rounded-2xl border border-[#e2e8f0] dark:border-[#2d3133] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 shadow-xs hover:shadow-sm transition-all duration-200">
                    <img alt={t('about.sign.school', 'ISL Sign for School')} className="w-full h-auto rounded-xl object-cover" src="/images/landing/sign-school.jpg" />
                  </div>
                  <div className="group relative bg-[#f8fafc] dark:bg-[#1a202c] p-2.5 sm:p-3 rounded-2xl border border-[#e2e8f0] dark:border-[#2d3133] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 shadow-xs hover:shadow-sm transition-all duration-200">
                    <img alt={t('about.sign.rain', 'ISL Sign for Rain')} className="w-full h-auto rounded-xl object-cover" src="/images/landing/sign-rain.jpg" />
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4 sm:space-y-5 transform -translate-y-3 sm:-translate-y-4">
                  <div className="group relative bg-[#f8fafc] dark:bg-[#1a202c] p-2.5 sm:p-3 rounded-2xl border border-[#e2e8f0] dark:border-[#2d3133] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 shadow-xs hover:shadow-sm transition-all duration-200">
                    <img alt={t('about.sign.yes', 'ISL Sign for Yes')} className="w-full h-auto rounded-xl object-cover" src="/images/landing/sign-yes.jpg" />
                  </div>
                  <div className="group relative bg-[#f8fafc] dark:bg-[#1a202c] p-2.5 sm:p-3 rounded-2xl border border-[#e2e8f0] dark:border-[#2d3133] hover:border-indigo-400 dark:hover:border-[#fe9832]/60 shadow-xs hover:shadow-sm transition-all duration-200">
                    <img alt={t('about.sign.hello', 'ISL Sign for Hello')} className="w-full h-auto rounded-xl object-cover" src="/images/landing/sign-hello.jpg" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 4. SOLUTION: MISSION STATEMENT                                           */}
        {/* ------------------------------------------------------------------------- */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div className="w-12 h-1.5 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 dark:bg-[#fe9832] mx-auto mb-6 rounded-full"></div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0f172a] dark:text-white mb-4 max-w-3xl mx-auto leading-tight tracking-tight font-headline">
              {t('mission.title', 'We are on a mission to make communication universal, regardless of ability.')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-[#475569] dark:text-[#94a3b8] max-w-2xl mx-auto leading-relaxed font-body-lg">
              {t('mission.desc', "SAMBHAV is not just an app; it's a movement. By leveraging advanced computer vision and natural language processing, we are building a seamless bridge between Indian Sign Language and spoken languages.")}
            </p>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 5. HOW IT WORKS                                                          */}
        {/* ------------------------------------------------------------------------- */}
        <section id="how-it-works-section" className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-10">
              <span className="px-4 py-1.5 bg-indigo-50 dark:bg-[#fe9832]/10 border border-indigo-200 dark:border-[#fe9832]/30 text-indigo-700 dark:text-[#fe9832] text-sm font-bold rounded-full mb-3 inline-block">
                {t('how.tag', 'System Architecture')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0f172a] dark:text-white font-headline tracking-tight">
                {t('how.title', 'How it Works')}
              </h2>
            </div>
            <div className="rounded-2xl sm:rounded-3xl shadow-sm border border-[#e2e8f0] dark:border-[#2d3133] bg-white dark:bg-[#0d121d] p-3 sm:p-4 flow-arrow max-w-4xl mx-auto transition-colors">
              <img
                alt={t('how.alt', 'SAMBHAV: The Bidirectional Bridge - How it Works')}
                className="w-full h-auto object-cover rounded-xl sm:rounded-2xl relative z-10"
                src="/assets/how_it_works_diagram.jpg"
              />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 6. FEATURES: WHY CHOOSE US                                               */}
        {/* ------------------------------------------------------------------------- */}
        <section id="features-section" className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-[#0f172a] dark:text-white mb-2 font-headline tracking-tight">
                {t('why.title', 'Why Choose')}{' '}
                <span className="text-indigo-600 dark:text-[#fe9832]">
                  SAMBHAV?
                </span>
              </h2>
              <p className="text-base sm:text-lg text-[#475569] dark:text-[#94a3b8] max-w-2xl mx-auto">
                {t('why.subtitle', 'Next-generation accessibility features designed for seamless and instant interaction.')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              
              {/* Feature 1 */}
              <div className="bg-white dark:bg-[#0d121d] p-5 sm:p-6 rounded-2xl border border-[#e2e8f0] dark:border-[#2d3133] hover:border-indigo-400 dark:hover:border-[#fe9832] shadow-xs flex flex-col h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 text-left">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-[#fe9832]/15 border border-indigo-200/80 dark:border-[#fe9832]/30 flex items-center justify-center mb-3.5">
                  <span className="material-symbols-outlined text-indigo-600 dark:text-[#fe9832] text-2xl">translate</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#0f172a] dark:text-white mb-2 font-headline">{t('why.card1.title', 'Real-time Translation')}</h3>
                <p className="text-[#64748b] dark:text-[#94a3b8] text-sm sm:text-base leading-relaxed">{t('why.card1.desc', 'Instant ISL-to-text conversion with minimal latency.')}</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-[#0d121d] p-5 sm:p-6 rounded-2xl border border-[#e2e8f0] dark:border-[#2d3133] hover:border-emerald-400 dark:hover:border-[#059669] shadow-xs flex flex-col h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 text-left">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200/80 dark:border-emerald-500/30 flex items-center justify-center mb-3.5">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-2xl">verified</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#0f172a] dark:text-white mb-2 font-headline">{t('why.card2.title', 'High Precision')}</h3>
                <p className="text-[#64748b] dark:text-[#94a3b8] text-sm sm:text-base leading-relaxed">{t('why.card2.desc', 'Accurate gesture recognition for clear communication.')}</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-[#0d121d] p-5 sm:p-6 rounded-2xl border border-[#e2e8f0] dark:border-[#2d3133] hover:border-amber-400 dark:hover:border-[#fe9832] shadow-xs flex flex-col h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 text-left">
                <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-[#fe9832]/15 border border-amber-200/80 dark:border-[#fe9832]/30 flex items-center justify-center mb-3.5">
                  <span className="material-symbols-outlined text-amber-600 dark:text-[#fe9832] text-2xl">bolt</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#0f172a] dark:text-white mb-2 font-headline">{t('why.card3.title', 'Fast Processing')}</h3>
                <p className="text-[#64748b] dark:text-[#94a3b8] text-sm sm:text-base leading-relaxed">{t('why.card3.desc', 'Lightning-fast response times for smooth interaction.')}</p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white dark:bg-[#0d121d] p-5 sm:p-6 rounded-2xl border border-[#e2e8f0] dark:border-[#2d3133] hover:border-rose-400 dark:hover:border-amber-500 shadow-xs flex flex-col h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 text-left">
                <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-amber-500/15 border border-rose-200/80 dark:border-amber-500/30 flex items-center justify-center mb-3.5">
                  <span className="material-symbols-outlined text-rose-600 dark:text-amber-400 text-2xl">sentiment_satisfied</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#0f172a] dark:text-white mb-2 font-headline">{t('why.card4.title', 'User-Friendly')}</h3>
                <p className="text-[#64748b] dark:text-[#94a3b8] text-sm sm:text-base leading-relaxed">{t('why.card4.desc', 'Simple interface designed for everyone to use.')}</p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white dark:bg-[#0d121d] p-5 sm:p-6 rounded-2xl border border-[#e2e8f0] dark:border-[#2d3133] hover:border-sky-400 dark:hover:border-[#fe9832] shadow-xs flex flex-col h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 text-left">
                <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-[#fe9832]/15 border border-sky-200/80 dark:border-[#fe9832]/30 flex items-center justify-center mb-3.5">
                  <span className="material-symbols-outlined text-sky-600 dark:text-[#fe9832] text-2xl">auto_awesome</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#0f172a] dark:text-white mb-2 font-headline">{t('why.card5.title', 'AI Intelligence')}</h3>
                <p className="text-[#64748b] dark:text-[#94a3b8] text-sm sm:text-base leading-relaxed">{t('why.card5.desc', 'Advanced learning models for superior sign recognition.')}</p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white dark:bg-[#0d121d] p-5 sm:p-6 rounded-2xl border border-[#e2e8f0] dark:border-[#2d3133] hover:border-teal-400 dark:hover:border-teal-500 shadow-xs flex flex-col h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 text-left">
                <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-500/15 border border-teal-200/80 dark:border-teal-500/30 flex items-center justify-center mb-3.5">
                  <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-2xl">menu_book</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#0f172a] dark:text-white mb-2 font-headline">{t('why.card6.title', 'Educational Tools')}</h3>
                <p className="text-[#64748b] dark:text-[#94a3b8] text-sm sm:text-base leading-relaxed">{t('why.card6.desc', 'Easy lessons to help you learn and master ISL.')}</p>
              </div>

              {/* Feature 7 */}
              <div className="bg-white dark:bg-[#0d121d] p-5 sm:p-6 rounded-2xl border border-[#e2e8f0] dark:border-[#2d3133] hover:border-blue-400 dark:hover:border-blue-500 shadow-xs flex flex-col h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 text-left">
                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/15 border border-blue-200/80 dark:border-blue-500/30 flex items-center justify-center mb-3.5">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">verified_user</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#0f172a] dark:text-white mb-2 font-headline">{t('why.card7.title', 'Secure Platform')}</h3>
                <p className="text-[#64748b] dark:text-[#94a3b8] text-sm sm:text-base leading-relaxed">{t('why.card7.desc', 'Your data and privacy are always protected.')}</p>
              </div>

              {/* Feature 8 */}
              <div className="bg-white dark:bg-[#0d121d] p-5 sm:p-6 rounded-2xl border border-[#e2e8f0] dark:border-[#2d3133] hover:border-purple-400 dark:hover:border-purple-500 shadow-xs flex flex-col h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 text-left">
                <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-500/15 border border-purple-200/80 dark:border-purple-500/30 flex items-center justify-center mb-3.5">
                  <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl">diversity_3</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#0f172a] dark:text-white mb-2 font-headline">{t('why.card8.title', 'Community Focused')}</h3>
                <p className="text-[#64748b] dark:text-[#94a3b8] text-sm sm:text-base leading-relaxed">{t('why.card8.desc', 'Built to connect deaf and hearing people everywhere.')}</p>
              </div>

            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 7. WHERE WE CAN MAKE A DIFFERENCE (SAMBHAV USE CASES)                     */}
        {/* ------------------------------------------------------------------------- */}
        <section id="difference" className="py-12 sm:py-16 lg:py-20 bg-slate-50/50 dark:bg-[#070c18] border-y border-[#e2e8f0] dark:border-[#1e293b]/60 transition-colors">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            
            {/* Header */}
            <div className="text-center sm:text-left mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/40 rounded-full text-indigo-600 dark:text-indigo-400 text-sm font-bold tracking-wide mb-2.5">
                <span className="material-symbols-outlined text-base">public</span>
                <span>{t('diff.tag', 'Real-World Impact')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0f172a] dark:text-white font-headline tracking-tight">
                {t('diff.title', 'Where We Can Make a')}{' '}
                <span className="bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:text-[#fe9832]">
                  {t('diff.highlight', 'Difference')}
                </span>
              </h2>
              <p className="text-base sm:text-lg text-[#475569] dark:text-[#94a3b8] mt-2 max-w-2xl leading-relaxed">
                {t('diff.desc', 'Connecting People Beyond Words across retail, transit, banking, healthcare, workplace, and daily communication.')}
              </p>
            </div>

            {/* Carousel Area with Left & Right Corner Controls */}
            <div 
              className="relative px-3 sm:px-6"
              onMouseEnter={() => setIsUseCaseAutoPlaying(false)}
              onMouseLeave={() => setIsUseCaseAutoPlaying(true)}
            >
              {/* Left Side Corner Navigation Arrow */}
              <button
                onClick={handlePrevUseCase}
                className="absolute -left-2 sm:-left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/95 dark:bg-[#0d1322]/95 backdrop-blur-md hover:bg-indigo-50 dark:hover:bg-indigo-950 border-2 border-slate-200 dark:border-slate-700/80 hover:border-indigo-500 dark:hover:border-indigo-500 text-slate-800 dark:text-white transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer group"
                title={t('diff.prev', 'Previous Slide')}
                aria-label={t('diff.prev', 'Previous Slide')}
              >
                <span className="material-symbols-outlined text-2xl sm:text-3xl font-bold group-hover:-translate-x-0.5 transition-transform">chevron_left</span>
              </button>

              {/* Right Side Corner Navigation Arrow */}
              <button
                onClick={handleNextUseCase}
                className="absolute -right-2 sm:-right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/95 dark:bg-[#0d1322]/95 backdrop-blur-md hover:bg-indigo-50 dark:hover:bg-indigo-950 border-2 border-slate-200 dark:border-slate-700/80 hover:border-indigo-500 dark:hover:border-indigo-500 text-slate-800 dark:text-white transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer group"
                title={t('diff.next', 'Next Slide')}
                aria-label={t('diff.next', 'Next Slide')}
              >
                <span className="material-symbols-outlined text-2xl sm:text-3xl font-bold group-hover:translate-x-0.5 transition-transform">chevron_right</span>
              </button>

              {/* Track Container */}
              <div className="overflow-hidden py-3">
                <div
                  className="flex gap-5 sm:gap-6"
                  style={{
                    transform: `translateX(-${useCaseIndex * (100 / itemsPerSlide)}%)`,
                    transition: isUseCaseTransitioning ? 'transform 600ms cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
                  }}
                  onTransitionEnd={handleUseCaseTransitionEnd}
                >
                  {EXTENDED_USE_CASES.map((uc, idx) => (
                    <div
                      key={`${uc.id}-${idx}`}
                      className="flex-shrink-0"
                      style={{
                        width: `calc(${100 / itemsPerSlide}% - ${(itemsPerSlide - 1) * 24 / itemsPerSlide}px)`
                      }}
                    >
                      <div className="h-full flex flex-col rounded-3xl bg-white dark:bg-[#0b1329] border border-[#e2e8f0] dark:border-slate-800/90 overflow-hidden shadow-md hover:shadow-xl dark:shadow-2xl dark:hover:border-indigo-500/50 transition-all duration-300 group">
                        {/* Image Container */}
                        <div className="relative w-full aspect-[4/3] bg-slate-950 overflow-hidden">
                          <img
                            src={uc.image}
                            alt={t(`usecases.${uc.id}.title`, uc.title)}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = uc.fallback;
                            }}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1329] via-transparent to-transparent opacity-60 pointer-events-none" />
                          
                          {/* Tag badge */}
                          <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-xs font-bold text-white shadow-xs">
                            <span className="material-symbols-outlined text-sm text-indigo-400">{uc.icon}</span>
                            <span>{t(`usecases.${uc.id}.tag`, uc.tag)}</span>
                          </div>
                        </div>

                        {/* Text Content matching SAMBHAV copy */}
                        <div className="p-6 sm:p-7 flex flex-col flex-grow justify-between text-left">
                          <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-[#0f172a] dark:text-white mb-2.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-headline transition-colors">
                              {t(`usecases.${uc.id}.title`, uc.title)}
                            </h3>
                            <p className="text-sm sm:text-base text-[#475569] dark:text-slate-300 font-normal leading-relaxed">
                              {t(`usecases.${uc.id}.desc`, uc.description)}
                            </p>
                          </div>

                          <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs sm:text-sm">
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                              <span className="material-symbols-outlined text-base">verified</span>
                              <span>{t('diff.badge', 'ISL Integrated')}</span>
                            </span>
                            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">SAMBHAV AI</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dot Pagination */}
              <div className="flex justify-center items-center gap-2 mt-6">
                {SAMBHAV_USE_CASES.map((_, idx) => {
                  const isActive = (((useCaseIndex % SAMBHAV_USE_CASES.length) + SAMBHAV_USE_CASES.length) % SAMBHAV_USE_CASES.length) === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setUseCaseIndex(SAMBHAV_USE_CASES.length + idx)}
                      className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'w-8 bg-indigo-600 dark:bg-indigo-500 shadow-xs'
                          : 'w-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  );
                })}
              </div>
            </div>

          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 8. TESTIMONIALS                                                           */}
        {/* ------------------------------------------------------------------------- */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0f172a] dark:text-white mb-2.5 font-headline tracking-tight">
                {t('testimonials.tag', 'Beta Tester Feedback')}
              </h2>
              <p className="text-base sm:text-lg text-[#475569] dark:text-[#94a3b8] font-body-lg">
                {t('testimonials.desc', 'What our community is saying about the prototype.')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              
              {/* Card 1: Anubhav Mohanty */}
              <div className="bg-white dark:bg-[#0d121d] rounded-2xl shadow-xs overflow-hidden flex flex-col h-full border border-[#e2e8f0] dark:border-[#2d3133] hover:border-indigo-400 dark:hover:border-[#fe9832]/50 transition-colors">
                <div className="p-6 sm:p-7 pb-14 sm:pb-16 flex-grow relative flex items-center justify-center text-center">
                  <p className="text-[#334155] dark:text-[#cbd5e1] text-base sm:text-lg italic leading-relaxed font-body-md">
                    {t('testimonials.t1.quote', '“We were impressed by the quality of service and attention to detail. Sambhav understood our requirements quickly and exceeded our expectations.”')}
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <img
                      alt="Anubhav Mohanty"
                      className="w-16 h-16 rounded-full border-3 border-white dark:border-[#0d121d] object-cover shadow-sm"
                      src="/images/landing/product-feature-1.jpg"
                    />
                  </div>
                  <div className="bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 dark:bg-none dark:bg-[#fe9832] pt-10 pb-5 text-center text-white dark:text-[#3d1e00] relative">
                    <svg className="absolute top-0 left-0 w-full -translate-y-[99%]" preserveAspectRatio="none" viewBox="0 0 1440 320">
                      <path d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="#4f46e5" className="dark:fill-[#fe9832]"></path>
                    </svg>
                    <h4 className="font-bold text-base sm:text-lg mb-0.5 font-headline">{t('testimonials.t1.name', 'Anubhav Mohanty')}</h4>
                    <p className="text-xs sm:text-sm opacity-90 uppercase tracking-wide font-semibold">{t('testimonials.t1.role', 'Business Owner')}</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Prachi Mohapatra */}
              <div className="bg-white dark:bg-[#0d121d] rounded-2xl shadow-xs overflow-hidden flex flex-col h-full border border-[#e2e8f0] dark:border-[#2d3133] hover:border-emerald-400 dark:hover:border-[#fe9832]/50 transition-colors">
                <div className="p-6 sm:p-7 pb-14 sm:pb-16 flex-grow relative flex items-center justify-center text-center">
                  <p className="text-[#334155] dark:text-[#cbd5e1] text-base sm:text-lg italic leading-relaxed font-body-md">
                    {t('testimonials.t2.quote', '“Sambhav helped us save time and achieve better results. Their team is reliable, knowledgeable, and easy to work with.”')}
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <img
                      alt="Prachi Mohapatra"
                      className="w-16 h-16 rounded-full border-3 border-white dark:border-[#0d121d] object-cover shadow-sm"
                      src="/images/landing/product-feature-2.jpg"
                    />
                  </div>
                  <div className="bg-emerald-600 dark:bg-[#059669] pt-10 pb-5 text-center text-white relative">
                    <svg className="absolute top-0 left-0 w-full -translate-y-[99%]" preserveAspectRatio="none" viewBox="0 0 1440 320">
                      <path d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="#059669"></path>
                    </svg>
                    <h4 className="font-bold text-base sm:text-lg mb-0.5 font-headline">{t('testimonials.t2.name', 'Prachi Mohapatra')}</h4>
                    <p className="text-xs sm:text-sm text-white/90 uppercase tracking-wide font-semibold">{t('testimonials.t2.role', 'Happy Customer')}</p>
                  </div>
                </div>
              </div>

              {/* Card 3: Subrat Joshi */}
              <div className="bg-white dark:bg-[#0d121d] rounded-2xl shadow-xs overflow-hidden flex flex-col h-full border border-[#e2e8f0] dark:border-[#2d3133] hover:border-purple-400 dark:hover:border-[#fe9832]/50 transition-colors">
                <div className="p-6 sm:p-7 pb-14 sm:pb-16 flex-grow relative flex items-center justify-center text-center">
                  <p className="text-[#334155] dark:text-[#cbd5e1] text-base sm:text-lg italic leading-relaxed font-body-md">
                    {t('testimonials.t3.quote', '“The service was excellent, the communication was clear, and the results were exactly what we hoped for. Highly recommended!”')}
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <img
                      alt="Subrat Joshi"
                      className="w-16 h-16 rounded-full border-3 border-white dark:border-[#0d121d] object-cover shadow-sm"
                      src="/images/landing/product-feature-3.jpg"
                    />
                  </div>
                  <div className="bg-[#1e293b] dark:bg-[#1a202c] pt-10 pb-5 text-center text-white relative">
                    <svg className="absolute top-0 left-0 w-full -translate-y-[99%]" preserveAspectRatio="none" viewBox="0 0 1440 320">
                      <path d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="#1e293b"></path>
                    </svg>
                    <h4 className="font-bold text-base sm:text-lg mb-0.5 font-headline">{t('testimonials.t3.name', 'Subrat Joshi')}</h4>
                    <p className="text-xs sm:text-sm text-white/90 uppercase tracking-wide font-semibold">{t('testimonials.t3.role', 'Operations Head')}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 9. MEET OUR TEAM                                                          */}
        {/* ------------------------------------------------------------------------- */}
        <section className="py-12 sm:py-16 lg:py-20 border-t border-[#e2e8f0] dark:border-[#2d3133]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <span className="px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-[#fe9832]/20 dark:text-[#fe9832] dark:border-[#fe9832]/30 mb-3 inline-block">
                {t('team.badge', 'Team HacKNomads')}
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0f172a] dark:text-white mb-4 font-headline tracking-tight">
                {t('team.title', 'Meet Our Team')}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-[#475569] dark:text-[#94a3b8] max-w-2xl mx-auto font-body-lg">
                {t('team.desc', 'We are Team HacKNomads — a dedicated team building AI accessibility solutions for Indian Sign Language communication.')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Member 1: Subham Nayak */}
              <div className="bg-white dark:bg-[#0d121d] rounded-2xl p-6 sm:p-7 border border-[#e2e8f0] dark:border-[#2d3133] shadow-xs hover:border-indigo-400 dark:hover:border-[#fe9832]/50 transition-all flex flex-col items-center text-center group">
                <img
                  alt="Subham Nayak"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-indigo-100 dark:border-[#fe9832]/20 group-hover:scale-105 transition-transform mb-4 shadow-md"
                  src="/images/landing/team-1.jpg"
                />
                <h3 className="text-xl font-bold text-[#0f172a] dark:text-white font-headline mb-1.5">Subham Nayak</h3>
                <p className="text-[#334155] dark:text-[#cbd5e1] text-sm sm:text-base italic leading-relaxed">
                  {t('team.subham.quote', '“SAMBHAV Began With a Simple Thought: Communication Should Never Be Limited By The Way We Speak.”')}
                </p>
              </div>

              {/* Member 2: Mohapatra S.H Gargi */}
              <div className="bg-white dark:bg-[#0d121d] rounded-2xl p-6 sm:p-7 border border-[#e2e8f0] dark:border-[#2d3133] shadow-xs hover:border-sky-400 dark:hover:border-[#fe9832]/50 transition-all flex flex-col items-center text-center group">
                <img
                  alt="Mohapatra S.H Gargi"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-sky-100 dark:border-[#fe9832]/20 group-hover:scale-105 transition-transform mb-4 shadow-md"
                  src="/images/landing/team-6.jpg"
                />
                <h3 className="text-xl font-bold text-[#0f172a] dark:text-white font-headline mb-1.5">Mohapatra S.H Gargi</h3>
                <p className="text-[#334155] dark:text-[#cbd5e1] text-sm sm:text-base italic leading-relaxed">
                  {t('team.gargi.quote', '“For us, Indian Sign Language is not just a collection of gestures; it is a language, an identity, and a way of expressing emotions.”')}
                </p>
              </div>

              {/* Member 3: B Vineet Patro */}
              <div className="bg-white dark:bg-[#0d121d] rounded-2xl p-6 sm:p-7 border border-[#e2e8f0] dark:border-[#2d3133] shadow-xs hover:border-emerald-400 dark:hover:border-[#fe9832]/50 transition-all flex flex-col items-center text-center group">
                <img
                  alt="B Vineet Patro"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-emerald-100 dark:border-[#fe9832]/20 group-hover:scale-105 transition-transform mb-4 shadow-md"
                  src="/images/landing/team-3.jpg"
                />
                <h3 className="text-xl font-bold text-[#0f172a] dark:text-white font-headline mb-1.5">B Vineet Patro</h3>
                <p className="text-[#334155] dark:text-[#cbd5e1] text-sm sm:text-base italic leading-relaxed">
                  {t('team.vineet.quote', '“SAMBHAV uses technology to understand these signs and create a bridge between people who communicate differently.”')}
                </p>
              </div>

              {/* Member 4: Sidharth Kumar */}
              <div className="bg-white dark:bg-[#0d121d] rounded-2xl p-6 sm:p-7 border border-[#e2e8f0] dark:border-[#2d3133] shadow-xs hover:border-purple-400 dark:hover:border-[#fe9832]/50 transition-all flex flex-col items-center text-center group">
                <img
                  alt="Sidharth Kumar"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-purple-100 dark:border-[#fe9832]/20 group-hover:scale-105 transition-transform mb-4 shadow-md"
                  src="/images/landing/team-4.jpg"
                />
                <h3 className="text-xl font-bold text-[#0f172a] dark:text-white font-headline mb-1.5">Sidharth Kumar</h3>
                <p className="text-[#334155] dark:text-[#cbd5e1] text-sm sm:text-base italic leading-relaxed">
                  {t('team.sidharth.quote', '“From sign recognition to real-time communication and an expressive digital avatar, every part of SAMBHAV is built around accessibility.”')}
                </p>
              </div>

              {/* Member 5: Shreya Kashyap */}
              <div className="bg-white dark:bg-[#0d121d] rounded-2xl p-6 sm:p-7 border border-[#e2e8f0] dark:border-[#2d3133] shadow-xs hover:border-rose-400 dark:hover:border-[#fe9832]/50 transition-all flex flex-col items-center text-center group">
                <img
                  alt="Shreya Kashyap"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-rose-100 dark:border-[#fe9832]/20 group-hover:scale-105 transition-transform mb-4 shadow-md"
                  src="/images/landing/team-5.jpg"
                />
                <h3 className="text-xl font-bold text-[#0f172a] dark:text-white font-headline mb-1.5">Shreya Kashyap</h3>
                <p className="text-[#334155] dark:text-[#cbd5e1] text-sm sm:text-base italic leading-relaxed">
                  {t('team.shreya.quote', '“We believe technology should not make people adapt to it. Technology should adapt to people.”')}
                </p>
              </div>

              {/* Member 6: Avishek Raul */}
              <div className="bg-white dark:bg-[#0d121d] rounded-2xl p-6 sm:p-7 border border-[#e2e8f0] dark:border-[#2d3133] shadow-xs hover:border-amber-400 dark:hover:border-[#fe9832]/50 transition-all flex flex-col items-center text-center group">
                <img
                  alt="Avishek Raul"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-amber-100 dark:border-[#fe9832]/20 group-hover:scale-105 transition-transform mb-4 shadow-md"
                  src="/images/landing/team-2.jpg"
                />
                <h3 className="text-xl font-bold text-[#0f172a] dark:text-white font-headline mb-1.5">Avishek Raul</h3>
                <p className="text-[#334155] dark:text-[#cbd5e1] text-sm sm:text-base italic leading-relaxed">
                  {t('team.avishek.quote', '“And that is what SAMBHAV stands for — making inclusive communication not just an idea, but something possible.”')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 9. VISUAL SHOWCASE & COMMUNITY GALLERY                                    */}
        {/* ------------------------------------------------------------------------- */}
        <GallerySection />

        {/* ------------------------------------------------------------------------- */}
        {/* 10. FREQUENTLY ASKED QUESTIONS                                             */}
        {/* ------------------------------------------------------------------------- */}
        <section id="faq-section" className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-[#0d121d] border-t border-[#e2e8f0] dark:border-[#2d3133] transition-colors">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            {/* Header */}
            <div className="text-center mb-10 sm:mb-12">
              <span className="px-4 py-1.5 bg-indigo-50 dark:bg-[#fe9832]/10 border border-indigo-200 dark:border-[#fe9832]/30 text-indigo-700 dark:text-[#fe9832] text-sm font-bold rounded-full mb-3 inline-block">
                {t('faq.tag', 'Help & Support')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0f172a] dark:text-white mb-2.5 font-headline tracking-tight">
                {t('faq.title', 'Frequently Asked')}{' '}
                <span className="bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:text-[#fe9832]">
                  {t('faq.title.highlight', 'Questions')}
                </span>
              </h2>
              <p className="text-base sm:text-lg text-[#475569] dark:text-[#94a3b8] max-w-xl mx-auto">
                {t('faq.subtitle', 'Everything you need to know about SAMBHAV and how it works.')}
              </p>
            </div>

            {/* Accordion */}
            <div className="flex flex-col gap-3">
              {[
                {
                  q: t('faq.q1', 'Is there an AI tool that translates Indian Sign Language into English?'),
                  a: t('faq.a1', 'Yes. SAMBHAV uses camera-based sign recognition to translate Indian Sign Language into English text or speech.'),
                },
                {
                  q: t('faq.q2', 'How can I convert Indian Sign Language into text?'),
                  a: t('faq.a2', 'Open SAMBHAV Translate, allow camera access, and sign in front of the camera. The recognized signs are displayed as text.'),
                },
                {
                  q: t('faq.q3', 'Can speech or typing be converted into Indian Sign Language?'),
                  a: t('faq.a3', 'Yes. SAMBHAV converts spoken or typed English into Indian Sign Language through its 3D signing avatar.'),
                },
                {
                  q: t('faq.q4', 'Is there an Indian Sign Language translator for live conversations?'),
                  a: t('faq.a4', 'Yes. SAMBHAV Connect provides an online WebRTC video call with bidirectional translation support between Indian Sign Language, speech, and text.'),
                },
                {
                  q: t('faq.q5', 'How can a Deaf person communicate with someone who does not know sign language?'),
                  a: t('faq.a5', 'They can use SAMBHAV Translate for direct translation or SAMBHAV Connect for a live video conversation with translation assistance.'),
                },
                {
                  q: t('faq.q6', 'Can I use SAMBHAV to communicate with a Deaf person on a video call?'),
                  a: t('faq.a6', 'Yes. SAMBHAV Connect is designed for real-time video conversations between Deaf and hearing participants, with captions and translation support.'),
                },
                {
                  q: t('faq.q7', 'Does SAMBHAV support Indian Sign Language or American Sign Language?'),
                  a: t('faq.a7', 'SAMBHAV is designed specifically for Indian Sign Language (ISL). It is not an American Sign Language translator.'),
                },
                {
                  q: t('faq.q8', 'Does SAMBHAV require a video call?'),
                  a: t('faq.a8', 'No. SAMBHAV Translate works as a standalone translation tool. Video calling is a separate feature available through SAMBHAV Connect.'),
                },
              ].map((item, idx) => (
                <FAQItem key={idx} idx={idx} question={item.q} answer={item.a} />
              ))}
            </div>

            {/* CTA below FAQ */}
            <div className="mt-10 text-center">
              <p className="text-base text-[#64748b] dark:text-[#94a3b8] mb-4 font-medium">
                {t('faq.cta.text', 'Still have questions? We are happy to help.')}
              </p>
              <button
                type="button"
                onClick={() => scrollTo('contact-section')}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#3d1e00] rounded-xl text-base font-bold shadow-md shadow-indigo-500/25 dark:shadow-none hover:opacity-95 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">mail</span>
                <span>{t('faq.cta.btn', 'Contact Our Team')}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 11. SUPPORT & CONTACT US                                                  */}
        {/* ------------------------------------------------------------------------- */}
        <section id="contact-section" className="py-12 sm:py-16 lg:py-20 bg-slate-50/60 dark:bg-[#0d121d]/60 border-t border-[#e2e8f0] dark:border-[#2d3133] transition-colors">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0f172a] dark:text-white mb-3 font-headline tracking-tight">
                {t('contact.support.title', "We're here to help")}
              </h2>
              <p className="text-base sm:text-lg text-[#475569] dark:text-[#94a3b8] max-w-2xl mx-auto">
                {t('contact.support.desc', "Reach out to our team for support with Sambhav's accessibility ecosystem.")}
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              
              {/* Left Column: Contact Details */}
              <div className="bg-white dark:bg-[#0d121d] p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#e2e8f0] dark:border-[#2d3133] shadow-xs text-left transition-colors">
                <h3 className="text-xl sm:text-2xl font-bold text-[#0f172a] dark:text-white mb-6 font-headline">
                  {t('contact.details.title', 'Contact Details')}
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-11 h-11 rounded-full bg-indigo-50 dark:bg-[#fe9832]/15 flex items-center justify-center flex-shrink-0 border border-indigo-200/80 dark:border-[#fe9832]/30">
                      <span className="material-symbols-outlined text-indigo-600 dark:text-[#fe9832] text-2xl">mail</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-bold text-[#0f172a] dark:text-white">{t('contact.details.email', 'E-mail')}</p>
                      <a className="block text-sm sm:text-base text-[#475569] dark:text-[#cbd5e1] hover:text-indigo-600 dark:hover:text-[#fe9832] transition font-medium" href="mailto:nayak.subham2426@gmail.com">nayak.subham2426@gmail.com</a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-11 h-11 rounded-full bg-indigo-50 dark:bg-[#fe9832]/15 flex items-center justify-center flex-shrink-0 border border-indigo-200/80 dark:border-[#fe9832]/30">
                      <span className="material-symbols-outlined text-indigo-600 dark:text-[#fe9832] text-2xl">location_on</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-bold text-[#0f172a] dark:text-white">{t('contact.details.location', 'Location')}</p>
                      <p className="text-sm sm:text-base text-[#475569] dark:text-[#cbd5e1] leading-relaxed">{t('contact.details.address', "Institute of Technical Education & Research, Jagamara, Bhubaneswar - 751030")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Send a Message Form */}
              <div className="bg-white dark:bg-[#0d121d] p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#e2e8f0] dark:border-[#2d3133] shadow-xs text-left transition-colors">
                <h3 className="text-xl sm:text-2xl font-bold text-[#0f172a] dark:text-white mb-6 font-headline">
                  {t('contact.form.title', 'Send a Message')}
                </h3>
                {formSubmitted ? (
                  <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-center flex flex-col items-center gap-2 animate-fadeIn">
                    <span className="material-symbols-outlined text-4xl text-emerald-600 dark:text-emerald-400">check_circle</span>
                    <h4 className="font-bold text-lg font-headline">{t('contact.sent.title', 'Message Sent Successfully!')}</h4>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">{t('contact.sent.desc', 'Thank you for reaching out. Our accessibility team will contact you shortly.')}</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm sm:text-base font-semibold text-[#334155] dark:text-[#cbd5e1] mb-1.5">
                        {t('contact.form.name', 'Name')}
                      </label>
                      <input
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] dark:border-[#2d3133] focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:ring-[#fe9832]/30 dark:focus:border-[#fe9832] outline-none transition bg-[#f8fafc] dark:bg-[#1a202c] focus:bg-white text-sm sm:text-base text-[#0f172a] dark:text-white"
                        placeholder={t('contact.form.namePlaceholder', 'Your Name')}
                        type="text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-semibold text-[#334155] dark:text-[#cbd5e1] mb-1.5">
                        {t('contact.form.email', 'Email')}
                      </label>
                      <input
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] dark:border-[#2d3133] focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:ring-[#fe9832]/30 dark:focus:border-[#fe9832] outline-none transition bg-[#f8fafc] dark:bg-[#1a202c] focus:bg-white text-sm sm:text-base text-[#0f172a] dark:text-white"
                        placeholder={t('contact.form.emailPlaceholder', 'your@email.com')}
                        type="email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-semibold text-[#334155] dark:text-[#cbd5e1] mb-1.5">
                        {t('contact.form.message', 'Message')}
                      </label>
                      <textarea
                        required
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e2e8f0] dark:border-[#2d3133] focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:ring-[#fe9832]/30 dark:focus:border-[#fe9832] outline-none transition resize-none bg-[#f8fafc] dark:bg-[#1a202c] focus:bg-white text-sm sm:text-base text-[#0f172a] dark:text-white"
                        placeholder={t('contact.form.messagePlaceholder', 'How can we help you?')}
                        rows={3}
                      />
                    </div>
                    <button
                      className="w-full bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#3d1e00] font-bold py-3.5 rounded-xl hover:opacity-95 shadow-md shadow-indigo-500/25 dark:shadow-none transition-all cursor-pointer text-sm sm:text-base"
                      type="submit"
                    >
                      {t('contact.form.submit', 'Send Message')}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* ========================================================================= */}
      {/* 11. FOOTER                                                                */}
      {/* ========================================================================= */}
      <footer className="bg-[#f8fafc] dark:bg-[#0d121d] border-t border-[#e2e8f0] dark:border-[#2d3133] pt-12 sm:pt-14 pb-8 text-left transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10 mb-12">
            
            {/* Column 1: Brand & Contact Info */}
            <div className="sm:col-span-2 lg:col-span-2 space-y-4">
              <button
                type="button"
                onClick={() => {
                  if (user) {
                    navigate('/dashboard');
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="flex items-center space-x-2.5 cursor-pointer text-left group"
                title={user ? 'Go to Dashboard' : 'SAMBHAV Home'}
              >
                <img
                  alt="SAMBHAV Circular Logo Icon"
                  className="h-10 w-10 rounded-full object-contain border border-[#e2e8f0] dark:border-[#2d3133] group-hover:scale-105 transition-transform"
                  src="/logo.png"
                />
                <span className="text-2xl font-bold tracking-tight text-[#0f172a] dark:text-white font-headline">
                  SAM<span className="text-indigo-600 dark:text-[#fe9832] font-extrabold">BHAV</span>
                </span>
              </button>
              <p className="text-sm sm:text-base text-[#475569] dark:text-[#94a3b8] leading-relaxed max-w-sm">
                {t('footer.brand.desc', 'Empowering two-way accessible communication for classrooms, healthcare, and everyday life with AI-powered Indian Sign Language.')}
              </p>
              
              <div className="pt-2">
                <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">{t('footer.connect', 'Connect with us')}</p>
                <div className="flex items-center space-x-4">
                  <a className="flex items-center text-sm text-[#475569] dark:text-[#cbd5e1] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors" href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
                    LinkedIn
                  </a>
                  <a className="flex items-center text-sm text-[#475569] dark:text-[#cbd5e1] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors" href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                    <span className="material-symbols-outlined text-base mr-1">photo_camera</span>
                    Instagram
                  </a>
                </div>
              </div>

              <div className="pt-2 border-t border-[#e2e8f0] dark:border-[#2d3133]">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">{t('footer.location.title', 'LOCATION')}</p>
                <p className="text-sm text-[#475569] dark:text-[#94a3b8] leading-relaxed">{t('contact.details.address', 'Institute of Technical Education & Research, Jagamara, Bhubaneswar - 751030')}</p>
              </div>
            </div>

            {/* Column 2: Product Links */}
            <div>
              <p className="text-sm font-bold text-[#0f172a] dark:text-white uppercase tracking-wider mb-4 font-headline">{t('footer.col.product', 'Product')}</p>
              <ul className="space-y-3 text-sm sm:text-base">
                <li>
                  <button type="button" onClick={() => scrollTo('how-it-works-section')} className="text-[#475569] dark:text-[#94a3b8] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer text-left">
                    {t('footer.link.how', 'How it Works?')}
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/communicate')} className="text-[#475569] dark:text-[#94a3b8] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer text-left">
                    {t('footer.link.community', 'Community Hub')}
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollTo('testimonials-section')} className="text-[#475569] dark:text-[#94a3b8] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer text-left">
                    {t('footer.link.testimonials', 'Testimonials')}
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollTo('gallery-section')} className="text-[#475569] dark:text-[#94a3b8] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer text-left font-semibold flex items-center gap-1.5">
                    <span>{t('footer.link.gallery', 'Visual Showcase & Gallery')}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fe9832]" />
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/cultural')} className="text-[#475569] dark:text-[#94a3b8] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer text-left">
                    {t('footer.link.cultural', 'Cultural ISL')}
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Solutions */}
            <div>
              <p className="text-sm font-bold text-[#0f172a] dark:text-white uppercase tracking-wider mb-4 font-headline">{t('footer.col.solutions', 'Solutions')}</p>
              <ul className="space-y-3 text-sm sm:text-base">
                <li>
                  <button type="button" onClick={() => navigate('/learn')} className="text-[#475569] dark:text-[#94a3b8] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer text-left">
                    {t('footer.link.edu', 'Educational Learning')}
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollTo('use-cases-section')} className="text-[#475569] dark:text-[#94a3b8] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer text-left">
                    {t('footer.link.public', 'Public Services')}
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/communicate')} className="text-[#475569] dark:text-[#94a3b8] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer text-left">
                    {t('footer.link.health', 'Healthcare Calling')}
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/translate')} className="text-[#475569] dark:text-[#94a3b8] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer text-left">
                    {t('footer.link.translation', 'Enterprise Translation')}
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Resources */}
            <div>
              <p className="text-sm font-bold text-[#0f172a] dark:text-white uppercase tracking-wider mb-4 font-headline">{t('footer.col.resources', 'Resources')}</p>
              <ul className="space-y-3 text-sm sm:text-base">
                <li>
                  <button type="button" onClick={() => navigate('/communicate')} className="text-[#475569] dark:text-[#94a3b8] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer text-left">
                    {t('footer.link.digital', 'Digital Platform')}
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/learn')} className="text-[#475569] dark:text-[#94a3b8] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer text-left">
                    {t('footer.link.portal', 'ISL Learning Portal')}
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/news')} className="text-[#475569] dark:text-[#94a3b8] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer text-left">
                    {t('footer.link.news', 'Accessible News')}
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollTo('problem-section')} className="text-[#475569] dark:text-[#94a3b8] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer text-left">
                    {t('footer.link.mission', 'Our Mission')}
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollTo('contact-section')} className="text-[#475569] dark:text-[#94a3b8] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer text-left">
                    {t('footer.link.contact', 'Contact Us')}
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollTo('faq-section')} className="text-[#475569] dark:text-[#94a3b8] hover:text-indigo-600 dark:hover:text-[#fe9832] transition-colors cursor-pointer text-left">
                    {t('footer.link.faqs', 'FAQs & Help')}
                  </button>
                </li>
              </ul>
            </div>

          </div>

          {/* Large background watermark */}
          <div className="pt-6 border-t border-[#e2e8f0] dark:border-[#2d3133] text-center">
            <p className="text-sm sm:text-base text-gray-400">{t('footer.copyright', '© 2026 Sambhav Accessibility AI. All rights reserved.')}</p>
          </div>
          
          <div className="mt-8 select-none relative md:h-32 flex items-center justify-center h-20 opacity-80 dark:opacity-10 pointer-events-none transition-opacity">
            <span className="text-[56px] sm:text-[80px] font-black tracking-widest md:text-[150px] text-slate-800 dark:text-white font-headline" style={{ letterSpacing: '-0.04em' }}>
              SAM<span className="text-indigo-600 dark:text-[#fe9832]">BHAV</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Floating Chatbot Assistant on Landing Page */}
      <Chatbot />

      {/* UX4G Universal Accessibility Overlays & Modal */}
      <AccessibilityOverlays />
      <AccessibilityModal />

    </div>
  );
};

export default LandingPage;
