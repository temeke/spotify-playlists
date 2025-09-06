import { useAppStore } from './stores/app-store';
import { useSpotifyAuth } from './hooks/use-spotify-auth';
import { AuthSetup } from './components/AuthSetup';
import { DataSync } from './components/DataSync';
import { MainApp } from './components/MainApp';
import { LoadingScreen } from './components/LoadingScreen';

function App() {
  const { tracks } = useAppStore();
  const { isAuthenticated } = useSpotifyAuth();

  console.log('App: Render state:', {
    isAuthenticated,
    tracksLength: tracks.length,
    currentPath: window.location.pathname
  });

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
