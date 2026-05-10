// ─────────────────────────────────────────────────────────────────────────────
// palette.ts — スケール定義・パレット生成・トークンマッピング・自動調整
// ─────────────────────────────────────────────────────────────────────────────

import {
  hexToOklch,
  oklchToHex,
  chromaCurve,
  genLightnessSteps,
  contrastRatio,
  wcagAA,
  type OklchColor,
} from './color';

// ── 型定義 ───────────────────────────────────────────────────────────────────

export type ScaleName = 'gray' | 'blue' | 'green' | 'yellow' | 'red';

export interface ScaleInput {
  hex: string;         // ユーザー入力色
  chromaScale: number; // chroma強度 0.5〜2.0（1.0がデフォルト）
}

export interface ScaleStep {
  step: number;        // 0,10,20...
  hex: string;
  oklch: OklchColor;
  isGamutClipped: boolean;
}

export type PaletteScale = ScaleStep[];

export type Palette = Record<ScaleName, PaletteScale>;

export interface TokenValue {
  light: string;
  dark: string;
}

export type TokenName =
  | 'base-bg'
  | 'base-surface-1'
  | 'base-surface-2'
  | 'container-primary'
  | 'container-subtle'
  | 'text-primary'
  | 'text-secondary'
  | 'text-tertiary'
  | 'border-default'
  | 'semantic-success'
  | 'semantic-warning'
  | 'semantic-danger';

export type TokenMap = Record<TokenName, TokenValue>;

export interface ContrastResult {
  label: string;
  fg: string;
  bg: string;
  theme: 'dark' | 'light';
  ratio: number;
  passAA: boolean;
  adjusted: boolean; // 自動調整が入ったか
}

// ── スケール別パラメータ ─────────────────────────────────────────────────────

const SCALE_STEP_COUNT: Record<ScaleName, number> = {
  gray:   12,
  blue:   11,
  green:  11,
  yellow: 11,
  red:    11,
};

// 参考色から読み取ったスケール別 peakC（マット基準値）
const SCALE_PEAK_CHROMA: Record<ScaleName, number> = {
  gray:   0.018,
  blue:   0.045,
  green:  0.055,
  yellow: 0.060,
  red:    0.065,
};

// ── パレット生成 ──────────────────────────────────────────────────────────────

export function generateScale(
  scaleName: ScaleName,
  input: ScaleInput,
): PaletteScale {
  const inputOklch = hexToOklch(input.hex);
  const count      = SCALE_STEP_COUNT[scaleName];
  const peakC      = SCALE_PEAK_CHROMA[scaleName] * input.chromaScale;

  // peakL を入力色のLに合わせる（スケールを入力色に揃える）
  const peakL      = inputOklch.L;
  const hue        = inputOklch.H;

  const lightnessSteps = genLightnessSteps(count);

  return lightnessSteps.map((L, i) => {
    const C = chromaCurve(L, peakC, peakL);
    const hex = oklchToHex(L, C, hue);

    // gamut clipping チェック: 変換後に色相が大きくズレていないか
    const roundtrip = hexToOklch(hex);
    const isGamutClipped =
      Math.abs(roundtrip.C - C) > 0.01 ||
      (C > 0.005 && Math.abs(((roundtrip.H - hue + 540) % 360) - 180) > 15);

    return {
      step: i * 10,
      hex,
      oklch: { L, C, H: hue },
      isGamutClipped,
    };
  });
}

export function generatePalette(
  inputs: Record<ScaleName, ScaleInput>,
): Palette {
  return {
    gray:   generateScale('gray',   inputs.gray),
    blue:   generateScale('blue',   inputs.blue),
    green:  generateScale('green',  inputs.green),
    yellow: generateScale('yellow', inputs.yellow),
    red:    generateScale('red',    inputs.red),
  };
}

// ── トークンマッピング ────────────────────────────────────────────────────────
// primaryIdx = 入力色のL値から自動推定

function pickStep(scale: PaletteScale, idx: number): string {
  const clamped = Math.max(0, Math.min(scale.length - 1, idx));
  return scale[clamped]!.hex;
}

