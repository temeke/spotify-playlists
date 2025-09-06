import Dexie from 'dexie';
import type { Table } from 'dexie';
import type {
  StoredTrack,
  StoredAudioFeatures,
  StoredArtist,
  StoredPlaylist,
  CacheMetadata,
  EnhancedTrack,
  SpotifyTrack,
  SpotifyAudioFeatures,
  SpotifyArtist,
  SpotifyPlaylist
} from '../types';

class SpotifyDatabase extends Dexie {
  tracks!: Table<StoredTrack>;
  audioFeatures!: Table<StoredAudioFeatures>;
  artists!: Table<StoredArtist>;
  playlists!: Table<StoredPlaylist>;
  cache!: Table<CacheMetadata>;

  constructor() {
    super('SpotifyPlaylistGenerator');

    this.version(1).stores({
      tracks: 'id, name, playlistId, playlistName, updatedAt',
      audioFeatures: 'trackId, updatedAt',
      artists: 'id, name, updatedAt',
      playlists: 'id, name, lastSyncAt, updatedAt',
      cache: 'key, expiresAt, updatedAt'
    });
  }

  // Convert Spotify API data to stored format
  private trackToStored(
    track: SpotifyTrack, 
    playlistId: string, 
    playlistName: string, 
    addedAt: string
  ): StoredTrack {
    return {
      id: track.id,
      name: track.name,
      artists: JSON.stringify(track.artists.map(a => ({ id: a.id, name: a.name }))),
      album: track.album.name,
      albumId: track.album.id,
      duration_ms: track.duration_ms,
      popularity: track.popularity,
      preview_url: track.preview_url,
      spotify_url: track.external_urls.spotify,
      playlistId,
      playlistName,
      addedAt,
      updatedAt: new Date().toISOString()
    };
  }

  private audioFeaturesToStored(features: SpotifyAudioFeatures): StoredAudioFeatures {
    return {
      trackId: features.id,
      danceability: features.danceability,
      energy: features.energy,
      key: features.key,
      loudness: features.loudness,
      mode: features.mode,
      speechiness: features.speechiness,
      acousticness: features.acousticness,
      instrumentalness: features.instrumentalness,
      liveness: features.liveness,
      valence: features.valence,
      tempo: features.tempo,
      time_signature: features.time_signature,
      updatedAt: new Date().toISOString()
    };
  }

  private artistToStored(artist: SpotifyArtist): StoredArtist {
    return {
      id: artist.id,
      name: artist.name,
      genres: JSON.stringify(artist.genres),
      popularity: artist.popularity,
      followers: artist.followers.total,
      image_url: artist.images[0]?.url || null,
      updatedAt: new Date().toISOString()
    };
  }

