export * from './spotify';
export * from './database';

export interface LoadingState {
  isLoading: boolean;
  progress: number;
  stage: string;
  error: string | null;
}

export interface FilterState {
  availableGenres: string[];
  availableKeys: number[];
  availableModes: number[];
  availableTimeSignatures: number[];
  tempoRange: [number, number];
  energyRange: [number, number];
  danceabilityRange: [number, number];
  valenceRange: [number, number];
  acousticnessRange: [number, number];
  instrumentalnessRange: [number, number];
  popularityRange: [number, number];
}

export interface AppState {
  auth: {
    isAuthenticated: boolean;
    user: SpotifyUser | null;
    accessToken: string | null;
  };
  loading: LoadingState;
  filters: FilterState;
  tracks: import('./spotify').EnhancedTrack[];
  playlists: import('./spotify').SpotifyPlaylist[];
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  followers: {
    total: number;
  };
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  country: string;
  product: string;
}