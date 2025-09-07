import type {
  SpotifyUser,
  SpotifyPlaylist,
  SpotifyTrack,
  SpotifyAudioFeatures,
  SpotifyArtist,
  EnhancedTrack
} from '../types';

// Mock user data based on Spotify Web API documentation
export const mockUser: SpotifyUser = {
  id: "test-user-123",
  display_name: "Teemu Koskinen",
  email: "teemu@example.com",
  followers: { total: 42 },
  images: [
    {
      url: "https://via.placeholder.com/640x640?text=User",
      height: 640,
      width: 640
    }
  ],
  country: "FI",
  product: "premium"
};

// Mock artists with realistic Finnish music genres
export const mockArtists: SpotifyArtist[] = [
  {
    id: "artist-1",
    name: "Chisu",
    genres: ["finnish pop", "pop", "indie pop"],
    popularity: 65,
    followers: { total: 45000 },
    images: [{ url: "https://via.placeholder.com/640x640?text=Chisu", height: 640, width: 640 }]
  },
  {
    id: "artist-2", 
    name: "Haloo Helsinki!",
    genres: ["finnish rock", "pop rock", "alternative rock"],
    popularity: 72,
    followers: { total: 120000 },
    images: [{ url: "https://via.placeholder.com/640x640?text=Haloo", height: 640, width: 640 }]
  },
  {
    id: "artist-3",
    name: "Elastinen",
    genres: ["finnish rap", "hip hop", "suomi rap"],
    popularity: 58,
    followers: { total: 85000 },
    images: [{ url: "https://via.placeholder.com/640x640?text=Elastinen", height: 640, width: 640 }]
  },
  {
    id: "artist-4",
    name: "Alma",
    genres: ["finnish pop", "electropop", "dance pop"],
    popularity: 69,
    followers: { total: 95000 },
    images: [{ url: "https://via.placeholder.com/640x640?text=Alma", height: 640, width: 640 }]
  },
  {
    id: "artist-5",
    name: "JVG",
    genres: ["finnish rap", "hip hop", "pop rap"],
    popularity: 75,
    followers: { total: 180000 },
    images: [{ url: "https://via.placeholder.com/640x640?text=JVG", height: 640, width: 640 }]
  },
  {
    id: "artist-6",
    name: "Vesala",
    genres: ["finnish pop", "pop", "dance pop"],
    popularity: 61,
    followers: { total: 70000 },
    images: [{ url: "https://via.placeholder.com/640x640?text=Vesala", height: 640, width: 640 }]
  }
];

