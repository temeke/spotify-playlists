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
      console.log('useSpotifyAuth: Initializing auth state...');
      
      // Check for existing auth state
      const existingAuthState = spotifyAuth.loadAuthState();
      console.log('useSpotifyAuth: Existing auth state:', {
        hasAuthState: !!existingAuthState,
        hasAccessToken: !!existingAuthState?.accessToken,
        isAuthenticated: existingAuthState?.isAuthenticated,
        expiresAt: existingAuthState?.expiresAt ? new Date(existingAuthState.expiresAt).toISOString() : null
      });
      
      if (existingAuthState && existingAuthState.accessToken) {
        console.log('useSpotifyAuth: Setting auth state from localStorage');
        setAccessToken(existingAuthState.accessToken);
        setAuthenticated(true);
        
        // Check if we need to fetch user info
        if (!auth.user) {
          console.log('useSpotifyAuth: Fetching user info...');
          try {
            spotifyAPI.setAccessToken(existingAuthState.accessToken);
            const user = await spotifyAPI.getCurrentUser();
            setUser(user);
            console.log('useSpotifyAuth: User info set:', user.display_name);
          } catch (error) {
            console.error('Failed to fetch user info:', error);
            logout();
          }
        } else {
          console.log('useSpotifyAuth: User already exists:', auth.user.display_name);
        }
      } else {
        console.log('useSpotifyAuth: No valid auth state found');
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