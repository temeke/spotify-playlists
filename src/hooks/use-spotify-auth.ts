import { useEffect, useCallback } from 'react';
import { useAppStore } from '../stores/app-store';
import { spotifyAuth } from '../services/auth';
import { spotifyAPI } from '../services/spotify-api';

export const useSpotifyAuth = () => {
  const { 
    auth, 
    spotifyClientId,
    setAuthenticated, 
    setUser, 
    setAccessToken, 
    logout,
    setSpotifyClientId
  } = useAppStore();

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      // Check for callback parameters in URL (authorization code flow)
      if (window.location.search.includes('code=') || window.location.search.includes('error=')) {
        try {
          const authState = await spotifyAuth.handleCallback();
          if (authState && authState.accessToken) {
            setAccessToken(authState.accessToken);
            setAuthenticated(true);
            
            // Fetch user info
            try {
              spotifyAPI.setAccessToken(authState.accessToken);
              const user = await spotifyAPI.getCurrentUser();
              setUser(user);
            } catch (error) {
              console.error('Failed to fetch user info:', error);
              logout();
            }
          } else {
            console.error('Failed to handle Spotify callback');
          }
        } catch (error) {
          console.error('Error handling Spotify callback:', error);
        }
        return;
      }

      // Check for existing auth state
      const existingAuthState = spotifyAuth.loadAuthState();
      if (existingAuthState && existingAuthState.accessToken) {
        setAccessToken(existingAuthState.accessToken);
        setAuthenticated(true);
        
        // Check if we need to fetch user info
        if (!auth.user) {
          try {
            spotifyAPI.setAccessToken(existingAuthState.accessToken);
            const user = await spotifyAPI.getCurrentUser();
            setUser(user);
          } catch (error) {
            console.error('Failed to fetch user info:', error);
            logout();
          }
        }
      }
    };

    initAuth();
  }, []);

  // Check token expiration periodically
  useEffect(() => {
    if (!auth.isAuthenticated) return;

    const checkTokenExpiration = () => {
      if (spotifyAuth.isTokenExpiringSoon()) {
        console.warn('Spotify token is expiring soon');
        // Could show a warning to user or attempt to refresh
      }
    };

    const interval = setInterval(checkTokenExpiration, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [auth.isAuthenticated]);

  const login = useCallback(async () => {
    if (!spotifyClientId) {
      throw new Error('Spotify Client ID not set');
    }
    
    spotifyAuth.setClientId(spotifyClientId);
    await spotifyAuth.initiateLogin();
  }, [spotifyClientId]);

  const handleLogout = useCallback(() => {
    spotifyAuth.logout();
    logout();
  }, [logout]);

  const setClientId = useCallback((clientId: string) => {
    setSpotifyClientId(clientId);
  }, [setSpotifyClientId]);

  return {
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    accessToken: auth.accessToken,
    spotifyClientId,
    login,
    logout: handleLogout,
    setClientId,
    isTokenExpiringSoon: spotifyAuth.isTokenExpiringSoon,
  };
};