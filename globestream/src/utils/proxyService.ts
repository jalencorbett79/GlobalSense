import { Country, VpnProtocol } from "../types";
/**
 * GlobeStream Proxy Service — REAL implementation
 *
 * This talks to the GlobeStream Proxy Gateway server (server/).
 * The gateway routes traffic through actual proxy servers in each country.
 *
 * Flow:
 *   Frontend → Proxy Gateway (your server) → Korean proxy → target site
 *
 * No simulations. No fake data. Every request hits a real proxy.
 */

// ─── Configuration ───────────────────────────────────────────────────
// In production (Render), frontend and backend are the same origin → use ""
// In dev, backend runs on localhost:3001
const PROXY_API = import.meta.env.VITE_PROXY_API_URL || "";

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
// ─── Connect / Disconnect ────────────────────────────────────────────

/**
 * "Connecting" means: verify that the backend has alive proxies for
 * this country, and lock in the country selection.
 */
export async function connectToProxy(
  country: Country,
  _protocol: VpnProtocol = "HTTPS",
  onStatsUpdate?: (stats: ConnectionState) => void
): Promise<ConnectionState> {
  // Check that the backend has alive proxies for this country
  const res = await fetch(`${PROXY_API}/api/proxy/servers/${country.code}`);
  if (!res.ok) {
    throw new Error(`Backend unreachable (${res.status})`);
  }

  const data = await res.json();
  const aliveProxies =
    data.proxies?.filter((p: { alive: boolean }) => p.alive) || [];

  if (aliveProxies.length === 0) {
    throw new Error(
      `No alive proxies for ${country.name}. Try another country.`
    );
  }

  // Pick the best one to show latency
  const best = aliveProxies.sort(
    (a: { latency: number }, b: { latency: number }) => a.latency - b.latency
  )[0];

  currentConnection = {
    isConnected: true,
    countryCode: country.code,
    countryName: country.name,
    countryFlag: country.flag,
    protocol: "HTTP Proxy",
    connectedAt: new Date(),
    latency: best.latency || 0,
    requestCount: 0,
    bytesDown: 0,
  };

  if (onStatsUpdate) {
    onStatsUpdate({ ...currentConnection });
  }

  return { ...currentConnection };
}

/**
 * Disconnect — just resets state. No tunnel to tear down.
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
 * Fetch a URL through the proxy gateway.
 * This is the real deal — traffic goes through a Korean (or wherever) proxy.
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
  const cc = countryCode || currentConnection.countryCode;
  if (!cc) {
    throw new Error("Not connected. Pick a country first.");
  }

  const res = await fetch(`${PROXY_API}/api/proxy/fetch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, countryCode: cc }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `Proxy fetch failed: ${res.status}`);
  }

  const data = await res.json();

  // Update stats
  currentConnection.requestCount += 1;
  currentConnection.bytesDown += data.body?.length || 0;
  currentConnection.latency =
    data.proxyUsed?.latency || currentConnection.latency;

  return data;
}

/**
 * Get the URL for the browse endpoint (for iframe src).
 * This returns raw HTML through the proxy — suitable for iframe embedding.
 */
export function getProxyBrowseUrl(url: string, countryCode?: string): string {
  const cc = countryCode || currentConnection.countryCode || "KR";
  return `${PROXY_API}/api/proxy/browse?url=${encodeURIComponent(
    url
  )}&country=${cc}`;
}

// ─── Country/Server Info ─────────────────────────────────────────────

/**
 * Get available countries from the backend.
 */
export async function getAvailableCountries(): Promise<string[]> {
  try {
    const res = await fetch(`${PROXY_API}/api/proxy/countries`);
    const data = await res.json();
    return data.countries || [];
  } catch {
    return [];
  }
}

/**
 * Get proxy health info from the backend.
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
  const res = await fetch(`${PROXY_API}/api/proxy/health`);
  return res.json();
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
 * Real speed test — fetches a known file through the proxy and measures throughput.
 */
export async function runSpeedTest(): Promise<SpeedTestResult> {
  if (!currentConnection.isConnected || !currentConnection.countryCode) {
    throw new Error("Connect to a country first");
  }

  // Fetch a 100KB test file through the proxy to measure real speed
  const testUrl = "https://speed.cloudflare.com/__down?bytes=102400";
  const start = Date.now();

  const result = await proxyFetch(testUrl, currentConnection.countryCode);
  const elapsed = (Date.now() - start) / 1000; // seconds
  const bytes = result.body?.length || 0;
  const mbps = (bytes * 8) / elapsed / 1_000_000;

  return {
    download: Math.round(mbps * 10) / 10,
    upload: 0, // Can't test upload through proxy fetch
    latency: result.proxyUsed?.latency || 0,
    jitter: 0,
    server: `${result.proxyUsed?.city}, ${result.proxyUsed?.countryCode}`,
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
