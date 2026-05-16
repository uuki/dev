import { WEBFONT_CONFIG, SELECTORS } from './core/constants';
import './core/windowState'; // singleton — self-initializing
import { loadWebFonts } from './libs/WebfontLoader';
import { createDisableScroll } from './libs/DisableScroll';
import { setupAsciiEffect } from './features/ascii-effect';
import { setupBlockEffect } from './features/block-effect';
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

    // document.addEventListener('pageswap', (e) => {
    //   const { viewTransition } = e as Event & { viewTransition: unknown };
    //   if (!viewTransition) return;
    //   // スナップショット撮影前に scroll を instant でリセット
    //   window.scrollTo({ top: 0, behavior: 'instant' });
    // });

    // Disable scroll — wired via PubSub (TOPIC_IDS.DISABLE_SCROLL_*)
    const dsResult = createDisableScroll();
    if (isOk(dsResult)) {
      this.features.disableScroll = dsResult.value;
    } else if (import.meta.env.DEV) {
      console.warn('[App] DisableScroll:', dsResult.error);
    }

    // ASCII effect
    const aeResult = setupAsciiEffect(SELECTORS.ASCII_EFFECT);
    if (isOk(aeResult)) {
      this.features.asciiEffect = aeResult.value;
    } else if (import.meta.env.DEV) {
      console.warn('[App] AsciiEffect:', aeResult.error);
    }

    // Block effect
    const beResult = await setupBlockEffect(SELECTORS.BLOCK_EFFECT);
    if (isOk(beResult)) {
      this.features.blockEffect = beResult.value;
    } else if (import.meta.env.DEV) {
      console.warn('[App] BlockEffect:', beResult.error);
    }

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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => void app.initialize());
} else {
  void app.initialize();
}

export default app;
