import React from 'react';

export interface PoemLine {
  lineIndex: number;
  text: string;
  words: { word: string; globalIndex: number }[];
}

export interface JanaGanaManaContentProps {
  lines: PoemLine[];
  activeWordIndex: number;
  onSelectWord: (globalIndex: number) => void;
}

/**
 * Approved English Jana Gana Mana Lyric Text Array
 * Structured word by word for exact sequential avatar tokenization.
 */
export const JANA_GANA_MANA_APPROVED_LINES: string[] = [
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
 * Helper to process approved lines into line structures and global word tokens
 */
export function buildPoemTokens(linesText: string[] = JANA_GANA_MANA_APPROVED_LINES): {
  lines: PoemLine[];
  allWords: string[];
} {
  let counter = 0;
  const allWords: string[] = [];

  const lines: PoemLine[] = linesText.map((lineText, lineIdx) => {
    const rawWords = lineText.trim().split(/\s+/).filter(Boolean);
    const words = rawWords.map((wordStr) => {
      // Clean punctuation for machine avatar lookup while preserving original presentation
      const cleaned = wordStr.replace(/[^a-zA-Z]/g, '');
      const item = {
        word: wordStr,
        cleaned: cleaned || wordStr,
        globalIndex: counter,
      };
      allWords.push(cleaned || wordStr);
      counter++;
      return item;
    });

    return {
      lineIndex: lineIdx,
      text: lineText,
      words,
    };
  });

  return { lines, allWords };
}

export const JanaGanaManaContent: React.FC<JanaGanaManaContentProps> = ({
  lines,
  activeWordIndex,
  onSelectWord,
}) => {
  return (
    <div className="bg-[#0b1324]/80 backdrop-blur-xl rounded-[28px] border border-white/15 p-6 sm:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
      {/* Tricolor Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#138808] to-[#095204] flex items-center justify-center text-white text-[20px] shadow-md">
            🇮🇳
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">Jana Gana Mana</h2>
            <p className="text-xs text-white/60">Official English Transliteration for ISL Processing</p>
          </div>
        </div>

        <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-white shadow-sm">
          National Anthem
        </span>
      </div>

      {/* English Lyrics Word-by-Word Interactive Display */}
      <div className="flex flex-col gap-4 font-['Inter',sans-serif]">
        {lines.map((lineObj) => (
          <div
            key={lineObj.lineIndex}
            className="flex flex-wrap items-center gap-x-2 gap-y-1.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition-all"
          >
            {lineObj.words.map((w) => {
              const isActive = w.globalIndex === activeWordIndex;
              return (
                <button
                  key={w.globalIndex}
                  type="button"
                  onClick={() => onSelectWord(w.globalIndex)}
                  className={`px-2.5 py-1 rounded-xl text-base sm:text-lg font-bold transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-gradient-to-r from-[#fe9832] to-[#e8872b] text-[#542900] scale-110 shadow-lg font-black ring-2 ring-white/50 animate-pulse'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {w.word}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Instructions */}
      <div className="flex items-center justify-between text-[11px] text-white/50 border-t border-white/10 pt-3">
        <span>Click any word to jump avatar sequence</span>
        <span className="font-mono text-[#8dfc75] font-semibold">100% Approved English Verses</span>
      </div>
    </div>
  );
};

export default JanaGanaManaContent;
