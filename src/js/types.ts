import type { DisableScrollHandle } from './libs/DisableScroll';
import type { AsciiEffectHandle } from './features/ascii-effect';
import type { BlockEffectHandle } from './features/block-effect';

export type AppFeatures = {
  disableScroll: DisableScrollHandle;
  asciiEffect: AsciiEffectHandle;
  blockEffect: BlockEffectHandle;
};
