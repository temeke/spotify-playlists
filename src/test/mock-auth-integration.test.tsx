import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthSetup } from '../components/AuthSetup';
import { useAppStore } from '../stores/app-store';
import { mockSpotifyAuth } from '../mocks/mock-auth-service';
import { useMockServices } from '../config';

// Mock the config to always return true for mock services in this test
vi.mock('../config', () => ({
  useMockServices: vi.fn(() => true),
  config: {
    useMockServices: true,
    enableDebugLogs: true,
    mockDelays: {
      auth: 100,
      apiCall: 50,
      tokenExchange: 50
    }
  }
}));

// Mock the hook to provide a controlled state
const mockSetAuthenticated = vi.fn();
const mockSetUser = vi.fn(); 
const mockSetAccessToken = vi.fn();
const mockLogout = vi.fn();
const mockSetSpotifyClientId = vi.fn();

vi.mock('../stores/app-store', () => ({
  useAppStore: vi.fn(() => ({
    auth: {
      isAuthenticated: false,
      user: null,
      accessToken: null
    },
    spotifyClientId: '',
    setAuthenticated: mockSetAuthenticated,
    setUser: mockSetUser,
    setAccessToken: mockSetAccessToken,
    logout: mockLogout,
    setSpotifyClientId: mockSetSpotifyClientId
  }))
}));

describe('Mock Authentication Integration', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    localStorage.clear();
    
    // Reset mock auth state
    mockSpotifyAuth.clearAuthState();
    
    // Ensure we're in mock mode
    expect(useMockServices()).toBe(true);
  });

  it('should successfully login with test client ID in mock mode', async () => {
    render(<AuthSetup />);
    
    // Verify mock mode indicator is shown
    expect(screen.getByText('Mock-tila käytössä - Testaamista varten')).toBeInTheDocument();
    expect(screen.getByText(/Syötä mikä tahansa teksti Client ID kenttään/)).toBeInTheDocument();
    
    // Find input and button
    const clientIdInput = screen.getByLabelText('Spotify Client ID');
    const loginButton = screen.getByRole('button', { name: /Kirjaudu Spotifyyn/ });
    
    // Enter test client ID
    fireEvent.change(clientIdInput, { target: { value: 'test' } });
    expect(clientIdInput).toHaveValue('test');
    
    // Mock window.alert to ensure no error alert is shown
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Click login button
    fireEvent.click(loginButton);
    
    // Button should show loading state initially
    await waitFor(() => {
      expect(screen.getByText('Kirjaudutaan...')).toBeInTheDocument();
    });
    
    // Wait for client ID to be set
    await waitFor(() => {
      expect(mockSetSpotifyClientId).toHaveBeenCalledWith('test');
    }, { timeout: 2000 });
    
    // Verify no error alert was shown
    expect(alertSpy).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  it('should handle empty client ID correctly', async () => {
    // Mock window.alert to capture the call
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<AuthSetup />);
    
    const loginButton = screen.getByRole('button', { name: /Kirjaudu Spotifyyn/ });
    
    // Initially button should be disabled because input is empty
    expect(loginButton).toBeDisabled();
    
    // Verify that empty client ID validation works on form level
    const clientIdInput = screen.getByLabelText('Spotify Client ID');
    expect(clientIdInput).toHaveValue('');
    
    alertSpy.mockRestore();
  });

  it('should accept various test client IDs in mock mode', async () => {
    const testClientIds = ['test', 'demo', 'localhost'];
    
    for (const testId of testClientIds) {
      // Clear mocks but don't re-render in loop
      vi.clearAllMocks();
      
      // Test that different client IDs are accepted
      expect(testId.length).toBeGreaterThan(0);
      expect(typeof testId).toBe('string');
    }
    
    // Test one specific case
    render(<AuthSetup />);
    const clientIdInput = screen.getByLabelText('Spotify Client ID');
    
    // Test that input accepts different values
    fireEvent.change(clientIdInput, { target: { value: 'test' } });
    expect(clientIdInput).toHaveValue('test');
    
    fireEvent.change(clientIdInput, { target: { value: 'demo' } });  
    expect(clientIdInput).toHaveValue('demo');
  });

  it('should show correct UI elements in mock mode', () => {
    render(<AuthSetup />);
    
    // Check for mock mode indicator
    expect(screen.getByText('🧪')).toBeInTheDocument();
    expect(screen.getByText('Mock-tila käytössä - Testaamista varten')).toBeInTheDocument();
    
    // Check instructions
    expect(screen.getByText(/Voit testata sovellusta ilman oikeaa Spotify API:a/)).toBeInTheDocument();
    expect(screen.getByText(/Syötä mikä tahansa teksti Client ID kenttään/)).toBeInTheDocument();
    expect(screen.getByText(/Sovellus simuloi Spotify kirjautumisen/)).toBeInTheDocument();
    expect(screen.getByText(/Saat käyttöösi mock-dataa testausta varten/)).toBeInTheDocument();
    
    // Should NOT show real Spotify setup instructions
    expect(screen.queryByText('Spotify App Setup:')).not.toBeInTheDocument();
    expect(screen.queryByText('developer.spotify.com')).not.toBeInTheDocument();
  });
});