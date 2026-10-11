/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { MotionConfig } from 'motion/react';

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
  try {
    localStorage.setItem('theme', nextTheme);
  } catch {
    /* Theme still works without storage. */
  }
  window.dispatchEvent(new CustomEvent('themechange', { detail: nextTheme }));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Prefer the class already set by the beforeInteractive script to avoid flicker/desync
    let savedTheme: Theme | null = null;
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') savedTheme = stored;
    } catch {
      /* Use the system preference when storage is unavailable. */
    }
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
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
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

  // Edudojo's control: a 6px square with a hairline, muted ink that darkens on hover.
  const shell = 'rounded-[6px] border-[var(--rule)] bg-transparent text-[var(--ink-2)] hover:text-[var(--ink)]';


  // Before hydration the theme state is unknown, so the html.dark class (set by the init script)
  // picks the icon. The button never shows as an empty circle.
  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        className={`flex h-10 w-10 items-center justify-center border ${shell}`}
      >
        <Moon className="h-[18px] w-[18px] dark:hidden" strokeWidth={2} />
        <Sun className="hidden h-[18px] w-[18px] dark:block" strokeWidth={2} />
      </div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`pointer-events-auto flex h-10 w-10 cursor-pointer items-center justify-center border motion-safe:transition-colors motion-safe:duration-200 ${shell}`}
      aria-label="Toggle theme"
      type="button"
    >
      {theme === 'dark' ? (
        <Sun className="h-[18px] w-[18px]" strokeWidth={2} />
      ) : (
        <Moon className="h-[18px] w-[18px]" strokeWidth={2} />
      )}
    </button>
  );
}
