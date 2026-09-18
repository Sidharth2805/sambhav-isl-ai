import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackgroundVideo } from '../components/cultural/BackgroundVideo';
import { DarkOverlay } from '../components/cultural/DarkOverlay';
import { JanaGanaManaContent, buildParagraphLetterTokens } from '../components/cultural/JanaGanaManaContent';
import { ISLAvatarContainer } from '../components/cultural/ISLAvatarContainer';
import type { ISLAvatarCanvasRef } from '../components/cultural/ISLAvatarCanvas';
import { CULTURAL_CATALOG, type CulturalItem } from '../data/culturalCatalogData';
import { useAccessibility } from '../hooks/useAccessibility';

interface WordInfo {
  word: string;
  wordIndex: number;
  globalLetterIndices: number[];
  letters: string[];
}

/**
 * Builds structured word metadata mapping words to their global letter token indices.
 */
function buildWordDataFromLines(linesText: string[]) {
  let globalIndex = 0;
  let wordCounter = 0;
  const words: WordInfo[] = [];

  for (const line of linesText) {
    const lineWords = line.trim().split(/\s+/).filter(Boolean);
    for (const w of lineWords) {
      const letters: string[] = [];
      const globalLetterIndices: number[] = [];

      for (let i = 0; i < w.length; i++) {
        const char = w[i];
        if (/[a-zA-Z]/.test(char)) {
          letters.push(char.toUpperCase());
          globalLetterIndices.push(globalIndex);
          globalIndex++;
        }
      }

      if (letters.length > 0) {
        words.push({
          word: w,
          wordIndex: wordCounter,
          globalLetterIndices,
          letters,
        });
        wordCounter++;
      }
    }
  }

  return words;
}

/**
 * CulturalISLPage (Extensible Cultural Heritage Hub)
 *
 * Front page gallery showcasing all cultural features in structured cards with images,
 * badges, and metadata. Clicking any item opens the immersive 3D avatar ISL experience.
 */
