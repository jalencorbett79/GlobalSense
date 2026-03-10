import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward,
  Settings, Heart, Share2, X, Subtitles, Star, Type, Check, ExternalLink, Monitor
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { MediaItem, SubtitleCue } from '../../types';
import { languageNames } from '../../utils/countries';
import { getActiveCue } from '../../utils/subtitles';
import { getEmbedUrls, hasStreaming, EmbedSource } from '../../utils/streamingService';
import './VideoPlayer.css';

interface VideoPlayerProps {
  media: MediaItem;
  onClose: () => void;
}

export default function VideoPlayer({ media, onClose }: VideoPlayerProps) {
  const {
    subtitlesEnabled, setSubtitlesEnabled,
    subtitleFontSize, setSubtitleFontSize,
    toggleFavorite, favorites, addToWatchHistory,
  } = useStore();

  // Streaming state
  const streamAvailable = hasStreaming(media);
  const embedSources = useMemo(() => getEmbedUrls(media), [media]);
  const [activeSource, setActiveSource] = useState<EmbedSource | null>(
    embedSources.length > 0 ? embedSources[0] : null
  );
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);

  // Mock player state (used when no stream available)
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(3600); // 1 h demo
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSubPanel, setShowSubPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const playerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const controlTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isFavorite = favorites.some(f => f.id === media.id);

  // Always grab the English subtitle track (every item has one)
  const enTrack = useMemo(
    () => media.subtitles.find(t => t.languageCode === 'en') ?? media.subtitles[0],
    [media.subtitles],
  );

  // Active cue for current timestamp
  const activeCue: SubtitleCue | null = useMemo(
    () => (enTrack ? getActiveCue(enTrack, currentTime) : null),
    [enTrack, currentTime],
  );

  // ─── Effects ───
  useEffect(() => { addToWatchHistory(media); }, [media.id]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => Math.min(prev + 1, duration));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, duration]);

  // ─── Handlers ───
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (rect) {
      const pct = (e.clientX - rect.left) / rect.width;
      setCurrentTime(Math.floor(pct * duration));
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlTimeoutRef.current) clearTimeout(controlTimeoutRef.current);
    controlTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${m}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = (currentTime / duration) * 100;

  const fontSizeMap = { small: 14, medium: 18, large: 24 };

  return (
    <motion.div
      className="video-player-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="video-player"
        ref={playerRef}
        onMouseMove={handleMouseMove}
      >
        {/* Close */}
        <button className="player-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* ── Streaming Viewport ── */}
        {streamAvailable && activeSource ? (
          <div className="video-viewport stream-viewport">
            <iframe
              key={activeSource.url}
              src={activeSource.url}
              className="stream-iframe"
              title={media.title}
              allowFullScreen
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
            />

            {/* Source picker button */}
            <div className="stream-controls-bar">
              {media.type === 'series' && (
                <div className="episode-controls">
                  <label>S</label>
                  <input
                    type="number" min="1" max="20" value={season}
                    onChange={(e) => { setSeason(Number(e.target.value)); }}
                    className="ep-input"
                  />
                  <label>E</label>
                  <input
                    type="number" min="1" max="50" value={episode}
                    onChange={(e) => { setEpisode(Number(e.target.value)); }}
                    className="ep-input"
                  />
                  <button
                    className="ep-go-btn"
                    onClick={() => {
                      const sources = getEmbedUrls(media, season, episode);
                      setActiveSource(sources[0] || null);
                    }}
                  >
                    <Play size={12} fill="white" /> Go
                  </button>
                </div>
              )}

              <button
                className={`source-btn ${showSourcePicker ? 'active' : ''}`}
                onClick={() => setShowSourcePicker(!showSourcePicker)}
                title="Switch streaming source"
              >
                <Monitor size={14} /> {activeSource.provider}
              </button>

              <a
                href={activeSource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="open-external-btn"
                title="Open in new tab"
              >
                <ExternalLink size={14} />
              </a>
            </div>

            {/* Source picker dropdown */}
            <AnimatePresence>
              {showSourcePicker && (
                <motion.div
                  className="source-picker"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="source-picker-title">Streaming Sources</div>
                  {embedSources.map((src) => (
                    <button
                      key={src.provider}
                      className={`source-option ${activeSource.provider === src.provider ? 'active' : ''}`}
                      onClick={() => { setActiveSource(src); setShowSourcePicker(false); }}
                    >
                      <Monitor size={13} />
                      <span>{src.label}</span>
                      {activeSource.provider === src.provider && <Check size={13} className="source-check" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* ── Mock Viewport (no stream available) ── */
          <div className="video-viewport" onClick={() => setIsPlaying(!isPlaying)}>
            <img src={media.thumbnail} alt={media.title} className="video-poster" />

            {/* ── Subtitle Overlay ── */}
            {subtitlesEnabled && activeCue && (
              <div className="subtitle-overlay">
                <span
                  className="subtitle-text"
                  style={{ fontSize: fontSizeMap[subtitleFontSize] }}
                >
                  {activeCue.text}
                </span>
              </div>
            )}

            {/* Subtitles-on indicator badge (always visible) */}
            {subtitlesEnabled && (
              <div className="subs-active-indicator">
                <Subtitles size={13} />
                <span>EN</span>
              </div>
            )}

            {/* Play / Pause overlay */}
            {!isPlaying && (
              <div className="play-overlay">
                <motion.button
                  className="big-play-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.stopPropagation(); setIsPlaying(true); }}
                >
                  <Play size={40} fill="white" />
                </motion.button>
              </div>
            )}
          </div>
        )}

        {/* ── Controls (only shown for mock player, embedded player has its own controls) ── */}
        <AnimatePresence>
          {!streamAvailable && showControls && (
            <motion.div
              className="player-controls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {/* Progress */}
              <div className="progress-container" ref={progressRef} onClick={handleProgressClick}>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                  <div className="progress-thumb" style={{ left: `${progressPercent}%` }} />
                </div>
              </div>

              <div className="controls-row">
                <div className="controls-left">
                  <button className="ctrl-btn" onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}>
                    <SkipBack size={18} />
                  </button>
                  <button className="ctrl-btn play-pause" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause size={22} /> : <Play size={22} fill="white" />}
                  </button>
                  <button className="ctrl-btn" onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}>
                    <SkipForward size={18} />
                  </button>

                  <div className="volume-control">
                    <button className="ctrl-btn" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <input
                      type="range"
                      className="volume-slider"
                      min="0" max="1" step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
                    />
                  </div>

                  <span className="time-display">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="controls-right">
                  {/* Subtitles button */}
                  <button
                    className={`ctrl-btn sub-btn ${showSubPanel ? 'active' : ''}`}
                    onClick={() => { setShowSubPanel(!showSubPanel); setShowSettings(false); }}
                    title="Subtitles"
                  >
                    <Subtitles size={18} />
                    {subtitlesEnabled && <span className="sub-dot" />}
                  </button>

                  <button
                    className="ctrl-btn"
                    onClick={() => { setShowSettings(!showSettings); setShowSubPanel(false); }}
                    title="Settings"
                  >
                    <Settings size={18} />
                  </button>

                  <button className="ctrl-btn" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Subtitle Settings Panel ── */}
        <AnimatePresence>
          {showSubPanel && (
            <motion.div
              className="sub-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="sub-panel-header">
                <Subtitles size={16} />
                <span>Subtitles</span>
              </div>

              <div className="sub-panel-body">
                {/* Toggle off */}
                <button
                  className={`sub-option ${!subtitlesEnabled ? 'active' : ''}`}
                  onClick={() => setSubtitlesEnabled(false)}
                >
                  <X size={14} />
                  <span>Off</span>
                  {!subtitlesEnabled && <Check size={14} className="sub-check" />}
                </button>

                {/* English — always present */}
                <button
                  className={`sub-option ${subtitlesEnabled ? 'active' : ''}`}
                  onClick={() => setSubtitlesEnabled(true)}
                >
                  <Subtitles size={14} />
                  <span>English</span>
                  <span className="sub-cue-count">{enTrack?.cues.length ?? 0} cues</span>
                  {subtitlesEnabled && <Check size={14} className="sub-check" />}
                </button>

                {/* Divider */}
                <div className="sub-divider" />

                {/* Font size */}
                <div className="sub-font-section">
                  <div className="sub-font-label">
                    <Type size={13} /> Font Size
                  </div>
                  <div className="sub-font-options">
                    {(['small', 'medium', 'large'] as const).map(size => (
                      <button
                        key={size}
                        className={`sub-font-btn ${subtitleFontSize === size ? 'active' : ''}`}
                        onClick={() => setSubtitleFontSize(size)}
                      >
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Media Details ── */}
      <div className="player-details">
        <div className="details-header">
          <div className="details-title-group">
            <h2>{media.title}</h2>
            <div className="details-meta">
              <span className="details-rating">
                <Star size={14} fill="#f59e0b" stroke="#f59e0b" /> {media.rating}
              </span>
              <span>{media.year}</span>
              <span>{media.duration}</span>
              <span>{media.views} views</span>
              <span className="details-type">{media.type}</span>
              {subtitlesEnabled && (
                <span className="details-subs-badge">
                  <Subtitles size={12} /> EN Subs
                </span>
              )}
            </div>
          </div>
          <div className="details-actions">
            <button
              className={`action-btn ${isFavorite ? 'favorited' : ''}`}
              onClick={() => toggleFavorite(media)}
            >
              <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
              {isFavorite ? 'Saved' : 'Save'}
            </button>
            <button className="action-btn">
              <Share2 size={18} />
              Share
            </button>
          </div>
        </div>

        <p className="details-description">{media.description}</p>

        <div className="details-tags">
          {media.genres.map((g) => (
            <span key={g} className="detail-tag">{g}</span>
          ))}
          <span className="detail-tag country-tag">
            {languageNames[media.language] || media.language}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
