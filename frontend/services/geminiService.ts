import { GoogleGenAI, Chat, Modality, GenerateContentResponse, FunctionDeclaration, Type } from "@google/genai";

const getRuntimeApiKey = (): string => {
  const env = typeof import.meta !== 'undefined' ? import.meta.env : undefined;
  const viteKey = env ? (env.VITE_GEMINI_API_KEY || env.VITE_API_KEY || env.GEMINI_API_KEY || env.API_KEY || '') : '';
  const processKey = typeof process !== 'undefined' ? (process.env.GEMINI_API_KEY || process.env.API_KEY || '') : '';
  return (viteKey || processKey || '').trim();
};

const API_KEY = getRuntimeApiKey();
const USE_MOCK = !API_KEY || API_KEY === 'mock' || API_KEY === 'demo';

const createMockResponse = (message: string): string => {
  const lower = message.toLowerCase();

  if (lower.includes('when') && lower.includes('plant') && lower.includes('corn')) {
    return 'Corn is usually planted when soil temperatures are consistently above 15°C and the danger of frost has passed. In most regions, this is late spring, but local soil and rainfall patterns matter.';
  }

  if (lower.includes('water') || lower.includes('irrig')) {
    return 'For irrigation, check soil moisture first and water early in the morning. A deep, infrequent watering cycle is usually better than light daily watering.';
  }

  if (lower.includes('pest') || lower.includes('disease') || lower.includes('fungus')) {
    return 'Inspect the affected leaves and stems, remove infected material, and avoid overhead watering. Neem oil or a crop-safe treatment can help if the problem is confirmed.';
  }

  if (lower.includes('soil') || lower.includes('fertil')) {
    return 'Healthy soil starts with organic matter and balanced nutrients. Add compost, test pH, and avoid over-applying nitrogen where the crop does not need it.';
  }

  if (lower.includes('plant') || lower.includes('seed')) {
    return 'Planting timing matters: prepare the bed, ensure proper spacing, and keep the soil moist but not waterlogged during germination.';
  }

  if (lower.includes('harvest') || lower.includes('yield')) {
    return 'For better yield, monitor moisture stress, prune diseased growth, and keep nutrient levels stable as the crop approaches maturity.';
  }

  return `This is a local demo reply for: "${message}". Add a valid Gemini API key in your environment to enable live AI responses from the project’s real model.`;
};

const createMockChat = (): Chat => {
  const mockSendMessageStream = async ({ message }: { message: string | Array<any> }) => {
    const text = Array.isArray(message)
      ? message
          .map((part) => {
            if (!part || typeof part !== 'object') return '';
            if ('text' in part && typeof part.text === 'string') return part.text;
            if ('functionResponse' in part && part.functionResponse && typeof part.functionResponse.response === 'object') {
              return JSON.stringify(part.functionResponse.response);
            }
            return '';
          })
          .join(' ')
      : String(message || '');

    async function* stream() {
      const response = createMockResponse(text || 'farm question');
      yield { text: response };
    }

    return stream();
  };

  return {
    sendMessageStream: mockSendMessageStream,
  } as unknown as Chat;
};

const getGenAI = () => {
  if (USE_MOCK) {
    console.warn('⚠️ No Gemini API key found - using local mock mode for chat responses');
    return null;
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
    console.log('🎭 Mock chat created - responses will be simulated locally');
    return createMockChat();
  }
  try {
    const ai = getGenAI();
    if (!ai) {
      return createMockChat();
    }
    return ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are a helpful and knowledgeable Farmer Query Assistant. Your goal is to provide concise, practical advice for farmers. You are an expert in sustainable farming; proactively offer advice on how to reduce waste, save money by suggesting efficient alternatives, and improve soil health. When a user indicates they are starting a task like planting, proactively use the setReminder tool to create a helpful, automated schedule for them from planting to harvest.",
        tools: [{ functionDeclarations: [setReminderFunctionDeclaration] }],
      },
    });
  } catch (err) {
    console.error('Failed to create chat:', err);
    return createMockChat();
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