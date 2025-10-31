import { GoogleGenAI, Chat, Modality, GenerateContentResponse, FunctionDeclaration, Type } from "@google/genai";

// Check if API key exists, use mock mode if not
const API_KEY = process.env.API_KEY || '';
const USE_MOCK = !API_KEY || API_KEY === 'mock';

// Assume process.env.API_KEY is available
const getGenAI = () => {
  if (USE_MOCK) {
    console.warn('⚠️ No API key found - using mock mode for Gemini services');
    throw new Error('Mock mode - API not initialized');
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

const setReminderFunctionDeclaration: FunctionDeclaration = {
  name: 'setReminder',
  description: 'Sets a recurring reminder for a farming task. Use this when a user wants to be reminded about an agricultural activity.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      task: { type: Type.STRING, description: 'A short name for the task, e.g., "Water tomatoes".' },
      notes: { type: Type.STRING, description: 'A detailed briefing or notes about the task, including steps and advice. This will be shown to the user.' },
      startDate: { type: Type.STRING, description: 'The start date for the reminder in YYYY-MM-DD format. Default to tomorrow if not specified.' },
      frequencyDays: { type: Type.NUMBER, description: 'How often the reminder should repeat, in days. For example, 7 for weekly.' }
    },
    required: ['task', 'notes', 'startDate', 'frequencyDays']
  }
};


// Chat Service
export const createChat = (): Chat | null => {
  if (USE_MOCK) {
    console.log('🎭 Mock chat created - responses will be simulated');
    return null;
  }
  try {
    const ai = getGenAI();
    return ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are a helpful and knowledgeable Farmer Query Assistant. Your goal is to provide concise, practical advice for farmers. You are an expert in sustainable farming; proactively offer advice on how to reduce waste, save money by suggesting efficient alternatives, and improve soil health. When a user indicates they are starting a task like planting, proactively use the setReminder tool to create a helpful, automated schedule for them from planting to harvest.",
        tools: [{ functionDeclarations: [setReminderFunctionDeclaration] }],
      },
    });
  } catch (err) {
    console.error('Failed to create chat:', err);
    return null;
  }
};

export const streamChatMessage = async (
  chat: Chat,
  message: string,
  image?: { mimeType: string; data: string }
): Promise<AsyncGenerator<GenerateContentResponse>> => {
  const parts: any[] = [{ text: message }];
  if (image) {
    parts.unshift({
      inlineData: {
        mimeType: image.mimeType,
        data: image.data,
      },
    });
  }
  // Fix: The `sendMessageStream` method expects a `message` property with an array of Parts, not a `contents` object.
  return chat.sendMessageStream({ message: parts });
};

export const sendToolResponse = (chat: Chat, toolResponses: any[]): Promise<AsyncGenerator<GenerateContentResponse>> => {
    // Fix: The `sendMessageStream` method expects a `message` property. For function calling, the message should be an array of `functionResponse` parts. The original code used an incorrect `contents` property and structure.
    const parts = toolResponses.map(tr => ({
        functionResponse: {
            name: tr.name,
            response: tr.response,
        },
    }));
    return chat.sendMessageStream({ message: parts });
};

// Image Generation Service
export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getGenAI();
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '1:1',
    },
  });
  const base64ImageBytes = response.generatedImages[0].image.imageBytes;
  return `data:image/jpeg;base64,${base64ImageBytes}`;
};

// Text-to-Speech Service
export const generateSpeech = async (text: string): Promise<string> => {
  const ai = getGenAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data as string;
  return base64Audio;
};

// Text Extraction Service
export const extractTextFromImage = async (image: { mimeType: string; data: string }): Promise<string> => {
  const ai = getGenAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
        parts: [
            { inlineData: { mimeType: image.mimeType, data: image.data } },
            { text: "Extract all text from the image. If there is no text, respond with 'No text found.'." }
        ]
    },
  });
  return response.text;
};