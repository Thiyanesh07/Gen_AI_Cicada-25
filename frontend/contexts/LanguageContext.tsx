import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import { translations, SupportedLanguage, LANGUAGES } from '../translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: string) => string;
  speechCode: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  const t = useCallback((key: string): string => {
    return translations[language]?.[key] || translations['en'][key] || key;
  }, [language]);

  const speechCode = useMemo(() => {
    const langData = LANGUAGES.find(l => l.code === language);
    return langData?.speechCode || 'en-US';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, speechCode }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};