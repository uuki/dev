export interface BlockEffectOptions {
  /** Block size in CSS px. Controls grid resolution. (default: 40) */
  blockSize?: number;
  /** Gap ratio between blocks, 0–1. (default: 0.04) */
  gap?: number;
  /** Block depth = blockSize × depthRatio in world units. (default: 0.9) */
  depthRatio?: number;
  /** Mouse influence radius as a fraction of element width. (default: 0.22) */
  hoverRadius?: number;
  /** Max Z push as a fraction of camera distance. (default: 0.55) */
  pushStrength?: number;
  /** Idle wave speed multiplier. (default: 0.9) */
  waveSpeed?: number;
  /** Idle wave amplitude as a fraction of cell height. (default: 0.4) */
  waveAmplitude?: number;
  /** Z lerp factor per frame. (default: 0.13) */
  lerpFactor?: number;
  /** Explicit texture source. Falls back to auto-detection (img/background-image). */
  source?: HTMLImageElement | HTMLCanvasElement | string;
  /** Block opacity 0–1. When < 1, blocks become transparent and texture is skipped. (default: 1) */
  opacity?: number;
  /** Block color in transparent mode (default: 0xffffff) */
  blockColor?: number;
}

export interface BlockEffectHandle {
  destroy(): void;
}
