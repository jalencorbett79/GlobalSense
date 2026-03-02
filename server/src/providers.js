/**
 * GlobeStream — API-Based Proxy Providers
 *
 * These providers offer proxy-as-a-service APIs. Instead of connecting
 * to a raw proxy IP, you send your target URL to their API and they
 * route the request through their rotating proxy network.
 *
 * Each provider returns { status, headers, body } just like fetchViaProxy.
 *
 * Supported providers (all have free tiers):
 *   - ScraperAPI       (SCRAPERAPI_KEY)
 *   - Crawlbase        (CRAWLBASE_TOKEN)       — formerly ProxyCrawl
 *   - WebScrapingAPI   (WEBSCRAPINGAPI_KEY)
 *   - Bright Data      (BRIGHTDATA_USERNAME, BRIGHTDATA_PASSWORD, BRIGHTDATA_HOST)
 *
 * Set the corresponding env vars to enable each provider.
 */

import http from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

const TIMEOUT_MS = 30_000;
const MAX_REDIRECTS = 5;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

// ─── ScraperAPI ──────────────────────────────────────────────────────
// Docs: https://www.scraperapi.com/documentation/
// Free tier: 5,000 API credits/month, rotating IPs, geolocation

/**
 * Fetch a URL through ScraperAPI.
 * @param {string} targetUrl  The URL to fetch
 * @param {string} countryCode  ISO country code for geo-targeting
 * @returns {Promise<{status: number, headers: object, body: string}>}
 */
export async function fetchViaScraperAPI(targetUrl, countryCode) {
  const apiKey = process.env.SCRAPERAPI_KEY;
  if (!apiKey) return null;

  const params = new URLSearchParams({
    api_key: apiKey,
    url: targetUrl,
    country_code: countryCode.toLowerCase(),
  });

  const apiUrl = `http://api.scraperapi.com?${params}`;
  const res = await fetchUrl(apiUrl);
  return res;
}

// ─── Crawlbase (formerly ProxyCrawl) ─────────────────────────────────
// Docs: https://crawlbase.com/docs
// Free tier: 1,000 free requests, can simulate regions

/**
 * Fetch a URL through Crawlbase.
 * @param {string} targetUrl  The URL to fetch
 * @param {string} countryCode  ISO country code for geo-targeting
 * @returns {Promise<{status: number, headers: object, body: string}>}
 */
export async function fetchViaCrawlbase(targetUrl, countryCode) {
  const token = process.env.CRAWLBASE_TOKEN;
  if (!token) return null;

  const params = new URLSearchParams({
    token,
    url: targetUrl,
    country: countryCode.toUpperCase(),
  });

  const apiUrl = `https://api.crawlbase.com/?${params}`;
  const res = await fetchUrl(apiUrl);
  return res;
}

// ─── WebScrapingAPI ──────────────────────────────────────────────────
// Docs: https://docs.webscrapingapi.com/
// Free tier: 1,000 free requests/month, geo rotation

/**
 * Fetch a URL through WebScrapingAPI.
 * @param {string} targetUrl  The URL to fetch
 * @param {string} countryCode  ISO country code for geo-targeting
 * @returns {Promise<{status: number, headers: object, body: string}>}
 */
export async function fetchViaWebScrapingAPI(targetUrl, countryCode) {
  const apiKey = process.env.WEBSCRAPINGAPI_KEY;
  if (!apiKey) return null;

  const params = new URLSearchParams({
    api_key: apiKey,
    url: targetUrl,
    country: countryCode.toLowerCase(),
  });

  const apiUrl = `https://api.webscrapingapi.com/v2?${params}`;
  const res = await fetchUrl(apiUrl);
  return res;
}

// ─── Bright Data ─────────────────────────────────────────────────────
// Docs: https://docs.brightdata.com/
// Free trial: limited bandwidth, strong geo support
// Uses standard HTTP proxy authentication to their superproxy endpoint

/**
 * Fetch a URL through Bright Data's proxy network.
 * @param {string} targetUrl  The URL to fetch
 * @param {string} countryCode  ISO country code for geo-targeting
 * @returns {Promise<{status: number, headers: object, body: string}>}
 */
