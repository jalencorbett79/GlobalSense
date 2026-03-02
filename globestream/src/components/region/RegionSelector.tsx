import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { regionGroups, countries } from '../../utils/countries';
import { getAvailableCountries } from '../../utils/proxyService';
import { Country, Region } from '../../types';
import './RegionSelector.css';

interface RegionSelectorProps {
  onConnect: (country: Country) => void;
}

export default function RegionSelector({ onConnect }: RegionSelectorProps) {
  const { selectedCountry, recentCountries, connection } = useStore();
  const [search, setSearch] = useState('');
  const [activeRegion, setActiveRegion] = useState<Region | 'all'>('all');
  const [availableCodes, setAvailableCodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    getAvailableCountries()
      .then((codes) => setAvailableCodes(new Set(codes)))
      .catch(() => {/* backend unreachable — all countries show as unavailable */});
  }, []);

  const filtered = useMemo(() => {
    let list = activeRegion === 'all' ? countries : countries.filter(c => c.region === activeRegion);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
    }
    // Sort countries with available proxies first
    list = [...list].sort((a, b) => {
      const aAvail = availableCodes.has(a.code) ? 0 : 1;
      const bAvail = availableCodes.has(b.code) ? 0 : 1;
      return aAvail - bAvail;
    });
    return list;
  }, [search, activeRegion, availableCodes]);

  return (
    <div className="region-selector">
      {/* Search Bar */}
      <div className="region-search">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search countries or regions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="region-search-input"
        />
      </div>

      {/* Recent Countries */}
      {recentCountries.length > 0 && !search && (
        <div className="recent-countries">
          <h4 className="section-label">Recent</h4>
          <div className="recent-list">
            {recentCountries.map((country) => (
              <button
                key={country.code}
                className={`recent-chip ${selectedCountry?.code === country.code ? 'active' : ''}`}
                onClick={() => onConnect(country)}
              >
                <span>{country.flag}</span>
                <span>{country.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Region Tabs */}
      <div className="region-tabs">
        <button
          className={`region-tab ${activeRegion === 'all' ? 'active' : ''}`}
          onClick={() => setActiveRegion('all')}
        >
          🌐 All
        </button>
        {regionGroups.map((rg) => (
          <button
            key={rg.name}
            className={`region-tab ${activeRegion === rg.name ? 'active' : ''}`}
            onClick={() => setActiveRegion(rg.name)}
            style={{ '--tab-color': rg.color } as React.CSSProperties}
          >
            {rg.icon} {rg.name}
          </button>
        ))}
      </div>

      {/* Country Grid */}
      <div className="country-grid">
        <AnimatePresence mode="popLayout">
          {filtered.map((country, i) => {
            const isSelected = selectedCountry?.code === country.code;
            const isConnected = connection.isConnected && isSelected;
            const hasProxy = availableCodes.has(country.code);
            const status = isConnected ? 'connected' : hasProxy ? 'online' : 'offline';

            return (
              <motion.button
                key={country.code}
                className={`country-card ${isSelected ? 'selected' : ''} ${isConnected ? 'connected' : ''} ${!hasProxy ? 'unavailable' : ''}`}
                onClick={() => onConnect(country)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.02 }}
                layout
              >
                <div className="country-card-header">
                  <span className="country-flag-lg">{country.flag}</span>
                  {isConnected && (
                    <span className="connected-badge">
                      <Check size={12} /> Connected
                    </span>
                  )}
                </div>
                <div className="country-card-body">
                  <span className="country-name">{country.name}</span>
                  <span className="country-code">{country.code}</span>
                </div>
                <div className="country-card-footer">
                  <span className={`country-status ${status}`}>
                    <MapPin size={10} />
                    {hasProxy ? (isConnected ? 'connected' : 'available') : 'no proxies'}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="no-results">
          <MapPin size={40} />
          <h3>No countries found</h3>
          <p>Try a different search term or region</p>
        </div>
      )}
    </div>
  );
}
