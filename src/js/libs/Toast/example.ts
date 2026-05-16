/**
 * Toast library usage examples.
 * This file is for documentation purposes — not imported in production.
 */
import { setupToast } from '.';

// ---------------------------------------------------------------------------
// 1. Trigger dictionary — n triggers → 1 toast element
// ---------------------------------------------------------------------------

const toast = setupToast('.js-toast', [
  // Page load: delay 500ms, auto-dismiss after 4s
  {
    on: 'pageload',
    type: 'welcome',
    delay: 500,
    duration: 4000,
    onFire: (el) => console.log('[Toast] pageload fired, type:', el.dataset['toastType']),
  },

  // DOM event: copy button click, auto-dismiss after 2s
  {
    on: 'event',
    selector: '.js-copy-btn',
    eventName: 'click',
    type: 'copied',
    duration: 2000,
    onFire: (el) => console.log('[Toast] copy fired', el),
  },

  // Intersection: section enters viewport (once only), no auto-dismiss
  {
    on: 'intersect',
    selector: '#pricing',
    type: 'promo',
    threshold: 0.5,
    once: true,
  },
]);

// ---------------------------------------------------------------------------
// 2. Manual fire from external code (type / duration are set at call time)
// ---------------------------------------------------------------------------

function notifyUser(message: string): void {
  // `message` maps to a CSS-driven display pattern via data-toast-type
  toast.fire(message, 3000);
}

// Example: fire after an async operation
async function saveData(): Promise<void> {
  // ... some async work ...
  notifyUser('saved');
}

// ---------------------------------------------------------------------------
// 3. Programmatic dismiss + cleanup
// ---------------------------------------------------------------------------

document.querySelector('.js-force-close')?.addEventListener('click', () => {
  toast.dismiss();
});

window.addEventListener('pagehide', () => {
  toast.destroy();
});
