import React from 'react';

export interface LetterToken {
  char: string;
  isLetter: boolean;
  globalLetterIndex: number | null; // null for spaces/punctuation
}

export interface WordToken {
  word: string;
  tokens: LetterToken[];
  globalLetterIndices: number[];
}

export interface ParagraphStanza {
  stanzaNumber: number;
  title: string;
  lines: {
    lineIndex: number;
    words: WordToken[];
  }[];
}

export interface JanaGanaManaContentProps {
  stanzas: ParagraphStanza[];
  activeLetterIndex: number;
  totalLetters: number;
  onSelectLetter: (globalLetterIndex: number) => void;
  onPlayFromIndex?: (globalLetterIndex: number) => void;
}

export const JANA_GANA_MANA_APPROVED_TEXT: string[] = [
  'Jana Gana Mana Adhinayaka Jaya He',
  'Bharata Bhagya Vidhata',
  'Punjab Sindh Gujarat Maratha',
  'Dravida Utkala Banga',
  'Vindhya Himachala Yamuna Ganga',
  'Ucchala Jaladhi Taranga',
  'Tava Shubha Name Jage',
  'Tava Shubha Ashisha Mage',
  'Gahe Tava Jaya Gatha',
  'Jana Gana Mangala Dayaka Jaya He',
  'Bharata Bhagya Vidhata',
  'Jaya He, Jaya He, Jaya He',
  'Jaya Jaya Jaya Jaya He',
];

/**
 * Builds word-grouped letter-by-letter tokens and paragraph stanzas from approved anthem text.
 */
export function buildParagraphLetterTokens(linesText: string[] = JANA_GANA_MANA_APPROVED_TEXT): {
  stanzas: ParagraphStanza[];
  allLetters: string[];
} {
  let letterCounter = 0;
  const allLetters: string[] = [];

  const stanzaGroupings = [
    { number: 1, title: 'Invocation of Destiny', lines: linesText.slice(0, 4) },
    { number: 2, title: 'Sacred Rivers & Mountains', lines: linesText.slice(4, 9) },
    { number: 3, title: 'Eternal Victory & Triumph', lines: linesText.slice(9, 13) },
  ];

  let currentLineIndex = 0;

  const stanzas: ParagraphStanza[] = stanzaGroupings.map((group) => {
    const stanzaLines = group.lines.map((lineText) => {
      const rawWords = lineText.trim().split(/\s+/);
      const wordTokensList: WordToken[] = [];

      for (const w of rawWords) {
        const tokens: LetterToken[] = [];
        const globalLetterIndices: number[] = [];

        for (let i = 0; i < w.length; i++) {
          const char = w[i];
          const isLetter = /[a-zA-Z]/.test(char);

          if (isLetter) {
            const uppercaseChar = char.toUpperCase();
            tokens.push({
              char,
              isLetter: true,
              globalLetterIndex: letterCounter,
            });
            globalLetterIndices.push(letterCounter);
            allLetters.push(uppercaseChar);
            letterCounter++;
          } else {
            tokens.push({
              char,
              isLetter: false,
              globalLetterIndex: null,
            });
          }
        }

        wordTokensList.push({
          word: w,
          tokens,
          globalLetterIndices,
        });
      }

      const lineRes = { lineIndex: currentLineIndex, words: wordTokensList };
      currentLineIndex++;
      return lineRes;
    });

    return {
      stanzaNumber: group.number,
      title: group.title,
      lines: stanzaLines,
    };
  });

  return { stanzas, allLetters };
}