// Mock tracks with realistic data
export const mockTracks: SpotifyTrack[] = [
  {
    id: "track-1",
    name: "Baden-Baden",
    artists: [{ id: "artist-1", name: "Chisu" }],
    album: {
      id: "album-1",
      name: "Vapaa ja yksin",
      images: [{ url: "https://via.placeholder.com/640x640?text=Album1", height: 640, width: 640 }],
      release_date: "2009-04-22"
    },
    duration_ms: 221000,
    popularity: 68,
    preview_url: "https://p.scdn.co/mp3-preview/example1",
    external_urls: { spotify: "https://open.spotify.com/track/example1" }
  },
  {
    id: "track-2", 
    name: "Kiitos ei kiitos",
    artists: [{ id: "artist-2", name: "Haloo Helsinki!" }],
    album: {
      id: "album-2",
      name: "Kiitos ei kiitos",
      images: [{ url: "https://via.placeholder.com/640x640?text=Album2", height: 640, width: 640 }],
      release_date: "2014-10-15"
    },
    duration_ms: 195000,
    popularity: 72,
    preview_url: "https://p.scdn.co/mp3-preview/example2",
    external_urls: { spotify: "https://open.spotify.com/track/example2" }
  },
  {
    id: "track-3",
    name: "Eteen ja ylös",
    artists: [{ id: "artist-3", name: "Elastinen" }],
    album: {
      id: "album-3", 
      name: "Joka päivä ja joka ikinen yö",
      images: [{ url: "https://via.placeholder.com/640x640?text=Album3", height: 640, width: 640 }],
      release_date: "2013-03-20"
    },
    duration_ms: 238000,
    popularity: 55,
    preview_url: "https://p.scdn.co/mp3-preview/example3",
    external_urls: { spotify: "https://open.spotify.com/track/example3" }
  },
  {
    id: "track-4",
    name: "Dye My Hair",
    artists: [{ id: "artist-4", name: "Alma" }],
    album: {
      id: "album-4",
      name: "Heavy Rules Mixtape", 
      images: [{ url: "https://via.placeholder.com/640x640?text=Album4", height: 640, width: 640 }],
      release_date: "2017-03-10"
    },
    duration_ms: 193000,
    popularity: 71,
    preview_url: "https://p.scdn.co/mp3-preview/example4", 
    external_urls: { spotify: "https://open.spotify.com/track/example4" }
  },
  {
    id: "track-5",
    name: "Hima",
    artists: [{ id: "artist-5", name: "JVG" }],
    album: {
      id: "album-5",
      name: "Popkorni",
      images: [{ url: "https://via.placeholder.com/640x640?text=Album5", height: 640, width: 640 }],
      release_date: "2020-05-15"
    },
    duration_ms: 175000,
    popularity: 78,
    preview_url: "https://p.scdn.co/mp3-preview/example5",
    external_urls: { spotify: "https://open.spotify.com/track/example5" }
  },
  {
    id: "track-6",
    name: "Tequila",
    artists: [{ id: "artist-6", name: "Vesala" }],
    album: {
      id: "album-6", 
      name: "Vesala",
      images: [{ url: "https://via.placeholder.com/640x640?text=Album6", height: 640, width: 640 }],
      release_date: "2018-09-07"
    },
    duration_ms: 201000,
    popularity: 64,
    preview_url: "https://p.scdn.co/mp3-preview/example6",
    external_urls: { spotify: "https://open.spotify.com/track/example6" }
  }
];

// Mock audio features with realistic values
export const mockAudioFeatures: SpotifyAudioFeatures[] = [
  {
    id: "track-1",
    danceability: 0.748,
    energy: 0.916,
    key: 5,
    loudness: -5.883,
    mode: 1,
    speechiness: 0.0461,
    acousticness: 0.00242,
    instrumentalness: 0.000014,
    liveness: 0.279,
    valence: 0.624,
    tempo: 100.014,
    type: "audio_features",
    duration_ms: 221000,
    time_signature: 4
  },
  {
    id: "track-2",
    danceability: 0.635,
    energy: 0.842,
    key: 2,
    loudness: -6.234,
    mode: 1,
    speechiness: 0.0371,
    acousticness: 0.0153,
    instrumentalness: 0.000001,
    liveness: 0.152,
    valence: 0.581,
    tempo: 128.056,
    type: "audio_features", 
    duration_ms: 195000,
    time_signature: 4
  },
  {
    id: "track-3",
    danceability: 0.712,
    energy: 0.735,
    key: 7,
    loudness: -7.119,
    mode: 0,
    speechiness: 0.254,
    acousticness: 0.0891,
    instrumentalness: 0.0,
    liveness: 0.0931,
    valence: 0.439,
    tempo: 95.993,
    type: "audio_features",
    duration_ms: 238000, 
    time_signature: 4
  },
  {
    id: "track-4",
    danceability: 0.826,
    energy: 0.891,
    key: 9,
    loudness: -4.652,
    mode: 1,
    speechiness: 0.0529,
    acousticness: 0.00134,
    instrumentalness: 0.000001,
    liveness: 0.0821,
    valence: 0.712,
    tempo: 124.007,
    type: "audio_features",
    duration_ms: 193000,
    time_signature: 4
  },
  {
    id: "track-5",
    danceability: 0.693,
    energy: 0.758,
    key: 1,
    loudness: -6.891,
    mode: 1,
    speechiness: 0.143,
    acousticness: 0.0321,
    instrumentalness: 0.0,
    liveness: 0.109,
    valence: 0.634,
    tempo: 110.032,
    type: "audio_features",
    duration_ms: 175000,
    time_signature: 4
  },
  {
    id: "track-6",
    danceability: 0.764,
    energy: 0.823,
    key: 4,
    loudness: -5.234,
    mode: 1,
    speechiness: 0.0673,
    acousticness: 0.0089,
    instrumentalness: 0.000012,
    liveness: 0.134,
    valence: 0.587,
    tempo: 118.045,
    type: "audio_features",
    duration_ms: 201000,
    time_signature: 4
  }
];

