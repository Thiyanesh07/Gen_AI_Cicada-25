// API Configuration
const API_BASE_URL = 'http://localhost:8000';

const DEMO_CROPS_KEY = 'farmer_demo_crops';
const DEMO_NOTIFICATIONS_KEY = 'farmer_demo_notifications';

const formatIsoDate = (date: Date): string => date.toISOString().split('T')[0];
const formatIsoDateTime = (date: Date): string => date.toISOString();

const buildIndustrialDemoData = () => {
  const now = new Date();

  const cropData = [
    {
      id: 1,
      user_email: 'farmer@example.com',
      crop_name: 'Corn',
      location: 'Salem, Tamil Nadu',
      latitude: 11.6643,
      longitude: 78.146,
      date_planted: '2026-10-01',
      growth_stage: 'Vegetative',
      notes: 'Monitor irrigation scheduling and nutrient uptake during active vegetative growth.',
      created_at: '2026-10-01T00:00:00Z',
      updated_at: '2026-10-08T00:00:00Z'
    },
    {
      id: 2,
      user_email: 'farmer@example.com',
      crop_name: 'Tomato',
      location: 'Coimbatore, Tamil Nadu',
      latitude: 11.0168,
      longitude: 76.9558,
      date_planted: '2026-09-18',
      growth_stage: 'Flowering',
      notes: 'Maintain calcium balance and avoid excess leaf wetness during late evening hours.',
      created_at: '2026-09-18T00:00:00Z',
      updated_at: '2026-09-30T00:00:00Z'
    },
    {
      id: 3,
      user_email: 'farmer@example.com',
      crop_name: 'Rice',
      location: 'Thanjavur, Tamil Nadu',
      latitude: 10.7870,
      longitude: 79.1378,
      date_planted: '2026-08-25',
      growth_stage: 'Tillering',
      notes: 'Maintain standing water depth and monitor nitrogen application timing.',
      created_at: '2026-08-25T00:00:00Z',
      updated_at: '2026-10-05T00:00:00Z'
    },
    {
      id: 4,
      user_email: 'farmer@example.com',
      crop_name: 'Sugarcane',
      location: 'Erode, Tamil Nadu',
      latitude: 11.3410,
      longitude: 77.7172,
      date_planted: '2026-07-12',
      growth_stage: 'Grand Growth',
      notes: 'Check for lodging risk after high wind and improve nutrient placement in ratoon blocks.',
      created_at: '2026-07-12T00:00:00Z',
      updated_at: '2026-10-04T00:00:00Z'
    },
    {
      id: 5,
      user_email: 'farmer@example.com',
      crop_name: 'Banana',
      location: 'Trichy, Tamil Nadu',
      latitude: 10.7905,
      longitude: 78.7047,
      date_planted: '2026-06-20',
      growth_stage: 'Fruit Development',
      notes: 'Increase potassium application and inspect bunch cover hygiene before harvest window.',
      created_at: '2026-06-20T00:00:00Z',
      updated_at: '2026-09-29T00:00:00Z'
    },
    {
      id: 6,
      user_email: 'farmer@example.com',
      crop_name: 'Chili',
      location: 'Krishnagiri, Tamil Nadu',
      latitude: 12.5253,
      longitude: 78.2144,
      date_planted: '2026-09-06',
      growth_stage: 'Flowering',
      notes: 'Prevent thrips pressure with IPM monitoring and ensure proper sprinkler coverage.',
      created_at: '2026-09-06T00:00:00Z',
      updated_at: '2026-10-07T00:00:00Z'
    }
  ];

  const notificationData = [
    {
      id: 1,
      crop_id: 1,
      user_email: 'farmer@example.com',
      crop_name: 'Corn',
      message: 'Irrigation cycle is due in the next 4 hours. Soil moisture has fallen below the target range for the current vegetative stage.',
      notification_type: 'warning',
      weather_condition: 'Sunny',
      temperature: 34,
      humidity: 41,
      is_read: false,
      created_at: new Date(now.getTime() - 1000 * 60 * 65).toISOString()
    },
    {
      id: 2,
      crop_id: 2,
      user_email: 'farmer@example.com',
      crop_name: 'Tomato',
      message: 'Humidity trend indicates a fungal risk window. Increase airflow and reduce nighttime leaf wetness.',
      notification_type: 'alert',
      weather_condition: 'Cloudy',
      temperature: 29,
      humidity: 78,
      is_read: false,
      created_at: new Date(now.getTime() - 1000 * 60 * 120).toISOString()
    },
    {
      id: 3,
      crop_id: 3,
      user_email: 'farmer@example.com',
      crop_name: 'Rice',
      message: 'Nitrogen demand is high in the tillering phase. Apply split dose based on field health review.',
      notification_type: 'info',
      weather_condition: 'Humid',
      temperature: 30,
      humidity: 70,
      is_read: false,
      created_at: new Date(now.getTime() - 1000 * 60 * 210).toISOString()
    },
    {
      id: 4,
      crop_id: 4,
      user_email: 'farmer@example.com',
      crop_name: 'Sugarcane',
      message: 'Wind advisory detected. Secure the ratoon field and inspect for lodging risk in exposed rows.',
      notification_type: 'warning',
      weather_condition: 'Windy',
      temperature: 31,
      humidity: 46,
      is_read: false,
      created_at: new Date(now.getTime() - 1000 * 60 * 300).toISOString()
    },
    {
      id: 5,
      crop_id: 5,
      user_email: 'farmer@example.com',
      crop_name: 'Banana',
      message: 'Leaf health is declining in one block. Check potassium availability and irrigation uniformity.',
      notification_type: 'info',
      weather_condition: 'Partly Cloudy',
      temperature: 28,
      humidity: 62,
      is_read: true,
      created_at: new Date(now.getTime() - 1000 * 60 * 480).toISOString()
    },
    {
      id: 6,
      crop_id: 6,
      user_email: 'farmer@example.com',
      crop_name: 'Chili',
      message: 'Scout required for thrips and flower drop. Early intervention will reduce yield loss.',
      notification_type: 'alert',
      weather_condition: 'Hot',
      temperature: 36,
      humidity: 58,
      is_read: false,
      created_at: new Date(now.getTime() - 1000 * 60 * 560).toISOString()
    }
  ];

  return {
    crops: cropData.map(crop => ({
      ...crop,
      created_at: crop.created_at,
      updated_at: crop.updated_at,
    })),
    notifications: notificationData,
  };
};

