import type {
  SpotifyUser,
  SpotifyPlaylist,
  SpotifyTrack,
  SpotifyAudioFeatures,
  SpotifyArtist
} from '../types';
import {
  mockUser,
  mockPlaylists,
  mockTracks,
  mockAudioFeatures,
  mockArtists
} from './spotify-mock-data';

class MockSpotifyAPI {
  private accessToken: string | null = null;

  setAccessToken(token: string) {
    this.accessToken = token;
    console.log('MockAPI: Access token set');
  }

  private async delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private validateToken(): void {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }
  }

  async getCurrentUser(): Promise<SpotifyUser> {
    console.log('MockAPI: Getting current user...');
    this.validateToken();
    await this.delay(200);
    return mockUser;
  }

  async getUserPlaylists(userId?: string, limit = 50, offset = 0): Promise<{
    items: SpotifyPlaylist[];
    total: number;
    limit: number;
    offset: number;
    next: string | null;
  }> {
    console.log('MockAPI: Getting user playlists...', { userId, limit, offset });
    this.validateToken();
    await this.delay(400);

    const startIdx = offset;
    const endIdx = Math.min(startIdx + limit, mockPlaylists.length);
    const items = mockPlaylists.slice(startIdx, endIdx);
    
    return {
      items,
      total: mockPlaylists.length,
      limit,
      offset,
      next: endIdx < mockPlaylists.length ? `mock-next-page-${endIdx}` : null
    };
  }

  async getAllUserPlaylists(): Promise<SpotifyPlaylist[]> {
    console.log('MockAPI: Getting all user playlists...');
    this.validateToken();
    await this.delay(500);
    return mockPlaylists;
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
    console.log('MockAPI: Getting playlist tracks...', { playlistId, limit, offset });
    this.validateToken();
    await this.delay(300);

    // Simulate different tracks for different playlists
    const playlistTracks = mockTracks.filter((_, index) => {
      // Distribute tracks across playlists
      const playlistIndex = mockPlaylists.findIndex(p => p.id === playlistId);
      return index % mockPlaylists.length === playlistIndex;
    });

    const startIdx = offset;
    const endIdx = Math.min(startIdx + limit, playlistTracks.length);
    const items = playlistTracks.slice(startIdx, endIdx).map(track => ({
      added_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      track
    }));

    return {
      items,
      total: playlistTracks.length,
      limit,
      offset,
      next: endIdx < playlistTracks.length ? `mock-next-page-${endIdx}` : null
    };
  }

  async getAllPlaylistTracks(playlistId: string): Promise<Array<{
    added_at: string;
    track: SpotifyTrack;
  }>> {
    console.log('MockAPI: Getting all playlist tracks...', { playlistId });
    this.validateToken();
    await this.delay(600);

    const response = await this.getPlaylistTracks(playlistId, 100, 0);
    return response.items;
  }

  async getAudioFeatures(trackIds: string[]): Promise<{
    audio_features: (SpotifyAudioFeatures | null)[];
  }> {
    console.log('MockAPI: Getting audio features...', { trackCount: trackIds.length });
    this.validateToken();
    await this.delay(250);

    // Simulate some missing audio features (5% chance)
    const audio_features = trackIds.map(trackId => {
      if (Math.random() < 0.05) return null; // 5% chance of missing data
      return mockAudioFeatures.find(af => af.id === trackId) || null;
    });

    return { audio_features };
  }

  async getArtists(artistIds: string[]): Promise<{
    artists: SpotifyArtist[];
  }> {
    console.log('MockAPI: Getting artists...', { artistCount: artistIds.length });
    this.validateToken();
    await this.delay(200);

    const artists = artistIds
      .map(artistId => mockArtists.find(artist => artist.id === artistId))
      .filter(Boolean) as SpotifyArtist[];

    return { artists };
  }

  async createPlaylist(
    userId: string,
    name: string,
    description?: string,
    isPublic = false
  ): Promise<SpotifyPlaylist> {
    console.log('MockAPI: Creating playlist...', { userId, name, isPublic });
    this.validateToken();
    await this.delay(400);

    const newPlaylist: SpotifyPlaylist = {
      id: `mock-playlist-${Date.now()}`,
      name,
      description: description || '',
      public: isPublic,
      collaborative: false,
      owner: { id: userId, display_name: mockUser.display_name },
      tracks: { total: 0, href: `https://api.spotify.com/v1/playlists/mock-playlist-${Date.now()}/tracks` },
      images: [{ url: 'https://via.placeholder.com/640x640?text=New+Playlist', height: 640, width: 640 }],
      external_urls: { spotify: `https://open.spotify.com/playlist/mock-playlist-${Date.now()}` }
    };

    return newPlaylist;
  }

  async addTracksToPlaylist(playlistId: string, trackUris: string[]): Promise<{
    snapshot_id: string;
  }> {
    console.log('MockAPI: Adding tracks to playlist...', { playlistId, trackCount: trackUris.length });
    this.validateToken();
    await this.delay(300);

    return {
      snapshot_id: `mock-snapshot-${Date.now()}`
    };
  }

  // Rate limiting helper - for mock this just runs the function
  async makeRequestWithRetry<T>(
    request: () => Promise<T>,
    _maxRetries = 3,
    _delay = 1000
  ): Promise<T> {
    console.log('MockAPI: Making request with retry (mock - no actual retry needed)');
    return request();
  }
}

export const mockSpotifyAPI = new MockSpotifyAPI();
