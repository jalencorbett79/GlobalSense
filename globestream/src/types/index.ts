// ─── Region & Country Types ───────────────────────────────────────────
export interface Country {
  code: string;
  name: string;
  flag: string;
  region: Region;
  languages: string[];
  proxyEndpoint: string;
  latency?: number;
  status: "online" | "offline" | "busy";
}

export type Region =
  | "North America"
  | "South America"
  | "Europe"
  | "Asia"
  | "Africa"
  | "Oceania"
  | "Middle East";

export interface RegionGroup {
  name: Region;
  icon: string;
  countries: Country[];
  color: string;
}

// ─── Proxy Types ──────────────────────────────────────────────────────
export type VpnProtocol = "HTTPS" | "SOCKS5" | "HTTP";

export interface ProxyConfig {
  country: Country;
  protocol: VpnProtocol;
  isConnected: boolean;
  connectedAt?: Date;
  bytesTransferred: number;
  currentLatency: number;
}

export interface ProxyServer {
  id: string;
  host: string;
  port: number;
  country: Country;
  protocol: VpnProtocol;
  load: number;
  uptime: number;
  speed: number;
}

// ─── Browser Types ────────────────────────────────────────────────────
export interface BrowsingSession {
  id: string;
  url: string;
  title: string;
  timestamp: Date;
  country: Country;
}

export interface SearchResult {
  title: string;
  url: string;
  description: string;
  thumbnail?: string;
  type: "web" | "video" | "news" | "image";
}

// ─── Media / Video Types ──────────────────────────────────────────────
export interface MediaItem {
  id: string;
  imdbId?: string;   // IMDB ID (e.g. "tt0468569") — used for vidsrc.to streaming
  tmdbId?: number;   // TMDB numeric ID — used for TMDB API and vidsrc.to streaming
  title: string;
  description: string;
  thumbnail: string;
  backdrop?: string;
  url: string;
  duration: string;
  views: string;
  rating: number;
  year: number;
  genres: string[];
  country: string;
  language: string;
  type: "movie" | "series" | "video";
  episodes?: Episode[];
  subtitles: SubtitleTrack[];
}

export interface Episode {
  id: string;
  number: number;
  season: number;
  title: string;
  duration: string;
  thumbnail: string;
  url: string;
}

export interface SubtitleTrack {
  language: string;
  languageCode: string;
  cues: SubtitleCue[];
}

export interface SubtitleCue {
  start: number;
  end: number;
  text: string;
}

// ─── UI Types ─────────────────────────────────────────────────────────
export type ThemeMode = "dark" | "light";

export interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  url?: string;
  active: boolean;
}
