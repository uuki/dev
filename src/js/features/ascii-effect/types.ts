// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export type Effect = "glow" | "rain" | "wave" | "ember";

export type AsciiOptions = {
  /**
   * ASCII character font size.
   * number  → fixed px value
   * string  → any CSS font-size expression resolved against the host element
   *           e.g. '1vw', 'clamp(6px, 1vw, 12px)', 'var(--fs-ascii)'
   */
  readonly asciiSize: number | string;
  /** px — the logical size used to rasterize the source text for the mask */
  readonly logoSize: number;
  /** number of ASCII particles to place */
  readonly density: number;
  /** visual effect mode */
  readonly effect: Effect;
  /** characters to sample from */
  readonly charset: string;
  /**
   * reverse mode:
   *   false (default) — element shows device text normally;
   *                     hover → ASCII animation fades in over it
   *   true            — element text is hidden behind ASCII animation;
   *                     hover → ASCII fades out, revealing device text
   */
  readonly reverse: boolean;
};

export const DEFAULT_OPTIONS: AsciiOptions = {
  asciiSize: 8,
  logoSize: 60,
  density: 60,
  effect: "glow",
  charset: ".,:;-=+*#%@",
  reverse: false,
};

// ---------------------------------------------------------------------------
// Internal domain types
// ---------------------------------------------------------------------------

export type Particle = {
  readonly x: number;
  readonly y: number;
  readonly brightness: number;
  char: string; // mutable — randomised periodically
  readonly spatialPhase: number;
  readonly jitter: number;
  readonly speed: number;
};

export type MaskData = {
  readonly particles: ReadonlyArray<Particle>;
  readonly canvasW: number;
  readonly canvasH: number;
};

export type EffectState = {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  maskData: MaskData;           // mutable — rebuilt on resize
  readonly options: AsciiOptions;
  resolvedAsciiSize: number;    // mutable — px value resolved from options.asciiSize
  tick: number;                 // mutable — incremented each frame
  rafId: number;                // mutable — current rAF handle
  opacity: number;              // mutable — 0..1 for fade in/out
  targetOpacity: number;        // mutable
};

export type ElementBinding = {
  readonly element: HTMLElement;
  readonly state: EffectState;
  readonly cleanup: () => void;
};
