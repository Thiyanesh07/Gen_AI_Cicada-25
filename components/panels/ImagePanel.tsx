import React, { useState, useRef, useEffect } from 'react';
import { generateImage } from '../../services/geminiService';
import { useLanguage } from '../../contexts/LanguageContext';

const ImagePanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { t, speechCode } = useLanguage();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result: any) => result.transcript)
                .join('');
            setPrompt(transcript);
        };
        
        recognitionRef.current.onend = () => {
            setIsRecording(false);
        };
    }
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
        recognitionRef.current.lang = speechCode;
    }
  }, [speechCode]);

  const toggleRecording = () => {
    if (recognitionRef.current) {
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsRecording(true);
        }
    } else {
        alert("Speech recognition is not supported in your browser.");
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    try {
      const url = await generateImage(prompt);
      setImageUrl(url);
    } catch (err) {
      console.error('Error generating image:', err);
      setError(t('image.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Controls */}
        <div className="md:w-1/3 flex flex-col space-y-4">
          <div className="flex-grow flex flex-col bg-brand-surface/80 dark:bg-gray-800/80 backdrop-blur-lg p-4 rounded-lg shadow-md border border-white/20">
            <label htmlFor="prompt" className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('image.prompt')}</label>
            <div className="relative flex-grow">
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t('image.prompt.placeholder')}
                  className="w-full h-full bg-gray-50 border-gray-300 border rounded-lg p-3 pr-12 focus:ring-brand-primary focus:border-brand-primary text-gray-800 resize-none placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500"
                  rows={6}
                />
                 <button 
                    onClick={toggleRecording} 
                    disabled={isLoading}
                    className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors ${isRecording ? 'text-red-500 bg-red-100 dark:bg-red-900/50' : 'text-gray-500 hover:text-brand-primary hover:bg-brand-bg dark:text-gray-400 dark:hover:text-brand-primary dark:hover:bg-gray-600'}`}
                    aria-label="Toggle voice input"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </button>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full py-3 px-4 bg-brand-primary text-white font-semibold rounded-lg disabled:bg-brand-primary/50 hover:bg-brand-primary-dark transition-colors shadow-md"
          >
            {isLoading ? t('image.generating') : t('image.generate')}
          </button>
        </div>

        {/* Display */}
        <div className="md:w-2/3 flex-1 bg-brand-surface/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg flex items-center justify-center p-4 overflow-auto shadow-lg border border-white/20">
          {isLoading && (
            <div className="text-center">
              <svg className="animate-spin h-10 w-10 text-brand-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-gray-500 dark:text-gray-400">{t('image.generating.message')}</p>
            </div>
          )}
          {error && <p className="text-red-500">{error}</p>}
          {!isLoading && !imageUrl && !error && (
            <div className="text-center text-gray-400 dark:text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="mt-4">{t('image.placeholder')}</p>
            </div>
          )}
          {imageUrl && (
            <img src={imageUrl} alt={prompt} className="max-h-full max-w-full object-contain rounded-md" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePanel;