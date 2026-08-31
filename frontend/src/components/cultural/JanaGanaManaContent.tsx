import React from 'react';

export interface LetterToken {
  char: string;
  isLetter: boolean;
  globalLetterIndex: number | null; // null for spaces/punctuation
}

export interface ParagraphStanza {
  stanzaNumber: number;
  title: string;
  lines: {
    lineIndex: number;
    tokens: LetterToken[];
  }[];
}

export interface JanaGanaManaContentProps {
  stanzas: ParagraphStanza[];
  activeLetterIndex: number;
  totalLetters: number;
  onSelectLetter: (globalLetterIndex: number) => void;
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
 * Builds letter-by-letter tokens and paragraph stanzas from approved anthem text.
 */
export function buildParagraphLetterTokens(linesText: string[] = JANA_GANA_MANA_APPROVED_TEXT): {
  stanzas: ParagraphStanza[];
  allLetters: string[];
} {
  let letterCounter = 0;
  const allLetters: string[] = [];

  // Group into 3 natural patriotic stanzas
  const stanzaGroupings = [
    { number: 1, title: 'Invocation of Destiny', lines: linesText.slice(0, 4) },
    { number: 2, title: 'Sacred Rivers & Mountains', lines: linesText.slice(4, 9) },
    { number: 3, title: 'Eternal Victory & Triumph', lines: linesText.slice(9, 13) },
  ];

  let currentLineIndex = 0;

  const stanzas: ParagraphStanza[] = stanzaGroupings.map((group) => {
    const stanzaLines = group.lines.map((lineText) => {
      const tokens: LetterToken[] = [];

      for (let i = 0; i < lineText.length; i++) {
        const char = lineText[i];
        const isLetter = /[a-zA-Z]/.test(char);

        if (isLetter) {
          const uppercaseChar = char.toUpperCase();
          tokens.push({
            char,
            isLetter: true,
            globalLetterIndex: letterCounter,
          });
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

      const lineRes = { lineIndex: currentLineIndex, tokens };
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
}) => {
  return (
    <div className="bg-[#0b1324]/80 backdrop-blur-xl rounded-[28px] border border-white/15 p-6 sm:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
      {/* Tricolor Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#fe9832] via-[#ffffff] to-[#138808] p-0.5 shadow-md">
            <div className="w-full h-full bg-[#030813] rounded-[14px] flex items-center justify-center text-[20px]">
              🇮🇳
            </div>
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">Jana Gana Mana</h2>
            <p className="text-xs text-white/60">English Transliteration • Letter-by-Letter ISL Processing</p>
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

      {/* Paragraph Stanzas Display with Letter-by-Letter Active Highlight */}
      <div className="flex flex-col gap-6 font-['Inter',sans-serif]">
        {stanzas.map((stanza) => (
          <div
            key={stanza.stanzaNumber}
            className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-3 shadow-inner"
          >
            {/* Stanza Header Badge */}
            <div className="flex items-center justify-between text-[11px] border-b border-white/10 pb-2">
              <span className="font-extrabold uppercase tracking-wider text-[#fe9832]">
                Stanza 0{stanza.stanzaNumber} — {stanza.title}
              </span>
            </div>

            {/* Paragraph Line Flow */}
            <div className="flex flex-col gap-2 leading-relaxed">
              {stanza.lines.map((line) => (
                <p key={line.lineIndex} className="text-base sm:text-lg font-bold tracking-wide text-white/90">
                  {line.tokens.map((token, idx) => {
                    if (!token.isLetter || token.globalLetterIndex === null) {
                      return <span key={idx} className="text-white/40">{token.char}</span>;
                    }

                    const isActive = token.globalLetterIndex === activeLetterIndex;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onSelectLetter(token.globalLetterIndex!)}
                        className={`inline-flex items-center justify-center font-mono font-black transition-all rounded px-0.5 cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-[#fe9832] to-[#e8872b] text-[#542900] scale-125 shadow-lg ring-2 ring-white animate-bounce z-10'
                            : 'hover:text-[#fe9832] hover:bg-white/10'
                        }`}
                      >
                        {token.char}
                      </button>
                    );
                  })}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Guidance */}
      <div className="flex items-center justify-between text-[11px] text-white/50 border-t border-white/10 pt-3">
        <span>Click any letter to jump letter sequence</span>
        <span className="font-mono text-[#8dfc75] font-semibold">Sequential Character Engine Active</span>
      </div>
    </div>
  );
};

export default JanaGanaManaContent;
