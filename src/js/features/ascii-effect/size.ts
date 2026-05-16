// ---------------------------------------------------------------------------
// Resolve asciiSize (number | string) to a concrete px value.
// A temporary probe element is appended to the host so that viewport units,
// CSS custom properties, and clamp() are evaluated in the correct context.
// ---------------------------------------------------------------------------

const FALLBACK_PX = 8;

export const resolveAsciiSize = (
  value: number | string,
  container: HTMLElement,
): number => {
  if (typeof value === 'number') return value;

  const probe = document.createElement('div');
  probe.style.cssText =
    'position:absolute;visibility:hidden;pointer-events:none;' +
    `font-size:${value}`;
  container.appendChild(probe);
  const resolved = parseFloat(getComputedStyle(probe).fontSize);
  probe.remove();

  return Number.isFinite(resolved) && resolved > 0 ? resolved : FALLBACK_PX;
};
