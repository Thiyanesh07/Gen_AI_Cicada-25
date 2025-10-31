import React, { useState, useRef, useEffect } from 'react';
import type { PanelType, NavItem, Reminder } from '../types';
import { NAV_ITEMS } from '../constants';
import ChatPanel from './panels/ChatPanel';
import ImagePanel from './panels/ImagePanel';
import RemindersPanel from './panels/RemindersPanel';
import SettingsPanel from './panels/SettingsPanel';
import { CropPanel } from './panels/CropPanel';
import { NotificationWidget } from './NotificationWidget';
import AppIcon from './Icon';
import ThemeToggle from './ThemeToggle';
import type { Theme, FontSize } from '../App';
import { useLanguage } from '../contexts/LanguageContext';


interface MainPageProps {
    theme: Theme;
    onToggleTheme: () => void;
    fontSize: FontSize;
    onSetFontSize: (size: FontSize) => void;
    onLogout: () => void;
}

const MainPage: React.FC<MainPageProps> = ({ theme, onToggleTheme, fontSize, onSetFontSize, onLogout }) => {
  const [activePanel, setActivePanel] = useState<PanelType>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { t } = useLanguage();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        // Fix: Corrected typo 'userMenurMenuRef' to 'userMenuRef'.
        if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
            setIsUserMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef]);

  const addReminder = (newReminder: Omit<Reminder, 'id'>) => {
    setReminders(prev => [...prev, { ...newReminder, id: Date.now().toString() }]);
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };


  const renderPanel = () => {
    switch (activePanel) {
      case 'chat':
        return <ChatPanel onAddReminder={addReminder} />;
      case 'image':
        return <ImagePanel />;
      case 'reminders':
        return <RemindersPanel reminders={reminders} onDelete={deleteReminder} onAdd={addReminder} />;
      case 'notifications':
        return <NotificationWidget refreshInterval={300000} maxDisplay={10} />;
      case 'settings':
        return <SettingsPanel fontSize={fontSize} onSetFontSize={onSetFontSize} />;
      case 'crops':
        return <CropPanel />;
      default:
        return <ChatPanel onAddReminder={addReminder} />;
    }
  };
  
  const NavLink: React.FC<{ item: NavItem, isActive: boolean, onClick: () => void }> = ({ item, isActive, onClick }) => (
    <div className="relative group">
        <button
            onClick={onClick}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg ${
                isActive
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'text-brand-text-secondary hover:bg-black/10 hover:text-brand-text-primary dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-200'
            }`}
        >
            {item.icon}
            <span className={`mx-4 ${isSidebarOpen ? 'inline' : 'hidden'}`}>{t(item.labelKey)}</span>
        </button>
        {!isSidebarOpen && (
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {t(item.labelKey)}
            </span>
        )}
    </div>
  );

  const SwitchAccountIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
  const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
  
  const activeNavItem = NAV_ITEMS.find(item => item.id === activePanel);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className={`flex flex-col bg-brand-surface/70 text-brand-text-secondary shadow-xl transition-all duration-300 dark:bg-gray-800/70 dark:text-gray-400 backdrop-blur-lg border-r border-white/20 dark:border-black/20 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/20 dark:border-black/20">
          <div className="flex items-center gap-2">
            <AppIcon className="w-8 h-8 flex-shrink-0" theme={theme} />
            <h1 className={`text-xl font-bold text-brand-text-primary dark:text-gray-200 ${isSidebarOpen ? 'inline' : 'hidden'}`}>{t('app.title')}</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none">
            {isSidebarOpen ? (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
        
        {/* Demo Mode Banner */}
        <div className="mx-4 mt-4 mb-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            <strong>🎭 Demo Mode</strong><br/>
            Using mock authentication. Backend features require the server to be running.
          </p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
            {NAV_ITEMS.map((item) => (
                <NavLink 
                    key={item.id}
                    item={item}
                    isActive={activePanel === item.id}
                    onClick={() => setActivePanel(item.id)}
                />
            ))}
        </nav>
        <div className="p-4 border-t border-white/20 dark:border-black/20">
          <div className="relative">
              <button onClick={() => setIsUserMenuOpen(prev => !prev)} className="w-full flex items-center p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-brand-primary flex-shrink-0 flex items-center justify-center text-white font-bold">
                      <span>U</span>
                  </div>
                  {isSidebarOpen && (
                      <div className="ml-3 text-left overflow-hidden">
                          <p className="font-semibold text-sm text-brand-text-primary dark:text-gray-200 truncate">User</p>
                          <p className="text-xs text-brand-text-secondary dark:text-gray-400">Farmer</p>
                      </div>
                  )}
              </button>
              {isUserMenuOpen && (
                  <div ref={userMenuRef} className="absolute bottom-full left-0 right-0 mb-2 bg-brand-surface/90 dark:bg-gray-700/90 backdrop-blur-md rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 p-1.5 z-10">
                      <button onClick={onLogout} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-brand-text-secondary dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors">
                          <SwitchAccountIcon />
                          <span>{t('user.switchAccount')}</span>
                      </button>
                      <hr className="my-1 border-brand-border dark:border-gray-600" />
                      <button onClick={onLogout} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
                          <LogoutIcon />
                          <span>{t('user.logout')}</span>
                      </button>
                  </div>
              )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
         <header className="flex-shrink-0 flex items-center justify-between h-16 px-6 border-b border-white/20 dark:border-black/20 bg-brand-surface/60 dark:bg-gray-800/60 backdrop-blur-md">
            <h2 className="text-xl font-semibold text-brand-text-primary dark:text-gray-200">{activeNavItem ? t(activeNavItem.labelKey) : ''}</h2>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </header>
          <div className="flex-1 overflow-y-auto flex gap-4 p-4">
            <div className="flex-1 overflow-y-auto">
              {renderPanel()}
            </div>
          </div>
      </main>
    </div>
  );
};

export default MainPage;