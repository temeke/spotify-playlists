import { spotifyAPI } from './spotify-api';
import { db } from './database';
import type { 
  EnhancedTrack, 
  SpotifyPlaylist, 
  FilterState,
  SpotifyUser
} from '../types';

interface ProgressCallback {
  (stage: string, progress: number): void;
}

class DataService {
  async syncAllUserData(
    accessToken: string, 
    onProgress?: ProgressCallback
  ): Promise<EnhancedTrack[]> {
    spotifyAPI.setAccessToken(accessToken);

    try {
      // Step 1: Get user and playlists
      onProgress?.('Haetaan soittolistoja...', 10);
      const [user, playlists] = await Promise.all([
        spotifyAPI.getCurrentUser(),
        spotifyAPI.getAllUserPlaylists()
      ]);

      // Filter only user's own playlists to avoid permission issues
      const userPlaylists = playlists.filter(p => p.owner.id === user.id);
      
      await db.storePlaylists(userPlaylists);
      onProgress?.('Soittolistat haettu', 20);

      // Step 2: Get all tracks from all playlists
      onProgress?.('Haetaan kappaleita soittolistoilta...', 30);
      const allTracks: Array<{
        track: any;
        added_at: string;
        playlistId: string;
        playlistName: string;
      }> = [];

      let playlistIndex = 0;
      for (const playlist of userPlaylists) {
        try {
          const tracksData = await spotifyAPI.getAllPlaylistTracks(playlist.id);
          const validTracks = tracksData
            .filter(item => item.track && item.track.id && !item.track.is_local)
            .map(item => ({
              track: item.track,
              added_at: item.added_at,
              playlistId: playlist.id,
              playlistName: playlist.name
            }));
          
          allTracks.push(...validTracks);
          
          await db.storePlaylistTracks(
            playlist.id, 
            playlist.name,
            validTracks.map(t => ({ track: t.track, added_at: t.added_at }))
          );

          playlistIndex++;
          const progress = 30 + (playlistIndex / userPlaylists.length) * 30;
          onProgress?.(`Haettu ${playlistIndex}/${userPlaylists.length} soittolistaa`, progress);

          // Rate limiting delay
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`Failed to fetch tracks for playlist ${playlist.name}:`, error);
        }
      }

      onProgress?.('Kaikki kappaleet haettu', 60);

      // Step 3: Get audio features for tracks that don't have them
      const tracksWithoutFeatures = await db.getTracksWithoutAudioFeatures();
      
      if (tracksWithoutFeatures.length > 0) {
        onProgress?.('Haetaan audio features...', 70);
        
        // Process in chunks to avoid rate limits
        const chunkSize = 100;
        for (let i = 0; i < tracksWithoutFeatures.length; i += chunkSize) {
          const chunk = tracksWithoutFeatures.slice(i, i + chunkSize);
          
          try {
            const featuresResponse = await spotifyAPI.getAudioFeatures(chunk);
            const validFeatures = featuresResponse.audio_features.filter(Boolean);
            
            if (validFeatures.length > 0) {
              await db.storeAudioFeatures(validFeatures);
            }

            const progress = 70 + ((i + chunk.length) / tracksWithoutFeatures.length) * 15;
            onProgress?.(`Audio features haettu ${i + chunk.length}/${tracksWithoutFeatures.length}`, progress);

            // Rate limiting delay
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (error) {
            console.warn(`Failed to fetch audio features for chunk starting at ${i}:`, error);
          }
        }
      }

      onProgress?.('Audio features haettu', 85);

      // Step 4: Get artist details for missing artists
      const uniqueArtistIds = [...new Set(
        allTracks.flatMap(t => t.track.artists?.map((a: any) => a.id) || [])
      )];
      
      const missingArtistIds = await db.getMissingArtistIds(uniqueArtistIds);
      
      if (missingArtistIds.length > 0) {
        onProgress?.('Haetaan artistitietoja...', 90);
        
        // Process in chunks
        const chunkSize = 50;
        for (let i = 0; i < missingArtistIds.length; i += chunkSize) {
          const chunk = missingArtistIds.slice(i, i + chunkSize);
          
          try {
            const artistsResponse = await spotifyAPI.getArtists(chunk);
            if (artistsResponse.artists.length > 0) {
              await db.storeArtists(artistsResponse.artists);
            }

            const progress = 90 + ((i + chunk.length) / missingArtistIds.length) * 5;
            onProgress?.(`Artistit haettu ${i + chunk.length}/${missingArtistIds.length}`, progress);

            // Rate limiting delay
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (error) {
            console.warn(`Failed to fetch artists for chunk starting at ${i}:`, error);
          }
        }
      }

      // Step 5: Get all enhanced tracks from database
      onProgress?.('Valmistellaan dataa...', 95);
      const enhancedTracks = await db.getAllEnhancedTracks();

      onProgress?.('Valmis!', 100);
      return enhancedTracks;

    } catch (error) {
      console.error('Error syncing user data:', error);
      throw error;
    }
  }

  async getCachedTracks(): Promise<EnhancedTrack[]> {
    return db.getAllEnhancedTracks();
  }

  async generateFilterState(tracks: EnhancedTrack[]): Promise<FilterState> {
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
      track.artistDetails?.forEach(artist => {
        artist.genres.forEach(genre => genres.add(genre));
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
    spotifyAPI.setAccessToken(accessToken);

    // Create playlist
    const playlist = await spotifyAPI.createPlaylist(userId, name, description, false);

    // Add tracks in batches
    if (trackIds.length > 0) {
      const trackUris = trackIds.map(id => `spotify:track:${id}`);
      await spotifyAPI.addTracksToPlaylist(playlist.id, trackUris);
    }

    return {
      playlistId: playlist.id,
      playlistUrl: playlist.external_urls?.spotify || `https://open.spotify.com/playlist/${playlist.id}`
    };
  }

  async getDatabaseStats() {
    return db.getStats();
  }

  async clearOldData(daysCutoff = 30) {
    return db.clearOldData(daysCutoff);
  }
}

export const dataService = new DataService();