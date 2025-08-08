// Vercel serverless function for web scraping
// Path: /api/scrape-product.js
// Notes:
// - Uses the built-in global fetch on Vercel Node runtime, no node-fetch import
// - No setInterval, serverless-safe in-memory rate limiting
// - Strips forbidden or suspicious headers, adds site-specific hints safely

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

const RATE_LIMIT_WINDOW_MS = 2000; // 2 seconds per domain
const RATE_LIMIT_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL to purge stale entries
const MAX_HTML_MIN_LENGTH = 100;

// In-memory rate limit store. Lives across warm invocations only.
const rlStore = globalThis.__SCRAPER_RL__ || new Map();
globalThis.__SCRAPER_RL__ = rlStore;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, userAgent, timeout = 15000, attempt = 1 } = req.body || {};
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
      if (!/^https?:$/.test(parsedUrl.protocol)) {
        return res.status(400).json({ error: 'Only http and https URLs are allowed' });
      }
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const domain = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');

    // Serverless-safe rate limiting per domain
    purgeStaleRateLimits();
    const now = Date.now();
    const last = rlStore.get(domain) || 0;
    const elapsed = now - last;
    if (elapsed < RATE_LIMIT_WINDOW_MS) {
      return res.status(429).json({
        error: 'Rate limited',
        retryAfter: RATE_LIMIT_WINDOW_MS - elapsed,
      });
    }
    rlStore.set(domain, now);

    // Build headers. Do not set forbidden headers like Accept-Encoding.
    // Keep it realistic, but conservative.
    const headers = {
      'User-Agent':
        userAgent ||
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.8',
      // Connection headers are hop-by-hop and can be blocked, skip them
      // Do not send DNT, Sec-* unless truly needed
      'Upgrade-Insecure-Requests': '1',
      Referer: 'https://www.google.com/',
      // Some sites care about this casing, keep exact keys as shown
    };

    // Domain-specific hints
    if (domain.includes('amazon')) {
      headers['Accept-Language'] = 'en-US,en;q=0.9';
      headers['sec-ch-ua'] =
        '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
      headers['sec-ch-ua-mobile'] = '?0';
      headers['sec-ch-ua-platform'] = '"Windows"';
    } else if (domain.includes('ebay') || domain.includes('etsy')) {
      headers['Accept-Language'] = 'en-US,en;q=0.9';
      headers['sec-ch-ua'] =
        '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
      headers['sec-ch-ua-mobile'] = '?0';
      headers['sec-ch-ua-platform'] = '"Windows"';
    }

    // Timeout via AbortController
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), Math.max(1000, Number(timeout)));

    let response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
        redirect: 'follow', // default, included for clarity
      });
    } catch (err) {
      clearTimeout(tid);
      if (err?.name === 'AbortError') {
        return res.status(408).json({ error: 'Request timeout', timeout: true });
      }
      // DNS or network errors often have a code on Node
      if (err?.code === 'ENOTFOUND' || err?.code === 'ECONNREFUSED') {
        return res.status(503).json({ error: 'Website unavailable', networkError: true });
      }
      return res.status(500).json({ error: `Network error: ${err.message}`, networkError: true });
    }
    clearTimeout(tid);

    // Non-2xx handling
    if (!response.ok) {
      // Some sites return a 200 with a bot page, so status alone is not enough,
      // but still handle obvious blocks
      if (response.status === 403) {
        return res.status(403).json({
          error: 'Access blocked by website',
          blocked: true,
          status: response.status,
        });
      }
      if (response.status === 429) {
        return res.status(429).json({
          error: 'Rate limited by website',
          rateLimited: true,
          status: response.status,
        });
      }
      return res.status(response.status).json({
        error: `HTTP ${response.status}: ${response.statusText || 'Error'}`,
        status: response.status,
      });
    }

    const html = await response.text();

    // Basic validation
    if (!html || html.length < MAX_HTML_MIN_LENGTH) {
      return res.status(400).json({ error: 'Invalid or empty response from website' });
    }

    // Anti-bot markers
    const htmlLower = html.toLowerCase();
    const botMarkers = [
      'captcha',
      'verify you are human',
      'access denied',
      'request blocked',
      'pardon the interruption',
      'cloudflare',
      'attention required',
    ];
    if (botMarkers.some((m) => htmlLower.includes(m))) {
      return res.status(403).json({
        error: 'Request blocked by anti-bot protection',
        blocked: true,
      });
    }

    return res.status(200).json({
      html,
      length: html.length,
      domain,
      timestamp: Date.now(),
      attempt: Number(attempt) || 1,
    });
  } catch (error) {
    // Catch-all
    return res.status(500).json({
      error: `Internal server error: ${error.message}`,
      timestamp: Date.now(),
    });
  }
}

// Purge stale rate limit entries without setInterval
function purgeStaleRateLimits() {
  if (!rlStore?.size) return;
  const now = Date.now();
  for (const [key, ts] of rlStore.entries()) {
    if (now - ts > RATE_LIMIT_TTL_MS) {
      rlStore.delete(key);
    }
  }
}
