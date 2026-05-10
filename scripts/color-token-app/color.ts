// ─────────────────────────────────────────────────────────────────────────────
// color.ts — OKLCH ↔ sRGB 変換・パレット生成・コントラスト計算
// ─────────────────────────────────────────────────────────────────────────────

export type OklchColor = { L: number; C: number; H: number };
export type RgbColor   = { r: number; g: number; b: number };

// ── sRGB ↔ Linear sRGB ───────────────────────────────────────────────────────

export function linearize(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function delinearize(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
}

// ── HEX → OKLCH ──────────────────────────────────────────────────────────────

export function hexToRgb01(hex: string): RgbColor {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}

export function hexToOklch(hex: string): OklchColor {
  const { r, g, b } = hexToRgb01(hex);
  const rl = linearize(r), gl = linearize(g), bl = linearize(b);

  const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;

  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);

  const okL =  0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const okA =  1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const okB =  0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  const C = Math.sqrt(okA ** 2 + okB ** 2);
  const H = ((Math.atan2(okB, okA) * 180) / Math.PI + 360) % 360;

  return { L: okL, C, H };
}

// ── OKLCH → HEX ──────────────────────────────────────────────────────────────

export function oklchToHex(L: number, C: number, H: number): string {
  const h = (H * Math.PI) / 180;
  const okA = C * Math.cos(h);
  const okB = C * Math.sin(h);

  const l_ = L + 0.3963377774 * okA + 0.2158037573 * okB;
  const m_ = L - 0.1055613458 * okA - 0.0638541728 * okB;
  const s_ = L - 0.0894841775 * okA - 1.2914855480 * okB;

  const lv = l_ ** 3, mv = m_ ** 3, sv = s_ ** 3;

  const rl =  4.0767416621 * lv - 3.3077115913 * mv + 0.2309699292 * sv;
  const gl = -1.2684380046 * lv + 2.6097574011 * mv - 0.3413193965 * sv;
  const bl = -0.0041960863 * lv - 0.7034186147 * mv + 1.7076147010 * sv;

  // gamut clamp
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const r = clamp01(delinearize(rl));
  const g = clamp01(delinearize(gl));
  const b = clamp01(delinearize(bl));

  const hex2 = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${hex2(r)}${hex2(g)}${hex2(b)}`;
}

// ── コントラスト比（WCAG 2.2）────────────────────────────────────────────────

export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb01(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker  = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function wcagAA(ratio: number): boolean  { return ratio >= 4.5; }
export function wcagAAA(ratio: number): boolean { return ratio >= 7.0; }

// ── Gaussian chromaカーブ ─────────────────────────────────────────────────────
// 輝度が低い/高い端でchromaを絞り、中間でピーク → gamut clip対策 + マット感

export function chromaCurve(
  L: number,
  peakC: number,
  peakL = 0.48,
  width = 0.32,
): number {
  return peakC * Math.exp(-((L - peakL) ** 2) / (2 * width ** 2));
}

// ── ease-in-out 輝度カーブ ────────────────────────────────────────────────────

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/** OK輝度 L を等間隔→ease補正した配列（0..1スケール）*/
export function genLightnessSteps(
  count: number,
  minL = 0.06,
  maxL = 0.82,
): number[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    return minL + easeInOut(t) * (maxL - minL);
  });
}

// ── 入力色のパレット内primaryIdx推定 ─────────────────────────────────────────

export function inferPrimaryIdx(
  inputL: number,
  lightnessSteps: number[],
): number {
  let bestIdx = 0;
  let bestDist = Infinity;
  lightnessSteps.forEach((l, i) => {
    const d = Math.abs(l - inputL);
    if (d < bestDist) { bestDist = d; bestIdx = i; }
  });
  return bestIdx;
}
