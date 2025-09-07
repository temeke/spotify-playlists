import type { SpotifyAuthState } from '../types';

class SpotifyAuth {
  private clientId: string = '';
  private redirectUri: string = '';
  private scopes = [
    'user-read-private',
    'user-read-email',
    'user-library-read',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private',
  ];
  private codeVerifier: string = '';

  setClientId(clientId: string) {
    this.clientId = clientId;
    // Store clientId in localStorage to survive page reloads during OAuth flow
    localStorage.setItem('spotify_client_id', clientId);
    // Use 127.0.0.1 for local development (Spotify doesn't allow localhost)
    const origin = window.location.hostname === 'localhost' 
      ? `http://127.0.0.1:${window.location.port}` 
      : window.location.origin;
    this.redirectUri = `${origin}/callback`;
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

    // Store state and code verifier with timestamp
    localStorage.setItem('spotify_auth_state', state);
    localStorage.setItem('spotify_code_verifier', this.codeVerifier);
    localStorage.setItem('spotify_auth_timestamp', Date.now().toString());

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

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    console.log('🔍 SPOTIFY AUTH URL:', authUrl);
    console.log('🔍 AUTH PARAMS:', {
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state: state.substring(0, 8) + '...',
      scope: this.scopes.join(' ')
    });

    window.location.href = authUrl;
  }

  // Load clientId from localStorage if not set
  private ensureClientId(): boolean {
    if (!this.clientId) {
      const storedClientId = localStorage.getItem('spotify_client_id');
      if (storedClientId) {
        console.log('Auth: Loading stored clientId');
        this.setClientId(storedClientId);
        return true;
      }
      return false;
    }
    return true;
  }

  // Handle callback from Spotify (Authorization Code flow)
  async handleCallback(): Promise<SpotifyAuthState | null> {
    console.log('Auth: Starting handleCallback');
    
    // Ensure we have clientId (restore from localStorage if needed)
    if (!this.ensureClientId()) {
      console.error('Auth: No clientId available for token exchange');
      return null;
    }
    const urlParams = new URLSearchParams(window.location.search);
    
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    console.log('Auth: URL params:', { 
      hasCode: !!code, 
      hasState: !!state, 
      error,
      codeLength: code?.length
    });

    // Clear URL parameters
    window.history.replaceState(null, '', window.location.pathname);

    if (error) {
      console.error('Spotify auth error:', error);
      return null;
    }

    // Verify state parameter
    const storedState = localStorage.getItem('spotify_auth_state');
    console.log('Auth: State verification:', { 
      receivedState: state?.substring(0, 8) + '...', 
      storedState: storedState?.substring(0, 8) + '...',
      match: state === storedState
    });
    
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
    console.log('Auth: Code verifier check:', { 
      hasCodeVerifier: !!codeVerifier,
      verifierLength: codeVerifier?.length
    });
    
    if (!codeVerifier) {
      console.error('No code verifier found');
      return null;
    }

    // Clean up stored values
    localStorage.removeItem('spotify_auth_state');
    localStorage.removeItem('spotify_code_verifier');

    try {
      console.log('Auth: Exchanging code for token...');
      console.log('Auth: Request params:', {
        grant_type: 'authorization_code',
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        codeLength: code.length,
        verifierLength: codeVerifier.length
      });
      
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

      console.log('Auth: Token response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token exchange failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          clientId: this.clientId,
          redirectUri: this.redirectUri
        });
        
        // Show user-friendly error
        alert(`Kirjautuminen epäonnistui: ${response.status} ${response.statusText}\n\nTarkista että:\n1. Client ID on oikein\n2. Redirect URI on asetettu Spotify Appiin: ${this.redirectUri}`);
        return null;
      }

      const tokenData = await response.json();
      console.log('Auth: Token data received:', {
        hasAccessToken: !!tokenData.access_token,
        hasRefreshToken: !!tokenData.refresh_token,
        expiresIn: tokenData.expires_in
      });
      
      const expiresAt = Date.now() + (tokenData.expires_in * 1000);

      const authState: SpotifyAuthState = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresAt,
        isAuthenticated: true,
      };

      console.log('Auth: Saving auth state...');
      this.saveAuthState(authState);
      console.log('Auth: Auth state saved successfully');
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
    localStorage.removeItem('spotify_client_id');
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