import React from 'react';
import type { Theme } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  const { t } = useLanguage();
  const isLight = theme === 'light';

  return (
    <button
      onClick={onToggle}
      className="relative inline-flex items-center h-7 w-12 rounded-full bg-gray-300 dark:bg-gray-600 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-gray-800"
      aria-label={t(isLight ? 'theme.switch.dark' : 'theme.switch.light')}
    >
      <span className="sr-only">{t(isLight ? 'theme.light' : 'theme.dark')}</span>
      <span
        className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 ease-in-out flex items-center justify-center ${
          isLight ? 'translate-x-1' : 'translate-x-6'
        }`}
      >
        {isLight ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  );
};

export default ThemeToggle;