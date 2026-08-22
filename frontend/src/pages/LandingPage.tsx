import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
    <div className="page-bg text-[#1E293B] antialiased min-h-screen font-['Inter',sans-serif]">
      
      {/* ========================================================================= */}
      {/* HEADER                                                                    */}
      {/* ========================================================================= */}
      <header className="fixed top-0 w-full bg-white/90 dark:bg-[#030813]/90 backdrop-blur-md z-50 border-b border-indigo-100 dark:border-indigo-900/30 left-0 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center space-x-2.5 text-left cursor-pointer group"
              >
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#fe9832] to-[#4f46e5] shadow-xs group-hover:scale-105 transition-transform">
                  <img
                    alt="Sambhav Logo"
                    className="h-8 w-8 rounded-full object-cover bg-white"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTg0HBcA_4tr0W91LDkwqOnVSfSNqNLfncEA1PPwyGzu5JLTBXpp_wsXkZjo9tzLvf4KFNyaXk060fIQSGUovqRqh34LlLcrxxAUa5VojHfDfu4jRQJGk6QxnzQbHigwRz16MDMj2DwoCRu_i77QAzKuRLVJ8e2mLUwC7-UvMJ_JB5sui2SpIRfZM5c9yAP4gD3yTYgJBzlXm_PtIyr70gHi3MkHGC95pbUZ_Mid5Kj_my4OpeXflK15WPybnDecsYaov545CM4kLxeQ"
                  />
                </div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#4f46e5] to-[#ea580c] font-headline">Sambhav</span>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-8 text-sm font-bold">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-[#334155] hover:text-[#4f46e5] transition-colors cursor-pointer"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => scrollTo('problem-section')}
                className="text-[#334155] hover:text-[#4f46e5] transition-colors cursor-pointer"
              >
                Problem
              </button>
              <button
                type="button"
                onClick={() => scrollTo('features-section')}
                className="text-[#334155] hover:text-[#4f46e5] transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => scrollTo('contact-section')}
                className="text-[#334155] hover:text-[#4f46e5] transition-colors cursor-pointer"
              >
                Contact Us
              </button>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {user ? (
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] text-white px-5 py-2 rounded-full text-xs sm:text-sm font-bold hover:from-[#4338ca] hover:to-[#6d28d9] transition-all shadow-md cursor-pointer"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-[#334155] hover:text-[#4f46e5] text-xs sm:text-sm font-bold px-2 py-1.5 cursor-pointer transition-colors"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#7c3aed] text-white px-5 py-2 rounded-full text-xs sm:text-sm font-bold hover:from-[#4338ca] hover:to-[#6d28d9] transition-all shadow-md cursor-pointer"
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
        {/* 1. HERO SECTION                                                          */}
        {/* ------------------------------------------------------------------------- */}
        <section className="relative pt-12 pb-12 sm:pt-16 sm:pb-16 lg:pt-24 lg:pb-24 hero-bg overflow-hidden">
          {/* Vivid Colorful Gradient Ambient Orbs */}
          <div className="absolute top-[-80px] right-[-120px] w-[600px] h-[600px] bg-gradient-to-br from-[#4f46e5]/30 to-[#ec4899]/25 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-[-60px] left-[5%] w-[450px] h-[450px] bg-gradient-to-tr from-[#10b981]/25 to-[#06b6d4]/25 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-[25%] left-[-80px] w-[350px] h-[350px] bg-gradient-to-r from-[#f59e0b]/25 to-[#ea580c]/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-[10%] right-[25%] w-[250px] h-[250px] bg-[#8b5cf6]/20 rounded-full blur-[80px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl text-center lg:text-left flex flex-col items-center lg:items-start">
              
              {/* Top Status Badge */}
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#eef2ff] via-[#faf5ff] to-[#fff7ed] border border-[#c7d2fe] text-[#4338ca] px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold mb-5 sm:mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#ea580c] animate-ping" />
                <span>Empowering Indian Sign Language AI</span>
              </div>

              {/* Main Headline with Radiant Gradient */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 sm:mb-5 leading-[1.15] sm:leading-[1.12] font-headline">
                <span className="text-[#0c1322]">Bridging worlds with </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#ea580c]">
                  accessible AI.
                </span>
              </h1>

              {/* Subtext */}
              <p className="text-base sm:text-lg md:text-xl text-[#334155] mb-7 sm:mb-8 leading-relaxed font-body-lg max-w-2xl">
                India's leading AI-powered accessibility ecosystem, enabling seamless bidirectional communication through Indian Sign Language (ISL), 3D Avatars, and live speech translation.
              </p>

              {/* Action CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigate('/communicate')}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#7c3aed] hover:from-[#4338ca] hover:to-[#6d28d9] text-white px-8 py-3.5 rounded-2xl text-sm sm:text-base font-bold hover:-translate-y-0.5 transition-all duration-200 shadow-[0_4px_24px_rgba(79,70,229,0.45)] hover:shadow-[0_8px_32px_rgba(79,70,229,0.65)] text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">videocam</span>
                  <span>Try Sambhav Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollTo('how-it-works-section')}
                  className="w-full sm:w-auto bg-white/90 hover:bg-white text-[#1e293b] border border-[#c7d2fe] px-7 sm:px-8 py-3.5 rounded-2xl text-sm sm:text-base font-bold hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[#ea580c] text-[20px]">info</span>
                  <span>Explore Architecture</span>
                </button>
              </div>

              {/* Bottom Feature Pills with Rich Colors */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-[#d0ccc5]/80 text-xs sm:text-sm font-bold">
                <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 rounded-full border border-amber-200 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Real-time 3D ISL Avatar
                </span>
                <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-900 rounded-full border border-emerald-200 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Live Speech &amp; Subtitles
                </span>
                <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900 rounded-full border border-indigo-200 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Encrypted LiveKit WebRTC
                </span>
              </div>

            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 2. PROBLEM: COMMUNICATION CHALLENGES IN INDIA                             */}
        {/* ------------------------------------------------------------------------- */}
        <section id="problem-section" className="py-12 sm:py-16 lg:py-20 relative bg-white/95 rounded-[2.5rem] mx-3 sm:mx-6 lg:mx-8 border border-[#d0ccc5] shadow-xl my-10 sm:my-14 overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center mb-10 sm:mb-14">
              <span className="px-3.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-black uppercase tracking-wider mb-3 inline-block">
                The Accessibility Gap
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0c1322] mb-3 sm:mb-4 font-headline">
                Communication Challenges in India
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-[#334155] max-w-2xl mx-auto font-body-lg leading-relaxed">
                The communication barrier in India affects millions, with a critical shortage of certified interpreters leaving the Deaf and hard-of-hearing community underserved.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 items-center max-w-3xl mx-auto">
              
              {/* 63M+ Stat Gauge Card (Royal Indigo Gradient) */}
              <div className="flex flex-col items-center text-center space-y-3 bg-gradient-to-br from-[#eff6ff] via-[#e0e7ff] to-[#f5f3ff] p-7 sm:p-8 rounded-3xl border border-indigo-200 shadow-md hover:shadow-xl transition-all duration-300">
                <div className="relative w-32 h-32 sm:w-36 sm:h-36">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" fill="none" r="40" stroke="#cbd5e1" strokeWidth="8" />
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
                    <span className="text-[#1e1b4b] font-extrabold text-2xl sm:text-3xl font-headline">63M+</span>
                  </div>
                </div>
                <h3 className="text-[#1e1b4b] font-extrabold text-base sm:text-lg font-headline">Significant Hearing Loss</h3>
                <p className="text-indigo-900 text-xs sm:text-sm font-medium">Individuals facing daily communication barriers across India.</p>
                <span className="px-2.5 py-0.5 bg-indigo-200/80 text-indigo-900 rounded-full text-[10px] font-bold uppercase tracking-wider">Source: WHO</span>
              </div>

              {/* <1% Stat Gauge Card (Sunset Orange/Amber Gradient) */}
              <div className="flex flex-col items-center text-center space-y-3 bg-gradient-to-br from-[#fff7ed] via-[#ffedd5] to-[#fef2f2] p-7 sm:p-8 rounded-3xl border border-orange-200 shadow-md hover:shadow-xl transition-all duration-300">
                <div className="relative w-32 h-32 sm:w-36 sm:h-36">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" fill="none" r="40" stroke="#cbd5e1" strokeWidth="8" />
                    <circle
                      className="gauge-ring"
                      cx="50"
                      cy="50"
                      data-percent="1"
                      fill="none"
                      r="40"
                      stroke="#ea580c"
                      strokeDasharray="251.2"
                      strokeDashoffset="248.814"
                      strokeLinecap="round"
                      strokeWidth="8"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[#7c2d12] font-extrabold text-2xl sm:text-3xl font-headline">&lt;1%</span>
                  </div>
                </div>
                <h3 className="text-[#7c2d12] font-extrabold text-base sm:text-lg font-headline">Access to ISL Education</h3>
                <p className="text-orange-900 text-xs sm:text-sm font-medium">Deaf individuals with access to formal ISL education &amp; interpretation.</p>
                <span className="px-2.5 py-0.5 bg-orange-200/80 text-orange-900 rounded-full text-[10px] font-bold uppercase tracking-wider">Source: Census of India</span>
              </div>

            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 3. ABOUT ISL: UNDERSTANDING THE POWER OF ISL                             */}
        {/* ------------------------------------------------------------------------- */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-br from-white via-indigo-50/40 to-amber-50/40 backdrop-blur-md rounded-[32px] border border-indigo-100 shadow-xl p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-14">
              
              {/* Text Content */}
              <div className="lg:w-1/2 flex flex-col items-start text-left">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200 text-indigo-800 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold mb-5 shadow-xs">
                  <span className="material-symbols-outlined text-sm text-indigo-600">visibility</span>
                  <span>Visual Language Science</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0c1322] mb-6 leading-tight font-headline">
                  Understanding the Power of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">ISL</span>
                </h2>
                <ul className="space-y-4 text-sm sm:text-base md:text-lg text-[#334155] font-body-lg">
                  <li className="flex items-start gap-3 bg-white/80 p-3 rounded-2xl border border-indigo-100 shadow-xs">
                    <span className="material-symbols-outlined text-emerald-600 mt-0.5 text-xl font-black">check_circle</span>
                    <span><strong>ISL is a complete language</strong> with its own grammar, spatial syntax, and facial markers.</span>
                  </li>
                  <li className="flex items-start gap-3 bg-white/80 p-3 rounded-2xl border border-indigo-100 shadow-xs">
                    <span className="material-symbols-outlined text-indigo-600 mt-0.5 text-xl font-black">check_circle</span>
                    <span>Sign language conveys <strong>depth, emotion, and nuance</strong> that plain text alone cannot express.</span>
                  </li>
                  <li className="flex items-start gap-3 bg-white/80 p-3 rounded-2xl border border-indigo-100 shadow-xs">
                    <span className="material-symbols-outlined text-amber-600 mt-0.5 text-xl font-black">check_circle</span>
                    <span><strong>True accessibility</strong> means full linguistic inclusion in education, health, and life.</span>
                  </li>
                </ul>
              </div>

              {/* Interactive Visual Cards */}
              <div className="lg:w-1/2 w-full grid grid-cols-2 gap-4 sm:gap-5 items-center">
                <div className="space-y-4 sm:space-y-5 transform translate-y-3 sm:translate-y-4">
                  <div className="group relative bg-gradient-to-br from-indigo-50 to-blue-50 p-3 rounded-2xl border-2 border-indigo-200 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <img alt="ISL Sign for School" className="w-full h-auto rounded-xl object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1IcuoSACwI4jLwg5ueh1IRcEnYPJ9hL-_WOYW3xxZ_aSu5j7uXg8E83JXK-ucoCcYtFjZAFtyw4aoQEl92qFC00LButAPA2tTxOK7u3j50wJs2327MOc0Bxxoq-7mwvY-I6Hsefs28YpImFo2WzVVkJri53VFomxBuw0fACOZ-6UNCZ2F5W6IzBnW855EVYs7ZCx7M3-WymBja7oTiFonw9OFYyi9cTbk-PZgwG7J1TlNP-MK4pI5Tt8lyQbTMYfTwQ" />
                    <span className="block text-center mt-2 text-xs font-bold text-indigo-900">Sign: School</span>
                  </div>
                  <div className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 p-3 rounded-2xl border-2 border-emerald-200 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <img alt="ISL Sign for Rain" className="w-full h-auto rounded-xl object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtkIhmMBsu_7H0TjvzfJobxk2ep83U12cA7AambsZvc8DzEesef49vBBlQv8CNTcyNMt08nYqSbqsB-c62u0DuYAY28ObttmRpZbWPpSM8IfouAMBfmHvMok7KE_ksMqSS4ORio25uvrAfXPjpAkTMFgclUWzbHQEmH25tUIyySS568buNZLZ40wKHHj8ZkUgJDAyOFlGrEcEB6bi4mGg8sAFpM6Zibs-AXBJhRrOUk1eQtDYJFwsfrpt9cLWNRf4nMg" />
                    <span className="block text-center mt-2 text-xs font-bold text-emerald-900">Sign: Rain</span>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-5 transform -translate-y-3 sm:-translate-y-4">
                  <div className="group relative bg-gradient-to-br from-amber-50 to-orange-50 p-3 rounded-2xl border-2 border-amber-200 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <img alt="ISL Sign for Yes" className="w-full h-auto rounded-xl object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxpn70XLRKG_xL1NH6Vg89QATa-gu3kc1hp5C5BxTumnInxuKVWCC2LLoklqqCt5PPGTlt6qQCmyilDYPaKvlnKlkHxYEZ1Q9rUaAJMKj7L-VIeorTCdMeVGbWRxX0qlJG6LE_IrsZV9hIaK-h7tnBAg-JcIVN0WjsEcDsYH00ZO2B36I_K210p9zXym1QML5UzSO6PkXcq_pHcoaOWQs1swxQ4rI-BfnJSQBN0MfD7QP2szCmltTf1bDUNXNCJuAstg" />
                    <span className="block text-center mt-2 text-xs font-bold text-amber-900">Sign: Yes</span>
                  </div>
                  <div className="group relative bg-gradient-to-br from-rose-50 to-pink-50 p-3 rounded-2xl border-2 border-rose-200 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <img alt="ISL Sign for Hello" className="w-full h-auto rounded-xl object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDK3L7OCQX9pJpt8UwNZLEKILyEQ4hOJ5NZIiDpbYNRjIjYPVnP-Yb61h8KYXQlIpPNxessVa_PwRdsWM7MjamdXt4sEOzggLqaZkGawnlppGeRlB4Is0Yh8sKjUkzgLj0-iMlf2FFXXiVkuQJMfGllkdkXAE5AtFkMiTMsqjR0ODNJVGxiK-ZC7Jj91yzUZ67Df7gr-FnEMLuqulRb29c6cudvdTTpcON6z1niRTlhFuu9Cgke02M5Kru1dv2r7F84fU4MpQPGb1sO4g" />
                    <span className="block text-center mt-2 text-xs font-bold text-rose-900">Sign: Hello</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 4. SOLUTION: MISSION STATEMENT                                           */}
        {/* ------------------------------------------------------------------------- */}
        <section className="py-12 sm:py-16 lg:py-20 relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <div className="w-16 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-orange-500 mx-auto mb-8 rounded-full"></div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0c1322] mb-6 max-w-4xl mx-auto leading-tight tracking-tight font-headline">
              We are on a mission to make communication <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4f46e5] to-[#ea580c]">universal</span>, regardless of ability.
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-[#334155] max-w-3xl mx-auto leading-relaxed font-medium">
              Sambhav is not just an app; it's a movement. By leveraging advanced computer vision and natural language processing, we are building a seamless bridge between Indian Sign Language and spoken languages, creating a truly inclusive society.
            </p>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 5. HOW IT WORKS (SAANKET Bidirectional Bridge)                             */}
        {/* ------------------------------------------------------------------------- */}
        <section id="how-it-works-section" className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-12">
              <span className="px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black uppercase tracking-wider mb-3 inline-block">
                Architecture &amp; Flow
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0c1322] font-headline">
                How It Works <span className="text-[#ea580c]">?</span>
              </h2>
              <p className="text-sm sm:text-base text-[#475569] mt-2 max-w-xl mx-auto font-medium">
                SAMBHAV: The Bidirectional Bridge — Powering seamless 2-way sign-to-speech and speech-to-sign conversions.
              </p>
            </div>
            <div className="p-2 rounded-3xl bg-gradient-to-r from-amber-400 via-indigo-500 to-emerald-400 shadow-2xl max-w-4xl mx-auto">
              <div className="bg-white rounded-[22px] p-3 sm:p-5">
                <img
                  alt="SAMBHAV: The Bidirectional Bridge - How it Works"
                  className="w-full h-auto object-cover rounded-xl sm:rounded-2xl"
                  src="/assets/how_it_works_diagram.jpg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 6. FEATURES: WHY CHOOSE US (Vibrant Multi-Color Grid)                      */}
        {/* ------------------------------------------------------------------------- */}
        <section id="features-section" className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-12">
              <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-3 inline-block">
                Core Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0c1322] mb-3 font-headline">
                Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4f46e5] to-[#ea580c]">Sambhav?</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-[#334155] max-w-2xl mx-auto">
                Next-generation accessibility features engineered for instant, expressive, and accurate interactions.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              
              {/* Feature 1: Real-Time Translation (Indigo/Violet) */}
              <div className="bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/90 p-6 rounded-3xl border border-indigo-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-left group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">translate</span>
                </div>
                <h3 className="text-lg font-bold text-indigo-950 mb-2 font-headline">Real-time Translation</h3>
                <p className="text-indigo-900/80 text-xs sm:text-sm leading-relaxed">Instant ISL-to-text and voice-to-sign avatar conversion with ultra-low latency.</p>
              </div>

              {/* Feature 2: High Precision (Emerald/Teal) */}
              <div className="bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/90 p-6 rounded-3xl border border-emerald-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-left group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">verified</span>
                </div>
                <h3 className="text-lg font-bold text-emerald-950 mb-2 font-headline">High Precision</h3>
                <p className="text-emerald-900/80 text-xs sm:text-sm leading-relaxed">Spatial gesture tracking and facial landmark recognition for accurate communication.</p>
              </div>

              {/* Feature 3: Fast Processing (Amber/Orange) */}
              <div className="bg-gradient-to-br from-amber-50/90 via-white to-orange-50/90 p-6 rounded-3xl border border-amber-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-left group">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">bolt</span>
                </div>
                <h3 className="text-lg font-bold text-amber-950 mb-2 font-headline">Fast Processing</h3>
                <p className="text-amber-900/80 text-xs sm:text-sm leading-relaxed">Lightning-fast WebAssembly pipeline ensures immediate live captions and fluid sign feedback.</p>
              </div>

              {/* Feature 4: User-Friendly (Rose/Pink) */}
              <div className="bg-gradient-to-br from-rose-50/90 via-white to-pink-50/90 p-6 rounded-3xl border border-rose-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-left group">
                <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">sentiment_very_satisfied</span>
                </div>
                <h3 className="text-lg font-bold text-rose-950 mb-2 font-headline">User-Friendly</h3>
                <p className="text-rose-900/80 text-xs sm:text-sm leading-relaxed">Inclusive, simple, and high-contrast interface designed for users of all abilities.</p>
              </div>

              {/* Feature 5: AI Intelligence (Sky/Cyan) */}
              <div className="bg-gradient-to-br from-sky-50/90 via-white to-cyan-50/90 p-6 rounded-3xl border border-sky-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-left group">
                <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                </div>
                <h3 className="text-lg font-bold text-sky-950 mb-2 font-headline">AI Intelligence</h3>
                <p className="text-sky-900/80 text-xs sm:text-sm leading-relaxed">Deep learning models trained on authentic Indian Sign Language corpora.</p>
              </div>

              {/* Feature 6: Educational Tools (Purple/Fuchsia) */}
              <div className="bg-gradient-to-br from-purple-50/90 via-white to-fuchsia-50/90 p-6 rounded-3xl border border-purple-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-left group">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">school</span>
                </div>
                <h3 className="text-lg font-bold text-purple-950 mb-2 font-headline">Educational Tools</h3>
                <p className="text-purple-900/80 text-xs sm:text-sm leading-relaxed">In-app interactive video player lessons, courses, and progress tracking.</p>
              </div>

              {/* Feature 7: Secure Platform (Teal/Jade) */}
              <div className="bg-gradient-to-br from-teal-50/90 via-white to-emerald-50/90 p-6 rounded-3xl border border-teal-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-left group">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">shield</span>
                </div>
                <h3 className="text-lg font-bold text-teal-950 mb-2 font-headline">Secure Platform</h3>
                <p className="text-teal-900/80 text-xs sm:text-sm leading-relaxed">Peer-to-peer WebRTC calls with enterprise-grade encryption and privacy protection.</p>
              </div>

              {/* Feature 8: Community Focused (Orange/Sun) */}
              <div className="bg-gradient-to-br from-orange-50/90 via-white to-amber-50/90 p-6 rounded-3xl border border-orange-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-left group">
                <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">groups</span>
                </div>
                <h3 className="text-lg font-bold text-orange-950 mb-2 font-headline">Community Focused</h3>
                <p className="text-orange-900/80 text-xs sm:text-sm leading-relaxed">Built hand-in-hand with Deaf educators and advocates across India.</p>
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
              <span className="px-3.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-black uppercase tracking-wider mb-3 inline-block">
                Real-World Impact
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0c1322] mb-3 font-headline">
                Where We Can Make a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4f46e5] to-[#ea580c]">Difference</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-[#334155] max-w-2xl mx-auto">
                A unified AI platform for accessibility across everyday environments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 relative z-20">
              
              {/* Schools & Colleges */}
              <div className="relative h-56 sm:h-64 rounded-3xl overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group border-2 border-indigo-200">
                <img
                  alt="Schools & Colleges"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDj35VlzhIT0WNloL6o-GP375DwoFP5BuoW2OHI4O-ieBylYnBDETldOKUqxF25jpJ1-FscykYx4-7ZwtTbJETxOGQuYEHjgJz5NClpnCa6BvC1U3R6KVeWnWau2HhQmZot3KXlDTE9N_zLUqOjBrKO_zI7tqbI3E4UYANpnevl-wSK7ANLAW2iBnFCIYC9HTMM83JmdEq6__M8MbfoWC2AwDPcJC0YW9Z2jLhMlp0xeJBFm-3wuhnm30ttfphiWtYaJfGcxST16dW5kQ"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322]/95 via-[#0c1322]/50 to-transparent transition-colors"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-end text-left">
                  <span className="px-2.5 py-0.5 bg-indigo-600 text-white rounded-md text-[10px] font-black uppercase tracking-wider mb-2 w-fit">
                    Education
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 font-headline">Schools &amp; Colleges</h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">Accessible classrooms with real-time lecture translation.</p>
                </div>
              </div>

              {/* Hospitals & Healthcare */}
              <div className="relative h-56 sm:h-64 rounded-3xl overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group border-2 border-emerald-200">
                <img
                  alt="Hospitals & Healthcare"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDM7sQ1JnyOZxJH_lzGy4OIN2PAO8LSCO1u0STXXT0PkrEdKT3ihi1R3CdYONk5pootivIVMGj48rYzO8AdNDzv_RO8AZ3DySvAyZPGLc1pWey9RCWR7fH44B6neK9Nyl8_dejLr9jcJFsvXgPT1Aj8iXHaUtsC2csbTCLCfh8c8ISDU8et50xKGSq0i0l-dpJssJFGvk7maMIe99s-IhP-vmkosXtyR3soYqpVuxiEvRwVeVrGbpVZEQ6-s3ZJzVulZJNmdm3Inzbedg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322]/95 via-[#0c1322]/50 to-transparent transition-colors"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-end text-left">
                  <span className="px-2.5 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-black uppercase tracking-wider mb-2 w-fit">
                    Healthcare
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 font-headline">Hospitals &amp; Healthcare</h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">Immediate patient-doctor communication without delay.</p>
                </div>
              </div>

              {/* Offices & Workplaces */}
              <div className="relative h-56 sm:h-64 rounded-3xl overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group border-2 border-purple-200">
                <img
                  alt="Offices & Workplaces"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQl0Mze-e_ofaHXmslRnaSo_JL3ZDy3ZmuyVC69DXU6xwt1DIx7UC0fpIQ0RCyFVRx3ZIj3gw3pooQokZbJ0AuzSseGVj9FvKJLAg3mEEe2NpSd_l6_kJr-TdxguvfLWUkBnqEKTTs2_DcwNo6sgtJ4pV5tBX40HWb0ajpibSztmZCHbo_8-5cDfe0WdtEl-vkSGjSUjfmpP2dtPrTJoj-INAPPWumPhTsbHQ_JkL2gy4CTcgcHb41WZgcO245TnZhPOW-5Y5J-TyiQg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322]/95 via-[#0c1322]/50 to-transparent transition-colors"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-end text-left">
                  <span className="px-2.5 py-0.5 bg-purple-600 text-white rounded-md text-[10px] font-black uppercase tracking-wider mb-2 w-fit">
                    Enterprise
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 font-headline">Offices &amp; Workplaces</h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">Inclusive hybrid meetings and collaboration.</p>
                </div>
              </div>

              {/* Communities & Public Spaces */}
              <div className="relative h-56 sm:h-64 rounded-3xl overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group border-2 border-cyan-200">
                <img
                  alt="Communities & Public Spaces"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9OWW7PlGXb13POAmqna6ZhX10V90VFN7gexxYokwspDiBIM_dBWsLk0WWfMCU3r6pFTxiR8W8mHySXBoatqI6Ju1m5F6-847lIulgXgiEtzkEm0JG1VbgA08lqBngp-RsN8lXthpLXZox25-lwfG_Y3784W7WzisURC2d7j6-izpdg3Mm7MwGASmC8Zo3rTEW95dfAgHvFnpjs7p4MEfEedC-ajdl3UVmXFLGccKunM-TBqveQ1TX"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322]/95 via-[#0c1322]/50 to-transparent transition-colors"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-end text-left">
                  <span className="px-2.5 py-0.5 bg-cyan-600 text-white rounded-md text-[10px] font-black uppercase tracking-wider mb-2 w-fit">
                    Public Services
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 font-headline">Public Services</h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">Access to essential citizen government portals.</p>
                </div>
              </div>

              {/* Businesses */}
              <div className="relative h-56 sm:h-64 rounded-3xl overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group border-2 border-amber-200">
                <img
                  alt="Businesses"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxMo8OdcyymvVyXrMeQEiIHc1_gW2zFcdRALbk4CCnz4QMdL7h7cHXSA5WVEyfeiggiFducQXjcchfOM_sVaYT0W_3UIw91Dg1iFbgLd4imgyHnl_nMmz3QOiIz4ZSk_BdREYjMjwuAikLaCs9lyj4VGUc6tkr-oXlsFAOUYCrN5fYkkPPzKWwtkkpeAAdM7AiCFoLZB9O7ks6NjLTQqkxE0y9dxQslsXIOHC0pF5WZaswg7UGWtiz-1QDACXuynyiHC9gc_NH7n0cKw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322]/95 via-[#0c1322]/50 to-transparent transition-colors"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-end text-left">
                  <span className="px-2.5 py-0.5 bg-amber-600 text-white rounded-md text-[10px] font-black uppercase tracking-wider mb-2 w-fit">
                    Commerce
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 font-headline">Businesses &amp; Retail</h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">Welcoming and accessible in-store customer service.</p>
                </div>
              </div>

              {/* Everyday Life */}
              <div className="relative h-56 sm:h-64 rounded-3xl overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group border-2 border-rose-200">
                <img
                  alt="Everyday Life"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuATJpQ_TUsB-ig8zrXOg8LGl5v1VKmxt4H6IT50ScEVL7lTXt4IWAutZbse5kml2bMFOoD330-aYgM_hECSX2e8JzEOP7YRL-53Aq-P7XK-8A9HyrjdAp7KKdDxdntkNf8kY0VyCk3Z6zQB-7LaRUk5x9G1is6MoH8b3b3UPBlwfA7Z_ulc_zRS0den3U9l1xDCATlzDFHk4x3AHHDRHkov_aYxBIourrrBK-R-o1y7EohCg_VUKqOvSOiRAXUQ5bQX7x8p4CKR7zVIZg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1322]/95 via-[#0c1322]/50 to-transparent transition-colors"></div>
                <div className="relative z-10 p-6 h-full flex flex-col justify-end text-left">
                  <span className="px-2.5 py-0.5 bg-rose-600 text-white rounded-md text-[10px] font-black uppercase tracking-wider mb-2 w-fit">
                    Community
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 font-headline">Everyday Life</h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">Making daily conversations spontaneous and natural.</p>
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
              <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider mb-3 inline-block">
                Voices of Sambhav
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0c1322] mb-2.5 font-headline">Beta Tester Feedback</h2>
              <p className="text-sm sm:text-base text-[#334155] font-body-lg">What our community is saying about the prototype.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1 (Emerald Theme) */}
              <div className="bg-gradient-to-b from-white to-emerald-50/50 rounded-3xl shadow-md overflow-hidden flex flex-col h-full border border-emerald-200 hover:shadow-xl transition-all duration-300">
                <div className="p-6 pb-14 flex-grow relative flex items-center justify-center text-center">
                  <p className="text-[#1e293b] text-sm sm:text-base italic leading-relaxed font-medium">
                    “Sambhav makes communication much easier and more inclusive. The ISL avatar is simple and helpful.”
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <img
                      alt="Avishek Raul"
                      className="w-14 h-14 rounded-full border-4 border-emerald-500 object-cover shadow-md"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAih-oeqLEzKEh5v1aD3o_vNApE-lnTw886yVND8nuDVCv76S3TaslpmDBHOIWhBDiGJckGkj4NfQUBX3LEU_6Oo2YidVrzNiX7jrGARDouQ5J-vb03EyUf__Pf7UWH4mWC3aJ_ho138XCdy3akTWfIlGmUMESRSYNO-l-j1U6WVSA6-d7ipoqmiirmMEx_sHV1anwI8fJewhSmfDP87TtRu1dbNr8WMN1TZfqlPG72L7m683A7r1bh"
                    />
                  </div>
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 pt-9 pb-5 text-center text-white relative">
                    <h4 className="font-bold text-sm sm:text-base mb-0.5 font-headline">Avishek Raul</h4>
                    <p className="text-[11px] text-emerald-100 uppercase tracking-wider font-bold">Community Beta Tester</p>
                  </div>
                </div>
              </div>

              {/* Card 2 (Indigo Theme) */}
              <div className="bg-gradient-to-b from-white to-indigo-50/50 rounded-3xl shadow-md overflow-hidden flex flex-col h-full border border-indigo-200 hover:shadow-xl transition-all duration-300">
                <div className="p-6 pb-14 flex-grow relative flex items-center justify-center text-center">
                  <p className="text-[#1e293b] text-sm sm:text-base italic leading-relaxed font-medium">
                    “I love how Sambhav turns information into Indian Sign Language. It makes technology feel accessible to everyone.”
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <img
                      alt="Subham Nayak"
                      className="w-14 h-14 rounded-full border-4 border-indigo-500 object-cover shadow-md"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgBIarNZp3rQ9e4dKmX9UrQTP1s-rz_gS8JvJX0c7xif7GauNnuUVYc165mn80xbLD5qzjpYMxT7-ZMWMIT-V_bYOv8KQp5p8I_69RoIRNybgOx4JDtMFRvPlnXHUWTZRVmjlzuczNdEryunkZkS-Q8Yv68bEWhIvnj3aKeHkurSG2_MF-Sl8GLlJKz6dTuUQzIzaodLo_9kWR8hfZts7043wPbU4t6tebdTKPiIIUkqTfZbO-CxvJ"
                    />
                  </div>
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 pt-9 pb-5 text-center text-white relative">
                    <h4 className="font-bold text-sm sm:text-base mb-0.5 font-headline">Subham Nayak</h4>
                    <p className="text-[11px] text-indigo-100 uppercase tracking-wider font-bold">Community Beta Tester</p>
                  </div>
                </div>
              </div>

              {/* Card 3 (Orange/Amber Theme) */}
              <div className="bg-gradient-to-b from-white to-orange-50/50 rounded-3xl shadow-md overflow-hidden flex flex-col h-full border border-orange-200 hover:shadow-xl transition-all duration-300">
                <div className="p-6 pb-14 flex-grow relative flex items-center justify-center text-center">
                  <p className="text-[#1e293b] text-sm sm:text-base italic leading-relaxed font-medium">
                    “Sambhav shows how technology can bring people closer by making communication more accessible for everyone.”
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <img
                      alt="Ananya Sharma"
                      className="w-14 h-14 rounded-full border-4 border-orange-500 object-cover shadow-md"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7zSAMdsHUBEh-OdUAeCWwrIg_LjSF-LErlS6pSMJyVq_hX99WZ9PX7tP2dAzxoL05TyRlo2fYQs46fxSFvvA5uYjoiSC_7rgiBE2TOy9Xb7FCBVezVt8xiQ9yc4dHLiEoSMNoHCq3ShvRGzAmzg9ljH4zcRHt6IrJ_1qCfXBRy4WL69v93wJ1EgmzmAcguix_8lxWQCjG2DTHto2964JWkeYHrzgAR1aN6Ge-1jAE9R2OADwbV0Qs"
                    />
                  </div>
                  <div className="bg-gradient-to-r from-orange-600 to-amber-600 pt-9 pb-5 text-center text-white relative">
                    <h4 className="font-bold text-sm sm:text-base mb-0.5 font-headline">Ananya Sharma</h4>
                    <p className="text-[11px] text-orange-100 uppercase tracking-wider font-bold">Community Beta Tester</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 9. MEET OUR TEAM                                                          */}
        {/* ------------------------------------------------------------------------- */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="text-left">
                <span className="px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black uppercase tracking-wider mb-3 inline-block">
                  The Innovators
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0c1322] mb-4 font-headline">
                  Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4f46e5] to-[#ea580c]">Team</span>
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-[#334155] leading-relaxed mb-4 font-body-lg">
                  We are a passionate team of engineers, designers, and accessibility advocates dedicated to bridging the communication gap. Together, we combine our expertise in AI and deep understanding of the Deaf community to create Sambhav.
                </p>
              </div>
              <div className="relative rounded-3xl shadow-xl border-4 border-indigo-200 overflow-hidden max-w-lg mx-auto lg:max-w-none">
                <img
                  alt="Sambhav Team"
                  className="w-full h-auto object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAR619udVh9TPr_uBuvwKPp2bMl9fMZ_hXnbJ4MnlpkFWGtRfwx9tW25FuZH3JJ5eI8O14ezBV9oXODCaXqYCJMPykR0gpQSUJTQ4wwt8c_Fwn0NjuhKkjibExPA5coorqz0UWbIqyLkQO9LRxq59cJv-PzxnhoRA7kOqGwbAmsMQ5S-SjPuqoyuepDUr5V5c-IdxuJizQ1iu8Tz1B8jr1dsYdo4H8NUWqLL1GxN2QW4xuqDXMrb7XSDH1Qitk4eUMT9Q"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------------- */}
        {/* 10. SUPPORT & CONTACT US                                                  */}
        {/* ------------------------------------------------------------------------- */}
        <section id="contact-section" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white/50 to-indigo-50/30 border-t border-indigo-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-12">
              <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-3 inline-block">
                Get In Touch
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c1322] mb-3 font-headline">
                We're Here to Help
              </h2>
              <p className="text-sm sm:text-base text-[#334155] max-w-2xl mx-auto">
                Reach out to our team for support with Sambhav's accessibility ecosystem.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              
              {/* Left Column: Contact Details */}
              <div className="bg-gradient-to-br from-white to-indigo-50/50 p-6 sm:p-8 rounded-3xl border border-indigo-100 shadow-md text-left">
                <h3 className="text-lg sm:text-xl font-bold text-[#0c1322] mb-6 font-headline">Contact Details</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-3.5 sm:space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="material-symbols-outlined text-xl">mail</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-[#0c1322]">E-mail</p>
                      <a className="block text-xs sm:text-sm text-indigo-700 font-medium hover:underline" href="mailto:support@sambhav.ai">support@sambhav.ai</a>
                      <a className="block text-xs sm:text-sm text-indigo-700 font-medium hover:underline" href="mailto:partnership@sambhav.ai">partnership@sambhav.ai</a>
                      <a className="block text-xs sm:text-sm text-indigo-700 font-medium hover:underline" href="mailto:info@sambhav.ai">info@sambhav.ai</a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3.5 sm:space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="material-symbols-outlined text-xl">call</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-[#0c1322]">Contact Numbers</p>
                      <p className="text-xs sm:text-sm text-emerald-800 font-medium">+91 7488152499</p>
                      <p className="text-xs sm:text-sm text-emerald-800 font-medium">+91 9348682617</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Send a Message Form */}
              <div className="bg-gradient-to-br from-white to-amber-50/50 p-6 sm:p-8 rounded-3xl border border-amber-100 shadow-md text-left">
                <h3 className="text-lg sm:text-xl font-bold text-[#0c1322] mb-6 font-headline">Send a Message</h3>
                {formSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center flex flex-col items-center gap-2 animate-fadeIn">
                    <span className="material-symbols-outlined text-4xl text-emerald-600">check_circle</span>
                    <h4 className="font-bold text-base font-headline">Message Sent Successfully!</h4>
                    <p className="text-xs text-emerald-700">Thank you for reaching out. Our accessibility team will contact you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[#1e293b] mb-1.5">Name</label>
                      <input
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none transition bg-white text-xs sm:text-sm shadow-xs"
                        placeholder="Your Full Name"
                        type="text"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[#1e293b] mb-1.5">Email</label>
                      <input
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none transition bg-white text-xs sm:text-sm shadow-xs"
                        placeholder="your@email.com"
                        type="email"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[#1e293b] mb-1.5">Message</label>
                      <textarea
                        required
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent outline-none transition resize-none bg-white text-xs sm:text-sm shadow-xs"
                        placeholder="How can we help you?"
                        rows={3}
                      />
                    </div>
                    <button
                      className="w-full bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#7c3aed] text-white font-bold py-3.5 rounded-xl hover:from-[#4338ca] hover:to-[#6d28d9] transition-all shadow-md hover:shadow-lg cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-1.5"
                      type="submit"
                    >
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Send Message</span>
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* ------------------------------------------------------------------------- */}
      {/* 11. FOOTER                                                                */}
      {/* ------------------------------------------------------------------------- */}
      <footer className="bg-[#0c1322] text-slate-300 border-t border-slate-800 pt-14 pb-8 text-left">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-8 sm:gap-10 mb-10">
            
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center space-x-2.5 mb-4 cursor-pointer text-left group"
              >
                <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#fe9832] to-[#4f46e5]">
                  <img
                    alt="SAMBHAV Circular Logo Icon"
                    className="h-8 w-8 rounded-full object-contain bg-white"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTg0HBcA_4tr0W91LDkwqOnVSfSNqNLfncEA1PPwyGzu5JLTBXpp_wsXkZjo9tzLvf4KFNyaXk060fIQSGUovqRqh34LlLcrxxAUa5VojHfDfu4jRQJGk6QxnzQbHigwRz16MDMj2DwoCRu_i77QAzKuRLVJ8e2mLUwC7-UvMJ_JB5sui2SpIRfZM5c9yAP4gD3yTYgJBzlXm_PtIyr70gHi3MkHGC95pbUZ_Mid5Kj_my4OpeXflK15WPybnDecsYaov545CM4kLxeQ"
                  />
                </div>
                <span className="text-2xl font-black tracking-tight text-white font-headline">Sambhav</span>
              </button>
              <p className="text-xs sm:text-sm text-slate-400 mb-4 leading-relaxed max-w-sm">
                Empowering the Deaf and hard-of-hearing community across India through next-gen AI translation.
              </p>
              <div className="mb-6">
                <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Connect with us</p>
                <div className="flex flex-col space-y-2">
                  <a className="flex items-center text-xs sm:text-sm text-slate-300 hover:text-indigo-400 transition-colors" href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
                    LinkedIn
                  </a>
                  <a className="flex items-center text-xs sm:text-sm text-slate-300 hover:text-orange-400 transition-colors" href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                    <span className="material-symbols-outlined text-base mr-2">photo_camera</span>
                    Instagram
                  </a>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LOCATION</p>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xs">Institute of Technical Education &amp; Research, Jagamara, Bhubaneswar - 751030</p>
                </div>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-xs font-bold text-indigo-400 tracking-widest uppercase mb-3 sm:mb-4">Product</h3>
              <ul className="space-y-2.5">
                <li>
                  <button type="button" onClick={() => scrollTo('how-it-works-section')} className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
                    How it Works ?
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/explore')} className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
                    Community
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/history')} className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
                    Testimonials
                  </button>
                </li>
              </ul>
            </div>

            {/* Solutions Links */}
            <div>
              <h3 className="text-xs font-bold text-emerald-400 tracking-widest uppercase mb-3 sm:mb-4">Solutions</h3>
              <ul className="space-y-2.5">
                <li>
                  <button type="button" onClick={() => navigate('/learn-isl')} className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
                    Educational Institutions
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/explore')} className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
                    Public Services
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/communicate')} className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
                    Healthcare
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/translate')} className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
                    Enterprise
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/dashboard')} className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
                    Digital Platforms
                  </button>
                </li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-3 sm:mb-4">Resources</h3>
              <ul className="space-y-2.5">
                <li>
                  <button type="button" onClick={() => navigate('/learn-isl')} className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
                    ISL Learning Videos
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollTo('problem-section')} className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
                    Challenges People Face
                  </button>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-xs font-bold text-rose-400 tracking-widest uppercase mb-3 sm:mb-4">Company</h3>
              <ul className="space-y-2.5">
                <li>
                  <button type="button" onClick={() => scrollTo('problem-section')} className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
                    Our Mission
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollTo('contact-section')} className="text-xs sm:text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>

          </div>

          {/* Large background watermark */}
          <div className="pt-6 border-t border-slate-800 text-center">
            <p className="text-xs sm:text-sm text-slate-400">© 2026 Sambhav Accessibility AI. All rights reserved.</p>
          </div>
          
          <div className="mt-8 select-none relative md:h-32 flex items-center justify-center h-20 opacity-15 pointer-events-none">
            <span className="text-[56px] sm:text-[80px] font-extrabold tracking-widest md:text-[150px] text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-orange-500 font-headline" style={{ letterSpacing: '-0.05em' }}>
              Sambhav
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