const industrialDemoData = buildIndustrialDemoData();
const defaultDemoCrops = industrialDemoData.crops;
const defaultDemoNotifications = industrialDemoData.notifications;

const getLatestKnownDateValue = (value: unknown): number => {
  if (typeof value !== 'string') return 0;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const isStaleDemoData = (value: unknown): boolean => {
  if (!Array.isArray(value) || value.length === 0) return false;

  const newestTimestamp = value.reduce((max, item) => {
    const candidateDates = [
      getLatestKnownDateValue((item as any)?.created_at),
      getLatestKnownDateValue((item as any)?.updated_at),
      getLatestKnownDateValue((item as any)?.date_planted),
    ];

    return Math.max(max, ...candidateDates);
  }, 0);

  if (!newestTimestamp) return false;

  const cutoff = Date.UTC(new Date().getFullYear() - 1, 0, 1);
  return newestTimestamp < cutoff;
};

const readLocalDemoData = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      writeLocalDemoData(key, fallback);
      return fallback;
    }

    const parsed = JSON.parse(raw) as T;
    if (isStaleDemoData(parsed)) {
      writeLocalDemoData(key, fallback);
      return fallback;
    }

    return parsed;
  } catch {
    writeLocalDemoData(key, fallback);
    return fallback;
  }
};

