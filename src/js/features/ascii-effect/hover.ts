import { startLoop, stopLoop } from './loop';
import type { EffectState } from './types';

// ---------------------------------------------------------------------------
// Hover behaviour is fully decoupled from rendering.
// It only sets targetOpacity and starts/stops the loop.
//
// normal mode  (reverse: false):
//   rest  → opacity target 0  (canvas invisible, device text visible)
//   hover → opacity target 1  (ASCII fades in over device text)
//
// reverse mode (reverse: true):
//   rest  → opacity target 1  (ASCII covers device text)
//   hover → opacity target 0  (ASCII fades out, device text revealed)
// ---------------------------------------------------------------------------

type HoverHandlers = {
  readonly onEnter: () => void;
  readonly onLeave: () => void;
};

const buildHandlers = (state: EffectState): HoverHandlers => {
  const { reverse } = state.options;

  return {
    onEnter: (): void => {
      state.targetOpacity = reverse ? 0 : 1;
      startLoop(state);
    },
    onLeave: (): void => {
      state.targetOpacity = reverse ? 1 : 0;
    },
  };
};

// ---------------------------------------------------------------------------
// Attach / detach hover listeners — returns cleanup function
// ---------------------------------------------------------------------------

export const attachHover = (
  element: HTMLElement,
  state: EffectState
): (() => void) => {
  const { onEnter, onLeave } = buildHandlers(state);

  element.addEventListener('mouseenter', onEnter);
  element.addEventListener('mouseleave', onLeave);

  if (state.options.reverse) {
    startLoop(state);
  }

  return (): void => {
    element.removeEventListener('mouseenter', onEnter);
    element.removeEventListener('mouseleave', onLeave);
    stopLoop(state);
  };
};
