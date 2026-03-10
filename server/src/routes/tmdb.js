/**
 * TMDB API Routes — fetches real movie/TV data from The Movie Database.
 *
 * When TMDB_KEY is not configured, falls back to the Stremio Cinemeta
 * open-source catalog (https://github.com/Stremio/cinemeta) which requires
 * no API key and provides high-quality IMDB-sourced metadata.
 *
 * Endpoints:
 *   GET /api/trending          — trending movies & TV worldwide
 *   GET /api/search?query=...  — search movies, TV, people
 *   GET /api/discover?country=KR&page=1 — discover by origin country
 *   GET /api/top-rated/movies  — top rated movies
 *   GET /api/top-rated/tv      — top rated TV shows
 */

import express from 'express';

const router = express.Router();

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p';
const CINEMETA_BASE = 'https://v3-cinemeta.strem.io';
const DEFAULT_POSTER = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=225&fit=crop';

// Warn once at startup if TMDB_KEY is missing so devs know to configure it
if (!process.env.TMDB_KEY) {
  console.warn('[TMDB] TMDB_KEY not configured — falling back to Stremio Cinemeta for all catalog requests. Set TMDB_KEY for richer data.');
}

// ─── Helpers ─────────────────────────────────────────────────────────

function tmdbUrl(path, params = {}) {
  const key = process.env.TMDB_KEY;
  if (!key) {
    // Only log once to avoid spamming logs on every request
    return null;
  }
  const qs = new URLSearchParams({ api_key: key, ...params }).toString();
  return `${TMDB_BASE}${path}?${qs}`;
}

/** Safely fetch JSON with a timeout. */
async function safeFetch(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Format a Stremio Cinemeta meta item to the GlobeStream MediaItem format. */
function formatCinemetaItem(item) {
  const imdbId = item.id;
  const poster = item.poster
    ? item.poster.replace('/medium/', '/large/')
    : `https://images.metahub.space/poster/medium/${imdbId}/img`;
  const backdrop = item.background
    || `https://images.metahub.space/background/medium/${imdbId}/img`;
  const rating = parseFloat(item.imdbRating) || 0;
  const year = parseInt(item.releaseInfo) || 0;
  // Deterministic views estimate based on rating + stable hash of IMDB ID
  const idHash = imdbId.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xffff, 0);
  const viewsM = Math.max(1, Math.round(rating * 3 + (idHash % 20)));
  const views = rating > 8 ? `${viewsM * 3}M` : `${viewsM}M`;
  return {
    id: `cinemeta-${imdbId}`,
    imdbId,
    title: item.name || 'Untitled',
    description: item.description || '',
    thumbnail: poster,
    backdrop,
    url: '#',
    duration: item.runtime || (item.type === 'series' ? '~45m' : '~2h'),
    views,
    rating: Math.round(rating * 10) / 10,
    year,
    genres: Array.isArray(item.genres) ? item.genres : [],
    country: item.country || '',
    language: (item.language || 'en').toLowerCase(),
    type: item.type === 'series' ? 'series' : 'movie',
    subtitles: [],
  };
}

/** Map a TMDB result item to the format the frontend expects. */
function formatItem(item) {
  const posterPath = item.poster_path
    ? `${TMDB_IMG}/w500${item.poster_path}`
    : DEFAULT_POSTER;
  const backdropPath = item.backdrop_path
    ? `${TMDB_IMG}/w780${item.backdrop_path}`
    : null;
  const releaseDate = item.release_date || item.first_air_date || '';
  const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');

  return {
    id: `tmdb-${item.id}`,
    tmdbId: item.id,
    title: item.title || item.name || 'Untitled',
    description: item.overview || '',
    thumbnail: posterPath,
    backdrop: backdropPath,
    url: '#',
    duration: mediaType === 'tv' ? '~45m' : '~2h',
    views: `${Math.round(item.popularity || 0)}`,
    rating: Math.round((item.vote_average || 0) * 10) / 10,
    year: releaseDate ? parseInt(releaseDate.slice(0, 4), 10) : 0,
    genres: (item.genre_ids || []).map(String),
    country: (item.origin_country && item.origin_country[0]) || '',
    language: item.original_language || '',
    type: mediaType === 'tv' ? 'series' : 'movie',
    subtitles: [],
  };
}

function formatResults(data) {
  if (!data || !data.results) return [];
  return data.results
    .filter((item) => item.poster_path)
    .map(formatItem);
}

// ─── Routes ──────────────────────────────────────────────────────────

/**
 * GET /api/trending?page=1
 * Falls back to Stremio Cinemeta when TMDB_KEY is not set.
 */
router.get('/trending', async (req, res) => {
  const page = req.query.page || '1';
  const url = tmdbUrl('/trending/all/week', { page });

  if (!url) {
    // Fallback: use Stremio Cinemeta (free, open-source, no API key)
    try {
      const [moviesData, seriesData] = await Promise.all([
        safeFetch(`${CINEMETA_BASE}/catalog/movie/top.json`),
        safeFetch(`${CINEMETA_BASE}/catalog/series/top.json`),
      ]);
      const movies = (moviesData.metas || []).slice(0, 15).map(formatCinemetaItem);
      const series = (seriesData.metas || []).slice(0, 15).map(formatCinemetaItem);
      const results = [];
      const maxLen = Math.max(movies.length, series.length);
      for (let i = 0; i < maxLen; i++) {
        if (movies[i]) results.push(movies[i]);
        if (series[i]) results.push(series[i]);
      }
      return res.json({ results, page: 1, totalPages: 1, totalResults: results.length });
    } catch (err) {
      console.error('[TMDB/Cinemeta] Trending fallback error:', err.message);
      return res.status(503).json({ error: 'TMDB_KEY not configured and cinemeta unavailable' });
    }
  }

  try {
    const data = await safeFetch(url);
    res.json({
      results: formatResults(data),
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    });
  } catch (err) {
    console.error('[TMDB] Trending error:', err.message);
    res.status(500).json({ error: 'Failed to fetch trending content' });
  }
});

