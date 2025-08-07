
// src/hooks/useTheme.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';
type AccentColor = 'default' | 'green' | 'blue' | 'orange';

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: AccentColor;
  setAccentColor: (accentColor: AccentColor) => void;
}

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
  accentColor: 'default',
  setAccentColor: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('anella-theme') as Theme) || 'light';
    }
    return 'light';
  });
  
  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
     if (typeof window !== 'undefined') {
      return (localStorage.getItem('anella-accent-color') as AccentColor) || 'default';
    }
    return 'default';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    localStorage.setItem('anella-theme', theme);
  }, [theme]);
  
   useEffect(() => {
    const root = window.document.documentElement;
    ['theme-default', 'theme-green', 'theme-blue', 'theme-orange'].forEach(c => root.classList.remove(c));
    if (accentColor !== 'default') {
      root.classList.add(`theme-${accentColor}`);
    }
    localStorage.setItem('anella-accent-color', accentColor);
  }, [accentColor]);

  const value = {
    theme,
    setTheme: setThemeState,
    accentColor,
    setAccentColor: setAccentColorState,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

