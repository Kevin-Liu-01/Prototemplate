# Process details

The parts of the review loop that `SKILL.md` section 5 points to: local review, reading Kevin's asks, showing the work, and how the wiki's general design skills apply.

## Local review

- Prototemplate runs on `http://localhost:3005` (`pnpm dev`, launch config `prototemplate-dev`). Reuse the running server: Next 16 refuses a second `next dev` for the same checkout.
- gt-cloud apps run on their own dev servers (gt-cloud `.agents/skills/gt-landing` and `gt-dashboard`).
- Shoot both themes at 1440 and 390. Plate pages are also shot at 1527 by 814, Kevin's laptop viewport. When he sends a screenshot, reproduce its state and size and fix the defect at that size.
- Shoot with an external harness (playwright-core with Chrome for Testing). The in-app browser pane reports `document.hidden` and pauses `requestAnimationFrame`, so canvases come out blank there.
- Seed the theme before load: `localStorage['gt-theme']` for Prototemplate and the deck, the `theme` key or the `dark` class on `<html>` for gt-cloud.
- Scroll through a page before a full-page capture, because plates mount on IntersectionObserver.
- Crop every junction at `deviceScaleFactor: 2`. The line auditor reads computed CSS and cannot see SVG strokes.
- `pnpm check:pages --preset quick --pages <id>` reads phones, a tablet, laptops, desktops and the ultrawide for overflow, clipping, tap targets and layout shift, and walks the presenter's slides on each. `pnpm lint:lines:shell` audits the chrome's lines. `node shoot-slide.mjs 8 15`, run in `deck/`, renders slides in both themes and reports overflow.

## Reading Kevin's asks

- "Equivalent" or "equal" means both measures take the larger value (2026-09-30).
- "Keep its aesthetic" means the geometry and the material stay and only the named thing changes.
- "Smaller" or "larger" means the next rung of the existing ladder. The 13px card facts went to the 12px rung (2026-09-28).
- "Make it look better" with a reference attached means measure the reference and match it. Without one, the reference is the deck for a product surface and the shipped site for a landing or marketing page.
- "Fix this" on one instance means the whole class: find every member, fix it and report the count (`docs/handbook/operating-principles.md` rule 5).
- "Redesign" means visibly new. A change that keeps the old shape comes back as not done (`gt-explorations` section 2).
- "Remove this" takes the smallest reading, then re-checks the neighbors.
- "Add it to the left of X" applies to X alone, and the rest of X's column stays as it is (2026-08-13: "incorrect. i only want you to add it to left of ...").
- "Standardize" means one structure on every page of the kind, with only content differing, and a lint or the page check that catches a page that drifts (the book page, 2026-10-06).
- Kevin asks for a lint once a rule matters to him ("document and create a lint for this", 2026-09-08; "fix and lint for this", 2026-09-28). A new rule ships with its lint or names the lint that should hold it (`gt-lints`).

## Showing the work

- Show crops of the changed region, 420 to 900 CSS px wide, before and after, in both themes. Full-page captures in a two-column table read as strips (2026-09-28). `gt-ship` has the PR format.
- Say in plain sentences what changed and what to look at.

## The general skills

The wiki's general design skills stay useful, and where they disagree with a verdict in this skill, the verdict wins.

- `design-engineering-polish` gives the animation decision framework, easing and duration choices, the Before, After and Why table for reviews, and signature-first exploration for a round of new directions. Its rule to reject disguised duplicates matches the deco verdict. In GT work, product pages have no entrance animation, motion moves transform and opacity only at the shell's 120 to 220ms durations, and reduced motion renders a designed still (`gt-motion`).
- `make-interfaces-feel-better` applies as written for tabular numbers, balanced heads and pretty body text, antialiased smoothing, 44px touch and 40px desktop hit areas, the state matrix, exact transition properties and sparing `will-change`. Five of its rules do not apply to GT work. GT draws no shadows for elevation and never replaces a border between sections with a shadow, because lines carry the structure. Its concentric radii apply to the controls: a part flush inside a 6px control takes 5px (`--pt-radius-inner`). Product pages have no staggered entrances. The shell shows a press as the ink border of `.is-on`, with no scale and no blurred icon swap. A picture's frame is a 1px border in the `edge` role (ink at 62%), which is heavier than the low-opacity outline that skill suggests.
- `taste`, `frontend-design`, `frontend-design-taste` and `web-design-guidelines` are general references. Kevin's GT taste is the deck, the shipped site and the verdicts here.
- `animated-component-libraries` finds sources for components. Anything sourced is restyled to the tokens and passes this review.
