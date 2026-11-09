# The series end card

Every film of the series ends on this card after its narrative. It is one design. The layout, the sizes, the timing and the motion are fixed in `endcard.js`, and a film passes only three things: its palette, the post's title in two lines and the post's link.

The card shows the General Translation logo (the globe, `kit/brand/gt-logo-motion.js`) playing its loop, "Meridian, then G", the title in two lines and the link as plain text, on the palette's ground. It shows no other text and draws no frame: there are no rails, rules or registration crosses on the card. It runs 5.2 s from a hard cut on the beat to the film's last frame, and that last frame, the logo at rest, is the poster.

Until 2026-11-09 the mark was the doubled-line GT monogram filled with the film's gem smoke, and the card ran 4.0 s. A mark that draws its lines cannot be a still glass shape, so the smoke left the card, and the card grew by the loop's length. The stills in `stills/` are of that earlier card.

## API

```html
<link rel="stylesheet" href="kit/tokens.css" />   <!-- Katagami Text through var(--font); the card never names a family -->
<script src="kit/gsap.min.js"></script>
<script type="module">
  import { addEndCard } from './kit/endcard/endcard.js';   // also loads kit/brand/gt-logo-motion.js

  const tl = gsap.timeline({ paused: true });
  // ... the film's own scenes, ending at 52.0 ...
  const card = addEndCard(tl, {
    palette: 'fire',                                          // 'fire' | 'blue'
    title: ['Fuma Nama: The philosophy', 'of an open-sourcerer'],
    url: 'generaltranslation.com/blog/fuma-nama',
    start: 52,                                                // on the 0.5 s beat
  });
  window.__timelines = window.__timelines || {};
  window.__timelines['main'] = tl;                            // register after the card is added
</script>
```

`addEndCard(tl, opts)` adds the card's elements to the composition and its tweens to `tl`, then returns `{ el, start, end, duration, ready }`. `end` is `start + 5.2`. `ready` resolves when the type is seated on the loaded face, but a composition does not need to wait for it.

| option | value |
| --- | --- |
| `palette` | `'fire'` (`#000000` ground) or `'blue'` (`#2f5ce0` ground); the type and the logo are white on both |
| `title` | `[line1, line2]`, the post's title broken where the film's SCRIPT.md breaks it, each line at most 1600 px at 120 px |
| `url` | `generaltranslation.com/blog/<slug>`. A leading `https://` and a trailing slash are stripped. |
| `start` | film seconds of the cut. It must be on the 0.5 s grid (the card warns otherwise). |
| `host` | optional element to append the card to (default: the first `[data-composition-id]`) |
| `zIndex` | optional, default 100. The card is opaque, so it must sit above everything the film draws. |
| `frame` | optional, default `false`. `true` draws the series frame on the card: 1 px rails at x 67 and 1853, rules at y 67 and 1013, and a 13 px registration cross on each meeting (measurements below). Nothing else changes. With `frame: true`, the demos' settled frames are pixel-identical to the card's snapshots from before the frame was removed. |

The module also exports `DURATION` (5.2), `PALETTES`, `LAYOUT` and `TIMING`, which hold the numbers below. It sets `window.GTEndCard` and fires `gtendcard-ready`, so a film whose timeline lives in a classic script can wait for the module and register its timeline afterwards:

```html
<script type="module" src="kit/endcard/endcard.js"></script>
<script>
  function build() {
    // ... the film's timeline ...
    GTEndCard.addEndCard(tl, { palette: 'blue', title: ['Designing docs', 'for humans'],
      url: 'generaltranslation.com/blog/designing-docs-for-humans', start: 47.5 });
    window.__timelines['main'] = tl;
  }
  if (window.GTEndCard) build(); else window.addEventListener('gtendcard-ready', build, { once: true });
</script>
```

What the film does around the card:

- Set the root `data-duration` to `start + DURATION` (5.2). The card is the film's last 5.2 s, so nothing follows it.
- Leave the card silent. No narration plays over it. The music bed resolves under it, and its fade belongs to the film's mix.
- Load `kit/gemsmoke.js` yourself if the film uses gem smoke; the card no longer imports it.
- End the film's own clips at `start`. They are hidden under the opaque card anyway, and ending them saves capture time.
- Expect `npx hyperframes check` to report two `text_occluded` infos at `start + 0.33 s`. Those are title line 2 and the link still inside their masks. They are left unsuppressed because suppressing them on the text also switches off the contrast audit, which passes 9 of 9.

## Timing

Times are card seconds, so film time is `start + t`.

