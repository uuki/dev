import * as cheerio from 'cheerio';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Fetch title from external URL
 * Extracts og:title meta tag or falls back to <title> tag
 */
export async function fetchTitleFromUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AstroBot/1.0)',
      },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Try og:title first (better for blog posts)
    const ogTitle = $('meta[property="og:title"]').attr('content');
    if (ogTitle) {
      return ogTitle.trim();
    }

    // Fallback to <title> tag
    const title = $('title').text();
    if (title) {
      return title.trim();
    }

    return null;
  } catch (error) {
    console.warn(`Error fetching title from ${url}:`, error);
    return null;
  }
}

/**
 * Persistent cache file path
 */
const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'titles.json');

/**
 * In-memory cache for fetched titles (within single build)
 */
const memoryCache = new Map<string, string>();

/**
 * Track last fetched domain and timestamp for rate limiting
 */
let lastFetchedDomain: string | null = null;
let lastFetchTime: number = 0;

/**
 * Delay in milliseconds between requests to the same domain
 */
const SAME_DOMAIN_DELAY_MS = 2000;

/**
 * Load title cache from file
 */
function loadCacheFromFile(): Record<string, string> {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const content = fs.readFileSync(CACHE_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn('[fetchTitle] Failed to load cache file:', error);
  }
  return {};
}

/**
 * Save title cache to file
 */
function saveCacheToFile(cache: Record<string, string>): void {
  try {
    // Ensure cache directory exists
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (error) {
    console.warn('[fetchTitle] Failed to save cache file:', error);
  }
}

/**
 * Return a cached title without any network fetch.
 * Returns null if the URL is not in either cache.
 */
export function getCachedTitle(url: string): string | null {
  if (memoryCache.has(url)) {
    return memoryCache.get(url) ?? null;
  }
  const fileCache = loadCacheFromFile();
  if (fileCache[url]) {
    memoryCache.set(url, fileCache[url]);
    return fileCache[url];
  }
  return null;
}

/**
 * Fetch title with persistent caching
 */
export async function fetchTitleWithCache(url: string): Promise<string | null> {
  // Check in-memory cache first
  if (memoryCache.has(url)) {
    return memoryCache.get(url) || null;
  }

  // Load persistent cache
  const fileCache = loadCacheFromFile();

  // Check file cache
  if (fileCache[url]) {
    console.log(`[fetchTitle] Using cached title for: ${url}`);
    memoryCache.set(url, fileCache[url]);
    return fileCache[url];
  }

  // Extract domain for rate limiting
  let currentDomain: string;
  try {
    const urlObj = new URL(url);
    currentDomain = urlObj.hostname;
  } catch {
    currentDomain = '';
  }

  // Rate limiting: sleep if fetching from same domain consecutively
  if (currentDomain && currentDomain === lastFetchedDomain) {
    const timeSinceLastFetch = Date.now() - lastFetchTime;
    if (timeSinceLastFetch < SAME_DOMAIN_DELAY_MS) {
      const sleepTime = SAME_DOMAIN_DELAY_MS - timeSinceLastFetch;
      console.log(`[fetchTitle] Rate limiting: sleeping ${sleepTime}ms for domain ${currentDomain}`);
      await new Promise(resolve => setTimeout(resolve, sleepTime));
    }
  }

  // Fetch from URL
  console.log(`[fetchTitle] Fetching from URL: ${url}`);
  lastFetchedDomain = currentDomain;
  lastFetchTime = Date.now();

  const title = await fetchTitleFromUrl(url);

  if (title) {
    console.log(`[fetchTitle] Successfully fetched: ${title}`);
    // Save to both caches
    memoryCache.set(url, title);
    fileCache[url] = title;
    saveCacheToFile(fileCache);
    console.log(`[fetchTitle] Saved to cache file: ${CACHE_FILE}`);
  } else {
    console.warn(`[fetchTitle] Failed to fetch title from: ${url}`);
  }

  return title;
}
