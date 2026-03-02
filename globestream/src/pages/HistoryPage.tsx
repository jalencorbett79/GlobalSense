import { History, Play, Globe, Trash2, Clock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { MediaItem } from '../types';
import { getCountryByCode } from '../utils/countries';

interface HistoryPageProps {
  onSelectMedia: (media: MediaItem) => void;
}

export default function HistoryPage({ onSelectMedia }: HistoryPageProps) {
  const { watchHistory, browsingHistory } = useStore();

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Watch History */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
          <Play size={20} style={{ display: 'inline', marginRight: 8, color: 'var(--gs-accent)' }} />
          Watch History
        </h2>
        {watchHistory.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gs-text-tertiary)' }}>
            <Clock size={32} style={{ marginBottom: 8 }} />
            <p>No watch history yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {watchHistory.map((media) => {
              const country = getCountryByCode(media.country);
              return (
                <div
                  key={media.id}
                  onClick={() => onSelectMedia(media)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: 12,
                    background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-light)',
                    borderRadius: 'var(--gs-radius)', cursor: 'pointer', transition: 'var(--gs-transition)'
                  }}
                >
                  <img src={media.thumbnail} alt={media.title} style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 6 }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600 }}>{media.title}</h4>
                    <p style={{ fontSize: 11, color: 'var(--gs-text-tertiary)' }}>
                      {country?.flag} {media.year} • {media.duration} • ⭐ {media.rating}
                    </p>
                  </div>
                  <Play size={16} style={{ color: 'var(--gs-text-tertiary)' }} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Browsing History */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
          <Globe size={20} style={{ display: 'inline', marginRight: 8, color: 'var(--gs-info)' }} />
          Browsing History
        </h2>
        {browsingHistory.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gs-text-tertiary)' }}>
            <Globe size={32} style={{ marginBottom: 8 }} />
            <p>No browsing history yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {browsingHistory.map((session) => (
              <div
                key={session.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  background: 'var(--gs-bg-card)', border: '1px solid var(--gs-border-light)',
                  borderRadius: 'var(--gs-radius-sm)', fontSize: 13
                }}
              >
                <Globe size={14} style={{ color: 'var(--gs-text-tertiary)', flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--gs-text-secondary)' }}>
                  {session.url}
                </span>
                <span style={{ fontSize: 11, color: 'var(--gs-text-muted)', whiteSpace: 'nowrap' }}>
                  {session.country.flag} {new Date(session.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
