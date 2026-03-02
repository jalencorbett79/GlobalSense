/**
 * Geonode Free Proxy List Fetcher
 *
 * Fetches every proxy from https://geonode.com/free-proxy-list via their
 * public API and merges them into the proxy registry. The health checker
 * (health.js) then validates each one automatically.
 *
 * API: https://proxylist.geonode.com/api/proxy-list
 */

import { addProxies, clearDynamicProxies } from './proxies.js';

const GEONODE_API = 'https://proxylist.geonode.com/api/proxy-list';
const PAGE_LIMIT = 500;
const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Fetch a single page from the Geonode API.
 */
async function fetchPage(page = 1) {
  const url = `${GEONODE_API}?limit=${PAGE_LIMIT}&page=${page}&sort_by=lastChecked&sort_type=desc`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'GlobeStream/2.0' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Geonode API returned ${res.status}`);
  return res.json();
}

/**
 * Transform a Geonode proxy entry into our ProxyNode format.
 */
function toProxyNode(entry) {
  const protocol = entry.protocols?.includes('https')
    ? 'https'
    : entry.protocols?.includes('http')
      ? 'http'
      : entry.protocols?.[0] || 'http';

  const city = entry.city || 'Unknown';
  const cc = (entry.country || 'XX').toUpperCase();

  return {
    id: `geonode-${cc.toLowerCase()}-${entry.ip}-${entry.port}`,
    host: entry.ip,
    port: parseInt(entry.port, 10),
    protocol,
    countryCode: cc,
    city,
    isp: entry.isp || entry.org || 'Unknown',
    anonymity:
      entry.anonymityLevel === 'elite'
        ? 'high'
        : entry.anonymityLevel === 'anonymous'
          ? 'anonymous'
          : 'transparent',
    alive: true, // health checker will validate
    latency: entry.latency || 0,
    lastChecked: 0,
    source: 'geonode',
  };
}

/**
 * Fetch ALL proxies from Geonode (paginated) and merge into the registry.
 * Returns the number of proxies added.
 */
export async function fetchGeonodeProxies() {
  console.log('[Geonode] Fetching proxy list...');

  const allProxies = [];
  let page = 1;
  let hasMore = true;

  try {
    while (hasMore) {
      const data = await fetchPage(page);
      const entries = data.data || [];

      if (entries.length === 0) break;

      // Only include HTTP/HTTPS proxies (the server uses HTTP CONNECT tunnelling)
      const httpEntries = entries.filter(
        (e) => e.protocols?.includes('http') || e.protocols?.includes('https'),
      );

      for (const entry of httpEntries) {
        allProxies.push(toProxyNode(entry));
      }

      console.log(
        `[Geonode]   Page ${page}: ${entries.length} total, ${httpEntries.length} HTTP/HTTPS`,
      );

      const total = data.total || 0;
      if (page * PAGE_LIMIT >= total || entries.length < PAGE_LIMIT) {
        hasMore = false;
      } else {
        page++;
      }
    }

    // Replace previous Geonode proxies and add the fresh set
    clearDynamicProxies();
    addProxies(allProxies);

    console.log(
      `[Geonode] Added ${allProxies.length} proxies from ${page} page(s)`,
    );
    return allProxies.length;
  } catch (err) {
    console.error(`[Geonode] Fetch failed: ${err.message}`);
    return 0;
  }
}

/**
 * Start periodic Geonode proxy fetching (immediate + every 30 min).
 */
export function startGeonodeFetcher() {
  fetchGeonodeProxies();
  setInterval(fetchGeonodeProxies, REFRESH_INTERVAL_MS);
}
