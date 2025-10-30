import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { LANGUAGES, SupportedLanguage } from '../../translations';
import type { FontSize } from '../../App';

interface SettingsPanelProps {
  fontSize: FontSize;
  onSetFontSize: (size: FontSize) => void;
}

const StarIcon: React.FC<{ filled: boolean; onClick: () => void; onMouseEnter: () => void; onMouseLeave: () => void }> = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
    <svg 
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`h-8 w-8 cursor-pointer transition-colors ${filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
      fill="currentColor" 
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);


const SettingsPanel: React.FC<SettingsPanelProps> = ({ fontSize, onSetFontSize }) => {
  const { language, setLanguage, t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  const fontSizes: { id: FontSize, labelKey: string }[] = [
    { id: 'small', labelKey: 'settings.fontSize.small' },
    { id: 'default', labelKey: 'settings.fontSize.default' },
    { id: 'large', labelKey: 'settings.fontSize.large' },
  ];
  
  const handleFeedbackSubmit = () => {
      console.log({ rating, feedback: feedbackText, language });
      alert(t('settings.feedback.thanks'));
      setRating(0);
      setFeedbackText('');
  }
  
  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex-1 overflow-y-auto space-y-8 pr-2">
        {/* Language Settings */}
        <div className="bg-brand-surface/80 dark:bg-gray-800/80 backdrop-blur-lg p-6 rounded-lg shadow-md border border-white/20">
          <h3 className="text-lg font-medium text-brand-text-primary dark:text-gray-200">{t('settings.language')}</h3>
          <p className="text-sm text-brand-text-secondary dark:text-gray-400 mt-1 mb-3">{t('settings.language.description')}</p>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            className="w-full max-w-xs bg-gray-50 border-gray-300 border rounded-lg p-3 focus:ring-brand-primary focus:border-brand-primary text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            aria-label={t('settings.language')}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>

        {/* Appearance Settings */}
        <div className="bg-brand-surface/80 dark:bg-gray-800/80 backdrop-blur-lg p-6 rounded-lg shadow-md border border-white/20">
          <h3 className="text-lg font-medium text-brand-text-primary dark:text-gray-200 mb-4">{t('settings.appearance')}</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-medium text-brand-text-primary dark:text-gray-200">{t('settings.fontSize')}</h4>
              <p className="text-sm text-brand-text-secondary dark:text-gray-400 mt-1 mb-3">{t('settings.fontSize.description')}</p>
              <div className="flex items-center gap-2">
                {fontSizes.map(({id, labelKey}) => (
                    <button
                        key={id}
                        onClick={() => onSetFontSize(id)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            fontSize === id 
                            ? 'bg-brand-primary text-white shadow'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        {t(labelKey)}
                    </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Feedback Section */}
        <div className="bg-brand-surface/80 dark:bg-gray-800/80 backdrop-blur-lg p-6 rounded-lg shadow-md border border-white/20">
          <h3 className="text-lg font-medium text-brand-text-primary dark:text-gray-200">{t('settings.feedback')}</h3>
          <p className="text-sm text-brand-text-secondary dark:text-gray-400 mt-1 mb-4">{t('settings.feedback.description')}</p>
          <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-brand-text-primary dark:text-gray-200 mb-2">{t('settings.feedback.rating')}</label>
                <div className="flex" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <StarIcon 
                            key={star}
                            filled={star <= (hoverRating || rating)}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => {}}
                        />
                    ))}
                </div>
             </div>
             <div>
                <textarea
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                    placeholder={t('settings.feedback.placeholder')}
                    className="w-full bg-gray-50 border-gray-300 border rounded-lg p-3 focus:ring-brand-primary focus:border-brand-primary text-gray-800 resize-none placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500"
                    rows={4}
                />
             </div>
             <div>
                <button
                    onClick={handleFeedbackSubmit}
                    disabled={rating === 0 && !feedbackText.trim()}
                    className="w-full max-w-xs py-2 px-4 bg-brand-primary text-white font-semibold rounded-lg disabled:bg-brand-primary/50 hover:bg-brand-primary-dark transition-colors shadow-md"
                >
                    {t('settings.feedback.submit')}
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;