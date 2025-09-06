import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { spotifyAuth } from '../services/auth';
import { spotifyAPI } from '../services/spotify-api';
import { useAppStore } from '../stores/app-store';

export const CallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>('Käsitellään kirjautumista...');
  const [error, setError] = useState<string | null>(null);
  
  const { setAuthenticated, setUser, setAccessToken } = useAppStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error parameter
        const urlParams = new URLSearchParams(window.location.search);
        const errorParam = urlParams.get('error');
        
        if (errorParam) {
          setError(`Spotify kirjautumis virhe: ${errorParam}`);
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        setStatus('Vaihdetaan koodia tokenit...');
        
        // Handle the OAuth callback
        const authState = await spotifyAuth.handleCallback();
        
        if (!authState || !authState.accessToken) {
          throw new Error('Ei saatu access tokenia');
        }

        setStatus('Haetaan käyttäjätietoja...');
        
        // Set authentication state
        setAccessToken(authState.accessToken);
        setAuthenticated(true);
        
        // Fetch user info
        spotifyAPI.setAccessToken(authState.accessToken);
        const user = await spotifyAPI.getCurrentUser();
        setUser(user);
        
        setStatus('Kirjautuminen onnistui! Ohjataan...');
        
        // Redirect to main app after short delay
        setTimeout(() => navigate('/'), 1500);
        
      } catch (error) {
        console.error('Callback handling error:', error);
        setError(error instanceof Error ? error.message : 'Tuntematon virhe');
        setTimeout(() => navigate('/'), 5000);
      }
    };

    handleCallback();
  }, [navigate, setAuthenticated, setUser, setAccessToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-lg shadow-2xl p-8 border border-green-500/20 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">
          Spotify Kirjautuminen
        </h1>
        
        {error ? (
          <div className="text-red-400 mb-4">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-lg font-semibold mb-2">Virhe!</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs text-gray-400 mt-2">
              Ohjataan takaisin 5 sekunnin kuluttua...
            </p>
          </div>
        ) : (
          <div className="text-green-400">
            <div className="text-6xl mb-4">🎵</div>
            <p className="text-lg">{status}</p>
            <div className="mt-4 bg-gray-800 rounded-lg p-3">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
