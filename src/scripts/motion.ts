// Shared GSAP setup: plugins, smooth scrolling and accessibility flags.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip);

// Respect visitors who turned animations off in their device settings.
export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Mouse-only effects (custom cursor, tilt, magnetic) are skipped on touch screens.
export const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export let lenis: Lenis | null = null;

export function initSmoothScroll() {
  if (reduceMotion) return;
  lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll<HTMLAnchorElement>('[data-to-top]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      lenis?.scrollTo(0, { duration: 1.6 });
    }),
  );
}

export { gsap, ScrollTrigger, SplitText, Flip };
