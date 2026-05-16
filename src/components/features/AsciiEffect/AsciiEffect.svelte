<script lang="ts">
  import { bindElement, DEFAULT_OPTIONS } from '@/js/features/ascii-effect';
  import type { AsciiOptions } from '@/js/features/ascii-effect';

  interface Props {
    text: string;
    options?: Partial<AsciiOptions>;
  }

  let { text, options = {} }: Props = $props();

  let el: HTMLElement | null = $state(null);

  $effect(() => {
    if (!el) return;
    const mergedOptions: AsciiOptions = { ...DEFAULT_OPTIONS, ...options };
    const result = bindElement(el, mergedOptions);
    if (result._tag === 'Err') return;
    const { cleanup } = result.value;
    return cleanup;
  });
</script>

<span class="js-ascii-effect" bind:this={el}>
  {@html text}
</span>
