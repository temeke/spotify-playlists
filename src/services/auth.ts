import type { SpotifyAuthState } from '../types';

class SpotifyAuth {
  private clientId: string = '';
  private redirectUri: string = '';
  private scopes = [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private',
  ];

  setClientId(clientId: string) {
    this.clientId = clientId;
    this.redirectUri = `${window.location.origin}/callback`;
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

  // Start OAuth flow
  initiateLogin(): void {
    if (!this.clientId) {
      throw new Error('Client ID not set. Call setClientId() first.');
    }

    const state = this.generateRandomString(16);
    localStorage.setItem('spotify_auth_state', state);

    const params = new URLSearchParams({
      response_type: 'token',
      client_id: this.clientId,
      scope: this.scopes.join(' '),
      redirect_uri: this.redirectUri,
      state: state,
      show_dialog: 'true'
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  // Handle callback from Spotify
  handleCallback(): SpotifyAuthState | null {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const accessToken = params.get('access_token');
    const tokenType = params.get('token_type');
    const expiresIn = params.get('expires_in');
    const state = params.get('state');
    const error = params.get('error');

    // Clear URL hash
    window.history.replaceState(null, '', window.location.pathname + window.location.search);

    if (error) {
      console.error('Spotify auth error:', error);
      return null;
    }

    // Verify state parameter
    const storedState = localStorage.getItem('spotify_auth_state');
    if (!state || state !== storedState) {
      console.error('State mismatch in Spotify callback');
      return null;
    }

    localStorage.removeItem('spotify_auth_state');

    if (!accessToken || tokenType !== 'Bearer') {
      console.error('Invalid token response from Spotify');
      return null;
    }

    const expiresAt = Date.now() + (parseInt(expiresIn || '3600') * 1000);

    const authState: SpotifyAuthState = {
      accessToken,
      refreshToken: null, // Implicit flow doesn't provide refresh token
      expiresAt,
      isAuthenticated: true,
    };

    this.saveAuthState(authState);
    return authState;
  }

  // Save auth state to localStorage
  saveAuthState(authState: SpotifyAuthState): void {
    localStorage.setItem('spotify_auth', JSON.stringify(authState));
  }

  // Load auth state from localStorage
  loadAuthState(): SpotifyAuthState | null {
    const stored = localStorage.getItem('spotify_auth');
    if (!stored) return null;

    try {
      const authState: SpotifyAuthState = JSON.parse(stored);
      
      // Check if token is expired
      if (authState.expiresAt && Date.now() >= authState.expiresAt) {
        this.clearAuthState();
        return null;
      }

      return authState;
    } catch (error) {
      console.error('Failed to parse stored auth state:', error);
      this.clearAuthState();
      return null;
    }
  }

  // Clear auth state
  clearAuthState(): void {
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

export const spotifyAuth = new SpotifyAuth();