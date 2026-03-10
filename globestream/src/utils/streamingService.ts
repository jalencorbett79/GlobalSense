/**
 * Streaming Service — provides real embed URLs for movies and TV shows.
 *
 * Uses vidsrc.to and fallback providers to generate iframe embed URLs.
 * All providers are free and support IMDB IDs and TMDB IDs.
 *
 * Primary: vidsrc.to  (https://vidsrc.to)
 * Fallback: 2embed.cc (https://2embed.cc)
 * Fallback: embed.su  (https://embed.su)
 */

import { MediaItem } from "../types";

const rawBase = import.meta.env.VITE_PROXY_API_URL || "";
const API_BASE = rawBase.replace(/\/api\/proxy\/?$/, "");

export interface EmbedSource {
  provider: string;
  url: string;
  label: string;
}

/**
 * Build streaming embed URLs for a media item.
 * Tries IMDB ID first (most compatible), then TMDB ID.
 * Returns null if no ID is available.
 */
export function getEmbedUrls(
  media: MediaItem,
  season?: number,
  episode?: number
): EmbedSource[] {
  const id = media.imdbId || (media.tmdbId ? String(media.tmdbId) : null);
  if (!id) return [];

  const isTv = media.type === "series";
  const type = isTv ? "tv" : "movie";
  const urls: EmbedSource[] = [];

  if (isTv && season && episode) {
    urls.push({
      provider: "vidsrc.to",
      url: `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`,
      label: "Stream (vidsrc)",
    });
    urls.push({
      provider: "2embed",
      url: `https://2embed.cc/embedtv/${id}&s=${season}&e=${episode}`,
      label: "Stream (2embed)",
    });
    urls.push({
      provider: "embed.su",
      url: `https://embed.su/embed/tv/${id}/${season}/${episode}`,
      label: "Stream (embed.su)",
    });
  } else if (isTv) {
    // Default to S1E1 for series
    urls.push({
      provider: "vidsrc.to",
      url: `https://vidsrc.to/embed/tv/${id}/1/1`,
      label: "Stream (vidsrc)",
    });
    urls.push({
      provider: "2embed",
      url: `https://2embed.cc/embedtvfull/${id}`,
      label: "Stream (2embed)",
    });
    urls.push({
      provider: "embed.su",
      url: `https://embed.su/embed/tv/${id}/1/1`,
      label: "Stream (embed.su)",
    });
  } else {
    urls.push({
      provider: "vidsrc.to",
      url: `https://vidsrc.to/embed/movie/${id}`,
      label: "Stream (vidsrc)",
    });
    urls.push({
      provider: "2embed",
      url: `https://2embed.cc/embed/${id}`,
      label: "Stream (2embed)",
    });
    urls.push({
      provider: "embed.su",
      url: `https://embed.su/embed/movie/${id}`,
      label: "Stream (embed.su)",
    });
  }

  return urls;
}

/**
 * Get the primary embed URL for a media item (first working provider).
 */
export function getPrimaryEmbedUrl(
  media: MediaItem,
  season?: number,
  episode?: number
): string | null {
  const urls = getEmbedUrls(media, season, episode);
  return urls.length > 0 ? urls[0].url : null;
}

/**
 * Check if a media item has streaming available.
 */
export function hasStreaming(media: MediaItem): boolean {
  return !!(media.imdbId || media.tmdbId);
}

/**
 * Fetch embed URL from the backend API (optional — supports server-side validation).
 */
export async function fetchEmbedUrl(
  media: MediaItem,
  season?: number,
  episode?: number
): Promise<{ primaryEmbed: string; embedUrls: EmbedSource[] } | null> {
  const id = media.imdbId || (media.tmdbId ? String(media.tmdbId) : null);
  if (!id) return null;

  try {
    const type = media.type === "series" ? "tv" : "movie";
    const params = new URLSearchParams({ type });
    if (media.imdbId) params.set("imdbId", media.imdbId);
    else if (media.tmdbId) params.set("tmdbId", String(media.tmdbId));
    if (season) params.set("season", String(season));
    if (episode) params.set("episode", String(episode));

    const res = await fetch(`${API_BASE}/api/stream/url?${params}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // Fall back to client-side URL generation
    const urls = getEmbedUrls(media, season, episode);
    if (urls.length === 0) return null;
    return { primaryEmbed: urls[0].url, embedUrls: urls };
  }
}