const writeLocalDemoData = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures in demo mode.
  }
};

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

// Crop Management Services
export const getCrops = async (skip: number = 0, limit: number = 100): Promise<any> => {
  try {
    return await apiRequest(`/api/crops?skip=${skip}&limit=${limit}`);
  } catch (error) {
    console.warn('Backend unavailable, using demo crop data.', error);
    const crops = readLocalDemoData(DEMO_CROPS_KEY, defaultDemoCrops);
    return crops.slice(skip, skip + limit);
  }
};

export const getCrop = async (cropId: number): Promise<any> => {
  try {
    return await apiRequest(`/api/crops/${cropId}`);
  } catch (error) {
    console.warn('Backend unavailable, using demo crop data.', error);
    const crops = readLocalDemoData(DEMO_CROPS_KEY, defaultDemoCrops);
    return crops.find(crop => crop.id === cropId) || null;
  }
};

export const createCrop = async (cropData: {
  crop_name: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  date_planted: string;
  growth_stage?: string;
  notes?: string | null;
}): Promise<any> => {
  try {
    return await apiRequest('/api/crops', {
      method: 'POST',
      body: JSON.stringify(cropData),
    });
  } catch (error) {
    console.warn('Backend unavailable, storing demo crop locally.', error);
    const crops = readLocalDemoData(DEMO_CROPS_KEY, defaultDemoCrops);
    const nextId = Math.max(0, ...crops.map(c => c.id)) + 1;
    const demoCrop = {
      id: nextId,
      user_email: 'farmer@example.com',
      crop_name: cropData.crop_name,
      location: cropData.location,
      latitude: cropData.latitude ?? null,
      longitude: cropData.longitude ?? null,
      date_planted: cropData.date_planted,
      growth_stage: cropData.growth_stage || 'Seedling',
      notes: cropData.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updatedCrops = [demoCrop, ...crops];
    writeLocalDemoData(DEMO_CROPS_KEY, updatedCrops);
    return demoCrop;
  }
};

export const updateCrop = async (cropId: number, cropData: any): Promise<any> => {
  try {
    return await apiRequest(`/api/crops/${cropId}`, {
      method: 'PUT',
      body: JSON.stringify(cropData),
    });
  } catch (error) {
    console.warn('Backend unavailable, updating demo crop locally.', error);
    const crops = readLocalDemoData(DEMO_CROPS_KEY, defaultDemoCrops);
    const updatedCrops = crops.map(crop => crop.id === cropId ? { ...crop, ...cropData, updated_at: new Date().toISOString() } : crop);
    writeLocalDemoData(DEMO_CROPS_KEY, updatedCrops);
    return updatedCrops.find(crop => crop.id === cropId) || null;
  }
};

export const deleteCrop = async (cropId: number): Promise<any> => {
  try {
    return await apiRequest(`/api/crops/${cropId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.warn('Backend unavailable, deleting demo crop locally.', error);
    const crops = readLocalDemoData(DEMO_CROPS_KEY, defaultDemoCrops);
    const updatedCrops = crops.filter(crop => crop.id !== cropId);
    writeLocalDemoData(DEMO_CROPS_KEY, updatedCrops);
    return { deleted: true, cropId };
  }
};

// Notification Services
export const getNotifications = async (unreadOnly: boolean = false): Promise<any> => {
  try {
    return await apiRequest(`/api/notifications?unread_only=${unreadOnly}`);
  } catch (error) {
    console.warn('Backend unavailable, using demo notifications.', error);
    const notifications = readLocalDemoData(DEMO_NOTIFICATIONS_KEY, defaultDemoNotifications);
    return unreadOnly ? notifications.filter(n => !n.is_read) : notifications;
  }
};

export const markNotificationRead = async (notificationId: number, isRead: boolean = true): Promise<any> => {
  try {
    return await apiRequest(`/api/notifications/${notificationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ is_read: isRead }),
    });
  } catch (error) {
    console.warn('Backend unavailable, updating demo notification locally.', error);
    const notifications = readLocalDemoData(DEMO_NOTIFICATIONS_KEY, defaultDemoNotifications);
    const updated = notifications.map(n => n.id === notificationId ? { ...n, is_read: isRead } : n);
    writeLocalDemoData(DEMO_NOTIFICATIONS_KEY, updated);
    return { id: notificationId, is_read: isRead };
  }
};

