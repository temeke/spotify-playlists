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
  private codeVerifier: string = '';

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

  // Generate code verifier for PKCE
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // Generate code challenge for PKCE
  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // Start OAuth flow with PKCE
  async initiateLogin(): Promise<void> {
    if (!this.clientId) {
      throw new Error('Client ID not set. Call setClientId() first.');
    }

    const state = this.generateRandomString(16);
    this.codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(this.codeVerifier);

    // Store state and code verifier
    localStorage.setItem('spotify_auth_state', state);
    localStorage.setItem('spotify_code_verifier', this.codeVerifier);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      scope: this.scopes.join(' '),
      redirect_uri: this.redirectUri,
      state: state,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      show_dialog: 'true'
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  // Handle callback from Spotify (Authorization Code flow)
  async handleCallback(): Promise<SpotifyAuthState | null> {
    const urlParams = new URLSearchParams(window.location.search);
    
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    // Clear URL parameters
    window.history.replaceState(null, '', window.location.pathname);

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

    if (!code) {
      console.error('No authorization code received');
      return null;
    }

    // Get stored code verifier
    const codeVerifier = localStorage.getItem('spotify_code_verifier');
    if (!codeVerifier) {
      console.error('No code verifier found');
      return null;
    }

    // Clean up stored values
    localStorage.removeItem('spotify_auth_state');
    localStorage.removeItem('spotify_code_verifier');

    try {
      // Exchange authorization code for access token
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          code_verifier: codeVerifier,
        }),
      });

      if (!response.ok) {
        console.error('Token exchange failed:', response.status, response.statusText);
        return null;
      }

      const tokenData = await response.json();
      
      const expiresAt = Date.now() + (tokenData.expires_in * 1000);

      const authState: SpotifyAuthState = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresAt,
        isAuthenticated: true,
      };

      this.saveAuthState(authState);
      return authState;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      return null;
    }
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