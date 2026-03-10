import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Shield, Play, Search, Zap, Heart, History, Settings,
  ChevronLeft, ChevronRight, ChevronDown, Wifi, WifiOff, Lock
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import './Sidebar.css';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <Globe size={20} /> },
  { id: 'connect', label: 'Connect', icon: <Shield size={20} /> },
  { id: 'browse', label: 'Browse', icon: <Search size={20} /> },
  { id: 'media', label: 'Media', icon: <Play size={20} /> },
  { id: 'speed', label: 'Speed Test', icon: <Zap size={20} /> },
  { id: 'favorites', label: 'Favorites', icon: <Heart size={20} /> },
  { id: 'history', label: 'History', icon: <History size={20} /> },
  { id: 'vpn', label: 'VPN Tools', icon: <Lock size={20} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const { sidebarOpen, setSidebarOpen, connection, selectedCountry } = useStore();
  const [showConnectionInfo, setShowConnectionInfo] = useState(false);

  return (
    <motion.aside
      className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}
      animate={{ width: sidebarOpen ? 260 : 72 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Globe size={24} />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                className="logo-text gradient-text"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
              >
                GlobeStream
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? 'Collapse' : 'Expand'}
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Connection Status */}
      <div
        className={`sidebar-connection ${connection.isConnected ? 'connected' : 'disconnected'}`}
        onClick={() => sidebarOpen && setShowConnectionInfo(!showConnectionInfo)}
      >
        <div className="connection-indicator">
          {connection.isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
          <span className={`status-dot ${connection.isConnected ? 'online' : 'offline'}`} />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="connection-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="connection-status">
                {connection.isConnected ? 'Connected' : 'Disconnected'}
              </span>
              <span className="connection-detail">
                {connection.isConnected && selectedCountry
                  ? `${selectedCountry.flag} ${selectedCountry.name}`
                  : 'Select a region'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        {sidebarOpen && <ChevronDown size={14} className={`connection-chevron ${showConnectionInfo ? 'open' : ''}`} />}
      </div>

      {/* Connection Details Dropdown */}
      <AnimatePresence>
        {showConnectionInfo && sidebarOpen && connection.isConnected && (
          <motion.div
            className="connection-dropdown"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="conn-stat">
              <span>Latency</span>
              <span className="conn-stat-value">{connection.latency}ms</span>
            </div>
            <div className="conn-stat">
              <span>Protocol</span>
              <span className="conn-stat-value">{connection.protocol || '—'}</span>
            </div>
            <div className="conn-stat">
              <span>Requests</span>
              <span className="conn-stat-value">{connection.requestCount}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            title={!sidebarOpen ? item.label : undefined}
          >
            <span className="nav-icon">{item.icon}</span>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  className="nav-label"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            {item.badge && sidebarOpen && (
              <span className="nav-badge">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="sidebar-footer">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="sidebar-version"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span>GlobeStream v1.0</span>
              <span className="version-tag">Open Source</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
