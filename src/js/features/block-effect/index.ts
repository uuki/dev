import * as THREE from 'three';
import { type Result, ok, err, isOk } from '../../libs/result';
import type { BlockEffectOptions, BlockEffectHandle } from './types';

export type { BlockEffectOptions, BlockEffectHandle };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FOV = 60;
const CAMERA_DIST = 10;

// BoxGeometry face order: +X, -X, +Y, -Y, +Z (front), -Z
// Front face (+Z) is face index 4.
// With 1 segment per dimension: 4 verts × 2 UV components × 4 preceding faces = offset 32.
const FRONT_UV_OFFSET = 32;

const DEFAULTS: Required<Omit<BlockEffectOptions, 'source'>> = {
  blockSize: 40,
  gap: 0.04,
  depthRatio: 0.9,
  hoverRadius: 0.22,
  pushStrength: 0.55,
  waveSpeed: 0.9,
  waveAmplitude: 0.4,
  lerpFactor: 0.13,
};

// ---------------------------------------------------------------------------
// Texture capture
// ---------------------------------------------------------------------------

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`BlockEffect: failed to load "${src}"`));
    img.src = src;
  });
}

async function resolveSource(
  el: HTMLElement,
  source: BlockEffectOptions['source'],
): Promise<HTMLCanvasElement | null> {
  const W = el.offsetWidth;
  const H = el.offsetHeight;
  if (!W || !H) return null;

  // Fresh canvas per attempt — a tainted canvas cannot be un-tainted.
  function makeCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    return { canvas, ctx: canvas.getContext('2d')! };
  }

  // Draw and validate: getImageData throws if the canvas was tainted by a
  // cross-origin draw (drawImage succeeds but marks the canvas origin-dirty,
  // which then causes gl.texImage2D to throw a SecurityError).
  async function tryDraw(drawable: CanvasImageSource): Promise<HTMLCanvasElement | null> {
    const { canvas, ctx } = makeCanvas();
    try {
      ctx.drawImage(drawable, 0, 0, W, H);
      ctx.getImageData(0, 0, 1, 1); // throws if origin-dirty
      return canvas;
    } catch {
      return null;
    }
  }

  // Explicit source override
  if (source !== undefined) {
    if (typeof source === 'string') {
      try {
        const result = await tryDraw(await loadImage(source));
        if (result) return result;
      } catch { /* fall through */ }
    } else {
      if (source instanceof HTMLImageElement && !source.complete) {
        await new Promise<void>(r => { source.onload = () => r(); });
      }
      const result = await tryDraw(source);
      if (result) return result;
    }
  }

  // Auto-detect: first <img> inside element
  const img = el.querySelector<HTMLImageElement>('img');
  if (img) {
    if (!img.complete) await new Promise<void>(r => { img.onload = () => r(); });
    const result = await tryDraw(img);
    if (result) return result;
    // Fallback: reload with crossOrigin='anonymous' (needed when the <img> element
    // lacks the crossorigin attribute; incurs an extra network request).
    if (img.src) {
      try {
        const corsResult = await tryDraw(await loadImage(img.src));
        if (corsResult) return corsResult;
      } catch { /* fall through */ }
    }
  }

  // Auto-detect: CSS background-image URL
  const bg = getComputedStyle(el).backgroundImage;
  const urlMatch = bg.match(/url\(["']?([^"')]+)["']?\)/);
  if (urlMatch) {
    try {
      const result = await tryDraw(await loadImage(urlMatch[1]));
      if (result) return result;
    } catch { /* fall through */ }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Per-element Three.js setup
// ---------------------------------------------------------------------------

type InstanceData = { col: number; row: number; phase: number };
type ResolvedOpts = Required<Omit<BlockEffectOptions, 'source'>>;

function setupElement(
  el: HTMLElement,
  opts: ResolvedOpts,
  srcCanvas: HTMLCanvasElement | null,
): () => void {
  const W = el.offsetWidth;
  const H = el.offsetHeight;

  // Overlay canvas
  const canvas = document.createElement('canvas');
  canvas.style.cssText =
    'position:absolute;top:0;left:0;width:100%;height:100%;display:block;pointer-events:none;';
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
  el.appendChild(canvas);

  const dpr = typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(dpr);
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 200);
  camera.position.set(0, 0, CAMERA_DIST);

  // World-space dimensions of the view plane at Z=0
  const vFovRad = (FOV * Math.PI) / 180;
  const viewH = 2 * Math.tan(vFovRad / 2) * CAMERA_DIST;
  const viewW = viewH * (W / H);

  // Grid from blockSize (CSS px → world units via aspect ratio)
  const COLS = Math.max(1, Math.round(W / opts.blockSize));
  const ROWS = Math.max(1, Math.round(H / opts.blockSize));
  const cellW = viewW / COLS;
  const cellH = viewH / ROWS;

  const bw = cellW * (1 - opts.gap);
  const bh = cellH * (1 - opts.gap);
  const bd = cellW * opts.depthRatio;

  // Shared texture (one upload to GPU, UV region baked per block geometry)
  const texture = srcCanvas ? new THREE.CanvasTexture(srcCanvas) : null;

  // Shared materials — front face uses the texture, sides use a dark solid color
  const sideMat = new THREE.MeshPhongMaterial({
    color: 0x111118,
    specular: 0x223344,
    shininess: 15,
  });
  const frontMat = texture
    ? new THREE.MeshPhongMaterial({ map: texture, specular: 0x334455, shininess: 50 })
    : new THREE.MeshPhongMaterial({ color: 0x888888, specular: 0x334455, shininess: 50 });
  const matArray: THREE.Material[] = [sideMat, sideMat, sideMat, sideMat, frontMat, sideMat];

  // Template geometry (cloned per block to bake UV without re-uploading the texture)
  const baseGeo = new THREE.BoxGeometry(bw, bh, bd);

  const blocks: THREE.Mesh[] = [];
  const instanceData: InstanceData[] = [];
  const geos: THREE.BufferGeometry[] = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const geo = baseGeo.clone();
      geos.push(geo);

      if (texture) {
        // Rewrite front face UVs to map this block's region of the source image.
        // UV V=1 → image top (flipY=true default), V=0 → image bottom.
        const uvAttr = geo.getAttribute('uv') as THREE.BufferAttribute;
        const arr = uvAttr.array as Float32Array;
        const u0 = col / COLS;
        const u1 = (col + 1) / COLS;
        const vTop = (ROWS - row) / ROWS;
        const vBot = (ROWS - row - 1) / ROWS;

        // Vertex order within face: top-left, top-right, bottom-left, bottom-right
        arr[FRONT_UV_OFFSET + 0] = u0; arr[FRONT_UV_OFFSET + 1] = vTop;
        arr[FRONT_UV_OFFSET + 2] = u1; arr[FRONT_UV_OFFSET + 3] = vTop;
        arr[FRONT_UV_OFFSET + 4] = u0; arr[FRONT_UV_OFFSET + 5] = vBot;
        arr[FRONT_UV_OFFSET + 6] = u1; arr[FRONT_UV_OFFSET + 7] = vBot;
        uvAttr.needsUpdate = true;
      }

      const mesh = new THREE.Mesh(geo, matArray);
      const x = -viewW / 2 + cellW * (col + 0.5);
      const y = viewH / 2 - cellH * (row + 0.5);
      mesh.position.set(x, y, 0);

      scene.add(mesh);
      blocks.push(mesh);
      instanceData.push({ col, row, phase: Math.random() * Math.PI * 2 });
    }
  }

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const dLight = new THREE.DirectionalLight(0xffffff, 0.9);
  dLight.position.set(4, 6, 10);
  scene.add(dLight);
  const fLight = new THREE.DirectionalLight(0x6688bb, 0.3);
  fLight.position.set(-6, -4, 5);
  scene.add(fLight);

  // Mouse / touch tracking (events on the wrapper; canvas is pointer-events:none)
  let hover = false;
  const ndcM = new THREE.Vector2();
  const worldM = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const zPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

  function getClientXY(e: MouseEvent | TouchEvent) {
    return 'touches' in e
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX, y: e.clientY };
  }

  function onPointerMove(e: MouseEvent | TouchEvent) {
    const r = el.getBoundingClientRect();
    const { x, y } = getClientXY(e);
    ndcM.x = ((x - r.left) / W) * 2 - 1;
    ndcM.y = -(((y - r.top) / H) * 2 - 1);
    hover = true;
  }
  function onPointerLeave() {
    hover = false;
  }

  el.addEventListener('mousemove', onPointerMove as EventListener);
  el.addEventListener('touchmove', onPointerMove as EventListener, { passive: false });
  el.addEventListener('mouseleave', onPointerLeave);
  el.addEventListener('touchend', onPointerLeave);

  // Animation
  let t = 0;
  let rafId = 0;
  const R = viewW * opts.hoverRadius;

  function animate() {
    rafId = requestAnimationFrame(animate);
    t += 0.016;

    if (hover) {
      raycaster.setFromCamera(ndcM, camera);
      raycaster.ray.intersectPlane(zPlane, worldM);
    }

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const id = instanceData[i];
      let tz = 0;

      if (hover) {
        const dx = block.position.x - worldM.x;
        const dy = block.position.y - worldM.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < R) {
          const s = 1 - dist / R;
          tz = s * s * CAMERA_DIST * opts.pushStrength;
        }
      } else {
        tz =
          Math.sin(t * opts.waveSpeed + id.col * 0.35 + id.row * 0.28 + id.phase) *
          cellH *
          opts.waveAmplitude;
      }

      block.position.z += (tz - block.position.z) * opts.lerpFactor;
    }

    renderer.render(scene, camera);
  }

  animate();

  return () => {
    cancelAnimationFrame(rafId);
    el.removeEventListener('mousemove', onPointerMove as EventListener);
    el.removeEventListener('touchmove', onPointerMove as EventListener);
    el.removeEventListener('mouseleave', onPointerLeave);
    el.removeEventListener('touchend', onPointerLeave);
    texture?.dispose();
    baseGeo.dispose();
    geos.forEach(g => g.dispose());
    sideMat.dispose();
    frontMat.dispose();
    renderer.dispose();
    canvas.remove();
  };
}

