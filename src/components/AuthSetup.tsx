import React, { useState } from 'react';
import { useSpotifyAuth } from '../hooks/use-spotify-auth';
import { useMockServices } from '../config';

export const AuthSetup: React.FC = () => {
  const { login, setClientId, spotifyClientId } = useSpotifyAuth();
  const [clientIdInput, setClientIdInput] = useState(spotifyClientId);
  const [isLoading, setIsLoading] = useState(false);
  const isMockMode = useMockServices();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientIdInput.trim()) {
      alert('Anna Spotify Client ID');
      return;
    }

    try {
      setIsLoading(true);
      const trimmedClientId = clientIdInput.trim();
      setClientId(trimmedClientId);
      // Pass the clientId directly to avoid state update timing issues
      await login(trimmedClientId);
      // Reset loading state after successful login
      setIsLoading(false);
    } catch (error) {
      console.error('Login error:', error);
      alert('Kirjautuminen epäonnistui. Tarkista Client ID.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-lg shadow-2xl p-8 border border-green-500/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Spotify Playlist Generator
          </h1>
          <p className="text-gray-400">
            Luo uusia soittolistoja Spotify-kirjastosi pohjalta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-300 mb-2">
              Spotify Client ID
            </label>
            <input
              type="text"
              id="clientId"
              value={clientIdInput}
              onChange={(e) => setClientIdInput(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Anna Spotify App Client ID"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !clientIdInput.trim()}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {isLoading ? 'Kirjaudutaan...' : 'Kirjaudu Spotifyyn'}
          </button>
        </form>

        {isMockMode ? (
          <div className="mt-8 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
            <div className="flex items-center mb-2">
              <span className="text-lg mr-2">🧪</span>
              <h3 className="text-sm font-semibold text-blue-300">
                Mock-tila käytössä - Testaamista varten
              </h3>
            </div>
            <div className="text-xs text-blue-200 space-y-1">
              <p>Voit testata sovellusta ilman oikeaa Spotify API:a:</p>
              <p className="mt-2">• Syötä mikä tahansa teksti Client ID kenttään (esim. "test")</p>
              <p>• Sovellus simuloi Spotify kirjautumisen</p>
              <p>• Saat käyttöösi mock-dataa testausta varten</p>
            </div>
          </div>
        ) : (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">
              Spotify App Setup:
            </h3>
            <ol className="text-xs text-gray-400 space-y-1">
              <li>1. Mene osoitteeseen <span className="text-green-400">developer.spotify.com</span></li>
              <li>2. Luo uusi App</li>
              <li>3. Lisää Redirect URI: <span className="text-green-400">{window.location.origin}/callback</span></li>
              <li>4. Kopioi Client ID tähän</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};