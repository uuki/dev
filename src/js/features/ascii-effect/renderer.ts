import type { EffectState, Particle } from './types';

// ---------------------------------------------------------------------------
// Colour helpers (pure)
// ---------------------------------------------------------------------------

const hslToRgb = (h: number, s: number, l: number): readonly [number, number, number] => {
  const s2 = s / 100;
  const l2 = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s2 * Math.min(l2, 1 - l2);
  const f = (n: number) =>
    l2 - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
};

type RgbTuple = readonly [number, number, number];

const particleColour = (
  effect: EffectState['options']['effect'],
  b: number,
  spatialPhase: number,
  speed: number,
  tick: number,
  nx: number,
  canvasW: number
): RgbTuple => {
  switch (effect) {
    case 'glow': {
      const lit = 28 + b * 48;
      return hslToRgb(0, 0, lit);
    }
    case 'rain':
      return hslToRgb(128, 72, 22 + b * 44);
    case 'wave': {
      const w = Math.sin(nx * Math.PI * 3 + tick * 0.04) * Math.sin(tick * 0.022);
      return hslToRgb(192 + w * 50, 68, 24 + b * 30);
    }
    case 'ember': {
      const flicker =
        (Math.sin(spatialPhase + tick * speed * 1.6) +
          Math.sin(spatialPhase + tick * speed * 2.1)) /
        2;
      const bf = b * Math.max(0, 0.3 + 0.65 * ((flicker + 1) / 2));
      return hslToRgb(8 + bf * 22, 92, 18 + bf * 46);
    }
  }
};

// ---------------------------------------------------------------------------
// Draw one particle
// ---------------------------------------------------------------------------

const CHAR_ROTATE_INTERVAL = 45;
const CHAR_ROTATE_CHANCE = 0.12;

const drawParticle = (
  ctx: CanvasRenderingContext2D,
  p: Particle,
  tick: number,
  opacity: number,
  effect: EffectState['options']['effect'],
  canvasW: number
): void => {
  const spatialSin = Math.sin(p.spatialPhase + tick * p.speed + p.jitter);
  const modulation = 0.55 + 0.35 * ((spatialSin + 1) / 2);
  const b = p.brightness * modulation;

  const [r, g, bl] = particleColour(effect, b, p.spatialPhase, p.speed, tick, p.x / canvasW, canvasW);

  ctx.fillStyle = `rgba(${r},${g},${bl},${opacity})`;

  if (tick % CHAR_ROTATE_INTERVAL === 0 && Math.random() < CHAR_ROTATE_CHANCE) {
    const charset = ctx.canvas.dataset['charset'] ?? '.,:;-=+*#%@';
    p.char = charset[Math.floor(Math.random() * charset.length)] ?? p.char;
  }

  ctx.fillText(p.char, p.x, p.y);
};

// ---------------------------------------------------------------------------
// Public: render one frame
// ---------------------------------------------------------------------------

const FADE_SPEED = 0.06;

export const renderFrame = (state: EffectState): void => {
  const { canvas, ctx, maskData, options } = state;
  const { particles, canvasW, canvasH } = maskData;

  if (state.opacity !== state.targetOpacity) {
    const delta = state.targetOpacity > state.opacity ? FADE_SPEED : -FADE_SPEED;
    state.opacity = Math.max(0, Math.min(1, state.opacity + delta));
  }

  const drawOpacity = state.opacity;

  ctx.clearRect(0, 0, canvasW, canvasH);

  if (drawOpacity <= 0.01) {
    state.tick++;
    return;
  }

  ctx.font = `${state.resolvedAsciiSize}px "Courier New", monospace`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  for (const p of particles) {
    drawParticle(ctx, p, state.tick, drawOpacity, options.effect, canvasW);
  }

  state.tick++;
};
