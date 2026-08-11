import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontSize = 'small' | 'normal' | 'large' | 'xlarge';
export type Theme = 'light' | 'dark';

interface AccessibilityContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  highContrast: boolean;
  setHighContrast: (active: boolean) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  toggleTheme: () => void;
  toggleHighContrast: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('ac-theme');
    return (saved as Theme) || 'light';
  });

  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    return localStorage.getItem('ac-high-contrast') === 'true';
  });

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    return (localStorage.getItem('ac-font-size') as FontSize) || 'normal';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('ac-theme', newTheme);
  };

  const setHighContrast = (active: boolean) => {
    setHighContrastState(active);
    localStorage.setItem('ac-high-contrast', String(active));
  };

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem('ac-font-size', size);
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const toggleHighContrast = () => setHighContrast(!highContrast);

  const increaseFontSize = () => {
    if (fontSize === 'small') setFontSize('normal');
    else if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
  };

  const decreaseFontSize = () => {
    if (fontSize === 'xlarge') setFontSize('large');
    else if (fontSize === 'large') setFontSize('normal');
    else if (fontSize === 'normal') setFontSize('small');
  };

  // Sync state to <html> element classes
  useEffect(() => {
    const root = document.documentElement;

    // Theme Classes
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // High Contrast Classes
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Font Size Classes
    root.classList.remove('text-small', 'text-large', 'text-xlarge');
    if (fontSize === 'small') {
      root.classList.add('text-small');
    } else if (fontSize === 'large') {
      root.classList.add('text-large');
    } else if (fontSize === 'xlarge') {
      root.classList.add('text-xlarge');
    }
  }, [theme, highContrast, fontSize]);

  return (
    <AccessibilityContext.Provider
      value={{
        theme,
        setTheme,
        highContrast,
        setHighContrast,
        fontSize,
        setFontSize,
        toggleTheme,
        toggleHighContrast,
        increaseFontSize,
        decreaseFontSize,
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
