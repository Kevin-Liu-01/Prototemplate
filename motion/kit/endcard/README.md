# The series end card

Every film of the series ends on this card after its narrative. It is one design. The layout, the sizes, the timing and the motion are fixed in `endcard.js`, and a film passes only three things: its palette, the post's title in two lines and the post's link.

The card shows the doubled-line GT mark (`kit/gem-shapes/gt-mark.png`) filled with the film's gem smoke, the title in two lines and the link as plain text. It shows no other text and draws no frame: there are no rails, rules or registration crosses on the card. It runs 4.0 s from a hard cut on the beat to the film's last frame, and that last frame is the poster.

| fire | blue |
| --- | --- |
| ![fire](stills/fire.png) | ![blue](stills/blue.png) |

The stills are the settled cards from the two demos at film time 5.95 s, which is card time 3.95 s, taken with `npx -y hyperframes@0.8.106 snapshot . --at 5.95 --no-end --describe false --no-browser-gpu`. They were re-rendered when the frame came off. Against a snapshot of the framed card through the same command, the only changed pixels are the 5996 on the four 1 px frame lines. The type, mark, link and smoke pixels are identical.

## API

```html
<link rel="stylesheet" href="kit/tokens.css" />   <!-- Inter through var(--font); the card never names a family -->
<script src="kit/gsap.min.js"></script>
<script type="module">
  import { addEndCard } from './kit/endcard/endcard.js';   // also loads kit/gemsmoke.js

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

`addEndCard(tl, opts)` adds the card's elements to the composition and its tweens to `tl`, then returns `{ el, start, end, duration, ready }`. `end` is `start + 4`. `ready` resolves when the smoke is mounted and the type is seated on the loaded face, but a composition does not need to wait for it.

| option | value |
| --- | --- |
| `palette` | `'fire'` (black ground, `#fe5b16` / `#f7ff61` / white smoke) or `'blue'` (`#2f5ce0` ground, white / `#86a8ff` smoke) |
| `title` | `[line1, line2]`, the post's title broken where the film's SCRIPT.md breaks it, each line at most 1600 px at 120 px |
| `url` | `generaltranslation.com/blog/<slug>`. A leading `https://` and a trailing slash are stripped. |
| `start` | film seconds of the cut. It must be on the 0.5 s grid (the card warns otherwise). |
| `host` | optional element to append the card to (default: the first `[data-composition-id]`) |
| `zIndex` | optional, default 100. The card is opaque, so it must sit above everything the film draws. |
| `frame` | optional, default `false`. `true` draws the series frame on the card: 1 px rails at x 67 and 1853, rules at y 67 and 1013, and a 13 px registration cross on each meeting (measurements below). Nothing else changes. With `frame: true`, the demos' settled frames are pixel-identical to the card's snapshots from before the frame was removed. |

The module also exports `DURATION` (4), `PALETTES`, `LAYOUT` and `TIMING`, which hold the numbers below. It sets `window.GTEndCard` and fires `gtendcard-ready`, so a film whose timeline lives in a classic script can wait for the module and register its timeline afterwards:

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

- Set the root `data-duration` to `start + 4`. The card is the film's last 4.0 s, so nothing follows it.
- Leave the card silent. No narration plays over it. The music bed resolves under it, and its fade belongs to the film's mix.
- Keep at most one other full-frame gem mount live during the card. The card owns one full-frame `GTGem` mount, which draws only inside its window.
- End the film's own clips at `start`. They are hidden under the opaque card anyway, and ending them saves capture time.
- Expect `npx hyperframes check` to report two `text_occluded` infos at `start + 0.33 s`. Those are title line 2 and the link still inside their masks. They are left unsuppressed because suppressing them on the text also switches off the contrast audit, which passes 9 of 9.

## Timing

Times are card seconds, so film time is `start + t`.

| t (s) | what happens | ease |
| --- | --- | --- |
| 0.00 | Hard cut on the film's beat: the ground and the mark at 40 percent smoke density (plus the rails and crosses with `frame: true`). The outer smoke is 0 and no type is visible. | |
| 0.00 to 1.00 | Bloom. The mark's smoke density rises from 0.4 to 1.0 and the outer smoke rises from 0 to 0.5 (`u_innerGlow`, `u_outerGlow`). | `power3.out` |
| 0.12 to 1.00 | Title line 1 rises out of its mask (`yPercent` 100 to 0). | `expo.out` |
| 0.20 to 1.00 | Title line 2 rises the same way (80 ms stagger). | `expo.out` |
| 0.40 to 1.00 | The link rises the same way. | `expo.out` |
| 1.00 | Every arrival lands on this beat. | |
| 1.00 to 4.00 | Hold, 3.0 s fully settled. Nothing moves except the smoke, which slows to rest. | |
| 0.00 to 4.00 | Smoke clock: shader seconds 3.5 to 4.5. The rate falls from 0.5 to 0 shader seconds per second, so the material comes to rest on the last frame. | `power2.out` |
| 4.00 | The film's last frame, which is the poster. | |

