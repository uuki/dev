import { buildMask } from './mask';
import { resolveAsciiSize } from './size';
import type { EffectState } from './types';

// ---------------------------------------------------------------------------
// Debounce — avoids rebuilding the mask on every intermediate resize event
// ---------------------------------------------------------------------------

const debounce = (fn: () => void, ms: number): (() => void) => {
  let id: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(id);
    id = setTimeout(fn, ms);
  };
};

// ---------------------------------------------------------------------------
// Attach a resize listener that rebuilds the mask when asciiSize changes.
// Returns a no-op cleanup if asciiSize is a fixed number (no listener needed).
// ---------------------------------------------------------------------------

export const attachResize = (
  element: HTMLElement,
  state: EffectState,
  text: string,
): (() => void) => {
  const rawSize = state.options.asciiSize;

  if (typeof rawSize === 'number') return () => {};

  const onResize = debounce(() => {
    const newSize = resolveAsciiSize(rawSize, element);
    if (newSize === state.resolvedAsciiSize) return;

    const result = buildMask(text, {
      asciiSize: newSize,
      logoSize: state.options.logoSize,
      density: state.options.density,
      charset: state.options.charset,
    });
    if (result._tag === 'Err') return;

    state.resolvedAsciiSize = newSize;
    state.maskData = result.value;
    state.canvas.width = result.value.canvasW;
    state.canvas.height = result.value.canvasH;
  }, 150);

  window.addEventListener('resize', onResize);
  return () => window.removeEventListener('resize', onResize);
};
