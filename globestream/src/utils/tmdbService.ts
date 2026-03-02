/**
 * TMDB Service — fetches real movie & TV data from the backend TMDB proxy.
 *
 * Throws when the backend is unavailable or TMDB_KEY is not configured,
 * allowing callers to handle fallback logic themselves.
 */

import { MediaItem } from '../types';

const rawBase = import.meta.env.VITE_PROXY_API_URL || '';
const API_BASE = rawBase.replace(/\/api\/proxy\/?$/, '');

export interface TmdbResponse {
  results: MediaItem[];
  page: number;
  totalPages: number;
  totalResults: number;
}

// ─── API calls ───────────────────────────────────────────────────────

/**
 * Fetch trending movies & TV from TMDB.
 */
export async function fetchTrending(page = 1): Promise<TmdbResponse> {
  const res = await fetch(`${API_BASE}/api/trending?page=${page}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

/**
 * Search TMDB for movies, TV, and people.
 */
export async function fetchSearch(query: string, page = 1): Promise<TmdbResponse> {
  if (!query.trim()) {
    return { results: [], page: 1, totalPages: 0, totalResults: 0 };
  }

  const res = await fetch(
    `${API_BASE}/api/search?query=${encodeURIComponent(query)}&page=${page}`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

/**
 * Discover content by origin country from TMDB.
 */
export async function fetchDiscover(countryCode: string, page = 1): Promise<TmdbResponse> {
  const res = await fetch(
    `${API_BASE}/api/discover?country=${encodeURIComponent(countryCode)}&page=${page}`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

/**
 * Fetch top-rated movies.
 */
export async function fetchTopRatedMovies(page = 1): Promise<TmdbResponse> {
  const res = await fetch(`${API_BASE}/api/top-rated/movies?page=${page}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

/**
 * Fetch top-rated TV shows.
 */
export async function fetchTopRatedTV(page = 1): Promise<TmdbResponse> {
  const res = await fetch(`${API_BASE}/api/top-rated/tv?page=${page}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}
