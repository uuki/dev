export const supportsViewTimeline = (): boolean =>
  CSS.supports('view-timeline-name', '--x');

export const supportsCornerShape = (): boolean =>
  CSS.supports('corner-shape', 'bevel');

export const supportsProgressBar = (): boolean =>
  CSS.supports('selector(::-webkit-progress-bar)') ||
  CSS.supports('selector(::-moz-progress-bar)');

export const hasUnsupportedFeatures = (): boolean =>
  !supportsViewTimeline() || !supportsCornerShape() || !supportsProgressBar();
