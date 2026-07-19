/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
} | null>(null);

function applyTheme(nextTheme: Theme) {
  const root = document.documentElement;
  if (nextTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  localStorage.setItem('theme', nextTheme);
  window.dispatchEvent(new CustomEvent('themechange', { detail: nextTheme }));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Prefer the class already set by the beforeInteractive script to avoid flicker/desync
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    const nextTheme = savedTheme ?? systemTheme;
    applyTheme(nextTheme);
    setTheme(nextTheme);
  }, []);

  const toggleTheme = () => {
    // Read from DOM so toggle stays correct even if React state briefly desyncs on hydrate
    const nextTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(nextTheme);
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 w-10 rounded-full border border-white/60 bg-white/40 shadow-sm dark:border-white/10 dark:bg-white/5" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="pointer-events-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/60 bg-white/40 text-primary shadow-sm backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-white"
      aria-label="Toggle theme"
      type="button"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-accent" strokeWidth={2.5} />
      ) : (
        <Moon className="h-5 w-5 text-accent" strokeWidth={2.5} />
      )}
    </button>
  );
}
