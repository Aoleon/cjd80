'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface HeadsUpContextType {
  enabled: boolean;
  toggle: () => void;
  enable: () => void;
  disable: () => void;
}

const HeadsUpContext = createContext<HeadsUpContextType | undefined>(undefined);

const STORAGE_KEY = 'cockpit-headup-enabled';

export function HeadsUpProvider({ children }: { children: ReactNode }) {
  // Load initial state from localStorage
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  const toggle = () => setEnabled((prev) => !prev);
  const enable = () => setEnabled(true);
  const disable = () => setEnabled(false);

  return (
    <HeadsUpContext.Provider value={{ enabled, toggle, enable, disable }}>
      {children}
    </HeadsUpContext.Provider>
  );
}

export function useHeadsUp() {
  const context = useContext(HeadsUpContext);
  if (context === undefined) {
    throw new Error('useHeadsUp must be used within a HeadsUpProvider');
  }
  return context;
}
