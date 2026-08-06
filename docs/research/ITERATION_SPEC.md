# ITERATION SPEC — founder review round (SUPERSEDES conflicting parts of PORT_SPEC.md)

Versions are referred to by their **switcher position** (the number in the dock), not the original
exploration number:

| # | slug | note |
|---|------|------|
| 1 | concrete-mono | best layout direction |
| 2 | bento-foundry | |
| 3 | kinetic-verba | |
| 4 | white-gallery | |
| 5 | blueprint-atlas | best story section, best bentos, best diagrams |
| 6 | field-magnet | best wheel |
| 7 | flipboard-terminus | |
| 8 | typographic-broadcast | |
| 9 | archive-press | NEW — fork of 1 in the old-UI style |

---

## G. GLOBAL RULES — apply to every version, no exceptions

The founder's blunt note: *"no more weird gradients, green dots, overwhelming text (unnecessary
icons, badges, eyebrows, and so on). The main paradigm should be a header and subheader, or
header and content."*

**DELETE on sight:**
- Decorative **eyebrows / kickers** above headings — `◇ TRANSLATION EDITOR // THE HIGH STAKES`,
  `[05] EDGE`, `IN // ENGLISH SOURCE`, `◇ PRICING // START FREE. UPGRADE ANYTIME.` and every
  variant. A section starts with its **heading**.
- **Fake instrument chrome**: `DWG NO. GT-005`, `SCALE 1:1`, `SHEET 5/7`, `ACT II-III`,
  `BEAT 9/9`, corner registration marks, plotter labels, sheet borders. This is set dressing that
  adds noise and no meaning.
- **Green dots, green pills, colored status chips** — `● LIVE`, green `v2` badges, green
  diff dots. If a state must be shown, use white/grey type or a hairline, never a color pop.
- **Weird gradients**: muddy multi-hue CSS gradients, rainbow text fills, gradient borders,
  colored glows. The ONLY sanctioned color is the prismatic field itself (which is real
  dispersed light) and pure white specular highlights.
- **Unnecessary icons and badges**: decorative glyphs beside labels, count chips, tag pills,
  numbered `[01]`-style index marks used as ornament.

**The paradigm for every section is exactly one of:**
1. **Header + subheader** (a heading and one supporting line), or
2. **Header + content** (a heading and the actual thing — diagram, grid, code, workspace).

Nothing above the header. No third stacked text element. If a label seems necessary to explain
the section, the heading is not doing its job — rewrite the heading.

**Keep:** Switzer + Inter only, black/white/metallic, the prismatic light field, the machined
Resend-sleek base, huge display-to-body scale contrast, generous whitespace.

---

## S. STANDARDIZE — promote the winners into shared components

Version 5 (`blueprint-atlas`) and version 6 (`field-magnet`) contain the best work in the set.
Extract these into `src/components/shared/` so every version uses one implementation and future
iteration compounds. Each must be **skinnable** (props + CSS custom properties) so a direction
keeps its identity while sharing structure and motion.

1. **`StorySection`** — from version 5. The pinned, full-bleed scroll story (storyboard beats
   1-9). Version 5's beat pacing, camera work, and legibility are the baseline.
2. **`FeatureBento`** — from version 5. The 8-feature grid whose cells carry **line-art technical
   diagrams** (the `<T>` wrap diagram, glossary boxes, 文A translation flow, `/es /ja /de`
   routing tree, globe + OTA, preview panes, `"hola"→"hello"` runtime, `gt.config` sliders).
   These illustrations are the single best asset in the whole set — treat them as a component
   library (`src/components/shared/diagrams/`) with props for stroke weight and scale.
3. **`EditorWorkspace`** — from version 5. Side-by-side source/translation with real diff states
   and inline edit affordances. Strip the green `v2` badge and `● LIVE` pill per the global rules
   (show revision state with type weight, strikethrough, and hairlines instead).
4. **`LanguageWheel`** — from version 6. The machined chrome dial around the GT logo: heavy
   metallic bezel with true specular edges, a bright progress arc, orbiting script glyphs, the
   real logo at center. This is THE wheel; every version that uses one uses this.

Skinning contract: accept `className`, a `variant` prop where genuinely needed, and read colors
and stroke weights from CSS custom properties defined by the direction's own stylesheet.

---

## Per-version work

### Version 1 — `concrete-mono` (flagship)
Its **layout is the best in the set** — keep the editorial structure: left-aligned display
headline, the stat block grid, the flag strip, the trusted-by row, the mono nav.

