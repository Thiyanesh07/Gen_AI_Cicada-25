import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import MainPage from './components/MainPage';

export type Theme = 'light' | 'dark';
export type FontSize = 'small' | 'default' | 'large';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [fontSize, setFontSize] = useState<FontSize>('default');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Update favicon
    const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (link) {
      const lightIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23F0FFF4'/%3E%3Cpath fill='%23388E3C' d='M84,20 H26 C22.7,20 20,22.7 20,26 V62 C20,65.3 22.7,68 26,68 H38 V78 L50,68 H84 C87.3,68 90,65.3 90,62 V26 C90,22.7 87.3,20 84,20 Z'/%3E%3Cg stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round' fill='none' transform='translate(0, -2)'%3E%3Cpath d='M55 70 V 40' /%3E%3Cpath d='M55 60 C 70 55 70 45 55 40' /%3E%3Cpath d='M55 60 C 40 55 40 45 55 40' /%3E%3Cpath d='M55 50 C 65 47 65 42 55 40' /%3E%3Cpath d='M55 50 C 45 47 45 42 55 40' /%3E%3C/g%3E%3C/svg%3E";
      const darkIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%231E4620'/%3E%3Cpath fill='%234CAF50' d='M84,20 H26 C22.7,20 20,22.7 20,26 V62 C20,65.3 22.7,68 26,68 H38 V78 L50,68 H84 C87.3,68 90,65.3 90,62 V26 C90,22.7 87.3,20 84,20 Z'/%3E%3Cg stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round' fill='none' transform='translate(0, -2)'%3E%3Cpath d='M55 70 V 40' /%3E%3Cpath d='M55 60 C 70 55 70 45 55 40' /%3E%3Cpath d='M55 60 C 40 55 40 45 55 40' /%3E%3Cpath d='M55 50 C 65 47 65 42 55 40' /%3E%3Cpath d='M55 50 C 45 47 45 42 55 40' /%3E%3C/g%3E%3C/svg%3E";
      link.href = theme === 'dark' ? darkIcon : lightIcon;
    }
  }, [theme]);
  
  const handleLogin = () => {
    setIsLoggedIn(true);
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const fontSizeClass = {
    small: 'text-sm',
    default: 'text-base',
    large: 'text-lg',
  }[fontSize];

  return (
    <div className={`min-h-screen text-brand-text-primary font-sans ${fontSizeClass}`}>
      {isLoggedIn ? <MainPage theme={theme} onToggleTheme={toggleTheme} fontSize={fontSize} onSetFontSize={setFontSize} onLogout={handleLogout} /> : <LoginPage onLogin={handleLogin} theme={theme} onToggleTheme={toggleTheme} />}
    </div>
  );
};

export default App;