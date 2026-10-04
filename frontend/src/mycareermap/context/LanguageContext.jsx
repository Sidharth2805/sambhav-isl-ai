import React, { createContext, useContext, useState, useEffect } from 'react';

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
];

const TRANSLATIONS = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      careers: 'Careers',
      roadmap: 'Roadmap',
      opportunities: 'Opportunities',
      learning: 'Learning Hub',
      prep: 'Interview Prep',
      collaborate: 'Collaborate',
      insights: 'Talent Insights',
      jobFinder: 'Job & Career Finder',
      uploadResume: 'Upload Resume',
      signIn: 'Log in',
      getStarted: 'Get Started',
      signOut: 'Sign Out',
    },
    common: {
      searchPlaceholder: 'Search careers, skills, or actions (Ctrl+K)...',
      match: 'Match',
      strongMatch: 'Strong Match',
      moderateMatch: 'Moderate Match',
      skillGap: 'Skill Gap',
      viewBlueprint: 'View Blueprint',
      buildRoadmap: 'Build Roadmap',
      verified: 'Verified',
      evidenceBacked: 'Evidence Backed',
    },
  },
  hi: {
    nav: {
      dashboard: 'डैशबोर्ड',
      careers: 'करियर विकल्प',
      roadmap: 'रोडमैप',
      opportunities: 'अवसर',
      learning: 'लर्निंग हब',
      prep: 'इंटरव्यू तैयारी',
      collaborate: 'सहयोग',
      insights: 'टैलेंट इनसाइट्स',
      jobFinder: 'करियर खोजें',
      uploadResume: 'बायोडाटा अपलोड करें',
      signIn: 'लॉग इन',
      getStarted: 'शुरू करें',
      signOut: 'साइन आउट',
    },
    common: {
      searchPlaceholder: 'करियर, कौशल या कार्य खोजें (Ctrl+K)...',
      match: 'मैच',
      strongMatch: 'मजबूत मैच',
      moderateMatch: 'मध्यम मैच',
      skillGap: 'कौशल अंतर',
      viewBlueprint: 'ब्लूप्रिंट देखें',
      buildRoadmap: 'रोडमैप बनाएं',
      verified: 'सत्यापित',
      evidenceBacked: 'साक्ष्य-आधारित',
    },
  },
  bn: {
    nav: {
      dashboard: 'ড্যাশবোর্ড',
      careers: 'ক্যারিয়ার',
      roadmap: 'রোডম্যাপ',
      opportunities: 'সুযোগ',
      learning: 'লার্নিং হাব',
      prep: 'ইন্টারভিউ প্রস্তুতি',
      collaborate: 'সহযোগিতা',
      insights: 'ট্যালেন্ট ইনসাইটস',
      jobFinder: 'ক্যারিয়ার খুঁজুন',
      uploadResume: 'রেজুমে আপলোড',
      signIn: 'লগ ইন',
      getStarted: 'শুরু করুন',
      signOut: 'সাইন আউট',
    },
    common: {
      searchPlaceholder: 'ক্যারিয়ার, দক্ষতা খুঁজুন (Ctrl+K)...',
      match: 'ম্যাচ',
      strongMatch: 'শক্তিশালী ম্যাচ',
      moderateMatch: 'মাঝারি ম্যাচ',
      skillGap: 'দক্ষতার ব্যবধান',
      viewBlueprint: 'ব্লুপ্রিন্ট দেখুন',
      buildRoadmap: 'রোডম্যাপ তৈরি করুন',
      verified: 'যাচাইকৃত',
      evidenceBacked: 'প্রমাণ-ভিত্তিক',
    },
  },
  te: {
    nav: {
      dashboard: 'డ్యాష్‌బోర్డ్',
      careers: 'కెరీర్ మార్గాలు',
      roadmap: 'రోడ్‌మ్యాప్',
      opportunities: 'అవకాశాలు',
      learning: 'లెర్నింగ్ హబ్',
      prep: 'ఇంటర్వ్యూ ప్రిపరేషన్',
      collaborate: 'సహకారం',
      insights: 'టాలెంట్ ఇన్‌సైట్స్',
      jobFinder: 'కెరీర్ కనుగొనండి',
      uploadResume: 'రెజ్యూమ్ అప్‌లోడ్',
      signIn: 'లాగిన్',
      getStarted: 'ప్రారంభించండి',
      signOut: 'సైన్ అవుట్',
    },
    common: {
      searchPlaceholder: 'కెరీర్‌లు, నైపుణ్యాలను శోధించండి (Ctrl+K)...',
      match: 'మ్యాచ్',
      strongMatch: 'బలమైన మ్యాచ్',
      moderateMatch: 'మధ్యస్థ మ్యాచ్',
      skillGap: 'నైపుణ్య అంతరం',
      viewBlueprint: 'బ్లూప్రింట్ చూడండి',
      buildRoadmap: 'రోడ్‌మ్యాప్ నిర్మించండి',
      verified: 'ధృవీకరించబడింది',
      evidenceBacked: 'సాక్ష్యం-ఆధారిత',
    },
  },
  ta: {
    nav: {
      dashboard: 'டாஷ்போர்டு',
      careers: 'தொழில் வழிகள்',
      roadmap: 'வழிகாட்டி வரைபடம்',
      opportunities: 'வாய்ப்புகள்',
      learning: 'கற்றல் மையம்',
      prep: 'நேர்காணல் தயாரிப்பு',
      collaborate: 'இணைந்து செயல்படுதல்',
      insights: 'திறன் நுண்ணறிவு',
      jobFinder: 'தொழிலை கண்டறியவும்',
      uploadResume: 'சுயவிவரம் பதிவேற்றுக',
      signIn: 'உள்நுழைக',
      getStarted: 'தொடங்கவும்',
      signOut: 'வெளியேறு',
    },
    common: {
      searchPlaceholder: 'தொழில், திறன்களைத் தேடுக (Ctrl+K)...',
      match: 'பொருத்தம்',
      strongMatch: 'வலுவான பொருத்தம்',
      moderateMatch: 'மிதமான பொருத்தம்',
      skillGap: 'திறன் இடைவெளி',
      viewBlueprint: 'திட்டத்தை காண்க',
      buildRoadmap: 'வழிகாட்டி உருவாக்குக',
      verified: 'சரிபார்க்கப்பட்டது',
      evidenceBacked: 'சான்றளிக்கப்பட்ட',
    },
  },
  mr: {
    nav: {
      dashboard: 'डॅशबोर्ड',
      careers: 'करिअर मार्ग',
      roadmap: 'रोडमॅप',
      opportunities: 'संधी',
      learning: 'लर्निंग हब',
      prep: 'मुलाखत तयारी',
      collaborate: 'सहकार्य',
      insights: 'टॅलेंट इनसाइट्स',
      jobFinder: 'करिअर शोधा',
      uploadResume: 'रेझ्युमे अपलोड करा',
      signIn: 'लॉग इन करा',
      getStarted: 'सुरू करा',
      signOut: 'साइन आउट',
    },
    common: {
      searchPlaceholder: 'करिअर, कौशल्ये शोधा (Ctrl+K)...',
      match: 'मॅच',
      strongMatch: 'उत्तम मॅच',
      moderateMatch: 'मध्यम मॅच',
      skillGap: 'कौशल्य अंतर',
      viewBlueprint: 'ब्लूप्रिंट पहा',
      buildRoadmap: 'रोडमॅप तयार करा',
      verified: 'प्रमाणित',
      evidenceBacked: 'पुरावा-आधारित',
    },
  },
  gu: {
    nav: {
      dashboard: 'ડેશબોર્ડ',
      careers: 'કારકિર્દી વિકલ્પો',
      roadmap: 'રોડમેપ',
      opportunities: 'તકો',
      learning: 'લર્નિંગ હબ',
      prep: 'ઇન્ટરવ્યુ તૈયારી',
      collaborate: 'સહયોગ',
      insights: 'ટેલેન્ટ ઇનસાઇટ્સ',
      jobFinder: 'કારકિર્દી શોધો',
      uploadResume: 'રેઝ્યૂમે અપલોડ કરો',
      signIn: 'લૉગ ઇન',
      getStarted: 'શરૂ કરો',
      signOut: 'સાઇન આઉટ',
    },
    common: {
      searchPlaceholder: 'કારકિર્દી, કુશળતા શોધો (Ctrl+K)...',
      match: 'મેચ',
      strongMatch: 'મજબૂત મેચ',
      moderateMatch: 'મધ્યમ મેચ',
      skillGap: 'કુશળતા અંતર',
      viewBlueprint: 'બ્લૂપ્રિન્ટ જુઓ',
      buildRoadmap: 'રોડમેપ બનાવો',
      verified: 'ચકાસાયેલ',
      evidenceBacked: 'પુરાવા-આધારિત',
    },
  },
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('mycareermap_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('mycareermap_lang', currentLanguage);
  }, [currentLanguage]);

  const t = (keyPath, fallback = '') => {
    const keys = keyPath.split('.');
    let dict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
    let fallbackDict = TRANSLATIONS.en;

    let result = dict;
    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k];
      } else {
        result = undefined;
        break;
      }
    }

    if (result !== undefined) return result;

    let fallbackResult = fallbackDict;
    for (const k of keys) {
      if (fallbackResult && fallbackResult[k] !== undefined) {
        fallbackResult = fallbackResult[k];
      } else {
        return fallback || keyPath;
      }
    }

    return fallbackResult || fallback || keyPath;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage: setCurrentLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      currentLanguage: 'en',
      setLanguage: () => {},
      t: (k, fb) => fb || k,
      languages: LANGUAGES,
    };
  }
  return ctx;
};
