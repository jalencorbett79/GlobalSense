/**
 * Free Proxy List Fetcher — supplements Geonode with additional free proxy sources
 *
 * Open-source proxy sources used:
 *   - ProxyScrape (https://proxyscrape.com) — free API, no key required
 *   - proxy-list.download — free list
 *
 * These proxies are added to the registry alongside Geonode proxies.
 * Since free proxies have unknown country codes, we only add ones with
 * known high-quality country identifiers to avoid polluting the country list.
 */

import { addProxies } from './proxies.js';

// Country code mappings for all countries supported in GlobeStream
const SUPPORTED_COUNTRIES = [
  // North America
  'US', 'CA', 'MX',
  // South America
  'BR', 'AR', 'CL', 'CO',
  // Europe
  'GB', 'DE', 'FR', 'NL', 'SE', 'CH', 'ES', 'IT', 'PL', 'RO', 'RU', 'UA',
  // Asia
  'JP', 'KR', 'SG', 'IN', 'TH', 'TW', 'HK', 'PH', 'ID',
  // Middle East
  'AE', 'IL', 'TR',
  // Africa
  'ZA', 'NG', 'KE', 'EG',
  // Oceania
  'AU', 'NZ',
];

/**
 * Fetch free proxies from ProxyScrape for a given country code.
 * ProxyScrape provides a completely free API with no authentication required.
 */
async function fetchProxyScrapeForCountry(countryCode) {
  const url = `https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=${countryCode}&ssl=all&anonymity=anonymous&simplified=true`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return [];
    const text = await res.text();
    clearTimeout(timeout);

    return text
      .trim()
      .split('\n')
      .filter((line) => line.includes(':'))
      .map((line) => {
        const [host, portStr] = line.trim().split(':');
        const port = parseInt(portStr, 10);
        if (!host || !port || port < 1 || port > 65535) return null;
        return {
          id: `proxyscrape-${countryCode.toLowerCase()}-${host.trim().replace(/\./g, '-')}-${port}`,
          host: host.trim(),
          port,
          countryCode,
          city: countryCode,
          anonymity: 'anonymous',
          protocol: 'http',
          source: 'proxyscrape',
        };
      })
      .filter(Boolean);
  } catch {
    clearTimeout(timeout);
    return [];
  }
}

/**
 * Fetch and register free proxies for all supported countries.
 * Called once at startup; runs in the background without blocking.
 */
export async function fetchFreeProxies() {
  console.log('[FreeList] Fetching free proxies from ProxyScrape...');

  let totalAdded = 0;

  // Fetch in batches of 5 to avoid overwhelming the API
  for (let i = 0; i < SUPPORTED_COUNTRIES.length; i += 5) {
    const batch = SUPPORTED_COUNTRIES.slice(i, i + 5);
    const results = await Promise.all(batch.map(fetchProxyScrapeForCountry));

    for (let j = 0; j < batch.length; j++) {
      const proxies = results[j];
      if (proxies.length > 0) {
        addProxies(proxies);
        totalAdded += proxies.length;
        console.log(`[FreeList] ${batch[j]}: +${proxies.length} proxies`);
      }
    }

    // Small delay between batches to be polite
    if (i + 5 < SUPPORTED_COUNTRIES.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(`[FreeList] Done — added ${totalAdded} free proxies across ${SUPPORTED_COUNTRIES.length} countries`);
  return totalAdded;
}

/**
 * Start periodic background refresh of free proxy list (every 60 minutes).
 */
export function startFreeListFetcher() {
  // Initial fetch after a short delay to not compete with startup
  setTimeout(() => {
    fetchFreeProxies().catch((err) =>
      console.error('[FreeList] Initial fetch failed:', err.message)
    );
  }, 5000);

  // Refresh every 60 minutes
  setInterval(() => {
    fetchFreeProxies().catch((err) =>
      console.error('[FreeList] Refresh failed:', err.message)
    );
  }, 60 * 60 * 1000);
}
