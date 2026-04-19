import { ok, err, isOk } from '@/js/libs/result';
import type { Result } from '@/js/libs/result';
import { DEFAULT_OPTIONS } from './types';
import type { AsciiOptions, ElementBinding } from './types';
import { buildMask } from './mask';
import { createEffectState, destroyEffectState } from './canvas';
import { attachHover } from './hover';
import { attachResize } from './resize';
import { resolveAsciiSize } from './size';

// ---------------------------------------------------------------------------
// Resolve text from an element
// Priority: data-ascii-text attribute → textContent
// ---------------------------------------------------------------------------

const resolveText = (element: HTMLElement): Result<string> => {
  const override = element.dataset['asciiText'];
  if (override && override.trim().length > 0) return ok(override.trim());

  const text = element.textContent?.trim() ?? '';
  if (text.length === 0) return err(`Element has no text content: ${element.tagName}`);

  return ok(text);
};

// ---------------------------------------------------------------------------
// Bind a single element
// Full ROP pipeline: text → mask → canvas → hover
// ---------------------------------------------------------------------------

export const bindElement = (
  element: HTMLElement,
  options: AsciiOptions
): Result<ElementBinding> => {
  const textResult = resolveText(element);
  if (textResult._tag === 'Err') return textResult;

  const resolvedSize = resolveAsciiSize(options.asciiSize, element);

  const maskResult = buildMask(textResult.value, {
    asciiSize: resolvedSize,
    logoSize: options.logoSize,
    density: options.density,
    charset: options.charset,
  });
  if (maskResult._tag === 'Err') return maskResult;

  const stateResult = createEffectState(element, maskResult.value, options, resolvedSize);
  if (stateResult._tag === 'Err') return stateResult;

  const state = stateResult.value;
  const cleanupHover = attachHover(element, state);
  const cleanupResize = attachResize(element, state, textResult.value);

  return ok<ElementBinding>({
    element,
    state,
    cleanup: () => {
      cleanupHover();
      cleanupResize();
      destroyEffectState(state);
    },
  });
};

// ---------------------------------------------------------------------------
// Feature handle
// ---------------------------------------------------------------------------

export type AsciiEffectHandle = {
  readonly bindings: ReadonlyArray<ElementBinding>;
  readonly errors: ReadonlyArray<{ element: HTMLElement; error: string }>;
  readonly destroy: () => void;
};

// ---------------------------------------------------------------------------
// Setup — query selector, iterate, bind each element
// Returns ok even when some elements fail (partial success).
// Returns err only when no elements are found at all.
// ---------------------------------------------------------------------------

export const setupAsciiEffect = (
  selector: string,
  partialOptions: Partial<AsciiOptions> = {}
): Result<AsciiEffectHandle> => {
  const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));

  if (elements.length === 0) {
    return err(`No elements matched selector: "${selector}"`);
  }

  const options: AsciiOptions = { ...DEFAULT_OPTIONS, ...partialOptions };
  const bindings: ElementBinding[] = [];
  const errors: Array<{ element: HTMLElement; error: string }> = [];

  for (const element of elements) {
    const result = bindElement(element, options);
    if (isOk(result)) {
      bindings.push(result.value);
    } else {
      errors.push({ element, error: result.error });
      if (import.meta.env.DEV) {
        console.warn('[AsciiEffect] bind failed:', result.error, element);
      }
    }
  }

  if (bindings.length === 0) {
    return err(`All elements failed to bind. First error: ${errors[0]?.error ?? 'unknown'}`);
  }

  return ok({
    bindings,
    errors,
    destroy: () => {
      for (const binding of bindings) binding.cleanup();
    },
  });
};

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export { DEFAULT_OPTIONS } from './types';
export type { AsciiOptions, Effect, ElementBinding } from './types';
