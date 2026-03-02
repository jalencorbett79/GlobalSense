/**
 * Proxy Health Checker
 *
 * On startup and every 5 minutes, pings every proxy to check
 * if it's alive and measures real latency.
 */

import http from 'node:http';
import { getAllProxies, updateProxy } from './proxies.js';

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const TIMEOUT_MS = 10_000;

/**
 * Check a single proxy by making an HTTP request through it to httpbin.org/ip.
 */
function checkProxy(proxy) {
  return new Promise((resolve) => {
    const start = Date.now();

    const req = http.request(
      {
        host: proxy.host,
        port: proxy.port,
        method: 'GET',
        path: 'http://httpbin.org/ip',
        headers: {
          Host: 'httpbin.org',
          'User-Agent': 'GlobeStream-Health/2.0',
        },
        timeout: TIMEOUT_MS,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          const latency = Date.now() - start;
          if (res.statusCode >= 200 && res.statusCode < 400) {
            updateProxy(proxy.id, { alive: true, latency, lastChecked: Date.now() });
            console.log(`  ✓ ${proxy.id} (${proxy.host}:${proxy.port}) — ${latency}ms`);
          } else {
            updateProxy(proxy.id, { alive: false, latency: 0, lastChecked: Date.now() });
            console.log(`  ✗ ${proxy.id} (${proxy.host}:${proxy.port}) — HTTP ${res.statusCode}`);
          }
          resolve();
        });
      },
    );

    req.on('error', (err) => {
      updateProxy(proxy.id, { alive: false, latency: 0, lastChecked: Date.now() });
      console.log(`  ✗ ${proxy.id} (${proxy.host}:${proxy.port}) — ${err.message}`);
      resolve();
    });

    req.on('timeout', () => {
      req.destroy();
      updateProxy(proxy.id, { alive: false, latency: 0, lastChecked: Date.now() });
      console.log(`  ✗ ${proxy.id} (${proxy.host}:${proxy.port}) — timeout`);
      resolve();
    });

    req.end();
  });
}

/**
 * Run health check on all proxies (5 at a time).
 */
export async function runHealthCheck() {
  const proxies = getAllProxies();
  console.log(`\n[Health] Checking ${proxies.length} proxies...`);

  for (let i = 0; i < proxies.length; i += 5) {
    const batch = proxies.slice(i, i + 5);
    await Promise.allSettled(batch.map(checkProxy));
  }

  const alive = proxies.filter((p) => p.alive).length;
  console.log(`[Health] Done. ${alive}/${proxies.length} alive.\n`);
}

/**
 * Start periodic health checking.
 */
export function startHealthChecker() {
  runHealthCheck();
  setInterval(runHealthCheck, CHECK_INTERVAL_MS);
}
