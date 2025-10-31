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

// Mock user database (in-memory for demo)
const mockUsers = new Map<string, string>();

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
  await delay(500); // Simulate network delay

  if (mockUsers.has(data.email)) {
    throw new Error('Email already registered');
  }

  mockUsers.set(data.email, data.password);
  console.log('✅ Mock Registration successful:', data.email);
  
  return { 
    email: data.email, 
    message: 'User registered successfully' 
  };
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  await delay(500); // Simulate network delay

  const storedPassword = mockUsers.get(credentials.email);
  
  // Check credentials
  if (!storedPassword) {
    throw new Error('User not found. Please sign up first.');
  }

  if (storedPassword !== credentials.password) {
    throw new Error('Incorrect email or password');
  }

  // Generate mock token
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

  return {
    email: 'test@example.com',
    id: 1
  };
};

// Export token management
export { getToken, setToken, removeToken };

// Add some default test users
mockUsers.set('test@example.com', 'password123');
mockUsers.set('farmer@example.com', 'farmer123');

console.log('🎭 Mock API Service loaded');
console.log('📝 Pre-registered test users:');
console.log('   - test@example.com / password123');
console.log('   - farmer@example.com / farmer123');
