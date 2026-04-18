<script module>
  let counter = 0;
</script>

<script lang="ts">
  import { type Snippet } from 'svelte';
  import styles from './MorphMask.module.scss';
  import {
    type MaskData,
    type MorphMaskOptions,
    type FitMode,
    buildAnimateAttrs,
  } from './morphMask.utils';

  const clipPathId = `morph-mask-${++counter}`;

  interface Props {
    maskData: MaskData;
    options?: Partial<MorphMaskOptions>;
    /**
     * stretch: パスをコンテンツサイズに引き伸ばす（objectBoundingBox）
     * contain: パスの縦横比を保ちコンテンツ内に収める（userSpaceOnUse）
     * cover:   パスの縦横比を保ち短辺を埋める（userSpaceOnUse）
     */
    fit?: FitMode;
    innerSelector?: string;
    children: Snippet;
  }

  let { maskData, options = {}, fit = 'stretch', innerSelector, children }: Props = $props();

  let resolvedOptions: MorphMaskOptions = $derived({
    duration: 400,
    easing: 'ease',
    ...options,
    scaleOffset: { x: 1, y: 1, ...(options.scaleOffset ?? {}) },
  });

  // マウント時に1度だけランダム選択。トップレベルで初期値を確定させることで onMount 不要にする
  const morphIndex = Math.floor(Math.random() * maskData.variants.length);
  let morphPath: string = $state(maskData.variants[morphIndex].d);

  // --- DOM refs ---
  let pathEl: SVGPathElement | null          = $state(null);
  let contentEl: HTMLElement | null          = $state(null);
  let wrapperEl: HTMLElement | null          = $state(null);
  let animateForwardEl: SVGAnimateElement | null = $state(null);
  let animateReverseEl: SVGAnimateElement | null = $state(null);

  // --- DOM 計測値（$effect で更新） ---
  let pathBBox: { x: number; y: number; width: number; height: number } = $state(
    { x: 0, y: 0, width: 0, height: 0 },
  );
  let contentWidth: number  = $state(0);
  let contentHeight: number = $state(0);

  // --- animate 属性オブジェクト ---
  let forwardAttrs: Record<string, string> = $derived.by(() =>
    buildAnimateAttrs(maskData.base.d, morphPath, resolvedOptions.easing, resolvedOptions.duration),
  );
  let reverseAttrs: Record<string, string> = $derived.by(() =>
    buildAnimateAttrs(morphPath, maskData.base.d, resolvedOptions.easing, resolvedOptions.duration),
  );

  // --- clipPathUnits / pathTransform ---
  let clipPathUnits: 'objectBoundingBox' | 'userSpaceOnUse' = $derived(
    fit === 'stretch' ? 'objectBoundingBox' : 'userSpaceOnUse',
  );

  let pathTransform: string = $derived.by(() => {
    const { x: bx, y: by, width: bw, height: bh } = pathBBox;
    const { x: sox, y: soy } = resolvedOptions.scaleOffset;

    if (bw === 0 || bh === 0) return '';

    if (fit === 'stretch') {
      return `scale(${(1 / bw) * sox}, ${(1 / bh) * soy}) translate(${-bx}, ${-by})`;
    }

    if (contentWidth === 0 || contentHeight === 0) return '';

    const scale =
      fit === 'contain'
        ? Math.min(contentWidth / bw, contentHeight / bh)
        : Math.max(contentWidth / bw, contentHeight / bh);

    const tx = (contentWidth - bw * scale) / 2 - bx * scale;
    const ty = (contentHeight - bh * scale) / 2 - by * scale;

    return `translate(${tx}, ${ty}) scale(${scale * sox}, ${scale * soy})`;
  });

  // パスの本来の BBox を DOM 確定後に1度だけ取得
  // pathEl を読むことで依存関係を形成。pathBBox への書き込みは dependency にならない
  $effect(() => {
    if (!pathEl) return;
    const bbox = pathEl.getBBox();
    pathBBox = { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height };
  });

  // コンテンツサイズを ResizeObserver で追随（contain/cover のスケール計算に使用）
  // ResizeObserver は observe() 直後に初回コールバックが発火するため offsetWidth 初期取得は不要
  $effect(() => {
    if (!contentEl) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        contentWidth  = entry.contentRect.width;
        contentHeight = entry.contentRect.height;
      }
    });
    ro.observe(contentEl);
    return () => ro.disconnect();
  });

  // ホバーイベント
  $effect(() => {
    const card = wrapperEl;
    if (!card || !animateForwardEl || !animateReverseEl) return;

    const onEnter = () => animateForwardEl!.beginElement();
    const onLeave = () => animateReverseEl!.beginElement();

    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mouseleave', onLeave);

    let innerEl: Element | null = null;
    const onInnerEnter = () => animateReverseEl!.beginElement();
    const onInnerLeave = () => animateForwardEl!.beginElement();

    if (innerSelector) {
      innerEl = card.querySelector(innerSelector);
      if (innerEl) {
        innerEl.addEventListener('mouseenter', onInnerEnter);
        innerEl.addEventListener('mouseleave', onInnerLeave);
      }
    }

    return () => {
      card.removeEventListener('mouseenter', onEnter);
      card.removeEventListener('mouseleave', onLeave);
      if (innerEl) {
        innerEl.removeEventListener('mouseenter', onInnerEnter);
        innerEl.removeEventListener('mouseleave', onInnerLeave);
      }
    };
  });
</script>

<div class={styles.morphMaskWrapper} bind:this={wrapperEl}>
  <div class={styles.morphMaskContent} bind:this={contentEl} style={`clip-path: url(#${clipPathId})`}>
    {@render children()}
  </div>

  <svg width="0" height="0" aria-hidden="true" class={styles.morphMaskSvg}>
    <defs>
      <clipPath id={clipPathId} {clipPathUnits}>
        <path bind:this={pathEl} d={maskData.base.d} transform={pathTransform}>
          {#if morphPath}
            <animate bind:this={animateForwardEl} {...forwardAttrs} />
            <animate bind:this={animateReverseEl} {...reverseAttrs} />
          {/if}
        </path>
      </clipPath>
    </defs>
  </svg>
</div>
