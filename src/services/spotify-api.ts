import type { 
  SpotifyPlaylist, 
  SpotifyTrack, 
  SpotifyAudioFeatures, 
  SpotifyArtist, 
  SpotifyUser 
} from '../types';

class SpotifyAPI {
  private baseURL = 'https://api.spotify.com/v1';
  private accessToken: string | null = null;

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - token may be expired');
      }
      throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getCurrentUser(): Promise<SpotifyUser> {
    return this.makeRequest<SpotifyUser>('/me');
  }

  async getUserPlaylists(userId?: string, limit = 50, offset = 0): Promise<{
    items: SpotifyPlaylist[];
    total: number;
    limit: number;
    offset: number;
    next: string | null;
  }> {
    const endpoint = userId ? `/users/${userId}/playlists` : '/me/playlists';
    return this.makeRequest(`${endpoint}?limit=${limit}&offset=${offset}`);
  }

  async getAllUserPlaylists(): Promise<SpotifyPlaylist[]> {
    const allPlaylists: SpotifyPlaylist[] = [];
    let offset = 0;
    const limit = 50;
    
    while (true) {
      const response = await this.getUserPlaylists(undefined, limit, offset);
      allPlaylists.push(...response.items);
      
      if (response.next === null) {
        break;
      }
      offset += limit;
    }

    return allPlaylists;
  }

  async getPlaylistTracks(playlistId: string, limit = 100, offset = 0): Promise<{
    items: Array<{
      added_at: string;
      track: SpotifyTrack;
    }>;
    total: number;
    limit: number;
    offset: number;
    next: string | null;
  }> {
    return this.makeRequest(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`);
  }

  async getAllPlaylistTracks(playlistId: string): Promise<Array<{
    added_at: string;
    track: SpotifyTrack;
  }>> {
    const allTracks: Array<{ added_at: string; track: SpotifyTrack }> = [];
    let offset = 0;
    const limit = 100;
    
    while (true) {
      const response = await this.getPlaylistTracks(playlistId, limit, offset);
      allTracks.push(...response.items);
      
      if (response.next === null) {
        break;
      }
      offset += limit;
    }

    return allTracks;
  }

  async getAudioFeatures(trackIds: string[]): Promise<{
    audio_features: (SpotifyAudioFeatures | null)[];
  }> {
    if (trackIds.length === 0) return { audio_features: [] };
    
    // Spotify API allows max 100 track IDs per request
    const chunks: string[][] = [];
    for (let i = 0; i < trackIds.length; i += 100) {
      chunks.push(trackIds.slice(i, i + 100));
    }

    const allFeatures: (SpotifyAudioFeatures | null)[] = [];
    
    for (const chunk of chunks) {
      const response = await this.makeRequest<{
        audio_features: (SpotifyAudioFeatures | null)[];
      }>(`/audio-features?ids=${chunk.join(',')}`);
      allFeatures.push(...response.audio_features);
    }

    return { audio_features: allFeatures };
  }

  async getArtists(artistIds: string[]): Promise<{
    artists: SpotifyArtist[];
  }> {
    if (artistIds.length === 0) return { artists: [] };
    
    // Spotify API allows max 50 artist IDs per request
    const chunks: string[][] = [];
    for (let i = 0; i < artistIds.length; i += 50) {
      chunks.push(artistIds.slice(i, i + 50));
    }

    const allArtists: SpotifyArtist[] = [];
    
    for (const chunk of chunks) {
      const response = await this.makeRequest<{
        artists: SpotifyArtist[];
      }>(`/artists?ids=${chunk.join(',')}`);
      allArtists.push(...response.artists);
    }

    return { artists: allArtists };
  }

  async createPlaylist(
    userId: string, 
    name: string, 
    description?: string, 
    isPublic = false
  ): Promise<SpotifyPlaylist> {
    return this.makeRequest<SpotifyPlaylist>(`/users/${userId}/playlists`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        public: isPublic,
      }),
    });
  }

  async addTracksToPlaylist(playlistId: string, trackUris: string[]): Promise<{
    snapshot_id: string;
  }> {
    // Spotify API allows max 100 track URIs per request
    const chunks: string[][] = [];
    for (let i = 0; i < trackUris.length; i += 100) {
      chunks.push(trackUris.slice(i, i + 100));
    }

    let snapshot_id = '';
    
    for (const chunk of chunks) {
      const response = await this.makeRequest<{
        snapshot_id: string;
      }>(`/playlists/${playlistId}/tracks`, {
        method: 'POST',
        body: JSON.stringify({
          uris: chunk,
        }),
      });
      snapshot_id = response.snapshot_id;
    }

    return { snapshot_id };
  }

  // Rate limiting helper
  async makeRequestWithRetry<T>(
    request: () => Promise<T>, 
    maxRetries = 3, 
    delay = 1000
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await request();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        // If rate limited, wait longer
        if (error instanceof Error && error.message.includes('429')) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1) * 2));
        } else {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw new Error('Max retries exceeded');
  }
}

export const spotifyAPI = new SpotifyAPI();