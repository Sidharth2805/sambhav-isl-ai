import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../hooks/useAccessibility';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useAccessibility();

  // Contact Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

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
      <header className="fixed top-0 w-full bg-[#f7fafc]/90 dark:bg-[#030813]/90 backdrop-blur-md z-50 border-b border-[#e0e3e5] dark:border-[#2d3133] left-0 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center space-x-2.5 text-left cursor-pointer group"
              >
                <img
                  alt="Sambhav Logo"
                  className="h-8 w-8 rounded-full object-cover shadow-xs border border-[#e0e3e5] dark:border-[#2d3133] group-hover:scale-105 transition-transform"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTg0HBcA_4tr0W91LDkwqOnVSfSNqNLfncEA1PPwyGzu5JLTBXpp_wsXkZjo9tzLvf4KFNyaXk060fIQSGUovqRqh34LlLcrxxAUa5VojHfDfu4jRQJGk6QxnzQbHigwRz16MDMj2DwoCRu_i77QAzKuRLVJ8e2mLUwC7-UvMJ_JB5sui2SpIRfZM5c9yAP4gD3yTYgJBzlXm_PtIyr70gHi3MkHGC95pbUZ_Mid5Kj_my4OpeXflK15WPybnDecsYaov545CM4kLxeQ"
                />
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#030813] dark:text-white font-headline">
                  SAM<span className="text-[#fe9832] font-extrabold">BHAV</span>
                </span>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-8 text-sm font-medium">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-[#475569] dark:text-[#cbd5e1] hover:text-[#fe9832] dark:hover:text-[#fe9832] transition-colors cursor-pointer"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => scrollTo('problem-section')}
                className="text-[#475569] dark:text-[#cbd5e1] hover:text-[#fe9832] dark:hover:text-[#fe9832] transition-colors cursor-pointer"
              >
                Problem
              </button>
              <button
                type="button"
                onClick={() => scrollTo('features-section')}
                className="text-[#475569] dark:text-[#cbd5e1] hover:text-[#fe9832] dark:hover:text-[#fe9832] transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => scrollTo('contact-section')}
                className="text-[#475569] dark:text-[#cbd5e1] hover:text-[#fe9832] dark:hover:text-[#fe9832] transition-colors cursor-pointer"
              >
                Contact Us
              </button>
            </nav>

            {/* Theme Toggle & CTA Buttons */}
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              
              {/* Dark / Light Mode Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-lg border border-[#e0e3e5] dark:border-[#2d3133] bg-white dark:bg-[#1a202c] text-[#181c1e] dark:text-[#fe9832] hover:border-[#fe9832] transition-all shadow-xs flex items-center justify-center cursor-pointer active:scale-95"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle Dark / Light Mode"
              >
                <span className="material-symbols-outlined text-[19px]">
                  {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
              </button>

              {user ? (
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="bg-[#fe9832] text-[#683700] dark:text-[#3d1e00] px-5 py-2 rounded-lg text-xs sm:text-sm font-bold hover:bg-[#e8872b] transition-colors shadow-sm pulse-btn cursor-pointer"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-[#475569] dark:text-[#cbd5e1] hover:text-[#fe9832] dark:hover:text-white text-xs sm:text-sm font-semibold px-2 py-1.5 cursor-pointer transition-colors"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="bg-[#fe9832] text-[#683700] dark:text-[#3d1e00] px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold hover:bg-[#e8872b] transition-colors shadow-sm pulse-btn cursor-pointer"
                  >
                    Sign Up
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
        {/* 1. HERO SECTION                                                           */}
        {/* ------------------------------------------------------------------------- */}
        <section className="relative pt-12 pb-14 sm:pt-16 sm:pb-20 lg:pt-24 lg:pb-24 hero-bg overflow-hidden">
          {/* Subtle Interior Matching Warm Saffron Glows */}
          <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-[#fe9832]/10 dark:bg-[#fe9832]/10 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute bottom-[-80px] left-[15%] w-[400px] h-[400px] bg-[#fe9832]/5 dark:bg-[#fe9832]/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-[35%] left-[-80px] w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[90px] pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
            
            {/* Top Status Badge */}
            <div className="inline-flex items-center space-x-2 bg-[#fe9832]/10 border border-[#fe9832]/30 text-[#8f4e00] dark:text-[#fe9832] px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold mb-5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#fe9832] animate-ping" />
              <span>Empowering Indian Sign Language Communication</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#030813] dark:text-white mb-5 leading-[1.15] sm:leading-[1.12] font-headline max-w-4xl">
              Bridging worlds with accessible AI.
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg md:text-xl text-[#475569] dark:text-[#94a3b8] mb-8 leading-relaxed font-body-lg max-w-3xl">
              India's leading AI-powered accessibility platform, enabling seamless bidirectional communication through Indian Sign Language (ISL), 3D Avatars, and live speech translation.
            </p>

            {/* Action CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/communicate')}
                className="w-full sm:w-auto bg-[#fe9832] text-[#683700] dark:text-[#3d1e00] px-8 sm:px-10 py-3.5 rounded-xl text-base font-bold hover:bg-[#e8872b] hover:-translate-y-0.5 transition-all duration-200 shadow-[0_4px_20px_rgba(254,152,50,0.35)] hover:shadow-[0_6px_28px_rgba(254,152,50,0.5)] text-center pulse-btn cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">videocam</span>
                <span>Try Sambhav Now</span>
              </button>
              <button
                type="button"
                onClick={() => scrollTo('how-it-works-section')}
                className="w-full sm:w-auto bg-white dark:bg-[#1a202c] text-[#181c1e] dark:text-[#f7fafc] border border-[#e0e3e5] dark:border-[#2d3133] hover:border-[#fe9832]/60 px-8 sm:px-10 py-3.5 rounded-xl text-base font-semibold hover:bg-[#f1f4f6] dark:hover:bg-[#2d3133] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2 shadow-xs hover:shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#fe9832] text-[20px]">info</span>
                <span>How it Works</span>
              </button>
            </div>

            {/* Bottom Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-10 pt-6 border-t border-[#e0e3e5] dark:border-[#2d3133] text-xs sm:text-sm font-semibold text-[#475569] dark:text-[#94a3b8]">
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#0d121d] rounded-full border border-[#e0e3e5] dark:border-[#2d3133] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#fe9832]" />
                Real-time 3D ISL Avatar
              </span>
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#0d121d] rounded-full border border-[#e0e3e5] dark:border-[#2d3133] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                Live Speech &amp; Subtitles
              </span>
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#0d121d] rounded-full border border-[#e0e3e5] dark:border-[#2d3133] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                End-to-End Encrypted WebRTC
              </span>
            </div>

          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 2. PROBLEM: COMMUNICATION CHALLENGES IN INDIA                             */}
        {/* ------------------------------------------------------------------------- */}
        <section id="problem-section" className="py-12 sm:py-16 lg:py-20 relative bg-white dark:bg-[#0d121d] rounded-[2rem] sm:rounded-[2.5rem] mx-3 sm:mx-6 lg:mx-8 border border-[#e0e3e5] dark:border-[#2d3133] shadow-sm my-8 sm:my-12 transition-colors">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-8 sm:mb-10">
              <span className="px-3 py-1 bg-[#fe9832]/10 border border-[#fe9832]/30 text-[#8f4e00] dark:text-[#fe9832] text-xs font-bold rounded-full mb-3 inline-block">
                The Accessibility Gap
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#030813] dark:text-white mb-2 sm:mb-3 font-headline">
                Communication Challenges in India
              </h2>
              <p className="text-sm sm:text-base text-[#475569] dark:text-[#94a3b8] max-w-2xl mx-auto font-body-lg leading-relaxed">
                The communication gap in India affects millions, with a critical shortage of resources leaving the Deaf and hard-of-hearing community with limited access to essential information and services.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8 items-center max-w-2xl mx-auto">
              
              {/* 63M+ Stat Gauge */}
              <div className="flex flex-col items-center text-center space-y-3 bg-[#f7fafc] dark:bg-[#1a202c]/50 p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-[#e0e3e5] dark:border-[#2d3133] shadow-xs">
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
                      stroke="#fe9832"
                      strokeDasharray="251.2"
                      strokeDashoffset="37.6991"
                      strokeLinecap="round"
                      strokeWidth="8"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[#030813] dark:text-white font-extrabold text-xl sm:text-2xl font-headline">63M+</span>
                  </div>
                </div>
                <h3 className="text-[#030813] dark:text-white font-bold text-sm sm:text-base font-headline">Significant Hearing Loss</h3>
                <p className="text-[#64748b] dark:text-[#94a3b8] text-xs leading-relaxed">Individuals facing daily communication barriers.</p>
                <span className="text-[10px] font-bold text-[#8f4e00] dark:text-[#fe9832] bg-[#fe9832]/10 border border-[#fe9832]/20 px-2.5 py-0.5 rounded-full">Source: WHO</span>
              </div>

              {/* <1% Stat Gauge */}
              <div className="flex flex-col items-center text-center space-y-3 bg-[#f7fafc] dark:bg-[#1a202c]/50 p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-[#e0e3e5] dark:border-[#2d3133] shadow-xs">
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
                    <span className="text-[#030813] dark:text-white font-extrabold text-xl sm:text-2xl font-headline">&lt;1%</span>
                  </div>
                </div>
                <h3 className="text-[#030813] dark:text-white font-bold text-sm sm:text-base font-headline">Access to ISL Education</h3>
                <p className="text-[#64748b] dark:text-[#94a3b8] text-xs leading-relaxed">Deaf individuals with access to formal ISL education.</p>
                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-2.5 py-0.5 rounded-full">Source: Census of India</span>
              </div>

            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 3. ABOUT ISL: UNDERSTANDING THE POWER OF ISL                             */}
        {/* ------------------------------------------------------------------------- */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="bg-white dark:bg-[#0d121d] rounded-[28px] sm:rounded-[36px] border border-[#e0e3e5] dark:border-[#2d3133] shadow-sm p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-14 transition-colors">
              
              {/* Text Content */}
              <div className="lg:w-1/2 flex flex-col items-start text-left">
                <div className="inline-flex items-center space-x-2 bg-[#fe9832]/10 border border-[#fe9832]/30 text-[#8f4e00] dark:text-[#fe9832] px-3.5 py-1.5 rounded-full text-xs font-bold mb-4 shadow-xs">
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  <span>Visual Linguistic Expression</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#030813] dark:text-white mb-4 leading-tight font-headline">
                  Understanding the Power of ISL
                </h2>
                <ul className="space-y-3.5 text-sm sm:text-base text-[#475569] dark:text-[#94a3b8] font-body-lg">
                  <li className="flex items-start">
                    <span className="material-symbols-outlined text-[#fe9832] mr-3 mt-1 text-lg">check_circle</span>
                    <span><strong>ISL is a complete language</strong> with its own grammatical structure and spatial syntax.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-symbols-outlined text-[#fe9832] mr-3 mt-1 text-lg">check_circle</span>
                    <span>Sign language provides <strong>depth, emotion, and nuance</strong> that plain text captions cannot convey alone.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-symbols-outlined text-[#fe9832] mr-3 mt-1 text-lg">check_circle</span>
                    <span><strong>True accessibility</strong> means full linguistic inclusion in workplaces, schools, and hospitals.</span>
                  </li>
                </ul>
              </div>

              {/* Interactive Hub Grid */}
              <div className="lg:w-1/2 w-full grid grid-cols-2 gap-4 sm:gap-5 items-center">
                {/* Column 1 */}
                <div className="space-y-4 sm:space-y-5 transform translate-y-3 sm:translate-y-4">
                  <div className="group relative bg-[#f1f4f6] dark:bg-[#1a202c] p-2.5 sm:p-3 rounded-2xl border border-[#e0e3e5] dark:border-[#2d3133] hover:border-[#fe9832]/60 shadow-xs hover:shadow-sm transition-all duration-200">
                    <img alt="ISL Sign for School" className="w-full h-auto rounded-xl object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1IcuoSACwI4jLwg5ueh1IRcEnYPJ9hL-_WOYW3xxZ_aSu5j7uXg8E83JXK-ucoCcYtFjZAFtyw4aoQEl92qFC00LButAPA2tTxOK7u3j50wJs2327MOc0Bxxoq-7mwvY-I6Hsefs28YpImFo2WzVVkJri53VFomxBuw0fACOZ-6UNCZ2F5W6IzBnW855EVYs7ZCx7M3-WymBja7oTiFonw9OFYyi9cTbk-PZgwG7J1TlNP-MK4pI5Tt8lyQbTMYfTwQ" />
                  </div>
                  <div className="group relative bg-[#f1f4f6] dark:bg-[#1a202c] p-2.5 sm:p-3 rounded-2xl border border-[#e0e3e5] dark:border-[#2d3133] hover:border-[#fe9832]/60 shadow-xs hover:shadow-sm transition-all duration-200">
                    <img alt="ISL Sign for Rain" className="w-full h-auto rounded-xl object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtkIhmMBsu_7H0TjvzfJobxk2ep83U12cA7AambsZvc8DzEesef49vBBlQv8CNTcyNMt08nYqSbqsB-c62u0DuYAY28ObttmRpZbWPpSM8IfouAMBfmHvMok7KE_ksMqSS4ORio25uvrAfXPjpAkTMFgclUWzbHQEmH25tUIyySS568buNZLZ40wKHHj8ZkUgJDAyOFlGrEcEB6bi4mGg8sAFpM6Zibs-AXBJhRrOUk1eQtDYJFwsfrpt9cLWNRf4nMg" />
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4 sm:space-y-5 transform -translate-y-3 sm:-translate-y-4">
                  <div className="group relative bg-[#f1f4f6] dark:bg-[#1a202c] p-2.5 sm:p-3 rounded-2xl border border-[#e0e3e5] dark:border-[#2d3133] hover:border-[#fe9832]/60 shadow-xs hover:shadow-sm transition-all duration-200">
                    <img alt="ISL Sign for Yes" className="w-full h-auto rounded-xl object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxpn70XLRKG_xL1NH6Vg89QATa-gu3kc1hp5C5BxTumnInxuKVWCC2LLoklqqCt5PPGTlt6qQCmyilDYPaKvlnKlkHxYEZ1Q9rUaAJMKj7L-VIeorTCdMeVGbWRxX0qlJG6LE_IrsZV9hIaK-h7tnBAg-JcIVN0WjsEcDsYH00ZO2B36I_K210p9zXym1QML5UzSO6PkXcq_pHcoaOWQs1swxQ4rI-BfnJSQBN0MfD7QP2szCmltTf1bDUNXNCJuAstg" />
                  </div>
                  <div className="group relative bg-[#f1f4f6] dark:bg-[#1a202c] p-2.5 sm:p-3 rounded-2xl border border-[#e0e3e5] dark:border-[#2d3133] hover:border-[#fe9832]/60 shadow-xs hover:shadow-sm transition-all duration-200">
                    <img alt="ISL Sign for Hello" className="w-full h-auto rounded-xl object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDK3L7OCQX9pJpt8UwNZLEKILyEQ4hOJ5NZIiDpbYNRjIjYPVnP-Yb61h8KYXQlIpPNxessVa_PwRdsWM7MjamdXt4sEOzggLqaZkGawnlppGeRlB4Is0Yh8sKjUkzgLj0-iMlf2FFXXiVkuQJMfGllkdkXAE5AtFkMiTMsqjR0ODNJVGxiK-ZC7Jj91yzUZ67Df7gr-FnEMLuqulRb29c6cudvdTTpcON6z1niRTlhFuu9Cgke02M5Kru1dv2r7F84fU4MpQPGb1sO4g" />
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
            <div className="w-12 h-1 bg-[#fe9832] mx-auto mb-6 rounded-full"></div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#030813] dark:text-white mb-4 max-w-3xl mx-auto leading-tight tracking-tight font-headline">
              We are on a mission to make communication universal, regardless of ability.
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-[#475569] dark:text-[#94a3b8] max-w-2xl mx-auto leading-relaxed font-body-lg">
              SAMBHAV is not just an app; it's a movement. By leveraging advanced computer vision and natural language processing, we are building a seamless bridge between Indian Sign Language and spoken languages.
            </p>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 5. HOW IT WORKS                                                          */}
        {/* ------------------------------------------------------------------------- */}
        <section id="how-it-works-section" className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-10">
              <span className="px-3.5 py-1 bg-[#fe9832]/10 border border-[#fe9832]/30 text-[#8f4e00] dark:text-[#fe9832] text-xs font-bold rounded-full mb-3 inline-block">
                System Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#030813] dark:text-white font-headline">How it Works</h2>
            </div>
            <div className="rounded-2xl sm:rounded-3xl shadow-sm border border-[#e0e3e5] dark:border-[#2d3133] bg-white dark:bg-[#0d121d] p-3 sm:p-4 flow-arrow max-w-4xl mx-auto transition-colors">
              <img
                alt="SAMBHAV: The Bidirectional Bridge - How it Works"
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
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#030813] dark:text-white mb-2 font-headline">
                Why Choose <span className="text-[#fe9832]">SAMBHAV?</span>
              </h2>
              <p className="text-sm sm:text-base text-[#475569] dark:text-[#94a3b8] max-w-2xl mx-auto">
                Next-generation accessibility features designed for seamless and instant interaction.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              
              {/* Feature 1 */}
              <div className="bg-white dark:bg-[#0d121d] p-5 rounded-2xl border border-[#e0e3e5] dark:border-[#2d3133] hover:border-[#fe9832] shadow-xs flex flex-col h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 text-left">
                <div className="w-10 h-10 rounded-xl bg-[#fe9832]/15 border border-[#fe9832]/30 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-[#8f4e00] dark:text-[#fe9832] text-xl">translate</span>
                </div>
                <h3 className="text-base font-bold text-[#030813] dark:text-white mb-1.5 font-headline">Real-time Translation</h3>
                <p className="text-[#64748b] dark:text-[#94a3b8] text-xs leading-relaxed">Instant ISL-to-text conversion with minimal latency.</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-[#0d121d] p-5 rounded-2xl border border-[#e0e3e5] dark:border-[#2d3133] hover:border-[#059669] shadow-xs flex flex-col h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 text-left">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xl">verified</span>
                </div>
                <h3 className="text-base font-bold text-[#030813] dark:text-white mb-1.5 font-headline">High Precision</h3>
                <p className="text-[#64748b] dark:text-[#94a3b8] text-xs leading-relaxed">Accurate gesture recognition for clear communication.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-[#0d121d] p-5 rounded-2xl border border-[#e0e3e5] dark:border-[#2d3133] hover:border-[#fe9832] shadow-xs flex flex-col h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 text-left">
                <div className="w-10 h-10 rounded-xl bg-[#fe9832]/15 border border-[#fe9832]/30 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-[#8f4e00] dark:text-[#fe9832] text-xl">bolt</span>
                </div>
                <h3 className="text-base font-bold text-[#030813] dark:text-white mb-1.5 font-headline">Fast Processing</h3>
                <p className="text-[#64748b] dark:text-[#94a3b8] text-xs leading-relaxed">Lightning-fast response times for smooth interaction.</p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white dark:bg-[#0d121d] p-5 rounded-2xl border border-[#e0e3e5] dark:border-[#2d3133] hover:border-amber-500 shadow-xs flex flex-col h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 text-left">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl">sentiment_satisfied</span>
                </div>
                <h3 className="text-base font-bold text-[#030813] dark:text-white mb-1.5 font-headline">User-Friendly</h3>
                <p className="text-[#64748b] dark:text-[#94a3b8] text-xs leading-relaxed">Simple interface designed for everyone to use.</p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white dark:bg-[#0d121d] p-5 rounded-2xl border border-[#e0e3e5] dark:border-[#2d3133] hover:border-[#fe9832] shadow-xs flex flex-col h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 text-left">
                <div className="w-10 h-10 rounded-xl bg-[#fe9832]/15 border border-[#fe9832]/30 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-[#8f4e00] dark:text-[#fe9832] text-xl">auto_awesome</span>
                </div>
                <h3 className="text-base font-bold text-[#030813] dark:text-white mb-1.5 font-headline">AI Intelligence</h3>
                <p className="text-[#64748b] dark:text-[#94a3b8] text-xs leading-relaxed">Advanced learning models for superior sign recognition.</p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white dark:bg-[#0d121d] p-5 rounded-2xl border border-[#e0e3e5] dark:border-[#2d3133] hover:border-teal-500 shadow-xs flex flex-col h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 text-left">
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-xl">menu_book</span>
                </div>
                <h3 className="text-base font-bold text-[#030813] dark:text-white mb-1.5 font-headline">Educational Tools</h3>
                <p className="text-[#64748b] dark:text-[#94a3b8] text-xs leading-relaxed">Easy lessons to help you learn and master ISL.</p>
              </div>

              {/* Feature 7 */}
              <div className="bg-white dark:bg-[#0d121d] p-5 rounded-2xl border border-[#e0e3e5] dark:border-[#2d3133] hover:border-blue-500 shadow-xs flex flex-col h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 text-left">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">verified_user</span>
                </div>
                <h3 className="text-base font-bold text-[#030813] dark:text-white mb-1.5 font-headline">Secure Platform</h3>
                <p className="text-[#64748b] dark:text-[#94a3b8] text-xs leading-relaxed">Your data and privacy are always protected.</p>
              </div>

              {/* Feature 8 */}
              <div className="bg-white dark:bg-[#0d121d] p-5 rounded-2xl border border-[#e0e3e5] dark:border-[#2d3133] hover:border-purple-500 shadow-xs flex flex-col h-full transition-all duration-200 hover:shadow-md hover:-translate-y-1 text-left">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-xl">diversity_3</span>
                </div>
                <h3 className="text-base font-bold text-[#030813] dark:text-white mb-1.5 font-headline">Community Focused</h3>
                <p className="text-[#64748b] dark:text-[#94a3b8] text-xs leading-relaxed">Built to connect deaf and hearing people everywhere.</p>
              </div>

            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 7. WHERE WE CAN MAKE A DIFFERENCE                                         */}
        {/* ------------------------------------------------------------------------- */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#030813] dark:text-white mb-3 font-headline">
                Where We Can Make a <span className="text-[#fe9832]">Difference</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-[#475569] dark:text-[#94a3b8] max-w-2xl mx-auto">A unified platform for accessibility across every environment.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 relative z-20">
              
              {/* Schools & Colleges */}
              <div className="relative h-52 sm:h-60 rounded-2xl overflow-hidden card-shadow transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group border border-[#e0e3e5] dark:border-[#2d3133] hover:border-[#fe9832]">
                <img
                  alt="Schools & Colleges"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDj35VlzhIT0WNloL6o-GP375DwoFP5BuoW2OHI4O-ieBylYnBDETldOKUqxF25jpJ1-FscykYx4-7ZwtTbJETxOGQuYEHjgJz5NClpnCa6BvC1U3R6KVeWnWau2HhQmZot3KXlDTE9N_zLUqOjBrKO_zI7tqbI3E4UYANpnevl-wSK7ANLAW2iBnFCIYC9HTMM83JmdEq6__M8MbfoWC2AwDPcJC0YW9Z2jLhMlp0xeJBFm-3wuhnm30ttfphiWtYaJfGcxST16dW5kQ"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030813]/95 via-[#030813]/60 to-transparent transition-colors"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-end text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 font-headline">Schools &amp; Colleges</h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">Accessible learning environments.</p>
                </div>
              </div>

              {/* Hospitals & Healthcare */}
              <div className="relative h-52 sm:h-60 rounded-2xl overflow-hidden card-shadow transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group border border-[#e0e3e5] dark:border-[#2d3133] hover:border-[#fe9832]">
                <img
                  alt="Hospitals & Healthcare"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDM7sQ1JnyOZxJH_lzGy4OIN2PAO8LSCO1u0STXXT0PkrEdKT3ihi1R3CdYONk5pootivIVMGj48rYzO8AdNDzv_RO8AZ3DySvAyZPGLc1pWey9RCWR7fH44B6neK9Nyl8_dejLr9jcJFsvXgPT1Aj8iXHaUtsC2csbTCLCfh8c8ISDU8et50xKGSq0i0l-dpJssJFGvk7maMIe99s-IhP-vmkosXtyR3soYqpVuxiEvRwVeVrGbpVZEQ6-s3ZJzVulZJNmdm3Inzbedg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030813]/95 via-[#030813]/60 to-transparent transition-colors"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-end text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 font-headline">Hospitals &amp; Healthcare</h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">Clear patient-staff communication.</p>
                </div>
              </div>

              {/* Offices & Workplaces */}
              <div className="relative h-52 sm:h-60 rounded-2xl overflow-hidden card-shadow transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group border border-[#e0e3e5] dark:border-[#2d3133] hover:border-[#fe9832]">
                <img
                  alt="Offices & Workplaces"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQl0Mze-e_ofaHXmslRnaSo_JL3ZDy3ZmuyVC69DXU6xwt1DIx7UC0fpIQ0RCyFVRx3ZIj3gw3pooQokZbJ0AuzSseGVj9FvKJLAg3mEEe2NpSd_l6_kJr-TdxguvfLWUkBnqEKTTs2_DcwNo6sgtJ4pV5tBX40HWb0ajpibSztmZCHbo_8-5cDfe0WdtEl-vkSGjSUjfmpP2dtPrTJoj-INAPPWumPhTsbHQ_JkL2gy4CTcgcHb41WZgcO245TnZhPOW-5Y5J-TyiQg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030813]/95 via-[#030813]/60 to-transparent transition-colors"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-end text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 font-headline">Offices &amp; Workplaces</h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">Inclusive professional interactions.</p>
                </div>
              </div>

              {/* Communities & Public Spaces */}
              <div className="relative h-52 sm:h-60 rounded-2xl overflow-hidden card-shadow transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group border border-[#e0e3e5] dark:border-[#2d3133] hover:border-[#fe9832]">
                <img
                  alt="Communities & Public Spaces"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9OWW7PlGXb13POAmqna6ZhX10V90VFN7gexxYokwspDiBIM_dBWsLk0WWfMCU3r6pFTxiR8W8mHySXBoatqI6Ju1m5F6-847lIulgXgiEtzkEm0JG1VbgA08lqBngp-RsN8lXthpLXZox25-lwfG_Y3784W7WzisURC2d7j6-izpdg3Mm7MwGASmC8Zo3rTEW95dfAgHvFnpjs7p4MEfEedC-ajdl3UVmXFLGccKunM-TBqveQ1TX"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030813]/95 via-[#030813]/60 to-transparent transition-colors"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-end text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 font-headline">Public Services</h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">Access to essential citizen information.</p>
                </div>
              </div>

              {/* Businesses */}
              <div className="relative h-52 sm:h-60 rounded-2xl overflow-hidden card-shadow transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group border border-[#e0e3e5] dark:border-[#2d3133] hover:border-[#fe9832]">
                <img
                  alt="Businesses"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxMo8OdcyymvVyXrMeQEiIHc1_gW2zFcdRALbk4CCnz4QMdL7h7cHXSA5WVEyfeiggiFducQXjcchfOM_sVaYT0W_3UIw91Dg1iFbgLd4imgyHnl_nMmz3QOiIz4ZSk_BdREYjMjwuAikLaCs9lyj4VGUc6tkr-oXlsFAOUYCrN5fYkkPPzKWwtkkpeAAdM7AiCFoLZB9O7ks6NjLTQqkxE0y9dxQslsXIOHC0pF5WZaswg7UGWtiz-1QDACXuynyiHC9gc_NH7n0cKw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030813]/95 via-[#030813]/60 to-transparent transition-colors"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-end text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 font-headline">Businesses</h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">Accessible customer service.</p>
                </div>
              </div>

              {/* Everyday Life */}
              <div className="relative h-52 sm:h-60 rounded-2xl overflow-hidden card-shadow transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group border border-[#e0e3e5] dark:border-[#2d3133] hover:border-[#fe9832]">
                <img
                  alt="Everyday Life"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuATJpQ_TUsB-ig8zrXOg8LGl5v1VKmxt4H6IT50ScEVL7lTXt4IWAutZbse5kml2bMFOoD330-aYgM_hECSX2e8JzEOP7YRL-53Aq-P7XK-8A9HyrjdAp7KKdDxdntkNf8kY0VyCk3Z6zQB-7LaRUk5x9G1is6MoH8b3b3UPBlwfA7Z_ulc_zRS0den3U9l1xDCATlzDFHk4x3AHHDRHkov_aYxBIourrrBK-R-o1y7EohCg_VUKqOvSOiRAXUQ5bQX7x8p4CKR7zVIZg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030813]/95 via-[#030813]/60 to-transparent transition-colors"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-end text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 font-headline">Everyday Life</h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">Making common interactions seamless.</p>
                </div>
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
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#030813] dark:text-white mb-2.5 font-headline">Beta Tester Feedback</h2>
              <p className="text-sm sm:text-base text-[#475569] dark:text-[#94a3b8] font-body-lg">What our community is saying about the prototype.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              
              {/* Card 1: Anubhav Mohanty */}
              <div className="bg-white dark:bg-[#0d121d] rounded-2xl shadow-xs overflow-hidden flex flex-col h-full border border-[#e0e3e5] dark:border-[#2d3133] hover:border-[#fe9832]/50 transition-colors">
                <div className="p-6 pb-14 flex-grow relative flex items-center justify-center text-center">
                  <p className="text-[#334155] dark:text-[#cbd5e1] text-sm sm:text-base italic leading-relaxed font-body-md">
                    “We were impressed by the quality of service and attention to detail. Sambhav understood our requirements quickly and exceeded our expectations.”
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <img
                      alt="Anubhav Mohanty"
                      className="w-14 h-14 rounded-full border-3 border-white dark:border-[#0d121d] object-cover shadow-sm"
                      src="https://r.mobirisesite.com/3189180/assets/images/gc4f811ae8669f44688a2c0b044ee-h_mthqxsmc.jpg"
                    />
                  </div>
                  <div className="bg-[#fe9832] pt-9 pb-5 text-center text-[#683700] dark:text-[#3d1e00] relative">
                    <svg className="absolute top-0 left-0 w-full -translate-y-[99%]" preserveAspectRatio="none" viewBox="0 0 1440 320">
                      <path d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="#fe9832"></path>
                    </svg>
                    <h4 className="font-bold text-sm sm:text-base mb-0.5 font-headline">Anubhav Mohanty</h4>
                    <p className="text-[11px] opacity-90 uppercase tracking-wide font-semibold">Business Owner</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Prachi Mohapatra */}
              <div className="bg-white dark:bg-[#0d121d] rounded-2xl shadow-xs overflow-hidden flex flex-col h-full border border-[#e0e3e5] dark:border-[#2d3133] hover:border-[#fe9832]/50 transition-colors">
                <div className="p-6 pb-14 flex-grow relative flex items-center justify-center text-center">
                  <p className="text-[#334155] dark:text-[#cbd5e1] text-sm sm:text-base italic leading-relaxed font-body-md">
                    “Sambhav helped us save time and achieve better results. Their team is reliable, knowledgeable, and easy to work with.”
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <img
                      alt="Prachi Mohapatra"
                      className="w-14 h-14 rounded-full border-3 border-white dark:border-[#0d121d] object-cover shadow-sm"
                      src="https://r.mobirisesite.com/3189180/assets/images/gb5292c91c0837a47d680af6360ca-h_mthqwd8l.jpg"
                    />
                  </div>
                  <div className="bg-[#059669] pt-9 pb-5 text-center text-white relative">
                    <svg className="absolute top-0 left-0 w-full -translate-y-[99%]" preserveAspectRatio="none" viewBox="0 0 1440 320">
                      <path d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="#059669"></path>
                    </svg>
                    <h4 className="font-bold text-sm sm:text-base mb-0.5 font-headline">Prachi Mohapatra</h4>
                    <p className="text-[11px] text-white/90 uppercase tracking-wide">Happy Customer</p>
                  </div>
                </div>
              </div>

              {/* Card 3: Subrat Joshi */}
              <div className="bg-white dark:bg-[#0d121d] rounded-2xl shadow-xs overflow-hidden flex flex-col h-full border border-[#e0e3e5] dark:border-[#2d3133] hover:border-[#fe9832]/50 transition-colors">
                <div className="p-6 pb-14 flex-grow relative flex items-center justify-center text-center">
                  <p className="text-[#334155] dark:text-[#cbd5e1] text-sm sm:text-base italic leading-relaxed font-body-md">
                    “The service was excellent, the communication was clear, and the results were exactly what we hoped for. Highly recommended!”
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <img
                      alt="Subrat Joshi"
                      className="w-14 h-14 rounded-full border-3 border-white dark:border-[#0d121d] object-cover shadow-sm"
                      src="https://r.mobirisesite.com/3189180/assets/images/g784e78d191e0fe3962c7db76cc06-h_mthqxgfq.jpg"
                    />
                  </div>
                  <div className="bg-[#181c1e] dark:bg-[#1a202c] pt-9 pb-5 text-center text-white relative">
                    <svg className="absolute top-0 left-0 w-full -translate-y-[99%]" preserveAspectRatio="none" viewBox="0 0 1440 320">
                      <path d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="#181c1e"></path>
                    </svg>
                    <h4 className="font-bold text-sm sm:text-base mb-0.5 font-headline">Subrat Joshi</h4>
                    <p className="text-[11px] text-white/90 uppercase tracking-wide">Operations Head</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 9. MEET OUR TEAM                                                          */}
        {/* ------------------------------------------------------------------------- */}
        {/* ------------------------------------------------------------------------- */}
        {/* 9. MEET OUR TEAM                                                          */}
        {/* ------------------------------------------------------------------------- */}
        <section className="py-12 sm:py-16 lg:py-20 border-t border-[#e0e3e5] dark:border-[#2d3133]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-[#fe9832]/20 text-[#fe9832] border border-[#fe9832]/30 mb-3 inline-block">
                Team HacKNomads
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#030813] dark:text-white mb-4 font-headline">Meet Our Team</h2>
              <p className="text-sm sm:text-base md:text-lg text-[#475569] dark:text-[#94a3b8] max-w-2xl mx-auto font-body-lg">
                We are Team HacKNomads — a dedicated team building AI accessibility solutions for Indian Sign Language communication.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Member 1: Subham Nayak */}
              <div className="bg-white dark:bg-[#0d121d] rounded-2xl p-6 border border-[#e0e3e5] dark:border-[#2d3133] shadow-xs hover:border-[#fe9832]/50 transition-all flex flex-col items-center text-center group">
                <img
                  alt="Subham Nayak"
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#fe9832]/20 group-hover:scale-105 transition-transform mb-4 shadow-md"
                  src="https://r.mobirisesite.com/3189180/assets/images/team1-h_mths0kza.jpg"
                />
                <h3 className="text-lg font-bold text-[#030813] dark:text-white font-headline mb-1">Subham Nayak</h3>
                <p className="text-[#334155] dark:text-[#cbd5e1] text-xs sm:text-sm italic leading-relaxed">
                  “SAMBHAV Began With a Simple Thought: Communication Should Never Be Limited By The Way We Speak.”
                </p>
              </div>

              {/* Member 2: Mohapatra S.H Gargi */}
              <div className="bg-white dark:bg-[#0d121d] rounded-2xl p-6 border border-[#e0e3e5] dark:border-[#2d3133] shadow-xs hover:border-[#fe9832]/50 transition-all flex flex-col items-center text-center group">
                <img
                  alt="Mohapatra S.H Gargi"
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#fe9832]/20 group-hover:scale-105 transition-transform mb-4 shadow-md"
                  src="https://r.mobirisesite.com/3189180/assets/images/team6-h_mths5r90.jpg"
                />
                <h3 className="text-lg font-bold text-[#030813] dark:text-white font-headline mb-1">Mohapatra S.H Gargi</h3>
                <p className="text-[#334155] dark:text-[#cbd5e1] text-xs sm:text-sm italic leading-relaxed">
                  “For us, Indian Sign Language is not just a collection of gestures; it is a language, an identity, and a way of expressing emotions.”
                </p>
              </div>

              {/* Member 3: B Vineet Patro */}
              <div className="bg-white dark:bg-[#0d121d] rounded-2xl p-6 border border-[#e0e3e5] dark:border-[#2d3133] shadow-xs hover:border-[#fe9832]/50 transition-all flex flex-col items-center text-center group">
                <img
                  alt="B Vineet Patro"
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#fe9832]/20 group-hover:scale-105 transition-transform mb-4 shadow-md"
                  src="https://r.mobirisesite.com/3189180/assets/images/team3-h_mths6br8.jpg"
                />
                <h3 className="text-lg font-bold text-[#030813] dark:text-white font-headline mb-1">B Vineet Patro</h3>
                <p className="text-[#334155] dark:text-[#cbd5e1] text-xs sm:text-sm italic leading-relaxed">
                  “SAMBHAV uses technology to understand these signs and create a bridge between people who communicate differently.”
                </p>
              </div>

              {/* Member 4: Sidharth Kumar */}
              <div className="bg-white dark:bg-[#0d121d] rounded-2xl p-6 border border-[#e0e3e5] dark:border-[#2d3133] shadow-xs hover:border-[#fe9832]/50 transition-all flex flex-col items-center text-center group">
                <img
                  alt="Sidharth Kumar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#fe9832]/20 group-hover:scale-105 transition-transform mb-4 shadow-md"
                  src="https://r.mobirisesite.com/3189180/assets/images/team4-h_mthrnb56.jpg"
                />
                <h3 className="text-lg font-bold text-[#030813] dark:text-white font-headline mb-1">Sidharth Kumar</h3>
                <p className="text-[#334155] dark:text-[#cbd5e1] text-xs sm:text-sm italic leading-relaxed">
                  “From sign recognition to real-time communication and an expressive digital avatar, every part of SAMBHAV is built around accessibility.”
                </p>
              </div>

              {/* Member 5: Shreya Kashyap */}
              <div className="bg-white dark:bg-[#0d121d] rounded-2xl p-6 border border-[#e0e3e5] dark:border-[#2d3133] shadow-xs hover:border-[#fe9832]/50 transition-all flex flex-col items-center text-center group">
                <img
                  alt="Shreya Kashyap"
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#fe9832]/20 group-hover:scale-105 transition-transform mb-4 shadow-md"
                  src="https://r.mobirisesite.com/3189180/assets/images/team5-h_mthrfmge.jpg"
                />
                <h3 className="text-lg font-bold text-[#030813] dark:text-white font-headline mb-1">Shreya Kashyap</h3>
                <p className="text-[#334155] dark:text-[#cbd5e1] text-xs sm:text-sm italic leading-relaxed">
                  “We believe technology should not make people adapt to it. Technology should adapt to people.”
                </p>
              </div>

              {/* Member 6: Avishek Raul */}
              <div className="bg-white dark:bg-[#0d121d] rounded-2xl p-6 border border-[#e0e3e5] dark:border-[#2d3133] shadow-xs hover:border-[#fe9832]/50 transition-all flex flex-col items-center text-center group">
                <img
                  alt="Avishek Raul"
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#fe9832]/20 group-hover:scale-105 transition-transform mb-4 shadow-md"
                  src="https://r.mobirisesite.com/3189180/assets/images/team2-h_mthsbdlh.jpg"
                />
                <h3 className="text-lg font-bold text-[#030813] dark:text-white font-headline mb-1">Avishek Raul</h3>
                <p className="text-[#334155] dark:text-[#cbd5e1] text-xs sm:text-sm italic leading-relaxed">
                  “And that is what SAMBHAV stands for — making inclusive communication not just an idea, but something possible.”
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 10. SUPPORT & CONTACT US                                                  */}
        {/* ------------------------------------------------------------------------- */}
        <section id="contact-section" className="py-12 sm:py-16 lg:py-20 bg-[#f1f4f6]/60 dark:bg-[#0d121d]/60 border-t border-[#e0e3e5] dark:border-[#2d3133] transition-colors">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#030813] dark:text-white mb-3 font-headline">We're here to help</h2>
              <p className="text-sm sm:text-base text-[#475569] dark:text-[#94a3b8] max-w-2xl mx-auto">Reach out to our team for support with Sambhav's accessibility ecosystem.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              
              {/* Left Column: Contact Details */}
              <div className="bg-white dark:bg-[#0d121d] p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#e0e3e5] dark:border-[#2d3133] shadow-xs text-left transition-colors">
                <h3 className="text-lg sm:text-xl font-bold text-[#030813] dark:text-white mb-6 font-headline">Contact Details</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-3.5 sm:space-x-4">
                    <div className="w-10 h-10 rounded-full bg-[#fe9832]/15 flex items-center justify-center flex-shrink-0 border border-[#fe9832]/30">
                      <span className="material-symbols-outlined text-[#8f4e00] dark:text-[#fe9832] text-xl">mail</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[#030813] dark:text-white">E-mail</p>
                      <a className="block text-xs sm:text-sm text-[#475569] dark:text-[#cbd5e1] hover:text-[#fe9832] transition" href="mailto:nayak.subham2426@gmail.com">nayak.subham2426@gmail.com</a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3.5 sm:space-x-4">
                    <div className="w-10 h-10 rounded-full bg-[#fe9832]/15 flex items-center justify-center flex-shrink-0 border border-[#fe9832]/30">
                      <span className="material-symbols-outlined text-[#8f4e00] dark:text-[#fe9832] text-xl">location_on</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[#030813] dark:text-white">Location</p>
                      <p className="text-xs sm:text-sm text-[#475569] dark:text-[#cbd5e1]">ITER, Siksha 'O' Anusandhan, Jagamara, Bhubaneswar - 751030</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Send a Message Form */}
              <div className="bg-white dark:bg-[#0d121d] p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#e0e3e5] dark:border-[#2d3133] shadow-xs text-left transition-colors">
                <h3 className="text-lg sm:text-xl font-bold text-[#030813] dark:text-white mb-6 font-headline">Send a Message</h3>
                {formSubmitted ? (
                  <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-center flex flex-col items-center gap-2 animate-fadeIn">
                    <span className="material-symbols-outlined text-4xl text-emerald-600 dark:text-emerald-400">check_circle</span>
                    <h4 className="font-bold text-base font-headline">Message Sent Successfully!</h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">Thank you for reaching out. Our accessibility team will contact you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#334155] dark:text-[#cbd5e1] mb-1.5">Name</label>
                      <input
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e3e5] dark:border-[#2d3133] focus:ring-2 focus:ring-[#fe9832]/30 focus:border-[#fe9832] outline-none transition bg-[#f1f4f6]/60 dark:bg-[#1a202c] focus:bg-white text-xs sm:text-sm text-[#030813] dark:text-white"
                        placeholder="Your Name"
                        type="text"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#334155] dark:text-[#cbd5e1] mb-1.5">Email</label>
                      <input
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e3e5] dark:border-[#2d3133] focus:ring-2 focus:ring-[#fe9832]/30 focus:border-[#fe9832] outline-none transition bg-[#f1f4f6]/60 dark:bg-[#1a202c] focus:bg-white text-xs sm:text-sm text-[#030813] dark:text-white"
                        placeholder="your@email.com"
                        type="email"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#334155] dark:text-[#cbd5e1] mb-1.5">Message</label>
                      <textarea
                        required
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#e0e3e5] dark:border-[#2d3133] focus:ring-2 focus:ring-[#fe9832]/30 focus:border-[#fe9832] outline-none transition resize-none bg-[#f1f4f6]/60 dark:bg-[#1a202c] focus:bg-white text-xs sm:text-sm text-[#030813] dark:text-white"
                        placeholder="How can we help you?"
                        rows={3}
                      />
                    </div>
                    <button
                      className="w-full bg-[#fe9832] text-[#683700] dark:text-[#3d1e00] font-bold py-3 rounded-xl hover:bg-[#e8872b] transition-colors shadow-sm cursor-pointer text-xs sm:text-sm"
                      type="submit"
                    >
                      Send Message
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
      <footer className="bg-[#f1f4f6] dark:bg-[#0d121d] border-t border-[#e0e3e5] dark:border-[#2d3133] pt-12 sm:pt-14 pb-8 text-left transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10 mb-12">
            
            {/* Column 1: Brand & Contact Info */}
            <div className="sm:col-span-2 lg:col-span-2 space-y-4">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center space-x-2.5 cursor-pointer text-left group"
              >
                <img
                  alt="SAMBHAV Circular Logo Icon"
                  className="h-9 w-9 rounded-full object-contain border border-[#e0e3e5] dark:border-[#2d3133] group-hover:scale-105 transition-transform"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTg0HBcA_4tr0W91LDkwqOnVSfSNqNLfncEA1PPwyGzu5JLTBXpp_wsXkZjo9tzLvf4KFNyaXk060fIQSGUovqRqh34LlLcrxxAUa5VojHfDfu4jRQJGk6QxnzQbHigwRz16MDMj2DwoCRu_i77QAzKuRLVJ8e2mLUwC7-UvMJ_JB5sui2SpIRfZM5c9yAP4gD3yTYgJBzlXm_PtIyr70gHi3MkHGC95pbUZ_Mid5Kj_my4OpeXflK15WPybnDecsYaov545CM4kLxeQ"
                />
                <span className="text-xl font-bold tracking-tight text-[#030813] dark:text-white font-headline">
                  SAM<span className="text-[#fe9832] font-extrabold">BHAV</span>
                </span>
              </button>
              <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94a3b8] leading-relaxed max-w-sm">
                Empowering two-way accessible communication for classrooms, healthcare, and everyday life with AI-powered Indian Sign Language.
              </p>
              
              <div className="pt-2">
                <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Connect with us</p>
                <div className="flex items-center space-x-4">
                  <a className="flex items-center text-xs text-[#475569] dark:text-[#cbd5e1] hover:text-[#fe9832] transition-colors" href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
                    LinkedIn
                  </a>
                  <a className="flex items-center text-xs text-[#475569] dark:text-[#cbd5e1] hover:text-[#fe9832] transition-colors" href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                    <span className="material-symbols-outlined text-base mr-1">photo_camera</span>
                    Instagram
                  </a>
                </div>
              </div>

              <div className="pt-2 border-t border-[#e0e3e5] dark:border-[#2d3133]">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">LOCATION</p>
                <p className="text-xs text-[#475569] dark:text-[#94a3b8] leading-relaxed">Institute of Technical Education &amp; Research, Jagamara, Bhubaneswar - 751030</p>
              </div>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3 sm:mb-4">Product</h3>
              <ul className="space-y-2.5">
                <li>
                  <button type="button" onClick={() => scrollTo('how-it-works-section')} className="text-xs sm:text-sm text-[#475569] dark:text-[#94a3b8] hover:text-[#030813] dark:hover:text-white cursor-pointer transition-colors">
                    How it Works?
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/dashboard')} className="text-xs sm:text-sm text-[#475569] dark:text-[#94a3b8] hover:text-[#030813] dark:hover:text-white cursor-pointer transition-colors">
                    Community Hub
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/dashboard')} className="text-xs sm:text-sm text-[#475569] dark:text-[#94a3b8] hover:text-[#030813] dark:hover:text-white cursor-pointer transition-colors">
                    Testimonials
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/cultural-isl')} className="text-xs sm:text-sm text-[#475569] dark:text-[#94a3b8] hover:text-[#030813] dark:hover:text-white cursor-pointer transition-colors">
                    Cultural ISL
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Solutions */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3 sm:mb-4">Solutions</h3>
              <ul className="space-y-2.5">
                <li>
                  <button type="button" onClick={() => navigate('/learn-isl')} className="text-xs sm:text-sm text-[#475569] dark:text-[#94a3b8] hover:text-[#030813] dark:hover:text-white cursor-pointer transition-colors">
                    Educational Learning
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/dashboard')} className="text-xs sm:text-sm text-[#475569] dark:text-[#94a3b8] hover:text-[#030813] dark:hover:text-white cursor-pointer transition-colors">
                    Public Services
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/communicate')} className="text-xs sm:text-sm text-[#475569] dark:text-[#94a3b8] hover:text-[#030813] dark:hover:text-white cursor-pointer transition-colors">
                    Healthcare Calling
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/translate')} className="text-xs sm:text-sm text-[#475569] dark:text-[#94a3b8] hover:text-[#030813] dark:hover:text-white cursor-pointer transition-colors">
                    Enterprise Translation
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/dashboard')} className="text-xs sm:text-sm text-[#475569] dark:text-[#94a3b8] hover:text-[#030813] dark:hover:text-white cursor-pointer transition-colors">
                    Digital Platforms
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Resources & Company */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3 sm:mb-4">Resources</h3>
              <ul className="space-y-2.5">
                <li>
                  <button type="button" onClick={() => navigate('/learn-isl')} className="text-xs sm:text-sm text-[#475569] dark:text-[#94a3b8] hover:text-[#030813] dark:hover:text-white cursor-pointer transition-colors">
                    ISL Learning Portal
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/news')} className="text-xs sm:text-sm text-[#475569] dark:text-[#94a3b8] hover:text-[#030813] dark:hover:text-white cursor-pointer transition-colors">
                    Accessible News
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollTo('problem-section')} className="text-xs sm:text-sm text-[#475569] dark:text-[#94a3b8] hover:text-[#030813] dark:hover:text-white cursor-pointer transition-colors">
                    Our Mission
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollTo('contact-section')} className="text-xs sm:text-sm text-[#475569] dark:text-[#94a3b8] hover:text-[#030813] dark:hover:text-white cursor-pointer transition-colors">
                    Contact Us
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/help')} className="text-xs sm:text-sm text-[#475569] dark:text-[#94a3b8] hover:text-[#030813] dark:hover:text-white cursor-pointer transition-colors">
                    Help &amp; Support
                  </button>
                </li>
              </ul>
            </div>

          </div>

          {/* Large background watermark */}
          <div className="pt-6 border-t border-[#e0e3e5] dark:border-[#2d3133] text-center">
            <p className="text-xs sm:text-sm text-gray-400">© 2026 Sambhav Accessibility AI. All rights reserved.</p>
          </div>
          
          <div className="mt-8 select-none relative md:h-32 flex items-center justify-center h-20 opacity-5 dark:opacity-10 pointer-events-none">
            <span className="text-[56px] sm:text-[80px] font-extrabold tracking-widest md:text-[150px] text-[#030813] dark:text-white font-headline" style={{ letterSpacing: '-0.05em' }}>
              SAM<span className="text-[#fe9832]">BHAV</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Floating Theme Quick Toggle Pill */}
      <aside aria-label="Theme mode switcher" className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white dark:bg-[#1a202c] backdrop-blur-md border border-[#e0e3e5] dark:border-[#2d3133] hover:border-[#fe9832] text-xs font-bold text-[#181c1e] dark:text-[#f7fafc] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span className="material-symbols-outlined text-[18px] text-[#fe9832] group-hover:rotate-45 transition-transform">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
          <span className="hidden sm:inline">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
      </aside>

    </div>
  );
};

export default LandingPage;