export function mapTokens(palette: Palette): TokenMap {
  const G  = palette.gray;
  const B  = palette.blue;
  const Gr = palette.green;
  const Y  = palette.yellow;
  const R  = palette.red;

  // 各スケールの primaryIdx (中間ステップ)
  const gLen = G.length;   // 12ステップ
  const bLen = B.length;   // 11ステップ

  // gray: 暗部3つをbg/surface用, 上部3つをテキスト用
  const gBg   = 0;
  const gSf1  = 1;
  const gSf2  = 2;
  const gBord = 3;
  const gT3   = Math.round(gLen * 0.55); // tertiary text
  const gT2   = Math.round(gLen * 0.75); // secondary text
  const gT1   = gLen - 1;                // primary text

  // blue: primaryは中間寄り
  const bPrim  = Math.round(bLen * 0.36);
  const bSubtleDark  = 2;
  const bSubtleLight = Math.round(bLen * 0.82);

  return {
    'base-bg':           { dark: pickStep(G, gBg),   light: pickStep(G, gLen-1) },
    'base-surface-1':    { dark: pickStep(G, gSf1),  light: pickStep(G, gLen-2) },
    'base-surface-2':    { dark: pickStep(G, gSf2),  light: pickStep(G, gLen-3) },
    'container-primary': { dark: pickStep(B, bPrim), light: pickStep(B, bPrim) },
    'container-subtle':  { dark: pickStep(B, bSubtleDark), light: pickStep(B, bSubtleLight) },
    'text-primary':      { dark: pickStep(G, gT1),   light: pickStep(G, 1) },
    'text-secondary':    { dark: pickStep(G, gT2),   light: pickStep(G, 3) },
    'text-tertiary':     { dark: pickStep(G, gT3),   light: pickStep(G, 5) },
    'border-default':    { dark: pickStep(G, gBord), light: pickStep(G, gLen-4) },
    'semantic-success':  { dark: pickStep(Gr, Math.round(Gr.length*0.36)), light: pickStep(Gr, Math.round(Gr.length*0.36)) },
    'semantic-warning':  { dark: pickStep(Y,  Math.round(Y.length*0.45)),  light: pickStep(Y,  Math.round(Y.length*0.45)) },
    'semantic-danger':   { dark: pickStep(R,  Math.round(R.length*0.36)),  light: pickStep(R,  Math.round(R.length*0.36)) },
  };
}

// ── コントラストチェック + トークンレベル自動調整 ─────────────────────────────

interface ContrastPair {
  label: string;
  fgKey: TokenName;
  bgKey: TokenName;
  theme: 'dark' | 'light';
  fgDir: 'up' | 'down';  // コントラスト不足時にfgをどちらに動かすか
  fgScale: ScaleName;
}

const CONTRAST_PAIRS: ContrastPair[] = [
  { label: 'text-primary / base-bg',      fgKey:'text-primary',   bgKey:'base-bg',      theme:'dark',  fgDir:'up',   fgScale:'gray' },
  { label: 'text-primary / surface-1',    fgKey:'text-primary',   bgKey:'base-surface-1',theme:'dark',  fgDir:'up',   fgScale:'gray' },
  { label: 'text-primary / surface-2',    fgKey:'text-primary',   bgKey:'base-surface-2',theme:'dark',  fgDir:'up',   fgScale:'gray' },
  { label: 'text-secondary / base-bg',    fgKey:'text-secondary', bgKey:'base-bg',      theme:'dark',  fgDir:'up',   fgScale:'gray' },
  { label: 'text-tertiary / base-bg',     fgKey:'text-tertiary',  bgKey:'base-bg',      theme:'dark',  fgDir:'up',   fgScale:'gray' },
  { label: 'text-primary / base-bg',      fgKey:'text-primary',   bgKey:'base-bg',      theme:'light', fgDir:'down', fgScale:'gray' },
  { label: 'text-primary / surface-1',    fgKey:'text-primary',   bgKey:'base-surface-1',theme:'light', fgDir:'down', fgScale:'gray' },
  { label: 'text-primary / surface-2',    fgKey:'text-primary',   bgKey:'base-surface-2',theme:'light', fgDir:'down', fgScale:'gray' },
  { label: 'text-secondary / base-bg',    fgKey:'text-secondary', bgKey:'base-bg',      theme:'light', fgDir:'down', fgScale:'gray' },
  { label: 'text-tertiary / base-bg',     fgKey:'text-tertiary',  bgKey:'base-bg',      theme:'light', fgDir:'down', fgScale:'gray' },
];

export function checkAndAdjustContrast(
  tokens: TokenMap,
  palette: Palette,
): { tokens: TokenMap; results: ContrastResult[] } {
  // TokenMapをディープコピー
  const adjusted: TokenMap = structuredClone(tokens);
  const results: ContrastResult[] = [];

  for (const pair of CONTRAST_PAIRS) {
    const theme = pair.theme;
    const fg = adjusted[pair.fgKey][theme];
    const bg = adjusted[pair.bgKey][theme];
    const ratio = contrastRatio(fg, bg);

    if (wcagAA(ratio)) {
      results.push({ label: pair.label, fg, bg, theme, ratio, passAA: true, adjusted: false });
      continue;
    }

    // 自動調整: palette上でfgのstepを1つずらす
    const scale = palette[pair.fgScale];
    const currentIdx = scale.findIndex(s => s.hex === fg);
    const startIdx = currentIdx >= 0 ? currentIdx : Math.round(scale.length / 2);

    let bestHex = fg;
    let bestRatio = ratio;

    // dir='up'なら明るい方向（index大）、'down'なら暗い方向（index小）
    for (let delta = 1; delta <= scale.length; delta++) {
      const idx = pair.fgDir === 'up'
        ? startIdx + delta
        : startIdx - delta;
      if (idx < 0 || idx >= scale.length) break;
      const candidate = scale[idx]!.hex;
      const r = contrastRatio(candidate, bg);
      if (r > bestRatio) { bestRatio = r; bestHex = candidate; }
      if (wcagAA(r)) break;
    }

    adjusted[pair.fgKey] = { ...adjusted[pair.fgKey], [theme]: bestHex };
    results.push({
      label: pair.label,
      fg: bestHex,
      bg,
      theme,
      ratio: bestRatio,
      passAA: wcagAA(bestRatio),
      adjusted: bestHex !== fg,
    });
  }

  return { tokens: adjusted, results };
}
