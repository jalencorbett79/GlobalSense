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
 *   Proxy browser: requires backend (gracefully disabled when unavailable)
 */

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
 * Throws a clear error when no backend is available.
 */
export async function proxyFetch(
  _url: string,
  _countryCode?: string
): Promise<{
  status: number;
  contentType: string;
  body: string;
  proxyUsed: { id: string; city: string; countryCode: string; latency: number };
}> {
  throw new Error(
    "Proxy browsing requires a backend server. " +
    "Start the server (cd server && npm start) and set VITE_PROXY_API_URL."
  );
}

/**
 * Get the URL for the browse endpoint (for iframe src).
 * Returns an empty string when no backend is configured.
 */
export function getProxyBrowseUrl(_url: string, _countryCode?: string): string {
  return "";
}

// ─── Country/Server Info ─────────────────────────────────────────────

/**
 * Get available countries. Returns an empty array when no backend is running.
 */
export async function getAvailableCountries(): Promise<string[]> {
  return [];
}

/**
 * Get proxy health info. Returns empty stats when no backend is running.
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
  return { total: 0, alive: 0, dead: 0, proxies: [] };
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
 * Simulated speed test — returns realistic-looking values based on
 * the selected region's latency profile.
 */
export async function runSpeedTest(): Promise<SpeedTestResult> {
  if (!currentConnection.isConnected || !currentConnection.countryCode) {
    throw new Error("Connect to a country first");
  }

  const latency = currentConnection.latency || Math.floor(30 + Math.random() * 70);
  const download = Math.round((15 + Math.random() * 45) * 10) / 10;
  const upload = Math.round((5 + Math.random() * 20) * 10) / 10;
  const jitter = Math.round(Math.random() * 8 * 10) / 10;

  return {
    download,
    upload,
    latency,
    jitter,
    server: `${currentConnection.countryName || currentConnection.countryCode}`,
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
