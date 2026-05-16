const SELECTOR = '[data-ga-event]';

type GtagFn = (...args: unknown[]) => void;

const sendEvent = (name: string, params: Record<string, string>): void => {
  const fn = (window as Window & { gtag?: GtagFn }).gtag;
  if (typeof fn !== 'function') return;
  fn('event', name, params);
};

export const setupGaTracker = (): void => {
  document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
    el.addEventListener('click', () => {
      const event = el.dataset.gaEvent;
      if (!event) return;
      sendEvent(event, {
        link_url:    el.dataset.gaUrl    ?? '',
        link_title:  el.dataset.gaTitle  ?? '',
        origin:      el.dataset.gaOrigin ?? '',
      });
    });
  });
};
