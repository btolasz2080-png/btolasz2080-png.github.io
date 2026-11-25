// The binary queen: a chess queen standing on a chessboard, drawn entirely
// with 0s and 1s. Every digit is a tiny particle on a spring:
//  • on load the digits flow in from everywhere and assemble the queen
//  • move the mouse through her and the digits part like liquid, then flow back
//  • click to send a ripple across the board
//  • digits keep flipping 0 ↔ 1 and a soft light scan passes over her
import { reduceMotion, finePointer } from './motion';

// Same silhouette as the queen icon used across the site (viewBox 0 0 100 170)
const QUEEN = [
  'M35 76 Q43 84 43 98 Q43 118 30 138 L70 138 Q57 118 57 98 Q57 84 65 76 Z',
  'M22 40 L33 70 L67 70 L78 40 L67 55 L65 30 L57 52 L50 24 L43 52 L35 30 L33 55 Z',
  'M30 67 H70 V76 H30 Z',
  'M37 104 H63 V109 H37 Z',
  'M24 138 H76 Q81 138 81 143 V147 H19 V143 Q19 138 24 138 Z',
  'M15 147 H85 V159 H15 Z',
];
const BALLS: [number, number, number][] = [[50, 15, 6.5], [22, 38, 3.8], [35, 28, 3.8], [65, 28, 3.8], [78, 38, 3.8]];

const GOLD = ['#5E400F', '#7C5A1A', '#9C7630', '#B8913F', '#CFAE62', '#E2C98A', '#F4E3B0', '#FFF6D8'];
const BLUE = ['#3B5568', '#56748C', '#7393AC', '#94B1C8', '#B9CFDF'];
const WINE = ['#4A0E16', '#6A1A26', '#8C2836', '#AE3D4C'];

type P = { hx: number; hy: number; x: number; y: number; vx: number; vy: number; ch: string; tone: 0 | 1 | 2; lvl: number; a: number; delay: number };

