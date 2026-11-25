// Mobile menu and contact form.
import { gsap, reduceMotion } from './motion';
import { site } from '../data/site';

export function initMenu() {
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-btn]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  if (!btn || !menu) return;
  const links = menu.querySelectorAll('[data-menu-link]');
  const html = document.documentElement;

  const setOpen = (open: boolean) => {
    btn.setAttribute('aria-expanded', String(open));
    html.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      gsap.fromTo(menu, { clipPath: 'circle(0% at 95% 4%)' }, { clipPath: 'circle(150% at 95% 4%)', duration: reduceMotion ? 0 : 0.8, ease: 'power3.inOut' });
      gsap.fromTo(links, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.05, delay: 0.25 });
    } else {
      gsap.to(menu, { clipPath: 'circle(0% at 95% 4%)', duration: reduceMotion ? 0 : 0.6, ease: 'power3.inOut', onComplete: () => { menu.hidden = true; } });
    }
  };
  btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && html.classList.contains('menu-open')) setOpen(false); });
}

export function initContactForm() {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    if (!site.formEndpoint) {
      // No form service configured yet: open the visitor's email app instead.
      const subject = encodeURIComponent(`Portfolio message from ${data.get('name')}`);
      const body = encodeURIComponent(`${data.get('message')}\n\n— ${data.get('name')} (${data.get('email')})`);
      window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
      return;
    }
    status.textContent = 'Sending…';
    try {
      const res = await fetch(site.formEndpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error();
      form.reset();
      status.textContent = 'Checkmate — your message is on its way. Thank you!';
    } catch {
      status.textContent = `Something went wrong. Please email me directly at ${site.email}.`;
    }
  });
}
