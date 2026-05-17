const SELECTOR = '[data-ga-event]';

const EVENT_MAP: Record<string, string> = {
  external: 'external_blog_click',
};

type EventData = {
  eventName: string;
  url: string;
  title: string;
  origin: string;
};

type GtagFn = (...args: unknown[]) => void;

const sendEvent = (name: string, params: Record<string, string>): void => {
  const fn = (window as Window & { gtag?: GtagFn }).gtag;
  if (typeof fn !== 'function') return;
  fn('event', name, params);
};

const resolveUrl = (el: HTMLElement): string => {
  const target = el.hasAttribute('data-ga-url') ? el : el.querySelector<HTMLElement>('[data-ga-url]');
  return target instanceof HTMLAnchorElement ? target.href : target?.getAttribute('href') ?? '';
};

const resolveText = (el: HTMLElement, attr: string): string => {
  const target = el.hasAttribute(attr) ? el : el.querySelector<HTMLElement>(`[${attr}]`);
  return target?.textContent?.trim() ?? '';
};

export const setupGaTracker = (): void => {
  const store = new Map<string, EventData>();
  let counter = 0;

  document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
    const typeName = el.dataset.gaEvent;
    if (!typeName) return;
    const eventName = EVENT_MAP[typeName];
    if (!eventName) return;

    const id = `ga-${++counter}`;
    el.dataset.gaId = id;

    store.set(id, {
      eventName,
      url:    resolveUrl(el),
      title:  resolveText(el, 'data-ga-title'),
      origin: resolveText(el, 'data-ga-origin').toLowerCase(),
    });

    el.addEventListener('click', () => {
      const data = store.get(el.dataset.gaId ?? '');
      if (!data) return;
      sendEvent(data.eventName, {
        link_url:   data.url,
        link_title: data.title,
        origin:     data.origin,
      });
    });
  });
};
