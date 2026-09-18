// Ultra-Smooth Natural Human Voice Synthesizer with Multi-Language (English, Odia, Hindi) Speech Support

export interface NaturalVoiceOption {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
  isNatural: boolean;
  score: number;
}

// Comprehensive Odia script to natural phonetic speech transliteration
function transliterateOdiaForSpeech(text: string): string {
  if (!text || !/[\u0B00-\u0B7F]/.test(text)) {
    return text;
  }

  // Common Odia terms & phrases for instant phonetic accuracy
  const phraseMap: Record<string, string> = {
    'ଓଡ଼ିଆ': 'Odia',
    'ସମ୍ଭବ': 'Sambhav',
    'ଡ୍ୟାସବୋର୍ଡ': 'Dashboard',
    'ଅନୁବାଦ': 'Anubaada',
    'ଯୋଗାଯୋଗ': 'Yogayoga',
    'ସାଂସ୍କୃତିକ': 'Saanskrutika',
    'ସାଙ୍କେତିକ ଭାଷା': 'Saanketika Bhaashaa',
    'ଭାରତୀୟ ସାଙ୍କେତିକ ଭାଷା': 'Bhaarateeya Saanketika Bhaashaa',
    'ଭାରତ': 'Bhaarata',
    'ଖବର': 'Khabara',
    'ସମ୍ବାଦ': 'Sambaada',
    'ଶିଖନ୍ତୁ': 'Sikhantu',
    'ସାହାଯ୍ୟ': 'Saahaayya',
    'ପ୍ରୋଫାଇଲ': 'Profile',
    'ଇତିହାସ': 'Itihaasa',
    'ସେଟିଙ୍ଗ୍': 'Settings',
    'ସେଟିଂସ୍': 'Settings',
    'ପ୍ରବେଶ': 'Login',
    'ପଞ୍ଜୀକରଣ': 'Register',
    'ହାର୍ଦ୍ଦିକ ସ୍ୱାଗତ': 'Haardika Swaagata',
    'ଜାତୀୟ ସଙ୍ଗୀତ': 'Jaateeya Sangeeta',
    'ନମସ୍କାର': 'Namaskaara',
    'ଧନ୍ୟବାଦ': 'Dhanyabaada',
    'ସ୍ୱାସ୍ଥ୍ୟସେବା': 'Swaasthya Sebaa',
    'ଡାକ୍ତରଖାନା': 'Daaktarakhaanaa',
    'ଦୈନନ୍ଦିନ': 'Dainandina',
    'କାର୍ଯ୍ୟାଳୟ': 'Kaaryyalaya',
    'ଶିକ୍ଷାନୁଷ୍ଠାନ': 'Sikshaanusthaana',
    'ପ୍ରସାରଣ': 'Prasaarana',
    'ସୁଗମତା': 'Sugamataa',
    'ଅଧିକାର': 'Adhikaara',
  };

  let processed = text;
  for (const [odia, phonetic] of Object.entries(phraseMap)) {
    processed = processed.replaceAll(odia, phonetic);
  }

  if (!/[\u0B00-\u0B7F]/.test(processed)) {
    return processed;
  }

  // Odia character mappings
  const vowels: Record<string, string> = {
    '\u0B05': 'a',
    '\u0B06': 'aa',
    '\u0B07': 'i',
    '\u0B08': 'ee',
    '\u0B09': 'u',
    '\u0B0A': 'oo',
    '\u0B0B': 'ri',
    '\u0B0C': 'li',
    '\u0B0F': 'e',
    '\u0B10': 'ai',
    '\u0B13': 'o',
    '\u0B14': 'au',
  };

  const matras: Record<string, string> = {
    '\u0B3E': 'aa',
    '\u0B3F': 'i',
    '\u0B40': 'ee',
    '\u0B41': 'u',
    '\u0B42': 'oo',
    '\u0B43': 'ri',
    '\u0B47': 'e',
    '\u0B48': 'ai',
    '\u0B4B': 'o',
    '\u0B4C': 'au',
    '\u0B56': 'ai',
    '\u0B57': 'au',
  };

  const consonants: Record<string, string> = {
    '\u0B15': 'k',
    '\u0B16': 'kh',
    '\u0B17': 'g',
    '\u0B18': 'gh',
    '\u0B19': 'ng',
    '\u0B1A': 'ch',
    '\u0B1B': 'chh',
    '\u0B1C': 'j',
    '\u0B1D': 'jh',
    '\u0B1E': 'ny',
    '\u0B1F': 't',
    '\u0B20': 'th',
    '\u0B21': 'd',
    '\u0B22': 'dh',
    '\u0B23': 'n',
    '\u0B24': 't',
    '\u0B25': 'th',
    '\u0B26': 'd',
    '\u0B27': 'dh',
    '\u0B28': 'n',
    '\u0B2A': 'p',
    '\u0B2B': 'ph',
    '\u0B2C': 'b',
    '\u0B2D': 'bh',
    '\u0B2E': 'm',
    '\u0B2F': 'j',
    '\u0B30': 'r',
    '\u0B32': 'l',
    '\u0B33': 'l',
    '\u0B35': 'v',
    '\u0B36': 'sh',
    '\u0B37': 'sh',
    '\u0B38': 's',
    '\u0B39': 'h',
    '\u0B5C': 'r',
    '\u0B5D': 'rh',
    '\u0B5F': 'ya',
    '\u0B71': 'wa',
  };

  const specials: Record<string, string> = {
    '\u0B01': 'n',
    '\u0B02': 'ng',
    '\u0B03': 'h',
    '\u0B70': '',
  };

  const digits: Record<string, string> = {
    '\u0B66': '0',
    '\u0B67': '1',
    '\u0B68': '2',
    '\u0B69': '3',
    '\u0B6A': '4',
    '\u0B6B': '5',
    '\u0B6C': '6',
    '\u0B6D': '7',
    '\u0B6E': '8',
    '\u0B6F': '9',
  };

  let result = '';
  const len = processed.length;

  for (let i = 0; i < len; i++) {
    const ch = processed[i];
    const nextCh = i + 1 < len ? processed[i + 1] : '';

    if (vowels[ch]) {
      result += vowels[ch];
    } else if (consonants[ch]) {
      const base = consonants[ch];
      if (nextCh === '\u0B4D') {
        // Virama (halant) - suppress inherent vowel
        result += base;
        i++;
      } else if (matras[nextCh]) {
        result += base + matras[nextCh];
        i++;
      } else if (nextCh === '\u0B3C') {
        // Nukta handling (e.g. ଡ଼ or ଢ଼)
        const nuktaBase = ch === '\u0B21' ? 'r' : ch === '\u0B22' ? 'rh' : base;
        const afterNukta = i + 2 < len ? processed[i + 2] : '';
        i++;
        if (afterNukta === '\u0B4D') {
          result += nuktaBase;
          i++;
        } else if (matras[afterNukta]) {
          result += nuktaBase + matras[afterNukta];
          i++;
        } else {
          result += nuktaBase + 'a';
        }
      } else {
        result += base + 'a';
      }
    } else if (matras[ch]) {
      result += matras[ch];
    } else if (specials[ch]) {
      result += specials[ch];
    } else if (digits[ch]) {
      result += digits[ch];
    } else if (ch === '\u0B4D' || ch === '\u0B3C') {
      // Standalone virama or nukta
    } else {
      result += ch;
    }
  }

  return result;
}

