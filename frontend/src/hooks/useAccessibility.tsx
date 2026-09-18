import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { SupportedLanguage, LanguageInfo } from '../i18n/translations';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../i18n/translations';

export type FontSize = 'small' | 'normal' | 'large' | 'xlarge';
export type Theme = 'light' | 'dark';
export type ColorFilter = 'none' | 'monochrome' | 'high-saturate' | 'low-saturate' | 'invert';

export interface AccessibilitySettings {
  // Language & Localization
  language: SupportedLanguage;

  // Color Adjustment
  colorFilter: ColorFilter;

  // Content Adjustment
  textScale: number; // 0: 100%, 1: 115%, 2: 130%, 3: 145%
  lineHeight: boolean;
  textSpacing: boolean;
  highlightLinks: boolean;
  dyslexiaFriendly: boolean;
  textMagnifier: boolean;

  // Orientation Adjustment
  screenReader: boolean;
  voiceSupport: boolean;
  hideImages: boolean;
  readingGuideline: boolean;
  focusMode: boolean;
  bigCursor: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  language: 'en',
  colorFilter: 'none',
  textScale: 0,
  lineHeight: false,
  textSpacing: false,
  highlightLinks: false,
  dyslexiaFriendly: false,
  textMagnifier: false,
  screenReader: false,
  voiceSupport: false,
  hideImages: false,
  readingGuideline: false,
  focusMode: false,
  bigCursor: false,
};

interface AccessibilityContextType {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;

  // Language & Translations
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  currentLanguageInfo: LanguageInfo;
  supportedLanguages: LanguageInfo[];
  t: (key: string, fallback?: string) => string;

  // Legacy compatibility
  highContrast: boolean;
  setHighContrast: (active: boolean) => void;
  toggleHighContrast: () => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;

  // Modern UX4G Accessibility Suite
  settings: AccessibilitySettings;
  setColorFilter: (filter: ColorFilter) => void;
  setTextScale: (scale: number) => void;
  increaseTextScale: () => void;
  decreaseTextScale: () => void;
  toggleLineHeight: () => void;
  toggleTextSpacing: () => void;
  toggleHighlightLinks: () => void;
  toggleDyslexiaFriendly: () => void;
  toggleTextMagnifier: () => void;
  toggleScreenReader: () => void;
  toggleVoiceSupport: () => void;
  toggleHideImages: () => void;
  toggleReadingGuideline: () => void;
  toggleFocusMode: () => void;
  toggleBigCursor: () => void;
  resetAllSettings: () => void;

  // Modal Dialog Controls
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;

  // Active Count
  activeFeaturesCount: number;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const STORAGE_KEY = 'sambhav-accessibility-suite';
const LANGUAGE_STORAGE_KEY = 'sambhav-language';

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme State
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('sambhav-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Modern Accessibility Settings State
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore parse errors
    }
    return DEFAULT_SETTINGS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync Theme
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('sambhav-theme', newTheme);
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  // Helpers to update individual settings
  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setColorFilter = (filter: ColorFilter) => updateSetting('colorFilter', filter);
  const setTextScale = (scale: number) => updateSetting('textScale', Math.max(0, Math.min(3, scale)));
  const increaseTextScale = () => updateSetting('textScale', Math.min(3, settings.textScale + 1));
  const decreaseTextScale = () => updateSetting('textScale', Math.max(0, settings.textScale - 1));
  const toggleLineHeight = () => updateSetting('lineHeight', !settings.lineHeight);
  const toggleTextSpacing = () => updateSetting('textSpacing', !settings.textSpacing);
  const toggleHighlightLinks = () => updateSetting('highlightLinks', !settings.highlightLinks);
  const toggleDyslexiaFriendly = () => updateSetting('dyslexiaFriendly', !settings.dyslexiaFriendly);
  const toggleTextMagnifier = () => updateSetting('textMagnifier', !settings.textMagnifier);
  const toggleScreenReader = () => updateSetting('screenReader', !settings.screenReader);
  const toggleVoiceSupport = () => updateSetting('voiceSupport', !settings.voiceSupport);
  const toggleHideImages = () => updateSetting('hideImages', !settings.hideImages);
  const toggleReadingGuideline = () => updateSetting('readingGuideline', !settings.readingGuideline);
  const toggleFocusMode = () => updateSetting('focusMode', !settings.focusMode);
  const toggleBigCursor = () => updateSetting('bigCursor', !settings.bigCursor);