// ---------------------------------------------------------------------------
// Public factory
// ---------------------------------------------------------------------------

export async function createBlockEffect(
  target: string | HTMLElement,
  options: BlockEffectOptions = {},
): Promise<Result<BlockEffectHandle, string>> {
  if (typeof window === 'undefined') {
    return err('BlockEffect requires a browser environment');
  }

  const opts: ResolvedOpts = { ...DEFAULTS, ...options };

  const elements: HTMLElement[] =
    typeof target === 'string'
      ? [...document.querySelectorAll<HTMLElement>(target)]
      : [target];

  if (!elements.length) {
    return err(`BlockEffect: no elements found for "${String(target)}"`);
  }

  const destroyFns = await Promise.all(
    elements.map(async el => {
      const srcCanvas = await resolveSource(el, options.source);
      return setupElement(el, opts, srcCanvas);
    }),
  );

  return ok({
    destroy() {
      destroyFns.forEach(fn => fn());
    },
  });
}

// ---------------------------------------------------------------------------
// Setup — query selector, read data-block-size per element, initialize all.
// Returns ok even when some elements fail (partial success).
// Returns err only when no elements are found or all fail.
// ---------------------------------------------------------------------------

export async function setupBlockEffect(
  selector: string,
): Promise<Result<BlockEffectHandle, string>> {
  if (typeof window === 'undefined') {
    return err('BlockEffect requires a browser environment');
  }

  const elements = [...document.querySelectorAll<HTMLElement>(selector)];
  if (!elements.length) {
    return err(`No elements matched selector: "${selector}"`);
  }

  const results = await Promise.all(
    elements.map(el =>
      createBlockEffect(el, { blockSize: Number(el.dataset.blockSize) || 40 }),
    ),
  );

  const handles = results.flatMap(r => (isOk(r) ? [r.value] : []));

  if (import.meta.env.DEV) {
    results.forEach(r => {
      if (!isOk(r)) console.warn('[BlockEffect] setup failed:', r.error);
    });
  }

  if (!handles.length) {
    return err('All elements failed to initialize');
  }

  return ok({ destroy: () => handles.forEach(h => h.destroy()) });
}
