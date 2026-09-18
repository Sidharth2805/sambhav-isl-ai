import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { SupportedLanguage, LanguageInfo } from '../i18n/translations';
import {
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  GLOBAL_PHRASES_EN_TO_HI,
  GLOBAL_PHRASES_EN_TO_OR
} from '../i18n/translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  currentLanguageInfo: LanguageInfo;
  supportedLanguages: LanguageInfo[];
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'sambhav-language';

// Keep track of original text node content
const originalTextMap = new WeakMap<Node, string>();
const originalPlaceholderMap = new WeakMap<Element, string>();

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage;
      if (saved === 'en' || saved === 'hi' || saved === 'or') {
        return saved;
      }
    } catch {
      // Ignore
    }
    return 'en';
  });

  const isTranslatingRef = useRef(false);

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch {
      // Ignore
    }
  }, []);

  // Update HTML lang tag and font class
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', language);
    root.classList.remove('lang-en', 'lang-hi', 'lang-or');
    root.classList.add(`lang-${language}`);
  }, [language]);

  const currentLanguageInfo = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const langDict = TRANSLATIONS[language];
      if (langDict && langDict[key]) {
        return langDict[key];
      }
      // Fallback to English
      const enDict = TRANSLATIONS.en;
      if (enDict && enDict[key]) {
        return enDict[key];
      }
      return fallback || key;
    },
    [language]
  );

  // Active DOM Translation Engine
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const phrases = language === 'hi' ? GLOBAL_PHRASES_EN_TO_HI : language === 'or' ? GLOBAL_PHRASES_EN_TO_OR : null;

    const translateText = (text: string): string => {
      if (!phrases || !text.trim()) return text;
      let translated = text;
      for (const [enPhrase, targetPhrase] of phrases) {
        if (translated.includes(enPhrase)) {
          translated = translated.split(enPhrase).join(targetPhrase);
        }
      }
      return translated;
    };

    const processTextNode = (node: Node) => {
      const parent = node.parentElement;
      if (!parent) return;
      const tagName = parent.tagName;
      if (
        tagName === 'SCRIPT' ||
        tagName === 'STYLE' ||
        tagName === 'CODE' ||
        tagName === 'PRE' ||
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        parent.closest('[translate="no"]') ||
        parent.closest('[data-no-translate]') ||
        parent.classList.contains('material-symbols-outlined') ||
        parent.classList.contains('font-mono')
      ) {
        return;
      }

      const currentVal = node.nodeValue || '';
      if (!currentVal.trim()) return;

      if (language === 'en') {
        if (originalTextMap.has(node)) {
          const orig = originalTextMap.get(node);
          if (orig !== undefined && node.nodeValue !== orig) {
            node.nodeValue = orig;
          }
        }
      } else {
        if (!originalTextMap.has(node)) {
          originalTextMap.set(node, currentVal);
        }
        const orig = originalTextMap.get(node) || currentVal;
        const translated = translateText(orig);
        if (translated !== node.nodeValue) {
          node.nodeValue = translated;
        }
      }
    };

    const processElementPlaceholders = (el: Element) => {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        const input = el as HTMLInputElement | HTMLTextAreaElement;
        const currentPlaceholder = input.getAttribute('placeholder');
        if (!currentPlaceholder) return;

        if (language === 'en') {
          if (originalPlaceholderMap.has(input)) {
            const orig = originalPlaceholderMap.get(input);
            if (orig) input.setAttribute('placeholder', orig);
          }
        } else {
          if (!originalPlaceholderMap.has(input)) {
            originalPlaceholderMap.set(input, currentPlaceholder);
          }
          const orig = originalPlaceholderMap.get(input) || currentPlaceholder;
          const translated = translateText(orig);
          if (translated !== currentPlaceholder) {
            input.setAttribute('placeholder', translated);
          }
        }
      }
    };

    const walkDom = (root: Node) => {
      if (isTranslatingRef.current) return;
      isTranslatingRef.current = true;

      try {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
        let node: Node | null = walker.nextNode();
        while (node) {
          processTextNode(node);
          node = walker.nextNode();
        }

        // Also translate placeholders
        const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
        inputs.forEach(processElementPlaceholders);
      } finally {
        isTranslatingRef.current = false;
      }
    };

    // Run initial DOM pass
    walkDom(document.body);

    // Watch for dynamic DOM changes (e.g. route transitions, opened modals, dynamic cards)
    const observer = new MutationObserver((mutations) => {
      if (isTranslatingRef.current) return;

      let shouldRun = false;
      for (const m of mutations) {
        if (m.type === 'childList' && m.addedNodes.length > 0) {
          shouldRun = true;
          break;
        }
      }

      if (shouldRun) {
        requestAnimationFrame(() => {
          walkDom(document.body);
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currentLanguageInfo,
        supportedLanguages: SUPPORTED_LANGUAGES,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslation = () => {
  const { t, language, setLanguage, currentLanguageInfo, supportedLanguages } = useLanguage();
  return { t, language, setLanguage, currentLanguageInfo, supportedLanguages };
};
