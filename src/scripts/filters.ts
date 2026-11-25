// Filter buttons (projects, certificates). Cards glide to their new spots with GSAP Flip.
import { gsap, Flip, ScrollTrigger, reduceMotion } from './motion';

export function initFilters() {
  document.querySelectorAll<HTMLElement>('[data-filter-group]').forEach((group) => {
    const target = document.querySelector<HTMLElement>(group.dataset.filterGroup || '');
    if (!target) return;
    const items = [...target.querySelectorAll<HTMLElement>('[data-flip-item]')];
    const buttons = [...group.querySelectorAll<HTMLButtonElement>('[data-filter]')];

    buttons.forEach((btn) =>
      btn.addEventListener('click', () => {
        const value = btn.dataset.filter;
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        const state = Flip.getState(items);
        items.forEach((it) => { it.hidden = !(value === 'all' || it.dataset.category === value); });
        Flip.from(state, {
          duration: reduceMotion ? 0 : 0.8,
          ease: 'power3.inOut',
          absolute: true,
          scale: true,
          onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6 }),
          onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.4 }),
          onComplete: () => ScrollTrigger.refresh(),
        });
      }),
    );
  });
}
