import { useState, useEffect } from 'react';
import { useAppStore } from './stores/app-store';
import { useSpotifyAuth } from './hooks/use-spotify-auth';
import { AuthSetup } from './components/AuthSetup';
import { DataSync } from './components/DataSync';
import { MainApp } from './components/MainApp';
import { LoadingScreen } from './components/LoadingScreen';
import { spotifyAuth } from './services/auth';
import { spotifyAPI } from './services/spotify-api';

function App() {
  const { tracks, setAuthenticated, setUser, setAccessToken } = useAppStore();
  const { isAuthenticated } = useSpotifyAuth();
  const [isHandlingCallback, setIsHandlingCallback] = useState(false);

  console.log('App: Render state:', {
    isAuthenticated,
    tracksLength: tracks.length,
    currentPath: window.location.pathname,
    isHandlingCallback
  });

  // Handle OAuth callback if we're on /callback path
  useEffect(() => {
    const handleCallback = async () => {
      if (window.location.pathname === '/callback' && !isHandlingCallback) {
        console.log('App: Handling OAuth callback');
        setIsHandlingCallback(true);
        
        try {
          const authState = await spotifyAuth.handleCallback();
          
          if (authState && authState.accessToken) {
            console.log('App: Setting auth state from callback');
            setAccessToken(authState.accessToken);
            setAuthenticated(true);
            
            // Fetch user info
            spotifyAPI.setAccessToken(authState.accessToken);
            const user = await spotifyAPI.getCurrentUser();
            setUser(user);
            
            console.log('App: Callback handling complete, redirecting...');
            // Redirect to main app
            window.history.replaceState(null, '', '/');
          } else {
            console.error('App: Failed to get auth state from callback');
            window.history.replaceState(null, '', '/');
          }
        } catch (error) {
          console.error('App: Error handling callback:', error);
          window.history.replaceState(null, '', '/');
        } finally {
          setIsHandlingCallback(false);
        }
      }
    };

    handleCallback();
  }, [isHandlingCallback, setAuthenticated, setUser, setAccessToken]);

  // Show callback loading screen if handling OAuth
  if (isHandlingCallback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-green-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 rounded-lg shadow-2xl p-8 border border-green-500/20 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Spotify Kirjautuminen
          </h1>
          <div className="text-green-400">
            <div className="text-6xl mb-4">🎵</div>
            <p className="text-lg">Käsitellään kirjautumista...</p>
            <div className="mt-4 bg-gray-800 rounded-lg p-3">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <LoadingScreen />
      
      {!isAuthenticated ? (
        <AuthSetup />
      ) : tracks.length === 0 ? (
        <DataSync />
      ) : (
        <MainApp />
      )}
    </div>
  );
}

export default App;
