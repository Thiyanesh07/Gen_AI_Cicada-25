import React, { useState, useRef, useEffect } from 'react';
import type { Chat } from '@google/genai';
import { createChat, streamChatMessage, sendToolResponse, extractTextFromImage } from '../../services/geminiService';
import type { ChatMessage, Reminder } from '../../types';
import { ChatRole } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

// New component to render message content with code block highlighting
const MessageContent: React.FC<{ text: string }> = ({ text }) => {
  const { t } = useLanguage();
  const [copyStates, setCopyStates] = useState<Record<number, boolean>>({});

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopyStates(prev => ({...prev, [index]: true}));
    setTimeout(() => {
        setCopyStates(prev => ({...prev, [index]: false}));
    }, 2000);
  };
  
  const parts = text.split(/(```(?:\w+\n)?[\s\S]*?```)/g);

  return (
    <>
      {parts.map((part, index) => {
        const codeBlockMatch = part.match(/```(?:\w+\n)?([\s\S]*?)```/);
        if (codeBlockMatch) {
          const code = codeBlockMatch[1];
          return (
            <div key={index} className="bg-gray-800 rounded-md my-2 relative group">
              <button
                onClick={() => handleCopy(code, index)}
                className="absolute top-2 right-2 p-1.5 bg-gray-600 rounded-md text-xs text-gray-300 hover:bg-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copyStates[index] ? t('chat.copied') : t('chat.copy')}
              </button>
              <pre className="p-4 overflow-x-auto text-sm text-white">
                <code>{code}</code>
              </pre>
            </div>
          );
        }
        return <p key={index} className="text-sm whitespace-pre-wrap">{part}</p>;
      })}
    </>
  );
};


