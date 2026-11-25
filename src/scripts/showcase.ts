// Hero devices: each device floats gently and drifts with the mouse at its own depth.
import { gsap, finePointer, reduceMotion } from './motion';

export function initShowcase() {
  const root = document.querySelector<HTMLElement>('[data-showcase]');
  if (!root || reduceMotion) return null;
  const layers = [...root.querySelectorAll<HTMLElement>('[data-layer]')];

  // idle float — on a wrapper property (yPercent) so it never fights the mouse (x / y)
  layers.forEach((el, i) => {
    const t = parseFloat(el.dataset.float || '0');
    if (t) gsap.to(el, { yPercent: i % 2 ? 2.5 : -2.5, rotation: i % 2 ? 0.6 : -0.6, duration: t, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  });

  if (finePointer) {
    const movers = layers.map((el) => ({
      d: parseFloat(el.dataset.layer || '0'),
      x: gsap.quickTo(el, 'x', { duration: 1, ease: 'power3' }),
      y: gsap.quickTo(el, 'y', { duration: 1, ease: 'power3' }),
      ry: gsap.quickTo(el, 'rotationY', { duration: 1.2, ease: 'power3' }),
      rx: gsap.quickTo(el, 'rotationX', { duration: 1.2, ease: 'power3' }),
    }));
    gsap.set(layers, { transformPerspective: 1200 });
    const host = (root.closest('[data-hero]') as HTMLElement) || root;
    host.addEventListener('pointermove', (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      movers.forEach((m) => { m.x(nx * m.d); m.y(ny * m.d * 0.7); m.ry(nx * 14); m.rx(-ny * 10); });
    });
    host.addEventListener('pointerleave', () => movers.forEach((m) => { m.x(0); m.y(0); m.ry(0); m.rx(0); }));
  }

  // entrance timeline, played by the hero intro
  return gsap.timeline({ paused: true })
    .fromTo(layers.filter((l) => l.matches('.dev')), { opacity: 0, y: 120, rotationX: 25 }, { opacity: 1, y: 0, rotationX: 0, duration: 1.4, ease: 'power4.out', stagger: 0.15, immediateRender: true });
}
