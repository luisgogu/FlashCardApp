import React, { createContext, useContext, useState, useEffect } from 'react';

export type FlipMode = 'en_to_es' | 'es_to_en';

interface FlipModeContextType {
  flipMode: FlipMode;
  setFlipMode: (mode: FlipMode) => void;
}

const FlipModeContext = createContext<FlipModeContextType | undefined>(undefined);

export const FlipModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flipMode, setFlipMode] = useState<FlipMode>(() => {
    const saved = localStorage.getItem('flashcardapp_flip_mode');
    return saved === 'es_to_en' ? 'es_to_en' : 'en_to_es';
  });

  useEffect(() => {
    localStorage.setItem('flashcardapp_flip_mode', flipMode);
  }, [flipMode]);

  return (
    <FlipModeContext.Provider value={{ flipMode, setFlipMode }}>
      {children}
    </FlipModeContext.Provider>
  );
};

export const useFlipMode = (): FlipModeContextType => {
  const context = useContext(FlipModeContext);
  if (!context) {
    throw new Error('useFlipMode must be used within a FlipModeProvider');
  }
  return context;
};
