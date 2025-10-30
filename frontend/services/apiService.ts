// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// Types
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
}

interface ChatRequest {
  message: string;
  context?: string;
}

interface ChatResponse {
  response: string;
  timestamp: string;
}

interface ConversationHistory {
  id: number;
  user_id: number;
  question: string;
  response: string;
  context?: string;
  timestamp: string;
}

// Storage helpers
const getToken = (): string | null => {
  return localStorage.getItem('access_token');
};

const setToken = (token: string): void => {
  localStorage.setItem('access_token', token);
};

const removeToken = (): void => {
  localStorage.removeItem('access_token');
};

// API helper function
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Authentication Services
export const register = async (data: RegisterData): Promise<any> => {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // OAuth2 password flow expects form data
  const formData = new URLSearchParams();
  formData.append('username', credentials.email); // OAuth2 uses 'username' field
  formData.append('password', credentials.password);

  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(error.detail || 'Login failed');
  }

  const authResponse: AuthResponse = await response.json();
  setToken(authResponse.access_token);
  return authResponse;
};

export const logout = (): void => {
  removeToken();
};

export const getCurrentUser = async (): Promise<any> => {
  return apiRequest('/api/auth/me');
};

// Chat Services
export const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  return apiRequest('/api/chat/message', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

export const getChatHistory = async (limit: number = 50): Promise<ConversationHistory[]> => {
  return apiRequest(`/api/chat/history?limit=${limit}`);
};

export const deleteConversation = async (conversationId: number): Promise<any> => {
  return apiRequest(`/api/chat/history/${conversationId}`, {
    method: 'DELETE',
  });
};

// Conversation/Training Data Services
export const getAllConversations = async (skip: number = 0, limit: number = 100): Promise<ConversationHistory[]> => {
  return apiRequest(`/api/conversations/all?skip=${skip}&limit=${limit}`);
};

export const exportConversationsForTraining = async (days: number = 30): Promise<any> => {
  return apiRequest(`/api/conversations/export?days=${days}`);
};

export const getConversationStatistics = async (): Promise<any> => {
  return apiRequest('/api/conversations/statistics');
};

// Image Generation (Note: Local LLM doesn't generate images, returns description)
export const generateImage = async (prompt: string): Promise<string> => {
  // Since we're using a local LLM that can't generate images,
  // we'll return a placeholder or description
  throw new Error('Image generation is not available with local LLM. Please use a dedicated image generation model.');
};

// Text-to-Speech (would need additional backend implementation)
export const generateSpeech = async (text: string): Promise<string> => {
  throw new Error('Text-to-speech is not implemented in the local backend yet.');
};

// Text Extraction (would need additional backend implementation)
export const extractTextFromImage = async (image: { mimeType: string; data: string }): Promise<string> => {
  throw new Error('Text extraction is not implemented in the local backend yet.');
};

// Export token management
export { getToken, setToken, removeToken };
