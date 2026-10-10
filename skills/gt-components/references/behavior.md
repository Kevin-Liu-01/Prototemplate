# Behavior

Detail for the Behavior section of `gt-components`. The rest of the skill
says which component to use; these rules say how GT product UI behaves once
it is built. Kevin set them across the dashboard, onboarding, the landing and
GT's tools between 2026-07-30 and 2026-10-03. Dashboard data, form and table
conventions stay in gt-cloud's `.agents/skills/gt-dashboard`.

## 1. Product honesty and recovery

- Never show an offer or a capability before the backend delivers it. The
  onboarding credit stayed out of the UI until billing granted it
  (2026-09-29: "we only show it if we actually do it").
- A flow never strands the user. An expired or failed resource says so and
  offers a restart or a recovery path.
- Hide a feature that may come back. Deleting it loses the work.
- A default configuration loads itself, so trying the product takes one
  click.
- Action buttons debounce and show a loading state.

## 2. Hover and click are one interaction

- Hover reveals, click pins, leaving hides and Escape closes. A tooltip plus
  a separate card is two interactions for one thing (2026-10-01).
- A hover-only affordance appears only on hover and never clips content.
- An element does not maximize until it is clicked.
- A highlight turns blue. It does not expand or scale, so nothing shifts
  (2026-08-14).

## 3. Minimal chrome

- Consoles and control panels are compact and draggable, with no prose, no
  background slab and no "OFF" labels, and they never cover the content.
- Remove navigation that adds nothing.
- Chrome built for one surface stays on it. A presenter rail that leaked
  onto other pages was removed (2026-07-30).

## 4. Dropdowns and selectors

- Build custom dropdowns. A native select is out.
- Options and the trigger carry real icons or flags.
- Flags render only through `LocaleFlag` (or `LocaleTag` in Prototemplate).
  Emoji flags and emoji-presentation arrows are out (2026-08-14: "NO
  EMOJIS!!! USE OUR FLAGF BLIB RARY!!!").
- A locale selector shows flags and short codes, with full names in the
  dropdown (2026-09-03).
- A new control matches the nearest existing one: the language selector,
  the card radius, equal-width paired buttons.

## 5. Copy to clipboard

- The label never changes to "Copied". The icon shows the state: the check
  turns blue.
- The copy and check icons share one box, so nothing moves.
- The click copies without selecting text. Selection is the fallback when
  the clipboard write fails.
- The copied state holds about 1.6 s and is announced to screen readers.
- On a page with a strict Content Security Policy, the one copy script is
  allowed by its sha256 hash (2026-10-02, 2026-10-03).
- In Prototemplate the one copy control is `InstallField`
  (`src/components/viewer/InstallField.tsx`).

## 6. Forms

- Inputs are at least 16px below `md`, so iOS does not zoom on focus (the
  sign-in email field, 2026-08-17).
- Fields are boxed and high-contrast, and submit uses the shared `Button`.
- Every contact form matches the enterprise form.
- A third-party embedded form (Stripe Elements) takes the house field look
  through its appearance API (2026-10-01).
- A third-party widget's theme follows the site's theme toggle, never the
  OS. Cloudflare Turnstile's `theme: 'auto'` reads `prefers-color-scheme`, so
  it drew a white card on a dark page whenever the two disagreed (the sign-in
  form, 2026-08-14). Pass `resolvedTheme` from next-themes as the widget's
  theme, default to light before mount, and key the widget on the theme so it
  remounts when the theme lands or flips (`sign-in-form.tsx` on gt-cloud
  main). This is the one place the resolved theme is read, because the widget
  takes no CSS.

## 7. Lists and tables

- Rows have fixed heights. Visible rows are capped, and the list switches to
  a grid past the cap.
- Images inside a list use `object-fit: contain`.
- Cards never grow when a description expands (2026-08-13: "make the cards
  stop expanding and layout shifting").
- Dashboard tables follow gt-cloud's `gt-dashboard` `references/conventions.md`
  (cursor pagination, variable page size). On top of them: size the page to
  the rows that fit the viewport, morph charts between ranges instead of
  redrawing them, let panels fill their box, and put a section header's
  actions at the far right.

## 8. No layout shift

- Reserve the largest state: measure every locale's string after the fonts
  load.
- Fix line counts, and reserve slots for artifacts and forms.
- Render footer controls on the server.
- Animate any real change of size.
- Heavy visuals fade in. They never pop in after the page (2026-08-16).

## 9. Agent-facing surfaces

- A diagnostic tool makes every finding actionable: the exact code that
  triggered it, the exact report, and a copyable agent prompt (the `/try`
  report card, 2026-08-27).
- Agent output stays compact and stable. Color and clickable links belong
  to a separate human view.
- An automation recommends the next concrete action. An empty builder is
  the wrong start.

## 10. Faithful recreations

- A recreated product UI behaves like the real one: fixed-size terminals
  that auto-scroll, indented and colored JSON, interactive traces.
- A UI-only port uses static data and one consistent fake auth state, never
  signed-in and signed-out controls at once.

## 11. Embedded live previews

An iframe stage does not capture wheel input until it is fully in view and
docked. Hover and pointer events inside it keep working.

## 12. Accessibility basics

- Icon-only controls carry accessible names that match their action.
- Labels are selectable.
- State changes (copied, loading, expanded) are announced (2026-09-02).

## Sources

- Kevin's messages from 2026-07-30 to 2026-10-03: the presenter rail
  (2026-07-30), the cards (2026-08-13), emoji flags and highlights
  (2026-08-14), heavy visuals (2026-08-16), the iOS zoom on sign-in
  (2026-08-17), the report card (2026-08-27), the accessibility briefs for
  the docs drawer button and the selectable labels (2026-09-02), the locale
  selector (2026-09-03), the onboarding credit (2026-09-29), hover and
  click, and Stripe Elements (2026-10-01), the copy control (2026-10-02,
  2026-10-03). The native-select and pagination rules come from personal
  projects and are used here for their method.
- gt-cloud: `.agents/skills/gt-dashboard/references/conventions.md`;
  `packages/ui/src/components/ui/LocaleFlag.tsx`, `button.tsx`.
- Prototemplate: `src/components/viewer/InstallField.tsx`.
