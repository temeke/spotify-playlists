import React from 'react';
import { useAppStore } from '../stores/app-store';
import { useSpotifyAuth } from '../hooks/use-spotify-auth';
import { useFilters } from '../hooks/use-filters';
import { FilterPanel } from './filters/FilterPanel';
import { PlaylistGenerator } from './PlaylistGenerator';

export const MainApp: React.FC = () => {
  const { tracks, generatedPlaylists, activeTab, setActiveTab } = useAppStore();
  const { user, logout } = useSpotifyAuth();
  const { previewCount, filterCount } = useFilters();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900">
      {/* Navigation */}
      <nav className="bg-gray-900/90 backdrop-blur border-b border-green-500/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">
                🎵 Spotify Playlist Generator
              </h1>
              <div className="hidden md:block text-sm text-gray-400">
                {tracks.length.toLocaleString()} kappaleetta
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                Tervetuloa, {user?.display_name}
              </div>
              <button
                onClick={logout}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Kirjaudu ulos
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-gray-800/50 backdrop-blur border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('filters')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'filters'
                  ? 'border-green-500 text-green-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              🔍 Suodattimet
              {filterCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-green-100 bg-green-500 rounded-full">
                  {filterCount}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('generate')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'generate'
                  ? 'border-green-500 text-green-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              🎵 Luo soittolista
              {previewCount > 0 && (
                <span className="ml-2 text-xs text-gray-400">
                  ({previewCount.toLocaleString()})
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-green-500 text-green-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              📜 Historia
              {generatedPlaylists.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-100 bg-blue-500 rounded-full">
                  {generatedPlaylists.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'filters' && (
          <div className="space-y-6">
            <FilterPanel />
            
            {previewCount > 0 && (
              <div className="text-center">
                <button
                  onClick={() => setActiveTab('generate')}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                >
                  ▶️ Luo soittolista ({previewCount.toLocaleString()} kappaleelta)
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'generate' && <PlaylistGenerator />}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg shadow-2xl border border-green-500/20 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                Luodut soittolistat ({generatedPlaylists.length})
              </h2>
              
              {generatedPlaylists.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  Ei luotuja soittolistoja vielä
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedPlaylists.map(playlist => (
                    <div
                      key={playlist.id}
                      className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">
                            {playlist.name}
                          </h3>
                          <p className="text-gray-400 text-sm mt-1">
                            {playlist.trackCount} kappaleeta • Luotu {new Date(playlist.createdAt).toLocaleDateString('fi-FI')}
                          </p>
                          {playlist.description && (
                            <p className="text-gray-500 text-sm mt-2">
                              {playlist.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <a
                            href={playlist.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm transition-colors"
                          >
                            Avaa Spotifyssa
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};