// Mock playlists
export const mockPlaylists: SpotifyPlaylist[] = [
  {
    id: "playlist-1",
    name: "Suomi pop",
    description: "Parhaita suomalaisia pop-hittejä",
    public: true,
    collaborative: false,
    owner: { id: "test-user-123", display_name: "Teemu Koskinen" },
    tracks: { total: 25, href: "https://api.spotify.com/v1/playlists/playlist-1/tracks" },
    images: [{ url: "https://via.placeholder.com/640x640?text=Playlist1", height: 640, width: 640 }],
    external_urls: { spotify: "https://open.spotify.com/playlist/playlist-1" }
  },
  {
    id: "playlist-2", 
    name: "Kotimaan rock",
    description: "Kotimaisia rock-klassikoja",
    public: false,
    collaborative: false,
    owner: { id: "test-user-123", display_name: "Teemu Koskinen" },
    tracks: { total: 18, href: "https://api.spotify.com/v1/playlists/playlist-2/tracks" },
    images: [{ url: "https://via.placeholder.com/640x640?text=Playlist2", height: 640, width: 640 }],
    external_urls: { spotify: "https://open.spotify.com/playlist/playlist-2" }
  },
  {
    id: "playlist-3",
    name: "Suomi rap",
    description: "Uusin ja paras suomi rap",
    public: true,
    collaborative: false, 
    owner: { id: "test-user-123", display_name: "Teemu Koskinen" },
    tracks: { total: 32, href: "https://api.spotify.com/v1/playlists/playlist-3/tracks" },
    images: [{ url: "https://via.placeholder.com/640x640?text=Playlist3", height: 640, width: 640 }],
    external_urls: { spotify: "https://open.spotify.com/playlist/playlist-3" }
  }
];

// Generate enhanced tracks combining all data
export const mockEnhancedTracks: EnhancedTrack[] = mockTracks.map(track => {
  const audioFeatures = mockAudioFeatures.find(af => af.id === track.id);
  const artistDetails = track.artists.map(artist => 
    mockArtists.find(ma => ma.id === artist.id)
  ).filter(Boolean) as SpotifyArtist[];

  return {
    ...track,
    audioFeatures,
    artistDetails,
    playlistId: mockPlaylists[Math.floor(Math.random() * mockPlaylists.length)].id,
    playlistName: mockPlaylists[Math.floor(Math.random() * mockPlaylists.length)].name
  };
});

// Mock OAuth token response
export const mockTokenResponse = {
  access_token: "BQC9u4gZaX2JKPcEDf3_4xK8X9YvzQs5lMbN1oP7qR3sT6uV8wA2bCdEfGhIjKlMn",
  token_type: "Bearer",
  expires_in: 3600,
  refresh_token: "AQDRf5gH3jK9LmN1oP2qR4sT5uV7wX8yZ9aB0cD1eF2g",
  scope: "user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private"
};

// Mock auth state
export const mockAuthState = {
  accessToken: mockTokenResponse.access_token,
  refreshToken: mockTokenResponse.refresh_token,
  expiresAt: Date.now() + (mockTokenResponse.expires_in * 1000),
  isAuthenticated: true
};
