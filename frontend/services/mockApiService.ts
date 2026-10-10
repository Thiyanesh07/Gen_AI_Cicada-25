// Mock API Service for testing frontend without backend

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

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_USERS_KEY = 'mock_users';
const DEFAULT_USERS: Record<string, string> = {
  'test@example.com': 'password123',
  'farmer@example.com': 'farmer123',
};

const readMockUsers = (): Map<string, string> => {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const users = new Map<string, string>(Object.entries(parsed));

    for (const [email, password] of Object.entries(DEFAULT_USERS)) {
      if (!users.has(email)) {
        users.set(email, password);
      }
    }

    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(Object.fromEntries(users)));
    return users;
  } catch (error) {
    console.warn('Mock user store unavailable; using in-memory fallback.', error);
    return new Map(Object.entries(DEFAULT_USERS));
  }
};

const writeMockUsers = (users: Map<string, string>): void => {
  try {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(Object.fromEntries(users)));
  } catch (error) {
    console.warn('Unable to persist mock users.', error);
  }
};

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

// Mock Authentication Services
export const register = async (data: RegisterData): Promise<any> => {
  await delay(500);

  const users = readMockUsers();
  if (users.has(data.email)) {
    throw new Error('Email already registered');
  }

  users.set(data.email, data.password);
  writeMockUsers(users);
  console.log('✅ Mock Registration successful:', data.email);

  return {
    email: data.email,
    message: 'User registered successfully'
  };
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  await delay(500);

  const users = readMockUsers();
  const storedPassword = users.get(credentials.email.trim().toLowerCase());

  if (!storedPassword) {
    throw new Error('User not found. Please sign up first.');
  }

  if (storedPassword !== credentials.password) {
    throw new Error('Incorrect email or password');
  }

  const mockToken = `mock_token_${credentials.email}_${Date.now()}`;
  setToken(mockToken);

  console.log('✅ Mock Login successful:', credentials.email);

  return {
    access_token: mockToken,
    token_type: 'bearer'
  };
};

export const logout = (): void => {
  removeToken();
  console.log('✅ Mock Logout successful');
};

export const getCurrentUser = async (): Promise<any> => {
  await delay(300);
  const token = getToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const userEmail = token.includes('_') ? token.split('_')[2] : 'test@example.com';
  return {
    email: userEmail,
    id: 1
  };
};

// Export token management
export { getToken, setToken, removeToken };

readMockUsers();
console.log('🎭 Mock API Service loaded');
console.log('📝 Pre-registered test users:');
console.log('   - test@example.com / password123');
console.log('   - farmer@example.com / farmer123');
