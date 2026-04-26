import PubSub from 'pubsub-js';
import { createWindowState } from '@/js/libs/WindowState';
import { isOk } from '@/js/libs/result';
import { BREAKPOINTS, TOPIC_IDS } from '@/js/core/constants';
import type { WindowStateHandle, WindowStateData } from '@/js/libs/WindowState';

class WindowStateSingleton {
  private _handle: WindowStateHandle | null = null;

  constructor() {
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  get state(): WindowStateData | undefined {
    return this._handle?.state;
  }

  get handle(): WindowStateHandle | null {
    return this._handle;
  }

  private initialize(): void {
    const result = createWindowState({
      target: window,
      breakpoints: [...BREAKPOINTS],
      on: {
        scroll: (state) => {
          const max = state.scrollbars.y.max;
          document.documentElement.style.setProperty(
            '--scroll-y',
            max > 0 ? (state.scrollY / max).toFixed(4) : '0',
          );
        },
        changeBreakpoint: (state) => {
          PubSub.publish(TOPIC_IDS.WINDOW_CHANGE_BREAKPOINT, state);
        },
      },
    });

    if (isOk(result)) {
      this._handle = result.value;
    } else if (import.meta.env.DEV) {
      console.warn('[WindowState]', result.error);
    }
  }
}

export const windowState = new WindowStateSingleton();
