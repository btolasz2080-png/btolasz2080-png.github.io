# ♛ Computer Science Portfolio

An editorial, chess-themed portfolio built with **Astro** and **GSAP**.
Palette: warm beige `#E3DFCE` · powder blue `#94B1C8` · deep burgundy `#4C050C` · espresso `#1A0905` · gold type.

## Run it on your computer

```bash
npm install      # once
npm run dev      # open http://localhost:4321
```

## Where to edit things (beginner map)

| I want to change…                     | Edit this                                   |
|---------------------------------------|---------------------------------------------|
| My name, headline, email, links, CV   | `src/data/site.ts`                          |
| Skills                                | `src/data/skills.ts`                        |
| A project (one file = one page)       | `src/content/projects/*.md`                 |
| A course (Cisco / Coursera / other)   | `src/content/courses/*.md` (`platform:`)    |
| A certificate (one file = one page)   | `src/content/certificates/*.md`             |
| Colours & fonts                       | top of `src/styles/global.css`              |
| Images, CV, screenshots               | `public/` (e.g. `public/images/…`, `public/cv.pdf`) |

All entries marked `sample: true` are **placeholders** — replace or delete them.

**Add a project screenshot:** put `public/images/my-app.png` in the folder, then in the project file add
`desktopImage: /images/my-app.png` (and `mobileImage:` for the phone).

**Add a real certificate image:** `image: /images/certs/ccna.jpg` in the certificate file.

## Pages

```
/                      Home — hero + chessboard, folder archive, featured work, certificates
/projects/             All projects (filterable)      → /projects/<file-name>/
/courses/              Folder per platform            → /courses/cisco/ · /courses/coursera/ · /courses/other/
/certificates/         Gallery (filterable)           → /certificates/<file-name>/
/skills/  /about/  /contact/  + 404 "Illegal move"
```

## Animations (src/scripts/)

- `chess.ts` – board tilts with the mouse; hover the queen to see her moves, click a gold dot to move her
- `folders.ts` – folder stack pulls out on hover
- `pointer.ts` – custom cursor, magnetic buttons, 3D device tilt
- `scroll.ts` – scroll reveals, split-line headings, counters, marquee, rotating seal
- `transitions.ts` – chessboard page transition
- Everything respects the visitor's "reduce motion" setting.

## Publish on GitHub Pages

1. Push this folder to a GitHub repository (name it `<your-username>.github.io` for the shortest link).
2. On GitHub: **Settings → Pages → Source → GitHub Actions**.
3. Every push to `main` rebuilds and publishes the site automatically.
