import { renderFrame } from './renderer';
import type { EffectState } from './types';

// ---------------------------------------------------------------------------
// Start / stop the rAF loop.
// Mutates only state.rafId — all rendering side-effects isolated in renderer.
// ---------------------------------------------------------------------------

export const startLoop = (state: EffectState): void => {
  if (state.rafId !== 0) return;

  const loop = (): void => {
    renderFrame(state);
    state.rafId = requestAnimationFrame(loop);
  };

  state.rafId = requestAnimationFrame(loop);
};

export const stopLoop = (state: EffectState): void => {
  cancelAnimationFrame(state.rafId);
  state.rafId = 0;
};