interface ChatPanelProps {
  onAddReminder: (reminder: Omit<Reminder, 'id'>) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ onAddReminder }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{ MimeType: string; data: string; preview: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  const { t, speechCode } = useLanguage();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    try {
      const chatInstance = createChat();
      if (!chatInstance) {
        setIsMockMode(true);
        setMessages([{ 
          role: ChatRole.GEMINI, 
          text: '⚠️ Mock Mode Active\n\n' + t('chat.greeting') + '\n\n(Note: AI responses are not available without an API key. This is a demonstration mode.)' 
        }]);
      } else {
        setChat(chatInstance);
        setMessages([{ role: ChatRole.GEMINI, text: t('chat.greeting') }]);
      }
    } catch (err) {
      console.error('Error initializing chat:', err);
      setIsMockMode(true);
      setMessages([{ 
        role: ChatRole.GEMINI, 
        text: '⚠️ Mock Mode Active\n\n' + t('chat.greeting') + '\n\n(Note: AI responses are not available without an API key.)' 
      }]);
    }

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
            setInput(transcript);
        };
        
        recognitionRef.current.onend = () => {
            setIsRecording(false);
        };
    }
  }, []);
  
  // Update initial greeting when language changes
  useEffect(() => {
    setMessages(msgs => msgs.length > 0 ? [{...msgs[0], text: t('chat.greeting')}, ...msgs.slice(1)] : [{ role: ChatRole.GEMINI, text: t('chat.greeting') }]);
  }, [t]);

  useEffect(() => {
    if (recognitionRef.current) {
        recognitionRef.current.lang = speechCode;
    }
  }, [speechCode]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const processStream = async (stream: AsyncGenerator<any>, isToolResponse = false) => {
    let fullResponse = "";
    let functionCalls: any[] = [];
    
    if (!isToolResponse) {
        setMessages((prev) => [...prev, { role: ChatRole.GEMINI, text: "" }]);
    }
    
    for await (const chunk of stream) {
        if (chunk.functionCalls) {
            functionCalls.push(...chunk.functionCalls);
        } else {
            const chunkText = chunk.text;
            fullResponse += chunkText;
            setMessages((prev) =>
                prev.map((msg, index) =>
                    index === prev.length - 1 ? { ...msg, text: fullResponse } : msg
                )
            );
        }
    }

    if (functionCalls.length > 0) {
      const toolResponses = [];
      for(const fc of functionCalls) {
        if (fc.name === 'setReminder') {
            const args = fc.args;
            onAddReminder(args);
            toolResponses.push({
                id: fc.id,
                name: fc.name,
                response: { result: `Reminder set for ${args.task}` }
            });
        }
      }

      if (chat && toolResponses.length > 0) {
          const followUpStream = await sendToolResponse(chat, toolResponses);
          await processStream(followUpStream, true); 
      }
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedImage) || !chat || isLoading) return;

    const userMessage: ChatMessage = { role: ChatRole.USER, text: input, image: attachedImage?.preview };
    setMessages((prev) => [...prev, userMessage]);
    
    const currentInput = input;
    const currentImage = attachedImage;
    setInput('');
    setAttachedImage(null);
    setIsLoading(true);

    try {
        const stream = await streamChatMessage(chat, currentInput, currentImage ? { mimeType: currentImage.MimeType, data: currentImage.data } : undefined);
        await processStream(stream);
    } catch (error) {
        console.error('Error streaming chat message:', error);
        setMessages((prev) => [...prev, { role: ChatRole.GEMINI, text: "Sorry, I encountered an error." }]);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadstart = () => {
        setIsExtractingText(true);
        setAttachedImage({
          MimeType: file.type,
          data: '',
          preview: URL.createObjectURL(file),
        });
      };
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        setAttachedImage(prev => prev ? { ...prev, data: base64String } : null);
        try {
          const text = await extractTextFromImage({
            mimeType: file.type,
            data: base64String,
          });
          setInput(prev => prev ? `${prev}\n\n${text}` : text);
        } catch (error) {
          console.error("Error extracting text: ", error);
          setInput(prev => prev ? `${prev}\n\n[${t('text.error')}]` : `[${t('text.error')}]`);
        } finally {
          setIsExtractingText(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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

  const playText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechCode;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.role === ChatRole.USER ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xl px-4 py-3 rounded-xl shadow ${msg.role === ChatRole.USER ? 'bg-brand-primary text-white' : 'bg-brand-surface text-brand-text-primary dark:bg-gray-700 dark:text-gray-200'}`}>
                {msg.image && <img src={msg.image} alt="upload preview" className="rounded-md mb-2 max-h-48" />}
                {msg.role === ChatRole.USER ? (
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                ) : (
                    <MessageContent text={msg.text || (isLoading && index === messages.length -1 ? '...' : '')} />
                )}
              </div>
              {msg.role === ChatRole.GEMINI && msg.text && (
                 <button onClick={() => playText(msg.text)} className="p-1.5 rounded-full bg-white/50 dark:bg-black/20 text-gray-500 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.858 8.464a5 5 0 000 7.072m2.828 9.9a9 9 0 000-12.728M12 15a3 3 0 100-6 3 3 0 000 6z" /></svg></button>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 sm:p-6 border-t border-white/20 dark:border-black/20 bg-brand-surface/70 backdrop-blur-sm">
        {attachedImage && (
          <div className="mb-2 relative w-24">
            <img src={attachedImage.preview} alt="preview" className="rounded-md" />
            <button onClick={() => setAttachedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">X</button>
          </div>
        )}
        <div className="flex items-center bg-white rounded-lg shadow-sm p-2 border border-brand-border dark:bg-gray-900 dark:border-gray-700">
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} disabled={isLoading || isExtractingText} className="p-2 text-gray-500 hover:text-brand-primary dark:text-gray-400 dark:hover:text-brand-primary transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></button>
          <button onClick={toggleRecording} disabled={isLoading || isExtractingText} className={`p-2 text-gray-500 hover:text-brand-primary transition-colors dark:text-gray-400 dark:hover:text-brand-primary ${isRecording ? 'text-red-500 animate-pulse' : ''}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder={isExtractingText ? t('text.extracting') : t('chat.placeholder')}
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none text-brand-text-primary placeholder-gray-400 dark:text-gray-200 dark:placeholder-gray-500 px-2"
            rows={1}
            disabled={isLoading || isExtractingText}
          />
          <button onClick={handleSend} disabled={isLoading || (!input.trim() && !attachedImage)} className="ml-2 p-2 bg-brand-primary rounded-full text-white disabled:bg-brand-primary/50 hover:bg-brand-primary-dark transition-colors shadow">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;