import { WEBFONT_CONFIG, SELECTORS } from './core/constants';
import './core/windowState'; // singleton — self-initializing
import { loadWebFonts } from './libs/WebfontLoader';
import { createDisableScroll } from './libs/DisableScroll';
import { PopoverSupport } from './features/menu';

import { isOk } from './libs/result';
import { getUserAgent } from './utils/browser';
import type { AppFeatures } from './types';

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

class App {
  readonly features: Partial<AppFeatures> = {};

  async initialize(): Promise<void> {
    // UA attribute on <html> for browser-specific CSS hooks
    const ua = getUserAgent();
    if (ua.browser.name) {
      document.documentElement.setAttribute('data-browser', ua.browser.name);
    }

    // Webfonts
    const fontsResult = await loadWebFonts(WEBFONT_CONFIG);
    if (!isOk(fontsResult) && import.meta.env.DEV) {
      console.warn('[App] WebfontLoader:', fontsResult.error);
    }

    // Disable scroll — wired via PubSub (TOPIC_IDS.DISABLE_SCROLL_*)
    const dsResult = createDisableScroll();
    if (isOk(dsResult)) {
      this.features.disableScroll = dsResult.value;
    } else if (import.meta.env.DEV) {
      console.warn('[App] DisableScroll:', dsResult.error);
    }

    // Popover support
    new PopoverSupport();
  }

  destroy(): void {
    this.features.disableScroll?.destroy();
    this.features.asciiEffect?.destroy();
    this.features.blockEffect?.destroy();
  }
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

const app = new App();

const vt = (window as Window & { __pageRevealVT?: ViewTransition | null }).__pageRevealVT ?? null;
if (vt) {
  void vt.finished
    .then(() => app.initialize())
    .catch(() => app.initialize());
} else {
  void app.initialize();
}

export default app;
