import { ok, err, flatMap, type Result } from '@/js/libs/result';
import type { MaskData, AsciiOptions, Particle } from './types';

// ---------------------------------------------------------------------------
// Step 1: rasterise text → ImageData
// ---------------------------------------------------------------------------

type RasterResult = {
  readonly imageData: ImageData;
  readonly w: number;
  readonly h: number;
};

const rasteriseText = (text: string, logoSize: number): Result<RasterResult> => {
  const c = document.createElement('canvas');
  const cx = c.getContext('2d');
  if (!cx) return err('Could not get 2d context for rasterisation');

  const font = `300 ${logoSize}px "Courier New", monospace`;
  cx.font = font;
  (cx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
    `${Math.round(logoSize * 0.05)}px`;

  const tw = cx.measureText(text).width + logoSize * 0.4;
  const th = logoSize * 1.4;
  c.width = Math.ceil(tw);
  c.height = Math.ceil(th);

  cx.fillStyle = '#000';
  cx.fillRect(0, 0, c.width, c.height);
  cx.font = font;
  cx.fillStyle = '#fff';
  cx.textBaseline = 'middle';
  (cx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
    `${Math.round(logoSize * 0.05)}px`;
  cx.fillText(text, logoSize * 0.1, th / 2);

  return ok({ imageData: cx.getImageData(0, 0, c.width, c.height), w: c.width, h: c.height });
};

// ---------------------------------------------------------------------------
// Step 2: extract filled pixels → grid representative points
// ---------------------------------------------------------------------------

type GridPoint = {
  readonly x: number;
  readonly y: number;
  readonly brightness: number;
  readonly gx: number;
  readonly gy: number;
};

const extractGridPoints = (
  raster: RasterResult,
  step: number
): Result<{ readonly points: ReadonlyArray<GridPoint>; readonly w: number; readonly h: number }> => {
  const { imageData, w, h } = raster;
  const data = imageData.data;
  const gridMap = new Map<string, GridPoint>();

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = data[(y * w + x) * 4] ?? 0;
      if (v <= 30) continue;
      const gx = Math.round(x / step);
      const gy = Math.round(y / step);
      const key = `${gx},${gy}`;
      const prev = gridMap.get(key);
      const brightness = v / 255;
      if (!prev || prev.brightness < brightness) {
        gridMap.set(key, { x, y, brightness, gx, gy });
      }
    }
  }

  const points = [...gridMap.values()].sort((a, b) => b.brightness - a.brightness);
  if (points.length === 0) return err('No filled pixels found in raster');

  return ok({ points, w, h });
};

// ---------------------------------------------------------------------------
// Step 3: select N particles from grid
// ---------------------------------------------------------------------------

const selectParticles = (
  input: { readonly points: ReadonlyArray<GridPoint>; readonly w: number; readonly h: number },
  count: number,
  step: number,
  charset: string
): Result<{ readonly particles: ReadonlyArray<Particle>; readonly w: number; readonly h: number }> => {
  const { points, w, h } = input;
  const clamped = Math.max(1, Math.min(count, points.length * 3));

  let selected: Array<GridPoint>;

  if (clamped <= points.length) {
    const stride = points.length / clamped;
    selected = Array.from({ length: clamped }, (_, i) =>
      points[Math.floor(i * stride)]!
    );
  } else {
    selected = [...points];
    let extra = clamped - points.length;
    let idx = 0;
    while (extra-- > 0) {
      const base = points[idx % points.length];
      if (!base) break;
      selected.push({
        ...base,
        x: base.x + (Math.random() - 0.5) * step * 0.6,
        y: base.y + (Math.random() - 0.5) * step * 0.6,
      });
      idx++;
    }
  }

  const charArray = charset.split('');
  const randomChar = (): string =>
    charArray[Math.floor(Math.random() * charArray.length)] ?? '.';

  const particles: ReadonlyArray<Particle> = selected.map((p) => ({
    x: p.x,
    y: p.y,
    brightness: p.brightness,
    char: randomChar(),
    spatialPhase: (p.x / w) * Math.PI * 2 + (p.y / h) * Math.PI,
    jitter: (Math.random() - 0.5) * 0.6,
    speed: 0.016 + Math.random() * 0.012,
  }));

  return ok({ particles, w, h });
};

// ---------------------------------------------------------------------------
// Public: build mask — full ROP pipeline
// ---------------------------------------------------------------------------

type ResolvedBuildOptions = {
  readonly asciiSize: number; // must be a resolved px value
  readonly logoSize: number;
  readonly density: number;
  readonly charset: string;
};

export const buildMask = (
  text: string,
  options: ResolvedBuildOptions,
): Result<MaskData> => {
  const { logoSize, asciiSize, density, charset } = options;
  const step = logoSize / asciiSize;

  return flatMap(
    flatMap(
      rasteriseText(text, logoSize),
      (raster) => extractGridPoints(raster, step)
    ),
    ({ points, w, h }) =>
      flatMap(
        selectParticles({ points, w, h }, density, step, charset),
        ({ particles, w: cw, h: ch }) => ok<MaskData>({ particles, canvasW: cw, canvasH: ch })
      )
  );
};
