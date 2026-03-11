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
  const base = API_BASE || window.location.origin;
  const res = await fetch(`${base}/api/proxy/fetch`, {
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
 * Constructs the full backend URL so it can be used as an iframe src.
 */
export function getProxyBrowseUrl(url: string, countryCode?: string): string {
  const base = API_BASE || window.location.origin;
  const params = new URLSearchParams({
    url,
    country: countryCode ?? currentConnection.countryCode ?? "US",
  });
  return `${base}/api/proxy/browse?${params.toString()}`;
}

// ─── Country/Server Info ─────────────────────────────────────────────

/**
 * Get available countries from the backend.
 */
export async function getAvailableCountries(): Promise<string[]> {
  try {
    const base = API_BASE || window.location.origin;
    const res = await fetch(`${base}/api/proxy/countries`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.countries ?? [];
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
  try {
    const base = API_BASE || window.location.origin;
    const res = await fetch(`${base}/api/proxy/health`);
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
 * Real speed test — measures actual network performance against the
 * GlobeStream backend server (the proxy gateway).
 *
 * - Latency/Jitter: 5 sequential pings to /api/speedtest/ping
 * - Download: fetches a 2 MB test payload from /api/speedtest/download
 * - Upload: POSTs a 1 MB payload to /api/speedtest/upload
 *
 * @param onPhase Optional callback called as each phase begins: 'latency' | 'download' | 'upload'
 */
export async function runSpeedTest(
  onPhase?: (phase: "latency" | "download" | "upload") => void
): Promise<SpeedTestResult> {
  if (!currentConnection.isConnected || !currentConnection.countryCode) {
    throw new Error("Connect to a country first");
  }

  const base = API_BASE || window.location.origin;

  // 1. Latency + Jitter (5 pings)
  onPhase?.("latency");
  const PING_COUNT = 5;
  const pingTimes: number[] = [];
  for (let i = 0; i < PING_COUNT; i++) {
    const t0 = performance.now();
    await fetch(`${base}/api/speedtest/ping?t=${Date.now()}`, {
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
  const dlRes = await fetch(`${base}/api/speedtest/download?size=2`, {
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
  await fetch(`${base}/api/speedtest/upload`, {
    method: "POST",
    body: uploadPayload,
    headers: { "Content-Type": "application/octet-stream" },
  });
  const ulSeconds = (performance.now() - ulStart) / 1000;
  const upload =
    Math.round(
      ((uploadPayload.byteLength * 8) / ulSeconds / 1_000_000) * 10
    ) / 10;

  return {
    download,
    upload,
    latency,
    jitter,
    server: `${currentConnection.countryName ?? currentConnection.countryCode} -- GlobeStream Gateway`,
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
