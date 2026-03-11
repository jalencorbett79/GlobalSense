import { Country, VpnProtocol } from "../types";
/**
 * GlobeStream Proxy Service — client-side implementation
 *
 * Manages region selection and connection state entirely in the browser.
 * The proxy browser feature requires a backend server to route traffic
 * (browsers cannot connect to arbitrary proxies directly).
 *
 * Flow:
 *   Select a country → "Connect" → connection state is set client-side
 *   Media streaming: works directly via embedded iframe providers (vidsrc.to, etc.)
 *   Proxy browser: routes traffic through the GlobeStream backend proxy gateway
 */

/** Base URL for the GlobeStream backend API. Falls back to the current origin (single-service deploy). */
const API_BASE: string =
  (import.meta.env.VITE_PROXY_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "";

/** Returns true when the GlobeStream backend API is explicitly configured. */
export function isBackendConfigured(): boolean {
  return API_BASE !== "";
}

/**
 * Public speed-test CDN (Cloudflare — CORS-enabled, no backend required).
 * Used as a fallback when the GlobeStream backend is not deployed.
 */
const CF_SPEED = "https://speed.cloudflare.com";

// ─── Connection State ────────────────────────────────────────────────

export interface ConnectionState {
  isConnected: boolean;
  countryCode: string | null;
  countryName: string | null;
  countryFlag: string | null;
  protocol: string | null;
  connectedAt: Date | null;
  latency: number;
  requestCount: number;
  bytesDown: number;
}
let currentConnection: ConnectionState = {
  isConnected: false,
  countryCode: null,
  countryName: null,
  countryFlag: null,
  protocol: null,
  connectedAt: null,
  latency: 0,
  requestCount: 0,
  bytesDown: 0,
};

// Approximate round-trip latency (ms) by country code
const REGION_LATENCY: Record<string, number> = {
  KR: 45, JP: 38, CN: 52, SG: 28, TW: 41, HK: 33,
  US: 20, CA: 22, GB: 35, DE: 30, FR: 32, NL: 28,
  AU: 75, NZ: 80, BR: 90, IN: 65, ZA: 110, NG: 130,
  MX: 55, AR: 95, TR: 60, UA: 55, PL: 40, SE: 33,
  IT: 38, ES: 36, RU: 50, IL: 58, TH: 70, MY: 65,
};

// ─── Connect / Disconnect ────────────────────────────────────────────

/**
 * "Connecting" selects the region and sets client-side connection state.
 * No backend round-trip is required.
 */
export async function connectToProxy(
  country: Country,
  _protocol: VpnProtocol = "HTTPS",
  onStatsUpdate?: (stats: ConnectionState) => void
): Promise<ConnectionState> {
  const latency =
    REGION_LATENCY[country.code] ?? Math.floor(40 + Math.random() * 60);

  currentConnection = {
    isConnected: true,
    countryCode: country.code,
    countryName: country.name,
    countryFlag: country.flag,
    protocol: "HTTP Proxy",
    connectedAt: new Date(),
    latency,
    requestCount: 0,
    bytesDown: 0,
  };

  if (onStatsUpdate) {
    onStatsUpdate({ ...currentConnection });
  }

  return { ...currentConnection };
}

/**
 * Disconnect — resets state. No tunnel to tear down.
 */
export async function disconnectProxy(): Promise<void> {
  currentConnection = {
    isConnected: false,
    countryCode: null,
    countryName: null,
    countryFlag: null,
    protocol: null,
    connectedAt: null,
    latency: 0,
    requestCount: 0,
    bytesDown: 0,
  };
}
// ─── Proxied Fetch ───────────────────────────────────────────────────

/**
 * Fetch a URL through the proxy gateway (requires backend server).
 */
export async function proxyFetch(
  url: string,
  countryCode?: string
): Promise<{
  status: number;
  contentType: string;
  body: string;
  proxyUsed: { id: string; city: string; countryCode: string; latency: number };
}> {
  if (!isBackendConfigured()) {
    throw new Error(
      "Proxy fetching requires the GlobeStream backend. " +
      "Set VITE_PROXY_API_URL or start the server (cd server && npm start)."
    );
  }
  const res = await fetch(`${API_BASE}/api/proxy/fetch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, countryCode: countryCode ?? currentConnection.countryCode ?? "US" }),
  });
  if (!res.ok) {
    throw new Error(`Proxy fetch failed: HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Get the URL for the browse endpoint (for iframe src).
 * When the GlobeStream backend is configured, routes through the proxy gateway.
 * Falls back to the direct target URL when no backend is available.
 */
export function getProxyBrowseUrl(url: string, countryCode?: string): string {
  if (!isBackendConfigured()) {
    // No backend — return the direct URL so the iframe still attempts to load.
    // Many sites block iframe embedding; callers should surface a notice.
    return url;
  }
  const params = new URLSearchParams({
    url,
    country: countryCode ?? currentConnection.countryCode ?? "US",
  });
  return `${API_BASE}/api/proxy/browse?${params.toString()}`;
}

// ─── Country/Server Info ─────────────────────────────────────────────

/**
 * Get available countries from the backend.
 * Returns an empty array when the backend is not configured or unreachable.
 */
export async function getAvailableCountries(): Promise<string[]> {
  if (!isBackendConfigured()) return [];
  try {
    const res = await fetch(`${API_BASE}/api/proxy/countries`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.countries ?? [];
  } catch {
    return [];
  }
}

/**
 * Get proxy health info from the backend.
 * Returns empty stats when the backend is not configured or unreachable.
 */
export async function getProxyHealth(): Promise<{
  total: number;
  alive: number;
  dead: number;
  proxies: Array<{
    id: string;
    host: string;
    countryCode: string;
    alive: boolean;
    latency: number;
  }>;
}> {
  if (!isBackendConfigured()) return { total: 0, alive: 0, dead: 0, proxies: [] };
  try {
    const res = await fetch(`${API_BASE}/api/proxy/health`);
    if (!res.ok) return { total: 0, alive: 0, dead: 0, proxies: [] };
    return res.json();
  } catch {
    return { total: 0, alive: 0, dead: 0, proxies: [] };
  }
}

// ─── Getters ─────────────────────────────────────────────────────────

export function getConnectionState(): ConnectionState {
  return { ...currentConnection };
}

// ─── Speed Test ──────────────────────────────────────────────────────

export interface SpeedTestResult {
  download: number;
  upload: number;
  latency: number;
  jitter: number;
  server: string;
}

/**
 * Real speed test — measures actual network performance.
 *
 * When the GlobeStream backend is configured (VITE_PROXY_API_URL set) the test
 * runs against the proxy gateway, giving a picture of proxy-routed throughput:
 *   - Latency/Jitter: 5 pings to /api/speedtest/ping
 *   - Download: 2 MB payload from /api/speedtest/download
 *   - Upload: 1 MB POST to /api/speedtest/upload
 *
 * When no backend is available the test falls back to Cloudflare's public
 * speed-test CDN (speed.cloudflare.com) which is CORS-enabled and requires no
 * server-side component, so the speed test always works.
 *
 * @param onPhase Optional callback called as each phase begins: 'latency' | 'download' | 'upload'
 */
export async function runSpeedTest(
  onPhase?: (phase: "latency" | "download" | "upload") => void
): Promise<SpeedTestResult> {
  if (!currentConnection.isConnected || !currentConnection.countryCode) {
    throw new Error("Connect to a country first");
  }

  const useBackend = isBackendConfigured();

  // Endpoint base for this run
  const pingUrl = useBackend
    ? `${API_BASE}/api/speedtest/ping`
    : `${CF_SPEED}/cdn-cgi/trace`;
  const downloadUrl = useBackend
    ? `${API_BASE}/api/speedtest/download?size=2`
    : `${CF_SPEED}/__down?bytes=2097152`;
  const uploadUrl = useBackend
    ? `${API_BASE}/api/speedtest/upload`
    : `${CF_SPEED}/__up`;

  // 1. Latency + Jitter (5 pings)
  onPhase?.("latency");
  const PING_COUNT = 5;
  const pingTimes: number[] = [];
  for (let i = 0; i < PING_COUNT; i++) {
    const t0 = performance.now();
    await fetch(`${pingUrl}?t=${Date.now()}`, {
      cache: "no-store",
    });
    pingTimes.push(performance.now() - t0);
  }
  const latency = Math.round(pingTimes.reduce((a, b) => a + b, 0) / PING_COUNT);
  const jitterRaw = pingTimes
    .slice(1)
    .map((t, i) => Math.abs(t - pingTimes[i]));
  const jitter =
    Math.round(
      (jitterRaw.reduce((a, b) => a + b, 0) / jitterRaw.length) * 10
    ) / 10;

  // 2. Download speed (2 MB test file)
  onPhase?.("download");
  const dlStart = performance.now();
  const dlRes = await fetch(downloadUrl, {
    cache: "no-store",
  });
  const dlBuffer = await dlRes.arrayBuffer();
  const dlSeconds = (performance.now() - dlStart) / 1000;
  const download =
    Math.round(((dlBuffer.byteLength * 8) / dlSeconds / 1_000_000) * 10) / 10;

  // 3. Upload speed (1 MB payload)
  onPhase?.("upload");
  const uploadPayload = new Uint8Array(1 * 1024 * 1024);
  const ulStart = performance.now();
  await fetch(uploadUrl, {
    method: "POST",
    body: uploadPayload,
    headers: { "Content-Type": "application/octet-stream" },
  });
  const ulSeconds = (performance.now() - ulStart) / 1000;
  const upload =
    Math.round(
      ((uploadPayload.byteLength * 8) / ulSeconds / 1_000_000) * 10
    ) / 10;

  const serverLabel = useBackend
    ? `${currentConnection.countryName ?? currentConnection.countryCode} — GlobeStream Gateway`
    : `${currentConnection.countryName ?? currentConnection.countryCode} — Cloudflare CDN`;

  return {
    download,
    upload,
    latency,
    jitter,
    server: serverLabel,
  };
}

// ─── Utilities ───────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function formatSpeed(mbps: number): string {
  if (mbps > 1000) return `${(mbps / 1000).toFixed(1)} Gbps`;
  return `${mbps.toFixed(1)} Mbps`;
}
