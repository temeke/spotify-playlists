export interface StoredTrack {
  id: string;
  name: string;
  artists: string;
  album: string;
  albumId: string;
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  spotify_url: string;
  playlistId: string;
  playlistName: string;
  addedAt: string;
  updatedAt: string;
}

export interface StoredAudioFeatures {
  trackId: string;
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  time_signature: number;
  updatedAt: string;
}

export interface StoredArtist {
  id: string;
  name: string;
  genres: string;
  popularity: number;
  followers: number;
  image_url: string | null;
  updatedAt: string;
}

export interface StoredPlaylist {
  id: string;
  name: string;
  description: string;
  public: boolean;
  collaborative: boolean;
  owner_id: string;
  owner_name: string;
  track_count: number;
  image_url: string | null;
  lastSyncAt: string;
  updatedAt: string;
}

export interface CacheMetadata {
  key: string;
  lastUpdated: string;
  expiresAt: string;
  version: number;
}