- **Remove the wheel entirely.** Version 1 does not get a wheel.
- **Fill the top area with the hero animation**, centered in the hero container, at full width:
  the prismatic light field centered behind the real GT logo, with **dense columns of real UI
  components** flanking it — English components on the left, the **same components translated**
  on the right (Japanese, Spanish, Korean, German, French, Arabic, Italian, Portuguese, Chinese,
  Dutch, Polish, Turkish, Hindi, Thai, Vietnamese, Swedish, Danish, Indonesian).
- The components must be **densely packed, clearly legible, and recognizable**: search inputs,
  cards, checkboxes, buttons, toasts, progress bars, selects, switches, tabs, textareas, badges,
  API action rows. Each labelled with its locale on the translated side.
- Components **morph into other languages** in place — the label text changes and the container
  visibly resizes to fit (FLIP-measured, 350-600ms), so the wall is continuously alive.
- Centered headline over the field, `100+ languages` beneath it, then the trusted-by row.
- No wheel, no eyebrows, no badges.

### Version 6 — `field-magnet` (the wheel + popup sliders)
- Keeps the **canonical `LanguageWheel`** (it is the source of that component).
- **This is the version where the code-reveal sliders are POPUPS**, not a dedicated slide: when
  the story zooms a component, the `<T>` code surface opens as an **overlay panel anchored to
  that component** — floating card, metallic edge, drop shadow, the component still visible
  behind it — then dismisses. Everywhere else standardizes on version 5's approach.

### Version 9 — "Wide Field" (NEW, route slug `archive-press`)
**CORRECTED BRIEF** — the founder supplied the reference image. This is a fork of version 1 that
preserves an EARLIER, sparser state of it that they preferred (their words: "the old ui" — the
older look of our own version 1, **not** the old generaltranslation.com site). Version 1 is being
densified this round; version 9 preserves and perfects the cinematic, atmospheric alternative.

From the reference image, the defining qualities:
- **Cinematic and wide.** The prismatic burst spans the FULL page width as a horizontal band
  through the vertical middle, with enormous quiet black space above and below. The composition
  breathes; it is closer to a film still than a web page.
- **A small, thin GT gate — NOT a wheel.** A minimal hairline circle (roughly 60-70px) holding
  the real GT mark, sitting high and centered on the burst's axis. No chrome bezel, no heavy
  machined dial, no progress arc. Restraint is the entire point.
- **Sparse, scattered components** across the full width at varied depth: small monospace-labelled
  cards, widely spaced, many quite faint, drifting at different scales. English on the left
  (`Home / Docs / Pricing`, `Welcome back!`, an `Email address` field, a `Sign in` button, a
  `Payment received` toast, Theo's testimonial card) and their translations mirrored on the right
  (`ホーム / ドキュメント / 料金`, `¡Bienvenido de nuevo!`, `始める`, `PRO — ¥2,900/月`, Theo's card
  in Japanese). Sparse and atmospheric — the opposite of version 1's dense wall.
- **Headline anchored LOWER-LEFT**, not centered: `LAUNCH IN EVERY` / `LANGUAGE` in heavy
  condensed uppercase, the second line carrying a metallic/chrome gradient fill while the first
  stays flat white. A `$ npx gt@latest` mono chip sits directly above it.
- Subhead beneath: "General Translation helps developers localize apps into _Portuguese_ — no
  painful refactors and no managing large JSON files," with the rotating language underlined.
- Two **squared** buttons side by side: `GET STARTED` (solid white) and `DOCS` (outline).
- **Thin crosshair guides**: a faint vertical center rule and a horizontal rule crossing at the
  gate, framing the composition like a viewfinder.
- Compact bottom band: the flag strip, then `TRUSTED BY THE WORLD'S BEST COMPANIES //` with the
  real customer names, both in small mono caps.
- Mono uppercase nav across the top.

Everything below the hero uses the shared `StorySection`, `FeatureBento`, `EditorWorkspace`,
skinned to this same restrained, high-contrast, monospace-inflected language. **No wheel.**
Section G's global cleanup still applies.

Route: `src/app/d/archive-press/` (slug kept for stability; display name is "Wide Field").

---

## Verification (unchanged)

Dev server runs on **:3005** — never start or stop it.

```
node /private/tmp/claude-501/-Users-kevinliu-gt-gt-cloud/0472faa4-f4b6-46f0-9054-5f30d7a23b3e/scratchpad/shoot-route.mjs <slug> /private/tmp/claude-501/-Users-kevinliu-gt-gt-cloud/0472faa4-f4b6-46f0-9054-5f30d7a23b3e/scratchpad/shots/next/<slug>/self
```

`errorCount` must be 0 and no `NEXT ERROR OVERLAY`. Read d00, d03, d06, d09, d12, m00 minimum.
