// Immediate OAuth parameter handler - runs before React
// This ensures OAuth parameters are captured even if routing changes the URL quickly

export const handleImmediateOAuth = () => {
  const search = window.location.search;
  const pathname = window.location.pathname;
  
  console.log('OAuth Handler: Immediate check', { search, pathname });
  
  // If we have OAuth parameters, store them immediately
  if (search.includes('code=') || search.includes('error=')) {
    console.log('OAuth Handler: Found OAuth parameters, storing for processing');
    
    // Store the parameters in sessionStorage so they survive routing changes
    sessionStorage.setItem('spotify_oauth_params', search);
    sessionStorage.setItem('spotify_oauth_timestamp', Date.now().toString());
    
    // Also trigger a custom event that React can listen to
    window.dispatchEvent(new CustomEvent('spotify-oauth-detected', { 
      detail: { search, pathname } 
    }));
  }
};

export const getStoredOAuthParams = (): string | null => {
  const params = sessionStorage.getItem('spotify_oauth_params');
  const timestamp = sessionStorage.getItem('spotify_oauth_timestamp');
  
  // Only return params if they're recent (within 5 minutes)
  if (params && timestamp) {
    const age = Date.now() - parseInt(timestamp);
    if (age < 5 * 60 * 1000) { // 5 minutes
      return params;
    }
  }
  
  return null;
};

export const clearStoredOAuthParams = () => {
  sessionStorage.removeItem('spotify_oauth_params');
  sessionStorage.removeItem('spotify_oauth_timestamp');
};