// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export type ScrollBar = {
  readonly width: number;
  readonly max: number;
};

export type ScrollbarMetrics = {
  readonly x: ScrollBar;
  readonly y: ScrollBar;
};

export type BreakpointConfig = {
  readonly id: string;
  readonly query: string;
};

export type BreakpointMatch = {
  readonly id: string;
  readonly matches: boolean;
};

// ---------------------------------------------------------------------------
// UA Parser (ua-parser-js v1 result shape)
// ---------------------------------------------------------------------------

export type UAParserResult = {
  ua: string;
  browser: { name?: string; version?: string; major?: string };
  engine: { name?: string; version?: string };
  os: { name?: string; version?: string };
  device: { vendor?: string; model?: string; type?: string };
  cpu: { architecture?: string };
};

export type UAParserConstructor = new (ua: string) => { getResult(): UAParserResult };

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export type WindowStateData = {
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
  scrollbars: ScrollbarMetrics;
  breakpoints: BreakpointMatch[];
  current: BreakpointMatch | null;
  lastScroll: {
    directionX: 'left' | 'right' | null;
    directionY: 'up' | 'down' | null;
  };
  browser: UAParserResult | null;
  device: { isTouch: boolean };
  phase: 'ready' | 'live';
};

export type StateCallback = (state: WindowStateData) => void;

// ---------------------------------------------------------------------------
// Options & Handle
// ---------------------------------------------------------------------------

export type WindowStateOptions = {
  target: Window | HTMLElement;
  breakpoints: BreakpointConfig[];
  on: {
    load?: StateCallback;
    scroll?: StateCallback;
    resize?: StateCallback;
    changeBreakpoint?: StateCallback;
  };
  classes: {
    scrollDisable: string;
  };
  uaParser?: UAParserConstructor;
};

export type WindowStateHandle = {
  readonly state: WindowStateData;
  readonly breakpoint: BreakpointMatch | null;
  scrollDisable(): void;
  scrollRelease(): void;
  destroy(): void;
};
