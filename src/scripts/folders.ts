// "The archive": hovering a folder pulls it out of the stack so its contents show.
import { gsap, finePointer, reduceMotion } from './motion';

export function initFolders() {
  document.querySelectorAll<HTMLElement>('[data-folders]').forEach((stack) => {
    const folders = [...stack.querySelectorAll<HTMLElement>('[data-folder]')];
    const css = getComputedStyle(stack);
    const reveal = () => parseFloat(css.getPropertyValue('--body')) - parseFloat(css.getPropertyValue('--step'));

    const open = (idx: number) => {
      const shift = reveal() / 2;
      const last = idx === folders.length - 1;
      folders.forEach((f, i) => {
        let y = 0;
        if (idx >= 0 && !last) y = i <= idx ? -shift : shift;
        gsap.to(f, { y, duration: reduceMotion ? 0 : 0.75, ease: 'power3.out', overwrite: 'auto' });
        f.classList.toggle('is-open', i === idx);
      });
    };

    folders.forEach((f, i) => {
      f.addEventListener('pointerenter', () => finePointer && open(i));
      f.addEventListener('focus', () => open(i));
      const tab = f.querySelector<HTMLElement>('[data-folder-tab]');
      if (tab && finePointer && !reduceMotion) {
        const tx = gsap.quickTo(tab, 'x', { duration: 0.7, ease: 'power3' });
        f.addEventListener('pointermove', (e) => {
          const r = f.getBoundingClientRect();
          tx(((e.clientX - r.left) / r.width - 0.5) * 60);
        });
        f.addEventListener('pointerleave', () => tx(0));
      }
    });
    stack.addEventListener('pointerleave', () => open(-1));
    stack.addEventListener('focusout', (e) => { if (!stack.contains(e.relatedTarget as Node)) open(-1); });

    if (!reduceMotion) {
      gsap.from(folders, {
        y: 120, opacity: 0, duration: 1.1, ease: 'power4.out', stagger: 0.09,
        scrollTrigger: { trigger: stack, start: 'top 85%', once: true },
        clearProps: 'opacity',
      });
    }
  });
}