| t (s) | what happens | ease |
| --- | --- | --- |
| 0.00 | Hard cut on the film's beat: the ground and the logo at rest (plus the rails and crosses with `frame: true`). No type is visible. | |
| 0.12 to 1.00 | Title line 1 rises out of its mask (`yPercent` 100 to 0). | `expo.out` |
| 0.20 to 1.00 | Title line 2 rises the same way (80 ms stagger). | `expo.out` |
| 0.40 to 1.00 | The link rises the same way. | `expo.out` |
| 0.50 to 4.90 | The logo's loop (`TIMING.loop.at`): the meridian draws back (0.6 s), a line runs once round the meridian, the G draws off and back on round the equator (3.2 s), and the meridian draws out to the logo (0.6 s). The eases are the site's GtLogoMotion. | as the site |
| 4.90 to 5.20 | The logo at rest (`TIMING.loop.rest`). | |
| 5.20 | The film's last frame, which is the poster. | |

The entrance is a hard cut, which is MOTION.md's transition (b). It needs nothing from the frame before it, so every film can cut to the card from whatever its last beat is.

## Layout (1920 x 1080)

```
                                                       160 ┌──────────┐
                                                           │   logo   │   1554.2 to 1760 x 160 to 365.8
                                                           └──────────┘
 589   Fuma Nama: The philosophy                            cap top
 676   ───────────────────────────────────────────────────── baseline 1
 798   of an open-sourcerer ─────────────────────────────── baseline 2
 920   generaltranslation.com/blog/fuma-nama ─────────────── link base
       160                                                       1760
```

| element | measurement |
| --- | --- |
| Series frame (`frame: true` only) | Off by default. With `frame: true`: 1 px rails at x 67 and 1853, rules at y 67 and 1013, and a 13 px registration cross centred on each meeting. Fire: `rgba(242, 242, 240, 0.11)` with crosses at 0.32, the films' old rails. Blue: `rgba(134, 168, 255, 0.26)` with crosses in `#86a8ff`, the same contrast on the blue ground (about 1.25 to 1). No margin mark and no counter. |
| Ground | Fire `#000000`, blue `#2f5ce0`. |
| Logo | The General Translation logo, 205.8 px square (its viewBox is tight to its ink), box x 1554.2 to 1760, y 160 to 365.8: its top on the upper title-safe line and its right edge on the right title-safe line. It is as tall as the title's ink, from line 1's cap top to line 2's baseline (Katagami Text caps, 1430 of 2048 units, at 120 px plus the 122 px pitch). |
| Title | Katagami Text 500 through `var(--font)`, 120 px, tracking -0.035 em, `#ffffff`, two lines on baselines y 676 and 798 (a 122 px pitch). Cap tops are at y 588.7 and 710.7. Each line's first ink is seated on x 160 from the loaded face's measured side bearing. A round first glyph (a c d e o q s C G O Q S) overshoots 1.5 px to the left. The widest line may run 1600 px, to x 1760. A longer line drops the title size until it fits, never below 100 px, and the card warns in the console. |
| Link | Katagami Text 400, 40 px, tracking -0.005 em, `#ffffff`, baseline y 920, which is the lower title-safe line and the third line of the title's 122 px baseline grid. The x-height top is at y 898 and the ink starts at x 160. There is no `https://` and no underline. It is 26.7 px tall at 1280 x 720. |
| Masks | Each line is a box from 1.0 em above its baseline to 0.2725 em below it, so descenders are not cut. The line rises out of the box by one box height. |

The type stands on the lower title-safe line along the films' heading axis (x 160), and the logo hangs from the upper title-safe line at the right. Every margin is the 160 px title safe, and one baseline grid carries the three lines of type.

## Determinism

The card reads no clock. The logo is set from a proxy tween's `onUpdate`, a pure function of card time, and the type and the cut are tweens on the composition's timeline.

## Demos

- `motion/films/_endcard-fire/` and `motion/films/_endcard-blue/`: each shows 2 s of the material's plain ground (its gem smoke with no shape, no type and no frame), then the card from the 2.0 s beat to 7.2 s.
- Draft renders: `motion/films/_endcard-fire/renders/draft.mp4` and `motion/films/_endcard-blue/renders/draft.mp4`, from `node kit/film.mjs draft _endcard-fire` and `_endcard-blue` (`--quality draft --fps 30`, on the GPU path the films' `film.json` names). The drafts of 2026-10-04 (`--workers 3`) were rendered to `motion/out/_draft-endcard-fire.mp4` and `_draft-endcard-blue.mp4`; neither fetched Google Fonts.
