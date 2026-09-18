import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAccessibility } from '../hooks/useAccessibility';
import { ISLAvatarCanvas, type ISLAvatarCanvasRef } from '../components/cultural/ISLAvatarCanvas';

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
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
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
  {
    id: 4,
    title: 'Hospital Emergency Wards Deploy 24/7 AI-Assisted ISL Interpretation in 50 Cities',
    category: 'Healthcare Accessibility',
    date: 'August 18, 2026',
    readTime: '3 min read',
    summary: 'Emergency medical centers integrate real-time sign translation kiosks to guarantee immediate communication between Deaf patients and doctors.',
    imageUrl: '/images/healthcare.jpg',
    content: [
      'A coalition of top public and private healthcare networks has launched 24/7 ISL video interpretation kiosks in emergency triage units across 50 metropolitan cities.',
      'The specialized kiosks allow emergency physicians and triage nurses to communicate with Deaf patients instantly using zero-latency WebRTC links and Sambhav BiLSTM AI sign interpretation.',
      'Hospital administrations reported a 75% reduction in diagnostic triage delays during critical emergency intake admissions.',
    ],
    keyPoints: [
      '24/7 instant sign interpretation kiosks deployed in 50+ city hospitals.',
      'Zero-latency emergency medical triage for Deaf patients.',
      '75% reduction in intake communication delays.',
    ],
  },
  {
    id: 5,
    title: 'Public Sector Banks Roll Out Accessible Video-Banking with Real-Time ISL Interpretation',
    category: 'Financial Inclusion',
    date: 'August 04, 2026',
    readTime: '4 min read',
    summary: 'Over 12,000 branch kiosks now enable Deaf customers to conduct banking transactions independently using WebRTC sign video feeds.',
    imageUrl: '/images/banking.jpg',
    content: [
      'Major public sector banks across India have begun rolling out accessible digital banking terminals featuring built-in Indian Sign Language video interpretation.',
      'Deaf customers can now independently open accounts, manage loans, and resolve banking inquiries with clear visual sign support on high-definition touch displays.',
      'The initiative has been recognized by the Reserve Bank of India as a benchmark standard for accessible financial infrastructure.',
    ],
    keyPoints: [
      'Accessible video-banking terminals live across 12,000+ branches.',
      'End-to-end ISL customer support for banking and loan services.',
      'Certified as a national accessibility standard by the Reserve Bank of India.',
    ],
  },
];

