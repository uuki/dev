import WebFont from 'webfontloader';
import { type Result, ok, err } from '../result';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WebFontConfig = {
  custom?: {
    families?: string[];
    urls?: string[];
  };
  google?: {
    families?: string[];
  };
  timeout?: number;
  onActive?: () => void;
  onInactive?: () => void;
};

// ---------------------------------------------------------------------------
// Pure: guard
// ---------------------------------------------------------------------------

function hasTargets(config: WebFontConfig): boolean {
  return (
    (config.custom?.families?.length ?? 0) > 0 ||
    (config.custom?.urls?.length ?? 0) > 0 ||
    (config.google?.families?.length ?? 0) > 0
  );
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export function loadWebFonts(config: WebFontConfig): Promise<Result<void, string>> {
  if (!hasTargets(config)) {
    return Promise.resolve(ok(undefined));
  }

  if (typeof document === 'undefined') {
    return Promise.resolve(err('loadWebFonts requires a browser environment'));
  }

  const { timeout = 5000, onActive, onInactive } = config;

  return new Promise<Result<void, string>>((resolve) => {
    try {
      WebFont.load({
        timeout,
        ...(config.custom && { custom: config.custom }),
        ...(config.google && { google: config.google }),
        active() {
          onActive?.();
          resolve(ok(undefined));
        },
        inactive() {
          onInactive?.();
          resolve(err('font loading failed or timed out'));
        },
      });
    } catch (e) {
      resolve(err(e instanceof Error ? e.message : 'WebFont.load failed'));
    }
  });
}
