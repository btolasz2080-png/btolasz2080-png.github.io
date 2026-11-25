// Entry point: wires every animation module together.
import { gsap, ScrollTrigger, SplitText, initSmoothScroll, reduceMotion } from './motion';
import { initTransitions } from './transitions';
import { initCursor, initMagnetic, initTilt } from './pointer';
import { initReveals, initCounters, initMarquees, initSeals, initHeader } from './scroll';
import { initFolders } from './folders';
import { initFilters } from './filters';
import { initBinaryQueen } from './binaryQueen';
import { initShowcase } from './showcase';
import { initMenu, initContactForm } from './ui';

function heroIntro(visualTl: gsap.core.Timeline | null) {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const heading = hero?.querySelector<HTMLElement>('[data-hero-split]');
  if (!hero || !heading) { visualTl?.play(); return null; }
  if (reduceMotion) { gsap.set(heading, { visibility: 'visible' }); gsap.set('[data-hero-in]', { opacity: 1 }); return null; }

  const tl = gsap.timeline({ paused: true });
  SplitText.create(heading, {
    type: 'lines',
    mask: 'lines',
    onSplit(self) {
      gsap.set(heading, { visibility: 'visible' });
      tl.from(self.lines, { yPercent: 115, rotation: 2.5, duration: 1.3, ease: 'power4.out', stagger: 0.11 }, 0.15);
    },
  });
  tl.fromTo(hero.querySelectorAll('[data-hero-in]'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.08 }, 0.5);
  if (visualTl) tl.add(visualTl.play(), 0.2);
  return tl;
}

async function start() {
  initSmoothScroll();
  const enter = initTransitions();
  initHeader();
  initMenu();
  initCursor();
  initMagnetic();
  initTilt();
  initFolders();
  initFilters();
  initCounters();
  initMarquees();
  initSeals();
  initContactForm();

  // Wait for web fonts so SplitText measures lines correctly.
  try { await document.fonts.ready; } catch { /* ignore */ }

  const intro = heroIntro(initShowcase());
  initBinaryQueen();
  initReveals();

  const go = () => intro?.play();
  if (enter) enter.eventCallback('onComplete', go);
  else go();

  ScrollTrigger.refresh();
}

start();
