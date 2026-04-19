import PubSub from 'pubsub-js';
import { TOPIC_IDS } from '@/js/core/constants';
import { getUserAgent } from '@/js/utils/browser';
import { type Result, ok, err } from '../result';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DisableScrollOptions = {
  onError?: (error: string, operation: 'disable' | 'release') => void;
};

export type DisableScrollHandle = {
  disable(): Result<void, string>;
  release(): Result<void, string>;
  destroy(): void;
};

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function measureScrollBarWidth(): number {
  return window.innerWidth - document.documentElement.clientWidth;
}

function isMobileSafari(): boolean {
  return getUserAgent().browser.name === 'Mobile Safari';
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createDisableScroll(
  options: DisableScrollOptions = {},
): Result<DisableScrollHandle, string> {
  if (typeof window === 'undefined' || !document.body) {
    return err('DisableScroll requires a browser environment');
  }

  const scrollBarWidth = measureScrollBarWidth();
  const mobileSafari = isMobileSafari();
  let lastOffsetTop = 0;

  function disable(): Result<void, string> {
    try {
      lastOffsetTop = window.scrollY;
      document.body.style.paddingRight = `${scrollBarWidth}px`;
      document.body.style.overflow = 'hidden';
      if (mobileSafari) {
        document.body.style.top = `-${lastOffsetTop}px`;
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      }
      return ok(undefined);
    } catch (e) {
      return err(e instanceof Error ? e.message : 'disable scroll failed');
    }
  }

  function release(): Result<void, string> {
    try {
      if (mobileSafari) {
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
      }
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      window.scrollTo(0, lastOffsetTop);
      lastOffsetTop = 0;
      return ok(undefined);
    } catch (e) {
      return err(e instanceof Error ? e.message : 'release scroll failed');
    }
  }

  const { onError } = options;

  const tokenDisable = PubSub.subscribe(TOPIC_IDS.DISABLE_SCROLL_DISABLE, () => {
    const result = disable();
    if (result._tag === 'Err') onError?.(result.error, 'disable');
  });

  const tokenRelease = PubSub.subscribe(TOPIC_IDS.DISABLE_SCROLL_RELEASE, () => {
    const result = release();
    if (result._tag === 'Err') onError?.(result.error, 'release');
  });

  return ok({
    disable,
    release,
    destroy() {
      PubSub.unsubscribe(tokenDisable);
      PubSub.unsubscribe(tokenRelease);
    },
  });
}
