import React, { useState, useEffect } from 'react';
import AppIcon from './Icon';
import ThemeToggle from './ThemeToggle';
import type { Theme } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import { LANGUAGES, SupportedLanguage } from '../translations';

interface LoginPageProps {
  onLogin: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,35.962,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

const GithubIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
);

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, theme, onToggleTheme }) => {
  const [quote, setQuote] = useState('');
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    const quoteIndex = Math.floor(Math.random() * 5); // 5 quotes available
    setQuote(t(`quotes.${quoteIndex}`));
  }, [t]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="absolute top-4 left-4">
        <select
          value={language}
          onChange={e => setLanguage(e.target.value as SupportedLanguage)}
          className="bg-black/50 text-white backdrop-blur-sm border border-white/30 rounded-md text-sm py-1 px-2 focus:ring-brand-primary focus:border-brand-primary"
          aria-label={t('login.language')}
        >
          {LANGUAGES.map(lang => <option key={lang.code} value={lang.code} className="text-black">{lang.name}</option>)}
        </select>
      </div>
      <div className="absolute top-4 right-4">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
      <div className="w-full max-w-md p-8 space-y-8 bg-brand-surface/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
        <div className="text-center">
            <div className="flex justify-center items-center mb-4">
                <AppIcon className="w-12 h-12" theme={theme} />
            </div>
          <h1 className="text-3xl font-bold text-brand-text-primary dark:text-gray-100">{t('login.welcome')}</h1>
          <p className="mt-2 text-brand-text-secondary dark:text-gray-400">{t('login.subtitle')}</p>
          <p className={`mt-6 text-sm italic text-gray-500 dark:text-gray-400 border-l-2 border-brand-border dark:border-gray-600 pl-4 min-h-[4em] transition-opacity duration-500 ${quote ? 'opacity-100' : 'opacity-0'}`}>"{quote}"</p>
        </div>
        <div className="space-y-4">
          <button onClick={onLogin} className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
            <GoogleIcon />
            {t('login.google')}
          </button>
          <button onClick={onLogin} className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-[#333] border border-transparent rounded-lg shadow-sm hover:bg-[#444] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#333] transition-all dark:bg-gray-900 dark:hover:bg-black">
            <GithubIcon />
            {t('login.github')}
          </button>
        </div>
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative px-2 bg-brand-surface/80 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">{t('login.continue')}</div>
        </div>
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('login.email')}
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('login.password')}
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              onClick={onLogin}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all"
            >
              {t('login.signin')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;