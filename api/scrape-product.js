// Vercel serverless function for web scraping
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, userAgent, timeout = 15000, attempt = 1 } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Rate limiting check
    const domain = parsedUrl.hostname.toLowerCase().replace('www.', '');
    const rateLimitKey = `scrape_${domain}`;
    
    // Check if we're being rate limited (simple in-memory check)
    if (global.rateLimits && global.rateLimits[rateLimitKey]) {
      const lastRequest = global.rateLimits[rateLimitKey];
      if (Date.now() - lastRequest < 2000) { // 2 second rate limit
        return res.status(429).json({ 
          error: 'Rate limited', 
          retryAfter: 2000 - (Date.now() - lastRequest)
        });
      }
    }

    // Initialize rate limit tracking
    if (!global.rateLimits) {
      global.rateLimits = {};
    }
    global.rateLimits[rateLimitKey] = Date.now();

    // Set up request headers to mimic a real browser
    const headers = {
      'User-Agent': userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
    };

    // Add domain-specific headers
    if (domain.includes('amazon')) {
      headers['Accept-Language'] = 'en-US,en;q=0.9';
      headers['sec-ch-ua'] = '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
      headers['sec-ch-ua-mobile'] = '?0';
      headers['sec-ch-ua-platform'] = '"Windows"';
    } else if (domain.includes('ebay')) {
      headers['Accept-Language'] = 'en-US,en;q=0.9';
      headers['sec-ch-ua'] = '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
      headers['sec-ch-ua-mobile'] = '?0';
      headers['sec-ch-ua-platform'] = '"Windows"';
      headers['Referer'] = 'https://www.ebay.com/';
    }

    console.log(`Attempting to scrape: ${domain} (attempt ${attempt})`);

    // Make the request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
        follow: 5, // Allow up to 5 redirects
        compress: true
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`HTTP ${response.status} for ${domain}`);
        
        if (response.status === 403) {
          return res.status(403).json({ 
            error: 'Access blocked by website',
            blocked: true,
            status: response.status 
          });
        }
        
        if (response.status === 429) {
          return res.status(429).json({ 
            error: 'Rate limited by website',
            rateLimited: true,
            status: response.status 
          });
        }

        return res.status(response.status).json({ 
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status 
        });
      }

      const html = await response.text();
      
      // Basic validation that we got actual HTML content
      if (!html || html.length < 100) {
        return res.status(400).json({ 
          error: 'Invalid or empty response from website' 
        });
      }

      // Check for common anti-bot indicators
      const htmlLower = html.toLowerCase();
      if (htmlLower.includes('captcha') || 
          htmlLower.includes('verify you are human') ||
          htmlLower.includes('access denied') ||
          htmlLower.includes('blocked')) {
        return res.status(403).json({ 
          error: 'Request blocked by anti-bot protection',
          blocked: true 
        });
      }

      console.log(`Successfully scraped ${domain}: ${html.length} characters`);

      return res.status(200).json({ 
        html,
        length: html.length,
        domain,
        timestamp: Date.now(),
        attempt
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error(`Timeout scraping ${domain}`);
        return res.status(408).json({ 
          error: 'Request timeout',
          timeout: true 
        });
      }

      console.error(`Fetch error for ${domain}:`, fetchError.message);
      
      // Network errors
      if (fetchError.code === 'ENOTFOUND' || fetchError.code === 'ECONNREFUSED') {
        return res.status(503).json({ 
          error: 'Website unavailable',
          networkError: true 
        });
      }

      return res.status(500).json({ 
        error: 'Network error: ' + fetchError.message,
        networkError: true 
      });
    }

  } catch (error) {
    console.error('Scraping handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error: ' + error.message,
      timestamp: Date.now()
    });
  }
}

// Cleanup rate limits periodically
setInterval(() => {
  if (global.rateLimits) {
    const now = Date.now();
    Object.keys(global.rateLimits).forEach(key => {
      if (now - global.rateLimits[key] > 300000) { // 5 minutes
        delete global.rateLimits[key];
      }
    });
  }
}, 60000); // Clean up every minute