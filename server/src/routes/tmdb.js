/**
 * TMDB API Routes — fetches real movie/TV data from The Movie Database.
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
const DEFAULT_POSTER = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=225&fit=crop';

// ─── Helpers ─────────────────────────────────────────────────────────

function tmdbUrl(path, params = {}) {
  const key = process.env.TMDB_KEY;
  if (!key) {
    console.warn('[TMDB] TMDB_KEY environment variable is not configured');
    return null;
  }
  const qs = new URLSearchParams({ api_key: key, ...params }).toString();
  return `${TMDB_BASE}${path}?${qs}`;
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
 */
router.get('/trending', async (req, res) => {
  const page = req.query.page || '1';
  const url = tmdbUrl('/trending/all/week', { page });

  if (!url) {
    return res.status(503).json({ error: 'TMDB_KEY not configured' });
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
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
 */
router.get('/search', async (req, res) => {
  const { query, page = '1' } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Missing "query" parameter' });
  }

  const url = tmdbUrl('/search/multi', { query, page });

  if (!url) {
    return res.status(503).json({ error: 'TMDB_KEY not configured' });
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
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
    return res.status(503).json({ error: 'TMDB_KEY not configured' });
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
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
 */
router.get('/top-rated/movies', async (req, res) => {
  const page = req.query.page || '1';
  const url = tmdbUrl('/movie/top_rated', { page });

  if (!url) {
    return res.status(503).json({ error: 'TMDB_KEY not configured' });
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
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
 */
router.get('/top-rated/tv', async (req, res) => {
  const page = req.query.page || '1';
  const url = tmdbUrl('/tv/top_rated', { page });

  if (!url) {
    return res.status(503).json({ error: 'TMDB_KEY not configured' });
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
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
