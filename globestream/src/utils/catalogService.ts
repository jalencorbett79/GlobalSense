/**
 * Catalog Service — fetches movie & TV data directly from Stremio Cinemeta.
 *
 * All requests go to https://v3-cinemeta.strem.io — free, open-source,
 * no API key required. No backend needed.
 */

import { MediaItem } from "../types";
import {
  fetchTrending,
  fetchSearch,
  fetchDiscover,
  fetchTopRatedMovies,
  fetchTopRatedTV,
} from "./tmdbService";

export interface CatalogResponse {
  results: MediaItem[];
  page: number;
  totalPages: number;
  totalResults: number;
}

/**
 * Fetch trending content directly from Stremio Cinemeta.
 */
export async function getTrending(): Promise<CatalogResponse> {
  return fetchTrending();
}

/**
 * Search movies & TV directly from Stremio Cinemeta.
 */
export async function searchCatalog(query: string): Promise<CatalogResponse> {
  if (!query.trim()) return { results: [], page: 1, totalPages: 0, totalResults: 0 };
  return fetchSearch(query);
}

/**
 * Discover movies by origin country from Stremio Cinemeta.
 */
export async function discoverByCountry(countryCode: string): Promise<CatalogResponse> {
  return fetchDiscover(countryCode);
}

/**
 * Fetch top movies from Stremio Cinemeta.
 */
export async function getTopMovies(): Promise<CatalogResponse> {
  return fetchTopRatedMovies();
}

/**
 * Fetch top TV series from Stremio Cinemeta.
 */
export async function getTopSeries(): Promise<CatalogResponse> {
  return fetchTopRatedTV();
}
