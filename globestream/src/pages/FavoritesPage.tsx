import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Play, Trash2, Star } from 'lucide-react';
import { useStore } from '../store/useStore';
import { MediaItem } from '../types';
import { getCountryByCode } from '../utils/countries';

interface FavoritesPageProps {
  onSelectMedia: (media: MediaItem) => void;
}

export default function FavoritesPage({ onSelectMedia }: FavoritesPageProps) {
  const { favorites, toggleFavorite } = useStore();

  if (favorites.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 80, color: 'var(--gs-text-tertiary)' }}>
        <Heart size={48} />
        <h3 style={{ color: 'var(--gs-text-secondary)' }}>No favorites yet</h3>
        <p style={{ fontSize: 14 }}>Save movies and shows you love for quick access</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700 }}>
        <Heart size={20} style={{ display: 'inline', marginRight: 8, color: 'var(--gs-error)' }} />
        Favorites ({favorites.length})
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        <AnimatePresence>
          {favorites.map((media) => {
            const country = getCountryByCode(media.country);
            return (
              <motion.div
                key={media.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-light)',
                  borderRadius: 'var(--gs-radius)', overflow: 'hidden', cursor: 'pointer'
                }}
                onClick={() => onSelectMedia(media)}
              >
                <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
                  <img src={media.thumbnail} alt={media.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{
                    position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center',
                    gap: 3, padding: '3px 8px', background: 'rgba(0,0,0,0.7)', color: '#f59e0b',
                    fontSize: 12, fontWeight: 700, borderRadius: 4, fontFamily: "'JetBrains Mono', monospace"
                  }}>
                    <Star size={12} fill="#f59e0b" stroke="#f59e0b" /> {media.rating}
                  </div>
                </div>
                <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600 }}>{media.title}</h4>
                  <div style={{ fontSize: 11, color: 'var(--gs-text-tertiary)', display: 'flex', gap: 6 }}>
                    <span>{country?.flag} {media.year}</span>
                    <span>•</span>
                    <span>{media.duration}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(media); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                        background: 'var(--gs-error-bg)', border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 6, color: 'var(--gs-error)', fontSize: 11, cursor: 'pointer', fontWeight: 500
                      }}
                    >
                      <Trash2 size={12} /> Remove
                    </button>
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
