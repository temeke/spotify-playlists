// Service factory - returns mock or real services based on configuration
import { useMockServices } from '../config';

// Real services
import { spotifyAuth as realSpotifyAuth } from './auth';
import { spotifyAPI as realSpotifyAPI } from './spotify-api';
import { dataService as realDataService } from './data-service';

// Mock services  
import { mockSpotifyAuth } from '../mocks/mock-auth-service';
import { mockSpotifyAPI } from '../mocks/mock-spotify-api';
import { createMockDataService } from '../mocks/mock-data-service';

// Export the appropriate services based on configuration
export const spotifyAuth = useMockServices() ? mockSpotifyAuth : realSpotifyAuth;
export const spotifyAPI = useMockServices() ? mockSpotifyAPI : realSpotifyAPI;
export const dataService = useMockServices() ? createMockDataService() : realDataService;

// Log which services are being used
if (useMockServices()) {
  console.log('🎭 Using MOCK services for development/testing');
} else {
  console.log('🎵 Using REAL Spotify services');
}
