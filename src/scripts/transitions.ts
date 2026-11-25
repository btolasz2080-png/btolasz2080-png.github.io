// Chessboard page transition: 64 squares flip closed before leaving a page
// and flip open when the next page arrives.
import { gsap, reduceMotion } from './motion';

const html = document.documentElement;
const GRID: [number, number] = [8, 8];

function store(on: boolean) {
  try {
    on ? sessionStorage.setItem('pt', '1') : sessionStorage.removeItem('pt');
  } catch {
    /* storage can be blocked — the site still works, just without the cover */
  }
}

/** Returns a timeline that uncovers the page (or null if there's nothing to uncover). */
export function initTransitions(): gsap.core.Timeline | null {
  const tiles = gsap.utils.toArray<HTMLElement>('.pt i');
  const mark = document.querySelector('.pt-mark');
  let enterTl: gsap.core.Timeline | null = null;

  if (html.classList.contains('pt-enter')) {
    gsap.set(tiles, { scaleY: 1 });
    gsap.set(mark, { autoAlpha: 1 });
    html.classList.remove('pt-enter');
    enterTl = gsap
      .timeline({ delay: 0.05 })
      .to(mark, { autoAlpha: 0, y: -16, duration: 0.3, ease: 'power2.in' })
      .to(tiles, { scaleY: 0, transformOrigin: '50% 0%', duration: 0.55, ease: 'power3.inOut', stagger: { grid: GRID, from: 'end', amount: 0.45 } }, '-=0.1');
  }
  store(false);

  if (reduceMotion) return enterTl;

  const leave = (href: string, from?: HTMLElement | null) => {
    html.classList.add('pt-busy');
    store(true);
    if (from?.hasAttribute('data-folder')) gsap.to(from, { y: '-=26', duration: 0.4, ease: 'power3.out' });
    gsap
      .timeline({ onComplete: () => { window.location.href = href; } })
      .set(mark, { y: 16 })
      .to(tiles, { scaleY: 1, transformOrigin: '50% 100%', duration: 0.5, ease: 'power3.inOut', stagger: { grid: GRID, from: 'start', amount: 0.4 } })
      .to(mark, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, '-=0.25');
  };

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element).closest?.('a');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    const raw = a.getAttribute('href') || '';
    if (!raw || raw.startsWith('#') || /^(mailto|tel):/.test(raw)) return;
    const next = new URL(a.href, window.location.href);
    if (next.origin !== window.location.origin) return;
    if (next.pathname === window.location.pathname && next.hash) return;
    if (/\.(pdf|png|jpe?g|svg|zip|webp)$/i.test(next.pathname)) return;
    e.preventDefault();
    leave(next.href, a);
  });

  // Coming back with the browser "Back" button restores the old page from
  // memory — make sure the board is open again.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    gsap.set(tiles, { scaleY: 0 });
    gsap.set(mark, { autoAlpha: 0 });
    gsap.set('[data-folder]', { y: 0 });
    html.classList.remove('pt-busy');
    store(false);
  });

  return enterTl;
}
