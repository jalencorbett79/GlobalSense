import { motion } from 'framer-motion';
import {
  Globe, Shield, Play, ArrowDown, Zap, Activity,
  MapPin, TrendingUp
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { trendingMedia } from '../utils/mockMedia';
import { countries } from '../utils/countries';
import { formatBytes } from '../utils/proxyService';
import { MediaItem } from '../types';
import './Dashboard.css';

interface DashboardProps {
  onNavigate: (view: string) => void;
  onSelectMedia: (media: MediaItem) => void;
}

export default function Dashboard({ onNavigate, onSelectMedia }: DashboardProps) {
  const { connection, selectedCountry, watchHistory, favorites } = useStore();

  const stats = [
    {
      label: 'Status',
      value: connection.isConnected ? 'Protected' : 'Unprotected',
      icon: <Shield size={20} />,
      color: connection.isConnected ? 'var(--gs-success)' : 'var(--gs-error)',
      bg: connection.isConnected ? 'var(--gs-success-bg)' : 'var(--gs-error-bg)',
    },
    {
      label: 'Region',
      value: selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : 'None',
      icon: <MapPin size={20} />,
      color: 'var(--gs-info)',
      bg: 'var(--gs-info-bg)',
    },
    {
      label: 'Downloaded',
      value: formatBytes(connection.bytesDown),
      icon: <ArrowDown size={20} />,
      color: 'var(--gs-success)',
      bg: 'var(--gs-success-bg)',
    },
    {
      label: 'Latency',
      value: connection.isConnected ? `${connection.latency}ms` : '—',
      icon: <Activity size={20} />,
      color: 'var(--gs-info)',
      bg: 'var(--gs-info-bg)',
    },
  ];

  const quickActions = [
    { label: 'Connect', icon: <Shield size={22} />, view: 'connect', color: '#6366f1' },
    { label: 'Browse', icon: <Globe size={22} />, view: 'browse', color: '#3b82f6' },
    { label: 'Media', icon: <Play size={22} />, view: 'media', color: '#8b5cf6' },
    { label: 'Speed Test', icon: <Zap size={22} />, view: 'speed', color: '#f59e0b' },
  ];

  return (
    <div className="dashboard">
      {/* Welcome Hero */}
      <motion.div
        className="dash-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="hero-content">
          <h1>Welcome to <span className="gradient-text">GlobeStream</span></h1>
          <p>Browse the world securely. Stream content from any region. Auto-dub in your language.</p>
        </div>
        <div className="hero-globe">
          <Globe size={80} className="globe-icon" />
          <div className="globe-rings">
            <span className="g-ring g-ring-1" />
            <span className="g-ring g-ring-2" />
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="dash-stats">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="stat-card-dash"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="stat-icon-dash" style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-text-dash">
              <span className="stat-label-dash">{stat.label}</span>
              <span className="stat-value-dash">{stat.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="dash-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="quick-actions">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              className="quick-action-card"
              onClick={() => onNavigate(action.view)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="qa-icon" style={{ background: `${action.color}20`, color: action.color }}>
                {action.icon}
              </div>
              <span className="qa-label">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Trending Media */}
      <div className="dash-section">
        <div className="section-header">
          <h3 className="section-title"><TrendingUp size={18} /> Trending Now</h3>
          <button className="see-all" onClick={() => onNavigate('media')}>See all →</button>
        </div>
        <div className="trending-scroll">
          {trendingMedia.slice(0, 6).map((media, i) => (
            <motion.div
              key={media.id}
              className="trending-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              onClick={() => onSelectMedia(media)}
            >
              <div className="trending-poster">
                <img src={media.thumbnail} alt={media.title} loading="lazy" />
                <div className="trending-overlay">
                  <Play size={20} fill="white" />
                </div>
              </div>
              <div className="trending-info">
                <h4>{media.title}</h4>
                <span>{media.year} • {media.rating}⭐</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Available Regions */}
      <div className="dash-section">
        <div className="section-header">
          <h3 className="section-title"><Globe size={18} /> Available Regions</h3>
          <button className="see-all" onClick={() => onNavigate('connect')}>View all →</button>
        </div>
        <div className="regions-preview">
          {countries.slice(0, 12).map((country, i) => (
            <motion.div
              key={country.code}
              className="region-chip-dash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.03 }}
            >
              <span className="chip-flag">{country.flag}</span>
              <span className="chip-name">{country.name}</span>
              <span className={`chip-status ${country.status}`} />
            </motion.div>
          ))}
          <div className="region-chip-dash more-chip" onClick={() => onNavigate('connect')}>
            +{countries.length - 12} more
          </div>
        </div>
      </div>
    </div>
  );
}
