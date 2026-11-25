// The hero chessboard. The queen is the main piece:
//  • the board tilts toward the mouse
//  • hovering the queen shows her legal moves as gold dots
//  • clicking a gold dot moves her there (pressing the queen picks a move for you)
import { gsap, finePointer, reduceMotion } from './motion';

const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];

export function initChess(): gsap.core.Timeline | null {
  const root = document.querySelector<HTMLElement>('[data-chess]');
  if (!root) return null;
  const board = root.querySelector<HTMLElement>('[data-board]')!;
  const queen = root.querySelector<HTMLElement>('[data-queen]')!;
  const qBtn = queen.querySelector<HTMLButtonElement>('.queen-btn')!;
  const qSvg = qBtn.querySelector('svg');
  const glow = qBtn.querySelector('.queen-glow');
  const squares = [...board.querySelectorAll<HTMLElement>('.sq')];
  const at = (r: number, c: number) => squares[r * 8 + c];
  const occupied = new Set([...board.querySelectorAll<HTMLElement>('[data-piece]')].map((p) => `${p.dataset.r},${p.dataset.c}`));

  let qr = Number(queen.dataset.r);
  let qc = Number(queen.dataset.c);
  let legal: HTMLElement[] = [];
  let moving = false;

  const computeLegal = () => {
    const out: HTMLElement[] = [];
    for (const [dr, dc] of DIRS) {
      let r = qr + dr, c = qc + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8 && !occupied.has(`${r},${c}`)) {
        out.push(at(r, c));
        r += dr; c += dc;
      }
    }
    return out;
  };

  const hideMoves = () => {
    legal.forEach((s) => s.classList.remove('legal'));
    gsap.to(legal.map((s) => s.querySelector('.dot')), { scale: 0, opacity: 0, duration: 0.25, overwrite: true });
    legal = [];
    gsap.to(glow, { opacity: 0, duration: 0.4 });
  };

  const showMoves = () => {
    if (moving) return;
    hideMoves();
    legal = computeLegal();
    legal.forEach((s) => s.classList.add('legal'));
    // Dots ripple outward from the queen, nearest first.
    const dots = legal.map((s) => s.querySelector('.dot'));
    const delays = legal.map((s) => Math.max(Math.abs(Number(s.dataset.r) - qr), Math.abs(Number(s.dataset.c) - qc)));
    dots.forEach((d, i) => gsap.to(d, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2.4)', delay: reduceMotion ? 0 : delays[i] * 0.045, overwrite: true }));
    gsap.to(glow, { opacity: 1, duration: 0.4 });
  };

  const moveTo = (r: number, c: number) => {
    if (moving || (r === qr && c === qc)) return;
    moving = true;
    hideMoves();
    const dist = Math.max(Math.abs(r - qr), Math.abs(c - qc));
    const travel = reduceMotion ? 0 : 0.35 + dist * 0.07;
    gsap.timeline({
      onComplete: () => {
        qr = r; qc = c;
        queen.dataset.r = String(r); queen.dataset.c = String(c);
        moving = false;
        if (finePointer && board.matches(':hover')) showMoves();
      },
    })
      .to(qBtn, { y: -34, scale: 1.06, duration: reduceMotion ? 0 : 0.22, ease: 'power2.out' })
      .to(queen, { '--r': r, '--c': c, duration: travel, ease: 'power2.inOut' }, '<0.08')
      .to(qBtn, { y: 0, scale: 1, duration: reduceMotion ? 0 : 0.5, ease: 'bounce.out' }, '>-0.12')
      .fromTo(at(r, c), { filter: 'brightness(1.6)' }, { filter: 'brightness(1)', duration: 0.8, ease: 'power2.out' }, '<0.1');
  };

  qBtn.addEventListener('pointerenter', showMoves);
  qBtn.addEventListener('focus', showMoves);
  qBtn.addEventListener('blur', () => { if (!board.matches(':hover')) hideMoves(); });
  board.addEventListener('pointerleave', hideMoves);
  qBtn.addEventListener('click', () => {
    const options = computeLegal();
    if (!options.length) return;
    const pick = options[Math.floor(Math.random() * options.length)];
    moveTo(Number(pick.dataset.r), Number(pick.dataset.c));
  });
  squares.forEach((s) =>
    s.addEventListener('click', () => {
      if (s.classList.contains('legal')) moveTo(Number(s.dataset.r), Number(s.dataset.c));
    }),
  );

  if (reduceMotion) return null;

  // Idle: the queen breathes gently.
  if (qSvg) gsap.to(qSvg, { y: -5, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  // Board follows the mouse across the whole hero.
  if (finePointer) {
    const host = (root.closest('[data-hero]') as HTMLElement) || root;
    const tilt = gsap.quickTo(board, '--tilt', { duration: 1.1, ease: 'power3' });
    const spin = gsap.quickTo(board, '--spin', { duration: 1.1, ease: 'power3' });
    host.addEventListener('pointermove', (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      tilt(54 + ny * 10);
      spin(nx * -14);
    });
    host.addEventListener('pointerleave', () => { tilt(54); spin(0); });
  }

  // Intro: board settles, pieces drop onto their squares, queen last.
  const pieces = [...board.querySelectorAll<HTMLElement>('[data-piece] .lift')];
  return gsap
    .timeline({ paused: true })
    .fromTo(board, { '--tilt': 82, '--spin': -24, opacity: 0, y: 60 }, { '--tilt': 54, '--spin': 0, opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' })
    .from(squares, { opacity: 0, duration: 0.4, stagger: { grid: [8, 8], from: 'center', amount: 0.6 } }, 0.1)
    .from(pieces, { y: -140, opacity: 0, duration: 0.9, ease: 'bounce.out', stagger: 0.07 }, 0.7)
    .from(qBtn, { y: -220, opacity: 0, duration: 1.1, ease: 'bounce.out' }, 1.1)
    .from('[data-chess] .chess-seal, [data-chess] .chess-hint', { opacity: 0, scale: 0.8, duration: 0.8, ease: 'back.out(2)', stagger: 0.1 }, 1.5)
    .add(() => {
      // A one-time hint: flash the queen's moves so visitors know it's interactive.
      showMoves();
      gsap.delayedCall(1.6, () => { if (!board.matches(':hover')) hideMoves(); });
    }, 2.2);
}
