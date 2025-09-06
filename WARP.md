# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Testing Individual Components
```bash
# Run specific component in dev mode (modify src/main.tsx to render specific component)
npm run dev

# Test specific service functions in browser console
# Example: Test Spotify API connection
# In browser: spotifyAPI.getCurrentUser()
```

### Database Operations
```bash
# Clear browser IndexedDB (for testing)
# Open DevTools > Application > Storage > IndexedDB > Delete "SpotifyPlaylistGenerator"

# Check database stats in browser console
# dataService.getDatabaseStats()
```

## Architecture Overview

### Core Application Flow
This is a React SPA that creates intelligent Spotify playlists using audio features analysis:

1. **Authentication Flow**: OAuth2 with Spotify → User data fetching
2. **Data Synchronization**: Playlists → Tracks → Audio Features → Artist Details
3. **Filter Generation**: Dynamic filters based on user's music library
4. **Playlist Creation**: Filtered tracks → New Spotify playlist

### State Management Architecture
- **Zustand Store** (`src/stores/app-store.ts`): Centralized state with persistence
- **Three State Domains**: Authentication, Loading, and Filters
- **Data Flow**: API → IndexedDB → Zustand → React Components

### Data Layer Architecture
```
Spotify Web API ←→ Services ←→ IndexedDB ←→ Zustand Store ←→ React Components
```

**Key Services:**
- `spotify-api.ts`: API wrapper with rate limiting and chunking
- `data-service.ts`: Orchestrates data sync operations with progress tracking
- `database.ts`: Dexie wrapper for IndexedDB with caching and schema management
- `auth.ts`: OAuth2 flow management

### Component Architecture
- **App.tsx**: Route-like logic (Auth → Sync → Main App)
- **AuthSetup.tsx**: Spotify Client ID input and OAuth initiation
- **DataSync.tsx**: Progress tracking for data synchronization
- **MainApp.tsx**: Filter interface and playlist generation
- **Filter Components**: Dynamic filter generation based on user's music data

### Database Schema (IndexedDB)
- **tracks**: Core track data with playlist relationships
- **audioFeatures**: Spotify's audio analysis data (tempo, energy, etc.)
- **artists**: Artist metadata including genres
- **playlists**: User's playlist metadata
- **cache**: General-purpose cache with expiration

## Key Technical Patterns

### Data Synchronization Pattern
The app uses a progressive sync pattern:
1. Fetch user playlists (only user-owned to avoid permissions)
2. Fetch all tracks from playlists in batches
3. Fetch missing audio features in chunks of 100
4. Fetch missing artist details in chunks of 50
5. Generate filter state from aggregated data

### Rate Limiting Strategy
- Built-in delays between API calls (100-200ms)
- Chunked requests (100 tracks for audio features, 50 for artists)
- Retry logic with exponential backoff
- `makeRequestWithRetry` helper for critical operations

### Filter System Architecture
Filters are dynamically generated from user's actual music data:
- **Range Filters**: Tempo, energy, danceability, etc. (min/max from user data)
- **Categorical Filters**: Genres (from user's artists), keys, modes
- **Real-time Filtering**: `filterTracks` method in store processes all filters

### Offline-First Design
- All data stored in IndexedDB for offline access  
- Persistent authentication state (excluding access tokens)
- Generated playlists saved locally with metadata
- Cache expiration system for API responses

## Spotify Integration Specifics

### Authentication Requirements
- Client ID must be configured in Spotify Developer Console
- Redirect URI: `http://localhost:5173/callback` (dev) or production URL
- Required scopes: user data, playlist read/write

### API Limitations & Handling
- Rate limits: Built-in delays and retry logic
- Batch size limits: 100 tracks/audio features, 50 artists
- Local tracks are filtered out (no Spotify IDs)
- Missing audio features handled gracefully

### Audio Features Interpretation
The app uses Spotify's audio analysis:
- **Tempo**: BPM value for rhythm-based filtering
- **Energy/Danceability/Valence**: 0-1 scales for mood-based filtering
- **Key/Mode**: Musical key and major/minor mode
- **Genres**: Derived from artist data, not track-specific

## Development Notes

### Component Development
- Filter components are self-contained with their own state logic
- Use `useAppStore` hook for global state access
- Loading states managed through centralized loading system

### Adding New Filters
1. Add filter field to `FilterState` type
2. Implement filter logic in `filterTracks` method
3. Create UI component in `src/components/filters/`
4. Update `generateFilterState` in data service

### Database Migrations
The app uses Dexie version 1 schema. For schema changes:
1. Increment version in database constructor  
2. Add migration logic in version definition
3. Test with existing user data

### Finnish Language
The UI is in Finnish. When adding new UI text, maintain language consistency:
- Progress messages in `data-service.ts`
- Error messages and UI labels
- Component props and state descriptions

## Production Deployment

### Build Requirements
- Static site deployment (Vercel/Netlify)
- Update Spotify App redirect URI to production URL
- Ensure proper HTTPS for OAuth2

### Environment Configuration
- No server-side environment variables needed
- All configuration through Spotify Developer Console
- Client ID entered by users during setup

