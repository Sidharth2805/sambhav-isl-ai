import React from 'react';
import { useNavigate } from 'react-router-dom';

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();

  const updates = [
    {
      version: 'v2.4.0 (Current Stable)',
      date: 'August 2026',
      tag: 'New Features',
      title: 'Speech-to-Sign Pipeline Optimization & Live Captions',
      description: 'Upgraded translation engine with lower latency Web Speech integration and bidirectional real-time preview.',
    },
    {
      version: 'v2.1.0',
      date: 'July 2026',
      tag: 'Security & WebRTC',
      title: 'Adaptive Video Calls & 1-on-1 ISL Communication Studio',
      description: 'Strengthened LiveKit WebRTC security, automatic call cleanup on disconnect, and responsive portrait-first mobile view.',
    },
    {
      version: 'v2.0.0',
      date: 'June 2026',
      tag: 'Core Platform',
      title: 'SAMBHAV Platform Public Launch',
      description: 'Official introduction of AI-powered Indian Sign Language interpretation, interactive avatars, and dual user workspaces.',
    },
  ];

  const features = [
    {
      icon: 'videocam',
      title: 'Real-Time Remote Calling',
      description: 'Ultra-low latency audio/video calling powered by LiveKit WebRTC with synchronized multi-participant sign rendering.',
      route: '/communicate',
    },
    {
      icon: 'translate',
      title: '2-Way Live ISL Studio',
      description: 'Instant conversion between Spoken Hindi/English and Indian Sign Language adhering to visual-spatial syntax.',
      route: '/translate',
    },
    {
      icon: 'school',
      title: 'Interactive ISL Learning Hub',
      description: 'Structured video curricula, ISL gesture library, and progress tracking for students and educators.',
      route: '/learn-isl',
    },
    {
      icon: 'newspaper',
      title: 'Accessible News with 3D Avatar Reader',
      description: 'Daily national bulletins translated directly into ISL signs with synchronized text-to-sign avatar interpretation.',
      route: '/news',
    },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1240px] mx-auto animate-fadeIn font-['Inter',sans-serif] pb-16">
      
      {/* Header Banner - DISCOVER SAMBHAV (Enhanced brand palette) */}
      <header className="relative bg-gradient-to-br from-[#0c1527] via-[#151f33] to-[#070b14] text-white rounded-3xl p-8 md:p-12 shadow-xl border border-[#fe9832]/30 overflow-hidden">
        {/* Glow Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#fe9832]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#8dfc75]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl flex flex-col gap-3.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#fe9832]/20 border border-[#fe9832]/40 rounded-full text-[11px] font-black uppercase tracking-widest text-[#fe9832]">
              Discover SAMBHAV
            </span>
            <span className="px-3 py-1 bg-[#8dfc75]/15 border border-[#8dfc75]/30 rounded-full text-[11px] font-black uppercase tracking-widest text-[#8dfc75]">
              Accessibility AI
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-white mt-1">
            Bridging India’s Communication Frontier
          </h1>

          <p className="text-sm md:text-base text-[#c1c6d7] leading-relaxed font-medium">
            SAMBHAV is engineered to break down barriers between the 18+ million Deaf community in India and the hearing world through cutting-edge multimodal AI, LiveKit WebRTC, and universally accessible UX.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => navigate('/communicate')}
              className="px-6 py-3 bg-gradient-to-r from-[#fe9832] to-[#e8872b] hover:brightness-110 text-[#542900] font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">videocam</span>
              <span>Launch Calling Studio</span>
            </button>

            <button
              onClick={() => navigate('/translate')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">translate</span>
              <span>Open ISL Translator</span>
            </button>
          </div>
        </div>
      </header>

      {/* About Indian Sign Language Section */}
      <section className="bg-white dark:bg-[#151c28] rounded-3xl p-6 md:p-8 border border-[#e0e3e5] dark:border-[#243044] shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-3 border-b border-[#e0e3e5] dark:border-[#243044] pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#fe9832]/10 text-[#fe9832] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[24px]">lightbulb</span>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#030813] dark:text-white">
              About Indian Sign Language (ISL)
            </h2>
            <p className="text-xs text-[#45474c] dark:text-[#828796]">
              A complete visual-spatial linguistic ecosystem recognized by the Government of India.
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#45474c] dark:text-[#c1c6d7] leading-relaxed font-medium">
          Indian Sign Language (ISL) is a complete, natural visual-spatial language with its own rich syntax, morphology, and grammar. Unlike spoken English or Hindi which follow Subject-Verb-Object (SVO) structures, ISL emphasizes visual context with Time-First structures (Time → Topic → Object → Verb) and spatial directional movements.
        </p>
      </section>

      {/* Key Platform Capabilities */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-[#030813] dark:text-white tracking-tight">
            Platform Capabilities
          </h2>
          <span className="text-xs font-bold text-[#fe9832] bg-[#fe9832]/10 px-3 py-1 rounded-full border border-[#fe9832]/20">
            Core Modules
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              onClick={() => navigate(f.route)}
              className="bg-white dark:bg-[#151c28] rounded-3xl p-6 border border-[#e0e3e5] dark:border-[#243044] shadow-xs hover:shadow-md hover:border-[#fe9832] hover:-translate-y-1 transition-all flex flex-col justify-between gap-4 cursor-pointer group"
            >
              <div className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#fe9832]/10 group-hover:bg-[#fe9832] text-[#fe9832] group-hover:text-[#542900] flex items-center justify-center transition-all duration-300 shadow-inner">
                  <span className="material-symbols-outlined text-[26px]">{f.icon}</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#181c1e] dark:text-white group-hover:text-[#fe9832] transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs text-[#45474c] dark:text-[#828796] leading-relaxed font-medium">
                  {f.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-[#fe9832] pt-3 border-t border-black/5 dark:border-white/5">
                <span>Explore Feature</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Updates & Releases Timeline */}
      <section className="bg-white dark:bg-[#151c28] rounded-3xl p-6 md:p-8 border border-[#e0e3e5] dark:border-[#243044] shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-[#e0e3e5] dark:border-[#243044] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#8dfc75] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">history_toggle_off</span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#030813] dark:text-white">
                Release Timeline &amp; Changelog
              </h2>
              <p className="text-xs text-[#45474c] dark:text-[#828796]">
                Latest updates, security enhancements, and model updates deployed to Sambhav.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {updates.map((u, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#f8fafc] dark:bg-[#0c121e] border border-[#e0e3e5] dark:border-[#243044] flex flex-col gap-2"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#030813] dark:text-white">{u.version}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fe9832]/10 text-[#fe9832] border border-[#fe9832]/20">
                    {u.tag}
                  </span>
                </div>
                <span className="text-[11px] text-[#45474c] dark:text-[#828796] font-medium">{u.date}</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#030813] dark:text-white">{u.title}</h4>
              <p className="text-xs text-[#45474c] dark:text-[#828796] leading-relaxed">{u.description}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default ExplorePage;
