import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackgroundVideo } from '../components/cultural/BackgroundVideo';
import { DarkOverlay } from '../components/cultural/DarkOverlay';
import { JanaGanaManaContent, buildPoemTokens, JANA_GANA_MANA_APPROVED_LINES } from '../components/cultural/JanaGanaManaContent';
import { ISLAvatarContainer } from '../components/cultural/ISLAvatarContainer';

/**
 * JanaGanaManaPage (Cultural ISL Experience)
 *
 * Dedicated premium cultural page for India's National Anthem "Jana Gana Mana".
 * Features:
 * - Full-screen looping background video
 * - Dark cinematic overlay for maximum contrast & accessibility
 * - Approved English-only Jana Gana Mana verses
 * - Word-by-word tokenized processing architecture
 * - Isolated ISL Avatar Container prepared for plug-and-play avatar integration
 */
export const CulturalISLPage: React.FC = () => {
  const navigate = useNavigate();

  // Custom Video Source URL (Easily replaceable by passing a prop or updating the path)
  const [backgroundVideoSrc] = useState<string>('/assets/videos/jana_gana_mana_bg.mp4');

  // Tokenize approved English Jana Gana Mana text into structured lines and global word tokens
  const { lines, allWords } = useMemo(() => buildPoemTokens(JANA_GANA_MANA_APPROVED_LINES), []);

  // Playback & Word-by-word Sequential State
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  const currentWord = useMemo(() => {
    return allWords[activeWordIndex] || null;
  }, [allWords, activeWordIndex]);

  // Sequential Timer Engine for Word-by-Word ISL Performance
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    if (isPlaying) {
      const stepDurationMs = Math.round(1000 / playbackSpeed);
      timer = setInterval(() => {
        setActiveWordIndex((prevIndex) => {
          if (prevIndex >= allWords.length - 1) {
            setIsPlaying(false);
            return prevIndex;
          }
          return prevIndex + 1;
        });
      }, stepDurationMs);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, playbackSpeed, allWords.length]);

  // Handlers for Control Actions
  const handleTogglePlay = useCallback(() => {
    if (activeWordIndex >= allWords.length - 1) {
      setActiveWordIndex(0);
    }
    setIsPlaying((prev) => !prev);
  }, [activeWordIndex, allWords.length]);

  const handleStepNext = useCallback(() => {
    setActiveWordIndex((prev) => Math.min(allWords.length - 1, prev + 1));
  }, [allWords.length]);

  const handleStepPrev = useCallback(() => {
    setActiveWordIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setActiveWordIndex(0);
  }, []);

  const handleSelectWord = useCallback((index: number) => {
    setActiveWordIndex(index);
  }, []);

  const handleChangeSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden text-white font-['Inter',sans-serif] flex flex-col justify-between p-4 sm:p-6 lg:p-8 rounded-[32px]">
      
      {/* 1. Full-Screen Looping Background Video */}
      <BackgroundVideo videoSrc={backgroundVideoSrc} />

      {/* 2. Cinematic Dark Overlay & Gradient */}
      <DarkOverlay />

      {/* 3. Foreground Interactive Content (Z-INDEX 10) */}
      <div className="relative z-10 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        
        {/* Top Navigation Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0b1324]/70 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/10 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#fe9832] via-[#ffffff] to-[#138808] p-0.5 shadow-lg">
              <div className="w-full h-full bg-[#030813] rounded-[14px] flex items-center justify-center text-[22px]">
                🇮🇳
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Jana Gana Mana
                </h1>
                <span className="px-2.5 py-0.5 bg-[#fe9832]/20 text-[#fe9832] border border-[#fe9832]/30 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  Cultural ISL
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">
                Indian National Anthem • Sequential Word-by-Word ISL Performance
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/learn-isl')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-bold text-white transition-all shadow-md active:scale-95 cursor-pointer group"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
            <span>Back to Learn ISL</span>
          </button>
        </header>

        {/* Main Grid: Content & Avatar Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (Lg: 7 cols): Approved English Lyrics with Token Highlight */}
          <div className="lg:col-span-7">
            <JanaGanaManaContent
              lines={lines}
              activeWordIndex={activeWordIndex}
              onSelectWord={handleSelectWord}
            />
          </div>

          {/* Right Column (Lg: 5 cols): Isolated ISL Avatar Container */}
          <div className="lg:col-span-5">
            <ISLAvatarContainer
              currentWord={currentWord}
              currentWordIndex={activeWordIndex}
              totalWords={allWords.length}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              onTogglePlay={handleTogglePlay}
              onStepNext={handleStepNext}
              onStepPrev={handleStepPrev}
              onReset={handleReset}
              onChangeSpeed={handleChangeSpeed}
            />
          </div>

        </div>

      </div>

    </div>
  );
};

export default CulturalISLPage;
