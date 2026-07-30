# Prototemplate

Design explorations for the General Translation website redesign, plus a
full-screen scroll presenter that walks through the case for the redesign and
every living prototype.

## Routes

- `/` — index of every design direction.
- `/present` — the presenter: why, first principles, how it was built, a type
  detail interlude, then the live prototype viewer with per-direction notes
  and ratings (saved to localStorage), ending in a gallery verdict.
- `/d/<slug>` — each direction as a standalone page. `?chrome=0` hides the
  floating direction switcher.

## Run

```bash
pnpm install
pnpm dev    # http://localhost:3005
```

`pnpm build && pnpm start` for production. Deploys as a stock Next.js app.

Built with Next.js 16, GSAP 3.13 (ScrollTrigger, MorphSVG, DrawSVG,
ScrambleText), Lenis smooth scrolling, and Tailwind 4.
