import React, { useState, useRef, useEffect } from 'react';
import { generateSpeech } from '../../services/geminiService';
import { useLanguage } from '../../contexts/LanguageContext';

// Helper to decode base64 string to Uint8Array
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode raw PCM audio data into an AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const AudioPanel: React.FC = () => {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const { t } = useLanguage();
    
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        // Initialize AudioContext on user interaction (or component mount)
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
    }, []);

    const handleGenerate = async () => {
        if (!text.trim() || !audioContextRef.current) return;
        setIsLoading(true);
        setError(null);
        setAudioBuffer(null);

        try {
            const base64Audio = await generateSpeech(text);
            const decodedBytes = decode(base64Audio);
            const buffer = await decodeAudioData(decodedBytes, audioContextRef.current, 24000, 1);
            setAudioBuffer(buffer);
        } catch (err) {
            console.error('Error generating speech:', err);
            setError(t('audio.error'));
        } finally {
            setIsLoading(false);
        }
    };

    const playAudio = () => {
        if (!audioBuffer || !audioContextRef.current) return;
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.start();
    };


    return (
        <div className="flex flex-col h-full p-6">
            <p className="text-brand-text-secondary dark:text-gray-300 mb-6 bg-black/10 dark:bg-white/10 p-2 rounded-md self-start">{t('audio.subtitle')}</p>
            <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
                <div className="md:w-1/3 flex flex-col space-y-4">
                    <div className="flex-grow flex flex-col bg-brand-surface/80 dark:bg-gray-800/80 backdrop-blur-lg p-4 rounded-lg shadow-md border border-white/20">
                        <label htmlFor="prompt-audio" className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('audio.text')}</label>
                        <textarea
                            id="prompt-audio"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={t('audio.placeholder')}
                            className="flex-grow bg-gray-50 border-gray-300 border rounded-lg p-3 focus:ring-brand-primary focus:border-brand-primary text-gray-800 resize-none placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-500"
                            rows={6}
                        />
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !text.trim()}
                        className="w-full py-3 px-4 bg-brand-primary text-white font-semibold rounded-lg disabled:bg-brand-primary/50 hover:bg-brand-primary-dark transition-colors shadow-md"
                    >
                        {isLoading ? t('audio.generating') : t('audio.generate')}
                    </button>
                </div>
                <div className="md:w-2/3 flex-1 bg-brand-surface/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg flex items-center justify-center p-4 overflow-auto shadow-lg border border-white/20">
                    {isLoading && (
                        <div className="text-center">
                            <svg className="animate-spin h-10 w-10 text-brand-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-4 text-gray-500 dark:text-gray-400">{t('audio.generating.message')}</p>
                        </div>
                    )}
                    {error && <p className="text-red-500">{error}</p>}
                    {!isLoading && !audioBuffer && !error && (
                        <div className="text-center text-gray-400 dark:text-gray-500">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.858 8.464a5 5 0 000 7.072m2.828 9.9a9 9 0 000-12.728M12 15a3 3 0 100-6 3 3 0 000 6z" /></svg>
                            <p className="mt-4">{t('audio.placeholder.result')}</p>
                        </div>
                    )}
                    {audioBuffer && (
                        <div className="text-center">
                            <h3 className="text-lg font-medium mb-4 text-brand-text-primary dark:text-gray-200">{t('audio.ready')}</h3>
                            <button onClick={playAudio} className="px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-dark transition-colors flex items-center mx-auto shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {t('audio.play')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AudioPanel;