// Comprehensive Hindi (Devanagari) script to natural phonetic speech transliteration
function transliterateHindiForSpeech(text: string): string {
  if (!text || !/[\u0900-\u097F]/.test(text)) {
    return text;
  }

  // Common Hindi UI terms & phrases for instant phonetic accuracy
  const phraseMap: Record<string, string> = {
    'हिन्दी': 'Hindi',
    'सम्भव': 'Sambhav',
    'डैशबोर्ड': 'Dashboard',
    'अनुवाद': 'Anuvaad',
    'संवाद': 'Samvaad',
    'सांस्कृतिक': 'Saanskritik',
    'सांकेतिक भाषा': 'Saanketik Bhaashaa',
    'भारतीय सांकेतिक भाषा': 'Bhaarateeya Saanketik Bhaashaa',
    'भारत': 'Bhaarat',
    'समाचार': 'Samaachaar',
    'खबरें': 'Khabrein',
    'सीखें': 'Seekhein',
    'सहायता': 'Sahaayataa',
    'मदद': 'Madad',
    'प्रोफ़ाइल': 'Profile',
    'इतिहास': 'Itihaas',
    'सेटिंग्स': 'Settings',
    'सेटिंग': 'Setting',
    'लॉग इन': 'Login',
    'साइन अप': 'Sign Up',
    'पंजीकरण': 'Panjeekaran',
    'हार्दिक स्वागत': 'Haardik Swaagat',
    'स्वागत': 'Swaagat',
    'राष्ट्रगान': 'Raashtragaan',
    'नमस्ते': 'Namaste',
    'धन्यवाद': 'Dhanyavaad',
    'स्वास्थ्य सेवा': 'Swaasthya Sevaa',
    'अस्पताल': 'Aspataal',
    'दैनिक बातचीत': 'Dainik Baatcheet',
    'कार्यालय': 'Kaaryaalay',
    'संस्थान': 'Sansthaan',
    'प्रसारण': 'Prasaaran',
    'सुगमता': 'Sugamataa',
    'अधिकार': 'Adhikaar',
    'हाँ': 'Haan',
    'नहीं': 'Nahin',
    'कृपया': 'Kripayaa',
  };

  let processed = text;
  for (const [hindi, phonetic] of Object.entries(phraseMap)) {
    processed = processed.replaceAll(hindi, phonetic);
  }

  if (!/[\u0900-\u097F]/.test(processed)) {
    return processed;
  }

  // Hindi Devanagari character mappings
  const vowels: Record<string, string> = {
    '\u0905': 'a',
    '\u0906': 'aa',
    '\u0907': 'i',
    '\u0908': 'ee',
    '\u0909': 'u',
    '\u090A': 'oo',
    '\u090B': 'ri',
    '\u090F': 'e',
    '\u0910': 'ai',
    '\u0913': 'o',
    '\u0914': 'au',
    '\u090D': 'e',
    '\u0911': 'o',
  };

  const matras: Record<string, string> = {
    '\u093E': 'aa',
    '\u093F': 'i',
    '\u0940': 'ee',
    '\u0941': 'u',
    '\u0942': 'oo',
    '\u0943': 'ri',
    '\u0947': 'e',
    '\u0948': 'ai',
    '\u094B': 'o',
    '\u094C': 'au',
    '\u0945': 'e',
    '\u0949': 'o',
  };

  const consonants: Record<string, string> = {
    '\u0915': 'k',
    '\u0916': 'kh',
    '\u0917': 'g',
    '\u0918': 'gh',
    '\u0919': 'ng',
    '\u091A': 'ch',
    '\u091B': 'chh',
    '\u091C': 'j',
    '\u091D': 'jh',
    '\u091E': 'ny',
    '\u091F': 't',
    '\u0920': 'th',
    '\u0921': 'd',
    '\u0922': 'dh',
    '\u0923': 'n',
    '\u0924': 't',
    '\u0925': 'th',
    '\u0926': 'd',
    '\u0927': 'dh',
    '\u0928': 'n',
    '\u0929': 'n',
    '\u092A': 'p',
    '\u092B': 'ph',
    '\u092C': 'b',
    '\u092D': 'bh',
    '\u092E': 'm',
    '\u092F': 'y',
    '\u0930': 'r',
    '\u0931': 'r',
    '\u0932': 'l',
    '\u0933': 'l',
    '\u0935': 'v',
    '\u0936': 'sh',
    '\u0937': 'sh',
    '\u0938': 's',
    '\u0939': 'h',
    '\u0958': 'q',
    '\u0959': 'kh',
    '\u095A': 'gh',
    '\u095B': 'z',
    '\u095C': 'r',
    '\u095D': 'rh',
    '\u095E': 'f',
    '\u095F': 'y',
  };

  const specials: Record<string, string> = {
    '\u0901': 'n',
    '\u0902': 'n',
    '\u0903': 'h',
  };

  const digits: Record<string, string> = {
    '\u0966': '0',
    '\u0967': '1',
    '\u0968': '2',
    '\u0969': '3',
    '\u096A': '4',
    '\u096B': '5',
    '\u096C': '6',
    '\u096D': '7',
    '\u096E': '8',
    '\u096F': '9',
  };

  let result = '';
  const len = processed.length;

  for (let i = 0; i < len; i++) {
    const ch = processed[i];
    const nextCh = i + 1 < len ? processed[i + 1] : '';

    if (vowels[ch]) {
      result += vowels[ch];
    } else if (consonants[ch]) {
      const base = consonants[ch];
      if (nextCh === '\u094D') {
        // Virama (halant) - suppress inherent vowel
        result += base;
        i++;
      } else if (matras[nextCh]) {
        result += base + matras[nextCh];
        i++;
      } else if (nextCh === '\u093C') {
        // Nukta handling (e.g. ज़ or फ़ or ड़)
        const nuktaBase = ch === '\u0921' ? 'r' : ch === '\u0922' ? 'rh' : ch === '\u091C' ? 'z' : ch === '\u092B' ? 'f' : base;
        const afterNukta = i + 2 < len ? processed[i + 2] : '';
        i++;
        if (afterNukta === '\u094D') {
          result += nuktaBase;
          i++;
        } else if (matras[afterNukta]) {
          result += nuktaBase + matras[afterNukta];
          i++;
        } else {
          result += nuktaBase + 'a';
        }
      } else {
        result += base + 'a';
      }
    } else if (matras[ch]) {
      result += matras[ch];
    } else if (specials[ch]) {
      result += specials[ch];
    } else if (digits[ch]) {
      result += digits[ch];
    } else if (ch === '\u094D' || ch === '\u093C') {
      // Standalone virama or nukta
    } else {
      result += ch;
    }
  }

  return result;
}

