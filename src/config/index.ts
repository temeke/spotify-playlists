// Development configuration
export const config = {
  // Enable mock mode for development/testing
  // Set to true to use mock services, false for real Spotify API
  useMockServices: import.meta.env.VITE_USE_MOCK_SERVICES === 'true' || import.meta.env.NODE_ENV === 'test',
  
  // Development features
  enableDebugLogs: import.meta.env.NODE_ENV === 'development' || import.meta.env.VITE_DEBUG === 'true',
  
  // Mock configuration
  mockDelays: {
    auth: 1000,       // Auth flow delay (ms)
    apiCall: 300,     // API call delay (ms) 
    tokenExchange: 500 // Token exchange delay (ms)
  },
  
  // Real API configuration
  spotify: {
    baseURL: 'https://api.spotify.com/v1',
    authURL: 'https://accounts.spotify.com',
    scopes: [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-read-collaborative', 
      'playlist-modify-public',
      'playlist-modify-private',
    ]
  }
};

// Utility functions
export const isDevMode = () => import.meta.env.NODE_ENV === 'development';
export const isTestMode = () => import.meta.env.NODE_ENV === 'test';
export const useMockServices = () => config.useMockServices;
