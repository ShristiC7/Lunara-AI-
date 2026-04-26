import React, { createContext, useContext, useEffect, useState } from 'react';
import { PHASE_CONFIG } from '../utils/phase.utils';

type Phase = 'MENSTRUAL' | 'FOLLICULAR' | 'OVULATORY' | 'LUTEAL';

interface ThemeContextType {
  currentPhase: Phase;
  setPhase: (phase: Phase) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPhase, setPhase] = useState<Phase>('FOLLICULAR');

  useEffect(() => {
    const config = PHASE_CONFIG[currentPhase];
    if (config) {
      document.documentElement.style.setProperty('--phase-color', config.color);
      document.documentElement.style.setProperty('--phase-light', config.colorLight);
      document.documentElement.style.setProperty('--phase-muted', config.colorMuted);
    }
  }, [currentPhase]);

  return (
    <ThemeContext.Provider value={{ currentPhase, setPhase }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