export const CulturalISLPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useAccessibility();

  // Mode: 'catalog' (Front Gallery) or 'experience' (3D Avatar + Lyrics Player)
  const [viewMode, setViewMode] = useState<'catalog' | 'experience'>('catalog');

  // Selected Cultural Item ID
  const [selectedId, setSelectedId] = useState<string>('jana-gana-mana');

  // Active Cultural Item from Catalog
  const activeItem: CulturalItem = useMemo(() => {
    return CULTURAL_CATALOG.find((item) => item.id === selectedId) || CULTURAL_CATALOG[0];
  }, [selectedId]);

  // Flattened lines from active cultural item
  const allLines = useMemo(() => {
    return activeItem.stanzas.flatMap((s) => s.lines);
  }, [activeItem]);

  // Full string for whole-piece avatar signing
  const fullPieceString = useMemo(() => {
    return allLines.join(' ');
  }, [allLines]);

  // Background video source path
  const [backgroundVideoSrc] = useState<string>('/assets/videos/jana_gana_mana_bg.mp4');

  // Avatar 3D Model Path (YBot / XBot)
  const [modelPath, setModelPath] = useState<string>('/models/ybot.glb');

  // Tokenize approved paragraph text into stanzas & words
  const { stanzas, allLetters } = useMemo(() => {
    return buildParagraphLetterTokens(activeItem.stanzas);
  }, [activeItem]);

  const words = useMemo(() => {
    return buildWordDataFromLines(allLines);
  }, [allLines]);

  // Playback & Letter-by-letter Sequential State
  const [activeLetterIndex, setActiveLetterIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Ref to 3D Avatar Canvas Imperative Handle
  const canvasRef = useRef<ISLAvatarCanvasRef | null>(null);

  // Launch immersive experience for a selected cultural item
  const handleOpenExperience = useCallback((itemId: string) => {
    setSelectedId(itemId);
    setViewMode('experience');
    setIsPlaying(false);
    setIsCompleted(false);
    setActiveLetterIndex(0);
    if (canvasRef.current) {
      canvasRef.current.resetPose();
    }
  }, []);

  // Return back to front page catalog
  const handleBackToCatalog = useCallback(() => {
    setViewMode('catalog');
    setIsPlaying(false);
    if (canvasRef.current) {
      canvasRef.current.pauseAnimation();
    }
  }, []);

  // Derive current word & letter progress from activeLetterIndex
  const { currentWordObj, currentWordIndex, currentWordProgress } = useMemo(() => {
    const foundWord = words.find((w) => w.globalLetterIndices.includes(activeLetterIndex)) || words[0];
    const letterPosInWord = foundWord ? foundWord.globalLetterIndices.indexOf(activeLetterIndex) : 0;
    return {
      currentWordObj: foundWord,
      currentWordIndex: foundWord ? foundWord.wordIndex : 0,
      currentWordProgress: {
        current: Math.max(0, letterPosInWord),
        total: foundWord ? foundWord.letters.length : 1,
      },
    };
  }, [words, activeLetterIndex]);

  const currentLetter = useMemo(() => {
    return allLetters[activeLetterIndex] || null;
  }, [allLetters, activeLetterIndex]);

  // Callback from 3D Avatar Engine when each letter animation begins
  const handleAvatarProgressChar = useCallback((_char: string, processedText: string) => {
    const cleanLettersProcessed = processedText.replace(/[^a-zA-Z]/g, '').length;
    if (cleanLettersProcessed > 0 && cleanLettersProcessed <= allLetters.length) {
      setActiveLetterIndex(cleanLettersProcessed - 1);
    }
  }, [allLetters.length]);

  const handleAvatarFinish = useCallback(() => {
    setIsPlaying(false);
    setIsCompleted(true);
  }, []);

  // Handlers for Control Actions
  const handleTogglePlay = useCallback(() => {
    if (!canvasRef.current) return;

    if (isPlaying) {
      setIsPlaying(false);
      canvasRef.current.pauseAnimation();
    } else {
      setIsCompleted(false);
      setIsPlaying(true);
      if (activeLetterIndex === 0 || activeLetterIndex >= allLetters.length - 1) {
        setActiveLetterIndex(0);
        canvasRef.current.signText(fullPieceString);
      } else {
        canvasRef.current.resumeAnimation();
      }
    }
  }, [isPlaying, activeLetterIndex, allLetters.length, fullPieceString]);

  const handleStepNext = useCallback(() => {
    setIsCompleted(false);
    const nextIdx = Math.min(allLetters.length - 1, activeLetterIndex + 1);
    setActiveLetterIndex(nextIdx);
    if (canvasRef.current && allLetters[nextIdx]) {
      canvasRef.current.playLetter(allLetters[nextIdx]);
    }
  }, [allLetters, activeLetterIndex]);

  const handleStepPrev = useCallback(() => {
    setIsCompleted(false);
    const prevIdx = Math.max(0, activeLetterIndex - 1);
    setActiveLetterIndex(prevIdx);
    if (canvasRef.current && allLetters[prevIdx]) {
      canvasRef.current.playLetter(allLetters[prevIdx]);
    }
  }, [allLetters, activeLetterIndex]);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setIsCompleted(false);
    setActiveLetterIndex(0);
    if (canvasRef.current) {
      canvasRef.current.resetPose();
    }
  }, []);

  const handleSelectLetter = useCallback((index: number) => {
    setIsCompleted(false);
    setActiveLetterIndex(index);
    if (canvasRef.current && allLetters[index]) {
      canvasRef.current.playLetter(allLetters[index]);
    }
  }, [allLetters]);

  const handlePlayFromIndex = useCallback((index: number) => {
    setIsCompleted(false);
    setActiveLetterIndex(index);
    setIsPlaying(true);
    if (canvasRef.current && allLetters[index]) {
      const remainingLetters = allLetters.slice(index).join(' ');
      canvasRef.current.signText(remainingLetters);
    }
  }, [allLetters]);

  const handleChangeSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
  }, []);

  const handleChangeModel = useCallback((path: string) => {
    setModelPath(path);
    setIsPlaying(false);
    if (canvasRef.current) {
      canvasRef.current.resetPose();
    }
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn font-['Inter',sans-serif] w-full pb-10">

      {/* ========================================================================= */}
      {/* 1. FRONT PAGE / CULTURAL CATALOG HUB (When viewMode === 'catalog')        */}
      {/* ========================================================================= */}
      {viewMode === 'catalog' && (
        <div className="flex flex-col gap-6">
          
          {/* Top Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#030813] via-[#0d1627] to-[#122318] p-6 sm:p-8 text-white border border-slate-200 dark:border-white/10 shadow-xl">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ff9933] via-white to-[#138808]" />
            <div className="absolute -right-16 -top-16 w-72 h-72 bg-[#fe9832]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#fe9832] via-[#ffffff] to-[#138808] p-0.5 shadow-xl shrink-0">
                  <div className="w-full h-full bg-[#030813] rounded-[14px] flex items-center justify-center text-[28px]">
                    🇮🇳
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {t('cultural.title', 'Cultural ISL & National Heritage')}
                    </h1>
                    <span className="px-3 py-0.5 bg-[#fe9832]/20 text-[#fe9832] border border-[#fe9832]/30 rounded-full text-xs font-black shadow-xs">
                      {t('cultural.hubBadge', 'Interactive 3D ISL Hub')}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl leading-relaxed font-medium">
                    {t('cultural.description', 'Experience India\'s sacred national anthems, constitutional heritage, and historic literature rendered into Indian Sign Language with sequential word tokenization and interactive 3D avatar interpretation.')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>{t('cultural.dashboard', 'Dashboard')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 dark:text-[#fe9832] text-[24px]">
                auto_awesome
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#0f172a] dark:text-white tracking-tight">
                {t('cultural.featuredWorks', 'Featured Cultural Works')}
              </h2>
            </div>
          </div>

          {/* Cultural Works Grid (Rich Feature Boxes with Larger Fonts & Crisp Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CULTURAL_CATALOG.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenExperience(item.id)}
                className="bg-white dark:bg-[#151c28] rounded-3xl overflow-hidden border border-slate-200 dark:border-[#243044] hover:border-indigo-400 dark:hover:border-[#fe9832] shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer text-left"
              >
                {/* Image Banner */}
                <div className="relative h-48 sm:h-52 overflow-hidden bg-[#030813]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase text-white bg-gradient-to-r ${item.badgeGradient} shadow-md tracking-wider`}>
                      {item.category}
                    </span>
                  </div>

                  <div className="absolute top-3.5 right-3.5">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-xs">
                      {t('cultural.est', 'Est.')} {item.estimatedDuration}
                    </span>
                  </div>

                  {/* Emblem & Title overlay on banner */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-[24px] shrink-0 shadow-md">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-black text-white truncate tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/85 truncate font-semibold">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content Details (Larger Fonts & Crisp Layout) */}
                <div className="p-6 flex flex-col gap-4 flex-1 justify-between">
                  <div className="space-y-2.5">
                    <p className="text-sm font-bold text-indigo-600 dark:text-[#fe9832]">
                      {item.tagline}
                    </p>
                    <p className="text-sm sm:text-[15px] text-[#475569] dark:text-[#c1c6d7] leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>

                  {/* Footer Meta & Launch Action */}
                  <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-3">
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-[#828796] font-semibold flex items-center gap-1.5 shrink-0">
                      <span className="material-symbols-outlined text-[18px]">segment</span>
                      <span>{item.stanzas.length} {t('cultural.stanzas', 'Stanzas')} • {item.stanzas.flatMap((s) => s.lines).length} {t('cultural.lines', 'Lines')}</span>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenExperience(item.id);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 dark:bg-none dark:bg-[#fe9832] text-white dark:text-[#542900] text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 shadow-sm group-hover:scale-105 cursor-pointer shrink-0"
                    >
                      <span>{t('cultural.experienceBtn', 'Experience in ISL')}</span>
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pipeline / Future Works Card */}
            <div className="bg-slate-50/70 dark:bg-[#151c28]/60 rounded-3xl p-6 border-2 border-dashed border-slate-200 dark:border-white/15 flex flex-col justify-between gap-4 text-left">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200/60 dark:bg-white/10 flex items-center justify-center text-[26px]">
                    🎭
                  </div>
                  <span className="px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-indigo-50 dark:bg-white/10 text-indigo-700 dark:text-white/80 border border-indigo-200 dark:border-white/10">
                    {t('cultural.inProduction', 'In Production')}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#0f172a] dark:text-white">
                    {t('cultural.futureTitle', 'Classical & Folk ISL Literature')}
                  </h3>
                  <p className="text-sm text-[#475569] dark:text-[#c1c6d7] mt-2 leading-relaxed font-medium">
                    {t('cultural.futureDesc', 'Historic regional poetry, Sanskrit shlokas, and folk traditions are currently being tokenized and mapped to 3D avatar gesture glosses.')}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-sm text-indigo-600 dark:text-[#fe9832] font-bold">
                <span>{t('cultural.moreWorks', '+ More Works Arriving Soon')}</span>
                <span className="material-symbols-outlined text-[20px]">schedule</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. IMMERSIVE 3D EXPERIENCE VIEW (When viewMode === 'experience')           */}
      {/* ========================================================================= */}
      {viewMode === 'experience' && (
        <div className="relative min-h-[calc(100vh-100px)] w-full overflow-hidden text-white flex flex-col justify-between p-3 sm:p-5 lg:p-7 rounded-[32px]">
          
          {/* 1. Looping Background Video */}
          <BackgroundVideo videoSrc={backgroundVideoSrc} />

          {/* 2. Cinematic Dark Overlay */}
          <DarkOverlay />

          {/* 3. Foreground Interactive Content (Z-INDEX 10) */}
          <div className="relative z-10 flex flex-col gap-6 max-w-7xl mx-auto w-full">
            
            {/* Top Navigation Header */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0b1324]/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/10 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#fe9832] via-[#ffffff] to-[#138808] p-0.5 shadow-lg shrink-0">
                  <div className="w-full h-full bg-[#030813] rounded-[14px] flex items-center justify-center text-[22px]">
                    {activeItem.icon}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {activeItem.title}
                    </h1>
                    <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-extrabold uppercase tracking-wider ${activeItem.categoryBadge}`}>
                      {activeItem.category}
                    </span>
                    {isCompleted && (
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-[#8dfc75] border border-emerald-500/30 rounded-full text-[10px] font-extrabold animate-pulse">
                        {t('cultural.completed', 'Completed ✓')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-white/70 mt-0.5 font-medium">
                    {activeItem.subtitle} • {activeItem.tagline}
                  </p>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleBackToCatalog}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white dark:bg-none dark:bg-[#fe9832] dark:text-[#542900] hover:opacity-95 rounded-2xl text-xs sm:text-sm font-black transition-all shadow-md active:scale-95 cursor-pointer group"
                  title="Return to Cultural Catalog Hub"
                >
                  <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">
                    arrow_back
                  </span>
                  <span>{t('cultural.backToHub', 'Back to Cultural Hub')}</span>
                </button>
              </div>
            </header>

            {/* Quick Switcher Strip for Seamless Jumping Between Works */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1">
              <span className="text-xs text-[#fe9832] font-black uppercase tracking-wider shrink-0 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">swap_horiz</span> {t('cultural.switch', 'Switch:')}
              </span>
              {CULTURAL_CATALOG.map((item) => {
                const isSelected = item.id === selectedId;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleOpenExperience(item.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#fe9832] text-[#542900] shadow-md scale-105 font-black ring-2 ring-[#fe9832]/50'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Main Grid: Paragraph Lyrics & Real 3D Avatar Container */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (Lg: 6 cols): Approved Lyrics in Paragraph Format */}
              <div className="lg:col-span-6">
                <JanaGanaManaContent
                  title={activeItem.title}
                  subtitle={activeItem.tagline}
                  category={activeItem.category}
                  icon={activeItem.icon}
                  stanzas={stanzas}
                  activeLetterIndex={activeLetterIndex}
                  totalLetters={allLetters.length}
                  onSelectLetter={handleSelectLetter}
                  onPlayFromIndex={handlePlayFromIndex}
                />
              </div>

              {/* Right Column (Lg: 6 cols): Real 3D ISL Avatar Container */}
              <div className="lg:col-span-6">
                <ISLAvatarContainer
                  canvasRef={canvasRef}
                  currentWord={currentWordObj ? currentWordObj.word : ''}
                  currentWordProgress={currentWordProgress}
                  currentLetter={currentLetter}
                  currentLetterIndex={activeLetterIndex}
                  totalLetters={allLetters.length}
                  wordIndex={currentWordIndex}
                  totalWords={words.length}
                  isPlaying={isPlaying}
                  playbackSpeed={playbackSpeed}
                  modelPath={modelPath}
                  onProgressChar={handleAvatarProgressChar}
                  onFinish={handleAvatarFinish}
                  onTogglePlay={handleTogglePlay}
                  onStepNext={handleStepNext}
                  onStepPrev={handleStepPrev}
                  onReset={handleReset}
                  onChangeSpeed={handleChangeSpeed}
                  onChangeModel={handleChangeModel}
                />
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default CulturalISLPage;
