/**
 * GlobeStream — Proxy Server Registry
 *
 * Every proxy here is a REAL server. The health checker (health.js)
 * pings them on startup and every 5 minutes, marking dead ones.
 *
 * To add more proxies:
 *   - Free lists: free-proxy-list.net, geonode.com/free-proxy-list
 *   - Self-hosted: install Squid on any $5/mo VPS in any country
 *     (apt install squid → edit /etc/squid/squid.conf → systemctl start squid)
 */

/** @type {import('./types.js').ProxyNode[]} */
const proxyNodes = [
  // ═══════════════════════════════════════════════════════
  // SOUTH KOREA
  // ═══════════════════════════════════════════════════════
  {
    id: 'kr-seoul-oracle-1',
    host: '193.122.106.183',
    port: 80,
    protocol: 'http',
    countryCode: 'KR',
    city: 'Seoul',
    isp: 'Oracle-BMC-31898',
    anonymity: 'high',
    alive: true,
    latency: 0,
    lastChecked: 0,
  },
  {
    id: 'kr-goyang-kt-1',
    host: '175.213.76.24',
    port: 80,
    protocol: 'http',
    countryCode: 'KR',
    city: 'Goyang-si',
    isp: 'Korea Telecom',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
  },
  {
    id: 'kr-wonju-kt-1',
    host: '203.243.63.16',
    port: 80,
    protocol: 'http',
    countryCode: 'KR',
    city: 'Wŏnju',
    isp: 'Korea Telecom',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
  },
  {
    id: 'kr-gangnam-kt-1',
    host: '218.145.131.182',
    port: 80,
    protocol: 'http',
    countryCode: 'KR',
    city: 'Gangnam-gu',
    isp: 'Korea Telecom',
    anonymity: 'transparent',
    alive: true,
    latency: 0,
    lastChecked: 0,
  },
  {
    id: 'kr-buk-sk-1',
    host: '211.202.167.56',
    port: 80,
    protocol: 'http',
    countryCode: 'KR',
    city: 'Buk-gu',
    isp: 'SK Broadband Co Ltd',
    anonymity: 'high',
    alive: true,
    latency: 0,
    lastChecked: 0,
  },
];

/**
 * Get all alive proxies for a country.
 */
export function getProxiesByCountry(countryCode) {
  return proxyNodes.filter(
    (p) => p.countryCode === countryCode.toUpperCase() && p.alive,
  );
}

/**
 * Pick the best proxy for a country (highest anonymity, lowest latency).
 */
export function pickBestProxy(countryCode) {
  const proxies = getProxiesByCountry(countryCode);
  if (proxies.length === 0) return null;

  const sorted = [...proxies].sort((a, b) => {
    const score = (p) => p.anonymity === 'high' ? 0 : p.anonymity === 'anonymous' ? 1 : 2;
    const diff = score(a) - score(b);
    if (diff !== 0) return diff;
    return (a.latency || 99999) - (b.latency || 99999);
  });

  return sorted[0];
}

/**
 * Get all country codes that have at least one alive proxy.
 */
export function getAvailableCountries() {
  const codes = new Set(proxyNodes.filter((p) => p.alive).map((p) => p.countryCode));
  return [...codes];
}

/**
 * Get the full list (for health endpoint).
 */
export function getAllProxies() {
  return proxyNodes;
}

/**
 * Update a proxy's health.
 */
export function updateProxy(id, update) {
  const proxy = proxyNodes.find((p) => p.id === id);
  if (proxy) Object.assign(proxy, update);
}
