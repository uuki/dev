export const supportsViewTimeline = (): boolean =>
  CSS.supports('view-timeline-name', '--x');

export const supportsCornerShape = (): boolean =>
  CSS.supports('corner-shape', 'bevel');

export const hasUnsupportedFeatures = (): boolean =>
  !supportsViewTimeline() || !supportsCornerShape();
