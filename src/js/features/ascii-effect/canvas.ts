import { ok, err, type Result } from '@/js/libs/result';
import type { EffectState, MaskData, AsciiOptions } from './types';

// ---------------------------------------------------------------------------
// Build an overlay canvas positioned absolutely over the element
// ---------------------------------------------------------------------------

type CanvasContext = {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
};

const createOverlayCanvas = (
  element: HTMLElement,
  maskData: MaskData,
  charset: string
): Result<CanvasContext> => {
  const canvas = document.createElement('canvas');
  canvas.width = maskData.canvasW;
  canvas.height = maskData.canvasH;

  Object.assign(canvas.style, {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    display: 'block',
  } satisfies Partial<CSSStyleDeclaration>);

  canvas.dataset['charset'] = charset;

  const computed = getComputedStyle(element);
  if (computed.position === 'static') {
    element.style.position = 'relative';
  }

  element.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return err('Could not get 2d context for overlay canvas');
  }

  return ok({ canvas, ctx });
};

// ---------------------------------------------------------------------------
// Build full EffectState
// ---------------------------------------------------------------------------

export const createEffectState = (
  element: HTMLElement,
  maskData: MaskData,
  options: AsciiOptions,
  resolvedAsciiSize: number,
): Result<EffectState> => {
  const canvasResult = createOverlayCanvas(element, maskData, options.charset);
  if (canvasResult._tag === 'Err') return canvasResult;

  const { canvas, ctx } = canvasResult.value;
  const initialOpacity = options.reverse ? 1 : 0;

  return ok({
    canvas,
    ctx,
    maskData,
    options,
    resolvedAsciiSize,
    tick: 0,
    rafId: 0,
    opacity: initialOpacity,
    targetOpacity: initialOpacity,
  });
};

// ---------------------------------------------------------------------------
// Teardown
// ---------------------------------------------------------------------------

export const destroyEffectState = (state: EffectState): void => {
  cancelAnimationFrame(state.rafId);
  state.canvas.remove();
};
