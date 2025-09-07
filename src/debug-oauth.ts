// Debug OAuth flow to understand what's happening

export const logOAuthDebugInfo = () => {
  console.log('=== OAUTH DEBUG INFO ===');
  console.log('Current URL:', window.location.href);
  console.log('Pathname:', window.location.pathname);
  console.log('Search:', window.location.search);
  console.log('Hash:', window.location.hash);
  console.log('Origin:', window.location.origin);
  console.log('Host:', window.location.host);
  console.log('Protocol:', window.location.protocol);
  
  // Check localStorage and sessionStorage
  console.log('localStorage keys:', Object.keys(localStorage));
  console.log('sessionStorage keys:', Object.keys(sessionStorage));
  
  // Check for specific OAuth items
  const authState = localStorage.getItem('spotify_auth_state');
  const codeVerifier = localStorage.getItem('spotify_code_verifier');
  const auth = localStorage.getItem('spotify_auth');
  const oauthParams = sessionStorage.getItem('spotify_oauth_params');
  
  console.log('OAuth Storage:', {
    hasAuthState: !!authState,
    hasCodeVerifier: !!codeVerifier,
    hasAuth: !!auth,
    hasStoredParams: !!oauthParams,
    authState: authState?.substring(0, 10) + '...',
    codeVerifier: codeVerifier?.substring(0, 10) + '...',
    storedParams: oauthParams
  });
  
  // Check browser history
  console.log('History length:', history.length);
  console.log('History state:', history.state);
  
  console.log('=== END DEBUG INFO ===');
};

// Also log when page loads/navigates
window.addEventListener('load', () => {
  console.log('🔍 Page loaded');
  logOAuthDebugInfo();
});

window.addEventListener('popstate', (event) => {
  console.log('🔍 Popstate event', event.state);
  logOAuthDebugInfo();
});

// Log immediately
console.log('🔍 Debug script loaded');
logOAuthDebugInfo();