export function initBinaryQueen() {
  const host = document.querySelector<HTMLElement>('[data-binary-queen]');
  if (!host) return null;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d')!;

  let W = 0, H = 0, cell = 10, dpr = 1;
  let parts: P[] = [];
  let buckets: P[][] = [];
  const mouse = { x: -9999, y: -9999, active: false };
  const ripples: { x: number; y: number; t: number }[] = [];
  let start = performance.now();
  let running = true;

  const build = () => {
    const r = host.getBoundingClientRect();
    W = Math.max(280, Math.floor(r.width));
    H = Math.max(280, Math.floor(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    cell = W < 480 ? 8 : W < 700 ? 9 : 10;

    // 1 — paint the shapes into an offscreen mask
    const m = document.createElement('canvas');
    m.width = W; m.height = H;
    const mc = m.getContext('2d', { willReadFrequently: true })!;

    // board (red channel): perspective trapezoid
    const bTop = H * 0.64, bBot = H * 0.985, topW = W * 0.5, botW = W * 0.98, cx = W / 2;
    mc.fillStyle = '#f00';
    mc.beginPath();
    mc.moveTo(cx - topW / 2, bTop); mc.lineTo(cx + topW / 2, bTop); mc.lineTo(cx + botW / 2, bBot); mc.lineTo(cx - botW / 2, bBot);
    mc.closePath(); mc.fill();

    // queen (green channel), standing on the board
    const qH = H * 0.8;
    const s = qH / 160;
    const sx = s * 1.45; // a fuller, more regal silhouette
    const qx = cx - 50 * sx, qy = H * 0.86 - 159 * s;
    mc.save();
    mc.translate(qx, qy);
    mc.scale(sx, s);
    mc.fillStyle = '#0f0';
    mc.globalCompositeOperation = 'source-over';
    QUEEN.forEach((d) => mc.fill(new Path2D(d)));
    BALLS.forEach(([x, y, rr]) => { mc.beginPath(); mc.arc(x, y, rr, 0, Math.PI * 2); mc.fill(); });
    mc.restore();

    const img = mc.getImageData(0, 0, W, H).data;
    const at = (x: number, y: number) => { const i = (Math.floor(y) * W + Math.floor(x)) * 4; return [img[i], img[i + 1]]; };

    // horizontal extent of the queen per row → cylinder-like shading
    const cols = Math.floor(W / (cell * 0.62));
    const rows = Math.floor(H / cell);
    const cw = W / cols;
    parts = [];
    const zn = 1, zf = 2.6;
    for (let row = 0; row < rows; row++) {
      const y = (row + 0.5) * cell;
      let left = -1, right = -1;
      for (let col = 0; col < cols; col++) {
        const x = (col + 0.5) * cw;
        if (at(x, y)[1] > 128) { if (left < 0) left = x; right = x; }
      }
      for (let col = 0; col < cols; col++) {
        const x = (col + 0.5) * cw;
        const [red, green] = at(x, y);
        let tone: 0 | 1 | 2 | -1 = -1, lvl = 0;
        if (green > 128) {
          const t = right > left ? (x - left) / (right - left) : 0.5;
          const light = Math.exp(-(((t - 0.36) / 0.3) ** 2)); // light from the upper-left
          const top = 1 - (y - qy) / qH;
          lvl = Math.min(GOLD.length - 1, Math.round((0.15 + light * 0.75 + top * 0.12) * (GOLD.length - 1)));
          tone = 0;
        } else if (red > 128) {
          const sN = (y - bTop) / (bBot - bTop);
          const invZ = 1 / zf + sN * (1 / zn - 1 / zf);
          const depth = (zf - 1 / invZ) / (zf - zn); // 0 far → 1 near
          const rowW = topW + (botW - topW) * sN;
          const u = (x - (cx - rowW / 2)) / rowW;
          const light = (Math.floor(u * 8) + Math.floor(depth * 8)) % 2 === 0;
          const fade = 0.35 + depth * 0.65;
          if (light) { tone = 1; lvl = Math.round(fade * (BLUE.length - 1)); }
          else { tone = 2; lvl = Math.round(fade * (WINE.length - 1)); }
          // thin the far rows so the board recedes
          if (Math.random() > 0.75 + depth * 0.25) tone = -1;
        }
        if (tone < 0) continue;
        const intro = reduceMotion ? 0 : 1;
        parts.push({
          hx: x, hy: y,
          x: intro ? Math.random() * W : x,
          y: intro ? (Math.random() < 0.5 ? -40 - Math.random() * H * 0.5 : Math.random() * H) : y,
          vx: 0, vy: 0,
          ch: Math.random() < 0.5 ? '0' : '1',
          tone, lvl,
          a: tone === 0 ? 1 : tone === 1 ? 0.9 : 0.75,
          delay: intro ? (1 - y / H) * 0.5 + Math.random() * 0.6 : 0,
        });
      }
    }

    // group by colour so each frame sets fillStyle only a few times
    buckets = [];
    const key = (p: P) => (p.tone === 0 ? p.lvl : p.tone === 1 ? 20 + p.lvl : 40 + p.lvl);
    const map = new Map<number, P[]>();
    parts.forEach((p) => { const k = key(p); if (!map.has(k)) map.set(k, []); map.get(k)!.push(p); });
    buckets = [...map.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
    start = performance.now();
  };

  const colorOf = (p: P) => (p.tone === 0 ? GOLD[p.lvl] : p.tone === 1 ? BLUE[p.lvl] : WINE[p.lvl]);

  const frame = (now: number) => {
    if (!running) return;
    const t = (now - start) / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.font = `500 ${cell}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const R = W < 600 ? 70 : 110;
    const scanY = ((t * 0.22) % 1.4 - 0.2) * H; // a light band sweeping down

    for (const b of buckets) {
      ctx.fillStyle = colorOf(b[0]);
      for (const p of b) {
        if (!reduceMotion) {
          if (t > p.delay) {
            // spring home
            p.vx += (p.hx - p.x) * 0.055;
            p.vy += (p.hy - p.y) * 0.055;
            // liquid push away from the mouse, with a little swirl
            if (mouse.active) {
              const dx = p.x - mouse.x, dy = p.y - mouse.y;
              const d2 = dx * dx + dy * dy;
              if (d2 < R * R) {
                const d = Math.sqrt(d2) || 1;
                const f = (1 - d / R) ** 2 * 9;
                p.vx += (dx / d) * f - (dy / d) * f * 0.35;
                p.vy += (dy / d) * f + (dx / d) * f * 0.35;
              }
            }
            for (const rp of ripples) {
              const age = t - rp.t;
              const dx = p.hx - rp.x, dy = p.hy - rp.y;
              const d = Math.sqrt(dx * dx + dy * dy) || 1;
              const front = age * 520;
              const band = Math.abs(d - front);
              if (band < 40) { const f = (1 - band / 40) * 3.2 * Math.max(0, 1 - age / 1.6); p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
            }
            p.vx *= 0.8; p.vy *= 0.8;
            p.x += p.vx; p.y += p.vy;
          }
          if (Math.random() < 0.004) p.ch = p.ch === '0' ? '1' : '0';
        }
        const near = Math.abs(p.hy - scanY);
        const glow = p.tone === 0 && near < 30 ? 0.35 * (1 - near / 30) : 0;
        const speed = Math.min(1, Math.abs(p.vx) + Math.abs(p.vy));
        ctx.globalAlpha = Math.min(1, p.a * (0.82 + glow) + speed * 0.2);
        ctx.fillText(p.ch, p.x, p.y);
      }
    }
    ctx.globalAlpha = 1;
    while (ripples.length && t - ripples[0].t > 1.8) ripples.shift();
    requestAnimationFrame(frame);
  };

  const local = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const surface = (host.closest('section') as HTMLElement) || host;
  surface.addEventListener('pointermove', (e) => { const p = local(e); mouse.x = p.x; mouse.y = p.y; mouse.active = true; });
  surface.addEventListener('pointerleave', () => { mouse.active = false; });
  canvas.addEventListener('pointerdown', (e) => {
    const p = local(e);
    ripples.push({ x: p.x, y: p.y, t: (performance.now() - start) / 1000 });
    if (!finePointer) { mouse.x = p.x; mouse.y = p.y; mouse.active = true; setTimeout(() => { mouse.active = false; }, 350); }
  });

  // pause when off-screen to save battery
  new IntersectionObserver(([e]) => {
    const was = running;
    running = e.isIntersecting;
    if (running && !was) requestAnimationFrame(frame);
  }).observe(host);

  let rt: number | undefined;
  let lastW = 0, lastH = 0;
  new ResizeObserver(() => {
    const r = host.getBoundingClientRect();
    if (Math.abs(r.width - lastW) < 2 && Math.abs(r.height - lastH) < 2) return;
    clearTimeout(rt);
    rt = window.setTimeout(() => { lastW = r.width; lastH = r.height; build(); }, 150);
  }).observe(host);

  const go = () => { const r = host.getBoundingClientRect(); lastW = r.width; lastH = r.height; build(); requestAnimationFrame(frame); };
  if (document.fonts?.ready) document.fonts.ready.then(go); else go();
  return true;
}