export const JanaGanaManaContent: React.FC<JanaGanaManaContentProps> = ({
  stanzas,
  activeLetterIndex,
  totalLetters,
  onSelectLetter,
  onPlayFromIndex,
}) => {
  const stanzaRefs = React.useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Compute active stanza number dynamically based on activeLetterIndex
  const activeStanzaNumber = React.useMemo(() => {
    for (const stanza of stanzas) {
      for (const line of stanza.lines) {
        for (const word of line.words) {
          if (word.globalLetterIndices.includes(activeLetterIndex)) {
            return stanza.stanzaNumber;
          }
        }
      }
    }
    return 1;
  }, [stanzas, activeLetterIndex]);

  // Smoothly scroll active stanza upwards to top as playback moves into subsequent stanzas
  React.useEffect(() => {
    const activeEl = stanzaRefs.current[activeStanzaNumber];
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [activeStanzaNumber]);

  return (
    <div className="bg-[#0b1324]/80 backdrop-blur-xl rounded-[28px] border border-white/15 p-5 sm:p-7 flex flex-col gap-5 shadow-2xl relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#fe9832] via-[#ffffff] to-[#138808] p-0.5 shadow-md">
            <div className="w-full h-full bg-[#030813] rounded-[14px] flex items-center justify-center text-[20px]">
              🇮🇳
            </div>
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">Jana Gana Mana</h2>
            <p className="text-xs text-white/60">English Transliteration • Interactive Stanza Playback</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-white shadow-sm">
            National Anthem
          </span>
          <span className="px-2.5 py-1 bg-[#fe9832]/20 border border-[#fe9832]/30 rounded-full text-[11px] font-mono font-bold text-[#fe9832]">
            {totalLetters} Letters
          </span>
        </div>
      </div>

      {/* Paragraph Stanzas Display with Smooth Upward Auto-Scrolling */}
      <div className="flex flex-col gap-5 font-['Inter',sans-serif] max-h-[480px] sm:max-h-[540px] overflow-y-auto pr-1.5 custom-scrollbar">
        {stanzas.map((stanza) => {
          const isStanzaActive = activeStanzaNumber === stanza.stanzaNumber;

          return (
            <div
              key={stanza.stanzaNumber}
              ref={(el) => { stanzaRefs.current[stanza.stanzaNumber] = el; }}
              className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col gap-3.5 ${
                isStanzaActive
                  ? 'bg-white/[0.07] border-[#fe9832]/60 shadow-xl ring-1 ring-[#fe9832]/30'
                  : 'bg-white/[0.03] border-white/10 opacity-75 hover:opacity-100'
              }`}
            >
              {/* Stanza Header Badge with Flexible Play Button */}
              <div className="flex items-center justify-between text-[11px] border-b border-white/10 pb-2.5">
                <span className="font-extrabold uppercase tracking-wider text-[#fe9832] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">library_music</span>
                  <span>Stanza 0{stanza.stanzaNumber} — {stanza.title}</span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    const firstWord = stanza.lines[0]?.words[0];
                    const startIdx = firstWord?.globalLetterIndices[0];
                    if (startIdx !== undefined) {
                      onSelectLetter(startIdx);
                      onPlayFromIndex?.(startIdx);
                    }
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isStanzaActive
                      ? 'bg-[#fe9832] text-[#542900] shadow-md font-black scale-105'
                      : 'bg-white/10 hover:bg-[#fe9832]/30 text-white border border-white/15'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {isStanzaActive ? 'graphic_eq' : 'play_arrow'}
                  </span>
                  <span>{isStanzaActive ? 'Playing Stanza' : `Play Stanza ${stanza.stanzaNumber}`}</span>
                </button>
              </div>

              {/* Paragraph Line Flow */}
              <div className="flex flex-col gap-3 leading-relaxed">
                {stanza.lines.map((line) => (
                  <div key={line.lineIndex} className="flex flex-wrap items-center gap-2">
                    {line.words.map((wordObj, wIdx) => {
                      const isWordActive = wordObj.globalLetterIndices.includes(activeLetterIndex);

                      return (
                        <div
                          key={wIdx}
                          className={`inline-flex items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${
                            isWordActive
                              ? 'bg-[#fe9832]/25 border-2 border-[#fe9832] ring-4 ring-[#fe9832]/20 shadow-lg scale-105'
                              : 'bg-white/[0.04] border border-white/10 hover:border-white/20'
                          }`}
                        >
                          {wordObj.tokens.map((token, tIdx) => {
                            if (!token.isLetter || token.globalLetterIndex === null) {
                              return (
                                <span key={tIdx} className="text-white/40 text-base font-bold">
                                  {token.char}
                                </span>
                              );
                            }

                            const isLetterActive = token.globalLetterIndex === activeLetterIndex;

                            return (
                              <button
                                key={tIdx}
                                type="button"
                                onClick={() => {
                                  onSelectLetter(token.globalLetterIndex!);
                                  onPlayFromIndex?.(token.globalLetterIndex!);
                                }}
                                className={`inline-flex items-center justify-center font-mono font-black text-base sm:text-lg transition-all rounded px-1 cursor-pointer ${
                                  isLetterActive
                                    ? 'bg-gradient-to-r from-[#fe9832] to-[#e8872b] text-[#542900] scale-125 shadow-xl ring-2 ring-white animate-pulse z-10'
                                    : isWordActive
                                    ? 'text-white font-black hover:text-[#fe9832]'
                                    : 'text-white/80 hover:text-[#fe9832] hover:bg-white/10'
                                }`}
                              >
                                {token.char}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Guidance */}
      <div className="flex items-center justify-between text-xs text-white/50 border-t border-white/10 pt-3">
        <span>Click any stanza button or letter to jump 3D avatar performance to that exact position.</span>
        <span className="font-mono text-[#fe9832]">Letter: {activeLetterIndex + 1} / {totalLetters}</span>
      </div>
    </div>
  );
};

export default JanaGanaManaContent;
