// Realistic folders: hover tips the front flap open and the papers rise out.
import { gsap, finePointer, reduceMotion } from './motion';

export function initFolders() {
  document.querySelectorAll<HTMLElement>('[data-fld]').forEach((fld) => {
    const front = fld.querySelector<HTMLElement>('[data-fld-front]');
    const papers = [...fld.querySelectorAll<HTMLElement>('.paper')];
    if (!front) return;
    const d = reduceMotion ? 0 : 1;

    const open = () => {
      gsap.to(front, { rotationX: -32, y: 6, duration: 0.7 * d, ease: 'power3.out', overwrite: 'auto' });
      papers.forEach((p, j) => gsap.to(p, { yPercent: -26 - (2 - j) * 7, rotation: (j - 1) * 4, duration: 0.7 * d, ease: 'power3.out', delay: j * 0.04 * d, overwrite: 'auto' }));
      gsap.to(fld, { y: -8, duration: 0.6 * d, ease: 'power3.out', overwrite: 'auto' });
    };
    const close = () => {
      gsap.to(front, { rotationX: 0, y: 0, duration: 0.8 * d, ease: 'power3.inOut', overwrite: 'auto' });
      papers.forEach((p, j) => gsap.to(p, { yPercent: 0, rotation: (j - 1) * 1.4, duration: 0.7 * d, ease: 'power3.inOut', overwrite: 'auto' }));
      gsap.to(fld, { y: 0, rotationY: 0, rotationX: 0, duration: 0.8 * d, ease: 'power3.inOut', overwrite: 'auto' });
    };

    fld.addEventListener('pointerenter', open);
    fld.addEventListener('focus', open);
    fld.addEventListener('pointerleave', close);
    fld.addEventListener('blur', close);

    if (finePointer && !reduceMotion) {
      gsap.set(fld, { transformPerspective: 900 });
      const ry = gsap.quickTo(fld, 'rotationY', { duration: 0.8, ease: 'power3' });
      const rx = gsap.quickTo(fld, 'rotationX', { duration: 0.8, ease: 'power3' });
      fld.addEventListener('pointermove', (e) => {
        const r = fld.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 12);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
      });
    }
  });
}
