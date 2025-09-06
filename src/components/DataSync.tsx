import React, { useState } from 'react';
import { useAppStore } from '../stores/app-store';
import { useSpotifyAuth } from '../hooks/use-spotify-auth';
import { dataService } from '../services/data-service';

export const DataSync: React.FC = () => {
  const { 
    setLoading, 
    clearLoading, 
    setTracks, 
    setFilters,
    tracks 
  } = useAppStore();
  
  const { accessToken, user } = useSpotifyAuth();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const handleSync = async () => {
    if (!accessToken) {
      alert('Ei käyttöoikeutta');
      return;
    }

    try {
      setLoading({
        isLoading: true,
        progress: 0,
        stage: 'Aloitetaan synkronointia...',
        error: null
      });

      const enhancedTracks = await dataService.syncAllUserData(
        accessToken,
        (stage, progress) => {
          setLoading({
            isLoading: true,
            progress,
            stage,
            error: null
          });
        }
      );

      // Generate filter options from the data
      const filterState = await dataService.generateFilterState(enhancedTracks);
      
      setTracks(enhancedTracks);
      setFilters(filterState);
      setLastSyncTime(new Date());
      
      clearLoading();
      
    } catch (error) {
      console.error('Sync error:', error);
      setLoading({
        isLoading: false,
        progress: 0,
        stage: '',
        error: error instanceof Error ? error.message : 'Synkronointi epäonnistui'
      });
      
      setTimeout(() => {
        clearLoading();
      }, 5000);
    }
  };

  const loadCachedData = async () => {
    try {
      setLoading({
        isLoading: true,
        progress: 50,
        stage: 'Ladataan tallennettua dataa...',
        error: null
      });

      const cachedTracks = await dataService.getCachedTracks();
      
      if (cachedTracks.length > 0) {
        const filterState = await dataService.generateFilterState(cachedTracks);
        
        setTracks(cachedTracks);
        setFilters(filterState);
        
        setLoading({
          isLoading: true,
          progress: 100,
          stage: 'Valmis!',
          error: null
        });
        
        setTimeout(() => clearLoading(), 1000);
      } else {
        clearLoading();
        alert('Ei tallennettua dataa löytynyt. Suorita synkronointi.');
      }
    } catch (error) {
      console.error('Load cached data error:', error);
      clearLoading();
      alert('Tallennetun datan lataus epäonnistui');
    }
  };

  const stats = {
    tracks: tracks.length,
    tracksWithFeatures: tracks.filter(t => t.audioFeatures).length,
    genres: new Set(tracks.flatMap(t => t.artistDetails?.flatMap((a: any) => a.genres) || [])).size,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-lg shadow-2xl border border-green-500/20">
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Tervetuloa, {user?.display_name}!
                </h1>
                <p className="text-gray-400">
                  Synkronoi Spotify-datasi aloittaaksesi
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Viimeksi synkronoitu:</div>
                <div className="text-white">
                  {lastSyncTime ? lastSyncTime.toLocaleString('fi-FI') : 'Ei koskaan'}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          {stats.tracks > 0 && (
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white mb-4">Tilastot</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">{stats.tracks.toLocaleString()}</div>
                  <div className="text-gray-400">Kappaleita</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">{stats.tracksWithFeatures.toLocaleString()}</div>
                  <div className="text-gray-400">Audio features</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">{stats.genres}</div>
                  <div className="text-gray-400">Genreä</div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleSync}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  🔄 Synkronoi Spotify-data
                </button>
                
                {stats.tracks === 0 && (
                  <button
                    onClick={loadCachedData}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                  >
                    📂 Lataa tallennettu data
                  </button>
                )}
              </div>

              {stats.tracks > 0 && (
                <div className="text-center">
                  <button
                    onClick={() => window.location.href = '#filters'}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                  >
                    ▶️ Jatka suodattimiin
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                Synkronointi tuo:
              </h3>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Kaikki soittolistasi ja niiden kappaleet</li>
                <li>• Audio features (tempo, energia, genre jne.)</li>
                <li>• Artistitiedot ja genret</li>
                <li>• Tallennus selaimen paikalliseen tietokantaan</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};