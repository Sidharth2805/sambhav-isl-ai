import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackgroundVideo } from '../components/cultural/BackgroundVideo';
import { DarkOverlay } from '../components/cultural/DarkOverlay';
import { JanaGanaManaContent, buildParagraphLetterTokens, JANA_GANA_MANA_APPROVED_TEXT } from '../components/cultural/JanaGanaManaContent';
import { ISLAvatarContainer } from '../components/cultural/ISLAvatarContainer';
import type { ISLAvatarCanvasRef } from '../components/cultural/ISLAvatarCanvas';

interface WordInfo {
  word: string;
  wordIndex: number;
  globalLetterIndices: number[];
  letters: string[];
}

/**
 * Builds structured word metadata mapping words to their global letter token indices.
 */
function buildWordData(linesText: string[]) {
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

const FULL_ANTHEM_STRING = JANA_GANA_MANA_APPROVED_TEXT.join(' ');

/**
 * JanaGanaManaPage (Cultural ISL Experience)
 *
 * Dedicated premium cultural page for India's National Anthem "Jana Gana Mana".
 * Integrates the real 3D Three.js Mixamo Avatar Renderer (YBot / XBot) from Avatar-realtime.
 */
export const CulturalISLPage: React.FC = () => {
  const navigate = useNavigate();

  // Background video source path (easily replaceable)
  const [backgroundVideoSrc] = useState<string>('/assets/videos/jana_gana_mana_bg.mp4');

  // Avatar 3D Model Path (YBot / XBot)
  const [modelPath, setModelPath] = useState<string>('/models/ybot.glb');

  // Tokenize approved English Jana Gana Mana paragraph text into stanzas & words
  const { stanzas, allLetters } = useMemo(() => buildParagraphLetterTokens(JANA_GANA_MANA_APPROVED_TEXT), []);
  const words = useMemo(() => buildWordData(JANA_GANA_MANA_APPROVED_TEXT), []);

  // Playback & Letter-by-letter Sequential State
  const [activeLetterIndex, setActiveLetterIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Ref to 3D Avatar Canvas Imperative Handle
  const canvasRef = useRef<ISLAvatarCanvasRef | null>(null);

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
    // Calculate global letter count processed so far
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
        canvasRef.current.signText(FULL_ANTHEM_STRING);
      } else {
        canvasRef.current.resumeAnimation();
      }
    }
  }, [isPlaying, activeLetterIndex, allLetters.length]);

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
    <div className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden text-white font-['Inter',sans-serif] flex flex-col justify-between p-4 sm:p-6 lg:p-8 rounded-[32px]">
      
      {/* 1. Full-Screen Looping Background Video with Animated Tricolor Waves */}
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
                {isCompleted && (
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-[#8dfc75] border border-emerald-500/30 rounded-full text-[10px] font-extrabold">
                    Jana Gana Mana Completed ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-white/70 mt-0.5">
                Indian National Anthem • Sequential Letter-by-Letter 3D ISL Avatar Performance
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

        {/* Main Grid: Paragraph Lyrics & Real 3D Avatar Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (Lg: 6 cols): Approved English Lyrics in Paragraph Format */}
          <div className="lg:col-span-6">
            <JanaGanaManaContent
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
  );
};

export default CulturalISLPage;
