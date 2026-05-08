<script lang="ts">
  import { bindToast } from '@/js/libs/Toast';
  import type { ToastTrigger } from '@/js/libs/Toast';
  import { hasUnsupportedFeatures } from '@/js/utils/compat';
  import { getSessionStorage, setSessionStorage } from '@/js/utils/browser';
  import style from './Toast.module.scss';

  type ToastType = { name: string; label: string };

  interface Props {
    triggers?: ToastTrigger[];
    types?: ToastType[];
    sessionKey?: string;
    checkCompat?: boolean;
  }

  let { triggers = [], types = [], sessionKey, checkCompat = false }: Props = $props();

  let el: HTMLElement | null = $state(null);
  let activeType: string | null = $state(null);

  $effect(() => {
    if (!el) return;
    if (checkCompat && !hasUnsupportedFeatures()) return;
    if (sessionKey && getSessionStorage(sessionKey)) return;

    // ライブラリが書く data-toast-type / is-active を観測して Svelte state に同期する。
    const observer = new MutationObserver(() => {
      activeType = el!.classList.contains('is-active') ? (el!.dataset['toastType'] ?? null) : null;
    });
    observer.observe(el, { attributes: true, attributeFilter: ['class', 'data-toast-type'] });

    const handle = bindToast(el, triggers);

    let offDismiss = () => {};
    if (sessionKey) {
      const key = sessionKey;
      const onClose = (e: Event) => {
        if ((e.target as Element).closest('[data-toast-close]')) {
          setSessionStorage(key, '1');
        }
      };
      el.addEventListener('click', onClose, { once: true });
      offDismiss = () => el!.removeEventListener('click', onClose);
    }

    return () => {
      observer.disconnect();
      handle.destroy();
      offDismiss();
      activeType = null;
    };
  });
</script>

<div bind:this={el} class={style.toast}>
  {#each types as t (t.name)}
    <p class="{style.toast__message} {activeType === t.name ? 'is-active' : ''}">
      {t.label}
    </p>
  {/each}
  <button class={style.toast__close} data-toast-close aria-label="閉じる"></button>
</div>
