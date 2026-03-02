import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useStore } from './store/useStore';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ToastContainer from './components/ui/Toast';
import Dashboard from './pages/Dashboard';
import ConnectionPanel from './components/proxy/ConnectionPanel';
import RegionSelector from './components/region/RegionSelector';
import ProxyBrowser from './components/browser/ProxyBrowser';
import MediaGrid from './components/media/MediaGrid';
import VideoPlayer from './components/video/VideoPlayer';
import SpeedTestPage from './pages/SpeedTestPage';
import FavoritesPage from './pages/FavoritesPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import { connectToProxy } from './utils/proxyService';
import { Country, MediaItem } from './types';

const viewTitles: Record<string, { title: string; subtitle?: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of your activity' },
  connect: { title: 'Connect', subtitle: 'Choose a region and connect' },
  browse: { title: 'Proxy Browser', subtitle: 'Browse through your selected region' },
  media: { title: 'Media Library', subtitle: 'Discover and stream content worldwide' },
  speed: { title: 'Speed Test', subtitle: 'Test your proxy speed' },
  favorites: { title: 'Favorites', subtitle: 'Your saved content' },
  history: { title: 'History', subtitle: 'Recent activity' },
  settings: { title: 'Settings', subtitle: 'Configure your experience' },
};

export default function App() {
  const { theme, setSelectedCountry, setConnection, setIsConnecting, addToast, selectedMedia, setSelectedMedia } = useStore();
  const [activeView, setActiveView] = useState('dashboard');
  const [showRegionPicker, setShowRegionPicker] = useState(false);

  const handleNavigate = useCallback((view: string) => {
    setActiveView(view);
    setShowRegionPicker(false);
  }, []);

  const handleConnectToCountry = useCallback(async (country: Country) => {
    setSelectedCountry(country);
    setIsConnecting(true);
    try {
      const state = await connectToProxy(country, 'HTTPS', (stats) => {
        setConnection(stats);
      });
      setConnection(state);
      addToast({ type: 'success', message: `Connected to ${country.flag} ${country.name}` });
      setShowRegionPicker(false);
      setActiveView('browse');
    } catch (err) {
      addToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to connect',
        duration: 6000,
      });
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const handleSelectMedia = useCallback((media: MediaItem) => {
    setSelectedMedia(media);
  }, []);

  const { title, subtitle } = viewTitles[activeView] || { title: 'GlobeStream' };

  const renderContent = () => {
    if (showRegionPicker) {
      return <RegionSelector onConnect={handleConnectToCountry} />;
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} onSelectMedia={handleSelectMedia} />;
      case 'connect':
        return <ConnectionPanel onSelectRegion={() => setShowRegionPicker(true)} />;
      case 'browse':
        return <ProxyBrowser />;
      case 'media':
        return <MediaGrid onSelectMedia={handleSelectMedia} />;
      case 'speed':
        return <SpeedTestPage />;
      case 'favorites':
        return <FavoritesPage onSelectMedia={handleSelectMedia} />;
      case 'history':
        return <HistoryPage onSelectMedia={handleSelectMedia} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onNavigate={handleNavigate} onSelectMedia={handleSelectMedia} />;
    }
  };

  return (
    <div data-theme={theme}>
      <div className="app-layout">
        <Sidebar activeView={activeView} onNavigate={handleNavigate} />
        <main className="app-main">
          <Header
            title={showRegionPicker ? 'Select Region' : title}
            subtitle={showRegionPicker ? 'Choose a country to connect through' : subtitle}
          />
          <div style={{ flex: 1, overflow: 'auto', padding: activeView === 'browse' ? 0 : undefined }}>
            {renderContent()}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {selectedMedia && (
          <VideoPlayer media={selectedMedia} onClose={() => setSelectedMedia(null)} />
        )}
      </AnimatePresence>

      <ToastContainer />
    </div>
  );
}
