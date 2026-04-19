import type { BreakpointConfig } from '@/js/libs/WindowState';
import type { WebFontConfig } from '@/js/libs/WebfontLoader';

export const TOPIC_IDS = {
  DISABLE_SCROLL_DISABLE:    'disableScroll/disable',
  DISABLE_SCROLL_RELEASE:    'disableScroll/release',
  WINDOW_CHANGE_BREAKPOINT:  'windowState/changeBreakpoint',
} as const;

export const MEDIA_QUERIES = {
  MOBILE:  '(width <= 1365px)',
  DESKTOP: '(width >= 1366px)',
} as const;

export const BREAKPOINTS = [
  { id: 'mobile',  query: MEDIA_QUERIES.MOBILE },
  { id: 'desktop', query: MEDIA_QUERIES.DESKTOP },
] as const satisfies readonly BreakpointConfig[];

export const WEBFONT_CONFIG = {
  google: {
    families: ['Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900'],
  },
} as const satisfies WebFontConfig;
