import React, { useState, useEffect } from 'react';
import AppIcon from './Icon';
import ThemeToggle from './ThemeToggle';
import type { Theme } from '../App';
import { useLanguage } from '../contexts/LanguageContext';
import { LANGUAGES, SupportedLanguage } from '../translations';
// Toggle between real API and mock API for testing
// import { login, register } from '../services/apiService'; // Real API (needs backend)
import { login, register } from '../services/mockApiService'; // Mock API (frontend only)

interface LoginPageProps {
  onLogin: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, theme, onToggleTheme }) => {
  const [quote, setQuote] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    const quoteIndex = Math.floor(Math.random() * 5); // 5 quotes available
    setQuote(t(`quotes.${quoteIndex}`));
  }, [t]);

  // Clear error when switching modes
  useEffect(() => {
    setError('');
    setSuccessMessage('');
  }, [isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up Mode
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }

        // Register the user
        await register({ email, password });
        setSuccessMessage('Account created successfully! You can now sign in.');
        
        // Switch to login mode after successful registration
        setTimeout(() => {
          setIsSignUp(false);
          setSuccessMessage('');
          setPassword('');
          setConfirmPassword('');
        }, 2000);
      } else {
        // Login Mode
        await login({ email, password });
        onLogin();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-brand-text-primary dark:text-gray-100">
            {isSignUp ? 'Create Account' : t('login.welcome')}
          </h1>
          <p className="mt-2 text-brand-text-secondary dark:text-gray-400">
            {isSignUp ? 'Sign up to get started' : t('login.subtitle')}
          </p>
          {!isSignUp && (
            <p className={`mt-6 text-sm italic text-gray-500 dark:text-gray-400 border-l-2 border-brand-border dark:border-gray-600 pl-4 min-h-[4em] transition-opacity duration-500 ${quote ? 'opacity-100' : 'opacity-0'}`}>"{quote}"</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('login.password')}
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Confirm Password field (only for sign up) */}
          {isSignUp && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </span>
              ) : (
                isSignUp ? 'Sign Up' : t('login.signin')
              )}
            </button>
          </div>
        </form>

        {/* Toggle between Sign In and Sign Up */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-brand-primary hover:text-brand-primary-dark dark:text-brand-accent dark:hover:text-brand-accent-light transition-colors"
          >
            {isSignUp ? (
              <>Already have an account? <span className="font-semibold">Sign In</span></>
            ) : (
              <>Don't have an account? <span className="font-semibold">Sign Up</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;