export const NewsPage: React.FC = () => {
  const { t } = useAccessibility();
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Avatar continuous reading state
  const [isAvatarPlaying, setIsAvatarPlaying] = useState<boolean>(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  const avatarCanvasRef = useRef<ISLAvatarCanvasRef | null>(null);
  const [modelPath, setModelPath] = useState<string>('/models/ybot.glb');
  const [activeAvatarChar, setActiveAvatarChar] = useState<string | null>(null);

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

  // 1-to-1 Synchronized avatar progress handler (calculates word index based on actual avatar signing progress)
  const handleAvatarProgressChar = useCallback((char: string, processedText: string) => {
    setActiveAvatarChar(char);
    if (!articleTokens.length) return;
    const wordsSigned = processedText.trim().split(/\s+/).filter(Boolean);
    const count = wordsSigned.length;
    if (count > 0) {
      const targetIdx = Math.min(count - 1, articleTokens.length - 1);
      setCurrentWordIndex(targetIdx);
    }
  }, [articleTokens.length]);

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

  const handleToggleAvatarPlay = useCallback(() => {
    if (!selectedArticle) return;
    if (isAvatarPlaying) {
      setIsAvatarPlaying(false);
      avatarCanvasRef.current?.pauseAnimation();
    } else {
      setIsAvatarPlaying(true);
      const fullText = `${selectedArticle.title} ${selectedArticle.content.join(' ')}`;
      avatarCanvasRef.current?.signText(fullText);
    }
  }, [isAvatarPlaying, selectedArticle]);

  const handleOpenArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    setIsAvatarPlaying(false);
    setCurrentWordIndex(0);
    window.speechSynthesis.cancel();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
    setIsAvatarPlaying(false);
    setCurrentWordIndex(0);
    window.speechSynthesis.cancel();
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
          <div className="flex items-center justify-between gap-4 bg-white dark:bg-[#151c28] p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-[#243044] shadow-sm">
            <div className="flex items-center gap-3.5">
              <button
                onClick={handleBackToList}
                className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-[#0c121e] hover:bg-indigo-50 dark:hover:bg-[#fe9832]/10 border border-slate-200 dark:border-[#243044] hover:border-indigo-400 text-indigo-600 dark:text-[#fe9832] flex items-center justify-center transition-all group shrink-0"
                title={t('news.backToAll', 'Back to All Articles')}
              >
                <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-0.5 transition-transform">
                  arrow_back
                </span>
              </button>
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-[#828796] uppercase tracking-wider">
                  {t('news.breadcrumb', 'Accessibility News')} &bull; {selectedArticle.category}
                </span>
                <p className="text-xs text-gray-900 dark:text-[#c1c6d7] font-bold truncate max-w-xs sm:max-w-md md:max-w-lg">
                  {selectedArticle.title}
                </p>
              </div>
            </div>
          </div>

          {/* Dedicated 2-Section Grid: Left (5 Cols) Article Text & Details | Right (7 Cols) Huge 3D Avatar Arena */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ========================================================================= */}
            {/* LEFT SECTION: ARTICLE TEXT, MEDIA & LIVE IN-TEXT GREEN WORD HIGHLIGHT (5 cols) */}
            {/* ========================================================================= */}
            <article className="lg:col-span-5 bg-white dark:bg-[#151c28] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-[#243044] shadow-sm flex flex-col gap-6 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
              
              {/* Header Details */}
              <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-[#243044] pb-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-[#fe9832]/10 dark:border-[#fe9832]/20 dark:text-[#fe9832] font-black rounded-full text-[10px] uppercase tracking-wider">
                    {selectedArticle.category}
                  </span>
                  <span className="text-slate-400 dark:text-[#828796]">&bull;</span>
                  <span className="text-slate-500 dark:text-[#828796] font-medium">{selectedArticle.date}</span>
                  <span className="text-slate-400 dark:text-[#828796]">&bull;</span>
                  <span className="text-slate-500 dark:text-[#828796] font-medium">{selectedArticle.readTime}</span>
                </div>

                {/* Article Title with Live Green Word Highlighting */}
                <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight leading-snug">
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
                              ? 'bg-emerald-500 text-white font-black px-1.5 py-0.5 rounded-lg shadow-sm ring-2 ring-emerald-400 scale-105'
                              : 'hover:text-indigo-600 dark:hover:text-[#fe9832]'
                          }`}
                        >
                          {t.word}
                        </span>
                      );
                    })}
                </h1>
              </div>

              {/* Article Hero Image */}
              <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-[#243044] relative">
                <img
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Key Takeaways Callout */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-[#fe9832]/5 border border-indigo-100 dark:border-[#fe9832]/20 flex flex-col gap-2">
                <span className="text-xs font-black text-indigo-700 dark:text-[#fe9832] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px]">verified</span>
                  <span>{t('news.keyTakeaways', 'Key Article Takeaways')}</span>
                </span>
                <ul className="space-y-1 text-xs text-gray-700 dark:text-[#c1c6d7]">
                  {selectedArticle.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-600 dark:text-[#fe9832] font-bold mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Full Paragraphs with Word-by-Word Live Green Highlight */}
              <div className="flex flex-col gap-4 text-sm text-gray-700 dark:text-[#c1c6d7] leading-relaxed font-normal">
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
                                ? 'bg-emerald-500 text-white font-black px-1.5 py-0.5 rounded-lg shadow-sm ring-2 ring-emerald-400 scale-105'
                                : 'hover:text-indigo-600 dark:hover:text-[#fe9832]'
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

              <div className="pt-3 border-t border-slate-100 dark:border-[#243044] text-[11px] text-gray-500 dark:text-[#828796] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-500">touch_app</span>
                <span>{t('news.clickWordHint', 'Click any word above to jump the 3D Sign Avatar to that exact sentence.')}</span>
              </div>
            </article>

            {/* ========================================================================= */}
            {/* RIGHT SECTION: EXPANDED SPATIAL 3D ISL AVATAR PLAYER (7 cols - Max Space) */}
            {/* ========================================================================= */}
            <aside className="lg:col-span-7 flex flex-col gap-3 sticky top-6">
              <div className="bg-white dark:bg-[#151c28] rounded-3xl p-4 sm:p-5 border border-indigo-200 dark:border-[#fe9832]/40 shadow-xl flex flex-col gap-3">
                
                {/* Ultra-Compact Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#243044] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-600 dark:text-[#fe9832] text-[20px]">accessibility_new</span>
                    <h3 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white tracking-wide">
                      {t('news.avatarTitle', '3D ISL Sign Avatar Reader')}
                    </h3>
                  </div>

                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-[#8dfc75]">
                    {t('news.fullSync', 'Full Sync')}
                  </span>
                </div>

                {/* 3D ISL AVATAR ARENA (Fitted Screen Container) */}
                <div className="w-full h-[320px] sm:h-[360px] lg:h-[380px] bg-gradient-to-br from-[#080e1b] via-[#101a2d] to-[#04070d] rounded-2xl overflow-hidden relative border border-white/15 shadow-xl flex flex-col justify-between p-3 text-white">
                  
                  {/* Top Status & Model Selector */}
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-xl border border-white/15 shadow-sm">
                      {t('news.word', 'Word')} {currentWordIndex + 1} / {articleTokens.length}
                    </span>

                    <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md p-0.5 rounded-xl border border-white/15 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setModelPath('/models/ybot.glb')}
                        className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                          modelPath.includes('ybot') ? 'bg-[#fe9832] text-[#542900]' : 'text-white/70'
                        }`}
                      >
                        YBot
                      </button>
                      <button
                        type="button"
                        onClick={() => setModelPath('/models/xbot.glb')}
                        className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                          modelPath.includes('xbot') ? 'bg-[#fe9832] text-[#542900]' : 'text-white/70'
                        }`}
                      >
                        XBot
                      </button>
                    </div>
                  </div>

                  {/* Real 3D Avatar WebGL Canvas (Fitted Viewport) */}
                  <div className="flex-1 w-full h-full min-h-[200px] flex items-center justify-center relative overflow-hidden my-1 rounded-xl">
                    <ISLAvatarCanvas
                      ref={avatarCanvasRef}
                      modelPath={modelPath}
                      speed={playbackSpeed}
                      pauseTimeMs={Math.round(400 / playbackSpeed)}
                      onProgressChar={handleAvatarProgressChar}
                      onFinish={() => setIsAvatarPlaying(false)}
                      className="w-full h-full"
                    />

                    {/* Target Letter Overlay Badge */}
                    {activeAvatarChar && (
                      <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15 text-xs font-mono font-bold text-[#8dfc75] shadow-lg z-10 flex items-center gap-1.5">
                        <span className="text-[9px] text-white/60 uppercase">{t('news.signal', 'Signal:')}</span>
                        <span className="text-xs text-[#fe9832]">"{activeAvatarChar}"</span>
                      </div>
                    )}
                  </div>

                  {/* Synchronized Live Sign Gloss Display Banner */}
                  <div className="bg-black/85 backdrop-blur-md p-2 rounded-xl border border-white/20 text-center flex flex-col gap-0.5 shadow-xl z-10">
                    <span className="text-[9px] uppercase tracking-widest text-[#fe9832] font-black">
                      {t('news.currentToken', 'Current Sign Token')}
                    </span>
                    <span className="font-mono text-base sm:text-lg font-black text-[#8dfc75] tracking-widest">
                      [{currentToken?.cleanToken || 'IDLE'}]
                    </span>
                  </div>
                </div>

                {/* Avatar Control Deck */}
                <div className="flex flex-col gap-2.5 pt-1">
                  
                  {/* Article Reading Progress Slider */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] font-bold text-gray-500 dark:text-[#828796]">
                      <span>{t('news.readingProgress', 'Reading Progress')}</span>
                      <span>{Math.round(((currentWordIndex + 1) / (articleTokens.length || 1)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-[#0c121e] rounded-full h-2.5 overflow-hidden border border-slate-200 dark:border-[#243044]">
                      <div
                        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 dark:from-[#fe9832] dark:via-emerald-400 dark:to-[#8dfc75] h-full transition-all duration-200"
                        style={{
                          width: `${((currentWordIndex + 1) / (articleTokens.length || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Play / Pause / Replay & Speed Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={handleToggleAvatarPlay}
                      className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-sky-500 text-white dark:bg-none dark:bg-[#fe9832] dark:hover:bg-[#e8872b] dark:text-[#542900] hover:opacity-95 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-indigo-500/20 dark:shadow-none flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isAvatarPlaying ? 'pause' : 'play_arrow'}
                      </span>
                      <span>{isAvatarPlaying ? t('news.pauseReader', 'Pause Sign Reader') : t('news.playReader', 'Play Sign Reader')}</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentWordIndex(0);
                        setIsAvatarPlaying(true);
                        if (selectedArticle && avatarCanvasRef.current) {
                          const fullText = `${selectedArticle.title} ${selectedArticle.content.join(' ')}`;
                          avatarCanvasRef.current.signText(fullText);
                        }
                      }}
                      className="px-3.5 py-2.5 bg-slate-50 dark:bg-[#0c121e] hover:bg-indigo-50 dark:hover:bg-[#fe9832]/10 border border-slate-200 dark:border-[#243044] text-gray-800 dark:text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                      title="Restart reading from start"
                    >
                      <span className="material-symbols-outlined text-[16px]">replay</span>
                      <span className="hidden sm:inline">{t('news.restart', 'Restart')}</span>
                    </button>

                    {/* Interactive Speed Selector */}
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-[#0c121e] border border-slate-200 dark:border-[#243044] rounded-xl p-1 overflow-x-auto">
                      <span className="text-[10px] font-bold text-gray-500 dark:text-[#828796] px-1 hidden sm:inline">{t('news.speed', 'Speed:')}</span>
                      {[0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => setPlaybackSpeed(speed)}
                          className={`px-1.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                            playbackSpeed === speed
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#542900] shadow-xs font-black'
                              : 'text-gray-600 dark:text-[#828796] hover:text-gray-900 dark:hover:text-white'
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
          <header className="flex flex-col gap-2 border-b border-slate-200 dark:border-[#243044] pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white dark:bg-gradient-to-br dark:from-[#fe9832] dark:to-[#e8872b] dark:text-[#542900] flex items-center justify-center font-black shadow-md shrink-0">
                <span className="material-symbols-outlined text-[28px]">newspaper</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
                  <span>{t('news.pageTitle', 'Accessibility & ISL News')}</span>
                  <span className="text-xs font-bold text-indigo-700 dark:text-[#fe9832] bg-indigo-50 dark:bg-[#fe9832]/10 border border-indigo-200 dark:border-[#fe9832]/20 px-2.5 py-0.5 rounded-full">
                    {t('news.liveBulletins', 'Live Bulletins')}
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-[#c1c6d7] mt-0.5 font-medium">
                  {t('news.pageDesc', 'Stay updated on Indian Sign Language policies, assistive technology breakthroughs, and community announcements.')}
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
                className="bg-white dark:bg-[#151c28] rounded-3xl overflow-hidden border border-slate-200 hover:border-indigo-300 dark:border-[#243044] dark:hover:border-[#fe9832] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
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
                    <div className="flex items-center justify-between text-[11px] font-medium text-gray-500 dark:text-[#828796] mb-2">
                      <span>{item.date}</span>
                      <span>{item.readTime}</span>
                    </div>
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-[#fe9832] transition-colors line-clamp-2">
                      {item.title}
                    </h2>
                    <p className="text-xs text-gray-600 dark:text-[#828796] leading-relaxed line-clamp-3 mt-2 font-medium">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-[#fe9832]">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">sign_language</span>
                      <span>{t('news.readAndSign', 'Read Article & ISL Sign')}</span>
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
