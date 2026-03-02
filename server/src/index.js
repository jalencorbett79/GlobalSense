/**
 * GlobeStream — Single-server deployment
 *
 * This serves BOTH the frontend (static files) and the proxy API.
 * One Render service. One URL. No Vercel needed.
 *
 * User's Browser → This Server (Render) → Korean Proxy → target website
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'node:http';
import https from 'node:https';
import { URL, fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import { UAParser } from 'ua-parser-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import {
  pickBestProxy,
  getProxiesByCountry,
  getAvailableCountries,
  getAllProxies,
} from './proxies.js';
import { startHealthChecker } from './health.js';
import { startGeonodeFetcher, fetchGeonodeProxies } from './geonode.js';
import tmdbRoutes from './routes/tmdb.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────

app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// ─── Health Check (standalone, for Render + quick connectivity testing) ─

app.get('/health', (_req, res) => {
  const proxies = getAllProxies();
  const alive = proxies.filter((p) => p.alive).length;
  res.json({
    status: 'OK',
    service: 'GlobeStream Proxy Gateway',
    version: '2.0.0',
    proxies: { total: proxies.length, alive },
  });
});

// ─── Fetch through proxy (core function) ─────────────────────────────

function fetchViaProxy(proxy, targetUrl, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(targetUrl);
    const isHttps = parsed.protocol === 'https:';

    if (isHttps) {
      // HTTPS: send CONNECT to proxy, then TLS handshake through tunnel
      const connectReq = http.request({
        host: proxy.host,
        port: proxy.port,
        method: 'CONNECT',
        path: `${parsed.hostname}:${parsed.port || 443}`,
        timeout,
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
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            },
            socket,
            agent: false,
            timeout,
          },
          (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
              resolve({
                status: res.statusCode,
                headers: res.headers,
                body,
              });
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
      // HTTP: standard proxy request
      const req = http.request(
        {
          host: proxy.host,
          port: proxy.port,
          method: 'GET',
          path: targetUrl,
          headers: {
            'Host': parsed.hostname,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
          },
          timeout,
        },
        (res) => {
          // Follow redirects
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            fetchViaProxy(proxy, res.headers.location, timeout).then(resolve).catch(reject);
            return;
          }

          let body = '';
          res.on('data', (chunk) => { body += chunk; });
          res.on('end', () => {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body,
            });
          });
        },
      );
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
      req.end();
    }
  });
}

// ─── Session Info ────────────────────────────────────────────────────

function maskIp(ip) {
  if (!ip) return 'Unknown';
  // Handle IPv6-mapped IPv4 (e.g. ::ffff:192.168.1.1)
  const cleaned = ip.replace(/^::ffff:/, '');
  const parts = cleaned.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
  }
  // IPv6: mask last segments
  const segments = cleaned.split(':');
  if (segments.length > 2) {
    return `${segments[0]}:${segments[1]}:xxxx:xxxx`;
  }
  return 'Unknown';
}

/**
 * GET /api/session-info
 * Returns masked IP, approximate location, device info, and timestamp.
 */
