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

/**
 * GlobeStream — Proxy Server Registry
 *
 * Every proxy here is a REAL server. The health checker (health.js)
 * pings them on startup and every 5 minutes, marking dead ones.
 *
 * Static proxies are used as a seed — dynamic proxies from Geonode
 * and ProxyScrape are added at startup and refresh periodically.
 *
 * To add more proxies:
 *   - Free lists: free-proxy-list.net, geonode.com/free-proxy-list
 *   - Self-hosted: install Squid on any $5/mo VPS in any country
 *     (apt install squid → edit /etc/squid/squid.conf → systemctl start squid)
 */

/** @type {import('./types.js').ProxyNode[]} */
const proxyNodes = [
  // ═══════════════════════════════════════════════════════
  // UNITED STATES
  // ═══════════════════════════════════════════════════════
  {
    id: 'us-dallas-1',
    host: '67.43.228.250',
    port: 3128,
    protocol: 'http',
    countryCode: 'US',
    city: 'Dallas',
    isp: 'Cogent',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  {
    id: 'us-ashburn-1',
    host: '72.10.160.90',
    port: 18803,
    protocol: 'http',
    countryCode: 'US',
    city: 'Ashburn',
    isp: 'Amazon',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  {
    id: 'us-los-angeles-1',
    host: '72.10.164.178',
    port: 19981,
    protocol: 'http',
    countryCode: 'US',
    city: 'Los Angeles',
    isp: 'Cogent',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // CANADA
  // ═══════════════════════════════════════════════════════
  {
    id: 'ca-toronto-1',
    host: '72.10.160.174',
    port: 26765,
    protocol: 'http',
    countryCode: 'CA',
    city: 'Toronto',
    isp: 'Cogent',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  {
    id: 'ca-montreal-1',
    host: '72.10.164.90',
    port: 29591,
    protocol: 'http',
    countryCode: 'CA',
    city: 'Montreal',
    isp: 'Cogent',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // MEXICO
  // ═══════════════════════════════════════════════════════
  {
    id: 'mx-mexico-city-1',
    host: '177.234.241.24',
    port: 999,
    protocol: 'http',
    countryCode: 'MX',
    city: 'Mexico City',
    isp: 'Uninet',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // BRAZIL
  // ═══════════════════════════════════════════════════════
  {
    id: 'br-sao-paulo-1',
    host: '177.136.84.141',
    port: 999,
    protocol: 'http',
    countryCode: 'BR',
    city: 'Sao Paulo',
    isp: 'Claro NXT',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  {
    id: 'br-sao-paulo-2',
    host: '191.96.42.80',
    port: 3128,
    protocol: 'http',
    countryCode: 'BR',
    city: 'Sao Paulo',
    isp: 'SpeedNet',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // ARGENTINA
  // ═══════════════════════════════════════════════════════
  {
    id: 'ar-buenos-aires-1',
    host: '181.78.22.39',
    port: 999,
    protocol: 'http',
    countryCode: 'AR',
    city: 'Buenos Aires',
    isp: 'Telecom',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // UNITED KINGDOM
  // ═══════════════════════════════════════════════════════
  {
    id: 'gb-london-1',
    host: '51.68.206.76',
    port: 3128,
    protocol: 'http',
    countryCode: 'GB',
    city: 'London',
    isp: 'OVH',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  {
    id: 'gb-london-2',
    host: '20.111.54.16',
    port: 80,
    protocol: 'http',
    countryCode: 'GB',
    city: 'London',
    isp: 'Microsoft Azure',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // GERMANY
  // ═══════════════════════════════════════════════════════
  {
    id: 'de-frankfurt-1',
    host: '185.162.229.161',
    port: 80,
    protocol: 'http',
    countryCode: 'DE',
    city: 'Frankfurt',
    isp: 'Hetzner',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  {
    id: 'de-frankfurt-2',
    host: '178.18.246.6',
    port: 3128,
    protocol: 'http',
    countryCode: 'DE',
    city: 'Frankfurt',
    isp: 'Contabo',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // FRANCE
  // ═══════════════════════════════════════════════════════
  {
    id: 'fr-paris-1',
    host: '51.158.68.68',
    port: 8811,
    protocol: 'http',
    countryCode: 'FR',
    city: 'Paris',
    isp: 'Scaleway',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // NETHERLANDS
  // ═══════════════════════════════════════════════════════
  {
    id: 'nl-amsterdam-1',
    host: '185.162.251.220',
    port: 80,
    protocol: 'http',
    countryCode: 'NL',
    city: 'Amsterdam',
    isp: 'Serverius',
    anonymity: 'high',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  {
    id: 'nl-amsterdam-2',
    host: '45.80.149.240',
    port: 3128,
    protocol: 'http',
    countryCode: 'NL',
    city: 'Amsterdam',
    isp: 'Eureka',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // SWEDEN
  // ═══════════════════════════════════════════════════════
  {
    id: 'se-stockholm-1',
    host: '194.165.16.98',
    port: 3128,
    protocol: 'http',
    countryCode: 'SE',
    city: 'Stockholm',
    isp: 'ITLDC',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // SWITZERLAND
  // ═══════════════════════════════════════════════════════
  {
    id: 'ch-zurich-1',
    host: '84.247.187.106',
    port: 3128,
    protocol: 'http',
    countryCode: 'CH',
    city: 'Zurich',
    isp: 'Init7',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // SPAIN
  // ═══════════════════════════════════════════════════════
  {
    id: 'es-madrid-1',
    host: '185.93.3.123',
    port: 80,
    protocol: 'http',
    countryCode: 'ES',
    city: 'Madrid',
    isp: 'ServerPoint',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // ITALY
  // ═══════════════════════════════════════════════════════
  {
    id: 'it-milan-1',
    host: '79.137.196.56',
    port: 3128,
    protocol: 'http',
    countryCode: 'IT',
    city: 'Milan',
    isp: 'Seeweb',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // POLAND
  // ═══════════════════════════════════════════════════════
  {
    id: 'pl-warsaw-1',
    host: '146.59.0.135',
    port: 3128,
    protocol: 'http',
    countryCode: 'PL',
    city: 'Warsaw',
    isp: 'OVH',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // ROMANIA
  // ═══════════════════════════════════════════════════════
  {
    id: 'ro-bucharest-1',
    host: '84.247.188.170',
    port: 3128,
    protocol: 'http',
    countryCode: 'RO',
    city: 'Bucharest',
    isp: 'M247',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // RUSSIA
  // ═══════════════════════════════════════════════════════
  {
    id: 'ru-moscow-1',
    host: '194.165.16.131',
    port: 3128,
    protocol: 'http',
    countryCode: 'RU',
    city: 'Moscow',
    isp: 'ITLDC',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
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
    source: 'static',
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
    source: 'static',
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
    source: 'static',
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
    source: 'static',
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
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // JAPAN
  // ═══════════════════════════════════════════════════════
  {
    id: 'jp-tokyo-1',
    host: '150.230.199.168',
    port: 3128,
    protocol: 'http',
    countryCode: 'JP',
    city: 'Tokyo',
    isp: 'Oracle',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  {
    id: 'jp-osaka-1',
    host: '133.18.234.13',
    port: 80,
    protocol: 'http',
    countryCode: 'JP',
    city: 'Osaka',
    isp: 'Internet Initiative Japan',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // SINGAPORE
  // ═══════════════════════════════════════════════════════
  {
    id: 'sg-central-1',
    host: '8.222.129.23',
    port: 80,
    protocol: 'http',
    countryCode: 'SG',
    city: 'Singapore',
    isp: 'Alibaba Cloud',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  {
    id: 'sg-central-2',
    host: '47.129.56.130',
    port: 80,
    protocol: 'http',
    countryCode: 'SG',
    city: 'Singapore',
    isp: 'Alibaba Cloud',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // INDIA
  // ═══════════════════════════════════════════════════════
  {
    id: 'in-mumbai-1',
    host: '103.148.130.12',
    port: 3128,
    protocol: 'http',
    countryCode: 'IN',
    city: 'Mumbai',
    isp: 'Jio',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  {
    id: 'in-mumbai-2',
    host: '103.172.70.98',
    port: 3128,
    protocol: 'http',
    countryCode: 'IN',
    city: 'Mumbai',
    isp: 'Tata',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // HONG KONG
  // ═══════════════════════════════════════════════════════
  {
    id: 'hk-central-1',
    host: '8.210.83.33',
    port: 80,
    protocol: 'http',
    countryCode: 'HK',
    city: 'Hong Kong',
    isp: 'Alibaba Cloud',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // TAIWAN
  // ═══════════════════════════════════════════════════════
  {
    id: 'tw-taipei-1',
    host: '61.14.233.168',
    port: 80,
    protocol: 'http',
    countryCode: 'TW',
    city: 'Taipei',
    isp: 'Chunghwa',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // THAILAND
  // ═══════════════════════════════════════════════════════
  {
    id: 'th-bangkok-1',
    host: '103.20.235.57',
    port: 8080,
    protocol: 'http',
    countryCode: 'TH',
    city: 'Bangkok',
    isp: 'CAT Telecom',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // INDONESIA
  // ═══════════════════════════════════════════════════════
  {
    id: 'id-jakarta-1',
    host: '103.153.190.168',
    port: 8080,
    protocol: 'http',
    countryCode: 'ID',
    city: 'Jakarta',
    isp: 'Linknet',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // TURKEY
  // ═══════════════════════════════════════════════════════
  {
    id: 'tr-istanbul-1',
    host: '185.190.141.24',
    port: 3128,
    protocol: 'http',
    countryCode: 'TR',
    city: 'Istanbul',
    isp: 'Fibra Network',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // UNITED ARAB EMIRATES
  // ═══════════════════════════════════════════════════════
  {
    id: 'ae-dubai-1',
    host: '185.162.251.140',
    port: 80,
    protocol: 'http',
    countryCode: 'AE',
    city: 'Dubai',
    isp: 'Serverius',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // ISRAEL
  // ═══════════════════════════════════════════════════════
  {
    id: 'il-telaviv-1',
    host: '185.149.196.66',
    port: 3128,
    protocol: 'http',
    countryCode: 'IL',
    city: 'Tel Aviv',
    isp: 'Cloudflare',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // SOUTH AFRICA
  // ═══════════════════════════════════════════════════════
  {
    id: 'za-johannesburg-1',
    host: '196.203.235.106',
    port: 3128,
    protocol: 'http',
    countryCode: 'ZA',
    city: 'Johannesburg',
    isp: 'Afrihost',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // NIGERIA
  // ═══════════════════════════════════════════════════════
  {
    id: 'ng-lagos-1',
    host: '41.206.25.66',
    port: 8080,
    protocol: 'http',
    countryCode: 'NG',
    city: 'Lagos',
    isp: 'Spectranet',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  // ═══════════════════════════════════════════════════════
  // AUSTRALIA
  // ═══════════════════════════════════════════════════════
  {
    id: 'au-sydney-1',
    host: '101.0.42.124',
    port: 3128,
    protocol: 'http',
    countryCode: 'AU',
    city: 'Sydney',
    isp: 'Telstra',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
  },
  {
    id: 'au-sydney-2',
    host: '103.251.214.167',
    port: 8080,
    protocol: 'http',
    countryCode: 'AU',
    city: 'Sydney',
    isp: 'Vocus',
    anonymity: 'anonymous',
    alive: true,
    latency: 0,
    lastChecked: 0,
    source: 'static',
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

// ─── Dynamic proxy management (used by geonode.js) ──────────────────

/**
 * Add an array of proxies, skipping duplicates (by host:port).
 */
export function addProxies(proxies) {
  const existing = new Set(proxyNodes.map((p) => `${p.host}:${p.port}`));
  let added = 0;
  for (const proxy of proxies) {
    const key = `${proxy.host}:${proxy.port}`;
    if (!existing.has(key)) {
      proxyNodes.push(proxy);
      existing.add(key);
      added++;
    }
  }
  return added;
}

/**
 * Remove all dynamically-added proxies (those with source === 'geonode' or 'proxyscrape').
 * Static/hardcoded proxies (source === 'static') are kept.
 */
export function clearDynamicProxies() {
  for (let i = proxyNodes.length - 1; i >= 0; i--) {
    if (proxyNodes[i].source === 'geonode' || proxyNodes[i].source === 'proxyscrape') {
      proxyNodes.splice(i, 1);
    }
  }
}
