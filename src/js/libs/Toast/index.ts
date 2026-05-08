type BaseTrigger = {
  type: string;
  duration?: number;
  onFire?: (el: HTMLElement) => void;
};

type PageloadTrigger  = BaseTrigger & { on: 'pageload'; delay?: number };
type EventTrigger     = BaseTrigger & { on: 'event'; selector: string; eventName: string; delay?: number };
type IntersectTrigger = BaseTrigger & { on: 'intersect'; selector: string; threshold?: number; once?: boolean };

export type ToastTrigger = PageloadTrigger | EventTrigger | IntersectTrigger;

export type ToastHandle = {
  fire: (type: string, duration?: number) => void;
  /** is-active を即時解除する */
  dismiss: () => void;
  destroy: () => void;
};

type FireFn = (type: string, duration?: number, onFire?: (el: HTMLElement) => void) => void;

/**
 * DOM primitives
 */
const deactivate = (el: HTMLElement): void => {
  el.classList.remove('is-active');
};

const activate = (
  el: HTMLElement,
  type: string,
  duration?: number,
  onFire?: (el: HTMLElement) => void,
): (() => void) => {
  el.dataset['toastType'] = type;
  el.classList.add('is-active');
  onFire?.(el);
  if (duration !== undefined) {
    const id = window.setTimeout(() => deactivate(el), duration);
    return () => clearTimeout(id);
  }
  return () => {};
};

function bindPageload(trigger: PageloadTrigger, fire: FireFn): () => void {
  if (trigger.delay) {
    const id = window.setTimeout(
      () => fire(trigger.type, trigger.duration, trigger.onFire),
      trigger.delay,
    );
    return () => clearTimeout(id);
  }
  fire(trigger.type, trigger.duration, trigger.onFire);
  return () => {};
}

function bindEvent(trigger: EventTrigger, fire: FireFn): () => void {
  const targets = document.querySelectorAll<HTMLElement>(trigger.selector);
  if (!targets.length) return () => {};

  const timers: number[] = [];

  const handler = () => {
    if (trigger.delay) {
      timers.push(
        window.setTimeout(() => fire(trigger.type, trigger.duration, trigger.onFire), trigger.delay),
      );
    } else {
      fire(trigger.type, trigger.duration, trigger.onFire);
    }
  };

  targets.forEach((t) => t.addEventListener(trigger.eventName, handler));
  return () => {
    timers.forEach(clearTimeout);
    targets.forEach((t) => t.removeEventListener(trigger.eventName, handler));
  };
}

function bindIntersect(trigger: IntersectTrigger, fire: FireFn): () => void {
  const targets = document.querySelectorAll<HTMLElement>(trigger.selector);
  if (!targets.length) return () => {};

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        fire(trigger.type, trigger.duration, trigger.onFire);
        if (trigger.once) observer.unobserve(entry.target);
      }
    },
    { threshold: trigger.threshold ?? 0 },
  );

  targets.forEach((t) => observer.observe(t));
  return () => observer.disconnect();
}

function bindCloseButtons(el: HTMLElement, dismiss: () => void): () => void {
  const buttons = el.querySelectorAll<HTMLElement>('[data-toast-close]');
  buttons.forEach((btn) => btn.addEventListener('click', dismiss));
  return () => buttons.forEach((btn) => btn.removeEventListener('click', dismiss));
}

/**
 * Public API
 */
const NOOP_HANDLE: ToastHandle = { fire: () => {}, dismiss: () => {}, destroy: () => {} };

/**
 * DOM 参照を直接受け取る本体。
 * Svelte の bind:this や、すでに要素参照がある場面で使用する。
 */
export function bindToast(el: HTMLElement, triggers: ToastTrigger[]): ToastHandle {
  let cancelDuration: () => void = () => {};

  const doFire: FireFn = (type, duration, onFire) => {
    cancelDuration();
    cancelDuration = activate(el, type, duration, onFire);
  };

  const doDismiss = () => {
    cancelDuration();
    cancelDuration = () => {};
    deactivate(el);
  };

  const cleanups: Array<() => void> = [
    bindCloseButtons(el, doDismiss),
    ...triggers.map((trigger): (() => void) => {
      switch (trigger.on) {
        case 'pageload':  return bindPageload(trigger, doFire);
        case 'event':     return bindEvent(trigger, doFire);
        case 'intersect': return bindIntersect(trigger, doFire);
      }
    }),
  ];

  return {
    fire: (type, duration) => doFire(type, duration),
    dismiss: doDismiss,
    destroy: () => cleanups.forEach((fn) => fn()),
  };
}

/**
 * For vanilla wrapper
 */
export function setupToast(selector: string, triggers: ToastTrigger[]): ToastHandle {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return NOOP_HANDLE;
  return bindToast(el, triggers);
}