class NaturalSpeechEngine {
  private static instance: NaturalSpeechEngine;
  private voices: SpeechSynthesisVoice[] = [];
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  public isSpeaking = false;

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  public static getInstance(): NaturalSpeechEngine {
    if (!NaturalSpeechEngine.instance) {
      NaturalSpeechEngine.instance = new NaturalSpeechEngine();
    }
    return NaturalSpeechEngine.instance;
  }

  private loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.voices = window.speechSynthesis.getVoices() || [];
  }

  // Find the highest-quality human/neural voice installed on user's system
  public findBestNaturalVoice(_langCode: string = 'en'): SpeechSynthesisVoice | null {
    if (!this.voices.length && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices() || [];
    }
    if (!this.voices.length) return null;

    const scored = this.voices.map((v) => {
      let score = 0;
      const lowerName = v.name.toLowerCase();
      const lowerLang = v.lang.toLowerCase();

      // Highest priority: Modern Neural / Natural voices
      if (lowerName.includes('natural') || lowerName.includes('neural') || lowerName.includes('online')) score += 50;
      if (lowerName.includes('google')) score += 35;
      if (lowerName.includes('premium') || lowerName.includes('enhanced')) score += 30;
      if (lowerName.includes('siri') || lowerName.includes('aria') || lowerName.includes('jenny') || lowerName.includes('guy')) score += 25;
      if (lowerName.includes('neerja') || lowerName.includes('prabhat') || lowerName.includes('heera') || lowerName.includes('ravi') || lowerName.includes('madhur') || lowerName.includes('swara')) score += 30;

      // Locale matching
      if (lowerLang.includes('or') || lowerLang.includes('odia')) score += 30;
      if (lowerLang.includes('hi-in') || lowerLang.includes('hi_in') || lowerLang.startsWith('hi')) score += 25;
      if (lowerLang.includes('en-in') || lowerLang.includes('en_in')) score += 20;
      else if (lowerLang.includes('en-us') || lowerLang.includes('en-gb')) score += 15;
      else if (lowerLang.startsWith('en')) score += 10;

      // Demote robotic legacy synthesizers
      if (lowerName.includes('desktop') && !lowerName.includes('natural')) score -= 15;
      if (lowerName.includes('espeak') || lowerName.includes('synth')) score -= 20;

      return { voice: v, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.voice || this.voices[0] || null;
  }

  public getAvailableVoices(): NaturalVoiceOption[] {
    if (!this.voices.length && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices() || [];
    }

    return this.voices
      .filter((v) => v.lang.startsWith('en') || v.lang.startsWith('hi') || v.lang.startsWith('or'))
      .map((v) => {
        const lowerName = v.name.toLowerCase();
        const isNatural = lowerName.includes('natural') || lowerName.includes('neural') || lowerName.includes('google') || lowerName.includes('online');
        return {
          voice: v,
          name: v.name,
          lang: v.lang,
          isNatural,
          score: isNatural ? 10 : 1,
        };
      })
      .sort((a, b) => (b.isNatural ? 1 : 0) - (a.isNatural ? 1 : 0));
  }

  // Pre-process text to make pronunciation natural, continuous, and conversational
  private cleanTextForSpeech(text: string): string {
    if (!text) return '';

    // 1. Convert Odia and Hindi script text into natural phonetic speech for the neural voice
    let cleaned = transliterateOdiaForSpeech(text.trim());
    cleaned = transliterateHindiForSpeech(cleaned);

    return cleaned
      // Expand abbreviations into clear speech
      .replace(/\bISL\b/gi, 'Indian Sign Language')
      .replace(/\bDr\.\b/gi, 'Doctor')
      .replace(/\bMr\.\b/gi, 'Mister')
      .replace(/\bMrs\.\b/gi, 'Missus')
      .replace(/\bMsg\b/gi, 'Message')
      .replace(/\bPlz\b/gi, 'Please')
      .replace(/\bThx\b/gi, 'Thank you')
      // Smooth out stuttered periods and commas to create natural breathing pauses
      .replace(/\.{2,}/g, ', ')
      .replace(/[,;]+/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  public speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      voiceName?: string;
      onEnd?: () => void;
      onError?: () => void;
    }
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const cleaned = this.cleanTextForSpeech(text);
    if (!cleaned) return;

    // Cancel previous speech smoothly and resume if paused
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch {}

    const playSpeech = () => {
      try {
        if (!this.voices.length) {
          this.loadVoices();
        }

        const utterance = new SpeechSynthesisUtterance(cleaned);

        // Pick best voice
        let selectedVoice: SpeechSynthesisVoice | null = null;
        if (options?.voiceName) {
          selectedVoice = this.voices.find((v) => v.name === options.voiceName) || null;
        }
        if (!selectedVoice) {
          selectedVoice = this.findBestNaturalVoice();
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
          utterance.lang = selectedVoice.lang;
        } else {
          utterance.lang = 'en-IN';
        }

        // Natural human cadence settings
        utterance.rate = options?.rate ?? 0.96;
        utterance.pitch = options?.pitch ?? 1.02;
        utterance.volume = 1.0;

        this.activeUtterance = utterance;
        // Keep global window reference to prevent Chrome V8 Garbage Collection bug
        (window as any)._activeSpeechUtterance = utterance;

        utterance.onstart = () => {
          this.isSpeaking = true;
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          this.activeUtterance = null;
          (window as any)._activeSpeechUtterance = null;
          options?.onEnd?.();
        };

        utterance.onerror = (e) => {
          if (e.error !== 'interrupted' && e.error !== 'canceled') {
            console.warn('[NaturalSpeech] synthesis error:', e);
          }
          this.isSpeaking = false;
          this.activeUtterance = null;
          (window as any)._activeSpeechUtterance = null;
          options?.onError?.();
        };

        // Resume if stalled
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('[NaturalSpeech] Speak error:', err);
        options?.onError?.();
      }
    };

    setTimeout(playSpeech, 100);
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.activeUtterance = null;
    }
  }

  public isCurrentlySpeaking(): boolean {
    return this.isSpeaking || !!this.activeUtterance || (typeof window !== 'undefined' && !!window.speechSynthesis?.speaking);
  }
}

export const naturalSpeech = NaturalSpeechEngine.getInstance();