app.get('/api/session-info', async (req, res) => {
  try {
    const rawIp =
      (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      req.socket.remoteAddress ||
      '';
    const maskedIp = maskIp(rawIp);

    // Parse user-agent for device info
    const ua = req.headers['user-agent'] || '';
    const parser = new UAParser(ua);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const deviceName = `${browser.name || 'Unknown Browser'} on ${os.name || 'Unknown OS'}${os.version ? ' ' + os.version : ''}`;

    // Geolocation lookup via ipapi.co (free, no key required)
    let location = 'Unknown';
    try {
      const lookupIp = rawIp.replace(/^::ffff:/, '') || '';
      const isValidIp = /^[\da-fA-F.:]+$/.test(lookupIp);
      const geoUrl = isValidIp && lookupIp !== '127.0.0.1' && lookupIp !== '::1'
        ? `https://ipapi.co/${lookupIp}/json/`
        : 'https://ipapi.co/json/';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const geoRes = await fetch(geoUrl, { signal: controller.signal });
      clearTimeout(timeout);
      if (geoRes.ok) {
        const geo = await geoRes.json();
        if (geo.city && geo.country_name) {
          location = `${geo.city}, ${geo.country_name}`;
        } else if (geo.country_name) {
          location = geo.country_name;
        }
      }
    } catch {
      // Geolocation failed — use fallback
    }

    res.json({
      maskedIp,
      location,
      device: deviceName,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Session Info Error]', err.message);
    res.status(500).json({ error: 'Failed to retrieve session info' });
  }
});

// ─── API Routes ──────────────────────────────────────────────────────

/**
 * GET /api/proxy/countries
 */
app.get('/api/proxy/countries', (_req, res) => {
  res.json({ countries: getAvailableCountries() });
});

/**
 * GET /api/proxy/servers/:countryCode
 */
app.get('/api/proxy/servers/:countryCode', (req, res) => {
  const proxies = getProxiesByCountry(req.params.countryCode);
  res.json({
    proxies: proxies.map((p) => ({
      id: p.id,
      countryCode: p.countryCode,
      city: p.city,
      isp: p.isp,
      anonymity: p.anonymity,
      latency: p.latency,
      alive: p.alive,
    })),
  });
});

/**
 * GET /api/proxy/health
 */
app.get('/api/proxy/health', (_req, res) => {
  const proxies = getAllProxies();
  const alive = proxies.filter((p) => p.alive).length;
  res.json({
    total: proxies.length,
    alive,
    dead: proxies.length - alive,
    proxies: proxies.map((p) => ({
      id: p.id,
      host: `${p.host}:${p.port}`,
      countryCode: p.countryCode,
      city: p.city,
      alive: p.alive,
      latency: p.latency,
      lastChecked: p.lastChecked ? new Date(p.lastChecked).toISOString() : null,
    })),
  });
});

/**
 * POST /api/proxy/refresh
 * Manually trigger a re-fetch of the Geonode proxy list.
 */
app.post('/api/proxy/refresh', async (_req, res) => {
  try {
    const count = await fetchGeonodeProxies();
    res.json({ refreshed: true, proxiesAdded: count });
  } catch (err) {
    res.status(500).json({ error: 'Refresh failed', detail: err.message });
  }
});

/**
 * POST /api/proxy/fetch
 * Body: { url: string, countryCode: string }
 */
app.post('/api/proxy/fetch', async (req, res) => {
  const { url, countryCode } = req.body;

  if (!url) return res.status(400).json({ error: 'Missing "url"' });
  if (!countryCode) return res.status(400).json({ error: 'Missing "countryCode"' });

  const proxy = pickBestProxy(countryCode);
  if (!proxy) {
    return res.status(503).json({ error: `No alive proxies for ${countryCode}` });
  }

  try {
    const start = Date.now();
    const result = await fetchViaProxy(proxy, url);
    const latency = Date.now() - start;

    res.json({
      status: result.status,
      contentType: result.headers?.['content-type'] || '',
      body: result.body,
      proxyUsed: {
        id: proxy.id,
        city: proxy.city,
        countryCode: proxy.countryCode,
        latency,
      },
    });
  } catch (err) {
    console.error(`[Fetch Error] ${proxy.id} → ${url}: ${err.message}`);
    res.status(502).json({ error: 'Proxy request failed', detail: err.message });
  }
});

/**
 * GET /api/proxy/browse?url=...&country=...
 * Returns raw HTML through the proxy — for iframe embedding.
 */
app.get('/api/proxy/browse', async (req, res) => {
  const { url, country } = req.query;

  if (!url || !country) {
    return res.status(400).send('Missing url or country');
  }

  const proxy = pickBestProxy(country);
  if (!proxy) {
    return res.status(503).send(`No proxies for ${country}`);
  }

  try {
    const result = await fetchViaProxy(proxy, url);
    const contentType = result.headers?.['content-type'] || 'text/html; charset=utf-8';

    let body = result.body;

    // Inject <base> tag so relative URLs resolve to the target origin
    try {
      const parsed = new URL(url);
      const baseTag = `<base href="${parsed.origin}/" target="_self">`;
      body = body.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);
    } catch { /* not a valid URL, skip */ }

    res.set('Content-Type', contentType);
    res.set('X-Proxy-Country', proxy.countryCode);
    res.set('X-Proxy-City', proxy.city);
    res.set('X-Proxy-Id', proxy.id);
    res.send(body);
  } catch (err) {
    console.error(`[Browse Error] ${proxy.id} → ${url}: ${err.message}`);
    res.status(502).send(`Proxy error: ${err.message}`);
  }
});

// ─── TMDB API Routes ─────────────────────────────────────────────────

app.use('/api', tmdbRoutes);

// ─── Serve Frontend Static Files ─────────────────────────────────────

const distPath = join(__dirname, '..', '..', 'globestream', 'dist');

if (existsSync(distPath)) {
  console.log(`[Static] Serving frontend from ${distPath}`);
  app.use(express.static(distPath));

  // SPA fallback — any route that isn't /api/* serves index.html
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
} else {
  // Fallback: just show API status if frontend isn't built yet
  app.get('/', (_req, res) => {
    const proxies = getAllProxies();
    const alive = proxies.filter((p) => p.alive).length;
    res.json({
      service: 'GlobeStream Proxy Gateway',
      version: '2.0.0',
      status: 'running',
      proxies: { total: proxies.length, alive },
      note: 'Frontend not built. Run: cd ../globestream && npm run build',
    });
  });
}

// ─── Start ───────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════════╗`);
  console.log(`║   GlobeStream v2.0.0                     ║`);
  console.log(`║   Frontend + Proxy API on port ${String(PORT).padEnd(10)}║`);
  console.log(`╚══════════════════════════════════════════╝\n`);

  startHealthChecker();
  startGeonodeFetcher();
});
