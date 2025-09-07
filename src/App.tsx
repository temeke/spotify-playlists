import { useState, useEffect } from 'react';
import { useAppStore } from './stores/app-store';
import { useSpotifyAuth } from './hooks/use-spotify-auth';
import { AuthSetup } from './components/AuthSetup';
import { DataSync } from './components/DataSync';
import { MainApp } from './components/MainApp';
import { LoadingScreen } from './components/LoadingScreen';
import { spotifyAuth, spotifyAPI } from './services';
import { getStoredOAuthParams, clearStoredOAuthParams } from './oauth-handler';

function App() {
  const { tracks, setAuthenticated, setUser, setAccessToken } = useAppStore();
  const { isAuthenticated } = useSpotifyAuth();
  const [isHandlingCallback, setIsHandlingCallback] = useState(() => {
    // Check immediately on mount if we have OAuth params
    const search = window.location.search;
    const hasParams = search.includes('code=') || search.includes('error=');
    console.log('App: Initial state check', { search, hasParams, pathname: window.location.pathname });
    return hasParams; // Start in handling mode if we have OAuth params
  });

  // Check immediately if we landed on callback path with OAuth params
  const currentSearch = window.location.search;
  const hasOAuthParams = currentSearch.includes('code=') || currentSearch.includes('error=');
  
  console.log('App: Render state:', {
    isAuthenticated,
    tracksLength: tracks.length,
    currentPath: window.location.pathname,
    isHandlingCallback,
    hasOAuthParams,
    search: currentSearch
  });

  // Handle OAuth callback - check for parameters immediately and continuously  
  useEffect(() => {
    const handleCallback = async () => {
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;
      
      console.log('App: handleCallback called', {
        pathname: currentPath,
        isHandlingCallback,
        search: currentSearch,
        hasParams: currentSearch.includes('code=') || currentSearch.includes('error=')
      });
      
      // Check if we're on callback path OR if we have OAuth parameters (state/code)
      const isCallbackPath = currentPath === '/callback';
      const hasOAuthParams = currentSearch.includes('code=') || currentSearch.includes('error=');
      const storedParams = getStoredOAuthParams();
      
      // Check if we have OAuth artifacts in localStorage (state + code_verifier)
      // This means we went through OAuth flow but callback parameters were lost
      const hasOAuthArtifacts = localStorage.getItem('spotify_auth_state') && 
                                localStorage.getItem('spotify_code_verifier') && 
                                !localStorage.getItem('spotify_auth');
      
      console.log('App: OAuth check', { 
        isCallbackPath, 
        hasOAuthParams, 
        hasStoredParams: !!storedParams,
        hasOAuthArtifacts 
      });
      
      if ((isCallbackPath || hasOAuthParams || storedParams || hasOAuthArtifacts) && !isHandlingCallback) {
        console.log('App: Handling OAuth callback', { isCallbackPath, hasOAuthParams });
        setIsHandlingCallback(true);
        
        try {
          // If we have stored parameters, temporarily restore them to URL for processing
          if (storedParams && !currentSearch) {
            console.log('App: Using stored OAuth params', storedParams);
            window.history.replaceState(null, '', window.location.pathname + storedParams);
          }
          
          // If we have OAuth artifacts but no parameters, this means callback was broken
          // BUT only show this error if the artifacts are recent (within 5 minutes)
          if (hasOAuthArtifacts && !hasOAuthParams && !storedParams) {
            const stateTimestamp = localStorage.getItem('spotify_auth_timestamp');
            const now = Date.now();
            const fiveMinutesAgo = now - (5 * 60 * 1000);
            
            // If no timestamp or artifacts are old, just clean up silently
            if (!stateTimestamp || parseInt(stateTimestamp) < fiveMinutesAgo) {
              console.log('App: Cleaning up old OAuth artifacts');
              localStorage.removeItem('spotify_auth_state');
              localStorage.removeItem('spotify_code_verifier');
              localStorage.removeItem('spotify_auth_timestamp');
              setIsHandlingCallback(false);
              return;
            }
            
            // Only show error for recent failed attempts
            console.error('App: OAuth callback broken - parameters lost by hosting provider');
            localStorage.removeItem('spotify_auth_state');
            localStorage.removeItem('spotify_code_verifier');
            localStorage.removeItem('spotify_auth_timestamp');
            alert(`Kirjautuminen epäonnistui: OAuth callback parametrit katosivat.\n\nTämä johtuu todennäköisesti hosting asetuksista.\n\nYritä kirjautua uudelleen.`);
            setIsHandlingCallback(false);
            return;
          }
          
          const authState = await spotifyAuth.handleCallback();
          
          // Clear stored params after processing
          clearStoredOAuthParams();
          
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
            console.error('App: Failed to get auth state from callback - token exchange likely failed');
            console.log('App: Check console for detailed error messages from token exchange');
            window.history.replaceState(null, '', '/');
          }
        } catch (error) {
          console.error('App: Error handling callback:', error);
          // Show user the error
          const errorMessage = error instanceof Error ? error.message : 'Tuntematon virhe';
          alert(`Kirjautumisvirhe: ${errorMessage}`);
          window.history.replaceState(null, '', '/');
        } finally {
          setIsHandlingCallback(false);
        }
      }
    };

    // Initial check on mount
    handleCallback();

    // Listen for URL changes (for mock auth and other programmatic navigation)
    const handlePopState = () => {
      console.log('App: URL changed via popstate, checking for callback');
      handleCallback();
    };

    // Also listen for hashchange (some routing scenarios)
    const handleHashChange = () => {
      console.log('App: Hash changed, checking for callback');
      handleCallback();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
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