export const deleteNotification = async (notificationId: number): Promise<any> => {
  try {
    return await apiRequest(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.warn('Backend unavailable, deleting demo notification locally.', error);
    const notifications = readLocalDemoData(DEMO_NOTIFICATIONS_KEY, defaultDemoNotifications);
    const updated = notifications.filter(n => n.id !== notificationId);
    writeLocalDemoData(DEMO_NOTIFICATIONS_KEY, updated);
    return { deleted: true, notificationId };
  }
};

export const generateNotifications = async (): Promise<any> => {
  try {
    return await apiRequest('/api/notifications/generate', {
      method: 'POST',
    });
  } catch (error) {
    console.warn('Backend unavailable, generating demo notifications locally.', error);
    const crops = readLocalDemoData(DEMO_CROPS_KEY, defaultDemoCrops);
    const generated = crops.map((crop, index) => ({
      id: Date.now() + index,
      crop_id: crop.id,
      user_email: crop.user_email,
      crop_name: crop.crop_name,
      message: `${crop.crop_name} needs attention: check irrigation and verify growth stage conditions.`,
      notification_type: index % 2 === 0 ? 'warning' : 'info',
      weather_condition: index % 2 === 0 ? 'Sunny' : 'Cloudy',
      temperature: index % 2 === 0 ? 31 : 27,
      humidity: index % 2 === 0 ? 45 : 71,
      is_read: false,
      created_at: new Date().toISOString(),
    }));
    const existing = readLocalDemoData(DEMO_NOTIFICATIONS_KEY, defaultDemoNotifications);
    const merged = [...generated, ...existing];
    writeLocalDemoData(DEMO_NOTIFICATIONS_KEY, merged);
    return merged;
  }
};

export const getNotificationStats = async (): Promise<any> => {
  try {
    return await apiRequest('/api/notifications/stats');
  } catch (error) {
    console.warn('Backend unavailable, using demo notification stats.', error);
    const notifications = readLocalDemoData(DEMO_NOTIFICATIONS_KEY, defaultDemoNotifications);
    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.is_read).length,
      by_type: {
        info: notifications.filter(n => n.notification_type === 'info').length,
        warning: notifications.filter(n => n.notification_type === 'warning').length,
        alert: notifications.filter(n => n.notification_type === 'alert').length,
      }
    };
  }
};

// Image Search Services
interface ImageSearchRequest {
  query: string;
  num_results?: number;
  crop_context?: {
    crop_name?: string;
    growth_stage?: string;
    location?: string;
  };
  use_rag?: boolean;
}

interface ImageResult {
  url: string;
  title: string;
  snippet: string;
  thumbnail: string;
  width?: number;
  height?: number;
  source?: string;
}

interface ImageSearchResponse {
  query: string;
  refined_query?: string;
  results: ImageResult[];
  total_results: number;
  used_rag: boolean;
}

export const searchCropImages = async (request: ImageSearchRequest): Promise<ImageSearchResponse> => {
  return apiRequest('/api/crops/search-images', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

export const searchImagesForCrop = async (
  cropId: number,
  request: ImageSearchRequest
): Promise<ImageSearchResponse> => {
  return apiRequest(`/api/crops/${cropId}/search-images`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

// Export token management
export { getToken, setToken, removeToken };
export type { ImageSearchRequest, ImageResult, ImageSearchResponse };

