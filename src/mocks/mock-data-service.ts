import type {
  EnhancedTrack,
  FilterState
} from '../types';
import {
  mockEnhancedTracks,
  mockPlaylists
} from './spotify-mock-data';
import { mockSpotifyAPI } from './mock-spotify-api';

interface ProgressCallback {
  (stage: string, progress: number): void;
}

class MockDataService {
  async syncAllUserData(
    accessToken: string,
    onProgress?: ProgressCallback
  ): Promise<EnhancedTrack[]> {
    console.log('MockDataService: Starting sync...');
    mockSpotifyAPI.setAccessToken(accessToken);

    try {
      // Simulate progressive sync with delays
      onProgress?.('Haetaan soittolistoja...', 10);
      await this.delay(300);

      onProgress?.('Soittolistat haettu', 20);
      await this.delay(200);

      onProgress?.('Haetaan kappaleita soittolistoilta...', 30);
      await this.delay(500);

      // Simulate processing each playlist
      for (let i = 0; i < mockPlaylists.length; i++) {
        const progress = 30 + ((i + 1) / mockPlaylists.length) * 30;
        onProgress?.(`Haettu ${i + 1}/${mockPlaylists.length} soittolistaa`, progress);
        await this.delay(200);
      }

      onProgress?.('Kaikki kappaleet haettu', 60);
      await this.delay(300);

      onProgress?.('Haetaan audio features...', 70);
      await this.delay(400);

      // Simulate audio features processing
      for (let i = 0; i < mockEnhancedTracks.length; i += 10) {
        const progress = 70 + ((i + 10) / mockEnhancedTracks.length) * 15;
        onProgress?.(`Audio features haettu ${Math.min(i + 10, mockEnhancedTracks.length)}/${mockEnhancedTracks.length}`, progress);
        await this.delay(150);
      }

      onProgress?.('Audio features haettu', 85);
      await this.delay(200);

      onProgress?.('Haetaan artistitietoja...', 90);
      await this.delay(300);

      onProgress?.('Artistit haettu', 95);
      await this.delay(200);

      onProgress?.('Valmistellaan dataa...', 95);
      await this.delay(100);

      onProgress?.('Valmis!', 100);

      console.log('MockDataService: Sync complete, returning', mockEnhancedTracks.length, 'tracks');
      return mockEnhancedTracks;

    } catch (error) {
      console.error('MockDataService: Sync error:', error);
      throw error;
    }
  }

  async getCachedTracks(): Promise<EnhancedTrack[]> {
    console.log('MockDataService: Getting cached tracks...');
    await this.delay(100);
    
    // Return cached tracks if available, otherwise empty array
    const hasCachedData = Math.random() > 0.3; // 70% chance of having cached data
    return hasCachedData ? mockEnhancedTracks : [];
  }

  async generateFilterState(tracks: EnhancedTrack[]): Promise<FilterState> {
    console.log('MockDataService: Generating filter state...');
    await this.delay(200);

    const genres = new Set<string>();
    const keys = new Set<number>();
    const modes = new Set<number>();
    const timeSignatures = new Set<number>();
    
    let minTempo = Infinity, maxTempo = -Infinity;
    let minEnergy = Infinity, maxEnergy = -Infinity;
    let minDanceability = Infinity, maxDanceability = -Infinity;
    let minValence = Infinity, maxValence = -Infinity;
    let minAcousticness = Infinity, maxAcousticness = -Infinity;
    let minInstrumentalness = Infinity, maxInstrumentalness = -Infinity;
    let minPopularity = Infinity, maxPopularity = -Infinity;

    tracks.forEach(track => {
      // Collect genres from artists
      track.artistDetails?.forEach((artist: any) => {
        artist.genres.forEach((genre: string) => genres.add(genre));
      });

      // Collect audio features data
      if (track.audioFeatures) {
        const af = track.audioFeatures;
        
        keys.add(af.key);
        modes.add(af.mode);
        timeSignatures.add(af.time_signature);
        
        minTempo = Math.min(minTempo, af.tempo);
        maxTempo = Math.max(maxTempo, af.tempo);
        
        minEnergy = Math.min(minEnergy, af.energy);
        maxEnergy = Math.max(maxEnergy, af.energy);
        
        minDanceability = Math.min(minDanceability, af.danceability);
        maxDanceability = Math.max(maxDanceability, af.danceability);
        
        minValence = Math.min(minValence, af.valence);
        maxValence = Math.max(maxValence, af.valence);
        
        minAcousticness = Math.min(minAcousticness, af.acousticness);
        maxAcousticness = Math.max(maxAcousticness, af.acousticness);
        
        minInstrumentalness = Math.min(minInstrumentalness, af.instrumentalness);
        maxInstrumentalness = Math.max(maxInstrumentalness, af.instrumentalness);
      }

      minPopularity = Math.min(minPopularity, track.popularity);
      maxPopularity = Math.max(maxPopularity, track.popularity);
    });

    return {
      availableGenres: Array.from(genres).sort(),
      availableKeys: Array.from(keys).sort((a, b) => a - b),
      availableModes: Array.from(modes).sort((a, b) => a - b),
      availableTimeSignatures: Array.from(timeSignatures).sort((a, b) => a - b),
      tempoRange: [Math.floor(minTempo), Math.ceil(maxTempo)],
      energyRange: [minEnergy, maxEnergy],
      danceabilityRange: [minDanceability, maxDanceability],
      valenceRange: [minValence, maxValence],
      acousticnessRange: [minAcousticness, maxAcousticness],
      instrumentalnessRange: [minInstrumentalness, maxInstrumentalness],
      popularityRange: [minPopularity, maxPopularity]
    };
  }

  async createPlaylist(
    accessToken: string,
    userId: string,
    name: string,
    description: string,
    trackIds: string[]
  ): Promise<{ playlistId: string; playlistUrl: string }> {
    console.log('MockDataService: Creating playlist...', { name, trackCount: trackIds.length });
    mockSpotifyAPI.setAccessToken(accessToken);
    await this.delay(400);

    const playlist = await mockSpotifyAPI.createPlaylist(userId, name, description, false);
    
    if (trackIds.length > 0) {
      const trackUris = trackIds.map(id => `spotify:track:${id}`);
      await mockSpotifyAPI.addTracksToPlaylist(playlist.id, trackUris);
    }

    return {
      playlistId: playlist.id,
      playlistUrl: playlist.external_urls?.spotify || `https://open.spotify.com/playlist/${playlist.id}`
    };
  }

  async getDatabaseStats() {
    console.log('MockDataService: Getting database stats...');
    await this.delay(100);
    
    return {
      tracks: mockEnhancedTracks.length,
      playlists: mockPlaylists.length,
      artists: 6, // From mock data
      audioFeatures: mockEnhancedTracks.filter(t => t.audioFeatures).length,
      cacheEntries: 5
    };
  }

  async clearOldData(_daysCutoff = 30) {
    console.log('MockDataService: Clearing old data... (mock - no actual data cleared)');
    await this.delay(100);
    return;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const createMockDataService = () => new MockDataService();
