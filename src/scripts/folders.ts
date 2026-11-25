// Drop-down folders: hover tips the flap and lifts the papers; click opens
// the folder and drops the list of files underneath.
import { gsap, finePointer, reduceMotion } from './motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initFolders() {
  document.querySelectorAll<HTMLElement>('[data-fld]').forEach((fld) => {
    const face = fld.querySelector<HTMLButtonElement>('[data-fld-toggle]');
    const front = fld.querySelector<HTMLElement>('[data-fld-front]');
    const drop = fld.querySelector<HTMLElement>('[data-fld-drop]');
    const papers = [...fld.querySelectorAll<HTMLElement>('.paper')];
    if (!face || !front || !drop) return;
    const d = reduceMotion ? 0 : 1;
    let open = false;

    const peek = (on: boolean) => {
      const lift = open || on;
      gsap.to(front, { rotationX: lift ? (open ? -38 : -24) : 0, duration: 0.7 * d, ease: 'power3.out', overwrite: 'auto' });
      papers.forEach((p, j) => gsap.to(p, { yPercent: lift ? -(open ? 34 : 20) - (2 - j) * 7 : 0, rotation: lift ? (j - 1) * 4 : (j - 1) * 1.4, duration: 0.7 * d, ease: 'power3.out', delay: j * 0.04 * d, overwrite: 'auto' }));
    };

    const toggle = () => {
      open = !open;
      fld.classList.toggle('is-open', open);
      face.setAttribute('aria-expanded', String(open));
      peek(true);
      if (open) {
        drop.hidden = false;
        gsap.fromTo(drop, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.6 * d, ease: 'power3.out', onComplete: () => ScrollTrigger.refresh() });
        gsap.fromTo(drop.querySelectorAll('li'), { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45 * d, stagger: 0.05 * d, delay: 0.15 * d, ease: 'power3.out' });
      } else {
        gsap.to(drop, { height: 0, opacity: 0, duration: 0.45 * d, ease: 'power3.inOut', onComplete: () => { drop.hidden = true; ScrollTrigger.refresh(); } });
        peek(false);
      }
    };

    face.addEventListener('click', toggle);
    face.addEventListener('pointerenter', () => peek(true));
    face.addEventListener('pointerleave', () => peek(false));

    if (finePointer && !reduceMotion) {
      gsap.set(face, { transformPerspective: 900 });
      const ry = gsap.quickTo(face, 'rotationY', { duration: 0.8, ease: 'power3' });
      const rx = gsap.quickTo(face, 'rotationX', { duration: 0.8, ease: 'power3' });
      face.addEventListener('pointermove', (e) => {
        const r = face.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 12);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
      });
      face.addEventListener('pointerleave', () => { ry(0); rx(0); });
    }
  });
}
