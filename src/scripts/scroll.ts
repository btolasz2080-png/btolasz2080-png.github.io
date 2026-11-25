// Scroll-triggered animations: reveals, split headings, parallax, counters,
// marquees, the rotating seal and the auto-hiding header.
import { gsap, ScrollTrigger, SplitText, reduceMotion } from './motion';

export function initReveals() {
  const splits = gsap.utils.toArray<HTMLElement>('[data-split]');
  if (reduceMotion) {
    gsap.set('[data-reveal]', { opacity: 1 });
    gsap.set(splits, { visibility: 'visible' });
    return;
  }

  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%',
    once: true,
    onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.09, overwrite: true }),
  });

  splits.forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit(self) {
        gsap.set(el, { visibility: 'visible' });
        return gsap.from(self.lines, {
          yPercent: 115, rotation: 2, duration: 1.2, ease: 'power4.out', stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      },
    });
  });

  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
    const amount = parseFloat(el.dataset.parallax || '0.15');
    gsap.fromTo(el, { yPercent: amount * 100 }, { yPercent: -amount * 100, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  gsap.utils.toArray<HTMLElement>('[data-draw]').forEach((el) => {
    gsap.from(el, { scaleX: 0, transformOrigin: 'left center', duration: 1.4, ease: 'power3.inOut', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });
}

export function initCounters() {
  gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count || '0');
    const pad = (n: number) => String(Math.round(n)).padStart(2, '0');
    if (reduceMotion) { el.textContent = pad(end); return; }
    const obj = { v: 0 };
    el.textContent = pad(0);
    gsap.to(obj, {
      v: end, duration: 1.8, ease: 'power2.out',
      onUpdate: () => { el.textContent = pad(obj.v); },
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
    });
  });
}

export function initMarquees() {
  gsap.utils.toArray<HTMLElement>('[data-marquee]').forEach((el) => {
    const track = el.querySelector<HTMLElement>('.marquee-track');
    if (!track || reduceMotion) return;
    const dir = el.dataset.marquee === 'right' ? 1 : -1;
    const tween = gsap.fromTo(track, { xPercent: dir === -1 ? 0 : -50 }, { xPercent: dir === -1 ? -50 : 0, duration: 38, ease: 'none', repeat: -1 });
    // Scrolling makes the ribbon run faster for a moment.
    ScrollTrigger.create({
      trigger: el, start: 'top bottom', end: 'bottom top',
      onUpdate: (self) => {
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 250, 6);
        gsap.to(tween, { timeScale: boost, duration: 0.2, overwrite: true, onComplete: () => { gsap.to(tween, { timeScale: 1, duration: 1.2 }); } });
      },
    });
  });
}

export function initSeals() {
  gsap.utils.toArray<HTMLElement>('[data-seal] .seal-ring').forEach((ring) => {
    if (reduceMotion) return;
    const spin = gsap.to(ring, { rotation: 360, duration: 28, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
    ScrollTrigger.create({
      onUpdate: (self) => {
        gsap.to(spin, { timeScale: (self.direction || 1) * (1 + Math.min(Math.abs(self.getVelocity()) / 120, 12)), duration: 0.15, overwrite: true,
          onComplete: () => { gsap.to(spin, { timeScale: 1, duration: 1.5 }); } });
      },
    });
  });
}

export function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  let hidden = false;
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const y = self.scroll();
      header.classList.toggle('scrolled', y > 30);
      const menuOpen = document.documentElement.classList.contains('menu-open');
      const shouldHide = !menuOpen && self.direction === 1 && y > 260;
      if (shouldHide !== hidden) {
        hidden = shouldHide;
        gsap.to(header, { yPercent: hidden ? -100 : 0, duration: 0.5, ease: 'power3.out' });
      }
    },
  });
}