  private playlistToStored(playlist: SpotifyPlaylist): StoredPlaylist {
    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      public: playlist.public,
      collaborative: playlist.collaborative,
      owner_id: playlist.owner.id,
      owner_name: playlist.owner.display_name,
      track_count: playlist.tracks.total,
      image_url: playlist.images[0]?.url || null,
      lastSyncAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Store playlist data
  async storePlaylists(playlists: SpotifyPlaylist[]): Promise<void> {
    const storedPlaylists = playlists.map(p => this.playlistToStored(p));
    await this.playlists.bulkPut(storedPlaylists);
  }

  // Store tracks for a playlist
  async storePlaylistTracks(
    playlistId: string,
    playlistName: string,
    tracksData: Array<{ added_at: string; track: SpotifyTrack }>
  ): Promise<void> {
    const storedTracks = tracksData.map(({ track, added_at }) => 
      this.trackToStored(track, playlistId, playlistName, added_at)
    );
    
    await this.tracks.bulkPut(storedTracks);
  }

  // Store audio features
  async storeAudioFeatures(features: SpotifyAudioFeatures[]): Promise<void> {
    const storedFeatures = features.map(f => this.audioFeaturesToStored(f));
    await this.audioFeatures.bulkPut(storedFeatures);
  }

  // Store artists
  async storeArtists(artists: SpotifyArtist[]): Promise<void> {
    const storedArtists = artists.map(a => this.artistToStored(a));
    await this.artists.bulkPut(storedArtists);
  }

  // Get all enhanced tracks with audio features
  async getAllEnhancedTracks(): Promise<EnhancedTrack[]> {
    const tracks = await this.tracks.toArray();
    const audioFeaturesMap = new Map<string, StoredAudioFeatures>();
    const artistsMap = new Map<string, StoredArtist>();

    // Load audio features
    const audioFeatures = await this.audioFeatures.toArray();
    audioFeatures.forEach(af => audioFeaturesMap.set(af.trackId, af));

    // Load artists
    const artists = await this.artists.toArray();
    artists.forEach(a => artistsMap.set(a.id, a));

    return tracks.map(track => {
      const parsedArtists = JSON.parse(track.artists) as Array<{ id: string; name: string }>;
      const audioFeatures = audioFeaturesMap.get(track.id);
      const artistDetails = parsedArtists
        .map(a => artistsMap.get(a.id))
        .filter(Boolean) as StoredArtist[];

      return {
        id: track.id,
        name: track.name,
        artists: parsedArtists,
        album: {
          id: track.albumId,
          name: track.album,
          images: [],
          release_date: ''
        },
        duration_ms: track.duration_ms,
        popularity: track.popularity,
        preview_url: track.preview_url,
        external_urls: {
          spotify: track.spotify_url
        },
        audioFeatures: audioFeatures ? {
          id: audioFeatures.trackId,
          danceability: audioFeatures.danceability,
          energy: audioFeatures.energy,
          key: audioFeatures.key,
          loudness: audioFeatures.loudness,
          mode: audioFeatures.mode,
          speechiness: audioFeatures.speechiness,
          acousticness: audioFeatures.acousticness,
          instrumentalness: audioFeatures.instrumentalness,
          liveness: audioFeatures.liveness,
          valence: audioFeatures.valence,
          tempo: audioFeatures.tempo,
          type: 'audio_features' as const,
          duration_ms: track.duration_ms,
          time_signature: audioFeatures.time_signature
        } : undefined,
        artistDetails: artistDetails.map(a => ({
          id: a.id,
          name: a.name,
          genres: JSON.parse(a.genres),
          popularity: a.popularity,
          followers: { total: a.followers },
          images: a.image_url ? [{ url: a.image_url, height: 640, width: 640 }] : []
        })),
        playlistId: track.playlistId,
        playlistName: track.playlistName
      };
    });
  }

  // Get tracks missing audio features
  async getTracksWithoutAudioFeatures(): Promise<string[]> {
    const allTrackIds = (await this.tracks.toArray()).map(t => t.id);
    const tracksWithFeatures = new Set(
      (await this.audioFeatures.toArray()).map(af => af.trackId)
    );
    
    return allTrackIds.filter(id => !tracksWithFeatures.has(id));
  }

  // Get artists missing from database
  async getMissingArtistIds(artistIds: string[]): Promise<string[]> {
    const existingArtists = new Set(
      (await this.artists.toArray()).map(a => a.id)
    );
    
    return artistIds.filter(id => !existingArtists.has(id));
  }

  // Cache management
  async setCacheItem(key: string, data: any, expirationMinutes = 60): Promise<void> {
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000).toISOString();
    
    await this.cache.put({
      key,
      lastUpdated: new Date().toISOString(),
      expiresAt,
      version: 1
    });
    
    localStorage.setItem(`cache_${key}`, JSON.stringify(data));
  }

  async getCacheItem<T>(key: string): Promise<T | null> {
    const cacheInfo = await this.cache.get(key);
    
    if (!cacheInfo || new Date(cacheInfo.expiresAt) < new Date()) {
      // Cache expired or doesn't exist
      localStorage.removeItem(`cache_${key}`);
      return null;
    }

    const cached = localStorage.getItem(`cache_${key}`);
    return cached ? JSON.parse(cached) : null;
  }

  // Clear old data
  async clearOldData(daysCutoff = 30): Promise<void> {
    const cutoffDate = new Date(Date.now() - daysCutoff * 24 * 60 * 60 * 1000).toISOString();
    
    await this.tracks.where('updatedAt').below(cutoffDate).delete();
    await this.audioFeatures.where('updatedAt').below(cutoffDate).delete();
    await this.artists.where('updatedAt').below(cutoffDate).delete();
    await this.playlists.where('updatedAt').below(cutoffDate).delete();
    await this.cache.where('expiresAt').below(new Date().toISOString()).delete();
  }

  // Get database statistics
  async getStats() {
    const [trackCount, playlistCount, artistCount, featuresCount, cacheCount] = await Promise.all([
      this.tracks.count(),
      this.playlists.count(),
      this.artists.count(),
      this.audioFeatures.count(),
      this.cache.count()
    ]);

    return {
      tracks: trackCount,
      playlists: playlistCount,
      artists: artistCount,
      audioFeatures: featuresCount,
      cacheEntries: cacheCount
    };
  }
}

export const db = new SpotifyDatabase();