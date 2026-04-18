<script module>
  let counter = 0;
</script>

<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import styles from './MorphMask.module.scss';

  type MaskItem = { d: string };
  type MaskData = {
    original: MaskItem;
    morphing: MaskItem[];
  };
  type MorphMaskOptions = {
    duration: number;
    easing: string;
    scaleOffset: { x: number; y: number };
  };
  type FitMode = 'stretch' | 'contain' | 'cover';

  const EASING_MAPPINGS: Record<string, string> = {
    linear: '0 0 1 1',
    ease: '0.25 0.1 0.25 1',
    'ease-in': '0.42 0 1 1',
    'ease-out': '0 0 0.58 1',
    'ease-in-out': '0.42 0 0.58 1',
  };

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

  let morphPath: string = $state('');

  let pathEl: SVGPathElement | null = $state(null);
  let contentEl: HTMLElement | null = $state(null);
  let wrapperEl: HTMLElement | null = $state(null);
  let animateForwardEl: SVGAnimateElement | null = $state(null);
  let animateReverseEl: SVGAnimateElement | null = $state(null);

  // パス本来のバウンディングボックス（マウント後に確定、以降不変）
  let pathBBox: { x: number; y: number; width: number; height: number } = $state({ x: 0, y: 0, width: 0, height: 0 });

  // コンテンツ要素のサイズ（ResizeObserver で追随）
  let contentWidth: number = $state(0);
  let contentHeight: number = $state(0);

  function getKeySplines(easing: string): string {
    return EASING_MAPPINGS[easing] ?? EASING_MAPPINGS['ease'];
  }

  let keySplines: string = $derived(getKeySplines(resolvedOptions.easing));

  // stretch は objectBoundingBox、contain/cover は userSpaceOnUse
  let clipPathUnits: 'objectBoundingBox' | 'userSpaceOnUse' = $derived(
    fit === 'stretch' ? 'objectBoundingBox' : 'userSpaceOnUse',
  );

  let pathTransform: string = $derived.by(() => {
    const { x: bx, y: by, width: bw, height: bh } = pathBBox;
    const { x: sox, y: soy } = resolvedOptions.scaleOffset;

    if (bw === 0 || bh === 0) return '';

    if (fit === 'stretch') {
      // 0-1 正規化（objectBoundingBox 用）
      // パス原点が (0,0) でない場合も translate で補正
      return `scale(${(1 / bw) * sox}, ${(1 / bh) * soy}) translate(${-bx}, ${-by})`;
    }

    if (contentWidth === 0 || contentHeight === 0) return '';

    // contain: 短辺に合わせて均等スケール / cover: 長辺に合わせて均等スケール
    const scale =
      fit === 'contain'
        ? Math.min(contentWidth / bw, contentHeight / bh)
        : Math.max(contentWidth / bw, contentHeight / bh);

    // コンテンツ内でセンタリング、パス原点のオフセットも補正
    const tx = (contentWidth - bw * scale) / 2 - bx * scale;
    const ty = (contentHeight - bh * scale) / 2 - by * scale;

    return `translate(${tx}, ${ty}) scale(${scale * sox}, ${scale * soy})`;
  });

  onMount(() => {
    const randomIndex = Math.floor(Math.random() * maskData.morphing.length);
    morphPath = maskData.morphing[randomIndex].d;

    // transform 未適用状態でパスの本来のバウンディングボックスを取得
    if (pathEl) {
      const bbox = pathEl.getBBox();
      pathBBox = { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height };
    }

    if (contentEl) {
      contentWidth = contentEl.offsetWidth;
      contentHeight = contentEl.offsetHeight;
    }
  });

  // コンテンツサイズの変化を監視（contain/cover でパス位置・スケールを再計算）
  $effect(() => {
    if (!contentEl) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        contentWidth = entry.contentRect.width;
        contentHeight = entry.contentRect.height;
      }
    });

    ro.observe(contentEl);
    return () => ro.disconnect();
  });

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

  <svg width="0" height="0" aria-hidden="true" style="position: absolute; pointer-events: none;">
    <defs>
      <clipPath id={clipPathId} {clipPathUnits}>
        <path bind:this={pathEl} d={maskData.original.d} transform={pathTransform}>
          {#if morphPath}
            <animate
              bind:this={animateForwardEl}
              attributeName="d"
              begin="indefinite"
              dur={`${resolvedOptions.duration}ms`}
              fill="freeze"
              calcMode="spline"
              {keySplines}
              keyTimes="0;1"
              from={maskData.original.d}
              to={morphPath}
            />
            <animate
              bind:this={animateReverseEl}
              attributeName="d"
              begin="indefinite"
              dur={`${resolvedOptions.duration}ms`}
              fill="freeze"
              calcMode="spline"
              {keySplines}
              keyTimes="0;1"
              from={morphPath}
              to={maskData.original.d}
            />
          {/if}
        </path>
      </clipPath>
    </defs>
  </svg>
</div>
