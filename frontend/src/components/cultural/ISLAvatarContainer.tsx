import React from 'react';
import { ISLAvatarCanvas, type ISLAvatarCanvasRef } from './ISLAvatarCanvas';

export interface ISLAvatarContainerProps {
  canvasRef: React.RefObject<ISLAvatarCanvasRef | null>;
  currentWord: string | null;
  currentWordProgress: { current: number; total: number };
  currentLetter: string | null;
  currentLetterIndex: number;
  totalLetters: number;
  wordIndex: number;
  totalWords: number;
  isPlaying: boolean;
  playbackSpeed: number;
  modelPath: string;
  onProgressChar?: (char: string, processedText: string) => void;
  onFinish?: () => void;
  onTogglePlay: () => void;
  onStepNext: () => void;
  onStepPrev: () => void;
  onReset: () => void;
  onChangeSpeed: (speed: number) => void;
  onChangeModel: (modelPath: string) => void;
}

/**
 * ISLAvatarContainer
 *
 * Plug-and-Play Avatar Container incorporating the real 3D Three.js Mixamo ISL model renderer.
 * Visualizes character-by-character ISL signing in synchronization with lyrics.
 */
export const ISLAvatarContainer: React.FC<ISLAvatarContainerProps> = ({
  canvasRef,
  currentWord,
  currentWordProgress,
  currentLetter,
  currentLetterIndex,
  totalLetters,
  wordIndex,
  totalWords,
  isPlaying,
  playbackSpeed,
  modelPath,
  onProgressChar,
  onFinish,
  onTogglePlay,
  onStepNext,
  onStepPrev,
  onReset,
  onChangeSpeed,
  onChangeModel,
}) => {
  // Overall letter progress percentage
  const letterProgressPercent = totalLetters > 0 ? Math.round(((currentLetterIndex + 1) / totalLetters) * 100) : 0;

  return (
    <div className="bg-[#0b1324]/85 backdrop-blur-xl rounded-[28px] border border-white/15 p-5 sm:p-6 flex flex-col justify-between gap-5 shadow-2xl relative overflow-hidden group font-['Inter',sans-serif]">
      
      {/* Top Header & Active Status */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#fe9832] to-[#e8872b] flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-[22px]">accessibility</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>ISL 3D Avatar</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-white/80 font-mono">
                {modelPath.includes('xbot') ? 'XBot' : 'YBot'}
              </span>
            </h3>
            <p className="text-[11px] text-white/60">Real-Time Character Sign Synthesis</p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fe9832]/10 border border-[#fe9832]/30 rounded-full text-[10px] font-bold text-[#fe9832]">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#fe9832] animate-ping' : 'bg-emerald-400'}`} />
          <span>{isPlaying ? 'Signing Active' : 'Model Ready'}</span>
        </div>
      </div>

      {/* Main 3D WebGL Avatar Viewport */}
      <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[540px] bg-gradient-to-b from-[#050b16] via-[#091325] to-[#040914] rounded-2xl border border-white/10 overflow-hidden flex flex-col items-center justify-center shadow-inner">
        
        {/* Tricolor Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff9933] via-white to-[#138808] opacity-70 z-10" />

        {/* Ambient Glow */}
        <div className="absolute w-56 h-56 rounded-full bg-[#fe9832]/10 blur-3xl pointer-events-none" />

        {/* Real 3D Avatar WebGL Canvas Component */}
        <ISLAvatarCanvas
          ref={canvasRef}
          modelPath={modelPath}
          speed={0.12 * playbackSpeed}
          pauseTimeMs={Math.round(400 / playbackSpeed)}
          onProgressChar={onProgressChar}
          onFinish={onFinish}
          className="w-full h-full"
        />

        {/* Current Active Word & Highlighted Letter Overlay Badge */}
        <div className="absolute bottom-3 left-3 right-3 bg-[#030813]/85 backdrop-blur-md p-3 rounded-xl border border-white/15 flex items-center justify-between shadow-lg z-20">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] uppercase font-bold tracking-widest text-[#fe9832]">
              Current Word: {currentWord || '—'}
            </span>
            
            {/* Word Character Breakdown with Current Letter Highlight */}
            <div className="flex items-center gap-1">
              {currentWord ? (
                currentWord.split('').map((char, idx) => {
                  const isCurrent = currentWordProgress.current === idx;
                  return (
                    <span
                      key={idx}
                      className={`text-xs font-mono font-black px-1.5 py-0.5 rounded transition-all ${
                        isCurrent
                          ? 'bg-[#fe9832] text-[#542900] scale-110 shadow-sm'
                          : 'text-white/60 bg-white/5'
                      }`}
                    >
                      {char}
                    </span>
                  );
                })
              ) : (
                <span className="text-xs font-mono text-white/40">Ready</span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-0.5 text-right font-mono">
            <span className="text-[10px] text-white/50">Target Signal</span>
            <span className="text-xl font-black text-[#8dfc75]">
              {currentLetter ? `"${currentLetter}"` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Tracking Bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-white/70">
          <span>Word {wordIndex + 1} / {totalWords}</span>
          <span className="font-bold text-[#fe9832]">Letter {currentLetterIndex + 1} / {totalLetters} ({letterProgressPercent}%)</span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden p-0.5 border border-white/10">
          <div
            className="bg-gradient-to-r from-[#fe9832] via-white to-[#8dfc75] h-full rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${letterProgressPercent}%` }}
          />
        </div>
      </div>

      {/* Sequential Playback Controls Bar */}
      <div className="flex flex-col gap-3 pt-1 border-t border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Main Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Step Back */}
            <button
              type="button"
              onClick={onStepPrev}
              disabled={currentLetterIndex <= 0}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Letter"
            >
              <span className="material-symbols-outlined text-[20px]">skip_previous</span>
            </button>

            {/* Play / Pause Toggle */}
            <button
              type="button"
              onClick={onTogglePlay}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#fe9832] to-[#e8872b] hover:brightness-110 active:scale-95 text-[#542900] font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
              <span>{isPlaying ? 'Pause' : '▶ Play Jana Gana Mana'}</span>
            </button>

            {/* Step Forward */}
            <button
              type="button"
              onClick={onStepNext}
              disabled={currentLetterIndex >= totalLetters - 1}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Next Letter"
            >
              <span className="material-symbols-outlined text-[20px]">skip_next</span>
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={onReset}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              title="Restart Sequence"
            >
              <span className="material-symbols-outlined text-[18px]">replay</span>
            </button>
          </div>

          {/* Model & Speed Selectors */}
          <div className="flex items-center gap-2">
            {/* Model Switcher */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-[11px]">
              <button
                type="button"
                onClick={() => onChangeModel('/models/ybot.glb')}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                  modelPath.includes('ybot') ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                YBot
              </button>
              <button
                type="button"
                onClick={() => onChangeModel('/models/xbot.glb')}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                  modelPath.includes('xbot') ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                XBot
              </button>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-[11px] overflow-x-auto">
              {[0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0].map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => onChangeSpeed(speed)}
                  className={`px-1.5 py-0.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                    playbackSpeed === speed
                      ? 'bg-[#fe9832] text-[#542900]'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ISLAvatarContainer;