  // Language State
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage;
      if (savedLang === 'en' || savedLang === 'hi' || savedLang === 'or') {
        return savedLang;
      }
      if (settings.language === 'en' || settings.language === 'hi' || settings.language === 'or') {
        return settings.language;
      }
    } catch {
      // Ignore
    }
    return 'en';
  });

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    updateSetting('language', newLang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch {
      // Ignore
    }
  }, [updateSetting]);

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

  const resetAllSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setLanguageState('en');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Modal handlers
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const toggleModal = () => setIsModalOpen((prev) => !prev);

  // Legacy mappings for backwards compatibility
  const fontSize: FontSize = settings.textScale === 0 ? 'normal' : settings.textScale === 1 ? 'large' : 'xlarge';
  const setFontSize = (size: FontSize) => {
    if (size === 'small' || size === 'normal') setTextScale(0);
    else if (size === 'large') setTextScale(1);
    else setTextScale(2);
  };
  const increaseFontSize = increaseTextScale;
  const decreaseFontSize = decreaseTextScale;
  const highContrast = settings.colorFilter === 'high-saturate';
  const setHighContrast = (active: boolean) => setColorFilter(active ? 'high-saturate' : 'none');
  const toggleHighContrast = () => setColorFilter(settings.colorFilter === 'high-saturate' ? 'none' : 'high-saturate');

  // Count active non-default features
  const activeFeaturesCount =
    (language !== 'en' ? 1 : 0) +
    (settings.colorFilter !== 'none' ? 1 : 0) +
    (settings.textScale > 0 ? 1 : 0) +
    (settings.lineHeight ? 1 : 0) +
    (settings.textSpacing ? 1 : 0) +
    (settings.highlightLinks ? 1 : 0) +
    (settings.dyslexiaFriendly ? 1 : 0) +
    (settings.textMagnifier ? 1 : 0) +
    (settings.screenReader ? 1 : 0) +
    (settings.voiceSupport ? 1 : 0) +
    (settings.hideImages ? 1 : 0) +
    (settings.readingGuideline ? 1 : 0) +
    (settings.focusMode ? 1 : 0) +
    (settings.bigCursor ? 1 : 0);

  // Sync DOM Classes & Styles
  useEffect(() => {
    const root = document.documentElement;

    // Language
    root.setAttribute('lang', language);
    root.classList.remove('lang-en', 'lang-hi', 'lang-or');
    root.classList.add(`lang-${language}`);

    // Theme
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    // Color Filters
    root.classList.remove('a11y-monochrome', 'a11y-high-saturate', 'a11y-low-saturate', 'a11y-invert');
    if (settings.colorFilter === 'monochrome') root.classList.add('a11y-monochrome');
    else if (settings.colorFilter === 'high-saturate') root.classList.add('a11y-high-saturate');
    else if (settings.colorFilter === 'low-saturate') root.classList.add('a11y-low-saturate');
    else if (settings.colorFilter === 'invert') root.classList.add('a11y-invert');

    // Text Scale
    root.classList.remove('text-scale-0', 'text-scale-1', 'text-scale-2', 'text-scale-3', 'text-small', 'text-large', 'text-xlarge');
    root.classList.add(`text-scale-${settings.textScale}`);
    if (settings.textScale === 1) root.classList.add('text-large');
    else if (settings.textScale >= 2) root.classList.add('text-xlarge');

    // Content Adjustments
    root.classList.toggle('a11y-line-height', settings.lineHeight);
    root.classList.toggle('a11y-text-spacing', settings.textSpacing);
    root.classList.toggle('a11y-highlight-links', settings.highlightLinks);
    root.classList.toggle('a11y-dyslexia', settings.dyslexiaFriendly);

    // Orientation Adjustments
    root.classList.toggle('a11y-hide-images', settings.hideImages);
    root.classList.toggle('a11y-big-cursor', settings.bigCursor);
    root.classList.toggle('a11y-focus-mode-active', settings.focusMode);
    root.classList.toggle('a11y-screen-reader-active', settings.screenReader);
  }, [theme, settings, language]);

  return (
    <AccessibilityContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        language,
        setLanguage,
        currentLanguageInfo,
        supportedLanguages: SUPPORTED_LANGUAGES,
        t,
        highContrast,
        setHighContrast,
        toggleHighContrast,
        fontSize,
        setFontSize,
        increaseFontSize,
        decreaseFontSize,
        settings,
        setColorFilter,
        setTextScale,
        increaseTextScale,
        decreaseTextScale,
        toggleLineHeight,
        toggleTextSpacing,
        toggleHighlightLinks,
        toggleDyslexiaFriendly,
        toggleTextMagnifier,
        toggleScreenReader,
        toggleVoiceSupport,
        toggleHideImages,
        toggleReadingGuideline,
        toggleFocusMode,
        toggleBigCursor,
        resetAllSettings,
        isModalOpen,
        openModal,
        closeModal,
        toggleModal,
        activeFeaturesCount,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const useTranslation = () => {
  const { t, language, setLanguage, currentLanguageInfo, supportedLanguages } = useAccessibility();
  return { t, language, setLanguage, currentLanguageInfo, supportedLanguages };
};
