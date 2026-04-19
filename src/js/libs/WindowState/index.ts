import { type Result, ok, err } from '../result';
import type {
  WindowStateOptions,
  WindowStateData,
  WindowStateHandle,
  BreakpointConfig,
  BreakpointMatch,
  ScrollbarMetrics,
} from './types';

export type { WindowStateOptions, WindowStateData, WindowStateHandle, BreakpointConfig, BreakpointMatch };

// ---------------------------------------------------------------------------
// Pure: dimension reading
// ---------------------------------------------------------------------------

type TargetType = 'window' | 'element';

function readDimension(
  target: Window | HTMLElement,
  targetType: TargetType,
  prop: 'width' | 'height' | 'scrollX' | 'scrollY',
): number {
  if (targetType === 'window') {
    const w = target as Window;
    const map = { width: w.innerWidth, height: w.innerHeight, scrollX: w.scrollX, scrollY: w.scrollY };
    return map[prop];
  }
  const el = target as HTMLElement;
  const map = { width: el.offsetWidth, height: el.offsetHeight, scrollX: el.scrollLeft, scrollY: el.scrollTop };
  return map[prop];
}

// ---------------------------------------------------------------------------
// Pure: scrollbars
// ---------------------------------------------------------------------------

function computeScrollbars(targetWidth: number, targetHeight: number): ScrollbarMetrics {
  const yWidth = document.body ? targetWidth - document.body.clientWidth : 0;
  const xWidth = targetHeight - document.documentElement.clientHeight;
  return {
    x: {
      width: xWidth,
      max: document.body
        ? document.documentElement.scrollWidth - targetWidth - yWidth
        : 0,
    },
    y: {
      width: yWidth,
      max: document.body
        ? document.documentElement.scrollHeight - targetHeight - xWidth
        : 0,
    },
  };
}

// ---------------------------------------------------------------------------
// Pure: breakpoints
// ---------------------------------------------------------------------------

function matchBreakpoints(configs: BreakpointConfig[]): BreakpointMatch[] {
  return configs.map(({ id, query }) => ({ id, matches: window.matchMedia(query).matches }));
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

const DEFAULTS: Omit<WindowStateOptions, 'target'> = {
  breakpoints: [],
  on: {},
  classes: { scrollDisable: 'is-disable-scroll' },
};

export function createWindowState(
  userOptions: Partial<WindowStateOptions> = {},
): Result<WindowStateHandle, string> {
  if (typeof window === 'undefined' || !document.body) {
    return err('WindowState requires a browser environment with DOM ready');
  }

  const options: WindowStateOptions = {
    target: window,
    ...DEFAULTS,
    ...userOptions,
    on: { ...DEFAULTS.on, ...userOptions.on },
    classes: { ...DEFAULTS.classes, ...userOptions.classes },
  };

  const targetType: TargetType = options.target instanceof Window ? 'window' : 'element';
  const read = (prop: 'width' | 'height' | 'scrollX' | 'scrollY') =>
    readDimension(options.target, targetType, prop);

  const width = read('width');
  const height = read('height');
  const breakpoints = matchBreakpoints(options.breakpoints);

  const data: WindowStateData = {
    width,
    height,
    scrollX: read('scrollX'),
    scrollY: read('scrollY'),
    scrollbars: computeScrollbars(width, height),
    breakpoints,
    current: breakpoints.find((bp) => bp.matches) ?? null,
    lastScroll: { directionX: null, directionY: null },
    browser: options.uaParser
      ? new options.uaParser(navigator.userAgent).getResult()
      : null,
    device: {
      isTouch:
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer:coarse)').matches,
    },
    phase: 'ready',
  };

  // --- Event handlers (closures over mutable `data`) ---

  function onLoad() {
    options.on.load?.(data);
  }

  function onScroll() {
    const prevX = data.scrollX;
    const prevY = data.scrollY;
    const currX = read('scrollX');
    const currY = read('scrollY');

    data.lastScroll = {
      directionX: currX !== prevX ? (currX > prevX ? 'right' : 'left') : null,
      directionY: currY !== prevY ? (currY > prevY ? 'down' : 'up') : null,
    };
    data.scrollX = currX;
    data.scrollY = currY;
    data.scrollbars = computeScrollbars(data.width, data.height);

    options.on.scroll?.(data);
  }

  function onResize() {
    const prevBreakpoint = data.current;

    data.width = read('width');
    data.height = read('height');
    data.scrollbars = computeScrollbars(data.width, data.height);
    data.breakpoints = matchBreakpoints(options.breakpoints);
    data.current = data.breakpoints.find((bp) => bp.matches) ?? null;

    options.on.resize?.(data);

    if (prevBreakpoint?.id !== data.current?.id) {
      options.on.changeBreakpoint?.(data);
    }
  }

  window.addEventListener('load', onLoad);
  options.target.addEventListener('scroll', onScroll, { passive: true });
  options.target.addEventListener('resize', onResize, { passive: true });

  data.phase = 'live';

  return ok({
    get state() {
      return data;
    },
    get breakpoint() {
      return data.breakpoints.find((bp) => bp.matches) ?? null;
    },
    scrollDisable() {
      document.body.style.paddingRight = `${data.scrollbars.y.width}px`;
      document.documentElement.classList.add(options.classes.scrollDisable);
    },
    scrollRelease() {
      document.documentElement.classList.remove(options.classes.scrollDisable);
      document.body.style.paddingRight = '';
    },
    destroy() {
      window.removeEventListener('load', onLoad);
      options.target.removeEventListener('scroll', onScroll);
      options.target.removeEventListener('resize', onResize);
    },
  });
}
