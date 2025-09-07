import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockSpotifyAuth } from '../mocks/mock-auth-service'
import { mockSpotifyAPI } from '../mocks/mock-spotify-api'
import { createMockDataService } from '../mocks/mock-data-service'
import { mockUser, mockPlaylists, mockTracks } from '../mocks/spotify-mock-data'

describe('Mock Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('should set client ID correctly', () => {
    localStorage.clear()
    const clientId = 'test-client-id'
    mockSpotifyAuth.setClientId(clientId)
    expect(console.log).toHaveBeenCalledWith('MockAuth: Client ID set:', clientId)
  })

  it('should simulate OAuth login flow', async () => {
    mockSpotifyAuth.setClientId('test-client-id')
    
    // Mock the setTimeout to execute immediately
    vi.spyOn(window, 'setTimeout').mockImplementation((fn: any) => fn())
    vi.spyOn(window, 'dispatchEvent').mockImplementation(() => true)
    vi.spyOn(window.history, 'pushState').mockImplementation(() => {})
    
    // Test that the method executes without errors and calls expected window methods
    await expect(mockSpotifyAuth.initiateLogin()).resolves.toBeUndefined()
    
    // Verify that window methods were called
    expect(window.history.pushState).toHaveBeenCalled()
    expect(window.dispatchEvent).toHaveBeenCalled()
  })

  it('should handle callback with state mismatch', async () => {
    // Mock window.location.search with mismatched state
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        search: '?code=mock-auth-code&state=different-state',
        pathname: '/callback'
      },
      writable: true
    })
    
    // Mock history.replaceState
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {})
    
    // Mock localStorage to return a different stored state
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('original-state')

    const authState = await mockSpotifyAuth.handleCallback()

    // Should return null due to state mismatch
    expect(authState).toBeNull()
  })

  it('should return null when no auth state is stored', () => {
    // Mock localStorage.getItem to return null (no stored state)
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)

    const loadedState = mockSpotifyAuth.loadAuthState()
    
    // Should return null when no state is stored
    expect(loadedState).toBeNull()
  })

  it('should handle expired tokens', () => {
    const expiredAuthState = {
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
      expiresAt: Date.now() - 1000, // Expired
      isAuthenticated: true
    }
    
    // Mock localStorage.getItem to return expired auth state
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(expiredAuthState))
    // Mock removeItem for cleanup
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {})

    const loadedState = mockSpotifyAuth.loadAuthState()
    expect(loadedState).toBeNull()
  })
})

describe('Mock Spotify API', () => {
  beforeEach(() => {
    mockSpotifyAPI.setAccessToken('test-token')
  })

  it('should return current user', async () => {
    const user = await mockSpotifyAPI.getCurrentUser()
    expect(user).toEqual(mockUser)
  })

  it('should return user playlists', async () => {
    const response = await mockSpotifyAPI.getUserPlaylists()
    expect(response.items).toEqual(mockPlaylists)
    expect(response.total).toBe(mockPlaylists.length)
  })

  it('should return playlist tracks', async () => {
    const response = await mockSpotifyAPI.getPlaylistTracks('playlist-1')
    expect(response.items).toBeDefined()
    expect(response.items.length).toBeGreaterThan(0)
    expect(response.items[0].track).toBeDefined()
  })

  it('should return audio features', async () => {
    const trackIds = ['track-1', 'track-2']
    const response = await mockSpotifyAPI.getAudioFeatures(trackIds)
    expect(response.audio_features).toBeDefined()
    expect(response.audio_features.length).toBe(trackIds.length)
  })

  it('should create playlist', async () => {
    const playlist = await mockSpotifyAPI.createPlaylist(
      'test-user',
      'Test Playlist',
      'Test description'
    )
    expect(playlist.name).toBe('Test Playlist')
    expect(playlist.description).toBe('Test description')
    expect(playlist.owner.id).toBe('test-user')
  })

  it('should throw error without access token', async () => {
    const api = mockSpotifyAPI
    api.setAccessToken('')
    
    await expect(api.getCurrentUser()).rejects.toThrow('No access token available')
  })
})

describe('Mock Data Service', () => {
  let mockDataService: ReturnType<typeof createMockDataService>

  beforeEach(() => {
    mockDataService = createMockDataService()
  })

  it('should sync all user data', async () => {
    const progressCallback = vi.fn()
    const tracks = await mockDataService.syncAllUserData('test-token', progressCallback)
    
    expect(tracks).toBeDefined()
    expect(tracks.length).toBeGreaterThan(0)
    expect(progressCallback).toHaveBeenCalledWith('Valmis!', 100)
  })

  it('should generate filter state', async () => {
    const mockTracksForFilter = [
      {
        ...mockTracks[0],
        audioFeatures: {
          id: 'track-1',
          tempo: 120,
          energy: 0.8,
          danceability: 0.7,
          valence: 0.6,
          acousticness: 0.1,
          instrumentalness: 0.0,
          key: 5,
          mode: 1,
          time_signature: 4,
          loudness: -5,
          speechiness: 0.05,
          liveness: 0.1,
          type: 'audio_features' as const,
          duration_ms: 200000
        },
        artistDetails: [
          {
            id: 'artist-1',
            name: 'Test Artist',
            genres: ['pop', 'rock'],
            popularity: 70,
            followers: { total: 1000 },
            images: []
          }
        ],
        playlistId: 'playlist-1',
        playlistName: 'Test Playlist',
        popularity: 75
      }
    ] as any[]

    const filterState = await mockDataService.generateFilterState(mockTracksForFilter)
    
    expect(filterState.availableGenres).toContain('pop')
    expect(filterState.availableGenres).toContain('rock')
    expect(filterState.tempoRange[0]).toBeLessThanOrEqual(120)
    expect(filterState.tempoRange[1]).toBeGreaterThanOrEqual(120)
  })

  it('should get database stats', async () => {
    const stats = await mockDataService.getDatabaseStats()
    
    expect(stats.tracks).toBeGreaterThan(0)
    expect(stats.playlists).toBeGreaterThan(0)
    expect(stats.artists).toBeGreaterThan(0)
  })

  it('should create playlist', async () => {
    const result = await mockDataService.createPlaylist(
      'test-token',
      'test-user',
      'New Playlist',
      'Description',
      ['track-1', 'track-2']
    )
    
    expect(result.playlistId).toBeDefined()
    expect(result.playlistUrl).toBeDefined()
  })
})
