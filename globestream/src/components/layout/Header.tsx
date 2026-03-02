import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Bell, User, Globe, Monitor, Clock, Shield, Wifi } from 'lucide-react';
import { useStore } from '../../store/useStore';
import './Header.css';

interface SessionInfo {
  maskedIp: string;
  location: string;
  device: string;
  timestamp: string;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const API_BASE_URL = import.meta.env.VITE_PROXY_API_URL
  ? import.meta.env.VITE_PROXY_API_URL.replace(/\/api\/proxy\/?$/, '')
  : '';

export default function Header({ title, subtitle }: HeaderProps) {
  const { theme, toggleTheme, selectedCountry, connection } = useStore();
  const [showSessionDropdown, setShowSessionDropdown] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchSessionInfo = useCallback(async () => {
    setSessionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/session-info`);
      if (res.ok) {
        const data = await res.json();
        setSessionInfo(data);
      }
    } catch {
      // Silently fail — info is non-critical
    } finally {
      setSessionLoading(false);
    }
  }, []);

  const toggleDropdown = useCallback(() => {
    setShowSessionDropdown((prev) => {
      if (!prev) fetchSessionInfo();
      return !prev;
    });
  }, [fetchSessionInfo]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSessionDropdown(false);
      }
    }
    if (showSessionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSessionDropdown]);

  return (
    <header className="app-header glass">
      <div className="header-left">
        <div className="header-title-group">
          <h1 className="header-title">{title}</h1>
          {subtitle && <span className="header-subtitle">{subtitle}</span>}
        </div>
      </div>

      <div className="header-right">
        {/* Current Region Badge */}
        {selectedCountry && (
          <div className={`region-badge ${connection.isConnected ? 'active' : ''}`}>
            <span className="region-flag">{selectedCountry.flag}</span>
            <span className="region-name">{selectedCountry.name}</span>
            {connection.isConnected && (
              <span className="region-ping">{connection.latency}ms</span>
            )}
          </div>
        )}

        {/* Theme Toggle */}
        <button className="header-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="header-btn" title="Notifications">
          <Bell size={18} />
          <span className="notification-dot" />
        </button>

        {/* Profile */}
        <div className="session-dropdown-wrapper" ref={dropdownRef}>
          <button
            className="header-btn header-avatar"
            title="Profile"
            onClick={toggleDropdown}
          >
            <User size={18} />
          </button>

          <AnimatePresence>
            {showSessionDropdown && (
              <motion.div
                className="session-dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="session-dropdown-header">
                  <Shield size={14} />
                  <span>Session Information</span>
                </div>

                {sessionLoading ? (
                  <div className="session-dropdown-loading">Loading…</div>
                ) : sessionInfo ? (
                  <div className="session-dropdown-items">
                    <div className="session-item">
                      <Wifi size={14} />
                      <div className="session-item-content">
                        <span className="session-item-label">IP Address</span>
                        <span className="session-item-value">{sessionInfo.maskedIp}</span>
                      </div>
                    </div>
                    <div className="session-item">
                      <Globe size={14} />
                      <div className="session-item-content">
                        <span className="session-item-label">Location</span>
                        <span className="session-item-value">{sessionInfo.location}</span>
                      </div>
                    </div>
                    <div className="session-item">
                      <Monitor size={14} />
                      <div className="session-item-content">
                        <span className="session-item-label">Device</span>
                        <span className="session-item-value">{sessionInfo.device}</span>
                      </div>
                    </div>
                    <div className="session-item">
                      <Clock size={14} />
                      <div className="session-item-content">
                        <span className="session-item-label">Session Time</span>
                        <span className="session-item-value">
                          {new Date(sessionInfo.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="session-dropdown-loading">Unable to load session info</div>
                )}

                <div className="session-dropdown-footer">
                  Information shown for security purposes
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
