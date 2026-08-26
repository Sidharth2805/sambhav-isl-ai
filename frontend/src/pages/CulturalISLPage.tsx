import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CulturalItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'Anthem' | 'Song';
  composer: string;
  duration: string;
  badge: string;
  description: string;
  stanzaCount: number;
  lyricsHindi: { stanza: string; lines: string[]; glosses: string }[];
  meaning: string;
  history: string;
}

export const CulturalISLPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'jana-gana' | 'vande-mataram'>('jana-gana');
  const [selectedStanza, setSelectedStanza] = useState<number>(0);

  const culturalItems: Record<'jana-gana' | 'vande-mataram', CulturalItem> = {
    'jana-gana': {
      id: 'jana-gana',
      title: 'Jana Gana Mana',
      subtitle: 'National Anthem of the Republic of India',
      type: 'Anthem',
      composer: 'Gurudev Rabindranath Tagore (1911)',
      duration: '52 seconds official timing',
      badge: '🇮🇳 National Anthem',
      stanzaCount: 3,
      description:
        'The National Anthem of India rendered in authentic Indian Sign Language (ISL) with dignified formal posture, synchronized stanza gestures, and standardized signs approved by the Indian Sign Language Research and Training Centre (ISLRTC).',
      lyricsHindi: [
        {
          stanza: 'Stanza 1: Invocation of Destiny',
          lines: [
            'जन गण मन अधिनायक जय हे, भारत भाग्य विधाता।',
            'पंजाब सिन्धु गुजरात मराठा, द्राविड़ उत्कल बंग।',
            'Jana-gana-mana-adhinayaka jaya he, Bharata-bhagya-vidhata.',
            'Panjaba-Sindhu-Gujarata-Maratha, Dravida-Utkala-Banga.',
          ],
          glosses: 'PEOPLE ALL MINDS RULER VICTORY / INDIA DESTINY CREATOR / NORTH SOUTH EAST WEST ALL STATES UNITE',
        },
        {
          stanza: 'Stanza 2: Sacred Rivers & Mountains',
          lines: [
            'विन्ध्य हिमाचल यमुना गंगा, उच्छल जलधि तरंग।',
            'तव शुभ नामे जागे, तव शुभ आशिष मागे, गाहे तव जय गाथा।',
            'Vindhya-Himachala-Yamuna-Ganga, Uchchhala-jaladhi-taranga.',
            'Tava subha name jage, Tava subha asisa mage, Gahe tava jaya-gatha.',
          ],
          glosses: 'MOUNTAINS MOUNT-VINDHYA HIMALAYA / RIVERS YAMUNA GANGA OCEAN WAVES / HOLY NAME AWAKEN BLESSING ASK SING PRAISE',
        },
        {
          stanza: 'Stanza 3: Eternal Victory & Triumph',
          lines: [
            'जन गण मंगल दायक जय हे, भारत भाग्य विधाता।',
            'जय हे, जय हे, जय हे, जय जय जय जय हे॥',
            'Jana-gana-mangala-dayaka jaya he, Bharata-bhagya-vidhata.',
            'Jaya he, jaya he, jaya he, Jaya jaya jaya jaya he!',
          ],
          glosses: 'ALL CITIZENS WELFARE GIVER VICTORY / INDIA DESTINY CREATOR / VICTORY VICTORY FOREVER VICTORY',
        },
      ],
      meaning:
        'Thou art the ruler of the minds of all people, dispenser of India\'s destiny. Thy name rouses the hearts of Punjab, Sindh, Gujarat, and Maratha, of the Dravida, Utkala, and Bengal; it echoes in the hills of Vindhyas and Himalayas, mingles in the music of Yamuna and Ganga, and is chanted by the waves of the Indian Sea. Victory, victory, victory to thee!',
      history:
        'Originally composed as "Bharoto Bhagyo Bidhata" in Bengali in 1911 by Rabindranath Tagore, the first stanza was formally adopted as India\'s National Anthem by the Constituent Assembly on 24 January 1950.',
    },
    'vande-mataram': {
      id: 'vande-mataram',
      title: 'Vande Mataram',
      subtitle: 'National Song of India',
      type: 'Song',
      composer: 'Bankim Chandra Chatterjee (1882)',
      duration: '65 seconds standard timing',
      badge: '🇮🇳 National Song',
      stanzaCount: 2,
      description:
        'A soulful tribute to the Motherland, rendered in Indian Sign Language expressing deep reverence, natural bounties, flowing rivers, green harvested fields, and collective identity.',
      lyricsHindi: [
        {
          stanza: 'Stanza 1: Ode to the Fertile Motherland',
          lines: [
            'वन्दे मातरम्! सुजलां सुफलां मलयजशीतलाम्,',
            'शस्यश्यामलां मातरम्! वन्दे मातरम्!',
            'Vande Mataram! Sujalam, suphalam, malayaja shitalam,',
            'Shasya shyamalam, Mataram! Vande Mataram!',
          ],
          glosses: 'BOW MOTHERLAND / PURE WATER SWEET FRUITS COOL BREEZE / GREEN FIELDS MOTHER I BOW',
        },
        {
          stanza: 'Stanza 2: Radiant Moonlight & Blossoms',
          lines: [
            'शुभ्रज्योत्स्नापुलकितयामिनीम्, फुल्लकुसुमितद्रुमदलशोभिनीम्,',
            'सुहासिनीं सुमधुर भाषिणीम्, सुखदां वरदां मातरम्! वन्दे मातरम्!',
            'Shubhra jyotsna pulakita yaminim, Phulla kusumita drumadala shobhinim,',
            'Suhasinim sumadhura bhashinim, Sukhadam varadam, Mataram! Vande Mataram!',
          ],
          glosses: 'BRIGHT MOONLIGHT NIGHT / BLOOMING FLOWERS BEAUTIFUL TREES / SWEET SMILE GIVER PEACE MOTHER I BOW',
        },
      ],
      meaning:
        'Mother, I bow to thee! Rich with thy hurrying streams, bright with orchard gleams, cool with thy winds of delight, dark fields waving, Mother of might, Mother free. Glory of moonlight dreams over thy branches and golden streams, clad in thy blossoming trees, Mother, giver of ease, laughing low and sweet! Mother, I bow to thee!',
      history:
        'Written in 1882 by Bankim Chandra Chatterjee in his novel Anandamath. It was sung on the political stage by Rabindranath Tagore at the 1896 session of the Indian National Congress.',
    },
  };

  const current = culturalItems[activeTab];

  return (
    <div className="flex flex-col gap-8 w-full animate-fadeIn font-['Inter',sans-serif]">
      {/* Header */}
      <header className="border-b border-[#e0e3e5] dark:border-[#243044] pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#fe9832] to-[#e8872b] flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-[24px]">flag</span>
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#030813] dark:text-white tracking-tight flex items-center gap-2">
                <span>Sambhav Cultural ISL</span>
                <span className="text-xs font-bold text-[#fe9832] bg-[#fe9832]/10 border border-[#fe9832]/20 px-2.5 py-0.5 rounded-full">
                  Heritage
                </span>
              </h1>
              <p className="text-xs text-[#45474c] dark:text-[#c1c6d7] mt-0.5 font-medium">
                Experience India&apos;s National Anthem & Song rendered in authentic Indian Sign Language.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/learn-isl')}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#151c28] border border-[#e0e3e5] dark:border-[#243044] rounded-2xl text-xs font-bold text-[#030813] dark:text-white hover:border-[#fe9832] hover:scale-105 active:scale-95 transition-all shadow-sm group"
        >
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
          <span>Back to Learn ISL</span>
        </button>
      </header>

      {/* Segmented Tab Controls */}
      <div className="flex p-1.5 bg-[#e0e3e5]/70 dark:bg-[#151c28] border border-[#e0e3e5] dark:border-[#243044] rounded-2xl max-w-xl shadow-inner">
        <button
          onClick={() => {
            setActiveTab('jana-gana');
            setSelectedStanza(0);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-black text-xs transition-all duration-200 ${
            activeTab === 'jana-gana'
              ? 'bg-[#fe9832] text-[#542900] shadow-md scale-[1.02]'
              : 'text-[#45474c] dark:text-[#c1c6d7] hover:text-[#030813] dark:hover:text-white'
          }`}
        >
          <span>🇮🇳</span>
          <span>Jana Gana Mana (Anthem)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('vande-mataram');
            setSelectedStanza(0);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-black text-xs transition-all duration-200 ${
            activeTab === 'vande-mataram'
              ? 'bg-[#fe9832] text-[#542900] shadow-md scale-[1.02]'
              : 'text-[#45474c] dark:text-[#c1c6d7] hover:text-[#030813] dark:hover:text-white'
          }`}
        >
          <span>🌸</span>
          <span>Vande Mataram (Song)</span>
        </button>
      </div>

      {/* Main Experience Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: 3D Avatar Workspace Player Placeholder */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Main Cinematic Video Player Card */}
          <div className="relative aspect-video bg-gradient-to-br from-[#050b17] via-[#0b1426] to-[#0d1e15] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col items-center justify-center p-8 text-center text-white">
            
            {/* Ambient Tricolor Top Glow */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ff9933] via-white to-[#138808]" />

            {/* Glowing Backdrop Ring */}
            <div className="absolute w-72 h-72 rounded-full bg-[#fe9832]/10 blur-3xl pointer-events-none" />

            {/* Pill Status */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold mb-4 text-[#fe9832] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#fe9832] animate-ping" />
              <span>3D ISL Avatar Rendering • Work in Progress</span>
            </div>

            {/* Central Animated Graphic */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#fe9832]/25 to-[#138808]/25 border border-white/20 flex items-center justify-center mb-4 shadow-xl backdrop-blur-sm">
              <span className="material-symbols-outlined text-[44px] text-white">
                sign_language
              </span>
            </div>

            <h2 className="text-2xl font-black tracking-tight mb-2 text-white">
              {current.title} in ISL
            </h2>

            <p className="text-xs text-white/75 max-w-md mb-6 leading-relaxed">
              Our 3D avatar and ML sign synthesis pipeline for national cultural performances is currently in development with native ISL linguists.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                disabled
                className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-2xl text-xs font-bold text-white/50 cursor-not-allowed flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                <span>Play Stanza {selectedStanza + 1} (Coming Soon)</span>
              </button>

              <button
                onClick={() => navigate('/translate')}
                className="px-4 py-2.5 bg-gradient-to-r from-[#fe9832] to-[#e8872b] hover:brightness-110 active:scale-95 text-[#542900] rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-lg"
              >
                <span className="material-symbols-outlined text-[18px]">translate</span>
                <span>Try Live Translation Studio</span>
              </button>
            </div>

            {/* Bottom Metas */}
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-[11px] text-white/60 border-t border-white/10 pt-3">
              <span className="truncate max-w-[220px]">{current.composer}</span>
              <span className="font-semibold text-[#8dfc75]">{current.duration}</span>
            </div>
          </div>

          {/* Stanza Interactive Selector Chips */}
          <div className="bg-white dark:bg-[#151c28] p-5 rounded-3xl border border-[#e0e3e5] dark:border-[#243044] shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#030813] dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[#fe9832]">view_timeline</span>
                <span>Stanza Breakdown & ISL Glosses</span>
              </span>
              <span className="text-[11px] text-gray-400 font-semibold">{current.stanzaCount} Stanzas</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {current.lyricsHindi.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedStanza(idx)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedStanza === idx
                      ? 'bg-[#fe9832]/10 border-[#fe9832] text-[#fe9832] font-bold shadow-sm'
                      : 'bg-[#f8fafc] dark:bg-[#0c121e] border-[#e0e3e5] dark:border-[#243044] text-[#45474c] dark:text-[#c1c6d7] hover:border-gray-400'
                  }`}
                >
                  <span className="text-[10px] font-bold block opacity-70">Section 0{idx + 1}</span>
                  <span className="text-xs font-extrabold truncate block mt-0.5">{s.stanza.split(':')[0]}</span>
                </button>
              ))}
            </div>

            {/* Active Stanza Sign Preview Card */}
            <div className="p-4 bg-gradient-to-br from-[#fe9832]/5 to-[#138808]/5 border border-[#fe9832]/20 rounded-2xl flex flex-col gap-2 mt-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#fe9832]">
                ISL Sign Gloss Sequence ({current.lyricsHindi[selectedStanza].stanza})
              </span>
              <p className="text-xs font-mono font-bold text-[#030813] dark:text-[#8dfc75] leading-relaxed">
                {current.lyricsHindi[selectedStanza].glosses}
              </p>
            </div>
          </div>

          {/* Historical & Cultural Context */}
          <div className="bg-white dark:bg-[#151c28] rounded-3xl p-6 border border-[#e0e3e5] dark:border-[#243044] shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#030813] dark:text-white font-extrabold text-sm">
              <span className="material-symbols-outlined text-[#fe9832]">history_edu</span>
              <span>Historical Significance</span>
            </div>
            <p className="text-xs text-[#45474c] dark:text-[#c1c6d7] leading-relaxed">
              {current.history}
            </p>
          </div>
        </div>

        {/* Right Column: Full Bilingual Lyrics & Translation */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white dark:bg-[#151c28] rounded-3xl p-6 border border-[#e0e3e5] dark:border-[#243044] shadow-sm flex flex-col gap-5">
            <div className="border-b border-[#e0e3e5] dark:border-[#243044] pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#030813] dark:text-white">
                  Verses & Transliteration
                </h3>
                <p className="text-[11px] text-[#45474c] dark:text-[#828796]">Original text & English translation</p>
              </div>
              <span className="text-xs font-extrabold text-[#fe9832] bg-[#fe9832]/10 border border-[#fe9832]/20 px-3 py-1 rounded-full">
                {current.badge}
              </span>
            </div>

            {/* Verses Container */}
            <div className="flex flex-col gap-4">
              {current.lyricsHindi.map((stanzaObj, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedStanza(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedStanza === idx
                      ? 'bg-[#fe9832]/5 border-[#fe9832] ring-1 ring-[#fe9832]'
                      : 'bg-[#f8fafc] dark:bg-[#0c121e] border-[#e0e3e5] dark:border-[#243044] hover:border-gray-400'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase text-[#fe9832] block mb-2">
                    {stanzaObj.stanza}
                  </span>

                  <div className="flex flex-col gap-1 text-xs">
                    <p className="font-extrabold text-[#030813] dark:text-white leading-relaxed">
                      {stanzaObj.lines[0]}
                    </p>
                    <p className="font-extrabold text-[#030813] dark:text-white leading-relaxed">
                      {stanzaObj.lines[1]}
                    </p>
                    <p className="text-[#45474c] dark:text-[#828796] italic text-[11px] mt-1">
                      {stanzaObj.lines[2]}
                    </p>
                    <p className="text-[#45474c] dark:text-[#828796] italic text-[11px]">
                      {stanzaObj.lines[3]}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* English Meaning Section */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#e0e3e5] dark:border-[#243044]">
              <span className="text-xs font-extrabold text-[#030813] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#fe9832] text-[16px]">menu_book</span>
                <span>Complete Poetic Translation</span>
              </span>
              <div className="bg-gradient-to-br from-[#fe9832]/10 via-transparent to-[#138808]/10 p-4 rounded-2xl border border-[#fe9832]/20 text-xs text-[#030813] dark:text-[#f7fafc] leading-relaxed">
                {current.meaning}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default CulturalISLPage;