export async function fetchViaBrightData(targetUrl, countryCode) {
  const username = process.env.BRIGHTDATA_USERNAME;
  const password = process.env.BRIGHTDATA_PASSWORD;
  const proxyHost = process.env.BRIGHTDATA_HOST || 'brd.superproxy.io';
  const proxyPort = parseInt(process.env.BRIGHTDATA_PORT || '22225', 10);

  if (!username || !password) return null;

  // Bright Data geo-targeting: append -country-XX to the username
  const geoUsername = `${username}-country-${countryCode.toLowerCase()}`;

  const parsed = new URL(targetUrl);
  const isHttps = parsed.protocol === 'https:';

  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${geoUsername}:${password}`).toString('base64');

    if (isHttps) {
      // HTTPS: use CONNECT tunnel through Bright Data proxy
      const connectReq = http.request({
        host: proxyHost,
        port: proxyPort,
        method: 'CONNECT',
        path: `${parsed.hostname}:${parsed.port || 443}`,
        headers: { 'Proxy-Authorization': `Basic ${auth}` },
        timeout: TIMEOUT_MS,
      });

      connectReq.on('connect', (_res, socket) => {
        const tlsReq = https.request(
          {
            hostname: parsed.hostname,
            port: parsed.port || 443,
            path: parsed.pathname + parsed.search,
            method: 'GET',
            headers: {
              'Host': parsed.hostname,
              'User-Agent': USER_AGENT,
            },
            socket,
            agent: false,
            timeout: TIMEOUT_MS,
          },
          (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
              resolve({ status: res.statusCode, headers: res.headers, body });
            });
          },
        );
        tlsReq.on('error', reject);
        tlsReq.on('timeout', () => { tlsReq.destroy(); reject(new Error('timeout')); });
        tlsReq.end();
      });

      connectReq.on('error', reject);
      connectReq.on('timeout', () => { connectReq.destroy(); reject(new Error('timeout')); });
      connectReq.end();
    } else {
      // HTTP: standard proxy request with auth
      const req = http.request(
        {
          host: proxyHost,
          port: proxyPort,
          method: 'GET',
          path: targetUrl,
          headers: {
            'Host': parsed.hostname,
            'Proxy-Authorization': `Basic ${auth}`,
            'User-Agent': USER_AGENT,
          },
          timeout: TIMEOUT_MS,
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => { body += chunk; });
          res.on('end', () => {
            resolve({ status: res.statusCode, headers: res.headers, body });
          });
        },
      );
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
      req.end();
    }
  });
}

// ─── Helper: fetch a URL (for API-based providers) ───────────────────

function fetchUrl(apiUrl, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount >= MAX_REDIRECTS) {
      return reject(new Error('Too many redirects'));
    }

    const parsed = new URL(apiUrl);
    const client = parsed.protocol === 'https:' ? https : http;

    const req = client.request(
      apiUrl,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'GlobeStream/2.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: TIMEOUT_MS,
      },
      (res) => {
        // Follow redirects (with limit)
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchUrl(res.headers.location, redirectCount + 1).then(resolve).catch(reject);
          return;
        }

        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          resolve({ status: res.statusCode, headers: res.headers, body });
        });
      },
    );

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

// ─── Unified provider fetch with fallback ────────────────────────────

/**
 * List of all API-based providers, in priority order.
 * Each entry: { name, fetchFn }
 */
const providers = [
  { name: 'ScraperAPI', fetchFn: fetchViaScraperAPI },
  { name: 'Crawlbase', fetchFn: fetchViaCrawlbase },
  { name: 'WebScrapingAPI', fetchFn: fetchViaWebScrapingAPI },
  { name: 'BrightData', fetchFn: fetchViaBrightData },
];

/**
 * Try each enabled provider in order until one succeeds.
 * Returns { status, headers, body, providerUsed } or null if none work.
 *
 * @param {string} targetUrl
 * @param {string} countryCode
 * @returns {Promise<{status: number, headers: object, body: string, providerUsed: string}|null>}
 */
export async function fetchViaProviders(targetUrl, countryCode) {
  if (!countryCode) return null;

  for (const { name, fetchFn } of providers) {
    try {
      const result = await fetchFn(targetUrl, countryCode);
      if (result === null) continue; // provider not configured
      if (result.status >= 200 && result.status < 400) {
        console.log(`[Provider] ${name} succeeded for ${targetUrl}`);
        return { ...result, providerUsed: name };
      }
      console.log(`[Provider] ${name} returned HTTP ${result.status} for ${targetUrl}`);
    } catch (err) {
      console.log(`[Provider] ${name} failed for ${targetUrl}: ${err.message}`);
    }
  }
  return null;
}

/**
 * Get a list of configured (enabled) providers.
 * @returns {string[]}
 */
export function getEnabledProviders() {
  const enabled = [];
  if (process.env.SCRAPERAPI_KEY) enabled.push('ScraperAPI');
  if (process.env.CRAWLBASE_TOKEN) enabled.push('Crawlbase');
  if (process.env.WEBSCRAPINGAPI_KEY) enabled.push('WebScrapingAPI');
  if (process.env.BRIGHTDATA_USERNAME && process.env.BRIGHTDATA_PASSWORD) enabled.push('BrightData');
  return enabled;
}
