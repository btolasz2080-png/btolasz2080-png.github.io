// Mouse-driven effects: custom cursor, magnetic buttons and 3D tilt.
import { gsap, finePointer, reduceMotion } from './motion';

export function initCursor() {
  if (!finePointer || reduceMotion) return;
  const dot = document.querySelector<HTMLElement>('.cursor');
  const ring = document.querySelector<HTMLElement>('.cursor-ring');
  const label = ring?.querySelector('span');
  if (!dot || !ring || !label) return;

  const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });
  let shown = false;

  window.addEventListener('pointermove', (e) => {
    dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    if (!shown) { document.documentElement.classList.add('has-cursor'); shown = true; }
  });
  document.addEventListener('pointerleave', () => { document.documentElement.classList.remove('has-cursor'); shown = false; });

  let current: Element | null = null;
  document.addEventListener('pointerover', (e) => {
    const target = (e.target as Element).closest('[data-cursor], a, button');
    if (target === current) return;
    current = target;
    const text = target?.getAttribute('data-cursor');
    if (text) {
      label.textContent = text;
      gsap.to(ring, { scale: 2.1, backgroundColor: '#4C050C', borderColor: 'rgba(76,5,12,0)', duration: 0.45, ease: 'power3.out' });
      gsap.to(label, { opacity: 1, scale: 0.62, duration: 0.3 });
      gsap.to(dot, { scale: 0, duration: 0.3 });
    } else {
      gsap.to(ring, { scale: target ? 1.5 : 1, backgroundColor: 'rgba(76,5,12,0)', borderColor: 'rgba(76,5,12,.45)', duration: 0.45, ease: 'power3.out' });
      gsap.to(label, { opacity: 0, scale: 0.6, duration: 0.2 });
      gsap.to(dot, { scale: target ? 0.5 : 1, duration: 0.3 });
    }
  });
}

export function initMagnetic() {
  if (!finePointer || reduceMotion) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.45);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/** [data-tilt]: rotates in 3D toward the mouse; children with [data-depth] float at different depths. */
export function initTilt() {
  if (reduceMotion) return;
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    const layers = [...el.querySelectorAll<HTMLElement>('[data-depth]')].map((layer) => {
      const depth = parseFloat(layer.dataset.depth || '0');
      return { depth, x: gsap.quickTo(layer, 'x', { duration: 0.9, ease: 'power3' }), y: gsap.quickTo(layer, 'y', { duration: 0.9, ease: 'power3' }) };
    });

    if (!finePointer) {
      // Touch screens: a gentle scroll-linked sway instead of mouse tilt.
      gsap.fromTo(el, { rotationY: -8, rotationX: 6, transformPerspective: 1000 }, {
        rotationY: 8, rotationX: -4, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
      });
      return;
    }

    gsap.set(el, { transformPerspective: 1000, transformStyle: 'preserve-3d' });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.9, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.9, ease: 'power3' });
    const host = (el.closest('[data-tilt-host], a') as HTMLElement) || el;

    host.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      rx(-ny * 12);
      ry(nx * 16);
      layers.forEach((l) => { l.x(nx * l.depth); l.y(ny * l.depth * 0.6); });
    });
    host.addEventListener('pointerleave', () => {
      rx(0); ry(0);
      layers.forEach((l) => { l.x(0); l.y(0); });
    });
  });
}
