import originConfig from '@/config/origin.yml';

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

/**
 * Detect origin from URL using origin.yml configuration
 * Maps external URLs to their origin identifiers
 */
export function detectOriginFromUrl(url: string | null | undefined): string {
  if (!url) return 'uuki';

  const domain = extractDomain(url);
  if (!domain) return 'uuki';

  // Check each origin in config
  for (const [key, config] of Object.entries(originConfig as Record<string, { url: string }>)) {
    const originDomain = extractDomain(config.url);
    if (domain.includes(originDomain) || originDomain.includes(domain)) {
      return key;
    }
  }

  // Default to uuki for internal posts or unknown origins
  return 'uuki';
}
