export interface SpotifyAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  public: boolean;
  collaborative: boolean;
  owner: {
    id: string;
    display_name: string;
  };
  tracks: {
    total: number;
    href: string;
  };
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
    genres?: string[];
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
    release_date: string;
  };
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
  is_local?: boolean;
}

export interface SpotifyAudioFeatures {
  id: string;
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
  type: 'audio_features';
  duration_ms: number;
  time_signature: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: {
    total: number;
  };
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
}

export interface EnhancedTrack extends SpotifyTrack {
  audioFeatures?: SpotifyAudioFeatures;
  artistDetails?: SpotifyArtist[];
  playlistId: string;
  playlistName: string;
}

export interface FilterOptions {
  genres: string[];
  tempoRange: [number, number];
  energyRange: [number, number];
  danceabilityRange: [number, number];
  valenceRange: [number, number];
  acousticnessRange: [number, number];
  instrumentalnessRange: [number, number];
  popularityRange: [number, number];
  keys: number[];
  modes: number[];
  timeSignatures: number[];
}

export interface GeneratedPlaylist {
  id: string;
  name: string;
  description: string;
  filters: Partial<FilterOptions>;
  createdAt: string;
  trackCount: number;
  spotifyUrl: string;
}