Measured on lossless snapshots (luma 0 to 255) from card 1.0 s to 3.95 s: the link band does not change at all, and no pixel in the title band changes by more than 4 levels. That change is the faint edge of the smoke drifting, not the type. On the draft render (30 fps), the whole frame's mean frame difference falls from 0.36 at 1.0 s to 0.002 at 3.97 s, and the last frames are effectively still.

The entrance is a hard cut, which is MOTION.md's transition (b). It needs nothing from the frame before it, so every film can cut to the card from whatever its last beat is.

## Layout (1920 x 1080)

```
                                                       160 ┌──────────┐
                                                           │  GT mark │   1427.8 to 1760 x 160 to 369.3
                                                           └──────────┘
                                                       (smoke plume, upper right)
 589   Fuma Nama: The philosophy                            cap top
 676   ───────────────────────────────────────────────────── baseline 1
 798   of an open-sourcerer ─────────────────────────────── baseline 2
 920   generaltranslation.com/blog/fuma-nama ─────────────── link base
       160                                                       1760
```

| element | measurement |
| --- | --- |
| Series frame (`frame: true` only) | Off by default. With `frame: true`: 1 px rails at x 67 and 1853, rules at y 67 and 1013, and a 13 px registration cross centred on each meeting. Fire: `rgba(242, 242, 240, 0.11)` with crosses at 0.32, the films' old rails. Blue: `rgba(134, 168, 255, 0.26)` with crosses in `#86a8ff`, the same contrast on the blue ground (about 1.25 to 1). No margin mark and no counter. |
| Ground | The smoke's own `colorBack`: fire `#000000`, blue `#2f5ce0`. |
| Mark | The doubled-line GT mark as a gem smoke glass shape, 332.2 x 209.3 px, box x 1427.8 to 1760, y 160 to 369.3. The top bar sits on the upper title-safe line (y 160) and the T's flat bar end on the right title-safe line (x 1760). It is as tall as the title's ink, from line 1's cap top to line 2's baseline. Shader values: `scale` 0.4576, `offsetX` 0.5869, `offsetY` -0.2550 on a 1920 x 1080 mount at pixel ratio 1. The rendered box measured 1427 to 1759 by 160 to 369. |
| Smoke | One geometry for both palettes: `innerDistortion` 0.8, `outerDistortion` 0.8, `angle` -60, `size` 0.7, `outerGlow` 0.5, `innerGlow` 1, `offset` 0. The plume wraps the mark in the upper right. Over the hold, the 99.8th percentile of smoke luma in the type zone (x 140 to 1780, y 565 to 850, plus the link band) is 8 or less, so a title line can run to the right safe edge without touching smoke. |
| Title | Inter 500 through `var(--font)`, 120 px, tracking -0.035 em, `#ffffff`, two lines on baselines y 676 and 798 (a 122 px pitch). Cap tops are at y 588.7 and 710.7. Each line's first ink is seated on x 160 from the loaded face's measured side bearing. A round first glyph (a c d e o q s C G O Q S) overshoots 1.5 px to the left. The widest line may run 1600 px, to x 1760. A longer line drops the title size until it fits, never below 100 px, and the card warns in the console. |
| Link | Inter 400, 40 px, tracking -0.005 em, `#ffffff`, baseline y 920, which is the lower title-safe line and the third line of the title's 122 px baseline grid. The x-height top is at y 898 and the ink starts at x 160. There is no `https://` and no underline. It is 26.7 px tall at 1280 x 720. |
| Masks | Each line is a box from 1.0 em above its baseline to 0.2725 em below it, so descenders are not cut. The line rises out of the box by one box height. |
| Measured in `stills/` | line 1 cap top 588 and foot 675, line 2 'o' 159 (overshoot), link 'g' x-height 898 to 926, every first ink at x 160 |

The type stands on the lower title-safe line along the films' heading axis (x 160), and the mark hangs from the upper title-safe line at the right. Every margin is the 160 px title safe, and one baseline grid carries the three lines of type.

## Determinism

The card reads no clock. The smoke is drawn from a proxy tween's `onUpdate`, as in the `kit/gemsmoke.js` pattern: its glow uniforms and its shader time are pure functions of card time. The type and the cut are tweens on the composition's timeline. The shape PNG is also placed in the DOM as a hidden `<img>`, so the renderer waits for it. Seeking the demos in the order 5.0, 2.3, 3.0, 5.0, 2.3, 0.5, 5.0, and again after a fresh load, gave identical frame hashes for each time in both palettes.

## Demos

- `motion/films/_endcard-fire/` and `motion/films/_endcard-blue/`: each shows 2 s of the material's plain ground (its gem smoke with no shape, no type and no frame), then the card from the 2.0 s beat to 6.0 s. `npx -y hyperframes@0.8.106 check .` passes with 0 errors and 0 warnings.
- Draft renders: `motion/out/_draft-endcard-fire.mp4`, `motion/out/_draft-endcard-blue.mp4` (`--quality draft --fps 30 --workers 3`). Neither render fetched Google Fonts.
