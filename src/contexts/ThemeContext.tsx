'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { THEMES, DEFAULT_THEME, getTheme, applyTheme, type Theme } from '@/lib/themes';

interface ThemeContextType {
  theme: Theme;
  themeId: string;
  setThemeId: (id: string) => void;
  themes: typeof THEMES;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = 'latetable-theme';

function getInitialThemeId(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && THEMES.some((t) => t.id === stored)) {
    return stored;
  }

  return DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<string>(getInitialThemeId);

  // Apply theme whenever it changes
  useEffect(() => {
    const theme = getTheme(themeId);
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, themeId);
  }, [themeId]);

  const setThemeId = (id: string) => {
    if (THEMES.some((t) => t.id === id)) {
      setThemeIdState(id);
    }
  };

  const theme = getTheme(themeId);

  return (
    <ThemeContext.Provider value={{ theme, themeId, setThemeId, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
