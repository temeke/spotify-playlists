import React, { useState } from 'react';
import { useSpotifyAuth } from '../hooks/use-spotify-auth';

export const AuthSetup: React.FC = () => {
  const { login, setClientId, spotifyClientId } = useSpotifyAuth();
  const [clientIdInput, setClientIdInput] = useState(spotifyClientId);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientIdInput.trim()) {
      alert('Anna Spotify Client ID');
      return;
    }

    try {
      setIsLoading(true);
      setClientId(clientIdInput.trim());
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure state is saved
      await login();
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
      </div>
    </div>
  );
};