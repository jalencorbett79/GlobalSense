import { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Zap, ArrowDown, Activity,
  RefreshCw, Power, Globe, Lock
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { connectToProxy, disconnectProxy, formatBytes } from '../../utils/proxyService';
import './ConnectionPanel.css';

interface ConnectionPanelProps {
  onSelectRegion: () => void;
}

export default function ConnectionPanel({ onSelectRegion }: ConnectionPanelProps) {
  const {
    selectedCountry, connection, setConnection,
    isConnecting, setIsConnecting, addToast,
  } = useStore();

  const handleConnect = useCallback(async () => {
    if (!selectedCountry) {
      addToast({ type: 'warning', message: 'Please select a region first' });
      return;
    }

    setIsConnecting(true);
    try {
      const state = await connectToProxy(selectedCountry, 'HTTPS', (stats) => {
        setConnection(stats);
      });
      setConnection(state);
        addToast({
          type: 'success',
        message: `Connected to ${selectedCountry.flag} ${selectedCountry.name} — proxy active`,
        });
    } catch (err) {
        addToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Connection failed',
        duration: 6000,
        });
    } finally {
      setIsConnecting(false);
    }
  }, [selectedCountry]);

  const handleDisconnect = useCallback(async () => {
    await disconnectProxy();
    setConnection({
      isConnected: false,
      countryCode: null,
      countryName: null,
      countryFlag: null,
      protocol: null,
      connectedAt: null,
      latency: 0,
      requestCount: 0,
      bytesDown: 0,
    });
    addToast({ type: 'info', message: 'Disconnected' });
  }, []);

  const elapsed = connection.connectedAt
    ? Math.floor((Date.now() - new Date(connection.connectedAt).getTime()) / 1000)
    : 0;
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  return (
    <div className="connection-panel">
      {/* Big Connect Button */}
      <div className="connect-hero">
        <motion.button
          className={`connect-button ${connection.isConnected ? 'connected' : ''} ${isConnecting ? 'connecting' : ''}`}
          onClick={connection.isConnected ? handleDisconnect : handleConnect}
          whileTap={{ scale: 0.95 }}
          disabled={isConnecting}
        >
          <div className="connect-rings">
            <span className="ring ring-1" />
            <span className="ring ring-2" />
            <span className="ring ring-3" />
          </div>
          <div className="connect-icon">
            {isConnecting ? (
              <RefreshCw size={40} className="spin" />
            ) : connection.isConnected ? (
              <ShieldCheck size={40} />
            ) : (
              <Power size={40} />
            )}
          </div>
        </motion.button>

        <div className="connect-status-text">
          <h2>
            {isConnecting
              ? 'Connecting...'
              : connection.isConnected
              ? 'Region Active'
              : 'Not Connected'}
          </h2>
          <p>
            {connection.isConnected
              ? `${connection.countryFlag} ${connection.countryName} • ${connection.latency}ms`
              : 'Select a region to unlock regional content'}
          </p>
        </div>
      </div>

      {/* Selected Region */}
      <div className="panel-section">
        <button className="select-region-btn" onClick={onSelectRegion}>
          <Globe size={18} />
          <div className="select-region-info">
            <span className="select-region-label">Selected Region</span>
            <span className="select-region-value">
              {selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : 'Choose a region'}
            </span>
          </div>
          <span className="select-region-arrow">→</span>
        </button>
      </div>

      {/* Info */}
      <div className="panel-section">
        <h4 className="panel-section-title">
          <Lock size={14} /> How it works
        </h4>
        <div style={{
          padding: '12px 14px', background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-light)',
          borderRadius: 'var(--gs-radius)', fontSize: 12, lineHeight: 1.6, color: 'var(--gs-text-secondary)'
        }}>
          Select a region → browse the <strong>Media</strong> tab for regional content → stream movies &amp; shows directly in the app via embedded providers.
        </div>
      </div>

      {/* Live Stats */}
      {connection.isConnected && (
        <motion.div
          className="live-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="stat-card">
            <div className="stat-icon download"><ArrowDown size={16} /></div>
            <div className="stat-info">
              <span className="stat-label">Downloaded</span>
              <span className="stat-value">{formatBytes(connection.bytesDown)}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon speed"><Activity size={16} /></div>
            <div className="stat-info">
              <span className="stat-label">Requests</span>
              <span className="stat-value">{connection.requestCount}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon upload"><Zap size={16} /></div>
            <div className="stat-info">
              <span className="stat-label">Latency</span>
              <span className="stat-value">{connection.latency}ms</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon time"><RefreshCw size={16} /></div>
            <div className="stat-info">
              <span className="stat-label">Duration</span>
              <span className="stat-value">
                {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

