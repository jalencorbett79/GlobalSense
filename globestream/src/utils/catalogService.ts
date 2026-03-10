/**
 * Catalog Service — fetches movie & TV data from the GlobeStream backend.
 *
 * Primary source: TMDB (when TMDB_KEY is configured on the server)
 * Fallback: Stremio Cinemeta (open-source, no API key, always available)
 *
 * All catalog items returned include imdbId which enables real streaming via vidsrc.to.
 */

import { MediaItem } from "../types";
import { fetchTrending, fetchSearch, fetchDiscover } from "./tmdbService";

const rawBase = import.meta.env.VITE_PROXY_API_URL || "";
const API_BASE = rawBase.replace(/\/api\/proxy\/?$/, "");

export interface CatalogResponse {
  results: MediaItem[];
  page: number;
  totalPages: number;
  totalResults: number;
}

/** Fetch from the Stremio Cinemeta catalog endpoint on the backend. */
async function catalogFetch(path: string): Promise<CatalogResponse> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

/**
 * Fetch trending content.
 * Tries TMDB first, then falls back to Stremio Cinemeta (via backend).
 */
export async function getTrending(page = 1): Promise<CatalogResponse> {
  try {
    return await fetchTrending(page);
  } catch {
    return await catalogFetch(`/api/catalog/trending`);
  }
}

/**
 * Search movies & TV.
 * Tries TMDB first, then falls back to Stremio Cinemeta (via backend).
 */
export async function searchCatalog(
  query: string,
  page = 1
): Promise<CatalogResponse> {
  if (!query.trim()) return { results: [], page: 1, totalPages: 0, totalResults: 0 };
  try {
    return await fetchSearch(query, page);
  } catch {
    return await catalogFetch(
      `/api/catalog/search?q=${encodeURIComponent(query)}`
    );
  }
}

/**
 * Discover movies by origin country.
 * Tries TMDB first, then falls back to Stremio Cinemeta (via backend).
 */
export async function discoverByCountry(
  countryCode: string,
  page = 1
): Promise<CatalogResponse> {
  try {
    return await fetchDiscover(countryCode, page);
  } catch {
    return await catalogFetch(
      `/api/catalog/search?q=${encodeURIComponent(countryCode)}`
    );
  }
}

/**
 * Fetch top movies.
 */
export async function getTopMovies(): Promise<CatalogResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/top-rated/movies`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return await catalogFetch(`/api/catalog/movies`);
  }
}

/**
 * Fetch top TV series.
 */
export async function getTopSeries(): Promise<CatalogResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/top-rated/tv`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return await catalogFetch(`/api/catalog/series`);
  }
}
