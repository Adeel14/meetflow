import React, { createContext, useContext, useEffect, useState } from 'react';
import { THEMES, ThemeConfig, ThemeId } from '../types/theme';

interface ThemeContextType {
  currentTheme: ThemeId;
  theme: ThemeConfig;
  setTheme: (id: ThemeId) => void;
  availableThemes: ThemeConfig[];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentThemeState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem('meetflow_theme') as ThemeId;
      if (saved && THEMES[saved]) return saved;
    } catch {}
    return 'nordic'; // Default theme: Clean White / Nordic Daylight
  });

  const setTheme = (id: ThemeId) => {
    if (THEMES[id]) {
      setCurrentThemeState(id);
      try {
        localStorage.setItem('meetflow_theme', id);
      } catch {}
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    const active = THEMES[currentTheme] || THEMES.midnight;
    if (active.isLight) {
      root.classList.add('theme-light');
      root.classList.remove('dark');
    } else {
      root.classList.remove('theme-light');
      root.classList.add('dark');
    }
    root.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const value: ThemeContextType = {
    currentTheme,
    theme: THEMES[currentTheme] || THEMES.midnight,
    setTheme,
    availableThemes: Object.values(THEMES),
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      currentTheme: 'midnight',
      theme: THEMES['midnight'],
      setTheme: () => {},
      availableThemes: Object.values(THEMES),
    };
  }
  return context;
}
