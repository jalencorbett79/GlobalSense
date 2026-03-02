import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Play, Clock, Globe, TrendingUp, Subtitles } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { trendingMedia, searchMedia, getMediaByCountry } from '../../utils/mockMedia';
import { MediaItem } from '../../types';
import { getCountryByCode } from '../../utils/countries';
import './MediaGrid.css';

interface MediaGridProps {
  onSelectMedia: (media: MediaItem) => void;
}

export default function MediaGrid({ onSelectMedia }: MediaGridProps) {
  const { selectedCountry, connection } = useStore();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'movie' | 'series' | 'regional'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'views' | 'year'>('rating');

  const filteredMedia = useMemo(() => {
    let list = query ? searchMedia(query) : [...trendingMedia];

    if (activeFilter === 'movie') list = list.filter(m => m.type === 'movie');
    if (activeFilter === 'series') list = list.filter(m => m.type === 'series');
    if (activeFilter === 'regional' && selectedCountry) {
      list = getMediaByCountry(selectedCountry.code);
      if (list.length === 0) list = [...trendingMedia]; // Fallback
    }

    list.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'year') return b.year - a.year;
      return parseInt(b.views) - parseInt(a.views);
    });

    return list;
  }, [query, activeFilter, sortBy, selectedCountry]);

  return (
    <div className="media-grid-container">
      {/* Search & Filters */}
      <div className="media-toolbar">
        <div className="media-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search movies, series, genres..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="media-filters">
          {(['all', 'movie', 'series', 'regional'] as const).map((f) => (
            <button
              key={f}
              className={`filter-btn ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f === 'all' && <TrendingUp size={14} />}
              {f === 'movie' && <Play size={14} />}
              {f === 'series' && <Clock size={14} />}
              {f === 'regional' && <Globe size={14} />}
              {f === 'regional' && selectedCountry ? `${selectedCountry.flag} Regional` : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
        >
          <option value="rating">⭐ Top Rated</option>
          <option value="year">📅 Newest</option>
          <option value="views">👁 Most Viewed</option>
        </select>
      </div>

      {/* Section Header */}
      <div className="media-section-header">
        <h3>
          {activeFilter === 'regional' && selectedCountry
            ? `${selectedCountry.flag} Trending in ${selectedCountry.name}`
            : '🔥 Trending Worldwide'}
        </h3>
        <span className="media-count">{filteredMedia.length} titles</span>
      </div>

      {/* Grid */}
      <div className="media-grid">
        <AnimatePresence mode="popLayout">
          {filteredMedia.map((media, i) => {
            const country = getCountryByCode(media.country);
            return (
              <motion.div
                key={media.id}
                className="media-card"
                onClick={() => onSelectMedia(media)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                layout
                whileHover={{ y: -6 }}
              >
                <div className="media-poster">
                  <img src={media.thumbnail} alt={media.title} loading="lazy" />
                  <div className="media-overlay">
                    <button className="play-btn">
                      <Play size={28} fill="white" />
                    </button>
                  </div>
                  <div className="media-badges">
                    <span className="media-type-badge">{media.type}</span>
                    {media.subtitles && media.subtitles.length > 0 && (
                      <span className="sub-badge"><Subtitles size={10} /> EN Subs</span>
                    )}
                  </div>
                  <div className="media-rating">
                    <Star size={12} fill="#f59e0b" stroke="#f59e0b" />
                    {media.rating}
                  </div>
                </div>

                <div className="media-info">
                  <h4 className="media-title">{media.title}</h4>
                  <div className="media-meta">
                    <span>{country?.flag} {media.year}</span>
                    <span>•</span>
                    <span>{media.duration}</span>
                    <span>•</span>
                    <span>{media.views} views</span>
                  </div>
                  <div className="media-genres">
                    {media.genres.slice(0, 3).map((g) => (
                      <span key={g} className="genre-tag">{g}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
