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
    const updateScrollY = (scrollY: number, max: number) => {
      document.documentElement.style.setProperty('--scroll-y', max > 0 ? (scrollY / max).toFixed(4) : '0');
    };

    const result = createWindowState({
      target: window,
      breakpoints: [...BREAKPOINTS],
      on: {
        load: (state) => {
          updateScrollY(state.scrollY, state.scrollbars.y.max);
        },
        scroll: (state) => {
          updateScrollY(state.scrollY, state.scrollbars.y.max);
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
