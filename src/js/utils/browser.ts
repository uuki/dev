import UAParser from 'ua-parser-js';

// ---------------------------------------------------------------------------
// User Agent
// ---------------------------------------------------------------------------

let _parsed: UAParser.IResult | null = null;

export function getUserAgent(): UAParser.IResult {
  return (_parsed ??= new UAParser(navigator.userAgent).getResult());
}

// ---------------------------------------------------------------------------
// Clipboard
// ---------------------------------------------------------------------------

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error: copy to clipboard', error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Cookie
// ---------------------------------------------------------------------------

export type CookieOptions = {
  name?: string;
  expire_hour?: number;
  value?: string | number;
  same_site?: 'lax' | 'strict' | 'none';
  path?: string;
};

export function setCookie(options: CookieOptions): void {
  const { name = '', expire_hour = 24 * 7, value = 1, same_site = 'lax', path = '/' } = options;
  const expire = new Date();
  expire.setTime(expire.getTime() + 1000 * 3600 * expire_hour);
  const samesite = same_site === 'none' ? 'none; Secure' : same_site;
  const secure = window.isSecureContext ? '; Secure' : '';
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(String(value))}; expires=${expire.toUTCString()}; SameSite=${samesite}${secure}; path=${path};`;
}

export function getCookie(name: string): string | null {
  const encodedName = encodeURIComponent(name);
  const entry = document.cookie.split('; ').find((c) => c.startsWith(`${encodedName}=`));
  if (!entry) return null;
  return decodeURIComponent(entry.slice(encodedName.length + 1));
}
