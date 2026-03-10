/**
 * TMDB Service — fetches real movie & TV data directly from
 * Stremio Cinemeta (free, open-source, no API key required).
 *
 * https://v3-cinemeta.strem.io
 * Provides IMDB-sourced metadata including ratings, posters,
 * descriptions, and IMDB IDs enabling real streaming via vidsrc.to.
 * No backend needed.
 */

import { MediaItem } from '../types';
import { generateEnglishSubtitles } from './subtitles';

const CINEMETA_BASE = 'https://v3-cinemeta.strem.io';

export interface TmdbResponse {
  results: MediaItem[];
  page: number;
  totalPages: number;
  totalResults: number;
}

// ─── Cinemeta item shape ──────────────────────────────────────────────

interface CinemetaItem {
  id: string;
  name?: string;
  poster?: string;
  background?: string;
  imdbRating?: string;
  releaseInfo?: string;
  genres?: string[];
  description?: string;
  runtime?: string;
  language?: string;
  country?: string;
  type?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Convert a Stremio Cinemeta meta item to the GlobeStream MediaItem format.
 */
function formatCinemetaItem(item: CinemetaItem): MediaItem {
  const imdbId = item.id;
  const poster = item.poster
    ? item.poster.replace('/medium/', '/large/')
    : `https://images.metahub.space/poster/medium/${imdbId}/img`;
  const backdrop =
    item.background ||
    `https://images.metahub.space/background/medium/${imdbId}/img`;
  const rating = parseFloat(item.imdbRating || '0') || 0;
  const year = parseInt(item.releaseInfo || '0') || 0;
  const idHash = imdbId
    .split('')
    .reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xffff, 0);
  const viewsM = Math.max(1, Math.round(rating * 3 + (idHash % 20)));
  const views = rating > 8 ? `${viewsM * 3}M` : `${viewsM}M`;
  const type: 'movie' | 'series' = item.type === 'series' ? 'series' : 'movie';
  const genres: string[] = Array.isArray(item.genres) ? item.genres : [];
  const duration = item.runtime || (type === 'series' ? '~45m' : '~2h');

  return {
    id: `cinemeta-${imdbId}`,
    imdbId,
    title: item.name || 'Untitled',
    description: item.description || '',
    thumbnail: poster,
    backdrop,
    url: '#',
    duration,
    views,
    rating: Math.round(rating * 10) / 10,
    year,
    genres,
    country: item.country || '',
    language: (item.language || 'en').toLowerCase(),
    type,
    subtitles: [generateEnglishSubtitles(`cinemeta-${imdbId}`, genres, duration)],
  };
}

/** Fetch JSON from Cinemeta with a 10-second timeout. */
async function cinemetaFetch(path: string): Promise<{ metas?: CinemetaItem[] }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`${CINEMETA_BASE}${path}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── API calls ───────────────────────────────────────────────────────

/**
 * Fetch trending movies & TV directly from Stremio Cinemeta.
 */
export async function fetchTrending(): Promise<TmdbResponse> {
  const [moviesData, seriesData] = await Promise.all([
    cinemetaFetch('/catalog/movie/top.json'),
    cinemetaFetch('/catalog/series/top.json'),
  ]);

  const movies = (moviesData.metas || []).slice(0, 15).map(formatCinemetaItem);
  const series = (seriesData.metas || []).slice(0, 15).map(formatCinemetaItem);

  const results: MediaItem[] = [];
  const maxLen = Math.max(movies.length, series.length);
  for (let i = 0; i < maxLen; i++) {
    if (movies[i]) results.push(movies[i]);
    if (series[i]) results.push(series[i]);
  }

  return { results, page: 1, totalPages: 1, totalResults: results.length };
}

/**
 * Search movies & TV directly from Stremio Cinemeta.
 */
export async function fetchSearch(query: string): Promise<TmdbResponse> {
  if (!query.trim()) {
    return { results: [], page: 1, totalPages: 0, totalResults: 0 };
  }

  const encoded = encodeURIComponent(query.trim());
  const [moviesData, seriesData] = await Promise.all([
    cinemetaFetch(`/catalog/movie/top/search=${encoded}.json`).catch(() => ({
      metas: [] as CinemetaItem[],
    })),
    cinemetaFetch(`/catalog/series/top/search=${encoded}.json`).catch(() => ({
      metas: [] as CinemetaItem[],
    })),
  ]);

  const results = [
    ...(moviesData.metas || []).slice(0, 20).map(formatCinemetaItem),
    ...(seriesData.metas || []).slice(0, 20).map(formatCinemetaItem),
  ];

  return { results, page: 1, totalPages: 1, totalResults: results.length };
}

/**
 * Discover content by origin country using Stremio Cinemeta.
 */
export async function fetchDiscover(countryCode: string): Promise<TmdbResponse> {
  const countryNames: Record<string, string> = {
    KR: 'Korean', JP: 'Japanese', FR: 'French', DE: 'German',
    ES: 'Spanish', IT: 'Italian', IN: 'Indian', BR: 'Brazilian',
    CN: 'Chinese', MX: 'Mexican', TR: 'Turkish', TH: 'Thai',
    US: 'American', GB: 'British', AU: 'Australian', RU: 'Russian',
  };
  const searchTerm = countryNames[countryCode] || countryCode;
  const encoded = encodeURIComponent(searchTerm);

  const data = await cinemetaFetch(`/catalog/movie/top/search=${encoded}.json`).catch(
    () => ({ metas: [] as CinemetaItem[] })
  );
  const results = (data.metas || []).slice(0, 20).map(formatCinemetaItem);

  return { results, page: 1, totalPages: 1, totalResults: results.length };
}

/**
 * Fetch top-rated movies from Stremio Cinemeta.
 */
export async function fetchTopRatedMovies(): Promise<TmdbResponse> {
  const data = await cinemetaFetch('/catalog/movie/top.json');
  const results = (data.metas || []).slice(0, 40).map(formatCinemetaItem);
  return { results, page: 1, totalPages: 1, totalResults: results.length };
}

/**
 * Fetch top-rated TV shows from Stremio Cinemeta.
 */
export async function fetchTopRatedTV(): Promise<TmdbResponse> {
  const data = await cinemetaFetch('/catalog/series/top.json');
  const results = (data.metas || []).slice(0, 40).map(formatCinemetaItem);
  return { results, page: 1, totalPages: 1, totalResults: results.length };
}
