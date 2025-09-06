import React, { useState } from 'react';
import { useAppStore } from '../stores/app-store';
import { useSpotifyAuth } from '../hooks/use-spotify-auth';
import { useFilters } from '../hooks/use-filters';
import { dataService } from '../services/data-service';
import { generatePlaylistName, generatePlaylistDescription, formatDuration, shuffleArray, removeDuplicateTracks } from '../utils';

export const PlaylistGenerator: React.FC = () => {
  const { user, accessToken } = useSpotifyAuth();
  const { addGeneratedPlaylist } = useAppStore();
  const { filterOptions, filteredTracks } = useFilters();
  
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [maxTracks, setMaxTracks] = useState(50);
  const [shuffleTracks, setShuffleTracks] = useState(true);
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!accessToken || !user) {
      alert('Ei käyttöoikeutta');
      return;
    }

    if (filteredTracks.length === 0) {
      alert('Ei kappaleita suodattimien perusteella');
      return;
    }

    try {
      setIsGenerating(true);

      // Prepare tracks
      let tracksToAdd = [...filteredTracks];
      
      // Remove duplicates if requested
      if (removeDuplicates) {
        tracksToAdd = removeDuplicateTracks(tracksToAdd);
      }

      // Shuffle if requested
      if (shuffleTracks) {
        tracksToAdd = shuffleArray(tracksToAdd);
      }

      // Limit tracks
      tracksToAdd = tracksToAdd.slice(0, maxTracks);

      const trackIds = tracksToAdd.map(track => track.id);

      // Generate names if empty
      const finalName = playlistName || generatePlaylistName(filterOptions);
      const finalDescription = playlistDescription || generatePlaylistDescription(filterOptions, tracksToAdd.length);

      // Create playlist
      const { playlistId, playlistUrl } = await dataService.createPlaylist(
        accessToken,
        user.id,
        finalName,
        finalDescription,
        trackIds
      );

      // Save to generated playlists
      addGeneratedPlaylist({
        id: playlistId,
        name: finalName,
        description: finalDescription,
        filters: filterOptions,
        createdAt: new Date().toISOString(),
        trackCount: tracksToAdd.length,
        spotifyUrl: playlistUrl
      });

      alert(`Soittolista "${finalName}" luotu onnistuneesti! ${tracksToAdd.length} kappaletta lisätty.`);

      // Reset form
      setPlaylistName('');
      setPlaylistDescription('');

    } catch (error) {
      console.error('Playlist generation error:', error);
      alert('Soittolistan luonti epäonnistui: ' + (error instanceof Error ? error.message : 'Tuntematon virhe'));
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate stats
  const uniqueTracks = removeDuplicates ? removeDuplicateTracks(filteredTracks) : filteredTracks;
  const finalTrackCount = Math.min(uniqueTracks.length, maxTracks);
  const totalDuration = uniqueTracks.slice(0, maxTracks).reduce((sum, track) => sum + track.duration_ms, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-lg shadow-2xl border border-green-500/20">
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-bold text-white mb-2">
              Luo uusi soittolista
            </h1>
            <p className="text-gray-400">
              {filteredTracks.length.toLocaleString()} kappaletta suodattimien perusteella
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Playlist Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Soittolistan nimi
                  </label>
                  <input
                    type="text"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    placeholder={generatePlaylistName(filterOptions)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Kuvaus (valinnainen)
                  </label>
                  <textarea
                    value={playlistDescription}
                    onChange={(e) => setPlaylistDescription(e.target.value)}
                    placeholder={generatePlaylistDescription(filterOptions, finalTrackCount)}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Maksimi kappaleet: {maxTracks}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="10"
                    value={maxTracks}
                    onChange={(e) => setMaxTracks(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>10</span>
                    <span>200</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={shuffleTracks}
                      onChange={(e) => setShuffleTracks(e.target.checked)}
                      className="w-4 h-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <span className="text-sm text-white">Sekoita kappaleet</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={removeDuplicates}
                      onChange={(e) => setRemoveDuplicates(e.target.checked)}
                      className="w-4 h-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <span className="text-sm text-white">Poista duplikaatit</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Preview Stats */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Esikatselutiedot</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{finalTrackCount}</div>
                  <div className="text-sm text-gray-400">Kappaleita</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{formatDuration(totalDuration)}</div>
                  <div className="text-sm text-gray-400">Kesto</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {new Set(uniqueTracks.slice(0, maxTracks).flatMap(t => t.artists.map((a: any) => a.name))).size}
                  </div>
                  <div className="text-sm text-gray-400">Artistia</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {new Set(uniqueTracks.slice(0, maxTracks).flatMap(t => 
                      t.artistDetails?.flatMap((a: any) => a.genres) || []
                    )).size}
                  </div>
                  <div className="text-sm text-gray-400">Genreä</div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-center">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || filteredTracks.length === 0}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
              >
                {isGenerating ? 'Luodaan soittolistaa...' : '🎵 Luo soittolista Spotifyyn'}
              </button>
            </div>

            {filteredTracks.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                Säädä suodattimia nähdäksesi kappaleita
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};