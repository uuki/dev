import { WEBFONT_CONFIG } from './core/constants';
import './core/windowState'; // singleton — self-initializing
import { loadWebFonts } from './libs/WebfontLoader';
import { createDisableScroll } from './libs/DisableScroll';
import { setupAsciiEffect } from './features/ascii-effect';
import { setupBlockEffect } from './features/block-effect';
import { isOk } from './libs/result';
import { getUserAgent } from './utils/browser';
import type { DisableScrollHandle } from './libs/DisableScroll';
import type { AsciiEffectHandle } from './features/ascii-effect';
import type { BlockEffectHandle } from './features/block-effect';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AppFeatures = {
  disableScroll: DisableScrollHandle;
  asciiEffect: AsciiEffectHandle;
  blockEffect: BlockEffectHandle;
};

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

    // ASCII effect — applied to all [.js-ascii-effect] elements
    const aeResult = setupAsciiEffect('.js-ascii-effect');
    if (isOk(aeResult)) {
      this.features.asciiEffect = aeResult.value;
    } else if (import.meta.env.DEV) {
      console.warn('[App] AsciiEffect:', aeResult.error);
    }

    // Block effect — applied to all [.js-block-effect] elements
    const beResult = await setupBlockEffect('.js-block-effect');
    if (isOk(beResult)) {
      this.features.blockEffect = beResult.value;
    } else if (import.meta.env.DEV) {
      console.warn('[App] BlockEffect:', beResult.error);
    }
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
