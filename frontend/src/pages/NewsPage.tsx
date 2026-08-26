import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

export interface NewsArticle {
  id: number;
  title: string;
  category: string;
  date: string;
  readTime: string;
  summary: string;
  imageUrl: string;
  content: string[];
  keyPoints: string[];
}

export interface ArticleWordToken {
  globalIndex: number;
  word: string;
  cleanToken: string;
  section: 'title' | 'paragraph';
  paragraphIndex?: number;
  wordIndex: number;
}

const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 1,
    title: 'National ISL Standardization Framework Announced by Education Ministry',
    category: 'Policy & Inclusion',
    date: 'August 14, 2026',
    readTime: '4 min read',
    summary: 'New guidelines aim to standardize 10,000+ technical and higher-education terms in Indian Sign Language across universities.',
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80',
    content: [
      'The Ministry of Education, in partnership with the Indian Sign Language Research and Training Centre (ISLRTC), has officially unveiled a nationwide framework to standardize technical terms in Indian Sign Language (ISL).',
      'The initiative introduces over 10,000 standardized signs covering computer science, STEM fields, legal jurisprudence, and medical sciences, allowing Deaf students to pursue specialized collegiate degrees with full linguistic support.',
      'Under the new policy, all accredited universities and vocational centers will receive digital accessible curriculum kits, featuring 3D avatar animations and synchronized sign videos to assist educators in real time.',
      'Accessibility advocates across India have praised the move as a historic milestone for educational equity and inclusive digital public infrastructure.',
    ],
    keyPoints: [
      'Over 10,000 standardized technical and higher-education sign glosses added.',
      'Covers Computer Science, STEM, Medicine, and Law curricula.',
      'Universities to deploy 3D avatar assistive tools for real-time lecture translation.',
      'Full compliance with the Rights of Persons with Disabilities (RPwD) Act.',
    ],
  },
  {
    id: 2,
    title: 'AI-Powered Assistive Technology Reaches Rural Schools in Karnataka & Maharashtra',
    category: 'Technology',
    date: 'August 10, 2026',
    readTime: '3 min read',
    summary: 'Pilot programs deploying real-time sign language synthesis and live classroom captioning report a 40% increase in student engagement.',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
    content: [
      'A multi-state pilot program implementing real-time AI sign language translation devices has shown remarkable success in rural schools across Karnataka and Maharashtra.',
      'Teachers equipped with lightweight edge-computing tablets can speak naturally in Kannada, Marathi, or English, while an on-screen ISL avatar renders accurate grammatical sign sequences for Deaf pupils.',
      'Early assessment results show a 40% improvement in classroom comprehension and active participation among young learners who previously had limited access to certified sign interpreters.',
      'State education departments are now planning to expand the program to over 500 rural primary schools before the upcoming academic session.',
    ],
    keyPoints: [
      'Real-time edge AI tablets deployed in rural primary schools.',
      'Multi-lingual speech to ISL translation in Kannada, Marathi, and English.',
      '40% measured increase in student comprehension and engagement.',
      'Expansion planned to 500+ rural schools in next academic year.',
    ],
  },
  {
    id: 3,
    title: 'Global Deaf Youth Leadership Summit 2026 Highlights Accessible Communication Tools',
    category: 'Community',
    date: 'July 28, 2026',
    readTime: '5 min read',
    summary: 'Delegates from 20+ countries gathered to share open-source accessibility software and advocacy strategies.',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80',
    content: [
      'The Global Deaf Youth Leadership Summit concluded this week with over 300 young leaders from 20 nations sharing innovations in assistive technology and human rights advocacy.',
      'Keynote presentations emphasized the growing impact of web-first WebRTC video calling with integrated sign synthesis, enabling cross-border collaboration without expensive specialized hardware.',
      'Youth leaders drafted an international charter urging tech platforms to make bidirectional sign translation an open public good accessible to all.',
    ],
    keyPoints: [
      '300+ youth leaders and developers from 20 countries participated.',
      'Focus on open-source WebRTC communication and real-time sign synthesis.',
      'Adoption of International Youth Accessibility Charter.',
    ],
  },
];

