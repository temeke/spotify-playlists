import type { SpotifyAuthState } from '../types';
import { mockAuthState } from './spotify-mock-data';

class MockSpotifyAuth {
  private clientId: string = '';
  private redirectUri: string = '';

  setClientId(clientId: string) {
    this.clientId = clientId;
    this.redirectUri = `${window.location.origin}/callback`;
    console.log('MockAuth: Client ID set:', clientId);
  }

  // Generate random string for state parameter
  private generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  // Simulate OAuth flow - just sets mock data
  async initiateLogin(): Promise<void> {
    if (!this.clientId) {
      throw new Error('Client ID not set. Call setClientId() first.');
    }

    console.log('MockAuth: Simulating OAuth login...');
    
    // Simulate the OAuth process by immediately setting auth state and redirecting
    const state = this.generateRandomString(16);
    const code = this.generateRandomString(32);
    
    // Store mock state
    localStorage.setItem('spotify_auth_state', state);
    localStorage.setItem('spotify_code_verifier', 'mock-code-verifier');
    
    // Simulate Spotify redirect with mock code
    const callbackUrl = `${this.redirectUri}?code=${code}&state=${state}`;
    console.log('MockAuth: Simulating redirect to:', callbackUrl);
    
    // Simulate the redirect by updating the URL and triggering a navigation
    setTimeout(() => {
      window.history.pushState(null, '', callbackUrl);
      // Trigger a popstate event to simulate navigation
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, 1000); // 1 second delay to simulate network request
  }

  // Handle mock callback 
  async handleCallback(): Promise<SpotifyAuthState | null> {
    console.log('MockAuth: Handling callback...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state'); 
    const error = urlParams.get('error');

    console.log('MockAuth: Callback params:', { hasCode: !!code, hasState: !!state, error });

    // Clear URL parameters
    window.history.replaceState(null, '', window.location.pathname);

    if (error) {
      console.error('MockAuth: OAuth error:', error);
      return null;
    }

    // Verify state parameter
    const storedState = localStorage.getItem('spotify_auth_state');
    if (!state || state !== storedState) {
      console.error('MockAuth: State mismatch');
      return null;
    }

    if (!code) {
      console.error('MockAuth: No authorization code');
      return null; 
    }

    // Clean up stored values
    localStorage.removeItem('spotify_auth_state');
    localStorage.removeItem('spotify_code_verifier');

    // Simulate token exchange delay
    console.log('MockAuth: Simulating token exchange...');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return mock auth state
    const authState: SpotifyAuthState = {
      ...mockAuthState,
      expiresAt: Date.now() + (3600 * 1000) // 1 hour from now
    };

    console.log('MockAuth: Token exchange successful');
    this.saveAuthState(authState);
    return authState;
  }

  // Save auth state to localStorage
  saveAuthState(authState: SpotifyAuthState): void {
    console.log('MockAuth: Saving auth state to localStorage');
    localStorage.setItem('spotify_auth', JSON.stringify(authState));
  }

  // Load auth state from localStorage
  loadAuthState(): SpotifyAuthState | null {
    const stored = localStorage.getItem('spotify_auth');
    if (!stored) {
      console.log('MockAuth: No stored auth state found');
      return null;
    }

    try {
      const authState: SpotifyAuthState = JSON.parse(stored);
      
      // Check if token is expired
      if (authState.expiresAt && Date.now() >= authState.expiresAt) {
        console.log('MockAuth: Stored token expired');
        this.clearAuthState();
        return null;
      }

      console.log('MockAuth: Loaded valid auth state from localStorage');
      return authState;
    } catch (error) {
      console.error('MockAuth: Failed to parse stored auth state:', error);
      this.clearAuthState();
      return null;
    }
  }

  // Clear auth state
  clearAuthState(): void {
    console.log('MockAuth: Clearing auth state');
    localStorage.removeItem('spotify_auth');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const authState = this.loadAuthState();
    return authState?.isAuthenticated || false;
  }

  // Get current access token
  getAccessToken(): string | null {
    const authState = this.loadAuthState();
    return authState?.accessToken || null;
  }

  // Logout
  logout(): void {
    console.log('MockAuth: Logging out');
    this.clearAuthState();
  }

  // Check if token is about to expire (within 5 minutes)
  isTokenExpiringSoon(): boolean {
    const authState = this.loadAuthState();
    if (!authState?.expiresAt) return false;
    
    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
    return authState.expiresAt <= fiveMinutesFromNow;
  }
}

export const mockSpotifyAuth = new MockSpotifyAuth();
