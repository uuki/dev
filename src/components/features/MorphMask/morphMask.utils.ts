export type MaskItem = { d: string };
export type MaskData = {
  base: MaskItem;
  variants: MaskItem[];
};
export type MorphMaskOptions = {
  duration: number;
  easing: string;
  scaleOffset: { x: number; y: number };
};
export type FitMode = 'stretch' | 'contain' | 'cover';

// --- 通常イージング（cubic-bezier 1区間） ---
export const EASING_MAPPINGS: Record<string, string> = {
  linear: '0 0 1 1',
  ease: '0.25 0.1 0.25 1',
  'ease-in': '0.42 0 1 1',
  'ease-out': '0 0 0.58 1',
  'ease-in-out': '0.42 0 0.58 1',
};

// --- 多キーフレームイージング（cubic bezier 1区間で表現できないもの） ---
// times: keyTimes の各点、tValues: パス補間に使う t 値（>1でオーバーシュート、<0でアンダーシュート）
export const KEYFRAME_CONFIGS: Record<
  string,
  { times: number[]; tValues: number[]; segmentSpline: string }
> = {
  bounce: {
    times:         [0, 0.6,  0.8,  1],
    tValues:       [0, 1.15, 0.95, 1],
    segmentSpline: '0.4 0 0.6 1',
  },
  elastic: {
    times:         [0, 0.5,  0.7,  0.85, 1],
    tValues:       [0, 1.25, 0.88, 1.05, 1],
    segmentSpline: '0.4 0 0.6 1',
  },
};

const NUM_RE = /-?[\d.]+(?:e[-+]?\d+)?/g;

export function interpolatePath(from: string, to: string, t: number): string {
  const fromNums = [...from.matchAll(NUM_RE)].map((m) => parseFloat(m[0]));
  const toNums   = [...to.matchAll(NUM_RE)].map((m) => parseFloat(m[0]));
  let i = 0;
  return from.replace(NUM_RE, () => {
    const v = fromNums[i] + (toNums[i] - fromNums[i]) * t;
    i++;
    return String(Math.round(v * 1e4) / 1e4);
  });
}

export function buildAnimateAttrs(
  from: string,
  to: string,
  easing: string,
  duration: number,
): Record<string, string> {
  const base = {
    attributeName: 'd',
    begin: 'indefinite',
    dur: `${duration}ms`,
    fill: 'freeze',
    calcMode: 'spline',
  };

  const config = KEYFRAME_CONFIGS[easing];
  if (config) {
    return {
      ...base,
      values:     config.tValues.map((t) => interpolatePath(from, to, t)).join(';'),
      keyTimes:   config.times.join(';'),
      keySplines: Array(config.times.length - 1).fill(config.segmentSpline).join(';'),
    };
  }

  return {
    ...base,
    from,
    to,
    keyTimes:   '0;1',
    keySplines: EASING_MAPPINGS[easing] ?? EASING_MAPPINGS['ease'],
  };
}
