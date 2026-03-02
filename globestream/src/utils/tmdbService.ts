/**
 * TMDB Service — fetches real movie & TV data from the backend TMDB proxy.
 *
 * Falls back to mock data when the backend is unavailable or TMDB_KEY
 * is not configured.
 */

import { MediaItem } from '../types';
import { trendingMedia, searchMedia as searchMock, getMediaByCountry } from './mockMedia';

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
 * Fetch trending movies & TV from TMDB. Falls back to mock data.
 */
export async function fetchTrending(page = 1): Promise<TmdbResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/trending?page=${page}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      results: trendingMedia,
      page: 1,
      totalPages: 1,
      totalResults: trendingMedia.length,
    };
  }
}

/**
 * Search TMDB for movies, TV, and people. Falls back to mock search.
 */
export async function fetchSearch(query: string, page = 1): Promise<TmdbResponse> {
  if (!query.trim()) {
    return { results: [], page: 1, totalPages: 0, totalResults: 0 };
  }

  try {
    const res = await fetch(
      `${API_BASE}/api/search?query=${encodeURIComponent(query)}&page=${page}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    const results = searchMock(query);
    return {
      results,
      page: 1,
      totalPages: 1,
      totalResults: results.length,
    };
  }
}

/**
 * Discover content by origin country from TMDB. Falls back to mock country filter.
 */
export async function fetchDiscover(countryCode: string, page = 1): Promise<TmdbResponse> {
  try {
    const res = await fetch(
      `${API_BASE}/api/discover?country=${encodeURIComponent(countryCode)}&page=${page}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    const results = getMediaByCountry(countryCode);
    return {
      results,
      page: 1,
      totalPages: 1,
      totalResults: results.length,
    };
  }
}

/**
 * Fetch top-rated movies. Falls back to mock data sorted by rating.
 */
export async function fetchTopRatedMovies(page = 1): Promise<TmdbResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/top-rated/movies?page=${page}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    const results = trendingMedia
      .filter((m) => m.type === 'movie')
      .sort((a, b) => b.rating - a.rating);
    return {
      results,
      page: 1,
      totalPages: 1,
      totalResults: results.length,
    };
  }
}

/**
 * Fetch top-rated TV shows. Falls back to mock data sorted by rating.
 */
export async function fetchTopRatedTV(page = 1): Promise<TmdbResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/top-rated/tv?page=${page}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    const results = trendingMedia
      .filter((m) => m.type === 'series')
      .sort((a, b) => b.rating - a.rating);
    return {
      results,
      page: 1,
      totalPages: 1,
      totalResults: results.length,
    };
  }
}
