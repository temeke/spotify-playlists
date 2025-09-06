import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  AppState, 
  LoadingState, 
  FilterState, 
  EnhancedTrack, 
  SpotifyUser,
  FilterOptions,
  GeneratedPlaylist
} from '../types';

interface AppStore extends AppState {
  // Auth actions
  setAuthenticated: (isAuthenticated: boolean) => void;
  setUser: (user: SpotifyUser | null) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;

  // Loading actions
  setLoading: (loading: Partial<LoadingState>) => void;
  clearLoading: () => void;

  // Data actions
  setTracks: (tracks: EnhancedTrack[]) => void;
  setFilters: (filters: FilterState) => void;
  
  // Filter application
  filterTracks: (filterOptions: Partial<FilterOptions>) => EnhancedTrack[];
  
  // Generated playlists
  generatedPlaylists: GeneratedPlaylist[];
  addGeneratedPlaylist: (playlist: GeneratedPlaylist) => void;
  removeGeneratedPlaylist: (playlistId: string) => void;

  // Client configuration
  spotifyClientId: string;
  setSpotifyClientId: (clientId: string) => void;
}

const initialLoadingState: LoadingState = {
  isLoading: false,
  progress: 0,
  stage: '',
  error: null,
};

const initialFilterState: FilterState = {
  availableGenres: [],
  availableKeys: [],
  availableModes: [],
  availableTimeSignatures: [],
  tempoRange: [60, 200],
  energyRange: [0, 1],
  danceabilityRange: [0, 1],
  valenceRange: [0, 1],
  acousticnessRange: [0, 1],
  instrumentalnessRange: [0, 1],
  popularityRange: [0, 100],
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      auth: {
        isAuthenticated: false,
        user: null,
        accessToken: null,
      },
      loading: initialLoadingState,
      filters: initialFilterState,
      tracks: [],
      playlists: [],
      generatedPlaylists: [],
      spotifyClientId: '',

      // Auth actions
      setAuthenticated: (isAuthenticated) =>
        set((state) => ({
          auth: { ...state.auth, isAuthenticated }
        })),

      setUser: (user) =>
        set((state) => ({
          auth: { ...state.auth, user }
        })),

      setAccessToken: (accessToken) =>
        set((state) => ({
          auth: { ...state.auth, accessToken }
        })),

      logout: () =>
        set(() => ({
          auth: {
            isAuthenticated: false,
            user: null,
            accessToken: null,
          },
          tracks: [],
          playlists: [],
          filters: initialFilterState,
        })),

      // Loading actions
      setLoading: (loading) =>
        set((state) => ({
          loading: { ...state.loading, ...loading }
        })),

      clearLoading: () =>
        set(() => ({
          loading: initialLoadingState
        })),

      // Data actions
      setTracks: (tracks) =>
        set(() => ({ tracks })),

      setFilters: (filters) =>
        set(() => ({ filters })),

      // Filter tracks based on criteria
      filterTracks: (filterOptions) => {
        const { tracks } = get();
        
        return tracks.filter(track => {
          // Genre filter
          if (filterOptions.genres && filterOptions.genres.length > 0) {
            const trackGenres = track.artistDetails?.flatMap(artist => artist.genres) || [];
            const hasMatchingGenre = filterOptions.genres.some(genre => 
              trackGenres.includes(genre)
            );
            if (!hasMatchingGenre) return false;
          }

          // Audio features filters
          if (track.audioFeatures) {
            const af = track.audioFeatures;

            // Tempo
            if (filterOptions.tempoRange) {
              const [min, max] = filterOptions.tempoRange;
              if (af.tempo < min || af.tempo > max) return false;
            }

            // Energy
            if (filterOptions.energyRange) {
              const [min, max] = filterOptions.energyRange;
              if (af.energy < min || af.energy > max) return false;
            }

            // Danceability
            if (filterOptions.danceabilityRange) {
              const [min, max] = filterOptions.danceabilityRange;
              if (af.danceability < min || af.danceability > max) return false;
            }

            // Valence
            if (filterOptions.valenceRange) {
              const [min, max] = filterOptions.valenceRange;
              if (af.valence < min || af.valence > max) return false;
            }

            // Acousticness
            if (filterOptions.acousticnessRange) {
              const [min, max] = filterOptions.acousticnessRange;
              if (af.acousticness < min || af.acousticness > max) return false;
            }

            // Instrumentalness
            if (filterOptions.instrumentalnessRange) {
              const [min, max] = filterOptions.instrumentalnessRange;
              if (af.instrumentalness < min || af.instrumentalness > max) return false;
            }

            // Key
            if (filterOptions.keys && filterOptions.keys.length > 0) {
              if (!filterOptions.keys.includes(af.key)) return false;
            }

            // Mode
            if (filterOptions.modes && filterOptions.modes.length > 0) {
              if (!filterOptions.modes.includes(af.mode)) return false;
            }

            // Time signature
            if (filterOptions.timeSignatures && filterOptions.timeSignatures.length > 0) {
              if (!filterOptions.timeSignatures.includes(af.time_signature)) return false;
            }
          }

          // Popularity
          if (filterOptions.popularityRange) {
            const [min, max] = filterOptions.popularityRange;
            if (track.popularity < min || track.popularity > max) return false;
          }

          return true;
        });
      },

      // Generated playlists
      addGeneratedPlaylist: (playlist) =>
        set((state) => ({
          generatedPlaylists: [playlist, ...state.generatedPlaylists]
        })),

      removeGeneratedPlaylist: (playlistId) =>
        set((state) => ({
          generatedPlaylists: state.generatedPlaylists.filter(p => p.id !== playlistId)
        })),

      // Client configuration
      setSpotifyClientId: (clientId) =>
        set(() => ({ spotifyClientId: clientId })),
    }),
    {
      name: 'spotify-playlist-generator-store',
      partialize: (state) => ({
        auth: {
          isAuthenticated: state.auth.isAuthenticated,
          user: state.auth.user,
          accessToken: null, // Don't persist access token
        },
        generatedPlaylists: state.generatedPlaylists,
        spotifyClientId: state.spotifyClientId,
      }),
    }
  )
);