export const NewsPage: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Avatar continuous reading state
  const [isAvatarPlaying, setIsAvatarPlaying] = useState<boolean>(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [speechActive, setSpeechActive] = useState<boolean>(false);

  // Active word reference for smooth auto-scroll into view
  const activeWordRef = useRef<HTMLSpanElement | null>(null);

  // Flatten the entire article into ordered word tokens
  const articleTokens: ArticleWordToken[] = useMemo(() => {
    if (!selectedArticle) return [];
    const tokens: ArticleWordToken[] = [];
    let globalCounter = 0;

    // 1. Title tokens
    const titleWords = selectedArticle.title.trim().split(/\s+/);
    titleWords.forEach((word, wIdx) => {
      tokens.push({
        globalIndex: globalCounter++,
        word,
        cleanToken: word.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(),
        section: 'title',
        wordIndex: wIdx,
      });
    });

    // 2. Paragraph tokens
    selectedArticle.content.forEach((paragraph, pIdx) => {
      const pWords = paragraph.trim().split(/\s+/);
      pWords.forEach((word, wIdx) => {
        tokens.push({
          globalIndex: globalCounter++,
          word,
          cleanToken: word.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(),
          section: 'paragraph',
          paragraphIndex: pIdx,
          wordIndex: wIdx,
        });
      });
    });

    return tokens;
  }, [selectedArticle]);

  // Step through article words during playback
  useEffect(() => {
    if (!isAvatarPlaying || articleTokens.length === 0) return;
    const intervalMs = Math.round(550 / playbackSpeed);

    const timer = setInterval(() => {
      setCurrentWordIndex((prev) => {
        if (prev >= articleTokens.length - 1) {
          setIsAvatarPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isAvatarPlaying, playbackSpeed, articleTokens.length]);

  // Keep active green highlighted word visible inside article text
  useEffect(() => {
    if (isAvatarPlaying && activeWordRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [currentWordIndex, isAvatarPlaying]);

  // Handle Speech narration toggle
  const handleToggleSpeech = useCallback(() => {
    if (!selectedArticle) return;
    if (speechActive) {
      window.speechSynthesis.cancel();
      setSpeechActive(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${selectedArticle.title}. ${selectedArticle.content.join(' ')}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = playbackSpeed;
      utterance.onend = () => setSpeechActive(false);
      utterance.onerror = () => setSpeechActive(false);
      window.speechSynthesis.speak(utterance);
      setSpeechActive(true);
    }
  }, [selectedArticle, speechActive, playbackSpeed]);

  const handleOpenArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    setIsAvatarPlaying(false);
    setCurrentWordIndex(0);
    window.speechSynthesis.cancel();
    setSpeechActive(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
    setIsAvatarPlaying(false);
    setCurrentWordIndex(0);
    window.speechSynthesis.cancel();
    setSpeechActive(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Jump avatar playback directly to any clicked word
  const handleWordClick = (globalIdx: number) => {
    setCurrentWordIndex(globalIdx);
    setIsAvatarPlaying(true);
  };

  const currentToken = articleTokens[currentWordIndex] || null;

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1440px] mx-auto animate-fadeIn font-['Inter',sans-serif] pb-24 px-2 sm:px-4">
      
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* VIEW A: FULL ARTICLE DETAIL VIEW WITH EXPANDED 3D SIGN AVATAR       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {selectedArticle ? (
        <div className="flex flex-col gap-6 animate-fadeIn">
          
          {/* Top Navigation & Action Header */}
          <div className="flex items-center justify-between gap-4 bg-white dark:bg-[#151c28] p-4 sm:p-5 rounded-3xl border border-[#e0e3e5] dark:border-[#243044] shadow-sm">
            <div className="flex items-center gap-3.5">
              <button
                onClick={handleBackToList}
                className="w-10 h-10 rounded-2xl bg-[#f8fafc] dark:bg-[#0c121e] hover:bg-[#fe9832]/10 border border-[#e0e3e5] dark:border-[#243044] hover:border-[#fe9832] text-[#fe9832] flex items-center justify-center transition-all group shrink-0"
                title="Back to All Articles"
              >
                <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-0.5 transition-transform">
                  arrow_back
                </span>
              </button>
              <div>
                <span className="text-[10px] font-bold text-[#828796] uppercase tracking-wider">
                  Accessibility News &bull; {selectedArticle.category}
                </span>
                <p className="text-xs text-[#030813] dark:text-[#c1c6d7] font-bold truncate max-w-xs sm:max-w-md md:max-w-lg">
                  {selectedArticle.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleSpeech}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  speechActive
                    ? 'bg-[#8dfc75] text-[#012700] border-[#8dfc75]'
                    : 'bg-[#f8fafc] dark:bg-[#0c121e] text-[#030813] dark:text-white border-[#e0e3e5] dark:border-[#243044] hover:border-[#fe9832]'
                }`}
                title="Listen to Spoken Audio"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {speechActive ? 'volume_up' : 'volume_mute'}
                </span>
                <span className="hidden sm:inline">{speechActive ? 'Speaking...' : 'Listen Voice'}</span>
              </button>

              <button
                onClick={() => setIsAvatarPlaying(!isAvatarPlaying)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm ${
                  isAvatarPlaying
                    ? 'bg-gradient-to-r from-[#fe9832] to-[#e8872b] text-[#542900]'
                    : 'bg-[#fe9832]/15 text-[#fe9832] hover:bg-[#fe9832] hover:text-[#542900]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isAvatarPlaying ? 'pause_circle' : 'sign_language'}
                </span>
                <span>{isAvatarPlaying ? 'Pause Sign Reader' : 'Play ISL Sign'}</span>
              </button>
            </div>
          </div>

          {/* Dedicated 2-Section Grid: Left (5 Cols) Article Text & Details | Right (7 Cols) Huge 3D Avatar Arena */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ========================================================================= */}
            {/* LEFT SECTION: ARTICLE TEXT, MEDIA & LIVE IN-TEXT GREEN WORD HIGHLIGHT (5 cols) */}
            {/* ========================================================================= */}
            <article className="lg:col-span-5 bg-white dark:bg-[#151c28] rounded-3xl p-6 sm:p-7 border border-[#e0e3e5] dark:border-[#243044] shadow-sm flex flex-col gap-6 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
              
              {/* Header Details */}
              <div className="flex flex-col gap-3 border-b border-[#e0e3e5] dark:border-[#243044] pb-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1 bg-[#fe9832]/10 border border-[#fe9832]/20 text-[#fe9832] font-black rounded-full text-[10px] uppercase tracking-wider">
                    {selectedArticle.category}
                  </span>
                  <span className="text-[#828796]">&bull;</span>
                  <span className="text-[#828796] font-medium">{selectedArticle.date}</span>
                  <span className="text-[#828796]">&bull;</span>
                  <span className="text-[#828796] font-medium">{selectedArticle.readTime}</span>
                </div>

                {/* Article Title with Live Green Word Highlighting */}
                <h1 className="text-lg sm:text-xl font-black text-[#030813] dark:text-white tracking-tight leading-snug">
                  {articleTokens
                    .filter((t) => t.section === 'title')
                    .map((t) => {
                      const isCurrent = t.globalIndex === currentWordIndex;
                      return (
                        <span
                          key={`title-${t.wordIndex}`}
                          ref={isCurrent ? activeWordRef : null}
                          onClick={() => handleWordClick(t.globalIndex)}
                          className={`cursor-pointer transition-all duration-150 inline-block mr-1.5 ${
                            isCurrent
                              ? 'bg-[#8dfc75] text-[#012700] font-black px-1.5 py-0.5 rounded-lg shadow-sm ring-2 ring-emerald-400 scale-105'
                              : 'hover:text-[#fe9832]'
                          }`}
                        >
                          {t.word}
                        </span>
                      );
                    })}
                </h1>
              </div>

              {/* Article Hero Image */}
              <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-sm border border-[#e0e3e5] dark:border-[#243044] relative">
                <img
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Key Takeaways Callout */}
              <div className="p-4 rounded-2xl bg-[#fe9832]/5 border border-[#fe9832]/20 flex flex-col gap-2">
                <span className="text-xs font-black text-[#fe9832] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px]">verified</span>
                  <span>Key Article Takeaways</span>
                </span>
                <ul className="space-y-1 text-xs text-[#030813] dark:text-[#c1c6d7]">
                  {selectedArticle.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#fe9832] font-bold mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Full Paragraphs with Word-by-Word Live Green Highlight */}
              <div className="flex flex-col gap-4 text-sm text-[#030813] dark:text-[#c1c6d7] leading-relaxed font-normal">
                {selectedArticle.content.map((_, pIdx) => {
                  const pTokens = articleTokens.filter(
                    (t) => t.section === 'paragraph' && t.paragraphIndex === pIdx
                  );
                  return (
                    <p key={`p-${pIdx}`} className="leading-relaxed">
                      {pTokens.map((t) => {
                        const isCurrent = t.globalIndex === currentWordIndex;
                        return (
                          <span
                            key={`word-${t.globalIndex}`}
                            ref={isCurrent ? activeWordRef : null}
                            onClick={() => handleWordClick(t.globalIndex)}
                            className={`cursor-pointer transition-all duration-150 inline-block mr-1.5 ${
                              isCurrent
                                ? 'bg-[#8dfc75] text-[#012700] font-black px-1.5 py-0.5 rounded-lg shadow-sm ring-2 ring-emerald-400 scale-105'
                                : 'hover:text-[#fe9832]'
                            }`}
                          >
                            {t.word}
                          </span>
                        );
                      })}
                    </p>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-[#e0e3e5] dark:border-[#243044] text-[11px] text-[#828796] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-500">touch_app</span>
                <span>Click any word above to jump the 3D Sign Avatar to that exact sentence.</span>
              </div>
            </article>

            {/* ========================================================================= */}
            {/* RIGHT SECTION: EXPANDED SPATIAL 3D ISL AVATAR PLAYER (7 cols - Max Space) */}
            {/* ========================================================================= */}
            <aside className="lg:col-span-7 flex flex-col gap-3 sticky top-6">
              <div className="bg-white dark:bg-[#151c28] rounded-3xl p-4 sm:p-5 border border-[#fe9832]/40 shadow-xl flex flex-col gap-3">
                
                {/* Ultra-Compact Header */}
                <div className="flex items-center justify-between border-b border-[#e0e3e5] dark:border-[#243044] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#fe9832] text-[20px]">accessibility_new</span>
                    <h3 className="text-xs sm:text-sm font-black text-[#030813] dark:text-white tracking-wide">
                      3D ISL Sign Avatar Reader
                    </h3>
                  </div>

                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[#8dfc75]">
                    Full Sync
                  </span>
                </div>

                {/* EXPANDED 3D AVATAR ARENA (Maximized Length & Breadth) */}
                <div className="w-full min-h-[480px] sm:min-h-[560px] lg:min-h-[600px] bg-gradient-to-br from-[#080e1b] via-[#101a2d] to-[#04070d] rounded-2xl overflow-hidden relative border border-white/15 shadow-2xl flex flex-col justify-between p-5 text-white">
                  
                  {/* Top Status & Token Progress */}
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[11px] font-mono font-bold bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl border border-white/15 shadow-sm">
                      Word {currentWordIndex + 1} / {articleTokens.length}
                    </span>

                    <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1 rounded-xl border border-white/15 text-[11px]">
                      <span className={`w-2 h-2 rounded-full ${isAvatarPlaying ? 'bg-[#8dfc75] animate-ping' : 'bg-amber-400'}`} />
                      <span className="font-bold">{isAvatarPlaying ? 'Signing...' : 'Ready'}</span>
                    </div>
                  </div>

                  {/* Spacious 3D Avatar Center Figure Stage */}
                  <div className="my-auto flex flex-col items-center justify-center text-center gap-4 relative py-6">
                    <div className="relative">
                      {/* Avatar Figure Frame */}
                      <div className={`w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-[#fe9832]/30 via-emerald-500/20 to-[#fe9832]/25 border-2 border-[#fe9832]/60 flex items-center justify-center shadow-2xl transition-all duration-300 ${isAvatarPlaying ? 'scale-105 shadow-[#fe9832]/40 ring-4 ring-[#8dfc75]/40' : ''}`}>
                        <span className={`material-symbols-outlined text-8xl sm:text-9xl text-[#fe9832] transition-transform duration-300 ${isAvatarPlaying ? 'animate-pulse scale-110' : ''}`}>
                          sign_language
                        </span>
                      </div>
                      
                      {/* Active Hands Badge */}
                      {isAvatarPlaying && (
                        <span className="absolute -bottom-2 right-2 px-3.5 py-1 rounded-full bg-[#8dfc75] text-[#012700] font-black text-xs shadow-lg animate-bounce">
                          ISL Sign Morphology Active
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base sm:text-lg font-black text-white tracking-wide">
                        SAMBHAV Neural ISL 3D Avatar
                      </h4>
                      <p className="text-xs text-[#c1c6d7] font-medium mt-0.5">
                        High-Definition Facial Expressions, Body Pose &amp; ISLRTC Handshapes
                      </p>
                    </div>
                  </div>

                  {/* Synchronized Live Sign Gloss Display Banner */}
                  <div className="bg-black/85 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center flex flex-col gap-1 shadow-xl">
                    <span className="text-[10px] uppercase tracking-widest text-[#fe9832] font-black">
                      Current Sign Token
                    </span>
                    <span className="font-mono text-xl sm:text-2xl font-black text-[#8dfc75] tracking-widest">
                      [{currentToken?.cleanToken || 'IDLE'}]
                    </span>
                  </div>
                </div>

                {/* Avatar Control Deck */}
                <div className="flex flex-col gap-3.5 pt-1">
                  
                  {/* Article Reading Progress Slider */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-[#828796]">
                      <span>Reading Progress</span>
                      <span>{Math.round(((currentWordIndex + 1) / (articleTokens.length || 1)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-[#f1f4f6] dark:bg-[#0c121e] rounded-full h-3 overflow-hidden border border-[#e0e3e5] dark:border-[#243044]">
                      <div
                        className="bg-gradient-to-r from-[#fe9832] via-emerald-400 to-[#8dfc75] h-full transition-all duration-200"
                        style={{
                          width: `${((currentWordIndex + 1) / (articleTokens.length || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Play / Pause / Replay & Speed Controls */}
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => setIsAvatarPlaying(!isAvatarPlaying)}
                      className="flex-1 py-3.5 bg-gradient-to-r from-[#fe9832] to-[#e8872b] hover:brightness-110 text-[#542900] font-black text-xs sm:text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[22px]">
                        {isAvatarPlaying ? 'pause' : 'play_arrow'}
                      </span>
                      <span>{isAvatarPlaying ? 'Pause Sign Reader' : 'Play Sign Reader'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentWordIndex(0);
                        setIsAvatarPlaying(true);
                      }}
                      className="px-4 py-3.5 bg-[#f8fafc] dark:bg-[#0c121e] hover:bg-[#fe9832]/10 border border-[#e0e3e5] dark:border-[#243044] text-[#030813] dark:text-white rounded-2xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
                      title="Restart reading from start"
                    >
                      <span className="material-symbols-outlined text-[18px]">replay</span>
                      <span className="hidden sm:inline">Restart</span>
                    </button>

                    {/* Speed Selector */}
                    <div className="flex items-center bg-[#f8fafc] dark:bg-[#0c121e] border border-[#e0e3e5] dark:border-[#243044] rounded-2xl p-1">
                      {[0.75, 1.0, 1.25].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => setPlaybackSpeed(speed)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            playbackSpeed === speed
                              ? 'bg-[#fe9832] text-[#542900] shadow-xs font-black'
                              : 'text-[#45474c] dark:text-[#828796] hover:text-[#030813] dark:hover:text-white'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </aside>

          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────────── */
        /* VIEW B: ALL NEWS ARTICLES GRID                                     */
        /* ─────────────────────────────────────────────────────────────────── */
        <>
          {/* Header */}
          <header className="flex flex-col gap-2 border-b border-[#e0e3e5] dark:border-[#243044] pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#fe9832] to-[#e8872b] text-[#542900] flex items-center justify-center font-black shadow-md shrink-0">
                <span className="material-symbols-outlined text-[28px]">newspaper</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#030813] dark:text-white tracking-tight flex items-center gap-2.5">
                  <span>Accessibility &amp; ISL News</span>
                  <span className="text-xs font-bold text-[#fe9832] bg-[#fe9832]/10 border border-[#fe9832]/20 px-2.5 py-0.5 rounded-full">
                    Live Bulletins
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-[#45474c] dark:text-[#c1c6d7] mt-0.5 font-medium">
                  Stay updated on Indian Sign Language policies, assistive technology breakthroughs, and community announcements.
                </p>
              </div>
            </div>
          </header>

          {/* Featured News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {NEWS_ARTICLES.map((item) => (
              <article
                key={item.id}
                onClick={() => handleOpenArticle(item)}
                className="bg-white dark:bg-[#151c28] rounded-3xl overflow-hidden border border-[#e0e3e5] dark:border-[#243044] shadow-sm hover:shadow-md hover:border-[#fe9832] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              >
                <div className="aspect-video bg-[#030813] overflow-hidden relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-full border border-white/20">
                    {item.category}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-medium text-[#45474c] dark:text-[#828796] mb-2">
                      <span>{item.date}</span>
                      <span>{item.readTime}</span>
                    </div>
                    <h2 className="text-sm sm:text-base font-bold text-[#181c1e] dark:text-white leading-snug group-hover:text-[#fe9832] transition-colors line-clamp-2">
                      {item.title}
                    </h2>
                    <p className="text-xs text-[#45474c] dark:text-[#828796] leading-relaxed line-clamp-3 mt-2 font-medium">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-bold text-[#fe9832]">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">sign_language</span>
                      <span>Read Article &amp; ISL Sign</span>
                    </span>
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

    </div>
  );
};

export default NewsPage;
