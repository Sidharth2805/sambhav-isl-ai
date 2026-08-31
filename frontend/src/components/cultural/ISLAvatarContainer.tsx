import React from 'react';

export interface ISLAvatarContainerProps {
  currentLetter: string | null;
  currentLetterIndex: number;
  totalLetters: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onTogglePlay: () => void;
  onStepNext: () => void;
  onStepPrev: () => void;
  onReset: () => void;
  onChangeSpeed: (speed: number) => void;
}

/**
 * ISLAvatarContainer
 *
 * Isolated component architecture designed for plug-and-play avatar model integration.
 * Processes English text letter-by-letter sequentially.
 */
export const ISLAvatarContainer: React.FC<ISLAvatarContainerProps> = ({
  currentLetter,
  currentLetterIndex,
  totalLetters,
  isPlaying,
  playbackSpeed,
  onTogglePlay,
  onStepNext,
  onStepPrev,
  onReset,
  onChangeSpeed,
}) => {
  return (
    <div className="bg-[#0b1324]/80 backdrop-blur-xl rounded-[28px] border border-white/15 p-5 sm:p-6 flex flex-col justify-between gap-5 shadow-2xl relative overflow-hidden group">
      {/* Top Header & Model Status Pill */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#fe9832] to-[#e8872b] flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-[22px]">accessibility</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>ISL Avatar Visualizer</span>
            </h3>
            <p className="text-[11px] text-white/60">Letter-by-Letter Sign Performance Engine</p>
          </div>
        </div>

        {/* Modular Plug-in Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fe9832]/10 border border-[#fe9832]/30 rounded-full text-[10px] font-bold text-[#fe9832]">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#fe9832] animate-ping' : 'bg-emerald-400'}`} />
          <span>Avatar Model Plug-in Ready</span>
        </div>
      </div>

      {/* Main Avatar Model Slot (Placeholder Container) */}
      <div className="relative aspect-video sm:aspect-[4/3] bg-gradient-to-b from-[#050b16] via-[#091325] to-[#040914] rounded-2xl border border-white/10 overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-inner">
        {/* Tricolor Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff9933] via-white to-[#138808] opacity-70" />

        {/* Ambient Ring */}
        <div className="absolute w-48 h-48 rounded-full bg-[#fe9832]/10 blur-3xl pointer-events-none" />

        {/* Center Graphic */}
        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-3 text-white shadow-lg backdrop-blur-md">
          <span className="material-symbols-outlined text-[36px] text-[#fe9832]">
            sign_language
          </span>
        </div>

        {/* Current Active Target Letter Box */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-white/50">
            Target Letter Signal
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight px-6 py-2 rounded-xl bg-white/5 border border-white/10 shadow-sm min-w-[100px] text-center">
            {currentLetter ? `"${currentLetter}"` : '—'}
          </div>
        </div>

        <p className="text-[11px] text-white/60 max-w-xs mt-3 leading-relaxed">
          Avatar model architecture is prepared to receive English character tokens letter-by-letter and perform corresponding ISL alphabet signs in sequence.
        </p>

        {/* Letter Counter Badge */}
        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-white/70 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
          Letter <span className="text-[#fe9832] font-bold">{currentLetterIndex + 1}</span> of {totalLetters}
        </div>
      </div>

      {/* Sequential Playback Controls Bar */}
      <div className="flex flex-col gap-3 pt-1">
        {/* Play/Pause Main Row */}
        <div className="flex items-center justify-between gap-3">
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
              <span>{isPlaying ? 'Pause Sequence' : 'Start Letter Sequence'}</span>
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

          {/* Speed Selector */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 text-[11px]">
            {[0.75, 1.0, 1.25, 1.5].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => onChangeSpeed(speed)}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
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
  );
};

export default ISLAvatarContainer;