/**
 * GET /api/search?query=batman&page=1
 * Falls back to Stremio Cinemeta when TMDB_KEY is not set.
 */
router.get('/search', async (req, res) => {
  const { query, page = '1' } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Missing "query" parameter' });
  }

  const url = tmdbUrl('/search/multi', { query, page });

  if (!url) {
    // Fallback: search via Stremio Cinemeta
    try {
      const encoded = encodeURIComponent(query);
      const [moviesData, seriesData] = await Promise.all([
        safeFetch(`${CINEMETA_BASE}/catalog/movie/top/search=${encoded}.json`).catch(() => ({ metas: [] })),
        safeFetch(`${CINEMETA_BASE}/catalog/series/top/search=${encoded}.json`).catch(() => ({ metas: [] })),
      ]);
      const results = [
        ...(moviesData.metas || []).slice(0, 20).map(formatCinemetaItem),
        ...(seriesData.metas || []).slice(0, 20).map(formatCinemetaItem),
      ];
      return res.json({ results, page: 1, totalPages: 1, totalResults: results.length });
    } catch (err) {
      console.error('[TMDB/Cinemeta] Search fallback error:', err.message);
      return res.status(503).json({ error: 'TMDB_KEY not configured and cinemeta unavailable' });
    }
  }

  try {
    const data = await safeFetch(url);
    res.json({
      results: formatResults(data),
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    });
  } catch (err) {
    console.error('[TMDB] Search error:', err.message);
    res.status(500).json({ error: 'Failed to search content' });
  }
});

/**
 * GET /api/discover?country=KR&page=1
 * Falls back to Stremio Cinemeta search when TMDB_KEY is not set.
 */
router.get('/discover', async (req, res) => {
  const { country, page = '1' } = req.query;

  if (!country) {
    return res.status(400).json({ error: 'Missing "country" parameter' });
  }

  const url = tmdbUrl('/discover/movie', {
    with_origin_country: country,
    sort_by: 'popularity.desc',
    page,
  });

  if (!url) {
    // Fallback: search by country name in cinemeta
    const countryNames = {
      KR: 'Korean', JP: 'Japanese', FR: 'French', DE: 'German',
      ES: 'Spanish', IT: 'Italian', IN: 'Indian', BR: 'Brazilian',
      CN: 'Chinese', MX: 'Mexican', TR: 'Turkish', TH: 'Thai',
    };
    const searchTerm = countryNames[country] || country;
    try {
      const encoded = encodeURIComponent(searchTerm);
      const data = await safeFetch(
        `${CINEMETA_BASE}/catalog/movie/top/search=${encoded}.json`
      ).catch(() => ({ metas: [] }));
      const results = (data.metas || []).slice(0, 20).map(formatCinemetaItem);
      return res.json({ results, page: 1, totalPages: 1, totalResults: results.length });
    } catch (err) {
      console.error('[TMDB/Cinemeta] Discover fallback error:', err.message);
      return res.status(503).json({ error: 'TMDB_KEY not configured and cinemeta unavailable' });
    }
  }

  try {
    const data = await safeFetch(url);
    res.json({
      results: formatResults(data),
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    });
  } catch (err) {
    console.error('[TMDB] Discover error:', err.message);
    res.status(500).json({ error: 'Failed to discover content' });
  }
});

/**
 * GET /api/top-rated/movies?page=1
 * Falls back to Stremio Cinemeta when TMDB_KEY is not set.
 */
router.get('/top-rated/movies', async (req, res) => {
  const page = req.query.page || '1';
  const url = tmdbUrl('/movie/top_rated', { page });

  if (!url) {
    try {
      const data = await safeFetch(`${CINEMETA_BASE}/catalog/movie/top.json`);
      const results = (data.metas || []).slice(0, 40).map(formatCinemetaItem);
      return res.json({ results, page: 1, totalPages: 1, totalResults: results.length });
    } catch (err) {
      console.error('[TMDB/Cinemeta] Top-rated movies fallback error:', err.message);
      return res.status(503).json({ error: 'TMDB_KEY not configured and cinemeta unavailable' });
    }
  }

  try {
    const data = await safeFetch(url);
    res.json({
      results: formatResults(data),
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    });
  } catch (err) {
    console.error('[TMDB] Top rated movies error:', err.message);
    res.status(500).json({ error: 'Failed to fetch top rated movies' });
  }
});

/**
 * GET /api/top-rated/tv?page=1
 * Falls back to Stremio Cinemeta when TMDB_KEY is not set.
 */
router.get('/top-rated/tv', async (req, res) => {
  const page = req.query.page || '1';
  const url = tmdbUrl('/tv/top_rated', { page });

  if (!url) {
    try {
      const data = await safeFetch(`${CINEMETA_BASE}/catalog/series/top.json`);
      const results = (data.metas || []).slice(0, 40).map(formatCinemetaItem);
      return res.json({ results, page: 1, totalPages: 1, totalResults: results.length });
    } catch (err) {
      console.error('[TMDB/Cinemeta] Top-rated TV fallback error:', err.message);
      return res.status(503).json({ error: 'TMDB_KEY not configured and cinemeta unavailable' });
    }
  }

  try {
    const data = await safeFetch(url);
    res.json({
      results: formatResults(data),
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    });
  } catch (err) {
    console.error('[TMDB] Top rated TV error:', err.message);
    res.status(500).json({ error: 'Failed to fetch top rated TV' });
  }
});

export default router;
