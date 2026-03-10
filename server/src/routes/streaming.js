/**
 * Streaming Embed Routes — provides real embed URLs for movies & TV
 *
 * Uses multiple open-source / free streaming embed providers:
 *   - vidsrc.to (primary) — https://vidsrc.to
 *   - 2embed.cc (fallback) — https://2embed.cc
 *   - embed.su (fallback) — https://embed.su
 *
 * All providers support both IMDB IDs (ttXXXXXXX) and TMDB numeric IDs.
 *
 * Endpoints:
 *   GET /api/stream/url?imdbId=tt0468569&type=movie
 *   GET /api/stream/url?tmdbId=299536&type=movie
 *   GET /api/stream/tv?imdbId=tt0944947&season=1&episode=1
 */

import express from 'express';

const router = express.Router();

// ─── Embed URL builders ───────────────────────────────────────────────

function buildEmbedUrls(id, mediaType, season = null, episode = null) {
  const isTv = mediaType === 'tv' || mediaType === 'series';
  const type = isTv ? 'tv' : 'movie';

  const urls = [];

  if (isTv && season && episode) {
    // TV show with season/episode
    urls.push({
      provider: 'vidsrc.to',
      url: `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`,
      label: 'Stream (vidsrc)',
    });
    urls.push({
      provider: '2embed',
      url: `https://2embed.cc/embedtv/${id}&s=${season}&e=${episode}`,
      label: 'Stream (2embed)',
    });
    urls.push({
      provider: 'embed.su',
      url: `https://embed.su/embed/tv/${id}/${season}/${episode}`,
      label: 'Stream (embed.su)',
    });
    urls.push({
      provider: 'vidsrc.xyz',
      url: `https://vidsrc.xyz/embed/tv?imdb=${id}&season=${season}&episode=${episode}`,
      label: 'Stream (vidsrc.xyz)',
    });
  } else {
    // Movie or TV show (no episode)
    urls.push({
      provider: 'vidsrc.to',
      url: `https://vidsrc.to/embed/${type}/${id}`,
      label: 'Stream (vidsrc)',
    });
    urls.push({
      provider: '2embed',
      url: isTv
        ? `https://2embed.cc/embedtvfull/${id}`
        : `https://2embed.cc/embed/${id}`,
      label: 'Stream (2embed)',
    });
    urls.push({
      provider: 'embed.su',
      url: `https://embed.su/embed/${type}/${id}`,
      label: 'Stream (embed.su)',
    });
    urls.push({
      provider: 'vidsrc.xyz',
      url: isTv
        ? `https://vidsrc.xyz/embed/tv?imdb=${id}`
        : `https://vidsrc.xyz/embed/movie?imdb=${id}`,
      label: 'Stream (vidsrc.xyz)',
    });
  }

  return urls;
}

// ─── Routes ──────────────────────────────────────────────────────────

/**
 * GET /api/stream/url
 * Returns embed URLs for a movie or TV show.
 *
 * Query params:
 *   imdbId   — IMDB ID (e.g. tt0468569) — takes priority
 *   tmdbId   — TMDB numeric ID (e.g. 299536)
 *   type     — "movie" | "tv" | "series" (default: "movie")
 *   season   — season number (for TV)
 *   episode  — episode number (for TV)
 */
router.get('/stream/url', (req, res) => {
  const { imdbId, tmdbId, type = 'movie', season, episode } = req.query;

  const id = imdbId || tmdbId;
  if (!id) {
    return res.status(400).json({ error: 'Provide "imdbId" or "tmdbId"' });
  }

  const embedUrls = buildEmbedUrls(id, type, season || null, episode || null);

  res.json({
    id,
    type,
    primaryEmbed: embedUrls[0]?.url || null,
    embedUrls,
  });
});

/**
 * GET /api/stream/tv
 * Convenience endpoint for TV episodes.
 */
router.get('/stream/tv', (req, res) => {
  const { imdbId, tmdbId, season = 1, episode = 1 } = req.query;

  const id = imdbId || tmdbId;
  if (!id) {
    return res.status(400).json({ error: 'Provide "imdbId" or "tmdbId"' });
  }

  const embedUrls = buildEmbedUrls(id, 'tv', season, episode);

  res.json({
    id,
    type: 'tv',
    season: parseInt(season),
    episode: parseInt(episode),
    primaryEmbed: embedUrls[0]?.url || null,
    embedUrls,
  });
});

export default router;
